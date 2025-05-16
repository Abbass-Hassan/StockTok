import React, {useState} from 'react';
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
import {useFocusEffect} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import {getWalletDetails} from '../../api/walletApi';

const WalletOverview = ({navigation}) => {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      loadWalletData();
    }, []),
  );

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
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
          {/* Balance Card */}
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Current Balance</Text>
            <Text style={styles.balanceValue}>
              ${wallet?.balance?.toFixed(2) || '0.00'}
            </Text>
          </View>

          {/* Quick Actions */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('DepositFunds')}>
              <Icon
                name="add-circle-outline"
                size={24}
                color="#00796B"
                style={styles.actionIcon}
              />
              <Text style={styles.actionText}>Deposit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('WithdrawFunds')}>
              <Icon
                name="cash-outline"
                size={24}
                color="#00796B"
                style={styles.actionIcon}
              />
              <Text style={styles.actionText}>Withdraw</Text>
            </TouchableOpacity>
          </View>

          {/* Transaction History Button */}
          <TouchableOpacity
            style={styles.historyButton}
            onPress={() => navigation.navigate('TransactionHistory')}>
            <Icon
              name="receipt-outline"
              size={24}
              color="#00796B"
              style={styles.historyIcon}
            />
            <View style={styles.historyTextContainer}>
              <Text style={styles.historyText}>Transaction History</Text>
              <Text style={styles.historySubtext}>View all transactions</Text>
            </View>
            <Icon
              name="chevron-forward"
              size={24}
              color="#666666"
              style={styles.historyArrow}
            />
          </TouchableOpacity>

          {/* Wallet Info */}
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
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF0000',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#00796B',
    padding: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
    justifyContent: 'center',
  },
  backButton: {
    marginRight: 16,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
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
    marginLeft: 12,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#00796B',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212121',
  },
  activeStatus: {
    color: '#00796B',
  },
});

export default WalletOverview;
