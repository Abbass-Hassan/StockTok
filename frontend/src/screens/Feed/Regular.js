import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {getUserData} from '../../utils/tokenStorage';
const Regular = ({navigation}) => {
    const [userData, setUserData] = useState(null);
    useEffect(() => {
        loadUserData();
      }, []);
    
      const loadUserData = async () => {
        try {
          const user = await getUserData();
          setUserData(user);
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      };
      const handleLogout = () => {
        Alert.alert(
          'Logout',
          'Are you sure you want to logout?',
          [
            {text: 'Cancel', style: 'cancel'},
            {
              text: 'Logout',
              style: 'destructive',
              onPress: () => {
                try {
                  navigation.reset({
                    index: 0,
                    routes: [{name: 'Login'}],
                  });
                } catch (error) {
                  console.error('Logout error:', error);
                  Alert.alert('Error', 'Failed to logout');
                }
              },
            },
          ],
          {cancelable: true},
        );
      };
      return (
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
    