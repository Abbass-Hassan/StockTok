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
      const renderTransaction = ({item}) => {
        const type = item?.transaction_type || 'unknown';
        const amount = item?.amount || 0;
        const createdAt = item?.created_at || new Date().toISOString();
    
        const amountDisplay = `$${Math.abs(amount).toFixed(2)}`;
        const displayPrefix =
          type === 'deposit' ||
          type === 'creator_earning' ||
          type === 'investment_return'
            ? '+'
            : '-';
    
        return (
          <View style={styles.transactionItem}>
            <View style={styles.transactionLeft}>
              <Text style={styles.transactionIcon}>{getTransactionIcon(type)}</Text>
              <View style={styles.transactionDetails}>
                <Text style={styles.transactionType}>
                  {getTransactionTypeDisplay(type)}
                </Text>
                <Text style={styles.transactionDate}>
                  {new Date(createdAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
            <Text style={styles.transactionAmount}>
              {displayPrefix}
              {amountDisplay}
            </Text>
          </View>
        );
      };
      if (loading) {
        return (
          <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#00796B" />
              <Text style={styles.loadingText}>Loading transactions...</Text>
            </View>
          </SafeAreaView>
        );
      }
      if (error) {
        return (
          <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Error: {error}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={loadTransactions}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        );
      }
    