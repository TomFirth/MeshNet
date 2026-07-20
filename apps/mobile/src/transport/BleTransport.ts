import BleManager from 'react-native-ble-manager';
import { NativeModules, NativeEventEmitter, Platform, PermissionsAndroid } from 'react-native';
import { Transport, Message, Channel, SyncEngine } from '@meshnet/protocol';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

export class BleTransport implements Transport {
  private engine: SyncEngine | null = null;
  private isScanning = false;
  private serviceUUID = 'F00D'; // Example Mesh Service UUID

  constructor() {
    BleManager.start({ showAlert: false });
  }

  setEngine(engine: SyncEngine) {
    this.engine = engine;
  }

  async start() {
    await this.requestPermissions();

    // Listen for discovered peers
    bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', (data) => {
      this.handleDiscoveredPeer(data);
    });

    this.startScanning();
    this.startAdvertising();
  }

  private async requestPermissions() {
    if (Platform.OS === 'android') {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
    }
  }

  private startScanning() {
    if (this.isScanning) return;
    this.isScanning = true;

    // Scan for 10 seconds, repeat
    BleManager.scan([this.serviceUUID], 10, true)
      .then(() => console.log('[BLE] Scan started'))
      .catch(err => console.error('[BLE] Scan failed', err));
  }

  private startAdvertising() {
    // Note: react-native-ble-manager is primarily for Central role.
    // For Peripheral role (Advertising), we usually need react-native-peripheral or similar.
    // For MVP, we focus on scanning and connecting to other Mesh nodes.
    console.log('[BLE] Advertising started (Mock)');
  }

  private handleDiscoveredPeer(peripheral: any) {
    if (!this.engine) return;

    // In a real implementation, we would connect and then call onPeerDiscovered
    // For now, we simulate the discovery event
    const peerId = peripheral.id;
    this.engine.onPeerDiscovered(peerId, this);
  }

  // --- Transport Interface Implementation ---

  async sendInventory(peerId: string, msgIds: string[]): Promise<void> {
    console.log(`[BLE] Sending inventory to ${peerId}`);
    // implementation: write to a BLE characteristic
  }

  async requestMessages(peerId: string, msgIds: string[]): Promise<void> {
    console.log(`[BLE] Requesting messages from ${peerId}`);
  }

  async sendMessages(peerId: string, messages: Message[]): Promise<void> {
    console.log(`[BLE] Sending messages to ${peerId}`);
  }

  async sendChannelInventory(peerId: string, channelIds: string[]): Promise<void> {
    console.log(`[BLE] Sending channel inventory to ${peerId}`);
  }

  async requestChannels(peerId: string, channelIds: string[]): Promise<void> {
    console.log(`[BLE] Requesting channels from ${peerId}`);
  }

  async sendChannels(peerId: string, channels: Channel[]): Promise<void> {
    console.log(`[BLE] Sending channels to ${peerId}`);
  }
}

export const bleTransport = new BleTransport();
