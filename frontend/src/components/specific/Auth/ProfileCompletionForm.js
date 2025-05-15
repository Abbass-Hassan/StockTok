import React, {useRef} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
} from 'react-native';
import TextInput from '../../../components/common/TextInput';
import Button from '../../../components/common/Button';
// Removed ImagePicker import since we're replacing it with a title

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
  // Removed profilePhoto and handlePhotoSelect props since we're no longer using them
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
        {/* Title Heading - Replacing Profile Photo */}
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>Complete Your Info</Text>
        </View>

        {/* Username */}
        <TextInput
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          error={usernameError}
          returnKeyType="next"
          onSubmitEditing={() => fullNameRef.current?.focus()}
        />

        {/* Full Name */}
        <TextInput
          ref={fullNameRef}
          placeholder="Full Name"
          value={fullName}
          onChangeText={setFullName}
          error={fullNameError}
          returnKeyType="next"
          onSubmitEditing={() => phoneNumberRef.current?.focus()}
        />

        {/* Phone Number */}
        <TextInput
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
        <View style={styles.fieldSection}>
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
        <TextInput
          ref={bioRef}
          placeholder="Bio"
          value={bio}
          onChangeText={setBio}
          returnKeyType="done"
          multiline={true}
          numberOfLines={3}
        />

        {/* User Type Selection */}
        <View style={styles.fieldSection}>
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
        <Button
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
  // New styles for the title
  titleContainer: {
    alignItems: 'center',
    marginBottom: 24, // Same margin as the previous photoContainer
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00796B', // Using your app's primary color
    textAlign: 'center',
    marginVertical: 10, // Add some vertical spacing
  },
  fieldSection: {
    marginBottom: 16,
  },
  fieldLabel: {
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
    marginTop: 24,
  },
});

export default ProfileCompletionForm;
