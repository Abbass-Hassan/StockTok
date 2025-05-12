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
