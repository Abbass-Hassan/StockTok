import React from 'react';
import {
  TouchableOpacity,
  Image,
  Text,
  View,
  StyleSheet,
  Dimensions,
} from 'react-native';

const {width} = Dimensions.get('window');
const CARD_WIDTH = width - 32; // Full width minus padding

const VideoCard = ({video, onPress}) => {
  // Default thumbnail if none provided
  const thumbnailUrl =
    video.thumbnail_url || 'https://via.placeholder.com/400x225';

  // Format view count for display
  const formatViewCount = count => {
    if (!count && count !== 0) return '0 views';

    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M views`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K views`;
    }
    return `${count} ${count === 1 ? 'view' : 'views'}`;
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image
        source={{uri: thumbnailUrl}}
        style={styles.thumbnail}
        resizeMode="cover"
      />
      <View style={styles.infoContainer}>
        <Text style={styles.captionText} numberOfLines={2}>
          {video.caption || 'Video'}
        </Text>
        <View style={styles.statsContainer}>
          <Text style={styles.statText}>
            {formatViewCount(video.view_count)}
          </Text>
          {video.created_at && (
            <Text style={styles.statText}>
              • {new Date(video.created_at).toLocaleDateString()}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  thumbnail: {
    width: '100%',
    height: 200,
    backgroundColor: '#E1E4E8',
  },
  infoContainer: {
    padding: 12,
  },
  captionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
    color: '#666666',
  },
});

export default VideoCard;
