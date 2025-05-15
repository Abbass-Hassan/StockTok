// AIRecommendations.js

import React, {useState, useEffect} from 'react';
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
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

// many mock recommendations
const MOCK_RECOMMENDATIONS = [
  {
    video_id: 1,
    caption: 'Check out this new AI-powered smartphone!',
    creator: 'TechGuru',
    category: 'Tech',
    reason: 'Popular trending video in your favorite Tech category',
    suggested_amount: '$10–$20',
    priority: 'high',
  },
  {
    video_id: 2,
    caption: 'Easy 15-minute pasta recipe everyone will love',
    creator: 'ChefMasters',
    category: 'Cooking',
    reason: 'Diversify with this trending Cooking content',
    suggested_amount: '$5–$15',
    priority: 'medium',
  },
  {
    video_id: 3,
    caption: 'Top 5 gaming strategies that actually work',
    creator: 'ProGamer',
    category: 'Gaming',
    reason: 'High growth potential in the Gaming niche',
    suggested_amount: '$15–$25',
    priority: 'high',
  },
  {
    video_id: 4,
    caption: 'Top 10 summer outfits for 2025',
    creator: 'StyleIcon',
    category: 'Fashion',
    reason: 'Seasonal fashion trends driving high engagement',
    suggested_amount: '$8–$18',
    priority: 'medium',
  },
  {
    video_id: 5,
    caption: 'Quick home workout you can do anywhere',
    creator: 'FitLife',
    category: 'Fitness',
    reason: 'Fitness niche is on the rise—steady returns expected',
    suggested_amount: '$5–$12',
    priority: 'low',
  },
  {
    video_id: 6,
    caption: 'How to meditate: beginner guide',
    creator: 'ZenMaster',
    category: 'Wellness',
    reason: 'Wellness content has consistent engagement',
    suggested_amount: '$4–$10',
    priority: 'low',
  },
  {
    video_id: 7,
    caption: 'DIY home decor hacks for under $20',
    creator: 'CraftyHands',
    category: 'DIY',
    reason: 'DIY projects attract engaged viewers',
    suggested_amount: '$7–$17',
    priority: 'medium',
  },
  {
    video_id: 8,
    caption: 'Mastering personal finance in 5 steps',
    creator: 'MoneyWise',
    category: 'Finance',
    reason: 'Finance tutorials drive high-quality engagement',
    suggested_amount: '$12–$22',
    priority: 'high',
  },
];

const PORTFOLIO_INSIGHTS =
  'Your portfolio is currently tech-heavy. Consider diversifying into entertainment and lifestyle categories for more balanced returns.';
const INVESTMENT_STRATEGY =
  'Focus on high-engagement creators with consistent posting schedules. Spread investments across 3–4 different content categories.';

export default function AIRecommendations({navigation}) {
  const [loading, setLoading] = useState(true);
  const [rec, setRec] = useState(null);

  useEffect(() => {
    const pick =
      MOCK_RECOMMENDATIONS[
        Math.floor(Math.random() * MOCK_RECOMMENDATIONS.length)
      ];
    setTimeout(() => {
      setRec(pick);
      setLoading(false);
    }, 800);
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
        <ActivityIndicator size="large" color="#00796B" />
      </SafeAreaView>
    );
  }

  const {caption, creator, category, reason, suggested_amount, priority} = rec;
  const priorityColors = {high: '#FF6B6B', medium: '#FFD166', low: '#06D6A0'};

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      {/* header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>AI Recommendations</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {/* insights */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Portfolio Insights</Text>
          <Text style={styles.text}>{PORTFOLIO_INSIGHTS}</Text>
          <Text style={[styles.cardTitle, {marginTop: 12}]}>
            Suggested Strategy
          </Text>
          <Text style={styles.text}>{INVESTMENT_STRATEGY}</Text>
        </View>

        {/* recommendation */}
        <View style={styles.card}>
          <View style={styles.rowSpace}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{category}</Text>
            </View>
            <View
              style={[
                styles.badge,
                {backgroundColor: priorityColors[priority]},
              ]}>
              <Text style={[styles.badgeText, {color: '#fff'}]}>
                {priority.toUpperCase()}
              </Text>
            </View>
          </View>

          <Text style={styles.caption}>{caption}</Text>

          <View style={styles.row}>
            <Icon name="person-circle-outline" size={16} color="#555" />
            <Text style={styles.creator}>@{creator}</Text>
          </View>

          <Text style={[styles.text, styles.italic]}>{reason}</Text>

          <View style={styles.rowSpace}>
            <Text style={[styles.text, styles.suggested]}>
              Suggested: {suggested_amount}
            </Text>
            <TouchableOpacity
              style={[styles.button, {backgroundColor: '#00796B'}]}>
              <Text style={styles.buttonText}>Recommended</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  container: {flex: 1, backgroundColor: '#FFF'},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#EEE',
  },
  back: {fontSize: 28, color: '#00796B'},
  title: {fontSize: 18, fontWeight: '600', marginLeft: 12, color: '#00796B'},
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
  button: {paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6},
  buttonText: {color: '#FFF', fontSize: 14, fontWeight: '600'},
});
