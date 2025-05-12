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
