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
  const handleUpload = async () => {
    if (!videoFile) {
      Alert.alert('Error', 'Please select a video first');
      return;
    }
  
    if (!caption.trim()) {
      Alert.alert('Error', 'Please enter a caption');
      return;
    }
  
    try {
      setLoading(true);
  
      const videoData = {
        caption,
        initialInvestment: parseFloat(initialInvestment) || 0,
      };
  
      console.log('Preparing to upload video:', videoData);
      console.log('Video file info:', videoFile);
  
      if (videoFile.uri.includes('mock-video-path')) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        Alert.alert('Success', 'Video uploaded successfully! (Development Mode)', [
          {
            text: 'OK',
            onPress: () => {
              setVideoFile(null);
              setCaption('');
              setInitialInvestment('0');
              navigation.navigate('MyVideos');
            },
          },
        ]);
      } else {
        const result = await uploadVideo(videoData, videoFile);
        Alert.alert('Success', 'Video uploaded successfully!', [
          {
            text: 'OK',
            onPress: () => {
              setVideoFile(null);
              setCaption('');
              setInitialInvestment('0');
              navigation.navigate('MyVideos');
            },
          },
        ]);
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Upload Failed', error.message || 'An error occurred during upload');
    } finally {
      setLoading(false);
    }
  };
  