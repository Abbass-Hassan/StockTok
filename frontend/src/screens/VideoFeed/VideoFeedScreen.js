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

// Calculate tab bar height
const TAB_BAR_HEIGHT = 80;
const BOTTOM_INSET = Platform.OS === 'ios' ? 34 : 16;
const STATUS_BAR_HEIGHT = StatusBar.currentHeight || 0;

// Calculate available content area
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

  // Fetch videos from the API
  const fetchVideos = async (page = 1) => {
    try {
      setLoading(true);

      // Get auth token
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      // Store token for video requests
      setVideoToken(token);

      const response = await axios.get(`${API_URL}/videos/all?page=${page}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const newVideos = response.data.data.videos.data;
      const isLastPage = !response.data.data.videos.next_page_url;

      // Initialize playing states for new videos
      const newPlayingStates = {};
      newVideos.forEach(video => {
        newPlayingStates[video.id] = false;
      });

      if (page === 1) {
        setVideos(newVideos);
        setPlayingStates(newPlayingStates);
      } else {
        setVideos(prevVideos => [...prevVideos, ...newVideos]);
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

  // Load initial videos
  useEffect(() => {
    fetchVideos();
  }, []);

  // Handle when a user scrolls to end of the list
  const handleLoadMore = () => {
    if (!loading && hasMorePages) {
      fetchVideos(currentPage + 1);
    }
  };

  // Update active video index and handle playback
  const handleViewableItemsChanged = useRef(({viewableItems}) => {
    if (viewableItems.length > 0) {
      const newActiveIndex = viewableItems[0].index;
      const activeVideoId = viewableItems[0].item.id;

      // Pause all videos
      const updatedPlayingStates = {...playingStates};
      Object.keys(updatedPlayingStates).forEach(videoId => {
        updatedPlayingStates[videoId] = false;
      });

      // Play only the active video
      updatedPlayingStates[activeVideoId] = true;

      setActiveVideoIndex(newActiveIndex);
      setPlayingStates(updatedPlayingStates);
    }
  }).current;

  // Configuration for viewability
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 300,
  }).current;

  // Format count for display
  const formatCount = count => {
    if (!count) return '0';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  // Toggle play/pause for a specific video
  const toggleVideoPlayback = videoId => {
    setPlayingStates(prev => ({
      ...prev,
      [videoId]: !prev[videoId],
    }));
  };

  // Navigate to creator profile
  const goToCreatorProfile = userId => {
    navigation.navigate('UserProfile', {userId: userId});
  };

  // Handle video error
  const handleVideoError = (error, videoId) => {
    console.error(`Error playing video ${videoId}:`, error);
  };

  // Render each video item
  const renderItem = ({item, index}) => {
    const isPlaying = playingStates[item.id] || false;
    const videoUrl = `${API_URL}/videos/${item.id}/play`;

    return (
      <View style={styles.itemContainer}>
        {/* Video Container with reduced size to center it */}
        <View style={styles.videoContainer}>
          {/* Video Player */}
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

            {/* Play Button Overlay - only when paused */}
            {!isPlaying && (
              <View style={styles.playButtonOverlay}>
                <View style={styles.playButton}>
                  <Text style={styles.playIcon}>▶️</Text>
                </View>
              </View>
            )}
          </TouchableOpacity>

          {/* Side buttons */}
          <View style={styles.sideButtonsContainer}>
            {/* Heart button */}
            <TouchableOpacity style={styles.sideButton}>
              <View style={styles.sideButtonCircle}>
                <Text style={styles.sideButtonIcon}>❤️</Text>
              </View>
              <Text style={styles.sideButtonText}>
                {formatCount(
                  item.likes_count || item.like_investment_count || 0,
                )}
              </Text>
            </TouchableOpacity>

            {/* Comment button */}
            <TouchableOpacity style={styles.sideButton}>
              <View style={styles.sideButtonCircle}>
                <Text style={styles.sideButtonIcon}>💬</Text>
              </View>
              <Text style={styles.sideButtonText}>
                {formatCount(item.comments_count || 0)}
              </Text>
            </TouchableOpacity>

            {/* Analytics button */}
            <TouchableOpacity style={styles.sideButton}>
              <View style={styles.sideButtonCircle}>
                <Text style={styles.sideButtonIcon}>📊</Text>
              </View>
              <Text style={styles.sideButtonText}>Analytics</Text>
            </TouchableOpacity>
          </View>

          {/* Username and caption */}
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

  // Render loading indicator
  const renderLoader = () => {
    if (!loading) return null;
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  };

  // Render error message
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => fetchVideos()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <FlatList
        ref={flatListRef}
        data={videos}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderLoader}
        showsVerticalScrollIndicator={false}
        snapToInterval={height - TAB_BAR_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        pagingEnabled
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={5}
        removeClippedSubviews={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  itemContainer: {
    height: height - TAB_BAR_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoContainer: {
    width: width,
    height: AVAILABLE_HEIGHT, // Reduced to leave space for tab bar and padding
    position: 'relative',
  },
  videoWrapper: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  playButtonOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  playButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  playIcon: {
    fontSize: 30,
  },

  // Side buttons styling
  sideButtonsContainer: {
    position: 'absolute',
    right: 10,
    bottom: 800, // Positioned above info container
    alignItems: 'center',
  },
  sideButton: {
    alignItems: 'center',
    marginBottom: 15,
  },
  sideButtonCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  sideButtonIcon: {
    fontSize: 22,
  },
  sideButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },

  // Username and caption container
  infoContainer: {
    position: 'absolute',
    left: 10,
    bottom: 15,
    maxWidth: '70%',
  },
  usernameText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 3,
  },
  captionText: {
    color: '#FFFFFF',
    fontSize: 14,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 3,
  },

  // Loading and error states
  loaderContainer: {
    padding: 10,
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default VideoFeedScreen;
