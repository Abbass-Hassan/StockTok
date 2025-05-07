import React from 'react';
import {View, StyleSheet} from 'react-native';

const LoginPrompt = ({onPress}) => {
  return (
    <View style={styles.container}>
      {/* Login prompt content will go here */}
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

export default LoginPrompt;
