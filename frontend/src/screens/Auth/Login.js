import React, {useState, useContext} from 'react';
import {Alert} from 'react-native';
import * as authApi from '../../api/auth';
import {storeToken, storeUserData} from '../../utils/tokenStorage';
import {AuthContext} from '../../App'; // Import AuthContext

// Import components
import AuthLayout from '../../components/specific/Auth/AuthLayout';
import Header from '../../components/specific/Auth/Header';
import LoginForm from '../../components/specific/Auth/LoginForm';
import SocialLogin from '../../components/specific/Auth/SocialLogin';
import SignUpPrompt from '../../components/specific/Auth/SignUpPrompt';

const Login = ({navigation}) => {
  const {setIsLoggedIn} = useContext(AuthContext); // Get setIsLoggedIn from context
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Form validation errors
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Validate form inputs
  const validateForm = () => {
    let isValid = true;

    // Reset errors
    setEmailError('');
    setPasswordError('');

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
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const response = await authApi.login(email.trim(), password);
      console.log('Login API full response:', response.data);
      console.log('Login successful:', response);

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

      // Log the extracted values for debugging
      console.log('Extracted token:', token);
      console.log('Extracted user data:', userData);

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

      // IMPORTANT: Instead of directly navigating, update the isLoggedIn state
      // This will trigger the Navigation component to show the appropriate screen
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Login error details:', error);

      // Handle server validation errors
      if (error.response?.data?.errors) {
        const serverErrors = error.response.data.errors;

        if (serverErrors.email) {
          setEmailError(serverErrors.email[0]);
        }

        if (serverErrors.password) {
          setPasswordError(serverErrors.password[0]);
        }
      }

      // Show error alert
      Alert.alert(
        'Error',
        error.response?.data?.message || error.message || 'Login failed',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  return (
    <AuthLayout
      header={<Header title="Welcome Back" subtitle="Login to continue" />}
      form={
        <LoginForm
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          loading={loading}
          handleLogin={handleLogin}
          handleForgotPassword={handleForgotPassword}
          emailError={emailError}
          passwordError={passwordError}
        />
      }
      socialSection={<SocialLogin isSignUp={false} />}
      bottomPrompt={<SignUpPrompt onPress={handleRegister} />}
    />
  );
};

export default Login;
