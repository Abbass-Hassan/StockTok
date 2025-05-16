import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Import regular user screens
import VideoFeedScreen from '../screens/VideoFeed/VideoFeedScreen';
import Search from '../screens/Regular/Search';
import WalletOverview from '../screens/Wallet/WalletOverview';
import AIRecommendations from '../screens/Regular/AIRecommendations';

const Tab = createBottomTabNavigator();

const RegularTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Wallet') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          } else if (route.name === 'AI') {
            iconName = focused ? 'bulb' : 'bulb-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF6B00',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}>
      <Tab.Screen name="Home" component={VideoFeedScreen} />
      <Tab.Screen name="Search" component={Search} />
      <Tab.Screen name="Wallet" component={WalletOverview} />
      <Tab.Screen name="AI" component={AIRecommendations} />
    </Tab.Navigator>
  );
};

export default RegularTabNavigator;
