import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useChannelStore } from '../store/useChannelStore';
import { Channel } from '@meshnet/protocol';

const DiscoveryScreen = ({ navigation }: any) => {
  const { fetchDiscoveryChannels, joinChannel } = useChannelStore();
  const [nearby, setNearby] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);

  const handleJoin = async (channel: Channel) => {
    await joinChannel(channel.id);
    navigation.navigate('Mesh', {
      screen: 'Chat',
      params: { channelId: channel.id, name: channel.name }
    });
  };

  const loadNearby = async () => {
    const channels = await fetchDiscoveryChannels();
    setNearby(channels);
    setLoading(false);
  };

  useEffect(() => {
    loadNearby();
    const interval = setInterval(loadNearby, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading && nearby.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Searching for mesh channels...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Compass</Text>
      <Text style={styles.subheader}>Nearby groups discovered via gossip.</Text>

      {nearby.length === 0 ? (
        <View style={styles.placeholder}>
          <Text style={{ color: '#999', textAlign: 'center' }}>No new channels found in your neighborhood yet.</Text>
        </View>
      ) : (
        <FlatList
          data={nearby}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => handleJoin(item)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <View style={styles.joinBadge}>
                  <Text style={styles.joinText}>JOIN</Text>
                </View>
              </View>
              <Text style={styles.cardDesc}>{item.description}</Text>
              <Text style={styles.cardMeta}>Discovered via Peer</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  header: { fontSize: 28, fontWeight: 'bold', color: '#000' },
  subheader: { fontSize: 14, color: '#666', marginBottom: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#666' },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  card: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#007AFF' },
  joinBadge: { backgroundColor: '#007AFF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  joinText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  cardDesc: { color: '#333', fontSize: 14, lineHeight: 20 },
  cardMeta: { color: '#999', fontSize: 10, marginTop: 10, fontStyle: 'italic' }
});

export default DiscoveryScreen;
