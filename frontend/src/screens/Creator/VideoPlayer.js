import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
  Platform,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Video from 'react-native-video';
import {getVideoStreamUrl} from '../../api/videoApi';
import {getToken} from '../../utils/tokenStorage';
import Icon from 'react-native-vector-icons/Ionicons';

const {width} = Dimensions.get('window');

const VideoPlayer = ({route, navigation}) => {
  const {video} = route.params;
  const videoRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    const fetchToken = async () => {
      const authToken = await getToken();
      setToken(authToken);
    };
    fetchToken();
  }, []);

  console.log('Video to play:', video);

  const videoUrl = getVideoStreamUrl(video.id);
  console.log('Streaming URL:', videoUrl);

  const onLoadStart = () => {
    console.log('Video load started');
    setLoading(true);
    setError(null);
  };

  const onLoad = data => {
    console.log('Video loaded successfully:', data);
    setDuration(data.duration);
    setLoading(false);
  };

  // Handle progress updates
  const onProgress = data => {
    setCurrentTime(data.currentTime);
  };

  // Handle errors
  const onError = errorEvent => {
    console.error('Video player error:', JSON.stringify(errorEvent));

    // More detailed error message
    let errorMessage;
    if (errorEvent.error?.localizedDescription) {
      errorMessage = errorEvent.error.localizedDescription;
    } else if (errorEvent.error?.code) {
      errorMessage = `Error code: ${errorEvent.error.code}`;
    } else {
      errorMessage = 'Unknown error occurred';
    }

    setError(`Error playing video: ${errorMessage}`);
    setLoading(false);

    // Auto-retry up to 2 times
    if (retryCount < 2) {
      console.log(`Retrying playback (attempt ${retryCount + 1})...`);
      setRetryCount(retryCount + 1);
      setLoading(true);

      // Short delay before retry
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.seek(0);
          setPaused(false);
        }
      }, 1000);
    } else {
      // Show alert after multiple failures
      Alert.alert(
        'Playback Error',
        'There was a problem playing this video. Would you like to try again?',
        [
          {text: 'Cancel', onPress: () => navigation.goBack()},
          {
            text: 'Retry',
            onPress: () => {
              setRetryCount(0);
              setLoading(true);
              setError(null);

              // Force remount of video component
              setPaused(true);
              setTimeout(() => {
                setPaused(false);
              }, 500);
            },
          },
        ],
      );
    }
  };

  // Format time in minutes:seconds
  const formatTime = time => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Toggle play/pause
  const togglePlayPause = () => {
    setPaused(!paused);
  };

  // Toggle controls visibility
  const toggleControls = () => {
    setShowControls(!showControls);
  };

  // Format value with proper units
  const formatValue = value => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(2)}`;
  };

  // Format large numbers
  const formatCount = count => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  if (!videoUrl) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Unable to Play Video</Text>
          <Text style={styles.errorDescription}>
            This video doesn't have a playable URL
          </Text>
          <TouchableOpacity
            style={styles.errorButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.errorButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Video Player</Text>
        </View>

        {/* Video Container */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={toggleControls}
          style={styles.videoWrapper}>
          <View style={styles.videoContainer}>
            <Video
              ref={videoRef}
              source={{
                uri: videoUrl,
                headers: token ? {Authorization: `Bearer ${token}`} : {},
              }}
              style={styles.video}
              resizeMode="contain"
              onLoadStart={onLoadStart}
              onLoad={onLoad}
              onProgress={onProgress}
              onError={onError}
              paused={paused}
              repeat={true}
              controls={false}
              playInBackground={false}
              playWhenInactive={false}
              ignoreSilentSwitch="ignore"
            />

            {loading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#FFFFFF" />
                <Text style={styles.loadingText}>Loading video...</Text>
              </View>
            )}

            {error && (
              <View style={styles.errorOverlay}>
                <Icon
                  name="warning"
                  size={48}
                  color="#FFFFFF"
                  style={styles.errorIcon}
                />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={() => {
                    setRetryCount(0);
                    setLoading(true);
                    setError(null);
                    setPaused(false);
                  }}>
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}

            {!loading && !error && showControls && (
              <View style={styles.controlsOverlay}>
                <TouchableOpacity
                  style={styles.playPauseButton}
                  onPress={togglePlayPause}>
                  {paused ? (
                    <View style={styles.playIconContainer}>
                      <Icon name="play" size={36} color="#FFFFFF" />
                    </View>
                  ) : (
                    <View style={styles.pauseIconContainer}>
                      <Icon name="pause" size={36} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>

                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {width: `${(currentTime / duration) * 100}%`},
                    ]}
                  />
                </View>

                <View style={styles.timeContainer}>
                  <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
                  <Text style={styles.timeText}>{formatTime(duration)}</Text>
                </View>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* Video Info */}
        <ScrollView
          style={styles.infoContainer}
          showsVerticalScrollIndicator={false}>
          <Text style={styles.videoTitle}>{video.caption}</Text>

          <View style={styles.statsContainer}>
            {/* Value stat - Left aligned */}
            <View style={styles.statItem}>
              <View style={styles.iconContainer}>
                <Icon name="trending-up" size={24} color="#00796B" />
              </View>
              <Text style={styles.statValue}>
                {formatValue(video.current_value || 0)}
              </Text>
              <Text style={styles.statLabel}>Value</Text>
            </View>

            {/* Likes stat - Right aligned */}
            <View style={styles.statItem}>
              <View style={styles.iconContainer}>
                <Icon name="heart" size={24} color="#00796B" />
              </View>
              <Text style={styles.statValue}>
                {formatCount(video.like_investment_count || 0)}
              </Text>
              <Text style={styles.statLabel}>Likes</Text>
            </View>
          </View>

          {/* Additional Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <Icon name="information-circle" size={24} color="#00796B" />
            </View>
            <Text style={styles.infoTextWrapper}>
              <Text style={styles.infoText}>
                Initial Investment: {formatValue(video.initial_investment || 0)}
              </Text>
            </Text>
          </View>

          {/* View Stats Button */}
          <TouchableOpacity
            style={styles.statsButton}
            onPress={() => navigation.navigate('VideoDetails', {video: video})}>
            <Text style={styles.statsButtonText}>View Detailed Stats</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 16 : 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    marginRight: 16,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    fontSize: 32,
    color: '#00796B',
    marginTop: -4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#00796B',
  },
  videoWrapper: {
    backgroundColor: '#000000',
  },
  videoContainer: {
    width: width,
    height: width * 0.56, // 16:9 aspect ratio
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 12,
    fontSize: 16,
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 20,
  },
  errorIcon: {
    marginBottom: 16,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#00796B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  playPauseButton: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(0, 121, 107, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 5, // Offset for play icon
  },
  pauseIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(0, 121, 107, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBar: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00796B',
    borderRadius: 3,
  },
  timeContainer: {
    position: 'absolute',
    bottom: 10,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
  infoContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  videoTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 20,
    lineHeight: 28,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E0F2F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
  },
  statLabel: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E8F5F3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoTextWrapper: {
    flex: 1,
  },
  infoText: {
    fontSize: 14,
    color: '#00796B',
    fontWeight: '500',
  },
  statsButton: {
    backgroundColor: '#00796B',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#F5F5F5',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
  },
  errorDescription: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  errorButton: {
    backgroundColor: '#00796B',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  errorButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default VideoPlayer;
