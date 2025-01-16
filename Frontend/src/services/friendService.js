import axios from 'axios';
import {Platform} from 'react-native';

const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8080/friends' : 'http://localhost:8080/friends';

export const addFriend = async (token, senderId, receiverId) => {
  try {
    console.log('Sending request to add friend:', { senderId, receiverId });
    const response = await axios.post(
      `${API_URL}/add`,
      { senderId, receiverId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error('Error in addFriend:', error.response?.data || error.message);
    throw error;
  }
};

export const getFriends = async (token) => {
  const response = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getFriendRequests = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/requests`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching friend requests:', error.response?.data || error.message);
    throw error;
  }
};

export const acceptFriendRequest = async (token, senderId, receiverId) => {
  const response = await axios.post(
    `${API_URL}/accept`,
    { senderId, receiverId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};