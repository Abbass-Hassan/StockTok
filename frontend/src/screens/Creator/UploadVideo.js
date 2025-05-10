import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';

const UploadVideo = ({navigation}) => {
  const [videoFile, setVideoFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [initialInvestment, setInitialInvestment] = useState('0');
  const [loading, setLoading] = useState(false);
