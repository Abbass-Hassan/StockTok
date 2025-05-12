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
        }
  