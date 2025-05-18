import React, {useState, forwardRef} from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
const CustomTextInput = forwardRef(
  (
    {
      placeholder,
      value,
      onChangeText,
      keyboardType = 'default',
      secureTextEntry = false,
      autoCapitalize = 'none',
      error = '',
      returnKeyType = 'next',
      onSubmitEditing = () => {},
      blurOnSubmit = true,
      testID = '',
      multiline = false,
      numberOfLines = 1,
      style,
    },
    ref,
  ) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const inputSecureTextEntry = secureTextEntry && !isPasswordVisible;
    const isPasswordField = secureTextEntry;

    const togglePasswordVisibility = () => {
      setIsPasswordVisible(!isPasswordVisible);
    };

    const handleFocus = () => {
      setIsFocused(true);
    };

    const handleBlur = () => {
      setIsFocused(false);
    };

    return (
      <View style={styles.container}>
        <View
          style={[
            styles.inputContainer,
            multiline && {height: Math.max(56, numberOfLines * 24)},
            isFocused && styles.inputContainerFocused,
            error ? styles.inputContainerError : null,
            style,
          ]}>
          <TextInput
            ref={ref}
            style={[styles.input, multiline && styles.multilineInput]}
            placeholder={placeholder}
            value={value}
            onChangeText={onChangeText}
            keyboardType={keyboardType}
            secureTextEntry={inputSecureTextEntry}
            autoCapitalize={autoCapitalize}
            onFocus={handleFocus}
            onBlur={handleBlur}
            returnKeyType={returnKeyType}
            onSubmitEditing={onSubmitEditing}
            blurOnSubmit={blurOnSubmit}
            testID={testID}
            multiline={multiline}
            numberOfLines={numberOfLines}
            autoCorrect={false}
            textContentType={secureTextEntry ? 'oneTimeCode' : 'none'}
            autoComplete={secureTextEntry ? 'off' : 'email'}
          />
          {isPasswordField && (
            <TouchableOpacity
              onPress={togglePasswordVisibility}
              style={styles.visibilityButton}
              testID={`${testID}-visibility-toggle`}
              activeOpacity={0.7}>
              <Text style={styles.visibilityButtonText}>
                {isPasswordVisible ? 'Hide' : 'Show'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  inputContainer: {
    height: 56,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#F7F7F7',
  },
  inputContainerFocused: {
    borderColor: '#00796B',
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
  },
  inputContainerError: {
    borderColor: '#FF3B30',
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#333333',
    paddingVertical: Platform.OS === 'ios' ? 12 : 8, // Better padding for iOS
  },
  multilineInput: {
    textAlignVertical: 'top',
    paddingTop: Platform.OS === 'ios' ? 12 : 8,
  },
  visibilityButton: {
    padding: 8,
    marginLeft: 8,
  },
  visibilityButtonText: {
    color: '#00796B',
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default CustomTextInput;
