import { create } from 'zustand';
import { Message } from '@meshnet/protocol';
import repository from '../database/sqlite.service';
import { v4 as uuidv4 } from 'uuid';

interface MessageState {
  messages: Record<string, Message[]>; // channelId -> messages
  isLoading: boolean;
  fetchMessages: (channelId: string) => Promise<void>;
  sendMessage: (channelId: string, text: string, senderId: string) => Promise<void>;
  addReceivedMessages: (channelId: string, newMessages: Message[]) => void;
  blockUser: (userId: string) => Promise<void>;
  reportUser: (userId: string, reason: string) => Promise<void>;
}

export const useMessageStore = create<MessageState>((set, get) => ({
  messages: {},
  isLoading: false,

  fetchMessages: async (channelId: string) => {
    set({ isLoading: true });
    const msgs = await repository.getChannelMessages(channelId, 50);
    set(state => ({
      messages: { ...state.messages, [channelId]: msgs },
      isLoading: false
    }));
  },

  sendMessage: async (channelId: string, text: string, senderId: string) => {
    const newMessage: Message = {
      id: uuidv4(),
      channelId,
      senderId,
      timestamp: Date.now(),
      expiry: 0,
      priority: 1,
      payload: new TextEncoder().encode(text)
    };

    await repository.insertMessage(newMessage);

    // Optimistic update
    set(state => ({
      messages: {
        ...state.messages,
        [channelId]: [newMessage, ...(state.messages[channelId] || [])]
      }
    }));
  },

  addReceivedMessages: (channelId: string, newMessages: Message[]) => {
    set(state => ({
      messages: {
        ...state.messages,
        [channelId]: [...newMessages, ...(state.messages[channelId] || [])]
      }
    }));
  },

  blockUser: async (userId: string) => {
    try {
      await repository.block(userId, 'user');
      // Refresh messages to filter out the blocked user's messages
      const state = get();
      for (const channelId in state.messages) {
        await state.fetchMessages(channelId);
      }
    } catch (error) {
      console.error('Failed to block user:', error);
    }
  },

  reportUser: async (userId: string, reason: string) => {
    const subject = encodeURIComponent(`MeshNet Report: User ${userId}`);
    const body = encodeURIComponent(`Reporting User ID: ${userId}\nReason: ${reason}\n\nSent from MeshNet App.`);
    const mailto = `mailto:beardmachinegames@gmail.com?subject=${subject}&body=${body}`;

    try {
      const { Linking } = require('react-native');
      await Linking.openURL(mailto);
    } catch (error) {
      console.error('Failed to open mail client for reporting:', error);
    }
  }
}));
