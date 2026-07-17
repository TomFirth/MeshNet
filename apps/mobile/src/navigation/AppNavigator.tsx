import React from 'react';
import { Button } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ChannelListScreen from '../screens/ChannelListScreen';
import ChatScreen from '../screens/ChatScreen';
import SettingsScreen from '../screens/SettingsScreen';
import DiscoveryScreen from '../screens/DiscoveryScreen';
import { useChannelStore } from '../store/useChannelStore';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const ChannelStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="Channels"
      component={ChannelListScreen}
      options={({ navigation }) => ({
        headerRight: () => (
          <Button
            title="Create"
            onPress={() => {
              // Quick create for MVP
              useChannelStore.getState().createChannel(
                `Channel ${Math.floor(Math.random() * 1000)}`,
                'Created locally'
              );
            }}
          />
        ),
      })}
    />
    <Stack.Screen name="Chat" component={ChatScreen} />
  </Stack.Navigator>
);

export const AppNavigator = () => (
  <Tab.Navigator screenOptions={{ headerShown: false }}>
    <Tab.Screen name="Mesh" component={ChannelStack} />
    <Tab.Screen name="Compass" component={DiscoveryScreen} />
    <Tab.Screen name="Settings" component={SettingsScreen} />
  </Tab.Navigator>
);
