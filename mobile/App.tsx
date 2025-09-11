import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';

// Simple demo app structure for GAINLY mobile
interface TabItem {
  id: string;
  title: string;
  icon: string;
  color: string;
}

const tabs: TabItem[] = [
  { id: 'dashboard', title: 'Dashboard', icon: '🏠', color: '#10b981' },
  { id: 'calories', title: 'Calories', icon: '🍽️', color: '#f59e0b' },
  { id: 'training', title: 'Training', icon: '💪', color: '#ef4444' },
  { id: 'progress', title: 'Progress', icon: '📈', color: '#8b5cf6' },
  { id: 'profile', title: 'Profile', icon: '👤', color: '#06b6d4' },
];

function MainApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <View style={styles.contentCard}>
            <Text style={styles.cardTitle}>🎯 GAINLY Dashboard</Text>
            <Text style={styles.cardSubtitle}>AI-Powered Weight Gain Tracking</Text>
            
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor: '#10b981' }]}>
                <Text style={styles.statNumber}>72.5</Text>
                <Text style={styles.statLabel}>kg</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: '#f59e0b' }]}>
                <Text style={styles.statNumber}>2847</Text>
                <Text style={styles.statLabel}>kcal</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: '#ef4444' }]}>
                <Text style={styles.statNumber}>5</Text>
                <Text style={styles.statLabel}>days</Text>
              </View>
            </View>
            
            <Text style={styles.description}>
              GAINLY combines calorie tracking with personalized meal planning to help you gain weight effectively.
            </Text>
          </View>
        );
      
      case 'calories':
        return (
          <View style={styles.contentCard}>
            <Text style={styles.cardTitle}>🍽️ Calorie Tracking</Text>
            <Text style={styles.cardSubtitle}>Ultra-Fast Food Logging</Text>
            
            <View style={styles.mealCard}>
              <Text style={styles.mealTitle}>Today's Meals</Text>
              <Text style={styles.mealItem}>🥞 Breakfast - 850 kcal</Text>
              <Text style={styles.mealItem}>🍖 Lunch - 1200 kcal</Text>
              <Text style={styles.mealItem}>🥤 Snack - 300 kcal</Text>
              <Text style={styles.mealItem}>🍝 Dinner - 1100 kcal</Text>
            </View>
            
            <Text style={styles.description}>
              Quick 3-tap food logging system with nutrition recognition and voice input.
            </Text>
          </View>
        );
      
      default:
        return (
          <View style={styles.contentCard}>
            <Text style={styles.cardTitle}>🚀 {tabs.find(t => t.id === activeTab)?.title}</Text>
            <Text style={styles.cardSubtitle}>Feature Coming Soon</Text>
            
            <Text style={styles.description}>
              This section will include comprehensive {activeTab} tracking with gamification elements and AI insights.
            </Text>
          </View>
        );
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#0f172a" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>GAINLY</Text>
        <Text style={styles.headerSubtitle}>Mobile App Demo</Text>
      </View>
      
      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderContent()}
      </ScrollView>
      
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

function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#10b981" />
      <Text style={styles.loadingText}>Loading GAINLY...</Text>
    </View>
  );
}

export default function App() {
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    // Simulate app loading
    const timer = setTimeout(() => {
      setIsAppReady(true);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  if (!isAppReady) {
    return <LoadingScreen />;
  }

  return <MainApp />;
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
    gap: 16,
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '500',
  },
  
  header: {
    padding: 24,
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
    padding: 20,
  },
  
  contentCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 16,
    color: '#10b981',
    marginBottom: 20,
  },
  
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  
  mealCard: {
    backgroundColor: '#334155',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  mealTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  mealItem: {
    fontSize: 14,
    color: '#e2e8f0',
    marginBottom: 8,
    paddingLeft: 8,
  },
  
  description: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
  },
  
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    paddingVertical: 12,
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
