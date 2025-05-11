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
