import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore, useUserProgress } from '../store/userStore';
import { calculateTdee, getProgressInsights } from '../utils/tdee';

export default function DashboardScreen() {
  const {
    user,
    weightEntries,
    calorieEntries,
    currentTdeeAnalysis,
    currentPhase,
    loadUserData,
  } = useUserStore();

  const progress = useUserProgress();

  useEffect(() => {
    loadUserData();
  }, []);

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const insights = getProgressInsights(weightEntries, calorieEntries, currentTdeeAnalysis?.targetCalories);
  const tdeeData = weightEntries.length >= 3 && calorieEntries.length >= 3 
    ? calculateTdee(weightEntries, calorieEntries, user.id)
    : null;

  const currentWeight = weightEntries.length > 0 ? weightEntries[0].weight : user.weight;
  const weightProgress = ((currentWeight - user.weight) / (user.goalWeight - user.weight)) * 100;

  const getPhaseInfo = () => {
    switch (currentPhase) {
      case 'calibration':
        return {
          title: 'TDEE Calibration Phase',
          subtitle: `Day ${progress.daysTracking} of minimum 7 days`,
          description: 'Track your weight and calories daily to calculate your real TDEE',
          color: '#3b82f6',
        };
      case 'meal_planning':
        return {
          title: 'AI Meal Planning Phase',
          subtitle: 'Ready for personalized meal plans',
          description: 'Generate AI-powered meal plans based on your calculated TDEE',
          color: '#8b5cf6',
        };
      case 'tracking':
        return {
          title: 'Active Tracking Phase',
          subtitle: 'Following your personalized plan',
          description: 'Monitor progress and adjust your meal plans as needed',
          color: '#10b981',
        };
      default:
        return {
          title: 'Getting Started',
          subtitle: 'Complete setup to begin',
          description: 'Finish your profile setup to start tracking',
          color: '#6b7280',
        };
    }
  };

  const phaseInfo = getPhaseInfo();

  const handleGenerateTdee = () => {
    if (progress.weightEntries < 7 || progress.calorieEntries < 7) {
      Alert.alert(
        'Insufficient Data',
        `You need at least 7 days of data. Current: ${progress.weightEntries} weight entries, ${progress.calorieEntries} calorie entries.`
      );
      return;
    }

    // Here you would call the TDEE generation function
    Alert.alert('TDEE Analysis', 'This will generate your personalized TDEE analysis and move you to the meal planning phase.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {user.firstName}!</Text>
            <Text style={styles.headerSubtitle}>Let's gain some weight today</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileInitial}>{user.firstName.charAt(0).toUpperCase()}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Phase Status Card */}
        <View style={styles.phaseCard}>
          <LinearGradient
            colors={[phaseInfo.color, phaseInfo.color + '80']}
            style={styles.phaseGradient}
          >
            <View style={styles.phaseContent}>
              <View style={styles.phaseHeader}>
                <Ionicons name="analytics" size={24} color="white" />
                <View style={styles.phaseInfo}>
                  <Text style={styles.phaseTitle}>{phaseInfo.title}</Text>
                  <Text style={styles.phaseSubtitle}>{phaseInfo.subtitle}</Text>
                </View>
              </View>
              <Text style={styles.phaseDescription}>{phaseInfo.description}</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Ionicons name="scale" size={20} color="#10b981" />
              <Text style={styles.statLabel}>Current Weight</Text>
            </View>
            <Text style={styles.statValue}>{currentWeight.toFixed(1)} kg</Text>
            <Text style={styles.statSubtext}>
              Goal: {user.goalWeight} kg ({(user.goalWeight - currentWeight).toFixed(1)} to go)
            </Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Ionicons name="trending-up" size={20} color="#3b82f6" />
              <Text style={styles.statLabel}>Progress</Text>
            </View>
            <Text style={styles.statValue}>{Math.max(0, weightProgress).toFixed(0)}%</Text>
            <Text style={styles.statSubtext}>
              {weightProgress > 0 ? 'On track!' : 'Just getting started'}
            </Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Ionicons name="calendar" size={20} color="#8b5cf6" />
              <Text style={styles.statLabel}>Days Tracking</Text>
            </View>
            <Text style={styles.statValue}>{progress.daysTracking}</Text>
            <Text style={styles.statSubtext}>
              Weight: {progress.weightEntries} | Calories: {progress.calorieEntries}
            </Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Ionicons name="fitness" size={20} color="#f59e0b" />
              <Text style={styles.statLabel}>Avg Calories</Text>
            </View>
            <Text style={styles.statValue}>
              {progress.averageCalories > 0 ? progress.averageCalories.toLocaleString() : '—'}
            </Text>
            <Text style={styles.statSubtext}>
              {currentTdeeAnalysis ? `Target: ${currentTdeeAnalysis.targetCalories.toLocaleString()}` : 'Calculating...'}
            </Text>
          </View>
        </View>

        {/* TDEE Analysis Card */}
        {tdeeData && (
          <View style={styles.tdeeCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="calculator" size={24} color="#10b981" />
              <Text style={styles.cardTitle}>TDEE Analysis</Text>
            </View>
            <View style={styles.tdeeStats}>
              <View style={styles.tdeeStatItem}>
                <Text style={styles.tdeeStatLabel}>Calculated TDEE</Text>
                <Text style={styles.tdeeStatValue}>{tdeeData.tdee.toLocaleString()} kcal</Text>
              </View>
              <View style={styles.tdeeStatItem}>
                <Text style={styles.tdeeStatLabel}>Recommended Surplus</Text>
                <Text style={styles.tdeeStatValue}>+{tdeeData.surplus} kcal</Text>
              </View>
              <View style={styles.tdeeStatItem}>
                <Text style={styles.tdeeStatLabel}>Target Calories</Text>
                <Text style={styles.tdeeStatValue}>{tdeeData.targetCalories.toLocaleString()} kcal</Text>
              </View>
              <View style={styles.tdeeStatItem}>
                <Text style={styles.tdeeStatLabel}>Confidence</Text>
                <Text style={styles.tdeeStatValue}>{(tdeeData.confidence * 100).toFixed(0)}%</Text>
              </View>
            </View>
            <View style={styles.dataQualityBadge}>
              <Text style={styles.dataQualityText}>Data Quality: {tdeeData.dataQuality}</Text>
            </View>
          </View>
        )}

        {/* Generate TDEE Button */}
        {currentPhase === 'calibration' && progress.readyForAnalysis && (
          <TouchableOpacity style={styles.generateButton} onPress={handleGenerateTdee}>
            <LinearGradient
              colors={['#10b981', '#059669']}
              style={styles.generateButtonGradient}
            >
              <Ionicons name="flash" size={20} color="white" />
              <Text style={styles.generateButtonText}>Generate TDEE Analysis</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Insights */}
        {insights.length > 0 && (
          <View style={styles.insightsCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="bulb" size={24} color="#f59e0b" />
              <Text style={styles.cardTitle}>Insights</Text>
            </View>
            {insights.map((insight, index) => (
              <View key={index} style={styles.insightItem}>
                <Ionicons name="arrow-forward" size={16} color="#64748b" />
                <Text style={styles.insightText}>{insight}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionButton}>
              <LinearGradient
                colors={['#3b82f6', '#2563eb']}
                style={styles.actionGradient}
              >
                <Ionicons name="scale" size={24} color="white" />
                <Text style={styles.actionText}>Log Weight</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <LinearGradient
                colors={['#10b981', '#059669']}
                style={styles.actionGradient}
              >
                <Ionicons name="restaurant" size={24} color="white" />
                <Text style={styles.actionText}>Log Calories</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <LinearGradient
                colors={['#8b5cf6', '#7c3aed']}
                style={styles.actionGradient}
              >
                <Ionicons name="fitness" size={24} color="white" />
                <Text style={styles.actionText}>Log Activity</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <LinearGradient
                colors={['#f59e0b', '#d97706']}
                style={styles.actionGradient}
              >
                <Ionicons name="analytics" size={24} color="white" />
                <Text style={styles.actionText}>View Progress</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  profileButton: {
    padding: 4,
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  phaseCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  phaseGradient: {
    padding: 20,
  },
  phaseContent: {
    gap: 12,
  },
  phaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  phaseInfo: {
    flex: 1,
  },
  phaseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  phaseSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  phaseDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  statSubtext: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 16,
  },
  tdeeCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  tdeeStats: {
    gap: 12,
    marginBottom: 16,
  },
  tdeeStatItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tdeeStatLabel: {
    fontSize: 14,
    color: '#94a3b8',
  },
  tdeeStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  dataQualityBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  dataQualityText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
  },
  generateButton: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  generateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  insightsCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  insightText: {
    fontSize: 14,
    color: '#e2e8f0',
    lineHeight: 20,
    flex: 1,
  },
  quickActions: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: '47%',
  },
  actionGradient: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
});