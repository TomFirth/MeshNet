import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';

const CreateChannelScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = () => {
    // Logic to create channel
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text>Channel Name</Text>
      <TextInput value={name} onChangeText={setName} style={{ borderWidth: 1, marginBottom: 10 }} />
      <Text>Description</Text>
      <TextInput value={description} onChangeText={setDescription} style={{ borderWidth: 1, marginBottom: 10 }} />
      <Button title="Create Channel" onPress={handleCreate} />
    </View>
  );
};

export default CreateChannelScreen;
