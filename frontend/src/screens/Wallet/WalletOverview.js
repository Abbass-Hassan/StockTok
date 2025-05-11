import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {getWalletDetails} from '../../api/walletApi';
const WalletOverview = ({navigation}) => {
    const [wallet, setWallet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    useEffect(() => {
        loadWalletData();
      }, []);
      const loadWalletData = async () => {
        try {
          setError(null);
          const response = await getWalletDetails();
          setWallet(response.data.wallet);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      };
    
      const handleRefresh = () => {
        setRefreshing(true);
        loadWalletData();
      };
      if (loading) {
        return (
          <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4B7BEC" />
              <Text style={styles.loadingText}>Loading wallet...</Text>
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
              <TouchableOpacity style={styles.retryButton} onPress={loadWalletData}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        );
      }
      <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Wallet</Text>
        </View>
        <ScrollView
  style={styles.content}
  showsVerticalScrollIndicator={false}
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={handleRefresh}
      colors={['#4B7BEC']}
      tintColor="#4B7BEC"
    />
  }>
