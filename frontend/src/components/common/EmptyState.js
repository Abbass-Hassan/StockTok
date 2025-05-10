import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
const EmptyState = ({
  title = 'No Videos Yet',
  description = "You haven't uploaded any videos yet",
  actionText = 'Upload Video',
  onAction,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Text style={styles.iconText}>📹</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {onAction && (
        <TouchableOpacity style={styles.button} onPress={onAction}>
          <Text style={styles.buttonText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
