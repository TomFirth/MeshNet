import { Message } from './models';
import { MessageRepository } from './storage';
import { Transport } from './transport';

export class SyncEngine {
  constructor(private repo: MessageRepository, private nodeId: string) {}

  async onPeerDiscovered(peerId: string, transport: Transport) {
    // 1. Message Sync
    const messages = await this.repo.getChannelMessages('', 1000);
    const msgIds = messages.map(m => m.id);
    await transport.sendInventory(peerId, msgIds);

    // 2. Channel Sync
    const channels = await this.repo.getSubscribedChannels();
    const channelIds = channels.map(c => c.id);
    await transport.sendChannelInventory(peerId, channelIds);
  }

  async onChannelInventoryReceived(peerId: string, peerChannelIds: string[], transport: Transport) {
    const localChannels = await this.repo.getSubscribedChannels();
    const localIds = new Set(localChannels.map(c => c.id));

    const missing = peerChannelIds.filter(id => !localIds.has(id));
    if (missing.length > 0) {
      await transport.requestChannels(peerId, missing);
    }
  }

  async onChannelsRequested(peerId: string, requestedIds: string[], transport: Transport) {
    const all = await this.repo.getSubscribedChannels();
    const toSend = all.filter(c => requestedIds.includes(c.id));
    if (toSend.length > 0) {
      await transport.sendChannels(peerId, toSend);
    }
  }

  async onChannelsReceived(channels: Channel[]) {
    for (const channel of channels) {
      await this.repo.insertChannel(channel);
    }
  }

  async onInventoryReceived(peerId: string, peerIds: string[], transport: Transport) {
    const localMessages = await this.repo.getChannelMessages('', 1000);
    const localIds = new Set(localMessages.map(m => m.id));

    // Calculate delta
    const missing = peerIds.filter(id => !localIds.has(id));

    if (missing.length > 0) {
      await transport.requestMessages(peerId, missing);
    }
  }

  async onMessagesRequested(peerId: string, requestedIds: string[], transport: Transport) {
    const all = await this.repo.getChannelMessages('', 1000);
    const toSend = all.filter(m => requestedIds.includes(m.id));

    if (toSend.length > 0) {
      await transport.sendMessages(peerId, toSend);
    }
  }

  async onMessagesReceived(messages: Message[]) {
    for (const msg of messages) {
      await this.repo.insertMessage(msg);
    }
  }
}
