import React from 'react';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';

const FloatingActionButton = ({onPress, text}) => {
  return (
    <TouchableOpacity style={styles.fab} onPress={onPress}>
      <Text style={styles.fabText}>{text}</Text>
    </TouchableOpacity>
  );
};

export default FloatingActionButton;
