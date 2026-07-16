import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ChannelListScreen from '../screens/ChannelListScreen';
import ChatScreen from '../screens/ChatScreen';
import SettingsScreen from '../screens/SettingsScreen';
import CreateChannelScreen from '../screens/CreateChannelScreen';
import JoinChannelScreen from '../screens/JoinChannelScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const ChannelStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Channels" component={ChannelListScreen} />
    <Stack.Screen name="Chat" component={ChatScreen} />
    <Stack.Screen name="CreateChannel" component={CreateChannelScreen} />
    <Stack.Screen name="JoinChannel" component={JoinChannelScreen} />
  </Stack.Navigator>
);

export const AppNavigator = () => (
  <Tab.Navigator screenOptions={{ headerShown: false }}>
    <Tab.Screen name="Mesh" component={ChannelStack} />
    <Tab.Screen name="Settings" component={SettingsScreen} />
  </Tab.Navigator>
);
