import React, {useState} from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

const CustomTextInput = ({
  placeholder,
  value,
  onChangeText,
  keyboardType = 'default',
  secureTextEntry = false,
  autoCapitalize = 'none',
  error = '',
  onBlur = () => {},
  testID = '',
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // Only apply secureTextEntry if it's a password field and not explicitly showing password
  const inputSecureTextEntry = secureTextEntry && !isPasswordVisible;

  // Determine if this is a password field
  const isPasswordField = secureTextEntry;

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.inputContainer,
          error ? styles.inputContainerError : null,
        ]}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          secureTextEntry={inputSecureTextEntry}
          autoCapitalize={autoCapitalize}
          onBlur={onBlur}
          testID={testID}
        />
        {isPasswordField && (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={styles.visibilityButton}
            testID={`${testID}-visibility-toggle`}>
            <Text style={styles.visibilityButtonText}>
              {isPasswordVisible ? 'Hide' : 'Show'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  inputContainer: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  inputContainerError: {
    borderColor: '#FF3B30',
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#333333',
  },
  visibilityButton: {
    padding: 8,
  },
  visibilityButtonText: {
    color: '#00796B',
    fontSize: 14,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default CustomTextInput;
