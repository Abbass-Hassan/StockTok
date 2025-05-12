import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Platform,
  Alert,
  StatusBar,
} from 'react-native';
import {updateCreatorProfile} from '../../api/creatorProfileApi';
import {launchImageLibrary} from 'react-native-image-picker';
const EditCreatorProfile = ({route, navigation}) => {
    const {profile} = route.params || {};
  
    const [name, setName] = useState(profile?.name || '');
    const [username, setUsername] = useState(profile?.username || '');
    const [bio, setBio] = useState(profile?.bio || '');
    const [phone, setPhone] = useState(profile?.phone || '');
    const [photo, setPhoto] = useState(null);
    const [photoUrl, setPhotoUrl] = useState(profile?.profile_photo_url || null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const selectPhoto = () => {
        const options = {
          mediaType: 'photo',
          maxWidth: 1000,
          maxHeight: 1000,
          quality: 0.8,
        };
    
        launchImageLibrary(options, response => {
          if (response.didCancel) {
            console.log('User cancelled image picker');
          } else if (response.error) {
            console.log('ImagePicker Error: ', response.error);
            Alert.alert('Error', 'There was a problem selecting this image.');
          } else if (response.assets && response.assets.length > 0) {
            const selectedAsset = response.assets[0];
            setPhoto(selectedAsset);
            setPhotoUrl(selectedAsset.uri);
          }
        });
      };
      const validateForm = () => {
        let formErrors = {};
        let isValid = true;
    
        if (!name.trim()) {
          formErrors.name = 'Name is required';
          isValid = false;
        }
    
        if (!username.trim()) {
          formErrors.username = 'Username is required';
          isValid = false;
        } else if (username.includes(' ')) {
          formErrors.username = 'Username cannot contain spaces';
          isValid = false;
        }
    
        if (bio && bio.length > 1000) {
          formErrors.bio = 'Bio must be less than 1000 characters';
          isValid = false;
        }
    
        setErrors(formErrors);
        return isValid;
      };
      const handleSave = async () => {
        if (!validateForm()) return;
        setLoading(true);
    
        try {
          const profileData = { name, username, bio, phone, profile_photo: photo };
          const response = await updateCreatorProfile(profileData);
    
          Alert.alert('Success', 'Profile updated successfully', [
            { text: 'OK', onPress: () => navigation.goBack() },
          ]);
        } catch (error) {
          const errorMessage = error.message || 'Failed to update profile';
    
          if (errorMessage.toLowerCase().includes('username') && errorMessage.toLowerCase().includes('taken')) {
            setErrors({ ...errors, username: 'This username is already taken' });
          } else {
            Alert.alert('Error', errorMessage);
          }
        } finally {
          setLoading(false);
        }
      };
      return (
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
    