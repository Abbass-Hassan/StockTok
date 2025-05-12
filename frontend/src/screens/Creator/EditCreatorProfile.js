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
    