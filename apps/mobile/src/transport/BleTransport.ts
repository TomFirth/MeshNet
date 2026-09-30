import BleManager from 'react-native-ble-manager';
import { Transport, Message, Channel } from '@meshnet/protocol';
import { NativeEventEmitter, NativeModules, Platform } from 'react-native';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

export const MESHNET_SERVICE_UUID = '550e8400-e29b-41d4-a716-446655440000';
export const INVENTORY_CHAR_UUID = '550e8400-e29b-41d4-a716-446655440001';
export const REQUEST_CHAR_UUID = '550e8400-e29b-41d4-a716-446655440002';
export const DATA_CHAR_UUID = '550e8400-e29b-41d4-a716-446655440003';

export class BleTransport implements Transport {
  constructor() {
    BleManager.start({ showAlert: false });
  }

  async sendInventory(peerId: string, msgIds: string[]): Promise<void> {
    const data = Array.from(new TextEncoder().encode(JSON.stringify(msgIds)));
    await BleManager.write(peerId, MESHNET_SERVICE_UUID, INVENTORY_CHAR_UUID, data);
  }

  async requestMessages(peerId: string, msgIds: string[]): Promise<void> {
    const data = Array.from(new TextEncoder().encode(JSON.stringify(msgIds)));
    await BleManager.write(peerId, MESHNET_SERVICE_UUID, REQUEST_CHAR_UUID, data);
  }

  async sendMessages(peerId: string, messages: Message[]): Promise<void> {
    const data = Array.from(new TextEncoder().encode(JSON.stringify(messages)));
    // Note: React Native BLE Manager handles MTU, but for very large payloads
    // we might need manual chunking in a real mesh scenario.
    await BleManager.write(peerId, MESHNET_SERVICE_UUID, DATA_CHAR_UUID, data);
  }

  async sendChannelInventory(peerId: string, channelIds: string[]): Promise<void> {
    // Reuse inventory characteristic or add a new one for channels
    const data = Array.from(new TextEncoder().encode(JSON.stringify({ type: 'channels', ids: channelIds })));
    await BleManager.write(peerId, MESHNET_SERVICE_UUID, INVENTORY_CHAR_UUID, data);
  }

  async requestChannels(peerId: string, channelIds: string[]): Promise<void> {
    const data = Array.from(new TextEncoder().encode(JSON.stringify({ type: 'channels', ids: channelIds })));
    await BleManager.write(peerId, MESHNET_SERVICE_UUID, REQUEST_CHAR_UUID, data);
  }

  async sendChannels(peerId: string, channels: Channel[]): Promise<void> {
    const data = Array.from(new TextEncoder().encode(JSON.stringify(channels)));
    await BleManager.write(peerId, MESHNET_SERVICE_UUID, DATA_CHAR_UUID, data);
  }

  /**
   * Starts scanning for nearby MeshNet nodes.
   */
  async startDiscovery() {
    await BleManager.scan([MESHNET_SERVICE_UUID], 5, true);
  }
}
