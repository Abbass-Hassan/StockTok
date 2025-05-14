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

const API_URL = 'http://35.181.171.137:8000/api';
const {width} = Dimensions.get('window');

const InvestmentDetailsScreen = ({route, navigation}) => {
  const {investmentId} = route.params;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [investment, setInvestment] = useState(null);
  const [performance, setPerformance] = useState(null);

  // Fetch investment details
  const fetchInvestmentDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(`Fetching details for investment ID: ${investmentId}`);
      const response = await investmentApi.getInvestmentDetails(investmentId);

      console.log(
        'Investment details response received:',
        JSON.stringify(response).substring(0, 100),
      );
      console.log('Response status:', response.status);
      console.log('Response data structure:', Object.keys(response.data || {}));

      // Changed from response.success to response.status === 'success'
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

  // Load initial data
  useEffect(() => {
    console.log('InvestmentDetailsScreen - Loading initial data');
    fetchInvestmentDetails();
  }, [investmentId]);

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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Navigate to creator profile
  const viewCreatorProfile = () => {
    if (investment && investment.video && investment.video.user) {
      navigation.navigate('UserProfile', {userId: investment.video.user.id});
    }
  };

  // Render loading state
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
      <SafeAreaView style={styles.container}>
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
        <Text style={styles.headerTitle}>Investment Details</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}>
        {/* Video and Creator Info */}
        <View style={styles.videoCard}>
          <Image
            source={{
              uri:
                investment.video?.thumbnail_url ||
                'https://via.placeholder.com/150',
            }}
            style={styles.videoThumbnail}
          />
          <View style={styles.videoInfo}>
            <Text style={styles.videoTitle} numberOfLines={2}>
              {investment.video?.caption || 'Video'}
            </Text>
            <TouchableOpacity onPress={viewCreatorProfile}>
              <Text style={styles.creatorName}>
                @{investment.video?.user?.username || 'Unknown Creator'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Investment Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Investment Summary</Text>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Investment Date</Text>
            <Text style={styles.summaryValue}>
              {formatDate(investment.created_at)}
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
              {formatCurrency(
                Math.abs(
                  performance.current_value - performance.original_amount,
                ),
              )}
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
              color="#7A67EE"
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
              color="#7A67EE"
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
              color="#7A67EE"
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
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
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
  },
  videoThumbnail: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 16,
  },
  videoInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#14171A',
    marginBottom: 4,
  },
  creatorName: {
    fontSize: 14,
    color: '#7A67EE',
    marginBottom: 12,
  },
  watchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7A67EE',
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
});

export default InvestmentDetailsScreen;
