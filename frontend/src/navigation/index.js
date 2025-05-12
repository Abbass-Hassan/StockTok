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
import WalletOverview from '../screens/Wallet/WalletOverview';
import DepositFunds from '../screens/Wallet/DepositFunds';
import WithdrawFunds from '../screens/Wallet/WithdrawFunds';
import TransactionHistory from '../screens/Wallet/TransactionHistory';
import CreatorProfile from '../screens/Creator/CreatorProfile';
import EditCreatorProfile from '../screens/Creator/EditCreatorProfile';

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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
