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
  