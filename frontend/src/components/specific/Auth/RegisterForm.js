import React from 'react';
import {View, StyleSheet} from 'react-native';
import CustomTextInput from '../../common/TextInput';
import CustomButton from '../../common/Button';

const RegisterForm = ({
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  loading,
  handleRegister,
  emailError,
  passwordError,
  confirmPasswordError,
}) => {
  return (
    <View style={styles.container}>
      <CustomTextInput
        placeholder="Enter Your Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        error={emailError}
      />

      <CustomTextInput
        placeholder="Enter Your Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true}
        error={passwordError}
      />

      <CustomTextInput
        placeholder="Confirm Your Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry={true}
        error={confirmPasswordError}
      />

      <CustomButton
        title="SignUp"
        onPress={handleRegister}
        loading={loading}
        style={styles.button}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 20,
  },
  button: {
    marginTop: 10,
  },
});

export default RegisterForm;
