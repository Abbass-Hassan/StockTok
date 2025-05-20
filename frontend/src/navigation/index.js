import React, {useState, useEffect, useContext} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {getToken, getUserData} from '../utils/tokenStorage';
import {AuthContext} from '../App';
import {ActivityIndicator, View} from 'react-native';
import Login from '../screens/Auth/Login';
import Register from '../screens/Auth/Register';
import ProfileCompletion from '../screens/Auth/ProfileCompletion';

const Stack = createStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="ProfileCompletion" component={ProfileCompletion} />
    </Stack.Navigator>
  );
};
