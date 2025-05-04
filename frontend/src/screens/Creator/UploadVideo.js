import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import {uploadVideo} from '../../api/videoApi';

const UploadVideo = ({navigation}) => {
  // State variables
  const [videoFile, setVideoFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [initialInvestment, setInitialInvestment] = useState('0');
  const [loading, setLoading] = useState(false);

  // Function to pick a video from gallery
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

  // Function for development testing (fallback if real picker doesn't work)
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

  // Handle upload
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

      // For development: simulate upload if using mock data
      if (videoFile.uri.includes('mock-video-path')) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        Alert.alert(
          'Success',
          'Video uploaded successfully! (Development Mode)',
          [
            {
              text: 'OK',
              onPress: () => {
                // Reset form and navigate to My Videos
                setVideoFile(null);
                setCaption('');
                setInitialInvestment('0');
                navigation.navigate('MyVideos');
              },
            },
          ],
        );
      } else {
        // Real upload
        const result = await uploadVideo(videoData, videoFile);

        Alert.alert('Success', 'Video uploaded successfully!', [
          {
            text: 'OK',
            onPress: () => {
              // Reset form and navigate to My Videos
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
      Alert.alert(
        'Upload Failed',
        error.message || 'An error occurred during upload',
      );
    } finally {
      setLoading(false);
    }
  };

  // Render video preview
  const renderVideoPreview = () => {
    if (!videoFile) return null;

    return (
      <View style={styles.videoPreview}>
        <Text style={styles.videoName}>
          {videoFile.fileName || 'Selected Video'}
        </Text>
        <Text style={styles.videoInfo}>
          {((videoFile.fileSize || 0) / (1024 * 1024)).toFixed(2)} MB
          {videoFile.duration
            ? ` • ${Math.floor(videoFile.duration / 60)}:${(
                videoFile.duration % 60
              )
                .toString()
                .padStart(2, '0')}`
            : ''}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Video</Text>

      <TouchableOpacity
        style={styles.uploadBox}
        onPress={Platform.OS === 'ios' ? pickVideo : mockSelectVideo} // Use real picker on iOS, mock on Android for now
        disabled={loading}
        activeOpacity={0.7}>
        {videoFile ? (
          renderVideoPreview()
        ) : (
          <Text style={styles.uploadText}>
            Tap to select a video from gallery
          </Text>
        )}
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Add a caption..."
        value={caption}
        onChangeText={setCaption}
        multiline
        maxLength={1000}
        editable={!loading}
      />

      <TextInput
        style={styles.input}
        placeholder="Initial investment"
        value={initialInvestment}
        onChangeText={setInitialInvestment}
        keyboardType="numeric"
        editable={!loading}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleUpload}
        disabled={loading || !videoFile || !caption.trim()}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Upload Video</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F8F9FA',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#4B7BEC',
  },
  uploadBox: {
    height: 200,
    borderWidth: 2,
    borderColor: '#4B7BEC',
    borderStyle: 'dashed',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#F0F3FF',
    padding: 15,
  },
  uploadText: {
    color: '#4B7BEC',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  videoPreview: {
    width: '100%',
    alignItems: 'center',
  },
  videoName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
  videoInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#4B7BEC',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#A0BEF8',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default UploadVideo;
