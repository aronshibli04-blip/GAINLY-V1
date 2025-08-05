import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../store/userStore';
import { User, DietaryPreference } from '../types';

interface OnboardingScreenProps {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    firstName: '',
    age: '',
    sex: 'male' as 'male' | 'female',
    height: '', // cm
    weight: '', // kg
    goalWeight: '',
    activityLevel: 'moderately_active' as User['activityLevel'],
    dietaryPreferences: [] as string[],
  });

  const { setUser, completeOnboarding } = useUserStore();

  const steps = [
    'Personal Info',
    'Physical Stats',
    'Goals & Activity',
    'Dietary Preferences'
  ];

  const dietaryOptions = [
    { id: 'halal', name: 'Halal', type: 'restriction' },
    { id: 'no_pork', name: 'No Pork', type: 'restriction' },
    { id: 'no_beef', name: 'No Beef', type: 'restriction' },
    { id: 'dairy_free', name: 'Dairy Free', type: 'restriction' },
    { id: 'gluten_free', name: 'Gluten Free', type: 'restriction' },
    { id: 'vegetarian', name: 'Vegetarian', type: 'restriction' },
    { id: 'high_protein', name: 'High Protein Focus', type: 'preference' },
    { id: 'clean_eating', name: 'Clean Eating', type: 'preference' },
  ];

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        handleComplete();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 0:
        if (!formData.firstName.trim()) {
          Alert.alert('Error', 'Please enter your first name');
          return false;
        }
        if (!formData.age || parseInt(formData.age) < 16 || parseInt(formData.age) > 80) {
          Alert.alert('Error', 'Please enter a valid age (16-80)');
          return false;
        }
        return true;
      case 1:
        if (!formData.height || parseInt(formData.height) < 140 || parseInt(formData.height) > 220) {
          Alert.alert('Error', 'Please enter a valid height (140-220 cm)');
          return false;
        }
        if (!formData.weight || parseInt(formData.weight) < 40 || parseInt(formData.weight) > 200) {
          Alert.alert('Error', 'Please enter a valid weight (40-200 kg)');
          return false;
        }
        return true;
      case 2:
        if (!formData.goalWeight || parseInt(formData.goalWeight) <= parseInt(formData.weight)) {
          Alert.alert('Error', 'Goal weight should be higher than current weight');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleComplete = () => {
    const user: User = {
      id: Date.now().toString(),
      username: formData.firstName.toLowerCase() + Date.now(),
      firstName: formData.firstName,
      age: parseInt(formData.age),
      sex: formData.sex,
      height: parseInt(formData.height),
      weight: parseInt(formData.weight),
      goalWeight: parseInt(formData.goalWeight),
      activityLevel: formData.activityLevel,
      dietaryPreferences: formData.dietaryPreferences.map(pref => {
        const option = dietaryOptions.find(opt => opt.id === pref);
        return {
          id: pref,
          name: option?.name || pref,
          type: option?.type as 'restriction' | 'preference' || 'preference',
        };
      }),
      createdAt: new Date().toISOString(),
    };

    setUser(user);
    completeOnboarding();
    onComplete();
  };

  const toggleDietaryPreference = (prefId: string) => {
    setFormData(prev => ({
      ...prev,
      dietaryPreferences: prev.dietaryPreferences.includes(prefId)
        ? prev.dietaryPreferences.filter(p => p !== prefId)
        : [...prev.dietaryPreferences, prefId]
    }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Let's get to know you</Text>
            <Text style={styles.stepDescription}>
              We need some basic information to personalize your experience
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>First Name</Text>
              <TextInput
                style={styles.textInput}
                value={formData.firstName}
                onChangeText={(text) => setFormData(prev => ({ ...prev, firstName: text }))}
                placeholder="Enter your first name"
                placeholderTextColor="#64748b"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Age</Text>
              <TextInput
                style={styles.textInput}
                value={formData.age}
                onChangeText={(text) => setFormData(prev => ({ ...prev, age: text }))}
                placeholder="Enter your age"
                placeholderTextColor="#64748b"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Sex</Text>
              <View style={styles.segmentedControl}>
                <TouchableOpacity
                  style={[
                    styles.segmentButton,
                    formData.sex === 'male' && styles.segmentButtonActive
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, sex: 'male' }))}
                >
                  <Text style={[
                    styles.segmentButtonText,
                    formData.sex === 'male' && styles.segmentButtonTextActive
                  ]}>Male</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.segmentButton,
                    formData.sex === 'female' && styles.segmentButtonActive
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, sex: 'female' }))}
                >
                  <Text style={[
                    styles.segmentButtonText,
                    formData.sex === 'female' && styles.segmentButtonTextActive
                  ]}>Female</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );

      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Physical measurements</Text>
            <Text style={styles.stepDescription}>
              These help us calculate accurate calorie recommendations
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Height (cm)</Text>
              <TextInput
                style={styles.textInput}
                value={formData.height}
                onChangeText={(text) => setFormData(prev => ({ ...prev, height: text }))}
                placeholder="e.g., 175"
                placeholderTextColor="#64748b"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Current Weight (kg)</Text>
              <TextInput
                style={styles.textInput}
                value={formData.weight}
                onChangeText={(text) => setFormData(prev => ({ ...prev, weight: text }))}
                placeholder="e.g., 65"
                placeholderTextColor="#64748b"
                keyboardType="numeric"
              />
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Goals & Activity</Text>
            <Text style={styles.stepDescription}>
              Set your target weight and activity level
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Goal Weight (kg)</Text>
              <TextInput
                style={styles.textInput}
                value={formData.goalWeight}
                onChangeText={(text) => setFormData(prev => ({ ...prev, goalWeight: text }))}
                placeholder="e.g., 75"
                placeholderTextColor="#64748b"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Activity Level</Text>
              {[
                { key: 'sedentary', label: 'Sedentary', desc: 'Little to no exercise' },
                { key: 'lightly_active', label: 'Lightly Active', desc: 'Light exercise 1-3 days/week' },
                { key: 'moderately_active', label: 'Moderately Active', desc: 'Moderate exercise 3-5 days/week' },
                { key: 'very_active', label: 'Very Active', desc: 'Hard exercise 6-7 days/week' },
              ].map((activity) => (
                <TouchableOpacity
                  key={activity.key}
                  style={[
                    styles.optionButton,
                    formData.activityLevel === activity.key && styles.optionButtonActive
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, activityLevel: activity.key as User['activityLevel'] }))}
                >
                  <View style={styles.optionContent}>
                    <Text style={[
                      styles.optionLabel,
                      formData.activityLevel === activity.key && styles.optionLabelActive
                    ]}>{activity.label}</Text>
                    <Text style={styles.optionDescription}>{activity.desc}</Text>
                  </View>
                  {formData.activityLevel === activity.key && (
                    <Ionicons name="checkmark" size={20} color="#4ade80" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Dietary Preferences</Text>
            <Text style={styles.stepDescription}>
              Select any dietary restrictions or preferences (optional)
            </Text>

            <View style={styles.preferencesGrid}>
              {dietaryOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.preferenceChip,
                    formData.dietaryPreferences.includes(option.id) && styles.preferenceChipActive
                  ]}
                  onPress={() => toggleDietaryPreference(option.id)}
                >
                  <Text style={[
                    styles.preferenceChipText,
                    formData.dietaryPreferences.includes(option.id) && styles.preferenceChipTextActive
                  ]}>{option.name}</Text>
                  {formData.dietaryPreferences.includes(option.id) && (
                    <Ionicons name="checkmark" size={16} color="white" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e']}
        style={styles.gradient}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Progress Header */}
          <View style={styles.header}>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { width: `${((currentStep + 1) / steps.length) * 100}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {currentStep + 1} of {steps.length}
              </Text>
            </View>
            <Text style={styles.stepIndicator}>{steps[currentStep]}</Text>
          </View>

          {/* Step Content */}
          {renderStep()}
        </ScrollView>

        {/* Navigation Buttons */}
        <View style={styles.navigation}>
          {currentStep > 0 && (
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Ionicons name="arrow-back" size={20} color="#64748b" />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <LinearGradient
              colors={['#4ade80', '#22c55e']}
              style={styles.nextButtonGradient}
            >
              <Text style={styles.nextButtonText}>
                {currentStep === steps.length - 1 ? 'Complete Setup' : 'Next'}
              </Text>
              <Ionicons name="arrow-forward" size={20} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4ade80',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'right',
  },
  stepIndicator: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  stepContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: 'white',
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 4,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentButtonActive: {
    backgroundColor: '#4ade80',
  },
  segmentButtonText: {
    fontSize: 16,
    color: '#94a3b8',
    fontWeight: '500',
  },
  segmentButtonTextActive: {
    color: 'white',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  optionButtonActive: {
    borderColor: '#4ade80',
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
    marginBottom: 4,
  },
  optionLabelActive: {
    color: '#4ade80',
  },
  optionDescription: {
    fontSize: 14,
    color: '#64748b',
  },
  preferencesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  preferenceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
  },
  preferenceChipActive: {
    backgroundColor: '#4ade80',
    borderColor: '#4ade80',
  },
  preferenceChipText: {
    fontSize: 14,
    color: '#94a3b8',
  },
  preferenceChipTextActive: {
    color: 'white',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#64748b',
  },
  nextButton: {
    flex: 1,
    marginLeft: 16,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});