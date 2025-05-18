import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

import Dashboard from '../screens/Creator/Dashboard';
import UploadVideo from '../screens/Creator/UploadVideo';
import WalletOverview from '../screens/Wallet/WalletOverview';
import CreatorProfile from '../screens/Creator/CreatorProfile';

const Tab = createBottomTabNavigator();

const CreatorTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Upload') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Wallet') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF6B00',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}>
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="Upload" component={UploadVideo} />
      <Tab.Screen name="Wallet" component={WalletOverview} />
      <Tab.Screen name="Profile" component={CreatorProfile} />
    </Tab.Navigator>
  );
};

export default CreatorTabNavigator;
