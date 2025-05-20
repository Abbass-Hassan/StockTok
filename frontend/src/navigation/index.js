import React, {useState, useEffect, useContext} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {getToken, getUserData} from '../utils/tokenStorage';
import {AuthContext} from '../App';
import {ActivityIndicator, View} from 'react-native';
