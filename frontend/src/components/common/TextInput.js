import React, {useState} from 'react';
import {TextInput, StyleSheet, View} from 'react-native';

const CustomTextInput = ({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  style,
  keyboardType,
  autoCapitalize,
  error,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.inputContainer, style]}>
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputFocused,
          error && styles.inputError,
        ]}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#BBBBBB"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType || 'default'}
          autoCapitalize={autoCapitalize || 'none'}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 16,
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    height: 56,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
  },
  inputFocused: {
    borderColor: '#00796B',
    borderWidth: 1,
  },
  inputError: {
    borderColor: '#FF5252',
  },
});

export default CustomTextInput;
