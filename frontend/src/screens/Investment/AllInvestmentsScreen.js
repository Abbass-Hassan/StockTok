import React, {useState, useEffect, useCallback} from 'react';
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
  RefreshControl,
} from 'react-native';
import {investmentApi} from '../../api/investmentApi';
import Icon from 'react-native-vector-icons/Ionicons';

const ITEMS_PER_PAGE = 10;

export const formatCurrency = amount => {
  return '$' + parseFloat(amount).toFixed(2);
};

export const formatPercentage = percentage => {
  const value = parseFloat(percentage).toFixed(2);
  return value > 0 ? `+${value}%` : `${value}%`;
};

const formatDate = dateString => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const AllInvestmentsScreen = ({navigation}) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [investments, setInvestments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(true);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchInvestments(1, true);
    });

    return unsubscribe;
  }, [navigation]);

  const fetchInvestments = async (page = 1, refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else if (page === 1) {
        setLoading(true);
      }

      setError(null);

      console.log(`Fetching investments page ${page}, refresh: ${refresh}`);

      const response = await investmentApi.getMyInvestments(ITEMS_PER_PAGE);

      if (response?.status === 'success' && response?.data?.investments) {
        const newInvestments = response.data.investments.data || [];
        const isLastPage = !response.data.investments.next_page_url;

        if (page === 1 || refresh) {
          setInvestments(newInvestments);
        } else {
          setInvestments(prevInvestments => {
            const existingIds = new Set(prevInvestments.map(item => item.id));
            const uniqueNewInvestments = newInvestments.filter(
              newItem => !existingIds.has(newItem.id),
            );
            return [...prevInvestments, ...uniqueNewInvestments];
          });
        }

        setHasMorePages(!isLastPage);
        setCurrentPage(page);
      } else {
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

  const onRefresh = () => {
    fetchInvestments(1, true);
  };

  const loadMoreInvestments = () => {
    if (!loading && !refreshing && hasMorePages) {
      fetchInvestments(currentPage + 1);
    }
  };

  useEffect(() => {
    console.log('AllInvestmentsScreen - Loading initial data');
    fetchInvestments();
  }, []);

  const viewInvestmentDetails = investmentId => {
    navigation.navigate('InvestmentDetails', {investmentId});
  };

  const renderInvestmentItem = ({item}) => {
    const returnPercentage = item.return_percentage || 0;

    const returnColor = returnPercentage >= 0 ? '#4CAF50' : '#F44336';

    return (
      <TouchableOpacity
        style={styles.investmentCard}
        onPress={() => viewInvestmentDetails(item.id)}>
        <View style={styles.investmentCardHeader}>
          {item.video?.thumbnail_url ? (
            <Image
              source={{uri: item.video.thumbnail_url}}
              style={styles.videoThumbnail}
            />
          ) : (
            <View style={styles.placeholderContainer}>
              <Icon name="videocam" size={30} color="#FFFFFF" />
            </View>
          )}
          <View style={styles.investmentInfo}>
            <Text style={styles.creatorName} numberOfLines={1}>
              @
              {item.video?.user?.username ||
                item.video?.user?.name ||
                'Unknown Creator'}
            </Text>
            <Text style={styles.videoTitle} numberOfLines={1}>
              {item.video?.caption || 'Untitled Video'}
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

  const renderFooter = () => {
    if (!hasMorePages) return null;

    return (
      <View style={styles.footerContainer}>
        {loading && !refreshing ? (
          <ActivityIndicator size="small" color="#00796B" />
        ) : null}
      </View>
    );
  };

  if (loading && !refreshing && currentPage === 1) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00796B" />
          <Text style={styles.loadingText}>Loading investments...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !refreshing && investments.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
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

  if (!loading && !refreshing && investments.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>My Investments</Text>
          </View>
          <View style={styles.backButton} />
        </View>

        <View style={styles.emptyContainer}>
          <Icon name="wallet-outline" size={70} color="#00796B" />
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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>My Investments</Text>
        </View>
        <View style={styles.backButton} />
      </View>

      {refreshing && (
        <View style={styles.refreshIndicator}>
          <Text style={styles.refreshText}>Updating investment values...</Text>
        </View>
      )}

      <FlatList
        data={investments}
        renderItem={renderInvestmentItem}
        keyExtractor={(item, index) => `investment-${item.id}-${index}`}
        contentContainerStyle={styles.listContent}
        onRefresh={onRefresh}
        refreshing={refreshing}
        onEndReached={loadMoreInvestments}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    justifyContent: 'space-between',
  },
  backButton: {
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
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#00796B',
    textAlign: 'center',
  },
  refreshIndicator: {
    backgroundColor: 'rgba(0, 121, 107, 0.1)',
    padding: 8,
    alignItems: 'center',
  },
  refreshText: {
    color: '#00796B',
    fontSize: 14,
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
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
    borderWidth: 1,
    borderColor: '#E1E8ED',
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
    borderRadius: 8,
    marginRight: 12,
  },
  placeholderContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#CCCCCC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  investmentInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  creatorName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#00796B',
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
    backgroundColor: '#00796B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
    marginBottom: 8,
  },
  emptyText: {
    marginBottom: 24,
    fontSize: 16,
    color: '#657786',
    textAlign: 'center',
    paddingHorizontal: 24,
    lineHeight: 22,
  },
  exploreButton: {
    backgroundColor: '#00796B',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AllInvestmentsScreen;
