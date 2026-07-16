import { Message } from './models';
import { MessageRepository } from './storage';
import { Transport } from './transport';

export class SyncEngine {
  constructor(private repo: MessageRepository, private nodeId: string) {}

  async onPeerDiscovered(peerId: string, transport: Transport) {
    // Start sync by sending what we have
    const messages = await this.repo.getChannelMessages('', 1000);
    const ids = messages.map(m => m.id);
    await transport.sendInventory(peerId, ids);
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
