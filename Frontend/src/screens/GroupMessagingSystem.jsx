import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  Button,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchGroupMessages, sendMessage } from '../services/groupService';

const GroupMessagingScreen = ({ route }) => {
  const { groupId, groupName } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const fetchMessages = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const messageHistory = await fetchGroupMessages(token, groupId);
      console.log('Message History:', messageHistory);
      setMessages(messageHistory);
    } catch (error) {
      console.error('Error fetching messages:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to fetch messages.');
    }
  };

  const handleSendMessage = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');

      if (!newMessage.trim()) {
        Alert.alert('Error', 'Message cannot be empty.');
        return;
      }

      const sentMessage = await sendMessage(token, groupId, userId, newMessage);
      console.log('Sent Message:', sentMessage);
      setMessages((prevMessages) => [...prevMessages, sentMessage]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to send message.');
    }
  };
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };
  

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{groupName}</Text>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.messageItem}>
            <Text style={styles.sender}>{item.senderName}</Text>
            <Text style={styles.message}>{item.content}</Text>
            <Text style={styles.timestamp}>{formatTime(item.timestamp)}</Text>
            
          </View>
        )}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <Button title="Send" onPress={handleSendMessage} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  messageItem: { marginBottom: 12, padding: 8, backgroundColor: '#f0f0f0', borderRadius: 8 },
  sender: { fontWeight: 'bold', fontSize: 14 },
  message: { fontSize: 16, marginTop: 4 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  input: { flex: 1, borderWidth: 1, padding: 8, borderRadius: 4, marginRight: 8 },
});

export default GroupMessagingScreen;
