import React from 'react';
import {View, StyleSheet} from 'react-native';

const SignUpPrompt = ({onPress}) => {
  return (
    <View style={styles.container}>
      {/* Sign up prompt content will go here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
});

export default SignUpPrompt;
