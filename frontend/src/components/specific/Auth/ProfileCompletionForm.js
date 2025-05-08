import React, {useRef} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
} from 'react-native';
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
    <ScrollView
      style={styles.scrollContainer}
      showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        {/* Profile Photo */}
        <ImagePicker
          image={profilePhoto}
          onPress={handlePhotoSelect}
          title="Upload Profile Photo"
          size={120}
          borderColor="#00796B"
        />

        {/* Username */}
        <View style={styles.formField}>
          <Text style={styles.fieldLabel}>Username</Text>
          <CustomTextInput
            placeholder="Choose a unique username"
            value={username}
            onChangeText={setUsername}
            error={usernameError}
            returnKeyType="next"
            onSubmitEditing={() => fullNameRef.current?.focus()}
          />
        </View>

        {/* Full Name */}
        <View style={styles.formField}>
          <Text style={styles.fieldLabel}>Full Name</Text>
          <CustomTextInput
            ref={fullNameRef}
            placeholder="Enter your full name"
            value={fullName}
            onChangeText={setFullName}
            error={fullNameError}
            returnKeyType="next"
            onSubmitEditing={() => phoneNumberRef.current?.focus()}
          />
        </View>

        {/* Phone Number */}
        <View style={styles.formField}>
          <Text style={styles.fieldLabel}>Phone Number</Text>
          <CustomTextInput
            ref={phoneNumberRef}
            placeholder="Enter your phone number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            error={phoneNumberError}
            keyboardType="phone-pad"
            returnKeyType="next"
            onSubmitEditing={() => bioRef.current?.focus()}
          />
        </View>

        {/* Gender Selection */}
        <View style={styles.radioGroup}>
          <Text style={styles.fieldLabel}>Gender</Text>
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
        <View style={styles.formField}>
          <Text style={styles.fieldLabel}>Bio</Text>
          <CustomTextInput
            ref={bioRef}
            placeholder="Tell us about yourself"
            value={bio}
            onChangeText={setBio}
            returnKeyType="done"
            multiline={true}
            numberOfLines={3}
            style={styles.bioInput}
          />
        </View>

        {/* User Type Selection */}
        <View style={styles.radioGroup}>
          <Text style={styles.fieldLabel}>User Type</Text>
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  container: {
    width: '100%',
    marginBottom: 20,
  },
  formField: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  radioGroup: {
    marginBottom: 16,
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
    marginTop: 24,
  },
});

export default ProfileCompletionForm;
