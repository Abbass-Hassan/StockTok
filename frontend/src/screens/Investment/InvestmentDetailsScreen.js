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
  RefreshControl,
} from 'react-native';
import {investmentApi} from '../../api/investmentApi';
import Icon from 'react-native-vector-icons/Ionicons';

const {width} = Dimensions.get('window');

// Utility functions for consistent formatting
const formatCurrency = amount => {
  return '$' + parseFloat(amount).toFixed(2);
};

const formatPercentage = percentage => {
  const value = parseFloat(percentage).toFixed(2);
  return value > 0 ? `+${value}%` : `${value}%`;
};

// Format date with time
const formatDetailedDate = dateString => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const InvestmentDetailsScreen = ({route, navigation}) => {
  const {investmentId} = route.params;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [investment, setInvestment] = useState(null);
  const [performance, setPerformance] = useState(null);

  // Force refresh when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchInvestmentDetails();
    });

    return unsubscribe;
  }, [navigation]);

  // Fetch investment details
  const fetchInvestmentDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(`Fetching details for investment ID: ${investmentId}`);
      const response = await investmentApi.getInvestmentDetails(investmentId);

      console.log(
        'Investment details response received:',
        JSON.stringify(response).substring(0, 500),
      );

      if (response.status === 'success') {
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

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInvestmentDetails();
    setRefreshing(false);
  };

  // Load initial data
  useEffect(() => {
    console.log('InvestmentDetailsScreen - Loading initial data');
    fetchInvestmentDetails();
  }, [investmentId]);

  // Navigate to creator profile
  const viewCreatorProfile = () => {
    if (investment && investment.video && investment.video.user_id) {
      navigation.navigate('UserProfile', {userId: investment.video.user_id});
    }
  };

  // Get creator name
  const getCreatorName = () => {
    return `@${
      investment.video?.user?.username ||
      investment.video?.user?.name ||
      'Unknown Creator'
    }`;
  };

  // Render loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00796B" />
          <Text style={styles.loadingText}>Loading investment details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render error state
  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={50} color="#F44336" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchInvestmentDetails}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // If investment data is not available
  if (!investment || !performance) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={50} color="#F44336" />
          <Text style={styles.errorText}>Investment not found</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Determine return status and color
  const isPositiveReturn = parseFloat(performance.return_percentage) >= 0;
  const returnColor = isPositiveReturn ? '#4CAF50' : '#F44336';
  const returnIcon = isPositiveReturn ? 'trending-up' : 'trending-down';

  // Calculate profit/loss amount
  const profitLossAmount = Math.abs(
    performance.current_value - performance.original_amount,
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header with consistent styling */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Investment Details</Text>
      </View>

      {refreshing && (
        <View style={styles.refreshIndicator}>
          <Text style={styles.refreshText}>Updating investment values...</Text>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#00796B']}
            tintColor="#00796B"
          />
        }>
        {/* Video and Creator Info */}
        <View style={styles.videoCard}>
          {investment.video?.thumbnail_url ? (
            <Image
              source={{uri: investment.video.thumbnail_url}}
              style={styles.videoThumbnail}
            />
          ) : (
            <View style={styles.placeholderContainer}>
              <Icon name="videocam" size={40} color="#FFFFFF" />
            </View>
          )}
          <View style={styles.videoInfo}>
            <View style={styles.textContainer}>
              <Text style={styles.videoTitle} numberOfLines={2}>
                {investment.video?.caption || 'Video'}
              </Text>
              <TouchableOpacity onPress={viewCreatorProfile}>
                <Text style={styles.creatorName}>{getCreatorName()}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Investment Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Investment Summary</Text>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Investment Date</Text>
            <Text style={styles.summaryValue}>
              {formatDetailedDate(investment.created_at)}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Original Investment</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(performance.original_amount)}
              </Text>
            </View>
            <Icon name="arrow-forward" size={20} color="#AAB8C2" />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Current Value</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(performance.current_value)}
              </Text>
            </View>
          </View>
          <View style={styles.returnSummary}>
            <View style={[styles.returnBadge, {backgroundColor: returnColor}]}>
              <Icon name={returnIcon} size={16} color="#FFFFFF" />
              <Text style={styles.returnBadgeText}>
                {formatPercentage(performance.return_percentage)}
              </Text>
            </View>
            <Text style={styles.returnText}>
              {isPositiveReturn ? 'Profit' : 'Loss'}:{' '}
              {formatCurrency(profitLossAmount)}
            </Text>
          </View>
        </View>

        {/* Investment Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Investment Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Investment ID</Text>
            <Text style={styles.detailValue}>#{investment.id}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
                {investment.status === 'active' ? 'Active' : investment.status}
              </Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Video ID</Text>
            <Text style={styles.detailValue}>#{investment.video_id}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Ownership Percentage</Text>
            <Text style={styles.detailValue}>
              {(
                (performance.original_amount / investment.video.current_value) *
                100
              ).toFixed(4)}
              %
            </Text>
          </View>
        </View>

        {/* How Investments Work */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>How Investments Work</Text>
          <View style={styles.infoItem}>
            <Icon
              name="information-circle-outline"
              size={20}
              color="#00796B"
              style={styles.infoIcon}
            />
            <Text style={styles.infoText}>
              25% of your investment goes directly to the creator, while 75% is
              invested in the video.
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Icon
              name="trending-up"
              size={20}
              color="#00796B"
              style={styles.infoIcon}
            />
            <Text style={styles.infoText}>
              As more people invest in this video, your investment will grow in
              value proportionally.
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Icon
              name="wallet-outline"
              size={20}
              color="#00796B"
              style={styles.infoIcon}
            />
            <Text style={styles.infoText}>
              You can see the current value of your investment on this page,
              which is updated in real-time.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
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
  refreshIndicator: {
    backgroundColor: 'rgba(0, 121, 107, 0.1)',
    padding: 8,
    alignItems: 'center',
  },
  refreshText: {
    color: '#00796B',
    fontSize: 14,
  },
  // Video Card Styles
  videoCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  videoThumbnail: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 16,
  },
  placeholderContainer: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 16,
    backgroundColor: '#CCCCCC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#14171A',
    marginBottom: 8,
  },
  creatorName: {
    fontSize: 14,
    color: '#00796B',
  },
  watchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00796B',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  watchButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
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
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#14171A',
    marginBottom: 16,
  },
  summaryItem: {
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#657786',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#14171A',
  },
  divider: {
    height: 1,
    backgroundColor: '#E1E8ED',
    marginVertical: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  returnSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
  },
  returnBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginRight: 8,
  },
  returnBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  returnText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#14171A',
  },
  // Details Card Styles
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  detailLabel: {
    fontSize: 14,
    color: '#657786',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#14171A',
  },
  statusBadge: {
    backgroundColor: '#4CAF50',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  // Info Card Styles
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#657786',
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
});

export default InvestmentDetailsScreen;
