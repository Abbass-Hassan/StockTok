import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import {searchUsers, debugTokenStorage} from '../../api/userProfileApi';
import Icon from 'react-native-vector-icons/Ionicons';

const Search = ({navigation}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check token on component mount
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

      // Check if we have users
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

    // Safety check
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
        {/* Profile placeholder with first letter of username */}
        <View style={styles.userAvatarPlaceholder}>
          <Text style={styles.userInitials}>
            {item.username ? item.username.charAt(0).toUpperCase() : '?'}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.username}>@{item.username || 'Unknown'}</Text>
          <Text style={styles.name}>{item.name || 'No name provided'}</Text>
          {item.email && <Text style={styles.email}>{item.email}</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  // Safe keyExtractor that won't fail if id is missing
  const keyExtractor = (item, index) => {
    if (!item) return `missing-${index}`;
    return item.id ? `user-${item.id}` : `user-index-${index}`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.container}>
        {/* Header - Consistent with other screens but adapted for Search */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Search Creators</Text>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Enter username to search..."
              placeholderTextColor="#9E9E9E"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              autoCapitalize="none"
            />
          </View>
          <TouchableOpacity
            style={[
              styles.searchButton,
              !searchQuery.trim() && styles.searchButtonDisabled,
            ]}
            onPress={handleSearch}
            disabled={loading || !searchQuery.trim()}>
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.searchButtonText}>Search</Text>
            )}
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#00796B" />
            <Text style={styles.loaderText}>Searching...</Text>
          </View>
        ) : error ? (
          <View style={styles.messageContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : searchResults.length > 0 ? (
          <FlatList
            data={searchResults}
            renderItem={renderUserItem}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.resultsList}
            showsVerticalScrollIndicator={false}
          />
        ) : searchQuery.length > 0 ? (
          <View style={styles.messageContainer}>
            {/* Replaced image with icon */}
            <View style={styles.emptyStateIcon}>
              <Icon name="search" size={50} color="#FFFFFF" />
            </View>
            <Text style={styles.emptyText}>No users found</Text>
            <Text style={styles.emptySubtext}>
              Check the username and try again
            </Text>
          </View>
        ) : (
          <View style={styles.messageContainer}>
            {/* Replaced image with icon */}
            <View style={styles.emptyStateIcon}>
              <Icon name="people" size={50} color="#FFFFFF" />
            </View>
            <Text style={styles.instructionText}>
              Find creators by username
            </Text>
            <Text style={styles.instructionSubtext}>
              Enter the exact username of a creator to view their profile
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 16 : 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    fontSize: 32,
    color: '#00796B',
    marginTop: -4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#00796B',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    height: 46,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  searchInput: {
    fontSize: 16,
    color: '#212121',
  },
  searchButton: {
    backgroundColor: '#00796B',
    paddingHorizontal: 16,
    paddingVertical: 0,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    height: 46,
    minWidth: 80,
  },
  searchButtonDisabled: {
    backgroundColor: '#B0BEC5',
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 12,
    fontSize: 16,
    color: '#00796B',
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E1E4E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultsList: {
    padding: 16,
  },
  userItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userAvatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#00796B', // Changed to your theme color for better visibility
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInitials: {
    fontSize: 26, // Increased font size for better visibility
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center', // Ensure text is centered
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00796B',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    color: '#212121',
    marginBottom: 2,
  },
  email: {
    fontSize: 14,
    color: '#757575',
  },
  errorText: {
    fontSize: 16,
    color: '#D32F2F',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#424242',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
  },
  instructionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#424242',
    textAlign: 'center',
    marginBottom: 8,
  },
  instructionSubtext: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    maxWidth: 280,
  },
});

export default Search;
