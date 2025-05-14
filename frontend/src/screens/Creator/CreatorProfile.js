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
  Platform,
} from 'react-native';
import {getCreatorProfile, getCreatorStats} from '../../api/creatorProfileApi';
import {getMyVideos} from '../../api/videoApi';

const {width} = Dimensions.get('window');
const numColumns = 3;
const itemWidth = width / numColumns; // 3 columns with no gap

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

      // Fetch profile, stats and videos in parallel
      const [profileRes, statsRes, videosRes] = await Promise.all([
        getCreatorProfile(),
        getCreatorStats(),
        getMyVideos(),
      ]);

      setProfile(profileRes.data.profile);
      setStats(statsRes.data);

      // Make sure we have proper video data
      console.log('Video response:', videosRes.data);
      const videoData =
        videosRes.data.videos?.data || videosRes.data.videos || [];
      console.log('Video data loaded:', videoData.length, 'items');
      setVideos(videoData);
    } catch (err) {
      console.error('Profile loading error:', err);
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
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
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
    // Force white background with inline style as well
    <SafeAreaView style={[styles.safeArea, {backgroundColor: '#FFFFFF'}]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Add another white background layer */}
      <View style={[styles.container, {backgroundColor: '#FFFFFF'}]}>
        {/* Force white background for header with important styling */}
        <View style={[styles.header, {backgroundColor: '#FFFFFF'}]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Text style={[styles.backText, {color: '#00796B'}]}>‹</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, {color: '#00796B'}]}>Profile</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#00796B']}
              tintColor="#00796B"
            />
          }>
          {/* Profile Info */}
          <View style={styles.profileContainer}>
            {/* Profile Image */}
            <View style={styles.profileImageContainer}>
              {profile?.profile_photo_url ? (
                <Image
                  source={{uri: profile.profile_photo_url}}
                  style={styles.profileImage}
                />
              ) : (
                <View
                  style={[styles.profileImage, styles.profileImagePlaceholder]}>
                  <Text style={styles.profileInitials}>
                    {profile?.name ? profile.name.charAt(0).toUpperCase() : '?'}
                  </Text>
                </View>
              )}
            </View>

            {/* Username */}
            <Text style={styles.username}>
              @{profile?.username || 'username'}
            </Text>
            <Text style={styles.userType}>Creator</Text>

            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {formatNumber(stats?.total_videos || 0)}
                </Text>
                <Text style={styles.statLabel}>Videos</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {formatNumber(stats?.follower_count || 0)}
                </Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {formatNumber(stats?.total_views || 0)}
                </Text>
                <Text style={styles.statLabel}>Views</Text>
              </View>
            </View>

            {/* Edit Profile Button */}
            <TouchableOpacity
              style={styles.editButton}
              onPress={() =>
                navigation.navigate('EditCreatorProfile', {profile})
              }>
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>

            {/* Bio */}
            {profile?.bio ? (
              <Text style={styles.bio}>{profile.bio}</Text>
            ) : (
              <Text style={styles.tapToBio}>Tap to add bio</Text>
            )}
          </View>

          {/* Video Grid */}
          <View style={styles.videoGridContainer}>
            {videos && videos.length > 0 ? (
              <FlatList
                data={videos}
                renderItem={renderGridItem}
                keyExtractor={item =>
                  item.id?.toString() || Math.random().toString()
                }
                numColumns={numColumns}
                scrollEnabled={false}
                contentContainerStyle={styles.gridContainer}
              />
            ) : (
              renderEmptyContent()
            )}
          </View>
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
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 16 : 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center',
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
  profileContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  profileImageContainer: {
    marginBottom: 12,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImagePlaceholder: {
    backgroundColor: '#E1E4E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitials: {
    fontSize: 40,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  username: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 4,
  },
  userType: {
    fontSize: 14,
    color: '#00796B',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    marginHorizontal: 16,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
  },
  editButton: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  bio: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 8,
  },
  tapToBio: {
    fontSize: 14,
    color: '#999999',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  videoGridContainer: {
    flex: 1,
  },
  gridContainer: {
    flex: 1,
  },
  gridItem: {
    width: itemWidth,
    height: itemWidth,
  },
  thumbnail: {
    flex: 1,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    flex: 1,
    backgroundColor: '#E0E0E0',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 16,
  },
  uploadButton: {
    backgroundColor: '#00796B',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default CreatorProfile;
