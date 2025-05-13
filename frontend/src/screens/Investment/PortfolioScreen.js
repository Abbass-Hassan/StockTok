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
  const testApiConnection = async () => {
    try {
      const token = await getToken();
      console.log(
        'Token for test:',
        token ? `${token.substring(0, 10)}...` : 'No token',
      );

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
  const fetchPortfolioData = async () => {
    try {
      console.log('Starting portfolio data fetch...');
      setLoading(true);
      setError(null);
      console.log('Fetching portfolio overview...');
      const overviewResponse = await investmentApi.getPortfolioOverview();

      console.log('Fetching investments...');
      const investmentsResponse = await investmentApi.getMyInvestments();
      if (
        overviewResponse?.status === 'success' &&
        overviewResponse?.data?.portfolio &&
        investmentsResponse?.status === 'success' &&
        investmentsResponse?.data?.investments
      ) {
        setPortfolio(overviewResponse.data.portfolio);
        setCreatorInvestments(
          overviewResponse.data.by_creator
            ? Object.values(overviewResponse.data.by_creator)
            : [],
        );
        setInvestments(investmentsResponse.data.investments.data || []);
      } else {
        throw new Error(
          'Failed to fetch portfolio data: Invalid data structure',
        );
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching portfolio data:');
      setError(err.message || 'Failed to load portfolio data');
      setLoading(false);
    }
  };
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPortfolioData();
    setRefreshing(false);
  };
  useEffect(() => {
    testApiConnection();
    fetchPortfolioData();
  }, []);
  const formatCurrency = amount => '$' + parseFloat(amount).toFixed(2);

  const formatPercentage = percentage => {
    const value = parseFloat(percentage).toFixed(2);
    return value > 0 ? `+${value}%` : `${value}%`;
  };

  const formatDate = dateString =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    const viewInvestmentDetails = investmentId => {
      navigation.navigate('InvestmentDetails', {investmentId});
    };
    const renderInvestmentItem = ({item}) => {
      const returnPercentage =
        ((item.current_value - item.amount) / item.amount) * 100;
      const returnColor = returnPercentage >= 0 ? '#4CAF50' : '#F44336';
      
      return (
        <TouchableOpacity
          style={styles.investmentCard}
          onPress={() => viewInvestmentDetails(item.id)}>
          {/* header */}
          {/* footer */}
        </TouchableOpacity>
      );
    };
    const renderCreatorItem = ({item, index}) => {
      const colors = [/* palette */];
      const color = colors[index % colors.length];
      const percentage = portfolio?.total_invested
        ? (item.total_invested / portfolio.total_invested) * 100
        : 0;
  
      return (
        <View style={styles.creatorItem}>
          {/* details */}
        </View>
      );
    };
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
  const testApiConnection = async () => {
    try {
      const token = await getToken();
      console.log(
        'Token for test:',
        token ? `${token.substring(0, 10)}...` : 'No token',
      );

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
  const fetchPortfolioData = async () => {
    try {
      console.log('Starting portfolio data fetch...');
      setLoading(true);{portfolio && (
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
      
      setError(null);
