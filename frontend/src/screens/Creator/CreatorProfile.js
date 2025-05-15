import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
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
import Icon from 'react-native-vector-icons/Ionicons';

const {width} = Dimensions.get('window');
const numColumns = 3;
const itemWidth = width / numColumns; // 3 columns with no gap

// UI Colors
const COLORS = {
  primary: '#00796B',
  lightGray: '#EEEEEE',
  gray: '#888888',
  darkGray: '#444444',
  white: '#FFFFFF',
  black: '#000000',
  green: '#4CAF50',
};

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
      // Removed the problematic line: setImageLoadError(false);

      // Fetch profile, stats and videos in parallel
      const [profileRes, statsRes, videosRes] = await Promise.all([
        getCreatorProfile(),
        getCreatorStats(),
        getMyVideos(),
      ]);

      setProfile(profileRes.data.profile);
      setStats(statsRes.data);

      // Debug log for profile data
      console.log('Profile data loaded:', profileRes.data.profile);
      console.log(
        'Profile photo URL:',
        profileRes.data.profile?.profile_photo_url,
      );

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

  const handleImageError = () => {
    console.log('Image failed to load');
  };

  const renderGridItem = ({item, index}) => {
    return (
      <TouchableOpacity
        style={styles.gridItem}
        onPress={() => navigation.navigate('VideoPlayer', {video: item})}>
        <View style={styles.thumbnail}>
          <Icon name="videocam" size={32} color="#FFFFFF" />
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyContent = () => (
    <View style={styles.emptyContainer}>
      <Icon name="videocam-outline" size={48} color="#AAAAAA" />
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
        <ActivityIndicator size="large" color={COLORS.primary} />
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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }>
          {/* Profile Info */}
          <View style={styles.profileContainer}>
            {/* Profile Image */}
            <View style={styles.profileImageContainer}>
              {/* Always use placeholder for profile image */}
              <View
                style={[styles.profileImage, styles.profileImagePlaceholder]}>
                <Text style={styles.profileInitials}>
                  {profile?.username
                    ? profile.username.charAt(0).toUpperCase()
                    : '?'}
                </Text>
              </View>
            </View>

            {/* Username */}
            <Text style={styles.username}>
              @{profile?.username || 'username'}
            </Text>
            <Text style={styles.userType}>Creator</Text>

            {/* Stats - Without Views */}
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
              <Text style={styles.tapToBio}>No Bio</Text>
            )}
          </View>

          {/* Video Grid */}
          <View style={styles.videoGridContainer}>
            {videos && videos.length > 0 ? (
              <>
                <Text style={styles.sectionTitle}>Videos</Text>
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
              </>
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
    backgroundColor: '#F0F0F0', // Add a background color for image loading
  },
  profileImagePlaceholder: {
    backgroundColor: '#E1E4E8', // Gray background for placeholder
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitials: {
    fontSize: 40,
    color: '#FFFFFF', // White text for the initial
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
    justifyContent: 'center',
    width: '70%',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    marginHorizontal: 24,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginLeft: 16,
    marginBottom: 10,
    marginTop: 10,
  },
  videoGridContainer: {
    flex: 1,
    marginBottom: 20,
  },
  gridContainer: {
    flex: 1,
  },
  gridItem: {
    width: itemWidth,
    height: itemWidth,
    padding: 2,
  },
  thumbnail: {
    flex: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E0E0E0',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    marginVertical: 16,
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
