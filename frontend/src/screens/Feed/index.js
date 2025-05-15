import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  StatusBar,
  ScrollView,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const HomeScreen = ({navigation}) => {
  useEffect(() => {
    navigation.setOptions({headerShown: false});
  }, [navigation]);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            try {
              navigation.reset({index: 0, routes: [{name: 'Login'}]});
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ],
      {cancelable: true},
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>StockTok</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.welcomeText}>Welcome to StockTok</Text>
        <Text style={styles.subtitle}>
          You are logged in successfully as a Creator!
        </Text>

        {/* Creator Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Creator</Text>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => navigation.navigate('Dashboard')}>
            <Ionicons
              name="speedometer-outline"
              size={20}
              style={styles.icon}
            />
            <Text style={styles.menuButtonText}>Creator Dashboard</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => navigation.navigate('UploadVideo')}>
            <Ionicons
              name="cloud-upload-outline"
              size={20}
              style={styles.icon}
            />
            <Text style={styles.menuButtonText}>Upload Video</Text>
          </TouchableOpacity>
        </View>

        {/* Account Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => navigation.navigate('WalletOverview')}>
            <Ionicons name="wallet-outline" size={20} style={styles.icon} />
            <Text style={styles.menuButtonText}>My Wallet</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => navigation.navigate('CreatorProfile')}>
            <Ionicons name="person-outline" size={20} style={styles.icon} />
            <Text style={styles.menuButtonText}>My Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Settings Section */}
        <View style={styles.sectionContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons
              name="log-out-outline"
              size={20}
              style={styles.logoutIcon}
            />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#FFFFFF'},
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 16 : 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    alignItems: 'center',
  },
  headerTitle: {fontSize: 20, fontWeight: '600', color: '#00796B'},
  content: {padding: 20, paddingBottom: 40, alignItems: 'center'},
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00796B',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionContainer: {width: '100%', maxWidth: 350, marginTop: 20},
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#444',
    marginBottom: 10,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00796B',
    padding: 16,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },
  icon: {marginRight: 10, color: '#FFFFFF'},
  menuButtonText: {color: '#FFFFFF', fontSize: 16, fontWeight: '600'},
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FF3B30',
    marginBottom: 15,
    elevation: 1,
  },
  logoutIcon: {marginRight: 10, color: '#FF3B30'},
  logoutButtonText: {color: '#FF3B30', fontSize: 16, fontWeight: 'bold'},
});

export default HomeScreen;
