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
<View style={styles.infoContainer}>
  <Text style={styles.caption} numberOfLines={2}>
    {video.caption}
  </Text>

  {showStats && (
    <View style={styles.statsRow}>
      <View style={styles.statItem}>
        <Text style={styles.statLabel}>Views:</Text>
        <Text style={styles.statText}>
          {formatCount(video.view_count || 0)}
        </Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statLabel}>Value:</Text>
        <Text style={[styles.statText, styles.valueText]}>
          ${formatValue(video.current_value || 0)}
        </Text>
      </View>
    </View>
  )}
</View>;
const formatDuration = seconds => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const formatCount = count => {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
};

const formatValue = value => {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toFixed(2);
};
const styles = StyleSheet.create({
    card: { ... },
    thumbnailContainer: { ... },
    thumbnail: { ... },
    durationBadge: { ... },
    durationText: { ... },
    playOverlay: { ... },
    playButton: { ... },
    playIcon: { ... },
    infoContainer: { ... },
    caption: { ... },
    statsRow: { ... },
    statItem: { ... },
    statLabel: { ... },
    statText: { ... },
    valueText: { ... },
  });
  