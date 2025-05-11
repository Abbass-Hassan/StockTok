import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import Login from '../screens/Auth/Login';
import Register from '../screens/Auth/Register';
import ProfileCompletion from '../screens/Auth/ProfileCompletion';
import HomeScreen from '../screens/Feed';
import UploadVideo from '../screens/Creator/UploadVideo';
import MyVideos from '../screens/Creator/MyVideos';
import VideoPlayer from '../screens/Creator/VideoPlayer';
import VideoDetails from '../screens/Creator/VideoDetails';
import Dashboard from '../screens/Creator/Dashboard';
const Stack = createStackNavigator();
const Navigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{headerShown: false}}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="ProfileCompletion" component={ProfileCompletion} />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            headerShown: true,
            title: 'StockTok',
            headerBackVisible: false,
          }}
        />
        <Stack.Screen
          name="Dashboard"
          component={Dashboard}
          options={{
            headerShown: false,
          }}
        />
