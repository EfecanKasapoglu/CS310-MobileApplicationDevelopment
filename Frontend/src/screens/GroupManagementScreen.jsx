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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getGroups, createGroup, getGroupDetails } from '../services/groupService';

const GroupManagementScreen = ({ navigation }) => {
  const [groups, setGroups] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [members, setMembers] = useState('');

  const fetchGroups = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId'); 
      if (!userId) {
        Alert.alert('Error', 'User ID is missing. Please log in again.');
        return;
      }
      const userGroups = await getGroups(token); 
      console.log('Fetched Groups:', userGroups); 
      setGroups(userGroups); 
    } catch (error) {
      console.error('Error fetching groups:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to fetch groups.');
    }
  };
  
  
  

  const handleCreateGroup = async () => {
    try {
        const token = await AsyncStorage.getItem('token');
        const userId = await AsyncStorage.getItem('userId');

      
        if (!groupName.trim()) {
            Alert.alert('Error', 'Group name is required.');
            return;
        }

        if (!members.trim()) {
            Alert.alert('Error', 'At least one member ID is required.');
            return;
        }
        const memberList = members.split(',').map(member => member.trim());

        if (memberList.length === 1 && memberList.includes(userId)) {
            Alert.alert('You cannot create a group with only yourself.');
            return;
        }

        
        await createGroup(token, groupName, memberList);

        Alert.alert('Success', 'Group created successfully!');
        setGroupName('');
        setMembers('');

        fetchGroups(); 
    } catch (error) {
        console.error('Error creating group:', error.response?.data || error.message);
        Alert.alert('Error', error.response?.data || 'Failed to create group.');
    }
};

  
  
  
  

  const handleGroupDetails = async (groupId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const groupDetails = await getGroupDetails(token, groupId);
      navigation.navigate('GroupDetailsScreen', { groupDetails });
    } catch (error) {
      console.error('Error fetching group details:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to fetch group details.');
    }
  };

  useEffect(() => {
    fetchGroups();
    console.log('Groups State:', groups); 
  }, []);
  
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Groups</Text>
      <FlatList
       data={groups}
       keyExtractor={(item) => item.id ? item.id.toString() : Math.random().toString()}
       renderItem={({ item }) => (
         <TouchableOpacity
            style={styles.groupItem}
            onPress={() => navigation.navigate('GroupDetailScreen', { groupId: item.id })} 
        >
         <Text style={styles.groupName}>{item.name || 'Unnamed Group'}</Text>
       </TouchableOpacity>
      )}
      ListEmptyComponent={
       <Text style={{ textAlign: 'center', marginTop: 20 }}>No groups found. Create one to get started!</Text>
   }
  />



      <Text style={styles.subtitle}>Create New Group</Text>
      <TextInput
        style={styles.input}
        placeholder="Group Name"
        value={groupName}
        onChangeText={setGroupName}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter Member IDs (comma separated)"
        value={members}
        onChangeText={setMembers}
      />
      <Button title="Create Group" onPress={handleCreateGroup} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  subtitle: { fontSize: 20, marginVertical: 16, fontWeight: 'bold' },
  groupItem: {
    padding: 16,
    marginVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  groupName: { fontSize: 18, fontWeight: 'bold' },
  input: { borderWidth: 1, padding: 8, marginVertical: 8, borderRadius: 4 },
});

export default GroupManagementScreen;