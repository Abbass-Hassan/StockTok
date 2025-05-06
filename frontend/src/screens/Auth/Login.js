import React, {useState} from 'react';
import {View, Text, StyleSheet, Alert} from 'react-native';
import CustomTextInput from '../../components/common/TextInput';
import CustomButton from '../../components/common/Button';
import * as authApi from '../../api/auth';
import {storeToken, storeUserData} from '../../utils/tokenStorage'; // Add this import

const Login = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // Add loading state

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    try {
      setLoading(true); // Start loading
      const response = await authApi.login(email, password);
      console.log('Login successful:', response);

      // Store token and user data
      await storeToken(response.data.token);
      await storeUserData(response.data.user);

      // Navigate to Home and reset navigation stack
      navigation.reset({
        index: 0,
        routes: [{name: 'Home'}],
      });
    } catch (error) {
      Alert.alert('Error', 'Login failed');
    } finally {
      setLoading(false); // End loading
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>StockTok</Text>

      <CustomTextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />

      <CustomTextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true}
      />

      <CustomButton
        title="Login"
        onPress={handleLogin}
        loading={loading} // Update your Button component to accept this prop
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#4B7BEC',
    textAlign: 'center',
    marginBottom: 40,
  },
});

export default Login;
