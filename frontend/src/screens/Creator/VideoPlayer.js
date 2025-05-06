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
} from 'react-native';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/Ionicons';
import {getVideoStreamUrl} from '../../api/videoApi';
import {getToken} from '../../utils/tokenStorage';

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

  // Get auth token when component mounts
  useEffect(() => {
    const fetchToken = async () => {
      const authToken = await getToken();
      setToken(authToken);
    };
    fetchToken();
  }, []);

  console.log('Video to play:', video);

  // Generate streaming URL for the video
  const videoUrl = getVideoStreamUrl(video.id);
  console.log('Streaming URL:', videoUrl);

  // Handle load start
  const onLoadStart = () => {
    console.log('Video load started');
    setLoading(true);
    setError(null);
  };

  // Handle loading
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

  if (!videoUrl) {
    return (
      <View
        style={[
          styles.container,
          {justifyContent: 'center', alignItems: 'center'},
        ]}>
        <Text
          style={{
            fontSize: 16,
            color: '#666',
            textAlign: 'center',
            padding: 20,
          }}>
          This video doesn't have a playable URL
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
          controls={Platform.OS === 'android'} // Use native controls on Android
          playInBackground={false}
          playWhenInactive={false}
          ignoreSilentSwitch="ignore"
          useNativeControls={Platform.OS === 'ios'} // Try native controls on iOS
        />

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {!loading && !error && !Platform.OS === 'ios' && (
          <TouchableOpacity
            style={styles.playPauseButton}
            onPress={togglePlayPause}
            activeOpacity={0.7}>
            <Icon name={paused ? 'play' : 'pause'} size={30} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.caption}>{video.caption}</Text>

        <View style={styles.statsContainer}>
          <Text style={styles.statText}>Views: {video.view_count || 0}</Text>
          <Text style={styles.statText}>
            Value: ${video.current_value || 0}
          </Text>
        </View>

        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      </View>
    </View>
  );
};

// Styles remain the same
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  videoContainer: {
    width: width,
    height: width * 0.56, // 16:9 aspect ratio
    backgroundColor: '#000',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
  playPauseButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    padding: 15,
  },
  caption: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statText: {
    fontSize: 14,
    color: '#666',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  timeText: {
    fontSize: 12,
    color: '#888',
  },
  backButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#4B7BEC',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default VideoPlayer;
