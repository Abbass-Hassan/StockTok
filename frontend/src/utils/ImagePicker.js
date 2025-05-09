import React from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet} from 'react-native';

const ImagePicker = ({
  image,
  onPress,
  title = 'Upload Photo',
  size = 120,
  borderColor = '#00796B',
  placeholder,
}) => {
  const containerSize = {width: size, height: size, borderRadius: size / 2};

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.photoContainer, containerSize, {borderColor}]}
        onPress={onPress}>
        {image ? (
          <Image source={{uri: image.uri}} style={styles.photo} />
        ) : (
          <View style={styles.placeholderContainer}>
            {placeholder ? (
              placeholder
            ) : (
              // Using a simple camera icon character instead of an image
              <View style={styles.cameraIconPlaceholder}></View>
            )}
          </View>
        )}
      </TouchableOpacity>
      <Text style={[styles.uploadText, {color: borderColor}]}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 24,
  },
  photoContainer: {
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
    borderWidth: 2,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E0E0E0',
  },
  cameraIconPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIconText: {
    fontSize: 40,
    color: '#757575',
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ImagePicker;
