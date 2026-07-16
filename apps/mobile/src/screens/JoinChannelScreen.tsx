import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';

const JoinChannelScreen = ({ navigation }: any) => {
  const [channelId, setChannelId] = useState('');

  const handleJoin = () => {
    // Logic to join channel by UUID
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text>Channel UUID</Text>
      <TextInput value={channelId} onChangeText={setChannelId} style={{ borderWidth: 1, marginBottom: 10 }} />
      <Button title="Join via QR Scan" onPress={() => {}} />
      <Button title="Join via ID" onPress={handleJoin} />
    </View>
  );
};

export default JoinChannelScreen;
