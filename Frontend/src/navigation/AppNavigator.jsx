import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import FriendsScreen from '../screens/FriendsScreen';
import GroupManagementScreen from '../screens/GroupManagementScreen';
import GroupDetailScreen from '../screens/GroupDetailScreen';
import GroupMessagingSystem from '../screens/GroupMessagingSystem';
import ChatScreen from '../screens/ChatScreen'; 

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Friends" component={FriendsScreen} />
      <Stack.Screen name="GroupDetailScreen" component={GroupDetailScreen} />
      <Stack.Screen name="GroupMessagingSystem" component={GroupMessagingSystem} />
      <Stack.Screen name="GroupManagementScreen" component={GroupManagementScreen} />
      <Stack.Screen name="ChatScreen" component={ChatScreen} options={{ title: 'Chat' }} />
    </Stack.Navigator>
  );
};

export default AppNavigator;