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
  const [loading, setLoading] = useState(false);import {launchImageLibrary} from 'react-native-image-picker';

  const pickVideo = () => {
    console.log('Attempting to pick video from gallery...');
  
    const options = {
      mediaType: 'video',
      includeBase64: false,
      maxHeight: 720,
      maxWidth: 1280,
      videoQuality: 'high',
      selectionLimit: 1,
      presentationStyle: 'fullScreen',
    };
  
    launchImageLibrary(options, response => {
      console.log('Gallery response:', response);
  
      if (response.didCancel) {
        console.log('User cancelled gallery picker');
      } else if (response.errorCode) {
        console.log('Gallery error: ', response.errorMessage);
        Alert.alert('Error', `Gallery error: ${response.errorMessage}`);
      } else if (response.assets && response.assets.length > 0) {
        console.log('Video selected successfully:', response.assets[0]);
        setVideoFile(response.assets[0]);
      } else {
        console.log('No video selected or unknown error');
        Alert.alert(
          'Error',
          'No video was selected or an unknown error occurred',
        );
      }
    });
  };
  
  const mockSelectVideo = () => {
    const mockVideoFile = {
      uri: 'file:///mock-video-path.mp4',
      type: 'video/mp4',
      fileName: 'sample-video.mp4',
      fileSize: 1024 * 1024 * 10, // 10MB
      duration: 30, // 30 seconds
    };
  
    setVideoFile(mockVideoFile);
    Alert.alert('Development', 'Mock video selected for testing');
  };
  import {uploadVideo} from '../../api/videoApi';
