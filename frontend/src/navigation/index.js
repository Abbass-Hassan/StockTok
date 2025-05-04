import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import Login from '../screens/Auth/Login';
import HomeScreen from '../screens/Feed';
import UploadVideo from '../screens/Creator/UploadVideo';
import MyVideos from '../screens/Creator/MyVideos';

const Stack = createStackNavigator();

const Navigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={Login}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'StockTok',
            headerBackVisible: false, // Prevents going back to login
          }}
        />
        <Stack.Screen
          name="UploadVideo"
          component={UploadVideo}
          options={{
            title: 'Upload Video',
          }}
        />
        <Stack.Screen
          name="MyVideos"
          component={MyVideos}
          options={{
            title: 'My Videos',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
