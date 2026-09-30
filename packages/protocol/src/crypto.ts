import nacl from 'tweetnacl';
import { decodeBase64, encodeBase64 } from 'tweetnacl-util';

export interface KeyPair {
  publicKey: Uint8Array;
  privateKey: Uint8Array;
}

export class CryptoEngine {
  /**
   * Generates a new Ed25519 keypair for signatures and identity.
   */
  static generateIdentityKeyPair(): KeyPair {
    const pair = nacl.sign.keyPair();
    return {
      publicKey: pair.publicKey,
      privateKey: pair.secretKey
    };
  }

  /**
   * Generates a new X25519 keypair for Diffie-Hellman key exchange.
   */
  static generateExchangeKeyPair(): KeyPair {
    const pair = nacl.box.keyPair();
    return {
      publicKey: pair.publicKey,
      privateKey: pair.secretKey
    };
  }

  /**
   * Signs a message using an Ed25519 private key.
   */
  static sign(message: Uint8Array, privateKey: Uint8Array): Uint8Array {
    return nacl.sign.detached(message, privateKey);
  }

  /**
   * Verifies an Ed25519 signature.
   */
  static verify(message: Uint8Array, signature: Uint8Array, publicKey: Uint8Array): boolean {
    return nacl.sign.detached.verify(message, signature, publicKey);
  }

  /**
   * Encrypts a message using symmetric AES-256-GCM (using nacl.secretbox for simplicity in MVP).
   * Note: secretbox uses XSalsa20-Poly1305, which is highly reliable for this use case.
   */
  static encrypt(message: Uint8Array, key: Uint8Array): { ciphertext: Uint8Array; nonce: Uint8Array } {
    const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
    const ciphertext = nacl.secretbox(message, nonce, key);
    return { ciphertext, nonce };
  }

  /**
   * Decrypts a message.
   */
  static decrypt(ciphertext: Uint8Array, nonce: Uint8Array, key: Uint8Array): Uint8Array | null {
    return nacl.secretbox.open(ciphertext, nonce, key);
  }

  /**
   * Derives a shared secret using X25519 Diffie-Hellman.
   */
  static deriveSharedSecret(myPrivateKey: Uint8Array, theirPublicKey: Uint8Array): Uint8Array {
    return nacl.scalarMult(myPrivateKey, theirPublicKey);
  }

  /**
   * Encodes a Uint8Array to a Hex string.
   */
  static toHex(arr: Uint8Array): string {
    return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Decodes a Hex string to a Uint8Array.
   */
  static fromHex(hex: string): Uint8Array {
    return new Uint8Array(hex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
  }

  /**
   * Hashes a message using SHA-256 (using nacl.hash).
   */
  static hash(data: Uint8Array): Uint8Array {
    return nacl.hash(data).slice(0, 32);
  }

  /**
   * Rotates a key for the next epoch using a one-way hash function.
   */
  static rotateKey(currentKey: Uint8Array, epochId: string): Uint8Array {
    const epochBytes = new TextEncoder().encode(epochId);
    const combined = new Uint8Array(currentKey.length + epochBytes.length);
    combined.set(currentKey);
    combined.set(epochBytes, currentKey.length);
    return this.hash(combined);
  }
}
