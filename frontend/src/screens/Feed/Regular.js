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
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {getUserData} from '../../utils/tokenStorage';

const Regular = ({navigation}) => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
    loadUserData();
  }, [navigation]);

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
            navigation.reset({
              index: 0,
              routes: [{name: 'Login'}],
            });
          },
        },
      ],
      {cancelable: true},
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>StockTok</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.welcomeText}>
          Welcome, {userData?.name || userData?.username || 'Investor'}!
        </Text>

        <Text style={styles.description}>
          You're logged in as a regular user (Investor).
        </Text>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Discover</Text>
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => navigation.navigate('VideoFeed')}>
              <Ionicons
                name="play-circle-outline"
                size={20}
                color="#FFFFFF"
                style={styles.icon}
              />
              <Text style={styles.menuButtonText}>Discover Videos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => navigation.navigate('Search')}>
              <Ionicons
                name="search-outline"
                size={20}
                color="#FFFFFF"
                style={styles.icon}
              />
              <Text style={styles.menuButtonText}>Search Creators</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Investments</Text>
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => navigation.navigate('Portfolio')}>
              <Ionicons
                name="wallet-outline"
                size={20}
                color="#FFFFFF"
                style={styles.icon}
              />
              <Text style={styles.menuButtonText}>Investment Portfolio</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => navigation.navigate('AllInvestments')}>
              <Ionicons
                name="stats-chart-outline"
                size={20}
                color="#FFFFFF"
                style={styles.icon}
              />
              <Text style={styles.menuButtonText}>My Investments</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => navigation.navigate('AIRecommendations')}>
              <Ionicons
                name="bulb-outline"
                size={20}
                color="#FFFFFF"
                style={styles.icon}
              />
              <Text style={styles.menuButtonText}>AI Recommendations</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Wallet</Text>
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => navigation.navigate('WalletOverview')}>
              <Ionicons
                name="card-outline"
                size={20}
                color="#FFFFFF"
                style={styles.icon}
              />
              <Text style={styles.menuButtonText}>My Wallet</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => navigation.navigate('TransactionHistory')}>
              <Ionicons
                name="time-outline"
                size={20}
                color="#FFFFFF"
                style={styles.icon}
              />
              <Text style={styles.menuButtonText}>Transaction History</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons
            name="log-out-outline"
            size={20}
            color="#FF3B30"
            style={styles.icon}
          />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 16 : 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#00796B',
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00796B',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    justifyContent: 'center',
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
    textAlign: 'center',
  },
  icon: {
    marginRight: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FF3B30',
    marginTop: 20,
    width: '100%',
    maxWidth: 350,
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
