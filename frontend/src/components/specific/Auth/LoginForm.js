import React from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';
import CustomTextInput from '../../common/TextInput';
import CustomButton from '../../common/Button';

const LoginForm = ({
  email,
  setEmail,
  password,
  setPassword,
  loading,
  handleLogin,
  handleForgotPassword,
}) => {
  return (
    <View style={styles.container}>
      <CustomTextInput
        placeholder="Enter Your Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <CustomTextInput
        placeholder="Enter Your Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true}
      />

      <TouchableOpacity
        onPress={handleForgotPassword}
        style={styles.forgotPasswordContainer}>
        <Text style={styles.forgotPassword}>Forgot password?</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 20,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPassword: {
    color: '#00796B',
    fontSize: 16,
  },
});

export default LoginForm;
