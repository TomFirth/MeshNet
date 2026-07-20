import React from 'react';
import { View, Text, Button, Switch, StyleSheet, ScrollView, Alert } from 'react-native';
import { useSettingsStore } from '../store/useSettingsStore';
import { useChannelStore } from '../store/useChannelStore';
import { useMessageStore } from '../store/useMessageStore';

const SettingsScreen = () => {
  const { isSimulatorEnabled, setSimulatorEnabled, clearAllBlocks, nodeId } = useSettingsStore();
  const { fetchChannels } = useChannelStore();

  const handleUnblockAll = () => {
    Alert.alert(
      "Unblock All",
      "Are you sure you want to unblock all users and channels?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unblock All",
          onPress: async () => {
            await clearAllBlocks();
            await fetchChannels();
            Alert.alert("Success", "All blocks have been removed. Restart the app or refresh lists to see changes.");
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Settings</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Development</Text>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowLabel}>Mesh Simulator</Text>
            <Text style={styles.rowSub}>Simulate virtual peers walking by every 15s</Text>
          </View>
          <Switch
            value={isSimulatorEnabled}
            onValueChange={setSimulatorEnabled}
            trackColor={{ false: '#767577', true: '#34C759' }}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Identity</Text>
        <Text style={styles.infoText}>Node ID: {nodeId || 'Loading...'}</Text>
        <Button title="Backup Seed Phrase" onPress={() => {}} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy</Text>
        <Button title="Unblock All Entities" onPress={handleUnblockAll} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Storage</Text>
        <Button title="Wipe Local Data" color="#FF3B30" onPress={() => {}} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7', padding: 20 },
  header: { fontSize: 32, fontWeight: 'bold', marginBottom: 20, marginTop: 40 },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  sectionTitle: { fontSize: 13, color: '#8E8E93', textTransform: 'uppercase', marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowLabel: { fontSize: 17, fontWeight: '500' },
  rowSub: { fontSize: 12, color: '#8E8E93', marginTop: 2 },
  infoText: { fontSize: 15, marginBottom: 15, color: '#333' }
});

export default SettingsScreen;
