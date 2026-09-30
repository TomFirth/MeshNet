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
        channelId TEXT,
        senderId TEXT,
        timestamp INTEGER,
        expiry INTEGER,
        priority INTEGER,
        payload BLOB,
        nonce BLOB,
        signature BLOB
      )
    `);

    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS channels (
        id TEXT PRIMARY KEY,
        name TEXT,
        localName TEXT,
        description TEXT,
        channelType TEXT,
        createdAt INTEGER,
        scope TEXT,
        isSubscribed INTEGER DEFAULT 0
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

    await this.db.execute(`CREATE INDEX IF NOT EXISTS idx_msg_chan ON messages(channelId, timestamp DESC)`);
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
      `INSERT OR IGNORE INTO messages (id, channelId, senderId, timestamp, expiry, priority, payload, nonce, signature)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [msg.id, msg.channelId, msg.senderId, msg.timestamp, msg.expiry, msg.priority, msg.payload, msg.nonce, msg.signature]
    );
  }

  async insertChannel(channel: Channel) {
    await this.db.execute(
      `INSERT OR REPLACE INTO channels (id, name, description, channelType, createdAt, scope)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [channel.id, channel.name, channel.description, channel.channelType, channel.createdAt, channel.scope]
    );
  }

  async getChannelMessages(channelId: string, limit: number = 50): Promise<Message[]> {
    if (!channelId || channelId === '') {
      return this.db.query<Message>(
        `SELECT * FROM messages
         WHERE senderId NOT IN (SELECT target_id FROM blocks WHERE type = 'user')
         AND channelId NOT IN (SELECT target_id FROM blocks WHERE type = 'channel')
         ORDER BY timestamp DESC LIMIT ?`,
        [limit]
      );
    }
    return this.db.query<Message>(
      `SELECT * FROM messages
       WHERE channelId = ?
       AND senderId NOT IN (SELECT target_id FROM blocks WHERE type = 'user')
       ORDER BY timestamp DESC LIMIT ?`,
      [channelId, limit]
    );
  }

  async getSubscribedChannels(): Promise<Channel[]> {
    return this.db.query<Channel>(
      `SELECT * FROM channels
       WHERE isSubscribed = 1
       AND id NOT IN (SELECT target_id FROM blocks WHERE type = 'channel')`
    );
  }

  async getUnsubscribedChannels(): Promise<Channel[]> {
    return this.db.query<Channel>(
      `SELECT * FROM channels WHERE isSubscribed = 0`
    );
  }

  async subscribeToChannel(id: string): Promise<void> {
    await this.db.execute(
      `UPDATE channels SET isSubscribed = 1 WHERE id = ?`,
      [id]
    );
  }

  async unsubscribeFromChannel(id: string): Promise<void> {
    await this.db.execute(
      `UPDATE channels SET isSubscribed = 0 WHERE id = ?`,
      [id]
    );
  }

  async updateChannel(id: string, updates: Partial<Channel>): Promise<void> {
    if (updates.localName !== undefined) {
      await this.db.execute(
        `UPDATE channels SET localName = ? WHERE id = ?`,
        [updates.localName, id]
      );
    }
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
