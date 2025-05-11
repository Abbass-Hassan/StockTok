import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
const HomeScreen = ({navigation}) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to StockTok</Text>
        <Text style={styles.subtitle}>You are logged in successfully!</Text>
        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => navigation.navigate('Dashboard')}>
            <Text style={styles.menuButtonText}>Creator Dashboard</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => navigation.navigate('UploadVideo')}>
            <Text style={styles.menuButtonText}>Upload Video</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => navigation.navigate('MyVideos')}>
            <Text style={styles.menuButtonText}>My Videos</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};
