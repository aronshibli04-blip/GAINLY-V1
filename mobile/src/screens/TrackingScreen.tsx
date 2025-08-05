import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../store/userStore';
import { format } from 'date-fns';

export default function TrackingScreen() {
  const [activeTab, setActiveTab] = useState<'weight' | 'calories' | 'activity'>('weight');
  const [weightInput, setWeightInput] = useState('');
  const [caloriesInput, setCaloriesInput] = useState('');
  const [descriptionInput, setDescriptionInput] = useState('');
  const [activityType, setActivityType] = useState<'steps' | 'light' | 'moderate' | 'heavy'>('light');
  const [activityValue, setActivityValue] = useState('');

  const { user, addWeightEntry, addCalorieEntry, addActivityEntry } = useUserStore();
  const today = format(new Date(), 'yyyy-MM-dd');

  const handleLogWeight = () => {
    if (!weightInput || !user) return;

    const weight = parseFloat(weightInput);
    if (weight < 30 || weight > 300) {
      Alert.alert('Invalid Weight', 'Please enter a valid weight between 30-300 kg');
      return;
    }

    addWeightEntry({
      userId: user.id,
      weight,
      date: today,
    });

    setWeightInput('');
    Alert.alert('Success', 'Weight logged successfully!');
  };

  const handleLogCalories = () => {
    if (!caloriesInput || !user) return;

    const calories = parseInt(caloriesInput);
    if (calories < 50 || calories > 5000) {
      Alert.alert('Invalid Calories', 'Please enter a valid calorie amount between 50-5000');
      return;
    }

    addCalorieEntry({
      userId: user.id,
      calories,
      description: descriptionInput || undefined,
      date: today,
    });

    setCaloriesInput('');
    setDescriptionInput('');
    Alert.alert('Success', 'Calories logged successfully!');
  };

  const handleLogActivity = () => {
    if (!activityValue || !user) return;

    const value = parseInt(activityValue);
    if (value < 0 || value > 50000) {
      Alert.alert('Invalid Activity', 'Please enter a valid activity value');
      return;
    }

    addActivityEntry({
      userId: user.id,
      type: activityType,
      value,
      date: today,
    });

    setActivityValue('');
    Alert.alert('Success', 'Activity logged successfully!');
  };

  const renderWeightTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>Current Weight (kg)</Text>
        <TextInput
          style={styles.textInput}
          value={weightInput}
          onChangeText={setWeightInput}
          placeholder="Enter your weight"
          placeholderTextColor="#64748b"
          keyboardType="numeric"
        />
        <Text style={styles.inputHint}>
          Weigh yourself at the same time daily, preferably in the morning
        </Text>
      </View>

      <TouchableOpacity style={styles.logButton} onPress={handleLogWeight}>
        <LinearGradient
          colors={['#10b981', '#059669']}
          style={styles.buttonGradient}
        >
          <Ionicons name="scale" size={20} color="white" />
          <Text style={styles.buttonText}>Log Weight</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderCaloriesTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>Calories</Text>
        <TextInput
          style={styles.textInput}
          value={caloriesInput}
          onChangeText={setCaloriesInput}
          placeholder="Enter calories"
          placeholderTextColor="#64748b"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>Description (Optional)</Text>
        <TextInput
          style={styles.textInput}
          value={descriptionInput}
          onChangeText={setDescriptionInput}
          placeholder="What did you eat?"
          placeholderTextColor="#64748b"
          multiline
        />
      </View>

      <TouchableOpacity style={styles.logButton} onPress={handleLogCalories}>
        <LinearGradient
          colors={['#3b82f6', '#2563eb']}
          style={styles.buttonGradient}
        >
          <Ionicons name="restaurant" size={20} color="white" />
          <Text style={styles.buttonText}>Log Calories</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderActivityTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>Activity Type</Text>
        <View style={styles.activityTypes}>
          {[
            { key: 'steps', label: 'Steps', icon: 'walk' },
            { key: 'light', label: 'Light Activity', icon: 'bicycle' },
            { key: 'moderate', label: 'Moderate', icon: 'fitness' },
            { key: 'heavy', label: 'Heavy Training', icon: 'barbell' },
          ].map((activity) => (
            <TouchableOpacity
              key={activity.key}
              style={[
                styles.activityButton,
                activityType === activity.key && styles.activityButtonActive
              ]}
              onPress={() => setActivityType(activity.key as typeof activityType)}
            >
              <Ionicons 
                name={activity.icon as any} 
                size={20} 
                color={activityType === activity.key ? 'white' : '#64748b'} 
              />
              <Text style={[
                styles.activityButtonText,
                activityType === activity.key && styles.activityButtonTextActive
              ]}>
                {activity.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>
          {activityType === 'steps' ? 'Number of Steps' : 'Duration (hours)'}
        </Text>
        <TextInput
          style={styles.textInput}
          value={activityValue}
          onChangeText={setActivityValue}
          placeholder={activityType === 'steps' ? '10000' : '1.5'}
          placeholderTextColor="#64748b"
          keyboardType="numeric"
        />
      </View>

      <TouchableOpacity style={styles.logButton} onPress={handleLogActivity}>
        <LinearGradient
          colors={['#8b5cf6', '#7c3aed']}
          style={styles.buttonGradient}
        >
          <Ionicons name="fitness" size={20} color="white" />
          <Text style={styles.buttonText}>Log Activity</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Daily Tracking</Text>
        <Text style={styles.subtitle}>Log your daily progress</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        {[
          { key: 'weight', label: 'Weight', icon: 'scale' },
          { key: 'calories', label: 'Calories', icon: 'restaurant' },
          { key: 'activity', label: 'Activity', icon: 'fitness' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabButton,
              activeTab === tab.key && styles.tabButtonActive
            ]}
            onPress={() => setActiveTab(tab.key as typeof activeTab)}
          >
            <Ionicons 
              name={tab.icon as any} 
              size={20} 
              color={activeTab === tab.key ? '#10b981' : '#64748b'} 
            />
            <Text style={[
              styles.tabButtonText,
              activeTab === tab.key && styles.tabButtonTextActive
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {activeTab === 'weight' && renderWeightTab()}
        {activeTab === 'calories' && renderCaloriesTab()}
        {activeTab === 'activity' && renderActivityTab()}
      </ScrollView>
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
  tabNavigation: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 8,
  },
  tabButtonActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: '#10b981',
  },
  tabButtonText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  tabButtonTextActive: {
    color: '#10b981',
  },
  scrollView: {
    flex: 1,
  },
  tabContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  inputSection: {
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
  inputHint: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 8,
    lineHeight: 16,
  },
  activityTypes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  activityButton: {
    flex: 1,
    minWidth: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    gap: 8,
  },
  activityButtonActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: '#10b981',
  },
  activityButtonText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
    textAlign: 'center',
  },
  activityButtonTextActive: {
    color: '#10b981',
  },
  logButton: {
    marginTop: 16,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});