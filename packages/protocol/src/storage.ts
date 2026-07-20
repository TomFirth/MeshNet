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

    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS identities (
        id TEXT PRIMARY KEY
      )
    `);

    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS blocks (
        target_id TEXT PRIMARY KEY,
        type TEXT NOT NULL
      )
    `);

    await this.db.execute(`CREATE INDEX IF NOT EXISTS idx_msg_chan ON messages(channel_id, timestamp DESC)`);
  }

  async block(id: string, type: 'user' | 'channel') {
    await this.db.execute(
      `INSERT OR IGNORE INTO blocks (target_id, type) VALUES (?, ?)`,
      [id, type]
    );
  }

  async unblock(id: string) {
    await this.db.execute(
      `DELETE FROM blocks WHERE target_id = ?`,
      [id]
    );
  }

  async isBlocked(id: string): Promise<boolean> {
    const result = await this.db.query<{target_id: string}>(
      `SELECT target_id FROM blocks WHERE target_id = ?`,
      [id]
    );
    return result.length > 0;
  }

  async getBlockedIds(): Promise<Set<string>> {
    const results = await this.db.query<{target_id: string}>(
      `SELECT target_id FROM blocks`
    );
    return new Set(results.map(r => r.target_id));
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
    if (!channelId || channelId === '') {
      return this.db.query<Message>(
        `SELECT * FROM messages
         WHERE sender_id NOT IN (SELECT target_id FROM blocks WHERE type = 'user')
         AND channel_id NOT IN (SELECT target_id FROM blocks WHERE type = 'channel')
         ORDER BY timestamp DESC LIMIT ?`,
        [limit]
      );
    }
    return this.db.query<Message>(
      `SELECT * FROM messages
       WHERE channel_id = ?
       AND sender_id NOT IN (SELECT target_id FROM blocks WHERE type = 'user')
       ORDER BY timestamp DESC LIMIT ?`,
      [channelId, limit]
    );
  }

  async getSubscribedChannels(): Promise<Channel[]> {
    return this.db.query<Channel>(
      `SELECT * FROM channels
       WHERE is_subscribed = 1
       AND id NOT IN (SELECT target_id FROM blocks WHERE type = 'channel')`
    );
  }

  async getUnsubscribedChannels(): Promise<Channel[]> {
    return this.db.query<Channel>(
      `SELECT * FROM channels WHERE is_subscribed = 0`
    );
  }

  async subscribeToChannel(id: string): Promise<void> {
    await this.db.execute(
      `UPDATE channels SET is_subscribed = 1 WHERE id = ?`,
      [id]
    );
  }

  async unsubscribeFromChannel(id: string): Promise<void> {
    await this.db.execute(
      `UPDATE channels SET is_subscribed = 0 WHERE id = ?`,
      [id]
    );
  }

  async updateChannel(id: string, updates: Partial<Channel>): Promise<void> {
    if (updates.name) {
      await this.db.execute(
        `UPDATE channels SET name = ? WHERE id = ?`,
        [updates.name, id]
      );
    }
    if (updates.description) {
      await this.db.execute(
        `UPDATE channels SET description = ? WHERE id = ?`,
        [updates.description, id]
      );
    }
  }

  async getAllChannels(): Promise<Channel[]> {
    return this.db.query<Channel>(
      `SELECT * FROM channels`
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
