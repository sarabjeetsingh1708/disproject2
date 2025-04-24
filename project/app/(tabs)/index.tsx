import { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
  Linking,
  Image,
  FlatList,
  Dimensions,
} from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  TriangleAlert as AlertTriangle,
  Phone,
  Heart,
  Shield,
  Flame,
  UserRound,
} from 'lucide-react-native';

const emergencyServices = [
  {
    name: 'Private Ambulance',
    number: '9311314442',
    description: 'Quick response private ambulance service',
    icon: Heart,
    color: '#ef4444',
    image: 'https://images.unsplash.com/photo-1587745416684-47953f16f02f?q=80&w=500&auto=format&fit=crop',
  },
  {
    name: 'Police',
    number: '100',
    description: 'Emergency police services',
    icon: Shield,
    color: '#3b82f6',
    image: 'https://images.unsplash.com/photo-1557081999-0ea3e23579d2?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    name: 'Fire',
    number: '101',
    description: 'Fire emergency services',
    icon: Flame,
    color: '#f97316',
    image: 'https://images.unsplash.com/photo-1572204097183-e1ab140342ed?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    name: 'Women Helpline',
    number: '1091',
    description: '24/7 women emergency helpline',
    icon: UserRound,
    color: '#d946ef',
    image: 'https://images.unsplash.com/photo-1536010447069-d2c8af80c584?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
];

export default function SOSScreen() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSelectedContacts();
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Location permission is required for emergency services');
    }
  };

  const loadSelectedContacts = async () => {
    try {
      const savedContacts = await AsyncStorage.getItem('selectedContacts');
      if (savedContacts) {
        setSelectedContacts(JSON.parse(savedContacts));
      }
    } catch (error) {
      console.error('Error loading selected contacts:', error);
    }
  };

  const sendMessage = async (phoneNumber, message) => {
    if (Platform.OS === 'web') {
      window.open(`sms:${phoneNumber}?body=${encodeURIComponent(message)}`);
    } else {
      const separator = Platform.OS === 'ios' ? '&' : '?';
      await Linking.openURL(`sms:${phoneNumber}${separator}body=${encodeURIComponent(message)}`);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  };

  const handleSOS = async () => {
    try {
      setIsLoading(true);
      setErrorMsg(null);

      let currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(currentLocation);

      const message = `EMERGENCY! I need help! My current location: https://www.google.com/maps?q=${currentLocation.coords.latitude},${currentLocation.coords.longitude}`;

      for (const contact of selectedContacts) {
        const phoneNumber = contact.phoneNumbers?.[0]?.number;
        if (phoneNumber) {
          await sendMessage(phoneNumber, message);
        }
      }

      await Linking.openURL('tel:9311314442');
    } catch (error) {
      setErrorMsg('Error: Could not send emergency messages or make the call');
      console.error('Error in SOS:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmergencyCall = (number) => {
    Linking.openURL(`tel:${number}`);
  };

  const renderServiceCard = ({ item }) => {
    const Icon = item.icon;
    return (
      <View style={styles.serviceCard}>
        <Image source={{ uri: item.image }} style={styles.serviceImage} />
        <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
          <Icon size={24} color="#fff" />
        </View>
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceName}>{item.name}</Text>
          <Text style={[styles.serviceNumber, { color: item.color }]}>{item.number}</Text>
          <Text style={styles.serviceDescription}>{item.description}</Text>
        </View>
        <TouchableOpacity
          style={[styles.callButton, { backgroundColor: item.color }]}
          onPress={() => handleEmergencyCall(item.number)}
        >
          <Phone size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Emergency SOS</Text>
      </View>

      <View style={styles.content}>
        {errorMsg ? (
          <Text style={styles.errorText}>{errorMsg}</Text>
        ) : (
          <Text style={styles.instructions}>
            Press the SOS button in case of emergency. This will:
            {'\n'}1. Share your location with {selectedContacts.length} selected emergency contacts
            {'\n'}2. Call emergency services
          </Text>
        )}

        <TouchableOpacity
          style={[styles.sosButton, isLoading && styles.sosButtonLoading]}
          onPress={handleSOS}
          disabled={isLoading}
          activeOpacity={0.7}
        >
          <AlertTriangle size={48} color="#fff" />
          <Text style={styles.sosButtonText}>{isLoading ? 'SENDING...' : 'SOS'}</Text>
        </TouchableOpacity>

        {selectedContacts.length === 0 && (
          <Text style={styles.warningText}>
            No emergency contacts selected. Please add contacts in the Contacts tab.
          </Text>
        )}

        <FlatList
          data={emergencyServices}
          renderItem={renderServiceCard}
          keyExtractor={(item) => item.number}
          numColumns={2}
          contentContainerStyle={styles.gridContainer}
          scrollEnabled={true}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    backgroundColor: '#fff',
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
    flex: 1,
    padding: 20,
  },
  instructions: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#4b5563',
    textAlign: 'center',
    marginBottom: 20,
  },
  sosButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
    width: '100%',
  },
  sosButtonLoading: {
    backgroundColor: '#ef4444',
    opacity: 0.8,
  },
  sosButtonText: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 20,
  },
  warningText: {
    color: '#f59e0b',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginTop: 10,
  },
  gridContainer: {
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 8,
    width: (Dimensions.get('window').width - 60) / 2,
    overflow: 'hidden',
    elevation: 3,
  },
  serviceImage: {
    width: '100%',
    height: 100,
  },
  iconContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceInfo: {
    padding: 12,
  },
  serviceName: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#111827',
  },
  serviceNumber: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginTop: 2,
  },
  serviceDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    marginTop: 4,
  },
  callButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
