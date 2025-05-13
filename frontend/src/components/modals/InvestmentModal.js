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
              <TouchableOpacity
              style={[
                styles.submitButton,
                (!amount || isLoading) && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!amount || isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Submit</Text>
              )}
            </TouchableOpacity>
            <View style={styles.indicatorLine} />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
  const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '100%',
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
    position: 'relative',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    padding: 5,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    color: '#666',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 18,
    backgroundColor: '#f9f9f9',
  },
  errorText: {
    color: '#FF3B30',
    marginTop: 10,
    fontSize: 14,
  },
