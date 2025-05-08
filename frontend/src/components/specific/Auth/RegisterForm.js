import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
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
  // Track if each field has been touched by the user to only show errors after interaction
  const [touched, setTouched] = useState({
    email: false,
    password: false,
    confirmPassword: false,
  });

  // Handle field blur events to mark fields as touched
  const handleBlur = field => {
    setTouched(prev => ({
      ...prev,
      [field]: true,
    }));
  };

  // Only show errors for fields that have been touched
  const getVisibleError = (field, error) => {
    return touched[field] ? error : '';
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <CustomTextInput
          placeholder="Enter Your Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          error={getVisibleError('email', emailError)}
          onBlur={() => handleBlur('email')}
          testID="email-input"
        />

        <CustomTextInput
          placeholder="Enter Your Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={true}
          error={getVisibleError('password', passwordError)}
          onBlur={() => handleBlur('password')}
          testID="password-input"
        />

        <CustomTextInput
          placeholder="Confirm Your Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={true}
          error={getVisibleError('confirmPassword', confirmPasswordError)}
          onBlur={() => handleBlur('confirmPassword')}
          testID="confirm-password-input"
        />

        <CustomButton
          title="SignUp"
          onPress={() => {
            // Mark all fields as touched when submitting
            setTouched({
              email: true,
              password: true,
              confirmPassword: true,
            });
            handleRegister();
          }}
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
    </TouchableWithoutFeedback>
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
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginTop: 10,
  },
  forgotPassword: {
    color: '#00796B',
    fontSize: 16,
  },
});

export default RegisterForm;
