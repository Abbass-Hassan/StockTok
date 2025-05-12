import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';

const EmptyState = ({title, description, actionText, onAction}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionText && onAction && (
        <TouchableOpacity style={styles.actionButton} onPress={onAction}>
          <Text style={styles.actionButtonText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};const styles = StyleSheet.create({
    container: {
      padding: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#00796B',
      marginBottom: 8,
      textAlign: 'center',
    },
    description: {
      fontSize: 14,
      color: '#666666',
      textAlign: 'center',
      marginBottom: 20,
    },
  

export default EmptyState;
