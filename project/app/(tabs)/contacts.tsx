import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, TextInput } from 'react-native';
import * as Contacts from 'expo-contacts';
import { Plus, Trash2, Search } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ContactsScreen() {
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredContacts, setFilteredContacts] = useState([]);

  useEffect(() => {
    loadContacts();
    loadSelectedContacts();
  }, []);

  useEffect(() => {
    const filtered = contacts.filter(contact => 
      contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phoneNumbers?.[0]?.number?.includes(searchQuery)
    );
    setFilteredContacts(filtered);
  }, [searchQuery, contacts]);

  const loadContacts = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status === 'granted') {
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers],
      });
      const contactsWithPhones = data.filter(contact => contact.phoneNumbers?.length > 0);
      setContacts(contactsWithPhones);
      setFilteredContacts(contactsWithPhones);
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

  const toggleContact = async (contact) => {
    const newSelectedContacts = selectedContacts.some(c => c.id === contact.id)
      ? selectedContacts.filter(c => c.id !== contact.id)
      : [...selectedContacts, contact];
    
    setSelectedContacts(newSelectedContacts);
    
    try {
      await AsyncStorage.setItem('selectedContacts', JSON.stringify(newSelectedContacts));
    } catch (error) {
      console.error('Error saving selected contacts:', error);
    }
  };

  const renderContact = ({ item }) => {
    const isSelected = selectedContacts.some(contact => contact.id === item.id);
    return (
      <TouchableOpacity
        style={[styles.contactItem, isSelected && styles.selectedContact]}
        onPress={() => toggleContact(item)}
      >
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>{item.name}</Text>
          <Text style={styles.contactPhone}>
            {item.phoneNumbers?.[0]?.number || 'No number'}
          </Text>
        </View>
        {isSelected ? (
          <Trash2 size={24} color="#dc2626" />
        ) : (
          <Plus size={24} color="#4b5563" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Emergency Contacts</Text>
        <Text style={styles.subtitle}>
          Selected contacts: {selectedContacts.length}
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#6b7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search contacts..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#6b7280"
        />
      </View>

      <FlatList
        data={filteredContacts}
        renderItem={renderContact}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
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
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    marginTop: 5,
  },
  searchContainer: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  contactItem: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  selectedContact: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#dc2626',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#111827',
  },
  contactPhone: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    marginTop: 4,
  },
});