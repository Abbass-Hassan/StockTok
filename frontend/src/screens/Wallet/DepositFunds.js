import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {depositFunds, getWalletDetails} from '../../api/walletApi';

const DepositFunds = ({navigation}) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(null);
  const [loadingBalance, setLoadingBalance] = useState(true);

  useEffect(() => {
    loadWalletBalance();
  }, []);

  const loadWalletBalance = async () => {
    try {
      setLoadingBalance(true);
      const response = await getWalletDetails();
      setCurrentBalance(response.data.wallet.balance);
    } catch (error) {
      console.error('Error loading wallet balance:', error);
    } finally {
      setLoadingBalance(false);
    }
  };

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) < 10) {
      Alert.alert('Error', 'Minimum deposit amount is $10');
      return;
    }

    setLoading(true);
    try {
      const response = await depositFunds(parseFloat(amount));

      // Update the balance with the new balance
      setCurrentBalance(response.data.wallet.balance);

      Alert.alert(
        'Success',
        `Deposited $${response.data.net_deposit.toFixed(
          2,
        )} successfully!\nFee: $${response.data.fee.toFixed(2)}`,
        [
          {
            text: 'OK',
          },
        ],
      );

      // Clear the amount
      setAmount('');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Deposit Funds</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Current Balance */}
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Current Balance</Text>
            {loadingBalance ? (
              <ActivityIndicator size="small" color="#4B7BEC" />
            ) : (
              <Text style={styles.balanceValue}>
                ${currentBalance !== null ? currentBalance.toFixed(2) : '0.00'}
              </Text>
            )}
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Amount to Deposit</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                keyboardType="decimal-pad"
                maxLength={10}
              />
            </View>
            <Text style={styles.helperText}>Minimum deposit: $10.00</Text>

            <TouchableOpacity
              style={[styles.depositButton, loading && styles.disabledButton]}
              onPress={handleDeposit}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.depositButtonText}>Deposit</Text>
              )}
            </TouchableOpacity>

            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Deposit Information</Text>
              <Text style={styles.infoText}>
                • Deposits are processed instantly
              </Text>
              <Text style={styles.infoText}>• A 5% processing fee applies</Text>
              <Text style={styles.infoText}>
                • Funds will be available immediately
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
  balanceContainer: {
    backgroundColor: '#00796B',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  balanceValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  form: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '600',
    color: '#00796B',
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 20,
    color: '#212121',
  },
  helperText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 24,
  },
  depositButton: {
    backgroundColor: '#00796B',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  disabledButton: {
    opacity: 0.7,
  },
  depositButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  infoCard: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00796B',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default DepositFunds;
