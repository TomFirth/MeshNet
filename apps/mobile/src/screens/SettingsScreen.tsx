import React from 'react';
import { View, Text, Button } from 'react-native';

const SettingsScreen = () => {
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>Settings</Text>
      <Text>User ID: 0xabc...123</Text>
      <Button title="Backup Seed Phrase" onPress={() => {}} />
      <Button title="Wipe Local Data" color="red" onPress={() => {}} />
    </View>
  );
};

export default SettingsScreen;
