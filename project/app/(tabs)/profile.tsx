import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Save } from 'lucide-react-native';

export default function ProfileScreen() {
  const [profile, setProfile] = useState({
    name: '',
    age: '',
    bloodType: '',
    allergies: '',
    medications: '',
    conditions: '',
    homeAddress: '',
    workAddress: '',
    otherLocations: '',
    specialNeeds: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const savedProfile = await AsyncStorage.getItem('userProfile');
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const saveProfile = async () => {
    try {
      setIsSaving(true);
      await AsyncStorage.setItem('userProfile', JSON.stringify(profile));
      setSaveMessage('Profile saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveMessage('Error saving profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Medical Profile</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={profile.name}
            onChangeText={(text) => setProfile(prev => ({ ...prev, name: text }))}
          />
          <TextInput
            style={styles.input}
            placeholder="Age"
            value={profile.age}
            onChangeText={(text) => setProfile(prev => ({ ...prev, age: text }))}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Blood Type"
            value={profile.bloodType}
            onChangeText={(text) => setProfile(prev => ({ ...prev, bloodType: text }))}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Medical History</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Allergies"
            value={profile.allergies}
            onChangeText={(text) => setProfile(prev => ({ ...prev, allergies: text }))}
            multiline
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Current Medications"
            value={profile.medications}
            onChangeText={(text) => setProfile(prev => ({ ...prev, medications: text }))}
            multiline
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Medical Conditions"
            value={profile.conditions}
            onChangeText={(text) => setProfile(prev => ({ ...prev, conditions: text }))}
            multiline
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Locations</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Home Address"
            value={profile.homeAddress}
            onChangeText={(text) => setProfile(prev => ({ ...prev, homeAddress: text }))}
            multiline
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Work Address"
            value={profile.workAddress}
            onChangeText={(text) => setProfile(prev => ({ ...prev, workAddress: text }))}
            multiline
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Other Frequently Visited Locations"
            value={profile.otherLocations}
            onChangeText={(text) => setProfile(prev => ({ ...prev, otherLocations: text }))}
            multiline
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Special Needs</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Disability Information or Special Requirements"
            value={profile.specialNeeds}
            onChangeText={(text) => setProfile(prev => ({ ...prev, specialNeeds: text }))}
            multiline
          />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.savingButton]}
          onPress={saveProfile}
          disabled={isSaving}
        >
          <Save size={24} color="#ffffff" style={styles.saveIcon} />
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Saving...' : 'Save Profile'}
          </Text>
        </TouchableOpacity>

        {saveMessage ? (
          <Text style={styles.saveMessage}>{saveMessage}</Text>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#dc2626',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  savingButton: {
    backgroundColor: '#ef4444',
    opacity: 0.8,
  },
  saveIcon: {
    marginRight: 8,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  saveMessage: {
    textAlign: 'center',
    marginTop: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#059669',
  },
});