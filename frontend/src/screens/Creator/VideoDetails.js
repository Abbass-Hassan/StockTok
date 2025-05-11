import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {getVideoDetails, getVideoEarnings} from '../../api/videoApi';
const VideoDetails = ({route, navigation}) => {
    const {video} = route.params;
    const [loading, setLoading] = useState(true);
    const [videoStats, setVideoStats] = useState(null);
    const [earnings, setEarnings] = useState(null);
    const [error, setError] = useState(null);
  