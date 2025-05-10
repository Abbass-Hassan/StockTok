import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Platform,
  TouchableOpacity,
} from 'react-native';

const MyVideos = ({navigation}) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  import {getMyVideos} from '../../api/videoApi';
  import VideoCard from '../../components/common/VideoCard';
  import EmptyState from '../../components/common/EmptyState';
  import FloatingActionButton from '../../components/common/FloatingActionButton';
  