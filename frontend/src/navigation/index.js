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

const Stack = createStackNavigator();
