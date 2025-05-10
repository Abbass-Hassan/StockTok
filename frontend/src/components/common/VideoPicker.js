import React from 'react';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';
const FloatingActionButton = ({
  onPress,
  text = '+',
  backgroundColor = '#00796B',
  textColor = '#FFFFFF',
  size = 56,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.fab,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}>
      <Text style={[styles.fabText, {color: textColor}]}>{text}</Text>
    </TouchableOpacity>
  );
};
