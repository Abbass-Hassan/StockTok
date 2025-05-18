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

const TAB_BAR_HEIGHT = 80;
const BOTTOM_INSET = Platform.OS === 'ios' ? 34 : 16;
const STATUS_BAR_HEIGHT = StatusBar.currentHeight || 0;

const AVAILABLE_HEIGHT = height;

const VideoFeedScreen = ({navigation, route}) => {
  const initialVideoId = route.params?.initialVideoId;
  const [hasInitialScrolled, setHasInitialScrolled] = useState(false);

  const [feedType, setFeedType] = useState('trending');

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [videoToken, setVideoToken] = useState(null);
  const [playingStates, setPlayingStates] = useState({});

  const [investmentModalVisible, setInvestmentModalVisible] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState(null);

  const [likeAnimations, setLikeAnimations] = useState({});
  const animatedHeartScale = useRef(new Animated.Value(0)).current;
  const animatedHeartOpacity = useRef(new Animated.Value(0)).current;

  const flatListRef = useRef(null);
  const videoRefs = useRef({});

  const fetchVideos = async (page = 1, type = feedType) => {
    try {
      setLoading(true);

      const token = await getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      setVideoToken(token);

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

      if (
        response.data.data &&
        response.data.data.videos &&
        response.data.data.videos.data
      ) {
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
          setVideos(prevVideos => [...prevVideos, ...newVideos]);
          setPlayingStates(prev => ({...prev, ...newPlayingStates}));
        }

        setHasMorePages(!isLastPage);
      } else {
        setVideos([]);
        setHasMorePages(false);
      }

      setCurrentPage(page);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching videos:', err);

      if (err.response && err.response.status === 404 && type === 'following') {
        setVideos([]);
        setError(null);
        setLoading(false);
      } else {
        setError('Failed to load videos. Please try again.');
        setLoading(false);
      }
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

      if (flatListRef.current) {
        flatListRef.current.scrollToOffset({offset: 0});
      }
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  useEffect(() => {
    if (initialVideoId && videos.length > 0 && !hasInitialScrolled) {
      const videoIndex = videos.findIndex(video => video.id === initialVideoId);

      if (videoIndex !== -1 && flatListRef.current) {
        console.log(`Scrolling to video at index ${videoIndex}`);

        setTimeout(() => {
          flatListRef.current.scrollToIndex({
            index: videoIndex,
            animated: true,
            viewPosition: 0,
          });

          setActiveVideoIndex(videoIndex);

          const updatedPlayingStates = {...playingStates};
          Object.keys(updatedPlayingStates).forEach(id => {
            updatedPlayingStates[id] = id === initialVideoId;
          });
          setPlayingStates(updatedPlayingStates);

          setHasInitialScrolled(true);
        }, 500);
      }
    }
  }, [initialVideoId, videos, hasInitialScrolled, playingStates]);

  const onScrollToIndexFailed = info => {
    console.log('Failed to scroll to index', info);

    if (initialVideoId && videos.length > 0 && !hasInitialScrolled) {
      setTimeout(() => {
        if (flatListRef.current) {
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

  const animateHeart = videoId => {
    animatedHeartScale.setValue(0);
    animatedHeartOpacity.setValue(0);

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

  const handleLikePress = videoId => {
    setSelectedVideoId(videoId);
    setInvestmentModalVisible(true);
  };

  const handleInvestmentSuccess = investment => {
    setVideos(prevVideos =>
      prevVideos.map(video => {
        if (video.id === selectedVideoId) {
          return {
            ...video,
            like_investment_count: video.like_investment_count + 1,
          };
        }
        return video;
      }),
    );

    setLikeAnimations(prev => ({
      ...prev,
      [selectedVideoId]: true,
    }));

    animateHeart(selectedVideoId);
  };

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
    if (Platform.OS === 'ios') {
      const impactLight = require('react-native').ImpactFeedbackGenerator;
      if (impactLight) {
        const impact = new impactLight('light');
        impact.impactOccurred();
      }
    } else if (Platform.OS === 'android') {
      const Vibration = require('react-native').Vibration;
      Vibration.vibrate(10);
    }

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
    const isAnimatingLike = likeAnimations[item.id] || false;

    return (
      <View style={styles.itemContainer}>
        <View style={styles.videoContainer}>
          {isAnimatingLike && (
            <Animated.View
              style={[
                styles.heartAnimation,
                {
                  transform: [{scale: animatedHeartScale}],
                  opacity: animatedHeartOpacity,
                },
              ]}>
              <Ionicons name="heart" size={80} color="#FFFFFF" />
            </Animated.View>
          )}

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
                resizeMode="cover"
                repeat={true}
                playInBackground={false}
                playWhenInactive={false}
                paused={!isPlaying}
                onError={error => handleVideoError(error, item.id)}
                poster={item.thumbnail_url}
                posterResizeMode="cover"
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
                resizeMode="cover"
              />
            )}

            {!isPlaying && (
              <View style={styles.playButtonOverlay}>
                <View style={styles.playButton}>
                  <Ionicons name="play" size={36} color="#FFFFFF" />
                </View>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.captionContainer}>
            <TouchableOpacity onPress={() => goToCreatorProfile(item.user_id)}>
              <Text style={styles.usernameText}>@{item.username}</Text>
            </TouchableOpacity>
            <Text style={styles.captionText} numberOfLines={2}>
              {item.caption || item.title}
            </Text>
          </View>

          <View style={styles.sideButtonsContainer}>
            <TouchableOpacity
              style={styles.sideButton}
              onPress={() => handleLikePress(item.id)}>
              <View style={styles.iconContainer}>
                <Ionicons name="heart-outline" size={28} color="#FFFFFF" />
              </View>
              <Text style={styles.sideButtonText}>
                {formatCount(
                  item.likes_count || item.like_investment_count || 0,
                )}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sideButton}>
              <View style={styles.iconContainer}>
                <Ionicons name="chatbubble-outline" size={26} color="#FFFFFF" />
              </View>
              <Text style={styles.sideButtonText}>
                {formatCount(item.comments_count || 0)}
              </Text>
            </TouchableOpacity>
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
            snapToInterval={AVAILABLE_HEIGHT}
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

      <View style={styles.header}>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 30,
    paddingBottom: 15,
    position: 'absolute',
    width: '100%',
    top: 0,
    zIndex: 10,
  },
  feedTypeSelectorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
  itemContainer: {
    height: AVAILABLE_HEIGHT,
    width: width,
  },
  videoContainer: {
    width: width,
    height: AVAILABLE_HEIGHT,
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
  heartAnimation: {
    position: 'absolute',
    top: '45%',
    left: '50%',
    marginLeft: -40,
    zIndex: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideButtonsContainer: {
    position: 'absolute',
    right: 12,
    bottom: 100,
    alignItems: 'center',
  },
  sideButton: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    marginBottom: 5,
  },
  sideButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  captionContainer: {
    position: 'absolute',
    left: 15,
    bottom: 100,
    maxWidth: '60%',
    padding: 8,
    zIndex: 20,
  },
  usernameText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 3,
  },
  captionText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    lineHeight: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 3,
  },
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
