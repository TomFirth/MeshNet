import { Message, Channel } from './models';

export interface DatabaseDriver {
  execute(sql: string, params?: any[]): Promise<any>;
  query<T>(sql: string, params?: any[]): Promise<T[]>;
}

export class MessageRepository {
  constructor(private db: DatabaseDriver) {}

  async init() {
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        channel_id TEXT,
        sender_id TEXT,
        timestamp INTEGER,
        expiry INTEGER,
        priority INTEGER,
        payload BLOB
      )
    `);

    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS channels (
        id TEXT PRIMARY KEY,
        name TEXT,
        description TEXT,
        channel_type TEXT,
        created_at INTEGER,
        scope TEXT,
        is_subscribed INTEGER DEFAULT 0
      )
    `);

    await this.db.execute(`CREATE INDEX IF NOT EXISTS idx_msg_chan ON messages(channel_id, timestamp DESC)`);
  }

  async insertMessage(msg: Message) {
    await this.db.execute(
      `INSERT OR IGNORE INTO messages (id, channel_id, sender_id, timestamp, expiry, priority, payload)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [msg.id, msg.channelId, msg.senderId, msg.timestamp, msg.expiry, msg.priority, msg.payload]
    );
  }

  async insertChannel(channel: Channel) {
    await this.db.execute(
      `INSERT OR REPLACE INTO channels (id, name, description, channel_type, created_at, scope)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [channel.id, channel.name, channel.description, channel.channelType, channel.createdAt, channel.scope]
    );
  }

  async getChannelMessages(channelId: string, limit: number = 50): Promise<Message[]> {
    return this.db.query<Message>(
      `SELECT * FROM messages WHERE channel_id = ? ORDER BY timestamp DESC LIMIT ?`,
      [channelId, limit]
    );
  }

  async getSubscribedChannels(): Promise<Channel[]> {
    return this.db.query<Channel>(
      `SELECT * FROM channels WHERE is_subscribed = 1`
    );
  }

  async searchMessages(query: string): Promise<Message[]> {
    // Basic search for MVP, later we use FTS5
    return this.db.query<Message>(
      `SELECT * FROM messages WHERE payload LIKE ?`,
      [`%${query}%`]
    );
  }
}
