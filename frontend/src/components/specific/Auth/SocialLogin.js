import React from 'react';
import {View, TouchableOpacity, Text, Image, StyleSheet} from 'react-native';

const SocialLogin = ({isSignUp = false}) => {
  // Button text based on whether it's sign up or login
  const googleText = isSignUp ? 'Sign up with Google' : 'Continue with Google';
  const facebookText = isSignUp
    ? 'Sign up with Facebook'
    : 'Continue with Facebook';

  return (
    <View style={styles.container}>
      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.divider} />
      </View>

      <TouchableOpacity style={styles.socialButton}>
        <Image
          source={require('../../../assets/icons/Google.png')}
          style={styles.socialIcon}
        />
        <Text style={styles.socialButtonText}>{googleText}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.socialButton}>
        <Image
          source={require('../../../assets/icons/Facebook.png')}
          style={styles.socialIcon}
        />
        <Text style={styles.socialButtonText}>{facebookText}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 20,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    paddingHorizontal: 16,
    color: '#757575',
    fontSize: 14,
  },
  socialButton: {
    flexDirection: 'row',
    height: 50,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  socialIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  socialButtonText: {
    fontSize: 16,
    color: '#333333',
  },
});

export default SocialLogin;
