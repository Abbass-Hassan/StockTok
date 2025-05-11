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
  