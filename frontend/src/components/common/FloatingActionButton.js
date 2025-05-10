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

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  fabText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default FloatingActionButton;
