import React, {useState, useEffect} from 'react';
import {
  Alert,
  Platform,
  BackHandler,
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';
import * as authApi from '../../api/auth';
import {launchImageLibrary} from 'react-native-image-picker';
import {
  getToken,
  clearToken,
  clearUserData,
  storeUserData,
} from '../../utils/tokenStorage';

// Import components
import ProfileCompletionForm from '../../components/specific/Auth/ProfileCompletionForm';

const ProfileCompletion = ({navigation, route}) => {
  // Form state
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bio, setBio] = useState('');
  const [gender, setGender] = useState('Male');
  const [userType, setUserType] = useState('Creator');
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form validation errors
  const [usernameError, setUsernameError] = useState('');
  const [fullNameError, setFullNameError] = useState('');
  const [phoneNumberError, setPhoneNumberError] = useState('');

  // Set navigation options to hide header
  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  // Prevent going back to login after registration
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        // If the user is trying to go back to login, show a confirmation dialog
        Alert.alert(
          'Exit App',
          'Are you sure you want to exit? Your profile is not complete.',
          [
            {text: 'Cancel', style: 'cancel', onPress: () => {}},
            {
              text: 'Exit',
              style: 'destructive',
              onPress: () => {
                // Clear user data and token since profile wasn't completed
                clearToken();
                clearUserData();
                BackHandler.exitApp();
              },
            },
          ],
          {cancelable: false},
        );
        return true;
      },
    );

    return () => backHandler.remove();
  }, []);

  // Handle photo selection
  const handlePhotoSelect = async () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 500,
      maxHeight: 500,
    };

    try {
      const result = await launchImageLibrary(options);

      if (result.didCancel) {
        console.log('User cancelled image picker');
      } else if (result.errorCode) {
        console.log('ImagePicker Error: ', result.errorMessage);
        Alert.alert('Error', 'There was an error selecting the image.');
      } else if (result.assets && result.assets.length > 0) {
        setProfilePhoto(result.assets[0]);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'There was an error selecting the image.');
    }
  };

  // Validate form inputs
  const validateForm = () => {
    let isValid = true;

    // Reset errors
    setUsernameError('');
    setFullNameError('');
    setPhoneNumberError('');

    // Username validation
    if (!username.trim()) {
      setUsernameError('Username is required');
      isValid = false;
    } else if (username.trim().length < 3) {
      setUsernameError('Username must be at least 3 characters');
      isValid = false;
    }

    // Full name validation
    if (!fullName.trim()) {
      setFullNameError('Full name is required');
      isValid = false;
    }

    // Phone number validation
    // Update the regex pattern to match your requirements
    const phonePattern = /^\d{8,15}$/; // Accepts 8-15 digits
    if (phoneNumber.trim() && !phonePattern.test(phoneNumber.trim())) {
      setPhoneNumberError('Please enter a valid phone number');
      isValid = false;
    }

    return isValid;
  };

  const handleSessionExpired = () => {
    // Clear user data and token
    clearToken();
    clearUserData();

    // Alert the user
    Alert.alert(
      'Session Expired',
      'Your session has expired. Please log in again.',
      [
        {
          text: 'OK',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{name: 'Login'}],
            });
          },
        },
      ],
      {cancelable: false},
    );
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // Get the auth token
      const token = await getToken();

      if (!token) {
        handleSessionExpired();
        return;
      }

      // Map userType string to user_type_id
      const userTypeId = userType === 'Creator' ? 2 : 1;

      // Prepare profile data
      const profileData = {
        username: username.trim(),
        name: fullName.trim(),
        phone: phoneNumber.trim(),
        bio: bio.trim(),
        gender: gender,
        user_type: userType,
        user_type_id: userTypeId,
        profile_photo: profilePhoto,
      };

      // Call API to complete profile
      const response = await authApi.completeProfile(token, profileData);
      console.log('Profile completed successfully:', response);

      // Extract updated user data from response if available
      let updatedUserData = null;
      if (response?.data?.user) {
        updatedUserData = response.data.user;
      } else if (response?.data?.data?.user) {
        updatedUserData = response.data.data.user;
      } else if (response?.user) {
        updatedUserData = response.user;
      } else if (response?.data) {
        updatedUserData = response.data;
      }

      // Update stored user data if available
      if (updatedUserData) {
        await storeUserData(updatedUserData);
      } else {
        // If no updated user data in response, update stored data with local data
        const currentUserData = await getUserData();
        const mergedUserData = {
          ...currentUserData,
          user_type: userType,
          user_type_id: userTypeId,
        };
        await storeUserData(mergedUserData);
      }

      // Navigate based on user type
      if (userType === 'Creator' || userTypeId === 2) {
        // Navigate to Creator Feed
        navigation.reset({
          index: 0,
          routes: [{name: 'CreatorFeed'}],
        });
      } else {
        // Navigate to Regular/Investor Feed
        navigation.reset({
          index: 0,
          routes: [{name: 'RegularFeed'}],
        });
      }
    } catch (error) {
      console.error('Profile completion error details:', error);

      // Handle session expired error (401)
      if (error.response?.status === 401) {
        handleSessionExpired();
        return;
      }

      // Handle server validation errors
      if (error.response?.data?.errors) {
        const serverErrors = error.response.data.errors;

        if (serverErrors.username) {
          setUsernameError(serverErrors.username[0]);
        }

        if (serverErrors.name) {
          setFullNameError(serverErrors.name[0]);
        }

        if (serverErrors.phone) {
          setPhoneNumberError(serverErrors.phone[0]);
        }
      }

      // Show error alert
      Alert.alert(
        'Error',
        error.response?.data?.message ||
          error.message ||
          'Failed to complete profile',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.formContainer}>
        <ProfileCompletionForm
          username={username}
          setUsername={setUsername}
          fullName={fullName}
          setFullName={setFullName}
          phoneNumber={phoneNumber}
          setPhoneNumber={setPhoneNumber}
          bio={bio}
          setBio={setBio}
          gender={gender}
          setGender={setGender}
          userType={userType}
          setUserType={setUserType}
          profilePhoto={profilePhoto}
          handlePhotoSelect={handlePhotoSelect}
          handleSubmit={handleSubmit}
          loading={loading}
          usernameError={usernameError}
          fullNameError={fullNameError}
          phoneNumberError={phoneNumberError}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
});

export default ProfileCompletion;
