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
    