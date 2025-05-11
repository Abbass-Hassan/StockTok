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
      if (error) {
        return (
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Error: {error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={loadVideoData}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        );
      }
      return (
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.container}>
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}>
                <Text style={styles.backText}>‹</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Video Statistics</Text>
            </View>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.videoInfoCard}>
            <Text style={styles.videoTitle}>{video.caption}</Text>
            <Text style={styles.uploadDate}>
              Uploaded on {new Date(video.created_at).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.metricsCard}>
            <Text style={styles.sectionTitle}>Performance Metrics</Text>
            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>
                  {videoStats?.video?.view_count || 0}
                </Text>
                <Text style={styles.metricLabel}>Views</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>
                  {videoStats?.video?.like_investment_count || 0}
                </Text>
                <Text style={styles.metricLabel}>Investments</Text>
              </View>
            </View>
          </View>
