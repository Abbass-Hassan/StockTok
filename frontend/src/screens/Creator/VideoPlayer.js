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

  const togglePlayPause = () => {
    setPaused(!paused);
  };

  const toggleControls = () => {
    setShowControls(!showControls);
  };
  const formatValue = value => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(2)}`;
  };

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

