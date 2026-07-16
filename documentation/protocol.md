# MeshNet Protocol (MNP) Specification v1.0

## Status: RFC 9001 (Formal Specification)

### 1. Header Structure
All packets start with a 4-byte Common Header.

| Bit | Field | Description |
| :--- | :--- | :--- |
| 0-3 | Version | Protocol version (current: 0x1) |
| 4-7 | Type | Packet Type (Beacon, Sync, Req, Data, Error) |
| 8-15 | Flags | Crypto (Bit 0), Sig (Bit 1), Compression (Bit 2) |
| 16-31 | Length | Total payload length |

### 2. Packet Types
- **0x1 BEACON:** NodeID + Merkle Root for discovery.
- **0x2 SYNC_INV:** Inventory hashes/branches for delta identification.
- **0x3 MSG_REQ:** List of requested Message UUIDs.
- **0x4 DATA:** The immutable message object.

### 3. Message Structure (DATA Payload)
- **Message UUID (16B):** SHA-256 hash of payload.
- **Channel UUID (16B):** Random 128-bit identifier.
- **Sender PubKey (32B):** Ed25519 public key.
- **Timestamp (8B):** Unix Epoch.
- **Expiry (8B):** TTL (Unix Epoch).
- **Priority (1B):** 0 (Low) to 255 (High).
- **Payload (Var):** Encrypted or plaintext data.
- **Signature (64B):** Ed25519 signature of the above fields.

### 4. Synchronization Flow
1. **Advertise:** Node A sends a `BEACON`.
2. **Query:** Node B responds with `SYNC_INV` if roots differ.
3. **Request:** Node A sends `MSG_REQ` for specific UUIDs.
4. **Push:** Node B sends `DATA` packets.

### 5. Node & User Identity
- **NodeID:** SHA-256(Device Public Key). Used for transport-layer peering and physical routing.
- **UserID:** Persistent Master Public Key. Used for message signing and E2EE.
- **Delegation:** Devices MUST present a valid Device Certificate signed by the UserID to act on their behalf. See [Identity Model](identity_model.md).
