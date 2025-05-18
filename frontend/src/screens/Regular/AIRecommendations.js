import React, {useState, useEffect, useContext} from 'react';
import {
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Text,
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AuthContext} from '../../App';

export default function AIRecommendations({navigation, route}) {
  const {setIsLoggedIn} = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [portfolioAssessment, setPortfolioAssessment] = useState('');
  const [diversificationStrategy, setDiversificationStrategy] = useState('');
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);

    try {
      const authToken = await AsyncStorage.getItem('stocktok_auth_token');

      console.log(
        'Token from stocktok_auth_token:',
        authToken ? authToken.substring(0, 10) + '...' : 'none',
      );

      if (!authToken) {
        console.error('No authentication token found');
        setError('No authentication token found. Please log in again.');
        setLoading(false);
        return;
      }

      const response = await axios.get(
        'http://35.181.171.137:8000/api/regular/investments/recommendations',
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      );

      console.log('API Response status:', response.status);

      if (response.data.status === 'success') {
        const data = response.data.data.recommendations;

        setPortfolioAssessment(data.portfolio_assessment || '');
        setDiversificationStrategy(data.diversification_strategy || '');
        setRecommendations(data.recommended_videos || []);

        if (data.recommended_videos && data.recommended_videos.length > 0) {
          setSelectedRecommendation(data.recommended_videos[0]);
        }
      } else {
        setError('Failed to load recommendations');
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);

      if (err.response) {
        console.log('Response error:', err.response.status);

        if (err.response.status === 401) {
          setError('Authentication failed. Please log in again.');
        } else {
          setError(`Server error: ${err.response.status}`);
        }
      } else if (err.request) {
        console.log('Request error - no response received');
        setError('No response from server. Check your connection.');
      } else {
        console.log('Error setting up request:', err.message);
        setError(`Request error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleViewVideo = videoId => {
    console.log('Navigating to VideoFeedScreen with videoId:', videoId);
    navigation.navigate('Home', {initialVideoId: videoId});
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Logout',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('stocktok_auth_token');
              await AsyncStorage.removeItem('stocktok_user_data');

              if (setIsLoggedIn) {
                setIsLoggedIn(false);
                console.log('Logged out successfully using AuthContext');
              } else {
                console.log(
                  'setIsLoggedIn function not available in AuthContext',
                );
                Alert.alert(
                  'Logout',
                  'Please restart the app to complete logout',
                  [{text: 'OK'}],
                );
              }
            } catch (e) {
              console.error('Logout error:', e);
              Alert.alert(
                'Logout Error',
                'Failed to complete logout. Please try again.',
                [{text: 'OK'}],
              );
            }
          },
          style: 'destructive',
        },
      ],
      {cancelable: true},
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
        <ActivityIndicator size="large" color="#00796B" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchRecommendations}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      {/* header with logout button */}
      <View style={styles.header}>
        <Text style={styles.title}>AI Recommendations</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="log-out-outline" size={24} color="#00796B" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {/* insights */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Portfolio Insights</Text>
          <Text style={styles.text}>{portfolioAssessment}</Text>
          <Text style={[styles.cardTitle, {marginTop: 12}]}>
            Suggested Strategy
          </Text>
          <Text style={styles.text}>{diversificationStrategy}</Text>
        </View>

        {/* recommendation selector */}
        {recommendations.length > 1 && (
          <View style={styles.recommendationSelector}>
            <Text style={styles.selectorTitle}>Recommended Videos:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {recommendations.map((rec, index) => (
                <TouchableOpacity
                  key={rec.video_id}
                  style={[
                    styles.selectorItem,
                    selectedRecommendation?.video_id === rec.video_id &&
                      styles.selectorItemActive,
                  ]}
                  onPress={() => setSelectedRecommendation(rec)}>
                  <Text
                    style={[
                      styles.selectorItemText,
                      selectedRecommendation?.video_id === rec.video_id &&
                        styles.selectorItemTextActive,
                    ]}>
                    Video {index + 1}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* recommendation */}
        {selectedRecommendation && (
          <View style={styles.card}>
            <View style={styles.rowSpace}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  Video {selectedRecommendation.video_id}
                </Text>
              </View>
              <View style={[styles.badge, {backgroundColor: '#FF6B6B'}]}>
                <Text style={[styles.badgeText, {color: '#fff'}]}>
                  RECOMMENDED
                </Text>
              </View>
            </View>

            <Text style={styles.caption}>Recommended Investment</Text>

            <Text style={[styles.text, styles.italic]}>
              {selectedRecommendation.reason}
            </Text>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, {backgroundColor: '#00796B'}]}
                onPress={() =>
                  handleViewVideo(selectedRecommendation.video_id)
                }>
                <Text style={styles.buttonText}>View Video</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#00796B',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  container: {flex: 1, backgroundColor: '#FFF'},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#EEE',
  },
  title: {fontSize: 18, fontWeight: '600', color: '#00796B'},
  logoutButton: {
    padding: 8,
  },
  content: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EEE',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8},
  text: {fontSize: 14, color: '#555', lineHeight: 20},
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#E0F2F1',
    borderRadius: 4,
  },
  badgeText: {fontSize: 12, fontWeight: '600', color: '#00796B'},
  row: {flexDirection: 'row', alignItems: 'center', marginVertical: 8},
  rowSpace: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  caption: {fontSize: 16, fontWeight: '600', color: '#222', marginBottom: 8},
  creator: {fontSize: 14, color: '#555', marginLeft: 6},
  italic: {fontStyle: 'italic', marginBottom: 12},
  suggested: {fontSize: 14, fontWeight: '600', color: '#00796B'},
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 150,
  },
  buttonText: {color: '#FFF', fontSize: 16, fontWeight: '600'},
  recommendationSelector: {
    marginBottom: 16,
  },
  selectorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  selectorItem: {
    padding: 8,
    borderRadius: 6,
    marginRight: 10,
    backgroundColor: '#E0F2F1',
  },
  selectorItemActive: {
    backgroundColor: '#00796B',
  },
  selectorItemText: {
    color: '#00796B',
    fontWeight: '600',
  },
  selectorItemTextActive: {
    color: '#FFFFFF',
  },
});
