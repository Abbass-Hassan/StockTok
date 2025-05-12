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
  