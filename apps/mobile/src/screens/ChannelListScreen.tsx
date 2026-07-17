import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useChannelStore } from '../store/useChannelStore';
import { Ionicons } from '@expo/vector-icons';

const ChannelListScreen = ({ navigation }: any) => {
  const { channels, fetchChannels, isLoading, leaveChannel, renameChannel } = useChannelStore();

  useEffect(() => {
    fetchChannels();
    const interval = setInterval(fetchChannels, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleRename = (id: string, currentName: string) => {
    Alert.prompt(
      "Rename Channel",
      "Enter new name for the channel",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "OK",
          onPress: (newName) => {
            if (newName && newName.trim()) {
              renameChannel(id, newName.trim());
            }
          }
        }
      ],
      "plain-text",
      currentName
    );
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      "Leave Channel",
      `Are you sure you want to leave ${name}? You will no longer receive messages from this mesh group.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: () => leaveChannel(id)
        }
      ]
    );
  };

  if (isLoading && channels.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {channels.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No joined channels yet.</Text>
          <Text style={styles.emptySub}>Go to 'Compass' to discover nearby groups or tap 'Create'.</Text>
        </View>
      ) : (
        <FlatList
          data={channels}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.channelWrapper}>
              <TouchableOpacity
                onPress={() => navigation.navigate('Chat', { channelId: item.id, name: item.name })}
                style={styles.channelItem}
              >
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{item.name.substring(0, 1).toUpperCase()}</Text>
                </View>
                <View style={styles.info}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.description} numberOfLines={1}>{item.description || 'No description'}</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.actions}>
                <TouchableOpacity onPress={() => handleRename(item.id, item.name)} style={styles.actionBtn}>
                  <Ionicons name="pencil-outline" size={20} color="#007AFF" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id, item.name)} style={styles.actionBtn}>
                  <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  emptySub: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 10 },
  channelWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc'
  },
  channelItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  info: { flex: 1, marginLeft: 15 },
  name: { fontSize: 16, fontWeight: 'bold' },
  description: { fontSize: 14, color: '#666', marginTop: 2 },
  actions: {
    flexDirection: 'row',
    paddingRight: 10
  },
  actionBtn: {
    padding: 10,
  }
});

export default ChannelListScreen;
