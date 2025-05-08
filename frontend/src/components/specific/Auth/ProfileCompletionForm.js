import React, {useRef} from 'react';
import {View, StyleSheet} from 'react-native';
import CustomTextInput from '../../common/CustomTextInput';
import CustomButton from '../../common/CustomButton';
import ImagePicker from '../../../utils/ImagePicker';

const ProfileCompletionForm = ({
  username,
  setUsername,
  fullName,
  setFullName,
  phoneNumber,
  setPhoneNumber,
  bio,
  setBio,
  profilePhoto,
  handlePhotoSelect,
  handleSubmit,
  loading,
  usernameError,
  fullNameError,
  phoneNumberError,
}) => {
  // References for focus management
  const fullNameRef = useRef(null);
  const phoneNumberRef = useRef(null);
  const bioRef = useRef(null);

  return (
    <View style={styles.container}>
      {/* Profile Photo */}
      <ImagePicker
        image={profilePhoto}
        onPress={handlePhotoSelect}
        title="Upload Profile Photo"
      />

      {/* Username */}
      <CustomTextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        error={usernameError}
        returnKeyType="next"
        onSubmitEditing={() => fullNameRef.current?.focus()}
      />

      {/* Full Name */}
      <CustomTextInput
        ref={fullNameRef}
        placeholder="Full Name"
        value={fullName}
        onChangeText={setFullName}
        error={fullNameError}
        returnKeyType="next"
        onSubmitEditing={() => phoneNumberRef.current?.focus()}
      />

      {/* Phone Number */}
      <CustomTextInput
        ref={phoneNumberRef}
        placeholder="Phone Number"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        error={phoneNumberError}
        keyboardType="phone-pad"
        returnKeyType="next"
        onSubmitEditing={() => bioRef.current?.focus()}
      />

      {/* Bio */}
      <CustomTextInput
        ref={bioRef}
        placeholder="Bio"
        value={bio}
        onChangeText={setBio}
        returnKeyType="done"
      />

      {/* Submit Button */}
      <CustomButton
        title="Submit"
        onPress={handleSubmit}
        loading={loading}
        style={styles.submitButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 20,
  },
  submitButton: {
    marginTop: 16,
  },
});

export default ProfileCompletionForm;
