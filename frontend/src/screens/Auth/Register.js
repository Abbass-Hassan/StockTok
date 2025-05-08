import React, {useState} from 'react';
import {Alert} from 'react-native';
import * as authApi from '../../api/auth';
import {storeToken, storeUserData} from '../../utils/tokenStorage';

// Import components
import AuthLayout from '../../components/specific/Auth/AuthLayout';
import Header from '../../components/specific/Auth/Header';
import RegisterForm from '../../components/specific/Auth/RegisterForm';
import SocialLogin from '../../components/specific/Auth/SocialLogin';
import LoginPrompt from '../../components/specific/Auth/LoginPrompt';

const Register = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Form validation errors
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // Validate form inputs
  const validateForm = () => {
    let isValid = true;

    // Reset errors
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!emailRegex.test(email.trim())) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    }

    // Password validation
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }

    // Confirm password validation
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    }

    return isValid;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      // Show validation errors in a similar format to the API
      const errors = [];
      if (confirmPasswordError) errors.push(confirmPasswordError);
      if (passwordError) errors.push(passwordError);
      if (emailError) errors.push(emailError);

      if (errors.length > 0) {
        const primaryError = errors[0];
        const otherCount = errors.length - 1;
        const errorMessage =
          otherCount > 0
            ? `${primaryError}\n(and ${otherCount} more error${
                otherCount > 1 ? 's' : ''
              })`
            : primaryError;

        Alert.alert('Error', errorMessage);
      }
      return;
    }

    try {
      setLoading(true);
      // Use the updated auth.js that properly passes password_confirmation
      const response = await authApi.register(
        email.trim(),
        password,
        confirmPassword,
      );
      console.log('Registration successful:', response);

      // Store the token and user data
      if (response.data && response.data.data) {
        await storeToken(response.data.data.token);
        await storeUserData(response.data.data.user);
      }

      navigation.reset({
        index: 0,
        routes: [{name: 'Home'}],
      });
    } catch (error) {
      console.error('Registration error details:', error.response?.data);

      // Handle server validation errors
      if (error.response?.data?.errors) {
        const serverErrors = error.response.data.errors;

        // Check for password_confirmation error
        if (serverErrors.password_confirmation) {
          setConfirmPasswordError(serverErrors.password_confirmation[0]);
        }

        if (serverErrors.password) {
          setPasswordError(serverErrors.password[0]);
        }

        if (serverErrors.email) {
          setEmailError(serverErrors.email[0]);
        }

        // Count errors to display in alert
        const errorMessages = [];
        if (confirmPasswordError)
          errorMessages.push(serverErrors.password_confirmation[0]);
        if (passwordError) errorMessages.push(serverErrors.password[0]);
        if (emailError) errorMessages.push(serverErrors.email[0]);

        if (errorMessages.length > 0) {
          const primaryError = errorMessages[0];
          const otherCount = errorMessages.length - 1;
          const errorMessage =
            otherCount > 0
              ? `${primaryError}\n(and ${otherCount} more error${
                  otherCount > 1 ? 's' : ''
                })`
              : primaryError;

          Alert.alert('Error', errorMessage);
        }
      } else {
        // Generic error
        Alert.alert('Error', error.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  return (
    <AuthLayout
      header={<Header title="Create Account" subtitle="Join StockTok today" />}
      form={
        <RegisterForm
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          loading={loading}
          handleRegister={handleRegister}
          handleForgotPassword={handleForgotPassword}
          emailError={emailError}
          passwordError={passwordError}
          confirmPasswordError={confirmPasswordError}
        />
      }
      socialSection={<SocialLogin isSignUp={true} />}
      bottomPrompt={<LoginPrompt onPress={handleLogin} />}
    />
  );
};

export default Register;
