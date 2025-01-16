import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFriendRequests, acceptFriendRequest } from '../services/friendService';

const FriendRequestsScreen = () => {
  const [requests, setRequests] = useState([]);

  const fetchFriendRequests = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        console.error('Error: userId is null');
        Alert.alert('Error', 'User ID is missing. Please log in again.');
        return;
      }
      const fetchedRequests = await getFriendRequests(token, userId); 
      console.log('Friend Requests:', fetchedRequests); 
      setRequests(fetchedRequests); 
    } catch (error) {
      console.error('Error fetching friend requests:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to fetch friend requests.');
    }
  };

  const handleAccept = async (senderId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const receiverId = await AsyncStorage.getItem('userId');

      if (!senderId || !receiverId) {
        Alert.alert('Error', 'Sender ID or Receiver ID is missing.');
        return;
      }

      console.log('Accepting Friend Request:', { senderId, receiverId });

      await acceptFriendRequest(token, senderId, receiverId); 
      Alert.alert('Success', 'Friend request accepted!');
      fetchFriendRequests(); 
    } catch (error) {
      console.error('Error accepting friend request:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to accept friend request.');
    }
  };

  useEffect(() => {
    fetchFriendRequests(); 
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pending Friend Requests</Text>
      <FlatList
      data={requests}
      keyExtractor={(item, index) => item.id || index.toString()}
      renderItem={({ item }) => (
     <View style={styles.requestItem}>
      <Text>{item.firstName} {item.lastName}</Text>
      <Button title="Accept" onPress={() => handleAcceptFriend(item.id)} />
    </View>
  )}
/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  requestItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
});

export default FriendRequestsScreen;