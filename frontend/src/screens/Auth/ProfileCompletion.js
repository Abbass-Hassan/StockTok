import React, {useState} from 'react';
import {Alert, Platform} from 'react-native';
import * as authApi from '../../api/auth';
import {launchImageLibrary} from 'react-native-image-picker';
import {getToken} from '../../utils/tokenStorage';

// Import components
import AuthLayout from '../../components/specific/Auth/AuthLayout';
import Header from '../../components/specific/Auth/Header';
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

    // Phone number validation (optional)
    if (phoneNumber.trim() && !/^\d{10,15}$/.test(phoneNumber.trim())) {
      setPhoneNumberError('Please enter a valid phone number');
      isValid = false;
    }

    return isValid;
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
        Alert.alert(
          'Error',
          'Authentication token not found. Please log in again.',
        );
        navigation.reset({
          index: 0,
          routes: [{name: 'Login'}],
        });
        return;
      }

      // Prepare profile data
      const profileData = {
        username: username.trim(),
        name: fullName.trim(),
        phone: phoneNumber.trim(),
        bio: bio.trim(),
        user_type: userType,
        profile_photo: profilePhoto,
      };

      // Call API to complete profile
      const response = await authApi.completeProfile(token, profileData);
      console.log('Profile completed successfully:', response);

      // Navigate to home screen
      navigation.reset({
        index: 0,
        routes: [{name: 'Home'}],
      });
    } catch (error) {
      console.error('Profile completion error details:', error);

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
    <AuthLayout
      header={
        <Header title="Complete Profile" subtitle="Tell us more about you" />
      }
      form={
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
      }
    />
  );
};

export default ProfileCompletion;
