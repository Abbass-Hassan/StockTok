import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';

const VideoCard = ({video, onPress, showStats = true, style}) => {
  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={0.9}>
      {/* Thumbnail Section */}
      <View style={styles.thumbnailContainer}>
        <Image
          source={{
            uri: video.thumbnail_url || 'https://via.placeholder.com/400x225',
          }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        {/* Duration Badge */}
        {video.duration && (
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>
              {formatDuration(video.duration)}
            </Text>
          </View>
        )}
        {/* Play Button Overlay */}
        <View style={styles.playOverlay}>
          <View style={styles.playButton}>
            <Text style={styles.playIcon}>▶</Text>
          </View>
        </View>
      </View>

      {/* Video Info Section */}
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
      </View>
    </TouchableOpacity>
  );
};

// Helper functions
const formatDuration = seconds => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const formatCount = count => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

const formatValue = value => {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toFixed(2);
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbnailContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F0F0F0',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 121, 107, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    color: '#FFFFFF',
    fontSize: 20,
    marginLeft: 3,
  },
  infoContainer: {
    padding: 12,
  },
  caption: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statLabel: {
    fontSize: 14,
    color: '#666666',
  },
  statText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  valueText: {
    color: '#00796B',
    fontWeight: '600',
  },
});

export default VideoCard;
