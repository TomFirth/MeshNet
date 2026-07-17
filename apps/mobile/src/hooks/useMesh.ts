import { useEffect, useRef } from 'react';
import { SyncEngine, Message, Channel, Transport } from '@meshnet/protocol';
import repository from '../database/sqlite.service';
import { useMessageStore } from '../store/useMessageStore';
import { useChannelStore } from '../store/useChannelStore';
import { v4 as uuidv4 } from 'uuid';

/**
 * useMesh hook
 * Orchestrates the background gossip process and simulates nearby peers.
 */
export const useMesh = () => {
  const engineRef = useRef<SyncEngine | null>(null);
  const { fetchChannels } = useChannelStore();
  const { addReceivedMessages } = useMessageStore();

  useEffect(() => {
    // 1. Initialize Sync Engine
    engineRef.current = new SyncEngine(repository, 'MyLocalNodeID');

    // 2. Setup Background Gossip Loop (Simulation)
    const interval = setInterval(() => {
      simulateNearbyPeer();
    }, 15000); // Peer walks by every 15 seconds

    return () => clearInterval(interval);
  }, []);

  const simulateNearbyPeer = async () => {
    if (!engineRef.current) return;

    const peerId = 'VirtualPeer_' + Math.floor(Math.random() * 1000);
    console.log(`[Mesh] Encountered ${peerId}`);

    // Simple In-Memory Transport for simulation
    const mockTransport: Transport = {
      sendInventory: async (id, ids) => {
        console.log(`  [SIM] Giving my inventory to ${id}`);
        // In a real sync, the peer would respond with its own inventory
        // Here we simulate the peer giving us something NEW
        setTimeout(() => simulatePeerResponse(id), 1000);
      },
      requestMessages: async (id, ids) => console.log(`  [SIM] Requesting ${ids.length} messages`),
      sendMessages: async (id, msgs) => {
        console.log(`  [SIM] Delivering ${msgs.length} messages to ${id}`);
      },
      // Channel Gossip
      sendChannelInventory: async (id, ids) => console.log(`  [SIM] Sending Channel Inventory`),
      requestChannels: async (id, ids) => console.log(`  [SIM] Requesting ${ids.length} channels`),
      sendChannels: async (id, channels) => console.log(`  [SIM] Delivering ${channels.length} channels`)
    };

    await engineRef.current.onPeerDiscovered(peerId, mockTransport);
  };

  const simulatePeerResponse = async (peerId: string) => {
    // 1. Simulate a peer having a message we don't have
    const newMsg: Message = {
      id: uuidv4(),
      channelId: 'global',
      senderId: peerId,
      timestamp: Date.now(),
      expiry: 0,
      priority: 1,
      payload: new TextEncoder().encode("Hello from the mesh!")
    };

    // 2. Simulate a peer having a CHANNEL we don't have
    const newChannel: Channel = {
      id: uuidv4(),
      name: 'Nearby Group ' + peerId.slice(-3),
      description: 'A channel discovered via gossip',
      channelType: 'Public' as any,
      createdAt: Date.now(),
      scope: 'local'
    };

    if (engineRef.current) {
        await engineRef.current.onMessagesReceived([newMsg]);
        addReceivedMessages(newMsg.channelId, [newMsg]);

        await engineRef.current.onChannelsReceived([newChannel]);
        console.log(`[Mesh] Discovered new channel: ${newChannel.name}`);
    }
  };
};
