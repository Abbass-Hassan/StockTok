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
