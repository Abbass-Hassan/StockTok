import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';

const SignUpPrompt = ({onPress}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Don't have an account? </Text>
      <TouchableOpacity onPress={onPress}>
        <Text style={styles.link}>SignUp</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  text: {
    color: '#757575',
    fontSize: 14,
  },
  link: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default SignUpPrompt;
