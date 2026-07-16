# MeshNet Identity Model

MeshNet implements a multi-layered identity system that decouples physical hardware from logical user personas, enabling multi-device support and seamless phone replacement without a central authority.

---

### 1. Identity Layers

#### A. Device Identity (The "Anchor")
- **Form:** An Ed25519 Keypair generated locally on the device (stored in Secure Enclave/Keystore).
- **Purpose:** Identifies a specific radio node. Used for transport-layer encryption (X25519) and peer-to-peer handshaking.
- **Persistence:** Volatile. If a device is factory reset, a new Device ID is generated.

#### B. User Identity (The "Persona")
- **Form:** A Master Ed25519 Keypair derived from a **BIP-39 Mnemonic Seed Phrase** (24 words).
- **Purpose:** Provides a persistent global identity. Used for signing messages and verifying ownership of channels.
- **Persistence:** High. The user can recreate this identity on any device using their seed phrase.

#### C. Channel Identity (The "Topic")
- **Form:** A random 128-bit UUID.
- **Security:** Associated with a symmetric **AES-256-GCM Channel Key**.
- **Discovery:** Channels are "named" via a signed metadata packet containing the human-readable name and the creator's UserID.

---

### 2. Multi-Device Support & Device Registration

To support multiple devices (e.g., a phone and a tablet) under one User Identity without a server:

1. **Delegation:** The Master User Key signs a "Device Certificate" for each associated Device Public Key.
2. **The Certificate:** `[DevicePubKey, Permissions, Expiry, Signature_by_MasterKey]`.
3. **Verification:** When Device A sends a message, it attaches this certificate. Other nodes verify the certificate against the User's well-known Public Key to confirm the device is authorized to act on behalf of the user.
4. **Phone Replacement:** The user enters their seed phrase on a new phone. The new phone generates a Device Key, and the user (via the seed phrase) signs a new Device Certificate.

---

### 3. Key Rotation & Revocation

- **Device Rotation:** If a device is lost, the user issues a **Revocation Message** signed by the Master Key. This message is gossiped through the mesh, and nodes will subsequently reject messages from that specific Device ID.
- **Master Key Rotation:** High-friction. Requires a new seed phrase and "inviting" followers to the new identity. This is discouraged except in cases of total compromise.

---

### 4. Trust, Following, and Blocking

#### Following
- "Following" is a local action. A node adds a User's Public Key to its "Interested" list. 
- The node then prioritizes storage and relaying for messages signed by that UserID.

#### Blocking
- **Local Block:** The node simply drops messages from a specific UserID.
- **Network-Level Block (Reputation):** If multiple trusted peers gossip a "Negative Trust" signal for a UserID (e.g., for spam), the node may stop relaying that user's messages entirely to save bandwidth.

#### Trust Levels
- **Level 1 (Verified):** Direct contact (QR code exchange).
- **Level 2 (Followed):** Users you have manually followed.
- **Level 3 (Mesh):** Strangers with valid Proof-of-Work.

---

### 5. Recommended Cryptographic Primitives

| Component | Primitive | Justification |
| :--- | :--- | :--- |
| **Signatures** | **Ed25519** | Industry standard, small keys, high performance on mobile/ESP32. |
| **Key Exchange** | **X25519** | Used for Deriving session keys for 1:1 DMs. |
| **Encryption** | **AES-256-GCM** | Authenticated encryption prevents tampering; hardware accelerated. |
| **KDF** | **Argon2** or **PBKDF2** | Used to derive Master Keys from seed phrases. |
| **Seed Phrase** | **BIP-39** | Compatible with most hardware wallets and security standards. |

---

### 6. Privacy Preservation

- **Public Keys as Usernames:** No real names or emails are required.
- **Message Blindness:** Relay nodes can see that User X sent a message to Channel Y, but cannot read the content unless they possess the Channel Key.
- **On-Wire Privacy:** Transport-layer encryption (via X25519) ensures that local observers (e.g., a "packet sniffer") cannot even see which UserID is currently communicating.
