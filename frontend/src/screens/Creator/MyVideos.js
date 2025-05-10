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
  const handleRefresh = () => {
    setRefreshing(true);
    loadVideos();
  };
  const renderVideoItem = ({item}) => (
    <VideoCard
      video={item}
      onPress={() => navigation.navigate('VideoPlayer', {video: item})}
    />
  );
  const renderEmptyState = () => (
    <EmptyState
      title="No Videos Yet"
      description="Start sharing your content and track your investment growth"
      actionText="Upload Your First Video"
      onAction={() => navigation.navigate('UploadVideo')}
    />
  );
  <View style={styles.header}>
  <View style={styles.headerContent}>
    <TouchableOpacity
      onPress={() => navigation.goBack()}
      style={styles.backButton}>
      <Text style={styles.backButtonText}>‹</Text>
    </TouchableOpacity>
    <View style={styles.titleContainer}>
      <Text style={styles.title}>My Videos</Text>
      <Text style={styles.subtitle}>
        {videos.length} {videos.length === 1 ? 'video' : 'videos'}
      </Text>
    </View>
  </View>
</View>
{loading && !refreshing ? (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#00796B" />
    <Text style={styles.loadingText}>Loading your videos...</Text>
  </View>
) : (
  <FlatList
    data={videos}
    renderItem={renderVideoItem}
    keyExtractor={item => item.id?.toString() || Math.random().toString()}
    contentContainerStyle={styles.listContainer}
    ListEmptyComponent={renderEmptyState}
    refreshControl={
      <RefreshControl
        refreshing={refreshing}
        onRefresh={handleRefresh}
        colors={['#00796B']}
        tintColor="#00796B"
      />
    }
    showsVerticalScrollIndicator={false}
  />
)}
