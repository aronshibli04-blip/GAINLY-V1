import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView,
  ActivityIndicator,
  Dimensions
} from 'react-native';

const { width } = Dimensions.get('window');

// Simulated data for demo
const demoData = {
  user: {
    name: 'Alex',
    currentWeight: 72.5,
    goalWeight: 85,
    startWeight: 68
  },
  todayStats: {
    calories: 2847,
    caloriesGoal: 3500,
    meals: 4,
    weight: 72.5
  },
  recentMeals: [
    { id: 1, name: 'Protein Smoothie', time: '08:30', calories: 850, emoji: '🥤' },
    { id: 2, name: 'Chicken & Rice', time: '13:00', calories: 1200, emoji: '🍖' },
    { id: 3, name: 'Peanut Butter Toast', time: '16:30', calories: 450, emoji: '🥜' },
    { id: 4, name: 'Pasta Bolognese', time: '19:00', calories: 1100, emoji: '🍝' }
  ],
  routines: [
    { id: 1, name: 'Morning Protein', completed: true, streak: 7 },
    { id: 2, name: 'Log Weight', completed: true, streak: 12 },
    { id: 3, name: 'Evening Meal', completed: false, streak: 5 },
    { id: 4, name: 'Workout', completed: true, streak: 3 }
  ]
};

const tabs = [
  { id: 'dashboard', title: 'Dashboard', icon: '🏠', color: '#10b981' },
  { id: 'meals', title: 'Meals', icon: '🍽️', color: '#f59e0b' },
  { id: 'routines', title: 'Routines', icon: '✅', color: '#8b5cf6' },
  { id: 'progress', title: 'Progress', icon: '📈', color: '#ef4444' },
  { id: 'ai', title: 'AI Coach', icon: '🤖', color: '#06b6d4' },
];

function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <Text style={styles.logoText}>GAINLY</Text>
      <ActivityIndicator size="large" color="#10b981" style={{ marginTop: 20 }} />
      <Text style={styles.loadingText}>Loading your fitness journey...</Text>
    </View>
  );
}

