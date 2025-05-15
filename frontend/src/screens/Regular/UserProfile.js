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
  Platform,
} from 'react-native';
import {
  getUserByUsername,
  getUserVideos,
  followUser,
  unfollowUser,
  checkFollowingStatus,
} from '../../api/userProfileApi';
import Icon from 'react-native-vector-icons/Ionicons';

const {width} = Dimensions.get('window');
const numColumns = 3;
const itemWidth = (width - 32) / numColumns; // Accounting for container padding

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

    // Replace image with a gray background and icon
    return (
      <TouchableOpacity
        style={styles.gridItem}
        onPress={() => {
          console.log('Video pressed:', item?.id);
          // Navigate to VideoFeedScreen instead of VideoPlayer
          navigation.navigate('VideoFeedScreen', {
            initialVideoId: item.id,
            username: profile?.username,
          });
        }}>
        <View style={styles.thumbnailContainer}>
          <Icon name="videocam" size={32} color="#FFFFFF" />
        </View>
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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.container}>
        {/* Header with white background and teal text */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>‹</Text>
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

        {/* Video Grid - Removed "Videos" title */}
        <View style={styles.videoSection}>
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
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyVideosContainer}>
              <Text style={styles.emptyVideosText}>No videos available</Text>
            </View>
          )}
        </View>
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
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E0E0E0',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#E0E0E0',
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00796B',
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 16,
    width: '80%',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00796B',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#757575',
  },
  followButton: {
    backgroundColor: '#00796B',
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 14,
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 1,
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
    textAlign: 'center',
  },
  followingButtonText: {
    color: '#00796B',
  },
  bio: {
    fontSize: 14,
    color: '#424242',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    maxWidth: '90%',
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
    paddingTop: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  videoLoadingContainer: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  videoLoadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#757575',
  },
  gridContainer: {
    paddingBottom: 16,
  },
  gridItem: {
    width: itemWidth,
    height: itemWidth,
    margin: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  thumbnailContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E0E0E0', // Light gray color for thumbnails
    justifyContent: 'center',
    alignItems: 'center',
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
    padding: 30,
  },
  emptyVideosText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
});

export default UserProfile;
