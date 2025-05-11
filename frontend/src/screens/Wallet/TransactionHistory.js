import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {getTransactionHistory} from '../../api/walletApi';
const TransactionHistory = ({navigation}) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    useEffect(() => {
        loadTransactions();
      }, []);
      const loadTransactions = async () => {
        try {
          setError(null);
          const response = await getTransactionHistory(20);
          setTransactions(response.data.transactions.data || []);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      };
    
      const handleRefresh = () => {
        setRefreshing(true);
        loadTransactions();
      };
      const getTransactionIcon = type => {
        switch (type) {
          case 'deposit':
            return '⬇️';
          case 'withdrawal':
            return '⬆️';
          case 'investment':
          case 'like_investment':
            return '💼';
          case 'creator_earning':
          case 'investment_return':
            return '💰';
          default:
            return '📄';
        }
      };
      const getTransactionTypeDisplay = type => {
        switch (type) {
          case 'deposit':
            return 'Deposit';
          case 'withdrawal':
            return 'Withdrawal';
          case 'like_investment':
            return 'Investment';
          case 'investment_return':
            return 'Return';
          case 'creator_earning':
            return 'Earning';
          default:
            return type
              ? type.charAt(0).toUpperCase() + type.slice(1)
              : 'Transaction';
        }
      };
    