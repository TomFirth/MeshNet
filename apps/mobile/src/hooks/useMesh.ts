import { useEffect, useRef } from 'react';
import { SyncEngine, Message, Channel, Transport } from '@meshnet/protocol';
import repository from '../database/sqlite.service';
import { useMessageStore } from '../store/useMessageStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { bleTransport } from '../transport/BleTransport';
import { v4 as uuidv4 } from 'uuid';
import * as Crypto from 'expo-crypto';

/**
 * useMesh hook
 * Orchestrates the background gossip process and manages p2p transports.
 */
export const useMesh = () => {
  const engineRef = useRef<SyncEngine | null>(null);
  const { addReceivedMessages } = useMessageStore();
  const { isSimulatorEnabled, setNodeId } = useSettingsStore();

  useEffect(() => {
    const initMesh = async () => {
      // 1. Get or Create a Persistent Node ID
      let nodeId = 'Node_Unknown';
      try {
        const identities = await repository.query<{id: string}>('SELECT id FROM identities LIMIT 1');
        if (identities.length > 0) {
          nodeId = identities[0].id;
        } else {
          nodeId = 'Node_' + uuidv4().slice(0, 8);
          await repository.execute('INSERT INTO identities (id) VALUES (?)', [nodeId]);
        }
      } catch (e) {
        nodeId = 'Node_' + uuidv4().slice(0, 8);
      }

      setNodeId(nodeId);

      // 2. Initialize Sync Engine
      const engine = new SyncEngine(repository, nodeId);
      engineRef.current = engine;

      // 3. Initialize Real P2P Transport (BLE)
      bleTransport.setEngine(engine);
      try {
        await bleTransport.start();
        console.log(`[Mesh] Real P2P started with Persistent Node ID: ${nodeId}`);
      } catch (err) {
        console.warn('[Mesh] BLE Transport could not start. Are you on a real device?', err);
      }
    };

    initMesh();
  }, []);

  useEffect(() => {
    // 4. Setup Background Gossip Loop (Simulation)
    if (!isSimulatorEnabled) {
      console.log('[Mesh] Simulator disabled');
      return;
    }

    console.log('[Mesh] Simulator enabled - virtual peers will appear every 15s');
    const interval = setInterval(() => {
      simulateNearbyPeer();
    }, 15000);

    return () => clearInterval(interval);
  }, [isSimulatorEnabled]);

  const simulateNearbyPeer = async () => {
    if (!engineRef.current) return;

    const peerId = 'VirtualPeer_' + Math.floor(Math.random() * 1000);
    console.log(`[Mesh] Encountered ${peerId}`);

    const mockTransport: Transport = {
      sendInventory: async (id, ids) => {
        console.log(`  [SIM] Giving my inventory to ${id}`);
        setTimeout(() => simulatePeerResponse(id), 1000);
      },
      requestMessages: async (id, ids) => console.log(`  [SIM] Requesting ${ids.length} messages`),
      sendMessages: async (id, msgs) => console.log(`  [SIM] Delivering ${msgs.length} messages to ${id}`),
      sendChannelInventory: async (id, ids) => console.log(`  [SIM] Sending Channel Inventory`),
      requestChannels: async (id, ids) => console.log(`  [SIM] Requesting ${ids.length} channels`),
      sendChannels: async (id, channels) => console.log(`  [SIM] Delivering ${channels.length} channels`)
    };

    await engineRef.current.onPeerDiscovered(peerId, mockTransport);
  };

  const simulatePeerResponse = async (peerId: string) => {
    const newMsg: Message = {
      id: uuidv4(),
      channelId: 'global',
      senderId: peerId,
      timestamp: Date.now(),
      expiry: 0,
      priority: 1,
      payload: new TextEncoder().encode("Hello from the mesh!")
    };

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
