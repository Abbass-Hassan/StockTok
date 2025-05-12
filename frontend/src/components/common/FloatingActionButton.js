import React from 'react';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';

const FloatingActionButton = ({onPress, text}) => {
  return (
    <TouchableOpacity style={styles.fab} onPress={onPress}>
      <Text style={styles.fabText}>{text}</Text>
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({
    fab: {
      position: 'absolute',
      bottom: 20,
      right: 20,
      backgroundColor: '#00796B',
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
  
export default FloatingActionButton;
