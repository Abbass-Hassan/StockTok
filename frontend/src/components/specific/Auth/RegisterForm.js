import React, {useRef} from 'react';
import {View, StyleSheet, TouchableOpacity, Text, Keyboard} from 'react-native';
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
  handleForgotPassword,
  emailError,
  passwordError,
  confirmPasswordError,
}) => {
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const confirmPasswordInputRef = useRef(null);

  const focusNextInput = nextInputRef => {
    if (nextInputRef && nextInputRef.current) {
      nextInputRef.current.focus();
    }
  };

  const handleSubmitEditing = () => {
    Keyboard.dismiss();
    handleRegister();
  };

  return (
    <View style={styles.container}>
      <CustomTextInput
        ref={emailInputRef}
        placeholder="Enter Your Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        error={emailError}
        returnKeyType="next"
        onSubmitEditing={() => focusNextInput(passwordInputRef)}
        blurOnSubmit={false}
        testID="email-input"
      />

      <CustomTextInput
        ref={passwordInputRef}
        placeholder="Enter Your Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true}
        error={passwordError}
        returnKeyType="next"
        onSubmitEditing={() => focusNextInput(confirmPasswordInputRef)}
        blurOnSubmit={false}
        testID="password-input"
      />

      <CustomTextInput
        ref={confirmPasswordInputRef}
        placeholder="Confirm Your Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry={true}
        error={confirmPasswordError}
        returnKeyType="done"
        onSubmitEditing={handleSubmitEditing}
        testID="confirm-password-input"
      />

      <CustomButton
        title="SignUp"
        onPress={handleRegister}
        loading={loading}
        style={styles.button}
        testID="signup-button"
      />

      <TouchableOpacity
        onPress={handleForgotPassword}
        style={styles.forgotPasswordContainer}
        testID="forgot-password-btn">
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
  button: {
    marginTop: 16,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginTop: 12,
    paddingVertical: 4,
  },
  forgotPassword: {
    color: '#00796B',
    fontSize: 16,
  },
});

export default RegisterForm;
