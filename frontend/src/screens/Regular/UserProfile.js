// src/screens/Regular/UserProfile.js
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Alert,
} from 'react-native';
import {
  getUserByUsername,
  getUserVideos,
  followUser,
  unfollowUser,
  checkFollowingStatus,
} from '../../api/userProfileApi';

const {width} = Dimensions.get('window');
const numColumns = 3;
const itemWidth = width / numColumns;

const UserProfile = ({route, navigation}) => {
  const {username} = route.params;
  console.log('UserProfile screen opened for:', username);

  const [profile, setProfile] = useState(null);
  const [videos, setVideos] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videoLoading, setVideoLoading] = useState(true);

  useEffect(() => {
    console.log('UserProfile useEffect triggered');
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    console.log('Loading profile data for:', username);
    try {
      setLoading(true);
      setError(null);

      // Get user profile by username
      console.log('Fetching user profile...');
      const profileResponse = await getUserByUsername(username);
      console.log(
        'Profile response received:',
        JSON.stringify(profileResponse).substring(0, 200),
      );

      if (!profileResponse || !profileResponse.profile) {
        console.error('Invalid profile response structure');
        setError('Could not load user profile');
        setLoading(false);
        return;
      }

      const userProfile = profileResponse.profile;
      console.log(
        'User profile data:',
        JSON.stringify(userProfile).substring(0, 200),
      );
      setProfile(userProfile);

      // At this point, the profile has loaded successfully
      // Set loading to false so the profile UI shows up
      setLoading(false);

      // Load videos separately and don't block profile display
      if (userProfile.id) {
        try {
          console.log('Fetching videos for user ID:', userProfile.id);
          setVideoLoading(true);

          const videosResponse = await getUserVideos(userProfile.id);
          console.log(
            'Videos response:',
            JSON.stringify(videosResponse).substring(0, 200),
          );

          // Handle different response structures
          let videosList = [];
          if (videosResponse?.videos?.data) {
            videosList = videosResponse.videos.data;
          } else if (videosResponse?.videos) {
            videosList = Array.isArray(videosResponse.videos)
              ? videosResponse.videos
              : videosResponse.videos.data || [];
          }

          console.log('Videos count:', videosList.length);
          setVideos(videosList);
        } catch (videoError) {
          console.error('Error loading videos:', videoError.message);
          // Videos failed but we'll show an empty list
          setVideos([]);
        } finally {
          setVideoLoading(false);
        }

        // Check follow status (without blocking profile display)
        try {
          console.log('Checking follow status...');
          const followResponse = await checkFollowingStatus(userProfile.id);
          console.log(
            'Follow status response:',
            JSON.stringify(followResponse),
          );
          setIsFollowing(followResponse?.is_following || false);
        } catch (followError) {
          console.error('Error checking follow status:', followError.message);
          // Default to not following if status check fails
          setIsFollowing(false);
        }
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      console.error('Error details:', err.message);

      if (err.response) {
        console.error('Error response status:', err.response.status);
        console.error(
          'Error response data:',
          JSON.stringify(err.response.data || {}),
        );
      }

      setError('Failed to load profile. Please try again.');
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    console.log('Follow toggle pressed. Current status:', isFollowing);
    try {
      if (isFollowing) {
        console.log('Attempting to unfollow user ID:', profile.id);
        await unfollowUser(profile.id);
        console.log('Unfollow successful');
        setIsFollowing(false);
      } else {
        console.log('Attempting to follow user ID:', profile.id);
        await followUser(profile.id);
        console.log('Follow successful');
        setIsFollowing(true);
      }
    } catch (err) {
      console.error('Follow/unfollow error:', err);
      console.error('Error message:', err.message);

      if (err.response) {
        console.error('Error status:', err.response.status);
        console.error('Error data:', JSON.stringify(err.response.data || {}));
      }

      Alert.alert('Error', 'Failed to update follow status. Please try again.');
    }
  };

  const renderVideoItem = ({item}) => {
    console.log('Rendering video thumbnail:', item?.id);

    if (!item) {
      console.warn('Trying to render null video item');
      return null;
    }

    return (
      <TouchableOpacity
        style={styles.gridItem}
        onPress={() => {
          console.log('Video pressed:', item?.id);
          navigation.navigate('VideoPlayer', {video: item});
        }}>
        <Image
          source={{
            uri: item.thumbnail_url || 'https://via.placeholder.com/150',
          }}
          style={styles.thumbnailImage}
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  };

  // Ensure key extractor never fails
  const keyExtractor = (item, index) => {
    if (!item) return `video-missing-${index}`;
    return item.id ? `video-${item.id}` : `video-index-${index}`;
  };

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
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadProfileData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#00796B" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <View style={styles.profileSection}>
        {/* Profile Image */}
        <Image
          source={{
            uri:
              profile?.profile_photo_url || 'https://via.placeholder.com/100',
          }}
          style={styles.profileImage}
        />

        {/* Username */}
        <Text style={styles.username}>@{profile?.username || 'Unknown'}</Text>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {profile?.follower_count || 0}
            </Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{videos?.length || 0}</Text>
            <Text style={styles.statLabel}>Videos</Text>
          </View>
        </View>

        {/* Follow Button */}
        <TouchableOpacity
          style={[styles.followButton, isFollowing && styles.followingButton]}
          onPress={handleFollowToggle}>
          <Text
            style={[
              styles.followButtonText,
              isFollowing && styles.followingButtonText,
            ]}>
            {isFollowing ? 'Following' : 'Follow'}
          </Text>
        </TouchableOpacity>

        {/* Bio */}
        {profile?.bio ? (
          <Text style={styles.bio}>{profile.bio}</Text>
        ) : (
          <Text style={styles.noBio}>No bio provided</Text>
        )}
      </View>

      {/* Video Grid */}
      <View style={styles.videoSection}>
        <Text style={styles.sectionTitle}>Videos</Text>

        {videoLoading ? (
          <View style={styles.videoLoadingContainer}>
            <ActivityIndicator size="small" color="#00796B" />
            <Text style={styles.videoLoadingText}>Loading videos...</Text>
          </View>
        ) : videos && videos.length > 0 ? (
          <FlatList
            data={videos}
            renderItem={renderVideoItem}
            keyExtractor={keyExtractor}
            numColumns={numColumns}
            contentContainerStyle={styles.gridContainer}
          />
        ) : (
          <View style={styles.emptyVideosContainer}>
            <Text style={styles.emptyVideosText}>No videos found</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

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
    color: '#757575',
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
    color: '#D32F2F',
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#00796B',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E0E0E0',
    marginBottom: 12,
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00796B',
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    marginHorizontal: 24,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00796B',
  },
  statLabel: {
    fontSize: 14,
    color: '#757575',
  },
  followButton: {
    backgroundColor: '#00796B',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 16,
  },
  followingButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#00796B',
  },
  followButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  followingButtonText: {
    color: '#00796B',
  },
  bio: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    marginTop: 8,
  },
  noBio: {
    fontSize: 14,
    color: '#9E9E9E',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  videoSection: {
    flex: 1,
    padding: 16,
  },
  videoLoadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  videoLoadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#757575',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00796B',
    marginBottom: 12,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    width: itemWidth,
    height: itemWidth,
    padding: 2,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E0E0E0',
  },
  emptyVideosContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyVideosText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
  },
});

export default UserProfile;
