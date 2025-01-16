import axios from 'axios';
import {Platform} from 'react-native';

const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8080/groups' : 'http://localhost:8080/groups';


export const getGroups = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('API Response:', response.data); 
    return response.data; 
  } catch (error) {
    console.error('Error fetching groups:', error.response?.data || error.message);
    throw error;
  }
};




export const createGroup = async (token, name, members) => {
  try {
    const response = await axios.post(
      `${API_URL}/create`,
      { name, members },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating group:', error.response?.data || error.message);
    throw error;
  }
};

export const getGroupDetails = async (token, groupId) => {
  try {
    const response = await axios.get(`${API_URL}/${groupId}/details`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching group details:', error.response?.data || error.message);
    throw error;
  }
};

export const fetchGroupMessages = async (token, groupId) => {
  try {
    const response = await axios.get(`${API_URL}/${groupId}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('Fetched Messages:', response.data); 
    return response.data;
  } catch (error) {
    console.error('Error fetching messages:', error.message);
    throw error;
  }
};


export const sendMessage = async (token, groupId, senderId, content) => {
  try {
    const response = await axios.post(
      `${API_URL}/${groupId}/send`,
      { senderId, content },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('Sent Message:', response.data); 
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error.message);
    throw error;
  }
};
export const addMemberToGroup = async (token, groupId, userId) => {
  try {
    const response = await axios.post(
      `${API_URL}/${groupId}/add-member`,
      { userId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error('Error adding member:', error.response?.data || error.message);
    throw error;
  }
};
const API_URL2 = Platform.OS === 'android' ? 'http://10.0.2.2:8080/users' : 'http://localhost:8080/users';
export const fetchSenderDetails = async (token, senderId) => {
  try {
    const response = await axios.get(`${API_URL2}/${senderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching sender details:', error.message);
    throw error;
  }
};