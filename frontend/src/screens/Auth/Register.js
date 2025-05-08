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
      return;
    }

    try {
      setLoading(true);
      const response = await authApi.register(
        email.trim(),
        password,
        confirmPassword,
      );
      console.log('Registration successful:', response);

      // Check response structure and extract token and user data
      let token = null;
      let userData = null;

      // Handle different possible response structures
      if (response?.data?.token) {
        // Structure: response.data.token
        token = response.data.token;
      } else if (response?.data?.data?.token) {
        // Structure: response.data.data.token
        token = response.data.data.token;
      } else if (response?.token) {
        // Structure: response.token
        token = response.token;
      }

      // Extract user data
      if (response?.data?.user) {
        // Structure: response.data.user
        userData = response.data.user;
      } else if (response?.data?.data?.user) {
        // Structure: response.data.data.user
        userData = response.data.data.user;
      } else if (response?.user) {
        // Structure: response.user
        userData = response.user;
      } else if (response?.data) {
        // Fallback: try using the entire data object as user data
        userData = response.data;
      }

      // Only attempt to store if values are not undefined/null
      if (token) {
        await storeToken(token);
      } else {
        console.warn('No token found in response, skipping token storage');
      }

      if (userData) {
        await storeUserData(userData);
      } else {
        console.warn(
          'No user data found in response, skipping user data storage',
        );
      }

      // Navigate even if token/userData storage fails, as the API request was successful
      navigation.reset({
        index: 0,
        routes: [{name: 'Home'}],
      });
    } catch (error) {
      console.error('Registration error details:', error);

      // Handle server validation errors
      if (error.response?.data?.errors) {
        const serverErrors = error.response.data.errors;

        // Set field errors based on server response
        if (serverErrors.password_confirmation) {
          setConfirmPasswordError(serverErrors.password_confirmation[0]);
        }

        if (serverErrors.password) {
          setPasswordError(serverErrors.password[0]);
        }

        if (serverErrors.email) {
          setEmailError(serverErrors.email[0]);
        }
      }

      // Show error alert
      Alert.alert(
        'Error',
        error.response?.data?.message || error.message || 'Registration failed',
      );
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
