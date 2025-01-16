import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFriends, addFriend, getFriendRequests, acceptFriendRequest } from '../services/friendService';

const FriendsScreen = ({ navigation }) => {
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [receiverId, setReceiverId] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const storedUserId = await AsyncStorage.getItem('userId');
        if (!token || !storedUserId) {
          console.error('Error: Token or User ID is missing from AsyncStorage.');
          Alert.alert('Error', 'Authentication data is missing. Please log in again.');
          return;
        }
        setUserId(storedUserId);
        console.log('Token:', token);
        console.log('User ID:', storedUserId);
      } catch (error) {
        console.error('Error fetching user data:', error.message);
      }
    };

    fetchUserData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const [friendsList, requests] = await Promise.all([
        getFriends(token),
        getFriendRequests(token),
      ]);
      setFriends(friendsList);
      setFriendRequests(requests);
      console.log('Friends:', friendsList);
      console.log('Friend Requests:', requests);
    } catch (error) {
      console.error('Error fetching data:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to fetch data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddFriend = async () => {
    if (!receiverId.trim()) {
      Alert.alert('Error', 'Receiver ID cannot be empty.');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const storedUserId = await AsyncStorage.getItem('userId');
      if (!storedUserId) {
        throw new Error('User ID is missing.');
      }

      await addFriend(token, storedUserId, receiverId);
      Alert.alert('Success', 'Friend request sent!');
      setReceiverId('');
      fetchData();
    } catch (error) {
      console.error('Error adding friend:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to send friend request.');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptFriend = async (senderId) => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const receiverId = await AsyncStorage.getItem('userId');
      if (!senderId || !receiverId) {
        throw new Error('Sender ID or Receiver ID is missing.');
      }

      await acceptFriendRequest(token, senderId, receiverId);
      Alert.alert('Success', 'Friend request accepted!');
      fetchData();
    } catch (error) {
      console.error('Error accepting friend request:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to accept friend request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      
      <Text style={styles.title}>Friends</Text>
      {friends.length === 0 ? (
        <Text style={styles.placeholder}>No friends yet. Add some friends to chat!</Text>
      ) : (
        <FlatList
          data={friends}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.friendItem}>
              <Text style={styles.friendName}>{item.firstName} {item.lastName}</Text>
              <Button
                title="Chat"
                onPress={() => navigation.navigate('ChatScreen', { friendId: item.id, friendName: `${item.firstName} ${item.lastName}` })}
              />
            </View>
          )}
        />
      )}

      <Text style={styles.title}>Pending Friend Requests</Text>
      {friendRequests.length === 0 ? (
        <Text style={styles.placeholder}>No pending friend requests.</Text>
      ) : (
        <FlatList
          data={friendRequests}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.requestItem}>
              <Text>From: {item.firstName} {item.lastName}</Text>
              <Button title="Accept" onPress={() => handleAcceptFriend(item.id)} />
            </View>
          )}
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Enter Receiver ID"
        value={receiverId}
        onChangeText={setReceiverId}
      />
      <Button title="Add Friend" onPress={handleAddFriend} />

      <TouchableOpacity
        style={styles.groupButton}
        onPress={() => navigation.navigate('GroupManagementScreen')}
      >
        <Text style={styles.groupButtonText}>Manage Groups</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  placeholder: { fontSize: 16, fontStyle: 'italic', color: '#777', marginBottom: 16 },
  friendItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 8 },
  friendName: { fontSize: 18 },
  requestItem: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8 },
  input: { borderWidth: 1, padding: 8, marginBottom: 16, borderRadius: 8 },
  groupButton: { marginTop: 16, padding: 16, backgroundColor: '#4CAF50', borderRadius: 8, alignItems: 'center' },
  groupButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
});

export default FriendsScreen;