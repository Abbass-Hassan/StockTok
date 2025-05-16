import React, {useState, useEffect, useCallback} from 'react';
import {ActivityIndicator, View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {getToken, getUserData} from '../utils/tokenStorage';

// Import navigators
import AuthNavigator from './AuthNavigator';
import CreatorTabNavigator from './CreatorTabNavigator';
import RegularTabNavigator from './RegularTabNavigator';

const RootNavigator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [userType, setUserType] = useState(null);

  // Create a function to check auth that can be called multiple times
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

        // Set user type based on userData
        const userTypeValue =
          userData?.user_type_id === 2 || userData?.user_type === 'Creator'
            ? 'creator'
            : 'regular';

        setUserToken(token);
        setUserType(userTypeValue);
      } else {
        // Clear state if no token
        setUserToken(null);
        setUserType(null);
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      // On error, reset state
      setUserToken(null);
      setUserType(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check auth on mount
  useEffect(() => {
    checkAuth();

    // Set up a periodic check every 1 second
    // This ensures we detect token changes made in other components
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
