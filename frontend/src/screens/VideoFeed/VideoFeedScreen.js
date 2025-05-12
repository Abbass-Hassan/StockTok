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
  