import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Text,
  Image,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import Video from 'react-native-video';
import axios from 'axios';
import {getToken} from '../../utils/tokenStorage';
const API_URL = 'http://13.37.224.245:8000/api';
const {height, width} = Dimensions.get('window');
const TAB_BAR_HEIGHT = 80;
const BOTTOM_INSET = Platform.OS === 'ios' ? 34 : 16;
const STATUS_BAR_HEIGHT = StatusBar.currentHeight || 0;
const AVAILABLE_HEIGHT =
  height - TAB_BAR_HEIGHT - BOTTOM_INSET - STATUS_BAR_HEIGHT;
  const VideoFeedScreen = ({navigation}) => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMorePages, setHasMorePages] = useState(true);
    const [activeVideoIndex, setActiveVideoIndex] = useState(0);
    const [videoToken, setVideoToken] = useState(null);
    const [playingStates, setPlayingStates] = useState({});
    const flatListRef = useRef(null);
const videoRefs = useRef({});
const fetchVideos = async (page = 1) => {
    try {
      setLoading(true);
      const token = await getToken();
    if (!token) throw new Error('Authentication required');
    setVideoToken(token);
    const response = await axios.get(`${API_URL}/videos/all?page=${page}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const newVideos = response.data.data.videos.data;
      const isLastPage = !response.data.data.videos.next_page_url;
      const newPlayingStates = {};
    newVideos.forEach(video => {
      newPlayingStates[video.id] = false;
    });
    if (page === 1) {
        setVideos(newVideos);
        setPlayingStates(newPlayingStates);
      } else {
        setVideos(prev => [...prev, ...newVideos]);
        setPlayingStates(prev => ({...prev, ...newPlayingStates}));
      }
      setHasMorePages(!isLastPage);
    setCurrentPage(page);
    setLoading(false);
} catch (err) {
    console.error('Error fetching videos:', err);
    setError('Failed to load videos. Please try again.');
    setLoading(false);
  }
};
useEffect(() => {
    fetchVideos();
  }, []);
  const handleLoadMore = () => {
    if (!loading && hasMorePages) {
      fetchVideos(currentPage + 1);
    }
  };
  const handleViewableItemsChanged = useRef(({viewableItems}) => {
    if (viewableItems.length > 0) {
      const newActiveIndex = viewableItems[0].index;
      const activeVideoId = viewableItems[0].item.id;
  
      const updatedPlayingStates = {...playingStates};
      Object.keys(updatedPlayingStates).forEach(videoId => {
        updatedPlayingStates[videoId] = false;
      });
      updatedPlayingStates[activeVideoId] = true;
  
      setActiveVideoIndex(newActiveIndex);
      setPlayingStates(updatedPlayingStates);
    }
  }).current;
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 300,
  }).current;
  const formatCount = count => {
    if (!count) return '0';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };
  const toggleVideoPlayback = videoId => {
    setPlayingStates(prev => ({
      ...prev,
      [videoId]: !prev[videoId],
    }));
  };
  const goToCreatorProfile = userId => {
    navigation.navigate('UserProfile', {userId: userId});
  };
  const handleVideoError = (error, videoId) => {
    console.error(`Error playing video ${videoId}:`, error);
  };
  const renderItem = ({item, index}) => {
    const isPlaying = playingStates[item.id] || false;
    const videoUrl = `${API_URL}/videos/${item.id}/play`;
    return (
        <View style={styles.itemContainer}>
          <View style={styles.videoContainer}>
            <TouchableOpacity
              activeOpacity={1}
              style={styles.videoWrapper}
              onPress={() => toggleVideoPlayback(item.id)}>
              {isPlaying ? (
                <Video
                  ref={ref => {
                    videoRefs.current[item.id] = ref;
                  }}
                  source={{
                    uri: videoUrl,
                    headers: {
                      Authorization: `Bearer ${videoToken}`,
                    },
                  }}
                  style={styles.videoPlayer}
                  resizeMode="contain"
                  repeat={true}
                  playInBackground={false}
                  playWhenInactive={false}
                  paused={!isPlaying}
                  onError={error => handleVideoError(error, item.id)}
                  poster={item.thumbnail_url}
                  posterResizeMode="contain"
                  bufferConfig={{
                    minBufferMs: 15000,
                    maxBufferMs: 50000,
                    bufferForPlaybackMs: 2500,
                    bufferForPlaybackAfterRebufferMs: 5000,
                  }}
                />
            ) : (
                <Image
                  source={{uri: item.thumbnail_url}}
                  style={styles.thumbnail}
                  resizeMode="contain"
                />
              )}
              {!isPlaying && (
            <View style={styles.playButtonOverlay}>
              <View style={styles.playButton}>
                <Text style={styles.playIcon}>▶️</Text>
              </View>
            </View>
          )}
        </TouchableOpacity>
