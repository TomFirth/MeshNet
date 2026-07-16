import { create } from 'zustand';
import repository from '../database/sqlite.service';
import { Channel } from '@meshnet/protocol';

interface ChannelState {
  channels: Channel[];
  isLoading: boolean;
  fetchChannels: () => Promise<void>;
  joinChannel: (id: string) => Promise<void>;
  createChannel: (channel: Channel) => Promise<void>;
}

export const useChannelStore = create<ChannelState>((set) => ({
  channels: [],
  isLoading: false,
  fetchChannels: async () => {
    set({ isLoading: true });
    // Note: We need a method to get subscribed channels in repository
    // For now, using a raw query via repo.query if exposed, or adding to repo
    // Let's assume we use getChannelMessages or similar for now or add a method.
    const channels = await repository.getChannelMessages('', 100) as any;
    set({ channels, isLoading: false });
  },
  joinChannel: async (id: string) => {
    // repository.joinChannel(id) logic
  },
  createChannel: async (channel: Channel) => {
    await repository.insertChannel(channel);
  }
}));
