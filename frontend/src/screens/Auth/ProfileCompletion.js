import React, {useState, useEffect, useContext} from 'react';
import {
  Alert,
  Platform,
  BackHandler,
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';
import * as authApi from '../../api/auth';
import {
  getToken,
  clearToken,
  clearUserData,
  storeUserData,
  getUserData,
} from '../../utils/tokenStorage';
import {AuthContext} from '../../App'; // Import AuthContext

// Import components
import ProfileCompletionForm from '../../components/specific/Auth/ProfileCompletionForm';

const ProfileCompletion = ({navigation, route}) => {
  const {setIsLoggedIn} = useContext(AuthContext); // Get setIsLoggedIn from context

  // Form state
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bio, setBio] = useState('');
  const [gender, setGender] = useState('Male');
  const [userType, setUserType] = useState('Creator');
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

      // Map userType string to user_type_id (as a number, not a string)
      const userTypeId = userType === 'Creator' ? 2 : 1;

      // Prepare profile data
      const profileData = {
        username: username.trim(),
        name: fullName.trim(),
        phone: phoneNumber.trim(),
        bio: bio.trim(),
        gender: gender,
        user_type: userType,
        user_type_id: userTypeId, // This is now a number, not a string
      };

      console.log('Sending profile data:', profileData); // Debug log

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

      // Ensure user_type_id is stored as a number before saving
      if (updatedUserData) {
        // Convert user_type_id to a number if it's a string
        if (typeof updatedUserData.user_type_id === 'string') {
          updatedUserData.user_type_id = parseInt(
            updatedUserData.user_type_id,
            10,
          );
        }
        await storeUserData(updatedUserData);
        console.log(
          'Stored user data with user_type_id:',
          updatedUserData.user_type_id,
        );
      } else {
        // If no updated user data in response, update stored data with local data
        const currentUserData = await getUserData();
        const mergedUserData = {
          ...currentUserData,
          user_type: userType,
          user_type_id: userTypeId, // Make sure this is a number
        };
        await storeUserData(mergedUserData);
        console.log(
          'Stored merged user data with user_type_id:',
          mergedUserData.user_type_id,
        );
      }

      // Set isLoggedIn to true to trigger navigation in the app context
      // Add a small delay to ensure data is stored before navigation
      setTimeout(() => {
        setIsLoggedIn(true);
      }, 300);
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
