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
