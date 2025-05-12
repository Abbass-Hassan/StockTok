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
  const thumbnailUrl =
    video.thumbnail_url || 'https://via.placeholder.com/400x225';

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

export default VideoCard;
