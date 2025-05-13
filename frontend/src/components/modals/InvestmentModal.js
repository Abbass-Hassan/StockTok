import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  Vibration,
} from 'react-native';
import investmentApi from '../../api/investmentApi';
import Icon from 'react-native-vector-icons/Ionicons';

const InvestmentModal = ({visible, videoId, onClose, onSuccess}) => {
    const [amount, setAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
  
    React.useEffect(() => {
      if (!visible) {
        setAmount('');
        setError(null);
      }
    }, [visible]);
  