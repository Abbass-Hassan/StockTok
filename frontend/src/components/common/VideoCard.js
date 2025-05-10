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
<View style={styles.thumbnailContainer}>
  <Image
    source={{uri: video.thumbnail_url || 'https://via.placeholder.com/400x225'}}
    style={styles.thumbnail}
    resizeMode="cover"
  />
  {video.duration && (
    <View style={styles.durationBadge}>
      <Text style={styles.durationText}>{formatDuration(video.duration)}</Text>
    </View>
  )}
  <View style={styles.playOverlay}>
    <View style={styles.playButton}>
      <Text style={styles.playIcon}>▶</Text>
    </View>
  </View>
</View>;
