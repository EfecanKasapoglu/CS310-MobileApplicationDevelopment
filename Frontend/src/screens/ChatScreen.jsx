import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Button,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { sendMessage } from '../services/messageService';

const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8080/messages' : 'http://localhost:8080/messages';

const ChatScreen = ({ route }) => {
  const { friendId, friendName } = route.params;
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await AsyncStorage.getItem('userId');
      if (!id) {
        Alert.alert('Error', 'User ID is missing. Please log in again.');
        return;
      }
      setUserId(id);
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await axios.get(
          `${API_URL}/${friendId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
  
        // Gelen ve giden mesajları filtrele
        const filteredMessages = response.data.filter(
          (msg) =>
            (msg.senderId === userId && msg.receiverId === friendId) ||
            (msg.senderId === friendId && msg.receiverId === userId)
        );
  
        setMessages(filteredMessages);
      } catch (error) {
        console.error('Error fetching messages:', error.response?.data || error.message);
        Alert.alert('Error', 'Failed to fetch messages.');
      } finally {
        setLoading(false);
      }
    };
  
    fetchMessages();
  }, [friendId, userId]);
  

  const handleSendMessage = async () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Message content cannot be empty.');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const sentMessage = await sendMessage(token, userId, friendId, content);
      setMessages((prevMessages) => [...prevMessages, sentMessage]);
      setContent('');
    } catch (error) {
      console.error('Error sending message:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to send message.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>
        Chat with <Text style={{ fontWeight: 'bold' }}>{friendName || 'Unknown'}</Text>
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item, index) => item.id || index.toString()}
          renderItem={({ item }) => (
            <View
              style={[
                styles.messageContainer,
                item.senderId === userId ? styles.myMessage : styles.friendMessage,
              ]}
            >
              <Text style={styles.messageText}>{item.content}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyMessage}>No messages yet.</Text>}
        />
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          value={content}
          onChangeText={setContent}
        />
        <Button title="Send" onPress={handleSendMessage} />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9', padding: 10 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  messageContainer: { padding: 10, borderRadius: 8, marginVertical: 5, maxWidth: '80%' },
  myMessage: { backgroundColor: '#007bff', alignSelf: 'flex-end' },
  friendMessage: { backgroundColor: '#e5e5ea', alignSelf: 'flex-start' },
  messageText: { color: '#000' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  emptyMessage: { textAlign: 'center', color: '#888', marginTop: 20 },
});

export default ChatScreen;
