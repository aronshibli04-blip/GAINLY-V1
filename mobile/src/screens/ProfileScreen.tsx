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
import { User } from '../types';

export default function ProfileScreen() {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const { user, setUser, clearUserData } = useUserStore();

  const handleEditProfile = () => {
    if (user) {
      setEditingUser({ ...user });
      setShowEditModal(true);
    }
  };

  const handleSaveProfile = () => {
    if (editingUser) {
      setUser(editingUser);
      setShowEditModal(false);
      Alert.alert('Success', 'Profile updated successfully!');
    }
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset All Data',
      'This will permanently delete all your data including weight logs, calorie entries, and meal plans. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All Data',
          style: 'destructive',
          onPress: () => {
            clearUserData();
            Alert.alert('Data Cleared', 'All your data has been reset.');
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const bmi = user.weight / Math.pow(user.height / 100, 2);
  const bmiCategory = bmi < 18.5 ? 'Underweight' : 
                     bmi < 25 ? 'Normal' : 
                     bmi < 30 ? 'Overweight' : 'Obese';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Manage your account and preferences</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <LinearGradient
            colors={['#10b981', '#059669']}
            style={styles.profileGradient}
          >
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{user.firstName.charAt(0).toUpperCase()}</Text>
            </View>
            <Text style={styles.userName}>{user.firstName}</Text>
            <Text style={styles.userAge}>{user.age} years old • {user.sex}</Text>
          </LinearGradient>
        </View>

        {/* Physical Stats */}
        <View style={styles.statsCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="body" size={24} color="#10b981" />
            <Text style={styles.cardTitle}>Physical Stats</Text>
            <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
              <Ionicons name="pencil" size={16} color="#64748b" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Height</Text>
              <Text style={styles.statValue}>{user.height} cm</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Current Weight</Text>
              <Text style={styles.statValue}>{user.weight} kg</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Goal Weight</Text>
              <Text style={styles.statValue}>{user.goalWeight} kg</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>BMI</Text>
              <Text style={styles.statValue}>{bmi.toFixed(1)}</Text>
              <Text style={styles.statSubtext}>{bmiCategory}</Text>
            </View>
          </View>
        </View>

        {/* Activity Level */}
        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="fitness" size={24} color="#3b82f6" />
            <Text style={styles.cardTitle}>Activity Level</Text>
          </View>
          <Text style={styles.infoText}>
            {user.activityLevel.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </Text>
        </View>

        {/* Dietary Preferences */}
        {user.dietaryPreferences.length > 0 && (
          <View style={styles.infoCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="restaurant" size={24} color="#8b5cf6" />
              <Text style={styles.cardTitle}>Dietary Preferences</Text>
            </View>
            <View style={styles.preferencesContainer}>
              {user.dietaryPreferences.map((pref, index) => (
                <View key={index} style={styles.preferenceChip}>
                  <Text style={styles.preferenceText}>{pref.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Settings */}
        <View style={styles.settingsCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="settings" size={24} color="#f59e0b" />
            <Text style={styles.cardTitle}>Settings</Text>
          </View>
          
          <TouchableOpacity style={styles.settingItem} onPress={handleEditProfile}>
            <View style={styles.settingContent}>
              <Ionicons name="person" size={20} color="#94a3b8" />
              <Text style={styles.settingText}>Edit Profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#64748b" />
          </TouchableOpacity>

          <View style={styles.settingDivider} />

          <TouchableOpacity style={styles.settingItem} onPress={handleResetData}>
            <View style={styles.settingContent}>
              <Ionicons name="trash" size={20} color="#ef4444" />
              <Text style={[styles.settingText, { color: '#ef4444' }]}>Reset All Data</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfoCard}>
          <Text style={styles.appName}>GAINLY</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.appDescription}>
            Smart weight gain through real TDEE calculation and AI-powered meal planning
          </Text>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
              {editingUser && (
                <>
                  <View style={styles.modalInputGroup}>
                    <Text style={styles.modalInputLabel}>First Name</Text>
                    <TextInput
                      style={styles.modalTextInput}
                      value={editingUser.firstName}
                      onChangeText={(text) => setEditingUser(prev => prev ? { ...prev, firstName: text } : null)}
                      placeholder="Enter your first name"
                      placeholderTextColor="#64748b"
                    />
                  </View>

                  <View style={styles.modalInputGroup}>
                    <Text style={styles.modalInputLabel}>Age</Text>
                    <TextInput
                      style={styles.modalTextInput}
                      value={editingUser.age.toString()}
                      onChangeText={(text) => setEditingUser(prev => prev ? { ...prev, age: parseInt(text) || 0 } : null)}
                      placeholder="Enter your age"
                      placeholderTextColor="#64748b"
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={styles.modalInputGroup}>
                    <Text style={styles.modalInputLabel}>Height (cm)</Text>
                    <TextInput
                      style={styles.modalTextInput}
                      value={editingUser.height.toString()}
                      onChangeText={(text) => setEditingUser(prev => prev ? { ...prev, height: parseInt(text) || 0 } : null)}
                      placeholder="Enter your height"
                      placeholderTextColor="#64748b"
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={styles.modalInputGroup}>
                    <Text style={styles.modalInputLabel}>Current Weight (kg)</Text>
                    <TextInput
                      style={styles.modalTextInput}
                      value={editingUser.weight.toString()}
                      onChangeText={(text) => setEditingUser(prev => prev ? { ...prev, weight: parseInt(text) || 0 } : null)}
                      placeholder="Enter your weight"
                      placeholderTextColor="#64748b"
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={styles.modalInputGroup}>
                    <Text style={styles.modalInputLabel}>Goal Weight (kg)</Text>
                    <TextInput
                      style={styles.modalTextInput}
                      value={editingUser.goalWeight.toString()}
                      onChangeText={(text) => setEditingUser(prev => prev ? { ...prev, goalWeight: parseInt(text) || 0 } : null)}
                      placeholder="Enter your goal weight"
                      placeholderTextColor="#64748b"
                      keyboardType="numeric"
                    />
                  </View>
                </>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalCancelButton} 
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.modalSaveButton} onPress={handleSaveProfile}>
                <LinearGradient
                  colors={['#10b981', '#059669']}
                  style={styles.modalSaveGradient}
                >
                  <Text style={styles.modalSaveText}>Save Changes</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
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
  profileHeader: {
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  profileGradient: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  userAge: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statsCard: {
    marginHorizontal: 24,
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
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
    flex: 1,
  },
  editButton: {
    padding: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  statSubtext: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  infoCard: {
    marginHorizontal: 24,
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoText: {
    fontSize: 16,
    color: 'white',
    textTransform: 'capitalize',
  },
  preferencesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  preferenceChip: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  preferenceText: {
    fontSize: 14,
    color: '#8b5cf6',
  },
  settingsCard: {
    marginHorizontal: 24,
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    fontSize: 16,
    color: 'white',
  },
  settingDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 8,
  },
  appInfoCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    alignItems: 'center',
    paddingVertical: 32,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
  },
  appDescription: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  modalScrollView: {
    flex: 1,
    padding: 24,
  },
  modalInputGroup: {
    marginBottom: 20,
  },
  modalInputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
    marginBottom: 8,
  },
  modalTextInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: 'white',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 24,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  modalSaveButton: {
    flex: 1,
  },
  modalSaveGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 12,
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});