import { Message } from '../models';

export interface Transport {
  sendInventory(peerId: string, msgIds: string[]): Promise<void>;
  requestMessages(peerId: string, msgIds: string[]): Promise<void>;
  sendMessages(peerId: string, messages: Message[]): Promise<void>;
}
