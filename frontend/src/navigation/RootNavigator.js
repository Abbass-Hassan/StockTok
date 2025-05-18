import React, {useState, useEffect, useCallback} from 'react';
import {ActivityIndicator, View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {getToken, getUserData} from '../utils/tokenStorage';

import AuthNavigator from './AuthNavigator';
import CreatorTabNavigator from './CreatorTabNavigator';
import RegularTabNavigator from './RegularTabNavigator';

const RootNavigator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [userType, setUserType] = useState(null);

  const checkAuth = useCallback(async () => {
    try {
      const token = await getToken();
      console.log(
        'RootNavigator - Token check:',
        token ? 'Token exists' : 'No token',
      );

      if (token) {
        const userData = await getUserData();
        console.log('RootNavigator - User data:', userData);

        const userTypeValue =
          userData?.user_type_id === 2 || userData?.user_type === 'Creator'
            ? 'creator'
            : 'regular';

        setUserToken(token);
        setUserType(userTypeValue);
      } else {
        setUserToken(null);
        setUserType(null);
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      setUserToken(null);
      setUserType(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();

    const interval = setInterval(() => {
      checkAuth();
    }, 1000);

    return () => clearInterval(interval);
  }, [checkAuth]);

  if (isLoading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#FF6B00" />
      </View>
    );
  }

  console.log(
    'RootNavigator - Rendering with token:',
    userToken,
    'and user type:',
    userType,
  );

  return (
    <NavigationContainer>
      {userToken ? (
        userType === 'creator' ? (
          <CreatorTabNavigator />
        ) : (
          <RegularTabNavigator />
        )
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};

export default RootNavigator;
