import * as SQLite from 'expo-sqlite';
import { DatabaseDriver, MessageRepository } from '@meshnet/protocol';

class ExpoSQLiteDriver implements DatabaseDriver {
  private db: SQLite.SQLiteDatabase;

  constructor() {
    // In SDK 51+, we use openDatabaseSync for the initial connection
    this.db = SQLite.openDatabaseSync('meshnet.db');
  }

  async execute(sql: string, params: any[] = []): Promise<void> {
    // New promise-based runAsync for SDK 51
    await this.db.runAsync(sql, ...params);
  }

  async query<T>(sql: string, params: any[] = []): Promise<T[]> {
    // New promise-based getAllAsync for SDK 51
    const result = await this.db.getAllAsync<T>(sql, ...params);
    return result;
  }
}

const driver = new ExpoSQLiteDriver();
export const repository = new MessageRepository(driver);

export const initDatabase = async () => {
  await repository.init();
  console.log('Unified MeshNet Database Initialized (Modern API)');
};

export default repository;
