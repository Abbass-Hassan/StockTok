import React, {useState} from 'react';
import {Alert} from 'react-native';
import * as authApi from '../../api/auth';
import {storeToken, storeUserData} from '../../utils/tokenStorage';

// Import components
import AuthLayout from '../../components/specific/Auth/AuthLayout';
import Header from '../../components/specific/Auth/Header';
import LoginForm from '../../components/specific/Auth/LoginForm';
import SocialLogin from '../../components/specific/Auth/SocialLogin';
import SignUpPrompt from '../../components/specific/Auth/SignUpPrompt';

const Login = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      const response = await authApi.login(email, password);
      console.log('Login successful:', response);

      await storeToken(response.data.token);
      await storeUserData(response.data.user);

      navigation.reset({
        index: 0,
        routes: [{name: 'Home'}],
      });
    } catch (error) {
      Alert.alert('Error', 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleSignUp = () => {
    navigation.navigate('SignUp');
  };

  return (
    <AuthLayout
      header={<Header title="Welcome back!" subtitle="Login to continue" />}
      form={
        <LoginForm
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          loading={loading}
          handleLogin={handleLogin}
          handleForgotPassword={handleForgotPassword}
        />
      }
      socialSection={<SocialLogin />}
      bottomPrompt={<SignUpPrompt onPress={handleSignUp} />}
    />
  );
};

export default Login;
