import React, {useState} from 'react';
import {Alert} from 'react-native';
import * as authApi from '../../api/auth';
import {storeToken, storeUserData} from '../../utils/tokenStorage';

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

  return null; // Placeholder return
};

export default Login;
