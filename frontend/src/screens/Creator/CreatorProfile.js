import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
  FlatList,
  Dimensions,
} from 'react-native';
import {getCreatorProfile, getCreatorStats} from '../../api/creatorProfileApi';
import {getMyVideos} from '../../api/videoApi';

const {width} = Dimensions.get('window');
const numColumns = 3;
const itemWidth = width / numColumns;
const CreatorProfile = ({navigation}) => {
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState(null);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
  
    useEffect(() => {
      loadProfileData();
    }, []);
    const loadProfileData = async () => {
        try {
          setError(null);
          setLoading(true);
          const [profileRes, statsRes, videosRes] = await Promise.all([
            getCreatorProfile(),
            getCreatorStats(),
            getMyVideos(),
          ]);
          setProfile(profileRes.data.profile);
          setStats(statsRes.data);
          const videoData =
            videosRes.data.videos?.data || videosRes.data.videos || [];
          setVideos(videoData);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      };
    
      const handleRefresh = () => {
        setRefreshing(true);
        loadProfileData();
      };
      const formatNumber = num => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
      };
      const renderGridItem = ({item}) => (
        <TouchableOpacity
          style={styles.gridItem}
          onPress={() => navigation.navigate('VideoPlayer', {video: item})}>
          <View style={styles.thumbnail}>
            {item.thumbnail_url ? (
              <Image
                source={{uri: item.thumbnail_url}}
                style={styles.thumbnailImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.thumbnailPlaceholder} />
            )}
          </View>
        </TouchableOpacity>
      );
      const renderEmptyContent = () => (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No videos uploaded yet</Text>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => navigation.navigate('UploadVideo')}>
            <Text style={styles.uploadButtonText}>Upload Video</Text>
          </TouchableOpacity>
        </View>
      );
      if (loading) {
        return (
          <SafeAreaView style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00796B" />
            <Text style={styles.loadingText}>Loading profile...</Text>
          </SafeAreaView>
        );
      }
      if (error) {
        return (
          <SafeAreaView style={styles.errorContainer}>
            <Text style={styles.errorText}>Error: {error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadProfileData}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </SafeAreaView>
        );
      }
      return (
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}>
              <Text style={styles.backText}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Profile</Text>
          </View>
          <ScrollView ... />
          <View style={styles.profileContainer}>
  <View style={styles.profileImageContainer}>
    {profile?.profile_photo_url ? (
      <Image source={{uri: profile.profile_photo_url}} style={styles.profileImage} />
    ) : (
      <View style={[styles.profileImage, styles.profileImagePlaceholder]}>
        <Text style={styles.profileInitials}>
          {profile?.name ? profile.name.charAt(0).toUpperCase() : '?'}
        </Text>
      </View>
    )}
  </View>
  <Text style={styles.username}>@{profile?.username || 'username'}</Text>
  <Text style={styles.userType}>Creator</Text>
  <View style={styles.statsContainer}>
  <View style={styles.statItem}>
    <Text style={styles.statNumber}>{formatNumber(stats?.total_videos || 0)}</Text>
    <Text style={styles.statLabel}>Videos</Text>
  </View>
  ...
</View>
<TouchableOpacity
  style={styles.editButton}
  onPress={() => navigation.navigate('EditCreatorProfile', {profile})}>
  <Text style={styles.editButtonText}>Edit Profile</Text>
</TouchableOpacity>
<View style={styles.videoGridContainer}>
  {videos && videos.length > 0 ? (
    <FlatList
      data={videos}
      renderItem={renderGridItem}
      keyExtractor={item => item.id?.toString() || Math.random().toString()}
      numColumns={numColumns}
      scrollEnabled={false}
      contentContainerStyle={styles.gridContainer}
    />
  ) : (
    renderEmptyContent()
  )}
</View>
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    marginBottom: 20,
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#00796B',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    marginRight: 10,
  },
  backText: {
    fontSize: 30,
    color: '#00796B',
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#00796B',
  },
