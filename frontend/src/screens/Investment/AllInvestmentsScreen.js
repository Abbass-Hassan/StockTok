import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StatusBar,
  SafeAreaView,
  Platform,
} from 'react-native';
import {investmentApi} from '../../api/investmentApi';
import {getToken} from '../../utils/tokenStorage';
import Icon from 'react-native-vector-icons/Ionicons';

const API_URL = 'http://13.37.224.245:8000/api';
const ITEMS_PER_PAGE = 10; // Set a consistent items per page

const AllInvestmentsScreen = ({navigation}) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [investments, setInvestments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(true);

  // Fetch investments
  const fetchInvestments = async (page = 1, refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else if (page === 1) {
        setLoading(true);
      }

      setError(null);

      console.log(`Fetching investments page ${page}, refresh: ${refresh}`);

      // Use the api function to get investments
      const response = await investmentApi.getMyInvestments(ITEMS_PER_PAGE);

      console.log(
        'Investments response received:',
        JSON.stringify(response).substring(0, 100),
      );

      // Check for the correct nested structure with status property
      if (response?.status === 'success' && response?.data?.investments) {
        const newInvestments = response.data.investments.data || [];
        const isLastPage = !response.data.investments.next_page_url;

        console.log(
          `Got ${newInvestments.length} investments, isLastPage: ${isLastPage}`,
        );

        if (page === 1 || refresh) {
          setInvestments(newInvestments);
        } else {
          // Add new investments while preventing duplicates based on ID
          setInvestments(prevInvestments => {
            // Get existing IDs
            const existingIds = new Set(prevInvestments.map(item => item.id));

            // Filter out investments that are already in the list
            const uniqueNewInvestments = newInvestments.filter(
              newItem => !existingIds.has(newItem.id),
            );

            return [...prevInvestments, ...uniqueNewInvestments];
          });
        }

        setHasMorePages(!isLastPage);
        setCurrentPage(page);
      } else {
        console.error(
          'Invalid data structure in investments response:',
          response,
        );
        throw new Error('Failed to fetch investments: Invalid data structure');
      }

      if (refresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error('Error fetching investments:', err);
      setError(err.message || 'Failed to load investments');
      if (refresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  // Refresh investments
  const onRefresh = () => {
    fetchInvestments(1, true);
  };

  // Load more investments when reaching the end of the list
  const loadMoreInvestments = () => {
    if (!loading && !refreshing && hasMorePages) {
      fetchInvestments(currentPage + 1);
    }
  };

  // Load initial data
  useEffect(() => {
    console.log('AllInvestmentsScreen - Loading initial data');
    fetchInvestments();
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

  // Render list footer (loading indicator when loading more data)
  const renderFooter = () => {
    if (!hasMorePages) return null;

    return (
      <View style={styles.footerContainer}>
        {loading && !refreshing ? (
          <ActivityIndicator size="small" color="#7A67EE" />
        ) : null}
      </View>
    );
  };

  // Render loading state
  if (loading && !refreshing && currentPage === 1) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7A67EE" />
          <Text style={styles.loadingText}>Loading investments...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render error state
  if (error && !refreshing && investments.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={50} color="#F44336" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchInvestments()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Render empty state
  if (!loading && !refreshing && investments.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#14171A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Investments</Text>
          <View style={styles.headerRight} />
        </View>
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#14171A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Investments</Text>
        <View style={styles.headerRight} />
      </View>

      <FlatList
        data={investments}
        renderItem={renderInvestmentItem}
        keyExtractor={(item, index) => `investment-${item.id}-${index}`} // Add index to ensure uniqueness
        contentContainerStyle={styles.listContent}
        onRefresh={onRefresh}
        refreshing={refreshing}
        onEndReached={loadMoreInvestments}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 8 : 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#14171A',
  },
  headerRight: {
    width: 24, // to balance the back button
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
  // Investment Card Styles
  investmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
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
  creatorName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#7A67EE',
    marginBottom: 2,
  },
  videoTitle: {
    fontSize: 14,
    color: '#14171A',
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
  footerContainer: {
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
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

export default AllInvestmentsScreen;
