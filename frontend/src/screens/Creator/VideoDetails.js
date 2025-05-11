import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {getVideoDetails, getVideoEarnings} from '../../api/videoApi';
const VideoDetails = ({route, navigation}) => {
    const {video} = route.params;
    const [loading, setLoading] = useState(true);
    const [videoStats, setVideoStats] = useState(null);
    const [earnings, setEarnings] = useState(null);
    const [error, setError] = useState(null);
    useEffect(() => {
        loadVideoData();
      }, []);
      const loadVideoData = async () => {
        try {
          const [statsResponse, earningsResponse] = await Promise.all([
            getVideoDetails(video.id),
            getVideoEarnings(video.id),
          ]);
    
          setVideoStats(statsResponse.data);
          setEarnings(earningsResponse.data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      if (loading) {
        return (
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#00796B" />
              <Text style={styles.loadingText}>Loading stats...</Text>
            </View>
          </SafeAreaView>
        );
      }
    