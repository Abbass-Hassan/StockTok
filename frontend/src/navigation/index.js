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

import VideoFeedScreen from '../screens/VideoFeed/VideoFeedScreen';

import UploadVideo from '../screens/Creator/UploadVideo';
import MyVideos from '../screens/Creator/MyVideos';
import VideoPlayer from '../screens/Creator/VideoPlayer';
import VideoDetails from '../screens/Creator/VideoDetails';
import Dashboard from '../screens/Creator/Dashboard';
import CreatorProfile from '../screens/Creator/CreatorProfile';
import EditCreatorProfile from '../screens/Creator/EditCreatorProfile';

import WalletOverview from '../screens/Wallet/WalletOverview';
import DepositFunds from '../screens/Wallet/DepositFunds';
import WithdrawFunds from '../screens/Wallet/WithdrawFunds';
import TransactionHistory from '../screens/Wallet/TransactionHistory';

import PortfolioScreen from '../screens/Investment/PortfolioScreen';
import InvestmentDetailsScreen from '../screens/Investment/InvestmentDetailsScreen';
import AllInvestmentsScreen from '../screens/Investment/AllInvestmentsScreen';
import AIRecommendations from '../screens/Regular/AIRecommendations';

import Search from '../screens/Regular/Search';
import UserProfile from '../screens/Regular/UserProfile';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Regular User Tab Navigator - Updated with Portfolio tab
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

// Creator Tab Navigator
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

// Auth Stack Navigator
const AuthNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="ProfileCompletion" component={ProfileCompletion} />
    </Stack.Navigator>
  );
};

const Navigation = () => {
  const {isLoggedIn, setIsLoggedIn} = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await getToken();
        if (token) {
          const userData = await getUserData();

          // Handle different user_type_id formats (string or number)
          const userTypeId = userData?.user_type_id;
          const userTypeStr = userData?.user_type;

          // Check if user is a creator (handle both string "2" and number 2)
          const isCreator =
            userTypeId === 2 || userTypeId === '2' || userTypeStr === 'Creator';

          const userTypeValue = isCreator ? 'creator' : 'regular';

          setUserType(userTypeValue);
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [setIsLoggedIn]);

  if (isLoading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#FF6B00" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {!isLoggedIn ? (
          // Auth Stack
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : userType === 'creator' ? (
          // Creator Stack
          <Stack.Screen name="CreatorApp" component={CreatorTabs} />
        ) : (
          // Regular Stack
          <Stack.Screen name="RegularApp" component={RegularTabs} />
        )}

        {/* Additional screens outside of tab navigators */}
        <Stack.Screen name="VideoPlayer" component={VideoPlayer} />
        <Stack.Screen name="VideoDetails" component={VideoDetails} />
        <Stack.Screen name="MyVideos" component={MyVideos} />
        <Stack.Screen
          name="EditCreatorProfile"
          component={EditCreatorProfile}
        />
        <Stack.Screen name="DepositFunds" component={DepositFunds} />
        <Stack.Screen name="WithdrawFunds" component={WithdrawFunds} />
        <Stack.Screen
          name="TransactionHistory"
          component={TransactionHistory}
        />
        <Stack.Screen
          name="InvestmentDetails"
          component={InvestmentDetailsScreen}
        />
        <Stack.Screen name="AllInvestments" component={AllInvestmentsScreen} />
        <Stack.Screen name="UserProfile" component={UserProfile} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
