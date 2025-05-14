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
import {launchImageLibrary} from 'react-native-image-picker';
import {uploadVideo} from '../../api/videoApi';
import Icon from 'react-native-vector-icons/Ionicons';

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
        // Real upload (no thumbnail)
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
        <View style={styles.videoIconContainer}>
          <Icon name="videocam" size={32} color="#00796B" />
        </View>
        <View style={styles.videoInfo}>
          <Text style={styles.videoName}>
            {videoFile.fileName || 'Selected Video'}
          </Text>
          <Text style={styles.videoDetails}>
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
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Text style={styles.backButtonText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Upload Video</Text>
        </View>

        <View style={styles.content}>
          {/* Video Selection */}
          <TouchableOpacity
            style={styles.uploadBox}
            onPress={Platform.OS === 'ios' ? pickVideo : mockSelectVideo}
            disabled={loading}
            activeOpacity={0.7}>
            {videoFile ? (
              renderVideoPreview()
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Icon name="cloud-upload-outline" size={48} color="#00796B" />
                <Text style={styles.uploadText}>
                  Tap to select a video from gallery
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Caption Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Caption</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="Write a caption for your video..."
              placeholderTextColor="#999999"
              value={caption}
              onChangeText={setCaption}
              multiline
              maxLength={1000}
              editable={!loading}
            />
            <Text style={styles.charCount}>{caption.length}/1000</Text>
          </View>

          {/* Investment Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Initial Investment</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter investment amount"
              placeholderTextColor="#999999"
              value={initialInvestment}
              onChangeText={setInitialInvestment}
              keyboardType="numeric"
              editable={!loading}
            />
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <Icon
              name="bulb-outline"
              size={20}
              color="#00796B"
              style={styles.infoIcon}
            />
            <Text style={styles.infoText}>
              Initial investment helps boost your video's visibility and
              potential returns
            </Text>
          </View>

          {/* Upload Button */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleUpload}
            disabled={loading || !videoFile || !caption.trim()}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Upload Video</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 16 : 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    marginRight: 16,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 32,
    color: '#00796B',
    marginTop: -4,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#00796B',
  },
  content: {
    padding: 16,
  },
  uploadBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#00796B',
    borderStyle: 'dashed',
    padding: 20,
    marginBottom: 20,
    minHeight: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadPlaceholder: {
    alignItems: 'center',
  },
  uploadText: {
    color: '#00796B',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 12,
  },
  videoPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 10,
  },
  videoIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E0F2F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  videoInfo: {
    flex: 1,
  },
  videoName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
    color: '#212121',
  },
  videoDetails: {
    fontSize: 14,
    color: '#666666',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#212121',
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    position: 'absolute',
    bottom: 8,
    right: 12,
    fontSize: 12,
    color: '#999999',
  },
  infoCard: {
    backgroundColor: '#E8F5F3',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#00796B',
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#00796B',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#80CBC4',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default UploadVideo;
