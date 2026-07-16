import * as SQLite from 'expo-sqlite';
import { DatabaseDriver, MessageRepository } from '@meshnet/protocol';

class ExpoSQLiteDriver implements DatabaseDriver {
  private db: SQLite.SQLiteDatabase;

  constructor() {
    this.db = SQLite.openDatabase('meshnet.db');
  }

  async execute(sql: string, params: any[] = []): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(sql, params, () => resolve(), (_, error) => {
          reject(error);
          return false;
        });
      });
    });
  }

  async query<T>(sql: string, params: any[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(sql, params, (_, { rows }) => {
          resolve(rows._array as T[]);
        }, (_, error) => {
          reject(error);
          return false;
        });
      });
    });
  }
}

const driver = new ExpoSQLiteDriver();
export const repository = new MessageRepository(driver);

export const initDatabase = async () => {
  await repository.init();
  console.log('Unified MeshNet Database Initialized');
};

export default repository;
