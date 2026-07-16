export enum ChannelType {
  Public = 'Public',
  Private = 'Private',
  Geographic = 'Geographic',
}

export interface Channel {
  id: string; // UUID
  name: string;
  description?: string;
  channelType: ChannelType;
  createdAt: number;
  scope: string;
  metadata?: any;
}

export interface Message {
  id: string; // UUID
  channelId: string;
  senderId: string;
  timestamp: number;
  expiry: number;
  priority: number;
  payload: Uint8Array; // Binary data
}

export interface UserIdentity {
  userId: string;
  publicKey: Uint8Array;
}
