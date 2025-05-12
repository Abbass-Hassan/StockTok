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
};
const renderUserItem = ({item}) => {
  console.log('Rendering item:', item?.username);

  if (!item) {
    console.warn('Trying to render null item');
    return null;
  }
  return (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => {
        console.log('Navigating to profile for:', item.username);
        navigation.navigate('UserProfile', {username: item.username});
      }}>
      <Image
        source={{
          uri: item.profile_photo_url || 'https://via.placeholder.com/50',
        }}
        style={styles.userAvatar}
      />
      <View style={styles.userInfo}>
        <Text style={styles.username}>@{item.username || 'Unknown'}</Text>
        <Text style={styles.name}>{item.name || 'No name provided'}</Text>
        {item.email && <Text style={styles.email}>{item.email}</Text>}
      </View>
    </TouchableOpacity>
  );
};
const keyExtractor = (item, index) => {
  if (!item) return `missing-${index}`;
  return item.id ? `user-${item.id}` : `user-index-${index}`;
};
<SafeAreaView style={styles.container}>
  <StatusBar barStyle="light-content" backgroundColor="#00796B" />
  <View style={styles.header}>
  <TouchableOpacity
    style={styles.backButton}
    onPress={() => navigation.goBack()}>
    <Text style={styles.backButtonText}>←</Text>
  </TouchableOpacity>
  <Text style={styles.headerTitle}>Search Creators</Text>
</View>
