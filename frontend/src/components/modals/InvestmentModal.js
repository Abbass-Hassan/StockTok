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
                  <View style={styles.headerContainer}>
              <Text style={styles.headerText}>Like</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Icon name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Amount($)
                <TouchableOpacity
                  onPress={() =>
                    Alert.alert(
                      'Investment Info',
                      '25% of your investment goes directly to the creator, while 75% is invested in the video.',
                    )
                  }>
                  <Icon
                    name="information-circle-outline"
                    size={18}
                    color="#666"
                    style={{marginLeft: 5}}
                  />
                </TouchableOpacity>
              </Text>
