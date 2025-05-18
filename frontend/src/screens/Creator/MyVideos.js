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
import {getMyVideos} from '../../api/videoApi';
import VideoCard from '../../components/common/VideoCard';
import EmptyState from '../../components/common/EmptyState';
import FloatingActionButton from '../../components/common/FloatingActionButton';

const MyVideos = ({navigation}) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadVideos = async () => {
    try {
      setLoading(true);

      // Real API call to get your uploaded videos
      const response = await getMyVideos();
      console.log('API response:', response);

      // Adjust this based on your actual API response structure
      if (response && response.data && response.data.videos) {
        setVideos(response.data.videos.data || []);
      } else if (response && response.data) {
        // If response.data.videos doesn't exist, try using response.data directly
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

  // Load videos on component mount
  useEffect(() => {
    loadVideos();
  }, []);

  // Reload videos when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadVideos();
    });

    return unsubscribe;
  }, [navigation]);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    loadVideos();
  };

  // Render a video item
  const renderVideoItem = ({item}) => (
    <VideoCard
      video={item}
      onPress={() => navigation.navigate('VideoPlayer', {video: item})}
    />
  );

  // Render empty state
  const renderEmptyState = () => (
    <EmptyState
      title="No Videos Yet"
      description="Start sharing your content and track your investment growth"
      actionText="Upload Your First Video"
      onAction={() => navigation.navigate('UploadVideo')}
    />
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.container}>
        {/* Header */}
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
            keyExtractor={item =>
              item.id?.toString() || Math.random().toString()
            }
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

        <FloatingActionButton
          onPress={() => navigation.navigate('UploadVideo')}
          text="+"
        />
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
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 16 : 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 32,
    color: '#00796B',
    marginTop: -4,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00796B',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 80,
  },
});

export default MyVideos;
