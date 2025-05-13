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
