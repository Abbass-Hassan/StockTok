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
          <View style={styles.earningsCard}>
            <Text style={styles.sectionTitle}>Earnings</Text>
            <View style={styles.earningsRow}>
              <Text style={styles.earningsLabel}>Total Earnings:</Text>
              <Text style={styles.earningsValue}>
                ${earnings?.earnings?.total_earnings?.toFixed(2) || '0.00'}
              </Text>
            </View>
            <View style={styles.earningsRow}>
              <Text style={styles.earningsLabel}>Creator Share:</Text>
              <Text style={styles.earningsValue}>
                ${earnings?.earnings?.creator_earnings?.toFixed(2) || '0.00'}
              </Text>
            </View>
          </View>
          <View style={styles.profitabilityCard}>
            <Text style={styles.sectionTitle}>Profitability</Text>
            <View style={styles.profitRow}>
              <Text style={styles.profitLabel}>Initial Investment:</Text>
              <Text style={styles.profitValue}>
                ${videoStats?.video?.initial_investment?.toFixed(2) || '0.00'}
              </Text>
            </View>
            <View style={styles.profitRow}>
              <Text style={styles.profitLabel}>Current Value:</Text>
              <Text style={styles.profitValue}>
                ${videoStats?.video?.current_value?.toFixed(2) || '0.00'}
              </Text>
            </View>
            <View style={styles.profitRow}>
              <Text style={styles.profitLabel}>ROI:</Text>
              <Text
                style={[
                  styles.profitValue,
                  videoStats?.profitability?.roi > 0
                    ? styles.positiveROI
                    : styles.negativeROI,
                ]}>
                {videoStats?.profitability?.roi?.toFixed(2) || '0.00'}%
              </Text>
            </View>
          </View>
          {earnings?.investments?.data?.length > 0 && (
            <View style={styles.investorsCard}>
              <Text style={styles.sectionTitle}>Top Investors</Text>
              {earnings.investments.data
                .slice(0, 5)
                .map((investment, index) => (
                  <View key={index} style={styles.investorRow}>
                    <Text style={styles.investorName}>
                      {investment.investor?.name || 'Anonymous'}
                    </Text>
                    <Text style={styles.investorAmount}>
                      ${investment.amount.toFixed(2)}
                    </Text>
                  </View>
                ))}
            </View>
          )}
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF0000',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#00796B',
    padding: 12,
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
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 16 : 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
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
  content: {
    flex: 1,
    padding: 16,
  },
  videoInfoCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
  },
  uploadDate: {
    fontSize: 14,
    color: '#666666',
  },
  metricsCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#00796B',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metricItem: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
  },
  metricLabel: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  earningsCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  earningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  earningsLabel: {
    fontSize: 16,
    color: '#666666',
  },
  earningsValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00796B',
  },
