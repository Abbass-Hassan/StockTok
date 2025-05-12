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
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const profileData = {
        name,
        username,
        bio,
        phone,
        profile_photo: photo,
      };

      const response = await updateCreatorProfile(profileData);

      // Navigate back after successful update
      Alert.alert('Success', 'Profile updated successfully', [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    } catch (error) {
      const errorMessage = error.message || 'Failed to update profile';

      // Check if error is about username uniqueness
      if (
        errorMessage.toLowerCase().includes('username') &&
        errorMessage.toLowerCase().includes('taken')
      ) {
        setErrors({
          ...errors,
          username: 'This username is already taken',
        });
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

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={loading}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Edit Profile</Text>

        <TouchableOpacity
          style={[styles.doneButton, loading && styles.disabledButton]}
          onPress={handleSave}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.doneButtonText}>Done</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Photo */}
        <View style={styles.photoContainer}>
          <TouchableOpacity onPress={selectPhoto}>
            {photoUrl ? (
              <Image source={{uri: photoUrl}} style={styles.profileImage} />
            ) : (
              <View
                style={[styles.profileImage, styles.profileImagePlaceholder]}>
                <Text style={styles.profileInitials}>
                  {name ? name.charAt(0).toUpperCase() : '?'}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={selectPhoto}>
            <Text style={styles.changePhotoText}>Change Profile Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Form */}
        <View style={styles.formContainer}>
          {/* Name Field */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              value={name}
              onChangeText={setName}
              placeholder="Your full name"
              placeholderTextColor="#A0A0A0"
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          {/* Username Field */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Username</Text>
            <TextInput
              style={[styles.input, errors.username && styles.inputError]}
              value={username}
              onChangeText={setUsername}
              placeholder="username"
              placeholderTextColor="#A0A0A0"
              autoCapitalize="none"
            />
            {errors.username && (
              <Text style={styles.errorText}>{errors.username}</Text>
            )}
          </View>

          {/* Bio Field */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Bio</Text>
            <TextInput
              style={[styles.bioInput, errors.bio && styles.inputError]}
              value={bio}
              onChangeText={setBio}
              placeholder="Write a short bio about yourself"
              placeholderTextColor="#A0A0A0"
              multiline
              maxLength={1000}
            />
            {errors.bio && <Text style={styles.errorText}>{errors.bio}</Text>}
            <Text style={styles.charCounter}>{bio.length}/1000</Text>
          </View>

          {/* Private Information Section */}
          <View style={styles.privateInfoSection}>
            <Text style={styles.sectionTitle}>Private Information</Text>

            {/* Phone Field */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Phone</Text>
              <TextInput
                style={[styles.input, errors.phone && styles.inputError]}
                value={phone}
                onChangeText={setPhone}
                placeholder="+1 (123) 456-7890"
                placeholderTextColor="#A0A0A0"
                keyboardType="phone-pad"
              />
              {errors.phone && (
                <Text style={styles.errorText}>{errors.phone}</Text>
              )}
            </View>

            {/* Email Field (non-editable, just for display) */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={profile?.email || ''}
                editable={false}
              />
              <Text style={styles.helperText}>Email cannot be changed</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  cancelButton: {
    paddingVertical: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666666',
  },
  doneButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#00796B',
    borderRadius: 5,
  },
  doneButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  photoContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 12,
  },
  profileImagePlaceholder: {
    backgroundColor: '#E1E4E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitials: {
    fontSize: 48,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  changePhotoText: {
    fontSize: 16,
    color: '#00796B',
    fontWeight: '500',
  },
  formContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333333',
    backgroundColor: '#FFFFFF',
  },
  bioInput: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333333',
    backgroundColor: '#FFFFFF',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  disabledInput: {
    backgroundColor: '#F8F9FA',
    color: '#999999',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
  charCounter: {
    alignSelf: 'flex-end',
    fontSize: 12,
    color: '#999999',
    marginTop: 4,
  },
  privateInfoSection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#00796B',
    marginBottom: 16,
  },
  helperText: {
    fontSize: 12,
    color: '#999999',
    marginTop: 4,
  },
});

export default EditCreatorProfile;
