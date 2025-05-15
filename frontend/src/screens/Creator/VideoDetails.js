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
import Icon from 'react-native-vector-icons/Ionicons';

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

      // Debug logging to see the structure of the earnings data
      console.log(
        'Earnings data:',
        JSON.stringify(earningsResponse.data?.investments?.data),
      );
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Video Statistics</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Video Info */}
          <View style={styles.card}>
            <Text style={styles.videoTitle}>{video.caption}</Text>
            <Text style={styles.uploadDate}>
              Uploaded on {new Date(video.created_at).toLocaleDateString()}
            </Text>
          </View>

          {/* Performance Metrics - Only showing Investments */}
          <View style={styles.card}>
            <View style={styles.sectionTitleRow}>
              <Icon name="stats-chart" size={20} color="#00796B" />
              <Text style={styles.sectionTitle}>Performance Metrics</Text>
            </View>

            <View style={styles.singleMetricContainer}>
              <Text style={styles.metricValue}>
                {videoStats?.video?.like_investment_count || 0}
              </Text>
              <Text style={styles.metricLabel}>Investments</Text>
            </View>
          </View>

          {/* Earnings Info - Only Total Earnings */}
          <View style={styles.card}>
            <View style={styles.sectionTitleRow}>
              <Icon name="cash" size={20} color="#00796B" />
              <Text style={styles.sectionTitle}>Earnings</Text>
            </View>

            <View style={styles.dataRow}>
              <Text style={styles.rowLabel}>Total Earnings:</Text>
              <Text style={styles.rowValue}>
                ${earnings?.earnings?.total_earnings?.toFixed(2) || '0.00'}
              </Text>
            </View>
          </View>

          {/* Profitability Metrics - ROI removed */}
          <View style={styles.card}>
            <View style={styles.sectionTitleRow}>
              <Icon name="trending-up" size={20} color="#00796B" />
              <Text style={styles.sectionTitle}>Profitability</Text>
            </View>

            <View style={styles.dataRow}>
              <Text style={styles.rowLabel}>Initial Investment:</Text>
              <Text style={styles.rowValue}>
                ${videoStats?.video?.initial_investment?.toFixed(2) || '0.00'}
              </Text>
            </View>

            <View style={styles.dataRow}>
              <Text style={styles.rowLabel}>Current Value:</Text>
              <Text style={styles.rowValue}>
                ${videoStats?.video?.current_value?.toFixed(2) || '0.00'}
              </Text>
            </View>

            {/* ROI row removed as requested */}
          </View>

          {/* Top Investors */}
          {earnings?.investments?.data?.length > 0 && (
            <View style={styles.card}>
              <View style={styles.sectionTitleRow}>
                <Icon name="trophy" size={20} color="#00796B" />
                <Text style={styles.sectionTitle}>Top Investors</Text>
              </View>

              {earnings.investments.data
                .slice(0, 5)
                .map((investment, index) => {
                  // Check all possible places where username might be stored
                  const username =
                    investment.investor?.username ||
                    investment.investor?.name ||
                    (investment.user?.username
                      ? `@${investment.user.username}`
                      : null) ||
                    (investment.username ? `@${investment.username}` : null) ||
                    'Anonymous';

                  return (
                    <View key={index} style={styles.dataRow}>
                      <Text style={styles.rowLabel}>{username}</Text>
                      <Text style={styles.rowValue}>
                        ${investment.amount.toFixed(2)}
                      </Text>
                    </View>
                  );
                })}
            </View>
          )}
        </ScrollView>
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
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
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
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#00796B',
    marginLeft: 8,
  },
  singleMetricContainer: {
    alignItems: 'center',
    padding: 10,
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
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  rowLabel: {
    fontSize: 16,
    color: '#666666',
  },
  rowValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00796B',
  },
  // Kept positiveROI and negativeROI styles in case you need them elsewhere
  positiveROI: {
    color: '#4CAF50',
  },
  negativeROI: {
    color: '#F44336',
  },
});

export default VideoDetails;
