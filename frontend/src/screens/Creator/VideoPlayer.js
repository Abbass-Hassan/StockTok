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

  const onProgress = data => {
    setCurrentTime(data.currentTime);
  };
  const onError = errorEvent => {
    console.error('Video player error:', JSON.stringify(errorEvent));
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

    if (retryCount < 2) {
      console.log(`Retrying playback (attempt ${retryCount + 1})...`);
      setRetryCount(retryCount + 1);
      setLoading(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.seek(0);
          setPaused(false);
        }
      }, 1000);
    } else {
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
  const formatTime = time => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const formatValue = value => {
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value.toFixed(2)}`;
  };

  const formatCount = count => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };
  const togglePlayPause = () => setPaused(!paused);
  const toggleControls = () => setShowControls(!showControls);
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
  }<SafeAreaView style={styles.safeArea}>
  <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
  <View style={styles.container}>
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}>
        <Text style={styles.backText}>‹</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Video Player</Text>
    </View>

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
            <Text style={styles.errorIcon}>⚠️</Text>
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
              <Text style={styles.playPauseText}>
                {paused ? '▶️' : '⏸'}
              </Text>
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
        {/* Video Info */}
        <ScrollView
          style={styles.infoContainer}
          showsVerticalScrollIndicator={false}>
          <Text style={styles.videoTitle}>{video.caption}</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>👁</Text>
              <Text style={styles.statValue}>
                {formatCount(video.view_count || 0)}
              </Text>
              <Text style={styles.statLabel}>Views</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statIcon}>📈</Text>
              <Text style={styles.statValue}>
                {formatValue(video.current_value || 0)}
              </Text>
              <Text style={styles.statLabel}>Value</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statIcon}>❤️</Text>
              <Text style={styles.statValue}>
                {formatCount(video.like_investment_count || 0)}
              </Text>
              <Text style={styles.statLabel}>Likes</Text>
            </View>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoIcon}>ℹ️</Text>
            <Text style={styles.infoTextWrapper}>
              <Text style={styles.infoText}>
                Initial Investment: {formatValue(video.initial_investment || 0)}
              </Text>
            </Text>
          </View>
          <TouchableOpacity
            style={styles.statsButton}
            onPress={() => navigation.navigate('VideoDetails', {video: video})}>
            <Text style={styles.statsButtonText}>View Detailed Stats</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
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
