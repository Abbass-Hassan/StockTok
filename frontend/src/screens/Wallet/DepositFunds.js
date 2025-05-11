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
    