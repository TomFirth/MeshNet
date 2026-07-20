import { create } from 'zustand';
import { Channel, ChannelType } from '@meshnet/protocol';
import repository from '../database/sqlite.service';
import { v4 as uuidv4 } from 'uuid';

interface ChannelState {
  channels: Channel[];
  isLoading: boolean;
  fetchChannels: () => Promise<void>;
  fetchDiscoveryChannels: () => Promise<Channel[]>;
  createChannel: (name: string, description: string) => Promise<void>;
  joinChannel: (id: string) => Promise<void>;
  leaveChannel: (id: string) => Promise<void>;
  renameChannel: (id: string, newName: string) => Promise<void>;
  blockChannel: (id: string) => Promise<void>;
  reportChannel: (id: string, name: string, reason: string) => Promise<void>;
}

export const useChannelStore = create<ChannelState>((set) => ({
  channels: [],
  isLoading: false,

  fetchChannels: async () => {
    set({ isLoading: true });
    try {
      const channels = await repository.getSubscribedChannels();
      set({ channels, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch channels:', error);
      set({ isLoading: false });
    }
  },

  fetchDiscoveryChannels: async () => {
    try {
      return await repository.getUnsubscribedChannels();
    } catch (error) {
      console.error('Failed to fetch discovery channels:', error);
      return [];
    }
  },

  createChannel: async (name: string, description: string) => {
    const newChannel: Channel = {
      id: uuidv4(),
      name,
      description,
      channelType: ChannelType.Public,
      createdAt: Date.now(),
      scope: 'local'
    };

    try {
      await repository.insertChannel(newChannel);
      await repository.subscribeToChannel(newChannel.id);
      const channels = await repository.getSubscribedChannels();
      set({ channels });
    } catch (error) {
      console.error('Failed to create channel:', error);
    }
  },

  joinChannel: async (id: string) => {
    try {
      await repository.subscribeToChannel(id);
      const channels = await repository.getSubscribedChannels();
      set({ channels });
    } catch (error) {
      console.error('Failed to join channel:', error);
    }
  },

  leaveChannel: async (id: string) => {
    try {
      await repository.unsubscribeFromChannel(id);
      const channels = await repository.getSubscribedChannels();
      set({ channels });
    } catch (error) {
      console.error('Failed to leave channel:', error);
    }
  },

  renameChannel: async (id: string, newName: string) => {
    try {
      await repository.updateChannel(id, { name: newName });
      const channels = await repository.getSubscribedChannels();
      set({ channels });
    } catch (error) {
      console.error('Failed to rename channel:', error);
    }
  },

  blockChannel: async (id: string) => {
    try {
      await repository.block(id, 'channel');
      await repository.unsubscribeFromChannel(id);
      const channels = await repository.getSubscribedChannels();
      set({ channels });
    } catch (error) {
      console.error('Failed to block channel:', error);
    }
  },

  reportChannel: async (id: string, name: string, reason: string) => {
    // For now, we'll open the mail client. Later this could be an API call.
    const subject = encodeURIComponent(`MeshNet Report: Channel ${name}`);
    const body = encodeURIComponent(`Reporting Channel ID: ${id}\nName: ${name}\nReason: ${reason}\n\nSent from MeshNet App.`);
    const mailto = `mailto:beardmachinegames@gmail.com?subject=${subject}&body=${body}`;

    try {
      const { Linking } = require('react-native');
      await Linking.openURL(mailto);
    } catch (error) {
      console.error('Failed to open mail client for reporting:', error);
    }
  }
}));
