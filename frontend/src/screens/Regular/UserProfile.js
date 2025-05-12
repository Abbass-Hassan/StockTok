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
      const profileResponse = await getUserByUsername(username);
      if (!profileResponse || !profileResponse.profile) {
        setError('Could not load user profile');
        setLoading(false);
        return;
      }
      setProfile(profileResponse.profile);
      setLoading(false);
      if (profileResponse.profile.id) {
        try {
          const videosResponse = await getUserVideos(profileResponse.profile.id);
          let videosList = [];

          if (videosResponse?.videos?.data) {
            videosList = videosResponse.videos.data;
          } else if (videosResponse?.videos) {
            videosList = Array.isArray(videosResponse.videos)
              ? videosResponse.videos
              : videosResponse.videos.data || [];
          }

          setVideos(videosList);
        } catch (videoError) {
          setVideos([]);
        } finally {
          setVideoLoading(false);
        }
        try {
            const followResponse = await checkFollowingStatus(profileResponse.profile.id);
            setIsFollowing(followResponse?.is_following || false);
          } catch {
            setIsFollowing(false);
          }
        }    } catch (err) {
            console.error('Error loading profile:', err);
            setError('Failed to load profile. Please try again.');
            setLoading(false);
          }
        };
        const handleFollowToggle = async () => {
            try {
              if (isFollowing) {
                await unfollowUser(profile.id);
                setIsFollowing(false);
              } else {
                await followUser(profile.id);
                setIsFollowing(true);
              }
            } catch {
              Alert.alert('Error', 'Failed to update follow status. Please try again.');
            }
          };
          const renderVideoItem = ({item}) => {
            if (!item) return null;
        
            return (
              <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate('VideoPlayer', {video: item})}>
                <Image
                  source={{ uri: item.thumbnail_url || 'https://via.placeholder.com/150' }}
                  style={styles.thumbnailImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            );
          };
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
        