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
      const formatCurrency = value => `$${(value || 0).toFixed(2)}`;

  const formatNumber = num => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };
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
      datasets: [{data, strokeWidth: 2}],
    };
  };
  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 121, 107, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {borderRadius: 16},
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
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
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
                  {formatCurrency(earnings?.summary?.total_earnings || 0)}
                </Text>
              </View>
            </View>
          </View>
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
                  {formatNumber(stats?.total_views || 0)}
                </Text>
                <Text style={styles.statLabel}>Total Views</Text>
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
          <View style={styles.engagementCard}>
            <Text style={styles.sectionTitle}>Engagement</Text>
            <View style={styles.engagementRow}>
              <View style={styles.engagementItem}>
                <Text style={styles.engagementLabel}>Avg Views per Video</Text>
                <Text style={styles.engagementValue}>
                  {formatNumber(stats?.average_views_per_video || 0)}
                </Text>
              </View>
              <View style={styles.engagementItem}>
                <Text style={styles.engagementLabel}>Engagement Rate</Text>
                <Text style={styles.engagementValue}>
                  {stats?.engagement_rate || 0}%
                </Text>
              </View>
            </View>
          </View>
