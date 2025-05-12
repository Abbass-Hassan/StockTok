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
