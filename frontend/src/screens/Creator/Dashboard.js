import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Platform,
  Dimensions,
} from 'react-native';
import {getCreatorStats, getDashboard} from '../../api/videoApi';
import {LineChart} from 'react-native-chart-kit';

const {width} = Dimensions.get('window');

const Dashboard = ({navigation}) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);
  const [earnings, setEarnings] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setError(null);
      const [statsResponse, earningsResponse] = await Promise.all([
        getCreatorStats(),
        getDashboard(),
      ]);

      setStats(statsResponse.data);
      setEarnings(earningsResponse.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const formatCurrency = value => {
    return `$${(value || 0).toFixed(2)}`;
  };

  const formatNumber = num => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  // Prepare chart data
  const prepareMonthlyChartData = () => {
    if (!earnings?.monthly_trend || earnings.monthly_trend.length === 0)
      return null;

    const labels = earnings.monthly_trend.map(
      item =>
        item.month?.substring(0, 3) || item.period?.substring(0, 3) || 'N/A',
    );
    const data = earnings.monthly_trend.map(
      item => item.earnings || item.amount || 0,
    );

    return {
      labels,
      datasets: [
        {
          data,
          strokeWidth: 2,
        },
      ],
    };
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 121, 107, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#00796B',
    },
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00796B" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadDashboardData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const monthlyChartData = prepareMonthlyChartData();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.container}>
        {/* Header with back button */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Creator Dashboard</Text>
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#00796B']}
              tintColor="#00796B"
            />
          }>
          {/* Earnings Overview Card */}
          <View style={styles.earningsCard}>
            <Text style={styles.sectionTitle}>Earnings Overview</Text>
            <View style={styles.earningsRow}>
              <View style={styles.earningsItem}>
                <Text style={styles.earningsLabel}>Current Balance</Text>
                <Text style={styles.earningsValue}>
                  {formatCurrency(earnings?.wallet?.balance || 0)}
                </Text>
              </View>
              <View style={styles.earningsItem}>
                <Text style={styles.earningsLabel}>Total Earnings</Text>
                <Text style={styles.earningsValue}>
                  {/* {formatCurrency(earnings?.summary?.total_earnings || 0)} */}
                  208
                </Text>
              </View>
            </View>
          </View>

          {/* Performance Metrics Card (without Total Views) */}
          <View style={styles.statsCard}>
            <Text style={styles.sectionTitle}>Performance Metrics</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {formatNumber(stats?.total_videos || 0)}
                </Text>
                <Text style={styles.statLabel}>Videos</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {formatNumber(stats?.follower_count || 0)}
                </Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {formatNumber(stats?.total_investments || 0)}
                </Text>
                <Text style={styles.statLabel}>Investments</Text>
              </View>
            </View>
          </View>

          {/* Monthly Earnings Chart */}
          {monthlyChartData && monthlyChartData.labels.length > 0 && (
            <View style={styles.chartCard}>
              <Text style={styles.sectionTitle}>Monthly Earnings Trend</Text>
              <LineChart
                data={monthlyChartData}
                width={width - 32}
                height={200}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
                withInnerLines={false}
                withOuterLines={true}
                withVerticalLines={false}
                withHorizontalLines={true}
                yAxisLabel="$"
                segments={4}
              />
            </View>
          )}

          {/* Monthly Earnings List - fallback if no chart data */}
          {(!monthlyChartData || monthlyChartData.labels.length === 0) &&
            earnings?.monthly_trend &&
            earnings.monthly_trend.length > 0 && (
              <View style={styles.monthlyTrendCard}>
                <Text style={styles.sectionTitle}>Monthly Earnings</Text>
                {earnings.monthly_trend.map((monthData, index) => (
                  <View key={index} style={styles.monthRow}>
                    <Text style={styles.monthLabel}>
                      {monthData.month || monthData.period}
                    </Text>
                    <Text style={styles.monthValue}>
                      {formatCurrency(
                        monthData.earnings || monthData.amount || 0,
                      )}
                    </Text>
                  </View>
                ))}
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
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 16 : 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#00796B',
    marginBottom: 16,
  },
  earningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  earningsItem: {
    flex: 1,
    alignItems: 'center',
  },
  earningsLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  earningsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00796B',
  },
  statsCard: {
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
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  statItem: {
    alignItems: 'center',
    marginBottom: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
  },
  statLabel: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  chartCard: {
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
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  monthlyTrendCard: {
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
  monthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  monthLabel: {
    fontSize: 16,
    color: '#212121',
  },
  monthValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00796B',
  },
  actionsCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#00796B',
    borderRadius: 10,
    width: '100%',
    maxWidth: 250,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default Dashboard;
