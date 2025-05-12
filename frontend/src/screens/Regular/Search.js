import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {searchUsers, debugTokenStorage} from '../../api/userProfileApi';
const [searchQuery, setSearchQuery] = useState('');
const [searchResults, setSearchResults] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
useEffect(() => {
  debugTokenStorage().then(hasToken => {
    console.log('Search screen - has valid token:', hasToken);
  });
}, []);
const handleSearch = async () => {
  if (!searchQuery.trim()) return;

  console.log('Search button pressed with query:', searchQuery);
  setError(null);
  try {
    setLoading(true);

    console.log('Calling searchUsers API function with:', searchQuery);
    const response = await searchUsers(searchQuery);
    console.log(
      'Search complete. Users found:',
      response?.data?.users?.length || 0,
    );
    if (response?.data?.users && Array.isArray(response.data.users)) {
      if (response.data.users.length > 0) {
        console.log('Setting search results with user data');
        setSearchResults(response.data.users);
      } else {
        console.log('No users found in response');
        setSearchResults([]);
        setError('No users found with that username.');
      }
    } else {
      console.log(
        'Invalid response format:',
        JSON.stringify(response).substring(0, 200),
      );
      setSearchResults([]);
      setError('Invalid response from server. Please try again.');
    }
  } catch (err) {
    console.error('Uncaught search error in component:', err.message);
    setError('Search failed: ' + err.message);
  } finally {
    setLoading(false);
  }
};const renderUserItem = ({item}) => {
    console.log('Rendering item:', item?.username);
  
    if (!item) {
      console.warn('Trying to render null item');
      return null;
    }
  
