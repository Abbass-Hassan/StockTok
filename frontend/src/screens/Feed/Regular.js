import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import {getUserData} from '../../utils/tokenStorage';
import Icon from 'react-native-vector-icons/Ionicons';

const Regular = ({navigation}) => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await getUserData();
      setUserData(user);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

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
              // Simply navigate to login screen
              navigation.reset({
                index: 0,
                routes: [{name: 'Login'}],
              });
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>StockTok for Investors</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.welcomeText}>
          Welcome, {userData?.name || userData?.username || 'Investor'}!
        </Text>

        <Text style={styles.description}>
          You're logged in as a regular user (Investor).
        </Text>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Discover</Text>
          <View style={styles.menuContainer}>
            {/* Video Feed Button */}
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => navigation.navigate('VideoFeed')}>
              <Icon
                name="videocam"
                size={20}
                color="#FFFFFF"
                style={styles.buttonIcon}
              />
              <Text style={styles.menuButtonText}>Discover Videos</Text>
            </TouchableOpacity>

            {/* Search Button */}
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => navigation.navigate('Search')}>
              <Icon
                name="search"
                size={20}
                color="#FFFFFF"
                style={styles.buttonIcon}
              />
              <Text style={styles.menuButtonText}>Search Creators</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Investments</Text>
          <View style={styles.menuContainer}>
            {/* Portfolio Button */}
            <TouchableOpacity
              style={[styles.menuButton, {backgroundColor: '#7A67EE'}]}
              onPress={() => navigation.navigate('Portfolio')}>
              <Icon
                name="pie-chart"
                size={20}
                color="#FFFFFF"
                style={styles.buttonIcon}
              />
              <Text style={styles.menuButtonText}>Investment Portfolio</Text>
            </TouchableOpacity>

            {/* All Investments Button */}
            <TouchableOpacity
              style={[styles.menuButton, {backgroundColor: '#7A67EE'}]}
              onPress={() => navigation.navigate('AllInvestments')}>
              <Icon
                name="list"
                size={20}
                color="#FFFFFF"
                style={styles.buttonIcon}
              />
              <Text style={styles.menuButtonText}>My Investments</Text>
            </TouchableOpacity>

            {/* AI Recommendations Button */}
            <TouchableOpacity
              style={[styles.menuButton, {backgroundColor: '#7A67EE'}]}
              onPress={() => navigation.navigate('AIRecommendations')}>
              <Icon
                name="bulb"
                size={20}
                color="#FFFFFF"
                style={styles.buttonIcon}
              />
              <Text style={styles.menuButtonText}>
                AI Investment Recommendations
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Wallet</Text>
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={[styles.menuButton, {backgroundColor: '#4CAF50'}]}
              onPress={() => navigation.navigate('WalletOverview')}>
              <Icon
                name="wallet"
                size={20}
                color="#FFFFFF"
                style={styles.buttonIcon}
              />
              <Text style={styles.menuButtonText}>My Wallet</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuButton, {backgroundColor: '#4CAF50'}]}
              onPress={() => navigation.navigate('TransactionHistory')}>
              <Icon
                name="time"
                size={20}
                color="#FFFFFF"
                style={styles.buttonIcon}
              />
              <Text style={styles.menuButtonText}>Transaction History</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon
            name="log-out"
            size={20}
            color="#FF3B30"
            style={styles.buttonIcon}
          />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00796B',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  sectionContainer: {
    width: '100%',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    marginLeft: 5,
  },
  menuContainer: {
    width: '100%',
    maxWidth: 350,
  },
  menuButton: {
    backgroundColor: '#00796B',
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  menuButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 10,
  },
  logoutButton: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF3B30',
    marginTop: 20,
    width: '100%',
    maxWidth: 350,
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  logoutButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Regular;
