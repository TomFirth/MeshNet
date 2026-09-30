export enum ChannelType {
  Public = 'Public',
  Private = 'Private',
  Geographic = 'Geographic',
}

export interface Channel {
  id: string; // UUID
  name: string;
  localName?: string;
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
  payload: Uint8Array; // Binary data (may be encrypted)
  nonce?: Uint8Array; // Used if payload is encrypted
  signature?: Uint8Array; // Ed25519 signature
}

export interface UserIdentity {
  userId: string;
  publicKey: Uint8Array;
}
