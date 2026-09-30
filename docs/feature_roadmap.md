# MeshNet Roadmap & Feature Status

This document outlines the strategic development phases of MeshNet and tracks the implementation status of specific features.

---

## 🗺️ Strategic Roadmap

### **Phase 0: Protocol Design & Formalization** (✅ Done)
Establish the mathematical and cryptographic foundation of the network.
- **Goal:** Define MNP v1.0 RFC, Identity Model, and Sync Algorithm.
- **Outcome:** Base logic for decentralized gossip established.

### **Phase 1: High-Fidelity Simulator (MNP-Sim)** (✅ Done)
Validate protocol performance at scale before writing mobile or hardware code.
- **Goal:** Reach 95% saturation in < 5 mins for 1,000 nodes.
- **Outcome:** Visual debugger and performance metrics verified.

### **Phase 2: Local Persistence & Channel Management** (✅ Done)
Implement the "Offline-First" storage engine and channel lifecycle.
- **Goal:** < 100ms query latency for 10k messages.
- **Outcome:** Robust SQLite/JSON repository layer.

### **Phase 3: Two-Device Handshake (The "Air-Gap" Sync)** (✅ Done)
Implement core Merkle-Sync/Inventory logic between nodes.
- **Goal:** Exchange 100 missing messages in < 2s.
- **Outcome:** Functional CLI-based gossip debugger.

### **Phase 4: Bluetooth LE Transport** (🚧 In Progress)
Enable physical wireless gossip between two smartphones.
- **Goal:** Physical Prototype V1 (Android-to-Android).
- **Risks:** OS-level background restrictions and GATT MTU limits.

### **Phase 5: End-to-End Encryption (E2EE) & Security** (🚧 In Progress)
Secure the mesh against eavesdropping and tampering.
- **Goal:** Integrate X25519 Key Exchange and AES-GCM payloads.
- **Risks:** Key management complexity for offline users.

### **Phase 6: LoRa Infrastructure (The "Backbone")** (📅 Planned)
Extend mesh range with dedicated low-power ESP32 hardware.
- **Goal:** 2km text relay between mobile clusters.

### **Phase 7: Community Pilot (Alpha Test)** (📅 Planned)
Real-world high-density testing in a local neighborhood.
- **Goal:** 50+ concurrent offline users.

---

## ✅ Completed (V1 Core)

### **Identity & Security**
- **Sovereign Identity**: Local generation of Ed25519 keypairs.
- **Persistent Persona**: BIP-39 mnemonic seed phrase support.
- **Digital Signatures**: Mandatory verification of every message signature.
- **E2EE Payloads**: AES-256-GCM (XSalsa20-Poly1305) for all payloads.

### **Data & Storage**
- **Offline-First Storage**: Robust repository with binary support for crypto blobs.
- **Full-Text Search**: Fast local message search.
- **Channel Management**: Local aliases and random UUID topics.

### **Gossip Protocol**
- **Asynchronous Sync Engine**: Multi-step handshake for eventual consistency.
- **Channel Gossip**: Automatic discovery of nearby channel metadata.

### **Transports**
- **Physical BLE Bridge**: Integrated React Native module for mobile gossip.

---

## 🚧 In Progress

### **Transports**
- **WiFi Direct (Flash Group)**: High-speed transport for large payloads.

### **Security**
- **Epoch-based Key Rotation**: One-way hash chains for group forward secrecy.

### **Testing Tools**
- **God Mode Simulator**: Visual PixiJS tool with bi-directional sync.
- **Gossip Debugger CLI**: Portable REPL for protocol stress-testing.
---

## 🚧 In Progress

### **Transports**
- **Physical BLE Bridge**: Native React Native module for Bluetooth gossip.
- **WiFi Direct (Flash Group)**: High-speed transport for large payloads.

### **Security**
- **E2EE Payloads**: AES-256-GCM for group and 1:1 encryption.
- **Epoch-based Key Rotation**: Forward secrecy for private groups.

---

## 📅 Missing & Planned (Phase 2+)

### **Reputation & Moderation**
- **Web of Trust (WoT)**: Prioritize messages from trusted social circles.
- **Mute Gossip**: Collaborative signal sharing to hide spam/malicious actors.
- **Dynamic PoW**: Automatically increase difficulty during network pressure.

### **Advanced Functionality**
- **Geographic Channels**: Join channels based on GPS coordinates (S2 Cells).
- **Large File Sharing**: "Data Mule" mode for images and documents.
- **Social Key Recovery**: Split identity keys among trusted peers.

---

## 🚫 Out of Scope (Non-Goals)
- **Real-Time Voice/Video**: Latency is unsuitable for streaming.
- **Centralized User Search**: Maintaining anonymity by avoiding global directories.
- **Cloud Backup**: Ensuring true independence by keeping all data mesh-only.
