import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getGroupDetails, addMemberToGroup } from '../services/groupService';

const GroupDetailScreen = ({ route, navigation }) => {
  const { groupId, groupName } = route.params;
  const [groupDetails, setGroupDetails] = useState({});
  const [members, setMembers] = useState([]);
  const [newMemberId, setNewMemberId] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchGroupDetails = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const details = await getGroupDetails(token, groupId);
      setGroupDetails(details);
      setMembers(details.members);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching group details:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to fetch group details.');
    }
  };

  useEffect(() => {
    fetchGroupDetails(); 
  }, [groupId]);

  const handleAddMember = async () => {
    if (!newMemberId.trim()) {
      Alert.alert('Error', 'Please enter a user ID.');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      await addMemberToGroup(token, groupId, newMemberId);

      fetchGroupDetails();
      setNewMemberId('');
      Alert.alert('Success', 'Member added successfully!');
    } catch (error) {
      console.error('Error adding member:', error.response?.data || error.message);
      Alert.alert('Error', error.response?.data || 'Failed to add member.');
    }
  };
  

  const handleOpenChat = () => {
    navigation.navigate('GroupMessagingSystem', { groupId, groupName });
  };

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{groupDetails.name || 'Unnamed Group'}</Text>
      <Text style={styles.subtitle}>
        Created On: {new Date(groupDetails.createdTime).toLocaleString()}
      </Text>
      <Text style={styles.subtitle}>Members:</Text>
      <FlatList
        data={members}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text>{`${item.firstName} ${item.lastName} (${item.email})`}</Text>
        )}
      />

      <TextInput
        style={styles.input}
        placeholder="Enter new member ID"
        value={newMemberId}
        onChangeText={setNewMemberId}
      />
      <Button title="Add Member" onPress={handleAddMember} />

      <TouchableOpacity
        style={styles.chatButton}
        onPress={handleOpenChat}
      >
        <Text style={styles.chatButtonText}>Open Chat</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 18, marginVertical: 8, fontWeight: 'bold' },
  input: { borderWidth: 1, padding: 8, marginVertical: 8, borderRadius: 4 },
  chatButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#4CAF50',
    borderRadius: 5,
    alignItems: 'center',
  },
  chatButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default GroupDetailScreen;