import { Transport, Message, Channel } from '@meshnet/protocol';

/**
 * WiFi Direct / Flash Group Transport
 * This is a high-speed transport layer for bulk data transfer.
 */
export class WifiTransport implements Transport {
  async sendInventory(peerId: string, msgIds: string[]): Promise<void> {
    console.warn('WiFi Transport not fully implemented');
  }

  async requestMessages(peerId: string, msgIds: string[]): Promise<void> {
    console.warn('WiFi Transport not fully implemented');
  }

  async sendMessages(peerId: string, messages: Message[]): Promise<void> {
    console.warn('WiFi Transport not fully implemented');
  }

  async sendChannelInventory(peerId: string, channelIds: string[]): Promise<void> {
    console.warn('WiFi Transport not fully implemented');
  }

  async requestChannels(peerId: string, channelIds: string[]): Promise<void> {
    console.warn('WiFi Transport not fully implemented');
  }

  async sendChannels(peerId: string, channels: Channel[]): Promise<void> {
    console.warn('WiFi Transport not fully implemented');
  }
}
