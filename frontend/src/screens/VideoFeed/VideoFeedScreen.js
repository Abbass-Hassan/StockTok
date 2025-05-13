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
    const [feedType, setFeedType] = useState('trending');
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
    const fetchVideos = async (page = 1, type = feedType) => {
        try {
          setLoading(true);
          const token = await getToken();
          if (!token) throw new Error('Authentication required');
          setVideoToken(token);
          let endpoint = type === 'trending'
            ? `${API_URL}/regular/videos/trending?page=${page}`
            : `${API_URL}/regular/videos/following?page=${page}`;
          const response = await axios.get(endpoint, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const newVideos = response.data.data.videos.data;
          const isLastPage = !response.data.data.videos.next_page_url;
          const newPlayingStates = {};
          newVideos.forEach(video => newPlayingStates[video.id] = false);
          if (page === 1) {
            setVideos(newVideos);
            setPlayingStates(newPlayingStates);
          } else {
            setVideos(prev => [...prev, ...newVideos]);
            setPlayingStates(prev => ({ ...prev, ...newPlayingStates }));
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
      const switchFeedType = type => {
        if (type !== feedType) {
          setFeedType(type);
          setVideos([]);
          setCurrentPage(1);
          setHasMorePages(true);
          setActiveVideoIndex(0);
          fetchVideos(1, type);
          if (flatListRef.current) flatListRef.current.scrollToOffset({ offset: 0 });
        }
      };
      useEffect(() => {
        fetchVideos();
      }, []);
      const handleLoadMore = () => {
        if (!loading && hasMorePages) fetchVideos(currentPage + 1);
      };
      const handleViewableItemsChanged = useRef(({viewableItems}) => {
        if (viewableItems.length > 0) {
          const newActiveIndex = viewableItems[0].index;
          const activeVideoId = viewableItems[0].item.id;
          const updatedStates = { ...playingStates };
          Object.keys(updatedStates).forEach(id => updatedStates[id] = false);
          updatedStates[activeVideoId] = true;
          setActiveVideoIndex(newActiveIndex);
          setPlayingStates(updatedStates);
        }
      }).current;
    
      const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50,
        minimumViewTime: 300,
      }).current;
      const formatCount = count => {
        if (!count) return '0';
        if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
        if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
        return count.toString();
      };
    
      const toggleVideoPlayback = videoId => {
        if (Platform.OS === 'ios') {
          const impactLight = require('react-native').ImpactFeedbackGenerator;
          if (impactLight) new impactLight('light').impactOccurred();
        } else if (Platform.OS === 'android') {
          require('react-native').Vibration.vibrate(10);
        }
    
        setPlayingStates(prev => ({
          ...prev,
          [videoId]: !prev[videoId],
        }));
      };
      const goToCreatorProfile = userId => {
        navigation.navigate('UserProfile', {userId});
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
                    ref={ref => videoRefs.current[item.id] = ref}
                    source={{
                      uri: videoUrl,
                      headers: { Authorization: `Bearer ${videoToken}` },
                    }}
                    style={styles.videoPlayer}
                    resizeMode="contain"
                    repeat
                    paused={!isPlaying}
                    onError={e => handleVideoError(e, item.id)}
                    poster={item.thumbnail_url}
                    posterResizeMode="contain"
                  />
                ) : (
                  <Image source={{uri: item.thumbnail_url}} style={styles.thumbnail} resizeMode="contain" />
                )}
                {!isPlaying && (
                  <View style={styles.playButtonOverlay}>
                    <View style={styles.playButton}>
                      <Text style={styles.playIcon}>▶️</Text>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
    
              {/* Side Buttons */}
              <View style={styles.sideButtonsContainer}>
                <TouchableOpacity style={styles.sideButton}>
                  <View style={styles.sideButtonCircle}><Text style={styles.sideButtonIcon}>❤️</Text></View>
                  <Text style={styles.sideButtonText}>{formatCount(item.likes_count || item.like_investment_count || 0)}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sideButton}>
                  <View style={styles.sideButtonCircle}><Text style={styles.sideButtonIcon}>💬</Text></View>
                  <Text style={styles.sideButtonText}>{formatCount(item.comments_count || 0)}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sideButton}>
                  <View style={styles.sideButtonCircle}><Text style={styles.sideButtonIcon}>📊</Text></View>
                  <Text style={styles.sideButtonText}>Analytics</Text>
                </TouchableOpacity>
              </View>
    
              <View style={styles.infoContainer}>
                <TouchableOpacity onPress={() => goToCreatorProfile(item.user_id)}>
                  <Text style={styles.usernameText}>@{item.username}</Text>
                </TouchableOpacity>
                <Text style={styles.captionText} numberOfLines={1}>
                  {item.caption || item.title}
                </Text>
              </View>
            </View>
          </View>
        );
      };
      const renderLoader = () => {
        if (!loading) return null;
        return (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.loaderText}>Loading videos...</Text>
          </View>
        );
      };
    
      const renderEmptyState = () => {
        if (loading || videos.length > 0) return null;
        return (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateTitle}>
              {feedType === 'following' ? 'No videos from creators you follow' : 'No trending videos available'}
            </Text>
            <Text style={styles.emptyStateText}>
              {feedType === 'following' ? 'Follow some creators to see their videos here!' : 'Check back later for trending videos'}
            </Text>
            <TouchableOpacity style={styles.emptyStateButton} onPress={() =>
              feedType === 'following' ? switchFeedType('trending') : fetchVideos()
            }>
              <Text style={styles.emptyStateButtonText}>
                {feedType === 'following' ? 'Explore Trending' : 'Refresh'}
              </Text>
            </TouchableOpacity>
          </View>
        );
      };
      if (error) {
        return (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Text style={[styles.errorText, {fontSize: 15, color: '#AAAAAA', marginBottom: 25}]}>
              Please check your connection and try again.
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => fetchVideos()}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        );
      }
    