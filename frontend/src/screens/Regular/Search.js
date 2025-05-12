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
<View style={styles.searchContainer}>
  <TextInput
    style={styles.searchInput}
    placeholder="Enter exact username..."
    value={searchQuery}
    onChangeText={setSearchQuery}
    onSubmitEditing={handleSearch}
    returnKeyType="search"
    autoCapitalize="none"
  />
  <TouchableOpacity
    style={styles.searchButton}
    onPress={handleSearch}
    disabled={loading}>
    <Text style={styles.searchButtonText}>Search</Text>
  </TouchableOpacity>
</View>
{loading ? (
  <ActivityIndicator style={styles.loader} size="large" color="#00796B" />
) : error ? (
    <Text style={styles.errorText}>{error}</Text>
) : searchResults.length > 0 ? (
    <FlatList
      data={searchResults}
      renderItem={renderUserItem}
      keyExtractor={keyExtractor}
      contentContainerStyle={styles.resultsList}
    />
  ) : searchQuery.length > 0 ? (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyText}>No users found</Text>
    <Text style={styles.emptySubtext}>
      Check the username and try again
    </Text>
  </View>
) : (
    <View style={styles.instructionContainer}>
      <Text style={styles.instructionText}>
        Enter the exact username of a creator to find their profile
      </Text>
      <Text style={styles.instructionSubtext}>
        For example: user_1746574414_4515
      </Text>
    </View>
  )}
  container: {
  flex: 1,
  backgroundColor: '#FFFFFF',
},
header: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 16,
  paddingVertical: 12,
  backgroundColor: '#00796B',
},
searchContainer: {
  flexDirection: 'row',
  padding: 16,
  backgroundColor: '#FFFFFF',
  borderBottomWidth: 1,
  borderBottomColor: '#E0E0E0',
},
searchInput: {
  flex: 1,
  height: 40,
  borderWidth: 1,
  borderColor: '#E0E0E0',
  borderRadius: 8,
  paddingHorizontal: 12,
  marginRight: 8,
  backgroundColor: '#FFFFFF',
},
