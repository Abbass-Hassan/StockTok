import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
const VideoCard = ({video, onPress, showStats = true, style}) => {
  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={0.9}>
      ...
    </TouchableOpacity>
  );
};
