import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Send } from 'lucide-react-native';
import { GoogleGenAI } from '@google/genai';  // Import the GoogleGenAI package
import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace this with your Gemini API key
const GEMINI_API_KEY = '';  // Replace with your actual API key

// Initialize the GoogleGenAI client
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export default function ChatbotScreen() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState(null); // State to store profile data

  useEffect(() => {
    loadProfile(); // Load profile data on component mount
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

  const sendMessage = async () => {
    if (!message.trim()) return;

    // Add user message to chat
    const userMessage = {
      text: message,
      isUser: true,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      // Include profile data in the prompt if available
      const profileInfo = profile
        ? `Here is the user's profile information:\n${JSON.stringify(profile, null, 2)}\n\n`
        : '';
      const prompt = `${profileInfo}User Message: ${message}`;

      // Send message to Gemini model using GoogleGenAI
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash", // Model ID
        contents: prompt, // Use the prompt with profile data
      });

      // Get the response text from the model
      const botMessage = {
        text: response.text, // This is the response from Gemini
        isUser: false,
        timestamp: new Date().toISOString(),
      };

      // Add bot message to chat
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        text: 'Sorry, I encountered an error. Please try again.',
        isUser: false,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Health Assistant</Text>
      </View>

      <ScrollView style={styles.messagesContainer}>
        {messages.map((msg, index) => (
          <View
            key={index}
            style={[styles.messageWrapper, msg.isUser ? styles.userMessageWrapper : styles.botMessageWrapper]}
          >
            <View
              style={[styles.message, msg.isUser ? styles.userMessage : styles.botMessage]}
            >
              <Text style={[styles.messageText, msg.isUser ? styles.userMessageText : styles.botMessageText]}>
                {msg.text}
              </Text>
            </View>
          </View>
        ))}
        {isLoading && (
          <View style={styles.loadingWrapper}>
            <Text style={styles.loadingText}>Thinking...</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Type your message..."
          placeholderTextColor="#6b7280"
          multiline
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={sendMessage}
          disabled={!message.trim() || isLoading}
        >
          <Send size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messageWrapper: {
    marginBottom: 12,
    flexDirection: 'row',
  },
  userMessageWrapper: {
    justifyContent: 'flex-end',
  },
  botMessageWrapper: {
    justifyContent: 'flex-start',
  },
  message: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  userMessage: {
    backgroundColor: '#dc2626',
  },
  botMessage: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  messageText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  userMessageText: {
    color: '#ffffff',
  },
  botMessageText: {
    color: '#111827',
  },
  loadingWrapper: {
    padding: 12,
    alignItems: 'center',
  },
  loadingText: {
    color: '#6b7280',
    fontFamily: 'Inter-Regular',
  },
  inputContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  input: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 24,
    padding: 12,
    marginRight: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#dc2626',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
