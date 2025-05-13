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
    const handleSubmit = async () => {
        if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
          setError('Please enter a valid amount');
          return;
        }
    
        setIsLoading(true);
        setError(null);
        try {
            const response = await investmentApi.investInVideo(videoId, amount);
            setIsLoading(false);
            Vibration.vibrate(50);
            Alert.alert(
              'Investment Successful',
              `You have successfully invested $${amount} in this video!`,
              [{text: 'OK'}],
            );
            if (onSuccess) {
              onSuccess(response.data.investment);
            }
            onClose();
        } catch (err) {
            setIsLoading(false);
            setError(err.message);
            Vibration.vibrate([0, 50, 50, 50]);
          }
        };
        return (
            <Modal
              animationType="slide"
              transparent={true}
              visible={visible}
              onRequestClose={onClose}>
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.centeredView}>
                  <View style={styles.modalView}>
        