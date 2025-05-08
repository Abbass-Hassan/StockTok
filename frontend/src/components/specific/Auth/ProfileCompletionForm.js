import React, {useRef} from 'react';
import {View, StyleSheet, TouchableOpacity, Text} from 'react-native';
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
  gender,
  setGender,
  userType,
  setUserType,
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

      {/* Gender Selection */}
      <View style={styles.radioGroup}>
        <Text style={styles.radioGroupLabel}>Gender</Text>
        <View style={styles.radioOptions}>
          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => setGender('Male')}>
            <View
              style={[
                styles.radioButton,
                gender === 'Male' && styles.radioButtonSelected,
              ]}>
              {gender === 'Male' && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.radioText}>Male</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => setGender('Female')}>
            <View
              style={[
                styles.radioButton,
                gender === 'Female' && styles.radioButtonSelected,
              ]}>
              {gender === 'Female' && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.radioText}>Female</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bio */}
      <CustomTextInput
        ref={bioRef}
        placeholder="Bio"
        value={bio}
        onChangeText={setBio}
        returnKeyType="done"
      />

      {/* User Type Selection */}
      <View style={styles.radioGroup}>
        <Text style={styles.radioGroupLabel}>User Type</Text>
        <View style={styles.radioOptions}>
          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => setUserType('Creator')}>
            <View
              style={[
                styles.radioButton,
                userType === 'Creator' && styles.radioButtonSelected,
              ]}>
              {userType === 'Creator' && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.radioText}>Creator</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => setUserType('Investor')}>
            <View
              style={[
                styles.radioButton,
                userType === 'Investor' && styles.radioButtonSelected,
              ]}>
              {userType === 'Investor' && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.radioText}>Investor</Text>
          </TouchableOpacity>
        </View>
      </View>

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
  radioGroup: {
    marginBottom: 16,
  },
  radioGroupLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  radioOptions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#00796B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  radioButtonSelected: {
    borderColor: '#00796B',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#00796B',
  },
  radioText: {
    fontSize: 16,
    color: '#333',
  },
  submitButton: {
    marginTop: 16,
  },
});

export default ProfileCompletionForm;
