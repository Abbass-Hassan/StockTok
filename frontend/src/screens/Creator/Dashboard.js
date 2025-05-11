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
    