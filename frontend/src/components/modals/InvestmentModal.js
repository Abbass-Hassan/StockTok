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

  // Reset state when modal closes
  React.useEffect(() => {
    if (!visible) {
      setAmount('');
      setError(null);
    }
  }, [visible]);

  // Function to handle investment submission
  const handleSubmit = async () => {
    // Validate input
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Call the API to invest in the video
      const response = await investmentApi.investInVideo(videoId, amount);

      // Handle success
      setIsLoading(false);

      // Simple vibration feedback on success
      Vibration.vibrate(50);

      // Show success message
      Alert.alert(
        'Investment Successful',
        `You have successfully invested $${amount} in this video!`,
        [{text: 'OK'}],
      );

      // Call the success callback to update the UI
      if (onSuccess) {
        onSuccess(response.data.investment);
      }

      // Close the modal
      onClose();
    } catch (err) {
      setIsLoading(false);
      setError(err.message);

      // Simple vibration feedback on error
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
            {/* Header with close button */}
            <View style={styles.headerContainer}>
              <Text style={styles.headerText}>Like</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Icon name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            {/* Amount input section */}
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
              <TextInput
                style={styles.input}
                placeholder="e.g. 5.00"
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={setAmount}
                autoFocus={true}
                editable={!isLoading}
              />

              {/* Error message */}
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </View>

            {/* Submit button */}
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

            {/* Indicator line at bottom */}
            <View style={styles.indicatorLine} />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

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
  submitButton: {
    width: '100%',
    height: 55,
    backgroundColor: '#00796B',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonDisabled: {
    backgroundColor: '#7AB99A',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  indicatorLine: {
    width: 40,
    height: 4,
    backgroundColor: '#DEDEDE',
    borderRadius: 2,
    marginTop: 30,
  },
});

export default InvestmentModal;
