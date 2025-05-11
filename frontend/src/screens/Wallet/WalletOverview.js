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
  <View style={styles.balanceCard}>
    <Text style={styles.balanceLabel}>Current Balance</Text>
    <Text style={styles.balanceValue}>
      ${wallet?.balance?.toFixed(2) || '0.00'}
    </Text>
  </View>
  <View style={styles.actionsContainer}>
    <TouchableOpacity
      style={styles.actionButton}
      onPress={() => navigation.navigate('DepositFunds')}>
      <Text style={styles.actionIcon}>➕</Text>
      <Text style={styles.actionText}>Deposit</Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={styles.actionButton}
      onPress={() => navigation.navigate('WithdrawFunds')}>
      <Text style={styles.actionIcon}>💸</Text>
      <Text style={styles.actionText}>Withdraw</Text>
    </TouchableOpacity>
  </View>
  <TouchableOpacity
  style={styles.historyButton}
  onPress={() => navigation.navigate('TransactionHistory')}>
  <Text style={styles.historyIcon}>📜</Text>
  <View style={styles.historyTextContainer}>
    <Text style={styles.historyText}>Transaction History</Text>
    <Text style={styles.historySubtext}>View all transactions</Text>
  </View>
  <Text style={styles.historyArrow}>›</Text>
</TouchableOpacity>
<View style={styles.infoCard}>
  <Text style={styles.infoTitle}>Wallet Information</Text>
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>Status:</Text>
    <Text style={[styles.infoValue, styles.activeStatus]}>
      Active
    </Text>
  </View>
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>Last Updated:</Text>
    <Text style={styles.infoValue}>
      {wallet?.last_updated
        ? new Date(wallet.last_updated).toLocaleDateString()
        : 'N/A'}
    </Text>
  </View>
</View>
safeArea: {
  flex: 1,
  backgroundColor: '#FFFFFF',
},
container: {
  flex: 1,
  backgroundColor: '#F5F5F5',
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
content: {
  flex: 1,
  padding: 16,
},
balanceCard: {
  backgroundColor: '#00796B',
  padding: 24,
  borderRadius: 16,
  marginBottom: 24,
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: {width: 0, height: 2},
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
},
balanceLabel: {
  fontSize: 16,
  color: 'rgba(255, 255, 255, 0.8)',
  marginBottom: 8,
},
balanceValue: {
  fontSize: 36,
  fontWeight: 'bold',
  color: '#FFFFFF',
},
actionsContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: 24,
},
actionButton: {
  flex: 1,
  paddingVertical: 16,
  borderRadius: 12,
  alignItems: 'center',
  marginHorizontal: 8,
  shadowColor: '#000',
  shadowOffset: {width: 0, height: 2},
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
  backgroundColor: '#FFFFFF',
},
actionIcon: {
  fontSize: 24,
  marginBottom: 4,
},
actionText: {
  fontSize: 16,
  fontWeight: '600',
  color: '#00796B',
},
historyButton: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#FFFFFF',
  padding: 16,
  borderRadius: 12,
  marginBottom: 16,
  shadowColor: '#000',
  shadowOffset: {width: 0, height: 2},
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
},
historyIcon: {
  fontSize: 24,
  marginRight: 12,
},
historyTextContainer: {
  flex: 1,
},
historyText: {
  fontSize: 16,
  fontWeight: '600',
  color: '#00796B',
},
historySubtext: {
  fontSize: 14,
  color: '#666666',
  marginTop: 2,
},
historyArrow: {
  fontSize: 24,
  color: '#666666',
},
