import axios from 'axios';
import {Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8080/auth' : 'http://localhost:8080/auth';

export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, {
      username: email,
      password: password,
    });

    if (response.data.token && response.data.userId) {
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('userId', response.data.userId);
      return response.data; 
    } else {
      throw new Error('User ID is missing in the response');
    }
  } catch (error) {
    console.error('Login Error:', error.response?.data || error.message);
    throw error; 
  }
};


export const register = async (firstName, lastName, email, password) => {
  try {
    const response = await axios.post(`${API_URL}/register`, {
      firstName,
      lastName,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.error('Register error:', error.response?.data);
    throw error;
  }
};