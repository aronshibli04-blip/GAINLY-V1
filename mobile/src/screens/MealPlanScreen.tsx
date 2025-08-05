import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../store/userStore';
import { openAIService } from '../api/openai';
import { MealPlanRequest } from '../types';

export default function MealPlanScreen() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showMealPlanRequest, setShowMealPlanRequest] = useState(false);
  
  const {
    user,
    currentTdeeAnalysis,
    mealPlans,
    addMealPlan,
    currentPhase,
  } = useUserStore();

  const canGenerateMealPlan = currentPhase === 'meal_planning' || currentPhase === 'tracking';
  const hasApiKey = false; // This would be checked from secure storage

  const handleSetApiKey = () => {
    if (apiKeyInput.trim()) {
      openAIService.setApiKey(apiKeyInput.trim());
      setApiKeyInput('');
      setShowApiKeyModal(false);
      Alert.alert('Success', 'OpenAI API key has been set!');
    }
  };

  const handleGenerateMealPlan = async () => {
    if (!user || !currentTdeeAnalysis) {
      Alert.alert('Error', 'Complete TDEE calibration first');
      return;
    }

    if (!hasApiKey) {
      setShowApiKeyModal(true);
      return;
    }

    setIsGenerating(true);

    try {
      const request: MealPlanRequest = {
        userId: user.id,
        targetCalories: currentTdeeAnalysis.targetCalories,
        dietaryPreferences: user.dietaryPreferences.map(p => p.name),
        preferredFoods: ['Rice', 'Chicken', 'Pasta', 'Beef', 'Fish'], // Default preferences
        maxMealsPerDay: 4,
        maxPrepTime: 60,
        cookingExperience: 'intermediate',
      };

      const mealPlan = await openAIService.generateMealPlan(request);
      addMealPlan(mealPlan);
      
      Alert.alert('Success', 'AI meal plan generated successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to generate meal plan');
    } finally {
      setIsGenerating(false);
    }
  };

  const renderMealPlan = (mealPlan: any) => (
    <View key={mealPlan.id} style={styles.mealPlanCard}>
      <View style={styles.mealPlanHeader}>
        <Text style={styles.mealPlanDate}>{mealPlan.date}</Text>
        <View style={styles.macrosSummary}>
          <Text style={styles.macrosText}>{mealPlan.totalCalories} kcal</Text>
        </View>
      </View>

      {mealPlan.meals.map((meal: any) => (
        <View key={meal.id} style={styles.mealCard}>
          <View style={styles.mealHeader}>
            <Text style={styles.mealName}>{meal.name}</Text>
            <Text style={styles.mealType}>{meal.type}</Text>
          </View>
          <View style={styles.mealMacros}>
            <Text style={styles.mealCalories}>{meal.calories} kcal</Text>
            <Text style={styles.mealMacroText}>P: {meal.protein}g</Text>
            <Text style={styles.mealMacroText}>C: {meal.carbs}g</Text>
            <Text style={styles.mealMacroText}>F: {meal.fat}g</Text>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AI Meal Plans</Text>
        <Text style={styles.subtitle}>Personalized nutrition for weight gain</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {!canGenerateMealPlan ? (
          <View style={styles.calibrationCard}>
            <LinearGradient
              colors={['#3b82f6', '#2563eb']}
              style={styles.calibrationGradient}
            >
              <Ionicons name="time" size={48} color="white" />
              <Text style={styles.calibrationTitle}>Complete TDEE Calibration</Text>
              <Text style={styles.calibrationText}>
                Track your weight and calories for at least 7 days to unlock AI meal planning
              </Text>
            </LinearGradient>
          </View>
        ) : (
          <>
            {/* TDEE Summary */}
            {currentTdeeAnalysis && (
              <View style={styles.tdeeCard}>
                <View style={styles.cardHeader}>
                  <Ionicons name="calculator" size={24} color="#10b981" />
                  <Text style={styles.cardTitle}>Your TDEE Analysis</Text>
                </View>
                <View style={styles.tdeeStats}>
                  <View style={styles.tdeeStat}>
                    <Text style={styles.tdeeLabel}>Target Calories</Text>
                    <Text style={styles.tdeeValue}>{currentTdeeAnalysis.targetCalories.toLocaleString()}</Text>
                  </View>
                  <View style={styles.tdeeStat}>
                    <Text style={styles.tdeeLabel}>TDEE</Text>
                    <Text style={styles.tdeeValue}>{currentTdeeAnalysis.tdee.toLocaleString()}</Text>
                  </View>
                  <View style={styles.tdeeStat}>
                    <Text style={styles.tdeeLabel}>Surplus</Text>
                    <Text style={styles.tdeeValue}>+{currentTdeeAnalysis.surplus}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Generate Button */}
            <TouchableOpacity
              style={styles.generateButton}
              onPress={handleGenerateMealPlan}
              disabled={isGenerating}
            >
              <LinearGradient
                colors={isGenerating ? ['#6b7280', '#4b5563'] : ['#8b5cf6', '#7c3aed']}
                style={styles.generateGradient}
              >
                {isGenerating ? (
                  <>
                    <Ionicons name="reload" size={20} color="white" />
                    <Text style={styles.generateText}>Generating AI Plan...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="sparkles" size={20} color="white" />
                    <Text style={styles.generateText}>Generate AI Meal Plan</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Meal Plans */}
            {mealPlans.length > 0 ? (
              <View style={styles.mealPlansSection}>
                <Text style={styles.sectionTitle}>Your Meal Plans</Text>
                {mealPlans.map(renderMealPlan)}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="restaurant-outline" size={64} color="#64748b" />
                <Text style={styles.emptyTitle}>No Meal Plans Yet</Text>
                <Text style={styles.emptyText}>
                  Generate your first AI-powered meal plan to start your weight gain journey
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* API Key Modal */}
      <Modal
        visible={showApiKeyModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowApiKeyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>OpenAI API Key Required</Text>
              <TouchableOpacity onPress={() => setShowApiKeyModal(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalText}>
              To generate AI meal plans, you need to provide your OpenAI API key. This key will be stored securely on your device.
            </Text>
            
            <TextInput
              style={styles.apiKeyInput}
              value={apiKeyInput}
              onChangeText={setApiKeyInput}
              placeholder="Enter your OpenAI API key"
              placeholderTextColor="#64748b"
              secureTextEntry
            />
            
            <TouchableOpacity style={styles.modalButton} onPress={handleSetApiKey}>
              <LinearGradient
                colors={['#10b981', '#059669']}
                style={styles.modalButtonGradient}
              >
                <Text style={styles.modalButtonText}>Set API Key</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
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
  calibrationCard: {
    marginHorizontal: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  calibrationGradient: {
    padding: 32,
    alignItems: 'center',
    gap: 16,
  },
  calibrationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  calibrationText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 20,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tdeeStat: {
    alignItems: 'center',
  },
  tdeeLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 4,
  },
  tdeeValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  generateButton: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  generateGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  generateText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  mealPlansSection: {
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  mealPlanCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  mealPlanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  mealPlanDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  macrosSummary: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  macrosText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
  mealCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  mealType: {
    fontSize: 12,
    color: '#64748b',
    textTransform: 'capitalize',
  },
  mealMacros: {
    flexDirection: 'row',
    gap: 16,
  },
  mealCalories: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
  mealMacroText: {
    fontSize: 14,
    color: '#94a3b8',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  modalText: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
    marginBottom: 20,
  },
  apiKeyInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: 'white',
    marginBottom: 20,
  },
  modalButton: {
    marginTop: 8,
  },
  modalButtonGradient: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});