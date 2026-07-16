# MeshNet: Philosophy and Scope

MeshNet is not just a messaging app; it is a declaration of digital independence. This document outlines the foundational beliefs of the project and sets strict boundaries for Version 1.0 to prevent feature creep and ensure a stable, focused core.

---

### 1. The Vision: What problem does this solve?
Today's communication is centralized, fragile, and surveillance-driven. When the internet goes down—due to natural disasters, infrastructure failure, or intentional shutdowns—our ability to coordinate vanishes. Furthermore, centralized platforms turn users into products through algorithmic manipulation and data harvesting.

**MeshNet solves this by providing a "Communication Layer of Last Resort."** It allows people to communicate, coordinate, and share information using the devices they already carry, without needing a single wire or server to connect them to the rest of the world.

---

### 2. Core Principles

- **Zero Centrality:** There is no "back-end." If two devices are within radio range, they are the network.
- **Open Protocol:** The MeshNet Protocol (MNP) is a public good. Anyone can build a compatible client or repeater.
- **Offline-First:** Connectivity to the global internet is a luxury, not a requirement.
- **Privacy-First:** Identity is cryptographic, not administrative. Surveillance is technically expensive and logically difficult.
- **Self-Sovereign Communities:** Channels are owned by their creators and participants, not a platform.
- **No Algorithmic Manipulation:** Content is delivered chronologically and filtered only by user choice. No "Engagement" metrics.
- **Zero Advertising:** The protocol is designed for data exchange, not attention extraction.

---

### 3. Scope: Version 1.0

To ensure a successful launch, we focus strictly on the "Minimum Viable Mesh."

#### Included in V1.0:
1. **Asynchronous Text Messaging:** The core utility.
2. **Channel-Based Gossip:** Organizing information into 128-bit UUID "topics."
3. **End-to-End Encryption (E2EE):** Privacy is a non-negotiable requirement from day one.
4. **Multi-Transport Support:** BLE (Mobile), WiFi-D (High-speed), and LoRa (Infrastructure).
5. **Basic Proof-of-Work:** A foundational defense against network flooding.
6. **Mobile (React Native) & Embedded (ESP32) Clients:** Proof of cross-platform protocol interoperability.

**Why:** These features provide a complete, usable, and secure communication loop. Without E2EE or PoW, the network is either dangerous or unusable.

#### Excluded from V1.0:
1. **Real-Time Voice/Video:**
    - *Reason:* MeshNet is a store-carry-forward gossip network. Latency is unpredictable. High-bandwidth streaming would collapse the mesh for text users.
2. **Global User Search/Directory:**
    - *Reason:* Maintains decentralization. Finding users should be a local, physical, or social process (QR codes/Invites), not a server-side search.
3. **Monetization/Tokenization:**
    - *Reason:* Avoids "Pump and Dump" schemes and unnecessary complexity. The incentive for relaying is the utility of the network itself.
4. **Cloud Backup/Sync:**
    - *Reason:* Contradicts "Offline-First." Users are responsible for their own keys and data backups (Seed phrases).
5. **Complex File Sharing (GB+):**
    - *Reason:* Version 1.0 is optimized for metadata and text. Massive file transfers will be addressed in Phase 2 via specialized WiFi-D "Mule" modes.

---

### 4. Guarding the Scope
Every feature request for MeshNet must answer three questions:
1. Does this work if the internet is permanently disabled?
2. Does this require a central server to function?
3. Does this prioritize the user's battery and bandwidth over "engagement"?

If the answer to 1 is "No," or 2 is "Yes," or 3 is "No," the feature is rejected.

---

### 5. Roadmap Summary
Development follows a rigorous 8-phase plan, from protocol validation to community pilot programs. See the full [Development Roadmap](roadmap.md) for details.
