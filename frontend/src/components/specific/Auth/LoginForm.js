import React from 'react';
import {View, StyleSheet} from 'react-native';
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
    <View style={styles.container}>{/* Form elements will go here */}</View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 20,
  },
});

export default LoginForm;
