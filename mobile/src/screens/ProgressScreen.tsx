import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { useUserStore, useUserProgress } from '../store/userStore';
import { format, parseISO, subDays } from 'date-fns';

const screenWidth = Dimensions.get('window').width;

export default function ProgressScreen() {
  const {
    user,
    weightEntries,
    calorieEntries,
    currentTdeeAnalysis,
  } = useUserStore();

  const progress = useUserProgress();

  const chartData = useMemo(() => {
    // Prepare weight chart data
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), 29 - i);
      return format(date, 'yyyy-MM-dd');
    });

    const weightData = last30Days.map(date => {
      const entry = weightEntries.find(w => w.date === date);
      return entry ? entry.weight : null;
    }).filter(w => w !== null);

    const calorieData = last30Days.map(date => {
      const entry = calorieEntries.find(c => c.date === date);
      return entry ? entry.calories : null;
    }).filter(c => c !== null);

    return {
      weightLabels: last30Days.slice(-weightData.length).map(date => format(parseISO(date + 'T00:00:00'), 'MMM dd')),
      weightData,
      calorieLabels: last30Days.slice(-calorieData.length).map(date => format(parseISO(date + 'T00:00:00'), 'MMM dd')),
      calorieData,
    };
  }, [weightEntries, calorieEntries]);

  const stats = useMemo(() => {
    if (!user || weightEntries.length === 0) return null;

    const currentWeight = weightEntries[0].weight;
    const startingWeight = weightEntries[weightEntries.length - 1]?.weight || user.weight;
    const totalGain = currentWeight - startingWeight;
    const goalRemaining = user.goalWeight - currentWeight;
    const progressPercentage = ((currentWeight - user.weight) / (user.goalWeight - user.weight)) * 100;

    // Calculate average weekly gain
    const sortedWeights = [...weightEntries].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    let weeklyGain = 0;
    if (sortedWeights.length >= 2) {
      const firstWeight = sortedWeights[0].weight;
      const lastWeight = sortedWeights[sortedWeights.length - 1].weight;
      const daysDiff = Math.abs(
        new Date(sortedWeights[sortedWeights.length - 1].date).getTime() - 
        new Date(sortedWeights[0].date).getTime()
      ) / (1000 * 60 * 60 * 24);
      
      if (daysDiff > 0) {
        weeklyGain = ((lastWeight - firstWeight) / daysDiff) * 7;
      }
    }

    return {
      currentWeight,
      startingWeight,
      totalGain,
      goalRemaining,
      progressPercentage: Math.max(0, progressPercentage),
      weeklyGain,
    };
  }, [user, weightEntries]);

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const chartConfig = {
    backgroundColor: '#1e293b',
    backgroundGradientFrom: '#1e293b',
    backgroundGradientTo: '#0f172a',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#10b981',
    },
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Progress Tracking</Text>
        <Text style={styles.subtitle}>Monitor your weight gain journey</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {stats && (
          <>
            {/* Progress Summary */}
            <View style={styles.summaryCard}>
              <LinearGradient
                colors={['#10b981', '#059669']}
                style={styles.summaryGradient}
              >
                <View style={styles.summaryContent}>
                  <View style={styles.summaryRow}>
                    <View style={styles.summaryItem}>
                      <Text style={styles.summaryLabel}>Current</Text>
                      <Text style={styles.summaryValue}>{stats.currentWeight.toFixed(1)} kg</Text>
                    </View>
                    <View style={styles.summaryItem}>
                      <Text style={styles.summaryLabel}>Goal</Text>
                      <Text style={styles.summaryValue}>{user.goalWeight} kg</Text>
                    </View>
                  </View>
                  
                  <View style={styles.progressBarContainer}>
                    <Text style={styles.progressLabel}>
                      {stats.progressPercentage.toFixed(0)}% Complete
                    </Text>
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill,
                          { width: `${Math.min(100, stats.progressPercentage)}%` }
                        ]} 
                      />
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <View style={styles.statHeader}>
                  <Ionicons name="trending-up" size={20} color="#10b981" />
                  <Text style={styles.statLabel}>Total Gained</Text>
                </View>
                <Text style={styles.statValue}>
                  {stats.totalGain > 0 ? '+' : ''}{stats.totalGain.toFixed(1)} kg
                </Text>
                <Text style={styles.statSubtext}>
                  {stats.goalRemaining.toFixed(1)} kg to goal
                </Text>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statHeader}>
                  <Ionicons name="calendar" size={20} color="#3b82f6" />
                  <Text style={styles.statLabel}>Weekly Rate</Text>
                </View>
                <Text style={styles.statValue}>
                  {stats.weeklyGain > 0 ? '+' : ''}{stats.weeklyGain.toFixed(2)} kg
                </Text>
                <Text style={styles.statSubtext}>
                  {stats.weeklyGain > 0.2 ? 'Great progress!' : 'Keep it up!'}
                </Text>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statHeader}>
                  <Ionicons name="analytics" size={20} color="#8b5cf6" />
                  <Text style={styles.statLabel}>Days Tracked</Text>
                </View>
                <Text style={styles.statValue}>{progress.daysTracking}</Text>
                <Text style={styles.statSubtext}>
                  {progress.daysTracking >= 7 ? 'Analysis ready' : 'Keep tracking'}
                </Text>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statHeader}>
                  <Ionicons name="restaurant" size={20} color="#f59e0b" />
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
          </>
        )}

        {/* Weight Chart */}
        {chartData.weightData.length > 1 && (
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Ionicons name="trending-up" size={24} color="#10b981" />
              <Text style={styles.chartTitle}>Weight Progress</Text>
            </View>
            <LineChart
              data={{
                labels: chartData.weightLabels.slice(-7), // Show last 7 data points
                datasets: [{
                  data: chartData.weightData.slice(-7),
                }],
              }}
              width={screenWidth - 48}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </View>
        )}

        {/* Calorie Chart */}
        {chartData.calorieData.length > 1 && (
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Ionicons name="bar-chart" size={24} color="#3b82f6" />
              <Text style={styles.chartTitle}>Daily Calories</Text>
            </View>
            <BarChart
              data={{
                labels: chartData.calorieLabels.slice(-7), // Show last 7 data points
                datasets: [{
                  data: chartData.calorieData.slice(-7),
                }],
              }}
              width={screenWidth - 48}
              height={220}
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
              }}
              style={styles.chart}
            />
          </View>
        )}

        {/* TDEE Analysis */}
        {currentTdeeAnalysis && (
          <View style={styles.tdeeCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="calculator" size={24} color="#8b5cf6" />
              <Text style={styles.cardTitle}>TDEE Analysis</Text>
            </View>
            <View style={styles.tdeeGrid}>
              <View style={styles.tdeeItem}>
                <Text style={styles.tdeeLabel}>Calculated TDEE</Text>
                <Text style={styles.tdeeValue}>{currentTdeeAnalysis.tdee.toLocaleString()} kcal</Text>
              </View>
              <View style={styles.tdeeItem}>
                <Text style={styles.tdeeLabel}>Recommended Surplus</Text>
                <Text style={styles.tdeeValue}>+{currentTdeeAnalysis.surplus} kcal</Text>
              </View>
              <View style={styles.tdeeItem}>
                <Text style={styles.tdeeLabel}>Target Calories</Text>
                <Text style={styles.tdeeValue}>{currentTdeeAnalysis.targetCalories.toLocaleString()} kcal</Text>
              </View>
              <View style={styles.tdeeItem}>
                <Text style={styles.tdeeLabel}>Confidence</Text>
                <Text style={styles.tdeeValue}>{(currentTdeeAnalysis.confidence * 100).toFixed(0)}%</Text>
              </View>
            </View>
          </View>
        )}

        {/* Empty State */}
        {(!stats || chartData.weightData.length === 0) && (
          <View style={styles.emptyState}>
            <Ionicons name="analytics-outline" size={64} color="#64748b" />
            <Text style={styles.emptyTitle}>No Progress Data Yet</Text>
            <Text style={styles.emptyText}>
              Start tracking your weight and calories to see your progress charts
            </Text>
          </View>
        )}
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
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  summaryCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  summaryGradient: {
    padding: 20,
  },
  summaryContent: {
    gap: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  progressBarContainer: {
    gap: 8,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 4,
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
  chartCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  chart: {
    borderRadius: 16,
  },
  tdeeCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
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
  tdeeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  tdeeItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  tdeeLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 4,
    textAlign: 'center',
  },
  tdeeValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
});