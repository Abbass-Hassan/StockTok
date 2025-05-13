import React, {useState, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {getUserData} from '../utils/tokenStorage';

// Auth screens
import Login from '../screens/Auth/Login';
import Register from '../screens/Auth/Register';
import ProfileCompletion from '../screens/Auth/ProfileCompletion';

// Feed screens
import HomeScreen from '../screens/Feed';
import Regular from '../screens/Feed/Regular';
import VideoFeedScreen from '../screens/VideoFeed/VideoFeedScreen'; // Added VideoFeed import

// Creator screens
import UploadVideo from '../screens/Creator/UploadVideo';
import MyVideos from '../screens/Creator/MyVideos';
import VideoPlayer from '../screens/Creator/VideoPlayer';
import VideoDetails from '../screens/Creator/VideoDetails';
import Dashboard from '../screens/Creator/Dashboard';
import CreatorProfile from '../screens/Creator/CreatorProfile';
import EditCreatorProfile from '../screens/Creator/EditCreatorProfile';

// Wallet screens
import WalletOverview from '../screens/Wallet/WalletOverview';
import DepositFunds from '../screens/Wallet/DepositFunds';
import WithdrawFunds from '../screens/Wallet/WithdrawFunds';
import TransactionHistory from '../screens/Wallet/TransactionHistory';

// Investment screens
import PortfolioScreen from '../screens/Investment/PortfolioScreen';
import InvestmentDetailsScreen from '../screens/Investment/InvestmentDetailsScreen';
import AllInvestmentsScreen from '../screens/Investment/AllInvestmentsScreen';

import Search from '../screens/Regular/Search';
import UserProfile from '../screens/Regular/UserProfile';

const Stack = createStackNavigator();

const Navigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{headerShown: false}}>
        {/* Auth Screens */}
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="ProfileCompletion" component={ProfileCompletion} />
        {/* Feed Screens */}
        <Stack.Screen
          name="CreatorFeed"
          component={HomeScreen}
          options={{
            headerShown: true,
            title: 'StockTok Creator',
            headerBackVisible: false,
          }}
        />
        <Stack.Screen
          name="RegularFeed"
          component={Regular}
          options={{
            headerShown: true,
            title: 'StockTok',
            headerBackVisible: false,
          }}
        />
        {/* VideoFeed Screen - Added */}
        <Stack.Screen
          name="VideoFeed"
          component={VideoFeedScreen}
          options={{
            headerShown: false,
          }}
        />
        {/* Creator Screens */}
        <Stack.Screen
          name="Dashboard"
          component={Dashboard}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="UploadVideo"
          component={UploadVideo}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="MyVideos"
          component={MyVideos}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="VideoPlayer"
          component={VideoPlayer}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="VideoDetails"
          component={VideoDetails}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="CreatorProfile"
          component={CreatorProfile}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="EditCreatorProfile"
          component={EditCreatorProfile}
          options={{
            headerShown: false,
          }}
        />
        {/* Wallet Screens */}
        <Stack.Screen
          name="WalletOverview"
          component={WalletOverview}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="DepositFunds"
          component={DepositFunds}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="WithdrawFunds"
          component={WithdrawFunds}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="TransactionHistory"
          component={TransactionHistory}
          options={{
            headerShown: false,
          }}
        />
        {/* Investment Screens */}
        <Stack.Screen
          name="Portfolio"
          component={PortfolioScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="InvestmentDetails"
          component={InvestmentDetailsScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="AllInvestments"
          component={AllInvestmentsScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Search"
          component={Search}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="UserProfile"
          component={UserProfile}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
