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
    