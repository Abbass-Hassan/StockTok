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
import {withdrawFunds, getWalletDetails} from '../../api/walletApi';
const WithdrawFunds = ({navigation}) => {
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
    
      const handleWithdraw = async () => {
        if (!amount || parseFloat(amount) < 10) {
          Alert.alert('Error', 'Minimum withdrawal amount is $10');
          return;
        }
    
        if (currentBalance < parseFloat(amount)) {
          Alert.alert('Error', 'Insufficient funds');
          return;
        }
    
        setLoading(true);
        try {
          const response = await withdrawFunds(parseFloat(amount));
    
          setCurrentBalance(response.data.wallet.balance);
    
          Alert.alert(
            'Success',
            `Withdrew $${response.data.net_withdrawal.toFixed(
              2,
            )} successfully!\nFee: $${response.data.fee.toFixed(2)}`,
            [{text: 'OK'}],
          );
    
          setAmount('');
        } catch (error) {
          Alert.alert('Error', error.message);
        } finally {
          setLoading(false);
        }
      };
      <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Withdraw Funds</Text>
        </View>
        <View style={styles.balanceContainer}>
  <Text style={styles.balanceLabel}>Available Balance</Text>
  {loadingBalance ? (
    <ActivityIndicator size="small" color="#FFFFFF" />
  ) : (
    <Text style={styles.balanceValue}>
      ${currentBalance !== null ? currentBalance.toFixed(2) : '0.00'}
    </Text>
  )}
</View>
<View style={styles.form}>
  <Text style={styles.label}>Amount to Withdraw</Text>
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
  <Text style={styles.helperText}>Minimum withdrawal: $10.00</Text>
  <TouchableOpacity
    style={[styles.withdrawButton, loading && styles.disabledButton]}
    onPress={handleWithdraw}
    disabled={loading}>
    {loading ? (
      <ActivityIndicator color="#FFFFFF" />
    ) : (
      <Text style={styles.withdrawButtonText}>Withdraw</Text>
    )}
  </TouchableOpacity>

  <View style={styles.infoCard}>
    <Text style={styles.infoTitle}>Withdrawal Information</Text>
    <Text style={styles.infoText}>
      • Withdrawals are processed within 1-3 business days
    </Text>
    <Text style={styles.infoText}>• A 5% processing fee applies</Text>
    <Text style={styles.infoText}>
      • Funds will be sent to your registered bank account
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
