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
          setCurrentBalance(response.data.wallet.balance);
          Alert.alert(
            'Success',
            `Deposited $${response.data.net_deposit.toFixed(
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
          <Text style={styles.headerTitle}>Deposit Funds</Text>
        </View>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
          <Text style={styles.infoText}>
            • A 5% processing fee applies
          </Text>
          <Text style={styles.infoText}>
            • Funds will be available immediately
          </Text>
        </View>
      </View>
    </ScrollView>
  </View>
</SafeAreaView>
