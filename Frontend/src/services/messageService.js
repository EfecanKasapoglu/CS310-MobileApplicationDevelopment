import axios from 'axios';
import {Platform} from 'react-native';

const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8080/messages' : 'http://localhost:8080/messages';

export const sendMessage = async (token, senderId, receiverId, content) => {
  try {
    const response = await axios.post(
      `${API_URL}/send`,
      { senderId, receiverId, content },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const getMessages = async (token, friendId) => {
  try {
    const response = await axios.get(`${API_URL}/${friendId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};