import { Message, Channel } from '../models';

export interface Transport {
  sendInventory(peerId: string, msgIds: string[]): Promise<void>;
  requestMessages(peerId: string, msgIds: string[]): Promise<void>;
  sendMessages(peerId: string, messages: Message[]): Promise<void>;

  // New: Channel gossip
  sendChannelInventory(peerId: string, channelIds: string[]): Promise<void>;
  requestChannels(peerId: string, channelIds: string[]): Promise<void>;
  sendChannels(peerId: string, channels: Channel[]): Promise<void>;
}
