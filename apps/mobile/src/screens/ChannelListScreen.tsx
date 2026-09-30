import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Platform, Modal, TextInput, Button } from 'react-native';
import { useChannelStore } from '../store/useChannelStore';
import { Ionicons } from '@expo/vector-icons';

const ChannelListScreen = ({ navigation }: any) => {
  const { channels, fetchChannels, isLoading, leaveChannel, renameChannel, blockChannel, reportChannel } = useChannelStore();
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [channelToRename, setChannelToRename] = useState<{ id: string, name: string } | null>(null);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    fetchChannels();
    const interval = setInterval(fetchChannels, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleRenamePress = (id: string, currentName: string, localName?: string) => {
    setChannelToRename({ id, name: currentName });
    setNewName(localName || currentName);
    setRenameModalVisible(true);
  };

  const saveRename = () => {
    if (channelToRename && newName.trim()) {
      renameChannel(channelToRename.id, newName.trim());
      setRenameModalVisible(false);
      setChannelToRename(null);
    }
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

  const handleReport = (id: string, name: string) => {
    if (Platform.OS === 'ios') {
      Alert.prompt(
        "Report Channel",
        "Please describe the reason for reporting this channel:",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Submit Report",
            onPress: (reason) => {
              if (reason) {
                reportChannel(id, name, reason as string);
              }
            }
          }
        ],
        "plain-text"
      );
    } else {
      Alert.alert(
        "Report Channel",
        "Are you sure you want to report this channel for inappropriate content?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Report", onPress: () => reportChannel(id, name, "Unspecified reason (Android)") }
        ]
      );
    }
  };

  const handleBlock = (id: string, name: string) => {
    Alert.alert(
      "Block Channel",
      `Are you sure you want to block ${name}? You will no longer see this channel or receive any messages from it via gossip.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Block",
          style: "destructive",
          onPress: () => blockChannel(id)
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
                onPress={() => navigation.navigate('Chat', { channelId: item.id, name: item.localName || item.name })}
                style={styles.channelItem}
              >
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{(item.localName || item.name).substring(0, 1).toUpperCase()}</Text>
                </View>
                <View style={styles.info}>
                  <Text style={styles.name}>{item.localName || item.name}</Text>
                  {item.localName && <Text style={styles.originalName}>Original: {item.name}</Text>}
                  <Text style={styles.description} numberOfLines={1}>{item.description || 'No description'}</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.actions}>
                <TouchableOpacity onPress={() => handleRenamePress(item.id, item.name, item.localName)} style={styles.actionBtn}>
                  <Ionicons name="pencil-outline" size={20} color="#007AFF" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleReport(item.id, item.name)} style={styles.actionBtn}>
                  <Ionicons name="flag-outline" size={20} color="#FF9500" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id, item.name)} style={styles.actionBtn}>
                  <Ionicons name="trash-outline" size={20} color="#666" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleBlock(item.id, item.name)} style={styles.actionBtn}>
                  <Ionicons name="ban-outline" size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      <Modal
        animationType="fade"
        transparent={true}
        visible={renameModalVisible}
        onRequestClose={() => setRenameModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Rename Channel</Text>
            <Text style={styles.modalSubtitle}>This name is only visible to you.</Text>
            <TextInput
              style={styles.modalInput}
              value={newName}
              onChangeText={setNewName}
              placeholder="Enter local name"
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setRenameModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveRename}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  originalName: { fontSize: 12, color: '#999', fontStyle: 'italic' },
  description: { fontSize: 14, color: '#666', marginTop: 2 },
  actions: {
    flexDirection: 'row',
    paddingRight: 10
  },
  actionBtn: {
    padding: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    width: '100%',
    height: 45,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    height: 45,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  }
});

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
