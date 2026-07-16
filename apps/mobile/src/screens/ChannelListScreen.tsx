import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Button } from 'react-native';
import { useChannelStore } from '../store/useChannelStore';

const ChannelListScreen = ({ navigation }: any) => {
  const { channels, fetchChannels, isLoading } = useChannelStore();

  useEffect(() => {
    fetchChannels();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', padding: 10 }}>
        <Button title="Join" onPress={() => navigation.navigate('JoinChannel')} />
        <Button title="Create" onPress={() => navigation.navigate('CreateChannel')} />
      </View>
      <FlatList
        data={channels}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('Chat', { channelId: item.id, name: item.name })}
            style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: '#ccc' }}
          >
            <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
            <Text numberOfLines={1}>{item.description}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default ChannelListScreen;
