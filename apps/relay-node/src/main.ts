import { SyncEngine, MessageRepository, ChannelType, Message, Channel, DatabaseDriver } from '@meshnet/protocol';
import * as readline from 'readline';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

class JsonFileDriver implements DatabaseDriver {
  private filePath: string;
  private data: { messages: any[]; channels: any[] } = { messages: [], channels: [] };

  constructor(nodeId: string) {
    this.filePath = path.join(__dirname, `../db_${nodeId}.json`);
    this.load();
  }

  private load() {
    if (fs.existsSync(this.filePath)) {
      try {
        this.data = JSON.parse(fs.readFileSync(this.filePath, 'utf-8'));
      } catch (e) { console.error(`Failed to load DB: ${e}`); }
    }
  }

  private save() {
    fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2));
  }

  async execute(sql: string, params: any[] = []): Promise<void> {
    const sql_up = sql.toUpperCase();
    if (sql_up.includes('INTO MESSAGES')) {
      const id = params[0];
      if (!this.data.messages.find(m => m.id === id)) {
        this.data.messages.push({
          id: params[0], channelId: params[1], senderId: params[2],
          timestamp: params[3], expiry: params[4], priority: params[5],
          payload: Array.from(params[6] || [])
        });
      }
    } else if (sql_up.includes('INTO CHANNELS')) {
      this.data.channels = this.data.channels.filter(c => c.id !== params[0]);
      this.data.channels.push({
        id: params[0], name: params[1], description: params[2],
        channelType: params[3], createdAt: params[4], scope: params[5],
        is_subscribed: 1
      });
    }
    this.save();
    return Promise.resolve();
  }

  async query<T>(sql: string, params: any[] = []): Promise<T[]> {
    const sql_up = sql.toUpperCase();
    if (sql_up.includes('FROM MESSAGES')) {
      const channelId = params[0];
      let results = this.data.messages;
      if (channelId && channelId !== '' && channelId !== '00000000-0000-0000-0000-000000000000') {
        results = results.filter(m => m.channelId === channelId);
      }
      return results.map(m => ({ ...m, payload: new Uint8Array(m.payload) }))
                    .sort((a, b) => b.timestamp - a.timestamp) as T[];
    }
    if (sql_up.includes('FROM CHANNELS')) {
      return this.data.channels as T[];
    }
    return [] as T[];
  }
}

class InternalBus {
  constructor(public nodes: Map<string, NodeContext>, public senderId: string) {}

  async sendInventory(peerId: string, msgIds: string[]): Promise<void> {
    const peer = this.nodes.get(peerId);
    if (peer) {
      console.log(`  [MNP Stage 1] ${this.senderId} -> ${peerId}: Sending Inventory (${msgIds.length} IDs)`);
      const bus = new InternalBus(this.nodes, peerId);
      await peer.engine.onInventoryReceived(this.senderId, msgIds, bus);
    }
  }

  async requestMessages(peerId: string, msgIds: string[]): Promise<void> {
    const peer = this.nodes.get(peerId);
    if (peer) {
      console.log(`  [MNP Stage 2] ${this.senderId} -> ${peerId}: Requesting ${msgIds.length} missing msgs`);
      const bus = new InternalBus(this.nodes, peerId);
      await peer.engine.onMessagesRequested(this.senderId, msgIds, bus);
    }
  }

  async sendMessages(peerId: string, messages: Message[]): Promise<void> {
    const peer = this.nodes.get(peerId);
    if (peer) {
      console.log(`  [MNP Stage 3] ${this.senderId} -> ${peerId}: Delivering ${messages.length} full payloads`);
      await peer.engine.onMessagesReceived(messages);
      console.log(`  [MNP Status] ${peerId}: Successfully saved ${messages.length} messages.`);
    }
  }
}

interface NodeContext { id: string; repo: MessageRepository; engine: SyncEngine; }
const nodes = new Map<string, NodeContext>();
let currentNodeId = 'A';

async function setupNodes() {
  for (const id of ['A', 'B', 'C']) {
    const driver = new JsonFileDriver(id);
    const repo = new MessageRepository(driver);
    await repo.init();
    nodes.set(id, { id, repo, engine: new SyncEngine(repo, id) });
  }
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout, prompt: `meshnet(${currentNodeId})> ` });
console.log('MeshNet Gossip Debugger (Handshake v2)');

setupNodes().then(() => {
  console.log('Virtual Mesh Online. Nodes: A, B, C');
  rl.prompt();
});

rl.on('line', async (line) => {
  const parts = line.trim().split(/\s+/);
  const command = parts[0]?.toLowerCase();
  if (!command) { rl.prompt(); return; }
  const node = nodes.get(currentNodeId)!;

  try {
    switch (command) {
      case 'switch':
        const target = parts[1]?.toUpperCase();
        if (target && nodes.has(target)) {
          currentNodeId = target;
          rl.setPrompt(`meshnet(${currentNodeId})> `);
          console.log(`Switched context to Node ${currentNodeId}`);
        } else { console.log('Node not found.'); }
        break;
      case 'create-channel':
        const channel: Channel = { id: uuidv4(), name: parts[1] || 'General', channelType: ChannelType.Public, createdAt: Date.now(), scope: 'global' };
        await node.repo.insertChannel(channel);
        console.log(`Created Channel: ${channel.name}\nID: ${channel.id}`);
        break;
      case 'send-message':
        if (parts.length < 3) { console.log('Usage: send-message <channel_id> <text>'); break; }
        const msg: Message = { id: uuidv4(), channelId: parts[1], senderId: currentNodeId, timestamp: Date.now(), expiry: 0, priority: 1, payload: new TextEncoder().encode(parts.slice(2).join(' ')) };
        await node.repo.insertMessage(msg);
        console.log(`Message saved to Node ${currentNodeId} outbox.`);
        break;
      case 'sync':
        const peerId = parts[1]?.toUpperCase();
        if (peerId && nodes.has(peerId) && peerId !== currentNodeId) {
          console.log(`[MNP] Initiating Handshake: ${currentNodeId} <-> ${peerId}`);
          await node.engine.onPeerDiscovered(peerId, new InternalBus(nodes, currentNodeId));
          console.log(`[MNP] Handshake between ${currentNodeId} and ${peerId} complete.`);
        } else { console.log("Invalid peer for sync."); }
        break;
      case 'show-storage':
        const msgs = await node.repo.getChannelMessages('', 100);
        console.log(`\n--- Local Storage [Node ${currentNodeId}] ---`);
        msgs.forEach(m => console.log(`  [From: ${m.senderId}] "${new TextDecoder().decode(m.payload)}"`));
        console.log(`Total: ${msgs.length} messages\n`);
        break;
      case 'exit': rl.close(); break;
      default: console.log(`Unknown command: ${command}`);
    }
  } catch (e) { console.error(`Handshake Failure: ${e}`); }
  rl.prompt();
}).on('close', () => process.exit(0));
