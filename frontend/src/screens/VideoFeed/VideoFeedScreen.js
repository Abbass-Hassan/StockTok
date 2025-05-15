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
  Alert,
  Animated,
} from 'react-native';
import Video from 'react-native-video';
import axios from 'axios';
import {getToken} from '../../utils/tokenStorage';
import InvestmentModal from '../../components/modals/InvestmentModal';
import Ionicons from 'react-native-vector-icons/Ionicons';

const API_URL = 'http://35.181.171.137:8000/api';
const {height, width} = Dimensions.get('window');

// Calculate tab bar height
const TAB_BAR_HEIGHT = 80;
const BOTTOM_INSET = Platform.OS === 'ios' ? 34 : 16;
const STATUS_BAR_HEIGHT = StatusBar.currentHeight || 0;

// Calculate available content area - ADJUSTED FOR BETTER SPACING
const AVAILABLE_HEIGHT =
  height -
  TAB_BAR_HEIGHT -
  BOTTOM_INSET -
  STATUS_BAR_HEIGHT -
  (Platform.OS === 'ios' ? 30 : 20);

const VideoFeedScreen = ({navigation, route}) => {
  // Check if we have initialVideoId from navigation params
  const initialVideoId = route.params?.initialVideoId;
  const [hasInitialScrolled, setHasInitialScrolled] = useState(false);

  // Add feed type state
  const [feedType, setFeedType] = useState('trending'); // 'trending' or 'following'

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [videoToken, setVideoToken] = useState(null);
  const [playingStates, setPlayingStates] = useState({});

  // Investment modal states
  const [investmentModalVisible, setInvestmentModalVisible] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState(null);

  // Animation states for heart
  const [likeAnimations, setLikeAnimations] = useState({});
  const animatedHeartScale = useRef(new Animated.Value(0)).current;
  const animatedHeartOpacity = useRef(new Animated.Value(0)).current;

  const flatListRef = useRef(null);
  const videoRefs = useRef({});

  // Fetch videos from the API based on feed type
  const fetchVideos = async (page = 1, type = feedType) => {
    try {
      setLoading(true);

      // Get auth token
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      // Store token for video requests
      setVideoToken(token);

      // Determine API endpoint based on feed type
      let endpoint = '';
      if (type === 'trending') {
        endpoint = `${API_URL}/regular/videos/trending?page=${page}`;
      } else if (type === 'following') {
        endpoint = `${API_URL}/regular/videos/following?page=${page}`;
      }

      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Check if we have videos data
      if (
        response.data.data &&
        response.data.data.videos &&
        response.data.data.videos.data
      ) {
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
      } else {
        // Handle case where there are no videos (especially for following feed)
        setVideos([]);
        setHasMorePages(false);
      }

      setCurrentPage(page);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching videos:', err);

      // Check if error is specifically about not following anyone
      if (err.response && err.response.status === 404 && type === 'following') {
        setVideos([]);
        setError(null); // Clear any existing error
        setLoading(false);
      } else {
        setError('Failed to load videos. Please try again.');
        setLoading(false);
      }
    }
  };

  // Switch feed type
  const switchFeedType = type => {
    if (type !== feedType) {
      setFeedType(type);
      setVideos([]);
      setCurrentPage(1);
      setHasMorePages(true);
      setActiveVideoIndex(0);
      fetchVideos(1, type);

      // Scroll to top
      if (flatListRef.current) {
        flatListRef.current.scrollToOffset({offset: 0});
      }
    }
  };

  // Load initial videos
  useEffect(() => {
    fetchVideos();
  }, []);

  // Add useEffect to handle scrolling to the initial video when navigating from profile
  useEffect(() => {
    if (initialVideoId && videos.length > 0 && !hasInitialScrolled) {
      // Find the index of the video with initialVideoId
      const videoIndex = videos.findIndex(video => video.id === initialVideoId);

      if (videoIndex !== -1 && flatListRef.current) {
        console.log(`Scrolling to video at index ${videoIndex}`);

        // Add a small delay to ensure the FlatList is rendered
        setTimeout(() => {
          flatListRef.current.scrollToIndex({
            index: videoIndex,
            animated: true,
            viewPosition: 0,
          });

          // Update active video index
          setActiveVideoIndex(videoIndex);

          // Update playing states
          const updatedPlayingStates = {...playingStates};
          Object.keys(updatedPlayingStates).forEach(id => {
            updatedPlayingStates[id] = id === initialVideoId;
          });
          setPlayingStates(updatedPlayingStates);

          // Mark that we've scrolled to initial video
          setHasInitialScrolled(true);
        }, 500);
      }
    }
  }, [initialVideoId, videos, hasInitialScrolled, playingStates]);

  // Add a handler for scrollToIndex failures
  const onScrollToIndexFailed = info => {
    console.log('Failed to scroll to index', info);

    // If we can't scroll directly to the index, try again with a different approach
    if (initialVideoId && videos.length > 0 && !hasInitialScrolled) {
      setTimeout(() => {
        if (flatListRef.current) {
          // Try scrolling to an approximate position
          const approxIndex = Math.min(info.index, videos.length - 1);
          const offset = approxIndex * AVAILABLE_HEIGHT;

          flatListRef.current.scrollToOffset({
            offset,
            animated: true,
          });

          setHasInitialScrolled(true);
        }
      }, 500);
    }
  };

  // Animate heart when like is successful
  const animateHeart = videoId => {
    // Reset animations
    animatedHeartScale.setValue(0);
    animatedHeartOpacity.setValue(0);

    // Start animations
    Animated.parallel([
      Animated.timing(animatedHeartScale, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(animatedHeartOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Fade out animation
    setTimeout(() => {
      Animated.timing(animatedHeartOpacity, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }).start(() => {
        setLikeAnimations(prev => ({
          ...prev,
          [videoId]: false,
        }));
      });
    }, 1500);
  };

  // Open investment modal for a video
  const handleLikePress = videoId => {
    setSelectedVideoId(videoId);
    setInvestmentModalVisible(true);
  };

  // Handle successful investment
  const handleInvestmentSuccess = investment => {
    // Update videos list to reflect the new investment
    setVideos(prevVideos =>
      prevVideos.map(video => {
        if (video.id === selectedVideoId) {
          return {
            ...video,
            like_investment_count: video.like_investment_count + 1,
            // You may also update other properties if the API returns them
          };
        }
        return video;
      }),
    );

    // Start heart animation for the liked video
    setLikeAnimations(prev => ({
      ...prev,
      [selectedVideoId]: true,
    }));

    // Trigger animation
    animateHeart(selectedVideoId);
  };

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
    // Create haptic feedback when toggling video
    if (Platform.OS === 'ios') {
      // Use light impact for iOS
      const impactLight = require('react-native').ImpactFeedbackGenerator;
      if (impactLight) {
        const impact = new impactLight('light');
        impact.impactOccurred();
      }
    } else if (Platform.OS === 'android') {
      // Use vibration API for Android
      const Vibration = require('react-native').Vibration;
      Vibration.vibrate(10); // Very short vibration
    }

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
    const isAnimatingLike = likeAnimations[item.id] || false;

    return (
      <View style={styles.itemContainer}>
        {/* Video Container with reduced size to center it */}
        <View style={styles.videoContainer}>
          {/* Heart Animation - Only show when actively animating */}
          {isAnimatingLike && (
            <Animated.View
              style={[
                styles.heartAnimation,
                {
                  transform: [{scale: animatedHeartScale}],
                  opacity: animatedHeartOpacity,
                },
              ]}>
              <Ionicons name="heart" size={30} color="#FFFFFF" />
              <Text style={styles.heartText}>+1</Text>
            </Animated.View>
          )}

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
                  <Ionicons name="play" size={36} color="#FFFFFF" />
                </View>
                <Text style={styles.tapToPlayText}>Tap to play</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Side buttons */}
          <View style={styles.sideButtonsContainer}>
            {/* Heart button */}
            <TouchableOpacity
              style={styles.sideButton}
              onPress={() => handleLikePress(item.id)}>
              <View style={styles.sideButtonCircle}>
                <Ionicons name="heart-outline" size={26} color="#FFFFFF" />
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
                <Ionicons name="chatbubble-outline" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.sideButtonText}>
                {formatCount(item.comments_count || 0)}
              </Text>
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
        <Text style={styles.loaderText}>Loading videos...</Text>
      </View>
    );
  };

  // Render empty state when no videos available
  const renderEmptyState = () => {
    if (loading || videos.length > 0) return null;

    return (
      <View style={styles.emptyStateContainer}>
        <Text style={styles.emptyStateTitle}>
          {feedType === 'following'
            ? 'No videos from creators you follow'
            : 'No trending videos available'}
        </Text>
        <Text style={styles.emptyStateText}>
          {feedType === 'following'
            ? 'You are not following any creators yet. Follow some creators to see their videos here!'
            : 'Check back later for trending videos'}
        </Text>
        {feedType === 'following' ? (
          <TouchableOpacity
            style={styles.emptyStateButton}
            onPress={() => switchFeedType('trending')}>
            <Text style={styles.emptyStateButtonText}>Explore Trending</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.emptyStateButton}
            onPress={() => fetchVideos()}>
            <Text style={styles.emptyStateButtonText}>Refresh</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Render error message
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Text
          style={[
            styles.errorText,
            {fontSize: 15, color: '#AAAAAA', marginBottom: 25},
          ]}>
          Please check your connection and try again.
        </Text>
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

      {/* Header with Back Button and Feed Type Selector */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.feedTypeSelectorContainer}>
          <TouchableOpacity
            style={[
              styles.feedTypeButton,
              feedType === 'following' && styles.activeFeedTypeButton,
            ]}
            onPress={() => switchFeedType('following')}>
            <Text
              style={[
                styles.feedTypeText,
                feedType === 'following' && styles.activeFeedTypeText,
              ]}>
              Following
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.feedTypeButton,
              feedType === 'trending' && styles.activeFeedTypeButton,
            ]}
            onPress={() => switchFeedType('trending')}>
            <Text
              style={[
                styles.feedTypeText,
                feedType === 'trending' && styles.activeFeedTypeText,
              ]}>
              Trending
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.contentContainer}>
        {videos.length === 0 && !loading ? (
          renderEmptyState()
        ) : (
          <FlatList
            ref={flatListRef}
            data={videos}
            renderItem={renderItem}
            keyExtractor={item => item.id.toString()}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderLoader}
            ListEmptyComponent={loading ? null : renderEmptyState}
            showsVerticalScrollIndicator={false}
            snapToInterval={AVAILABLE_HEIGHT} // ADJUSTED: Use the new AVAILABLE_HEIGHT
            snapToAlignment="start"
            decelerationRate="fast"
            pagingEnabled
            onViewableItemsChanged={handleViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            initialNumToRender={3}
            maxToRenderPerBatch={3}
            windowSize={5}
            removeClippedSubviews={true}
            onScrollToIndexFailed={onScrollToIndexFailed}
          />
        )}
      </View>

      {/* Investment Modal */}
      <InvestmentModal
        visible={investmentModalVisible}
        videoId={selectedVideoId}
        onClose={() => setInvestmentModalVisible(false)}
        onSuccess={handleInvestmentSuccess}
        navigation={navigation}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  contentContainer: {
    flex: 1,
  },
  // Header styles - ADJUSTED
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    // ADJUSTED: Increased top padding for more space at the top
    paddingTop: Platform.OS === 'ios' ? 60 : 30,
    paddingBottom: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 10,
  },
  backButton: {
    padding: 8,
    marginLeft: 10,
    borderRadius: 20,
  },
  // Feed Type Selector styles - UNCHANGED
  feedTypeSelectorContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 40, // Balance for back button
  },
  feedTypeButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 5,
  },
  activeFeedTypeButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#FFFFFF',
  },
  feedTypeText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 17,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  activeFeedTypeText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  // Video container - ADJUSTED
  itemContainer: {
    // ADJUSTED: Set height to match the new AVAILABLE_HEIGHT
    height: AVAILABLE_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoContainer: {
    width: width,
    // ADJUSTED: Create more balanced video container height
    height: AVAILABLE_HEIGHT - (Platform.OS === 'ios' ? 60 : 40),
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
  // Play Button Styles - UNCHANGED
  playButtonOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  tapToPlayText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 15,
    opacity: 0.8,
  },
  // Heart animation - UNCHANGED
  heartAnimation: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    marginLeft: -50,
    zIndex: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 50,
    padding: 10,
  },
  heartText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 5,
  },
  // Side buttons styling - ADJUSTED
  sideButtonsContainer: {
    position: 'absolute',
    right: 15,
    // ADJUSTED: Lowered position from bottom to align better with screen
    bottom: 100,
    alignItems: 'center',
  },
  sideButton: {
    alignItems: 'center',
    marginBottom: 20,
  },
  sideButtonCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  sideButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '400',
  },
  // Username and caption container - ADJUSTED
  infoContainer: {
    position: 'absolute',
    left: 15,
    // ADJUSTED: Increased bottom margin for better spacing
    bottom: 25,
    maxWidth: '70%',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 15,
  },
  usernameText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  captionText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
  },
  // Loading and error states - UNCHANGED
  loaderContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
  },
  loaderText: {
    color: '#FFFFFF',
    marginTop: 10,
    fontSize: 14,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#000000',
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 17,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  // Empty state styles - UNCHANGED
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#000000',
  },
  emptyStateTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  emptyStateText: {
    color: '#AAAAAA',
    fontSize: 16,
    marginBottom: 25,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyStateButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
  },
  emptyStateButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default VideoFeedScreen;
