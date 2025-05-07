import React from 'react';
import {View, StyleSheet} from 'react-native';

const SocialLogin = ({isSignUp = false}) => {
  return (
    <View style={styles.container}>
      {/* Social login content will go here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 20,
  },
});

export default SocialLogin;
