import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Platform,
  TouchableOpacity,
} from 'react-native';

const MyVideos = ({navigation}) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  import {getMyVideos} from '../../api/videoApi';
  import VideoCard from '../../components/common/VideoCard';
  import EmptyState from '../../components/common/EmptyState';
  import FloatingActionButton from '../../components/common/FloatingActionButton';
  const loadVideos = async () => {
    try {
      setLoading(true);
      const response = await getMyVideos();
      console.log('API response:', response);
  
      if (response && response.data && response.data.videos) {
        setVideos(response.data.videos.data || []);
      } else if (response && response.data) {
        setVideos(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Load videos error:', error);
      Alert.alert('Error', error.message || 'Failed to load videos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  useEffect(() => {
    loadVideos();
  }, []);
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadVideos();
    });
  
    return unsubscribe;
  }, [navigation]);
  