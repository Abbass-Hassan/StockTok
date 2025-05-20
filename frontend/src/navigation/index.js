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
import VideoFeedScreen from '../screens/VideoFeed/VideoFeedScreen';
import WalletOverview from '../screens/Wallet/WalletOverview';
import PortfolioScreen from '../screens/Investment/PortfolioScreen';
import AIRecommendations from '../screens/Regular/AIRecommendations';
import Search from '../screens/Regular/Search';

const Tab = createBottomTabNavigator();

const RegularTabs = () => {
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
          } else if (route.name === 'Portfolio') {
            iconName = focused ? 'analytics' : 'analytics-outline';
          } else if (route.name === 'AI') {
            iconName = focused ? 'bulb' : 'bulb-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#00796B',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}>
      <Tab.Screen name="Home" component={VideoFeedScreen} />
      <Tab.Screen name="Search" component={Search} />
      <Tab.Screen name="Portfolio" component={PortfolioScreen} />
      <Tab.Screen name="Wallet" component={WalletOverview} />
      <Tab.Screen name="AI" component={AIRecommendations} />
    </Tab.Navigator>
  );
};
import UploadVideo from '../screens/Creator/UploadVideo';
import MyVideos from '../screens/Creator/MyVideos';
import VideoPlayer from '../screens/Creator/VideoPlayer';
import VideoDetails from '../screens/Creator/VideoDetails';
import Dashboard from '../screens/Creator/Dashboard';
import CreatorProfile from '../screens/Creator/CreatorProfile';
import EditCreatorProfile from '../screens/Creator/EditCreatorProfile';

const CreatorTabs = () => {
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
        tabBarActiveTintColor: '#00796B',
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