function DashboardContent() {
  const progressPercentage = (demoData.user.currentWeight - demoData.user.startWeight) / 
                            (demoData.user.goalWeight - demoData.user.startWeight) * 100;
  
  return (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeTitle}>Welcome back, {demoData.user.name}! 👋</Text>
        <Text style={styles.welcomeSubtitle}>Ready to gain today?</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: '#10b981' }]}>
          <Text style={styles.statNumber}>{demoData.todayStats.weight}</Text>
          <Text style={styles.statLabel}>kg today</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#f59e0b' }]}>
          <Text style={styles.statNumber}>{demoData.todayStats.calories}</Text>
          <Text style={styles.statLabel}>calories</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#8b5cf6' }]}>
          <Text style={styles.statNumber}>{Math.round(progressPercentage)}%</Text>
          <Text style={styles.statLabel}>progress</Text>
        </View>
      </View>

      <View style={styles.progressCard}>
        <Text style={styles.cardTitle}>🎯 Weight Goal Progress</Text>
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>
            {demoData.user.currentWeight}kg → {demoData.user.goalWeight}kg
          </Text>
          <Text style={styles.progressSubtext}>
            +{(demoData.user.currentWeight - demoData.user.startWeight).toFixed(1)}kg gained
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🏃‍♂️ Today's Routines</Text>
        {demoData.routines.map((routine) => (
          <View key={routine.id} style={styles.routineItem}>
            <View style={styles.routineInfo}>
              <Text style={styles.routineName}>
                {routine.completed ? '✅' : '⏳'} {routine.name}
              </Text>
              <Text style={styles.routineStreak}>🔥 {routine.streak} day streak</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function MealsContent() {
  return (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🍽️ Ultra-Fast Food Logging</Text>
        <Text style={styles.cardSubtitle}>Log meals in just 3 taps</Text>
        
        <TouchableOpacity style={styles.quickLogButton}>
          <Text style={styles.quickLogText}>+ Quick Log Meal</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: '#f59e0b' }]}>
          <Text style={styles.statNumber}>{demoData.todayStats.calories}</Text>
          <Text style={styles.statLabel}>eaten today</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#10b981' }]}>
          <Text style={styles.statNumber}>{demoData.todayStats.caloriesGoal - demoData.todayStats.calories}</Text>
          <Text style={styles.statLabel}>remaining</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Today's Meals</Text>
        {demoData.recentMeals.map((meal) => (
          <TouchableOpacity key={meal.id} style={styles.mealItem}>
            <Text style={styles.mealEmoji}>{meal.emoji}</Text>
            <View style={styles.mealInfo}>
              <Text style={styles.mealName}>{meal.name}</Text>
              <Text style={styles.mealTime}>{meal.time}</Text>
            </View>
            <Text style={styles.mealCalories}>{meal.calories} kcal</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

function RoutinesContent() {
  return (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>✅ Daily Routines</Text>
        <Text style={styles.cardSubtitle}>Build habits for consistent gains</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Today's Progress</Text>
        {demoData.routines.map((routine) => (
          <TouchableOpacity key={routine.id} style={styles.routineCard}>
            <View style={styles.routineHeader}>
              <Text style={styles.routineName}>
                {routine.completed ? '✅' : '⏳'} {routine.name}
              </Text>
              <Text style={styles.routineStreak}>🔥 {routine.streak}</Text>
            </View>
            <Text style={styles.routineStatus}>
              {routine.completed ? 'Completed today' : 'Pending'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🎮 Gamification</Text>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: '#8b5cf6' }]}>
            <Text style={styles.statNumber}>Level 12</Text>
            <Text style={styles.statLabel}>current</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#ef4444' }]}>
            <Text style={styles.statNumber}>2,450</Text>
            <Text style={styles.statLabel}>XP points</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function GenericContent({ title }) {
  return (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🚀 {title}</Text>
        <Text style={styles.cardSubtitle}>Feature Coming Soon</Text>
        
        <Text style={styles.description}>
          This section will include comprehensive {title.toLowerCase()} features with:
        </Text>
        
        <View style={styles.featureList}>
          <Text style={styles.featureItem}>• AI-powered insights and recommendations</Text>
          <Text style={styles.featureItem}>• Advanced analytics and trends</Text>
          <Text style={styles.featureItem}>• Personalized goal tracking</Text>
          <Text style={styles.featureItem}>• Social features and challenges</Text>
        </View>
      </View>
    </ScrollView>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    // Simulate app initialization
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);
    
    return () => clearTimeout(timer);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardContent />;
      case 'meals':
        return <MealsContent />;
      case 'routines':
        return <RoutinesContent />;
      default:
        return <GenericContent title={tabs.find(t => t.id === activeTab)?.title || 'Feature'} />;
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#0f172a" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>GAINLY</Text>
        <Text style={styles.headerSubtitle}>Native Mobile App</Text>
      </View>
      
      {/* Content */}
      {renderContent()}
      
      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tabButton,
              activeTab === tab.id && styles.activeTabButton
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[
              styles.tabLabel,
              activeTab === tab.id && styles.activeTabLabel
            ]}>
              {tab.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
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
    backgroundColor: '#0f172a',
    paddingHorizontal: 40,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#10b981',
    letterSpacing: 2,
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
    textAlign: 'center',
  },
  
  header: {
    padding: 20,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#10b981',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
  },
  
  content: {
    flex: 1,
    padding: 16,
  },
  
  welcomeCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#10b981',
  },
  
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#10b981',
    marginBottom: 16,
  },
  
  progressCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  progressInfo: {
    marginBottom: 16,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  progressSubtext: {
    fontSize: 14,
    color: '#10b981',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#334155',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
    textAlign: 'center',
  },
  
  quickLogButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  quickLogText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  mealItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  mealEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  },
  mealTime: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  mealCalories: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
  
  routineItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  routineCard: {
    backgroundColor: '#334155',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  routineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  routineInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routineName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
  },
  routineStreak: {
    fontSize: 12,
    color: '#10b981',
  },
  routineStatus: {
    fontSize: 12,
    color: '#64748b',
  },
  
  description: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
    marginBottom: 16,
  },
  
  featureList: {
    paddingLeft: 8,
  },
  featureItem: {
    fontSize: 14,
    color: '#e2e8f0',
    marginBottom: 8,
    lineHeight: 20,
  },
  
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 12,
  },
  activeTabButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 10,
    color: '#64748b',
    textAlign: 'center',
  },
  activeTabLabel: {
    color: '#10b981',
    fontWeight: '600',
  },
});