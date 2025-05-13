import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Platform,
} from 'react-native';
import {investmentApi} from '../../api/investmentApi';
import {getToken} from '../../utils/tokenStorage';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

const API_URL = 'http://13.37.224.245:8000/api';
const {width} = Dimensions.get('window');

const PortfolioScreen = ({navigation}) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [portfolio, setPortfolio] = useState(null);
  const [investments, setInvestments] = useState([]);
  const [creatorInvestments, setCreatorInvestments] = useState([]);

  // Test API connection
  const testApiConnection = async () => {
    try {
      const token = await getToken();
      console.log(
        'Token for test:',
        token ? `${token.substring(0, 10)}...` : 'No token',
      );

      // Test a simple GET request to the profile endpoint
      console.log('Making test API request to:', `${API_URL}/profile/me`);
      const testResponse = await axios.get(`${API_URL}/profile/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Test API connection successful:', testResponse.status);
      console.log(
        'Test response data:',
        JSON.stringify(testResponse.data).substring(0, 100),
      );
    } catch (error) {
      console.error('Test API connection failed:');
      console.error('Error message:', error.message);
      console.error('Status code:', error.response?.status);
      console.error('Response data:', error.response?.data);
      console.error('Request URL:', error.config?.url);
    }
  };

  // Fetch portfolio data
  const fetchPortfolioData = async () => {
    try {
      console.log('Starting portfolio data fetch...');
      setLoading(true);
      setError(null);

      // Get portfolio overview
      console.log('Fetching portfolio overview...');
      const overviewResponse = await investmentApi.getPortfolioOverview();
      console.log(
        'Portfolio overview response received:',
        JSON.stringify(overviewResponse).substring(0, 100),
      );

      // Get all investments
      console.log('Fetching investments...');
      const investmentsResponse = await investmentApi.getMyInvestments();
      console.log(
        'Investments response received:',
        JSON.stringify(investmentsResponse).substring(0, 100),
      );

      // Check if we have valid data with the correct nested structure
      if (
        overviewResponse?.status === 'success' &&
        overviewResponse?.data?.portfolio &&
        investmentsResponse?.status === 'success' &&
        investmentsResponse?.data?.investments
      ) {
        console.log('Both API calls returned valid data, updating state...');
        setPortfolio(overviewResponse.data.portfolio);
        setCreatorInvestments(
          overviewResponse.data.by_creator
            ? Object.values(overviewResponse.data.by_creator)
            : [],
        );
        setInvestments(investmentsResponse.data.investments.data || []);
        console.log('Portfolio data set in state successfully');
      } else {
        console.error('API calls did not return expected data structure:');
        console.error(
          'Overview response:',
          JSON.stringify(overviewResponse).substring(0, 100),
        );
        console.error(
          'Investments response:',
          JSON.stringify(investmentsResponse).substring(0, 100),
        );
        throw new Error(
          'Failed to fetch portfolio data: Invalid data structure',
        );
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching portfolio data:');
      console.error('Error name:', err.name);
      console.error('Error message:', err.message);
      console.error('Stack trace:', err.stack);

      setError(err.message || 'Failed to load portfolio data');
      setLoading(false);
    }
  };

  // Refresh portfolio data
  const onRefresh = async () => {
    console.log('Refreshing portfolio data...');
    setRefreshing(true);
    await fetchPortfolioData();
    setRefreshing(false);
  };

  // Load initial data
  useEffect(() => {
    console.log('PortfolioScreen useEffect triggered');
    testApiConnection();
    fetchPortfolioData();
  }, []);

  // Format currency
  const formatCurrency = amount => {
    return '$' + parseFloat(amount).toFixed(2);
  };

  // Format percentage
  const formatPercentage = percentage => {
    const value = parseFloat(percentage).toFixed(2);
    return value > 0 ? `+${value}%` : `${value}%`;
  };

  // Format date
  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // View investment details
  const viewInvestmentDetails = investmentId => {
    navigation.navigate('InvestmentDetails', {investmentId});
  };

  // Render investment item
  const renderInvestmentItem = ({item}) => {
    // Calculate return percentage
    const returnPercentage =
      ((item.current_value - item.amount) / item.amount) * 100;

    // Determine text color based on return
    const returnColor = returnPercentage >= 0 ? '#4CAF50' : '#F44336';

    return (
      <TouchableOpacity
        style={styles.investmentCard}
        onPress={() => viewInvestmentDetails(item.id)}>
        <View style={styles.investmentCardHeader}>
          <Image
            source={{
              uri:
                item.video?.thumbnail_url || 'https://via.placeholder.com/150',
            }}
            style={styles.videoThumbnail}
          />
          <View style={styles.investmentInfo}>
            <Text style={styles.creatorName} numberOfLines={1}>
              @{item.video?.user?.username || 'Unknown Creator'}
            </Text>
            <Text style={styles.videoTitle} numberOfLines={1}>
              {item.video?.caption || 'Video'}
            </Text>
            <Text style={styles.investmentDate}>
              {formatDate(item.created_at)}
            </Text>
          </View>
        </View>
        <View style={styles.investmentCardFooter}>
          <View style={styles.investmentMetric}>
            <Text style={styles.metricLabel}>Invested</Text>
            <Text style={styles.metricValue}>
              {formatCurrency(item.amount)}
            </Text>
          </View>
          <View style={styles.investmentMetric}>
            <Text style={styles.metricLabel}>Current</Text>
            <Text style={styles.metricValue}>
              {formatCurrency(item.current_value)}
            </Text>
          </View>
          <View style={styles.investmentMetric}>
            <Text style={styles.metricLabel}>Return</Text>
            <Text style={[styles.metricValue, {color: returnColor}]}>
              {formatPercentage(returnPercentage)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Render creator investment item for the distribution section
  const renderCreatorItem = ({item, index}) => {
    // Generate a color based on index
    const colors = [
      '#FF6384',
      '#36A2EB',
      '#FFCE56',
      '#4BC0C0',
      '#9966FF',
      '#FF9F40',
      '#C9CBCF',
      '#7AC142',
      '#F56642',
      '#41B5E6',
    ];
    const color = colors[index % colors.length];

    // Calculate percentage of total investment
    const percentage =
      portfolio?.total_invested > 0
        ? (item.total_invested / portfolio.total_invested) * 100
        : 0;

    return (
      <View style={styles.creatorItem}>
        <View style={styles.creatorItemHeader}>
          <View style={[styles.colorIndicator, {backgroundColor: color}]} />
          <Text style={styles.creatorName} numberOfLines={1}>
            {item.creator_name}
          </Text>
          <Text style={styles.creatorPercentage}>{percentage.toFixed(1)}%</Text>
        </View>
        <View style={styles.creatorItemDetails}>
          <View style={styles.creatorMetric}>
            <Text style={styles.smallMetricLabel}>Invested</Text>
            <Text style={styles.smallMetricValue}>
              {formatCurrency(item.total_invested)}
            </Text>
          </View>
          <View style={styles.creatorMetric}>
            <Text style={styles.smallMetricLabel}>Current</Text>
            <Text style={styles.smallMetricValue}>
              {formatCurrency(item.current_value)}
            </Text>
          </View>
          <View style={styles.creatorMetric}>
            <Text style={styles.smallMetricLabel}>Videos</Text>
            <Text style={styles.smallMetricValue}>{item.investment_count}</Text>
          </View>
        </View>
      </View>
    );
  };

  // Render loading state
  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7A67EE" />
          <Text style={styles.loadingText}>Loading portfolio data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={50} color="#F44336" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchPortfolioData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Render empty state
  if (!loading && portfolio && portfolio.investment_count === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.emptyContainer}>
          <Icon name="wallet-outline" size={70} color="#7A67EE" />
          <Text style={styles.emptyTitle}>No Investments Yet</Text>
          <Text style={styles.emptyText}>
            Start investing in videos to build your portfolio and earn returns.
          </Text>
          <TouchableOpacity
            style={styles.exploreButton}
            onPress={() => navigation.navigate('VideoFeed')}>
            <Text style={styles.exploreButtonText}>Explore Videos</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Render portfolio screen
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Investment Portfolio</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {/* Portfolio Summary Card */}
        {portfolio && (
          <View style={styles.summaryCard}>
            <Text style={styles.sectionTitle}>Portfolio Summary</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Total Invested</Text>
                <Text style={styles.summaryValue}>
                  {formatCurrency(portfolio.total_invested)}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Current Value</Text>
                <Text style={styles.summaryValue}>
                  {formatCurrency(portfolio.current_value)}
                </Text>
              </View>
            </View>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Total Return</Text>
                <Text
                  style={[
                    styles.summaryValue,
                    {
                      color:
                        portfolio.return_percentage >= 0
                          ? '#4CAF50'
                          : '#F44336',
                    },
                  ]}>
                  {formatPercentage(portfolio.return_percentage)}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Investments</Text>
                <Text style={styles.summaryValue}>
                  {portfolio.investment_count}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Creator Distribution Section */}
        {creatorInvestments && creatorInvestments.length > 0 && (
          <View style={styles.distributionSection}>
            <Text style={styles.sectionTitle}>Investment Distribution</Text>
            <FlatList
              data={creatorInvestments}
              renderItem={renderCreatorItem}
              keyExtractor={(item, index) => `creator-${index}`}
              horizontal={false}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Investments List Section */}
        {investments && investments.length > 0 && (
          <View style={styles.investmentsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Investments</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('AllInvestments')}>
                <Text style={styles.seeAllButton}>See All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={investments.slice(0, 5)}
              renderItem={renderInvestmentItem}
              keyExtractor={item => `investment-${item.id}`}
              scrollEnabled={false}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 8 : 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#14171A',
  },
  // Summary Card Styles
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#14171A',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#657786',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#14171A',
  },
  // Distribution Section Styles
  distributionSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  creatorItem: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
    paddingBottom: 12,
  },
  creatorItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  creatorName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#14171A',
    flex: 1,
  },
  creatorPercentage: {
    fontSize: 14,
    fontWeight: '500',
    color: '#657786',
  },
  creatorItemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  creatorMetric: {
    flex: 1,
  },
  smallMetricLabel: {
    fontSize: 12,
    color: '#657786',
    marginBottom: 2,
  },
  smallMetricValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#14171A',
  },
  // Investments Section Styles
  investmentsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllButton: {
    fontSize: 14,
    color: '#7A67EE',
    fontWeight: '500',
  },
  investmentCard: {
    borderWidth: 1,
    borderColor: '#E1E8ED',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  investmentCardHeader: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
    backgroundColor: '#F8F9FA',
  },
  videoThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 4,
    marginRight: 12,
  },
  investmentInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  videoTitle: {
    fontSize: 14,
    color: '#657786',
    marginBottom: 4,
  },
  investmentDate: {
    fontSize: 12,
    color: '#AAB8C2',
  },
  investmentCardFooter: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFFFFF',
  },
  investmentMetric: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: '#657786',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#14171A',
  },
  // Loading State Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#657786',
  },
  // Error State Styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    marginBottom: 20,
    fontSize: 16,
    color: '#657786',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#7A67EE',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Empty State Styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#14171A',
  },
  emptyText: {
    marginTop: 8,
    marginBottom: 24,
    fontSize: 16,
    color: '#657786',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 22,
  },
  exploreButton: {
    backgroundColor: '#7A67EE',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PortfolioScreen;
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  SafeAreaView,
  Dimensions,
  Platform,
} from 'react-native';
import {investmentApi} from '../../api/investmentApi';
import {getToken} from '../../utils/tokenStorage';
import Icon from 'react-native-vector-icons/Ionicons';
const API_URL = 'http://13.37.224.245:8000/api';
const {width} = Dimensions.get('window');
const InvestmentDetailsScreen = ({route, navigation}) => {
  const {investmentId} = route.params;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [investment, setInvestment] = useState(null);
  const [performance, setPerformance] = useState(null);
  const fetchInvestmentDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(`Fetching details for investment ID: ${investmentId}`);
      const response = await investmentApi.getInvestmentDetails(investmentId);
      if (response.status === 'success') {
        console.log('Setting investment data in state');
        setInvestment(response.data.investment);
        setPerformance(response.data.performance);
      } else {
        throw new Error('Failed to fetch investment details');
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching investment details:', err);
      setError(err.message || 'Failed to load investment details');
      setLoading(false);
    }
  };
  useEffect(() => {
    console.log('InvestmentDetailsScreen - Loading initial data');
    fetchInvestmentDetails();
  }, [investmentId]);
  const formatCurrency = amount => '$' + parseFloat(amount).toFixed(2);
  const formatPercentage = percentage => {
    const value = parseFloat(percentage).toFixed(2);
    return value > 0 ? `+${value}%` : `${value}%`;
  };
  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  const viewCreatorProfile = () => {
    if (investment && investment.video && investment.video.user) {
      navigation.navigate('UserProfile', {userId: investment.video.user.id});
    }
  };
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7A67EE" />
          <Text style={styles.loadingText}>Loading investment details...</Text>
        </View>
      </SafeAreaView>
    );
  }
