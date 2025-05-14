import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

// Simple mock data for presentation
const MOCK_DATA = {
  success: true,
  recommendations: {
    recommendations: [
      {
        video_id: 1,
        reason: 'Popular trending video in your favorite Tech category',
        suggested_amount: '$10-$20',
        priority: 'high',
        video_details: {
          id: 1,
          caption: 'Check out this new AI-powered smartphone!',
          category: 'Tech',
          creator: 'TechGuru',
          view_count: 8500,
          like_investment_count: 450,
          current_value: 35.5,
        },
      },
      {
        video_id: 2,
        reason: 'Diversify your portfolio with this trending Cooking content',
        suggested_amount: '$5-$15',
        priority: 'medium',
        video_details: {
          id: 2,
          caption: 'Easy 15-minute pasta recipe everyone will love',
          category: 'Cooking',
          creator: 'ChefMasters',
          view_count: 5500,
          like_investment_count: 320,
          current_value: 22.75,
        },
      },
      {
        video_id: 3,
        reason: 'High growth potential in the Gaming niche',
        suggested_amount: '$15-$25',
        priority: 'high',
        video_details: {
          id: 3,
          caption: 'Top 5 gaming strategies that actually work',
          category: 'Gaming',
          creator: 'ProGamer',
          view_count: 9600,
          like_investment_count: 780,
          current_value: 42.3,
        },
      },
    ],
    portfolio_insights:
      'Your portfolio is currently tech-heavy. Consider diversifying into entertainment and lifestyle categories for more balanced returns.',
    investment_strategy:
      'Focus on high-engagement creators with consistent posting schedules. Spread investments across 3-4 different content categories.',
  },
  portfolio_analysis: {
    total_invested: 55.0,
    total_current_value: 77.75,
    overall_return_percentage: 41.36,
  },
};

const AIRecommendations = ({navigation}) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    // Simulate loading for presentation
    setTimeout(() => {
      setData(MOCK_DATA);
      setLoading(false);
    }, 1500);
  }, []);

  // Convert investment priority to color
  const getPriorityColor = priority => {
    switch (priority.toLowerCase()) {
      case 'high':
        return '#FF6B6B';
      case 'medium':
        return '#FFD166';
      case 'low':
        return '#06D6A0';
      default:
        return '#7A67EE';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <ActivityIndicator size="large" color="#00796B" />
        <Text style={styles.loadingText}>Getting smart recommendations...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI Investment Recommendations</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.overviewCard}>
          <Text style={styles.cardTitle}>Your Portfolio Overview</Text>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                ${data.portfolio_analysis.total_invested.toFixed(2)}
              </Text>
              <Text style={styles.statLabel}>Total Invested</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                ${data.portfolio_analysis.total_current_value.toFixed(2)}
              </Text>
              <Text style={styles.statLabel}>Current Value</Text>
            </View>
            <View style={styles.statItem}>
              <Text
                style={[
                  styles.statValue,
                  {
                    color:
                      data.portfolio_analysis.overall_return_percentage >= 0
                        ? '#4CAF50'
                        : '#FF3B30',
                  },
                ]}>
                {data.portfolio_analysis.overall_return_percentage.toFixed(2)}%
              </Text>
              <Text style={styles.statLabel}>Return</Text>
            </View>
          </View>
        </View>

        <View style={styles.insightsCard}>
          <Text style={styles.cardTitle}>Portfolio Insights</Text>
          <Text style={styles.insightText}>
            {data.recommendations.portfolio_insights}
          </Text>

          <Text style={[styles.cardTitle, {marginTop: 15}]}>
            Suggested Strategy
          </Text>
          <Text style={styles.insightText}>
            {data.recommendations.investment_strategy}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Recommended Videos</Text>

        {data.recommendations.recommendations.map((item, index) => (
          <View key={index} style={styles.recommendationCard}>
            <View style={styles.cardHeader}>
              <View style={styles.categoryContainer}>
                <Text style={styles.categoryText}>
                  {item.video_details.category}
                </Text>
              </View>
              <View
                style={[
                  styles.priorityContainer,
                  {backgroundColor: getPriorityColor(item.priority)},
                ]}>
                <Text style={styles.priorityText}>
                  {item.priority.toUpperCase()}
                </Text>
              </View>
            </View>

            <Text style={styles.videoCaption}>
              {item.video_details.caption}
            </Text>

            <View style={styles.creatorRow}>
              <Icon name="person-circle" size={16} color="#555" />
              <Text style={styles.creatorName}>
                {item.video_details.creator}
              </Text>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statRow}>
                <View style={styles.stat}>
                  <Icon name="eye" size={14} color="#555" />
                  <Text style={styles.statText}>
                    {item.video_details.view_count.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.stat}>
                  <Icon name="heart" size={14} color="#555" />
                  <Text style={styles.statText}>
                    {item.video_details.like_investment_count}
                  </Text>
                </View>
                <View style={styles.stat}>
                  <Icon name="trending-up" size={14} color="#4CAF50" />
                  <Text style={[styles.statText, {color: '#4CAF50'}]}>
                    ${item.video_details.current_value.toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>

            <Text style={styles.reasonText}>{item.reason}</Text>

            <View style={styles.investRow}>
              <View style={styles.amountContainer}>
                <Text style={styles.amountLabel}>Suggested Investment:</Text>
                <Text style={styles.amountValue}>{item.suggested_amount}</Text>
              </View>
              <View style={styles.investTag}>
                <Text style={styles.investTagText}>Recommended</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#555',
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
    padding: 16,
    paddingBottom: 40,
  },
  overviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  insightsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  insightText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    marginTop: 4,
  },
  recommendationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  categoryContainer: {
    backgroundColor: '#E0F2F1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  categoryText: {
    color: '#00796B',
    fontSize: 12,
    fontWeight: '600',
  },
  priorityContainer: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  priorityText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  videoCaption: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  creatorName: {
    fontSize: 14,
    color: '#555',
    marginLeft: 5,
  },
  statsContainer: {
    marginBottom: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 12,
    color: '#555',
    marginLeft: 4,
  },
  reasonText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  investRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  amountContainer: {
    flexDirection: 'column',
  },
  amountLabel: {
    fontSize: 12,
    color: '#666',
  },
  amountValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  investTag: {
    backgroundColor: '#00796B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  investTagText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AIRecommendations;
