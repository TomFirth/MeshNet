# MeshNet Development Roadmap

This roadmap outlines the phased evolution of the MeshNet platform, moving from theoretical protocol design to physical community deployment.

---

### Phase 0: Protocol Design & Formalization
**Goal:** Establish the mathematical and cryptographic foundation of the network.
- **Deliverables:** MNP v1.0 RFC, Identity Model, and Sync Algorithm specification.
- **Success Criteria:** Formal peer review of the Merkle-Sync logic and binary packet structure.
- **Risks:** Over-complicating the header for low-bandwidth LoRa use.

### Phase 1: High-Fidelity Simulator (MNP-Sim)
**Goal:** Validate protocol performance at scale before writing mobile or hardware code.
- **Deliverables:** Rust-based DES engine and WebGL Visual Debugger.
- **Success Criteria:** Successful simulation of 1,000 nodes reaching 95% message saturation in < 5 minutes.
- **Risks:** Simulator assumptions (e.g., perfect radio range) not matching real-world physics.

### Phase 2: Local Persistence & Channel Management
**Goal:** Implement the "Offline-First" storage engine.
- **Deliverables:** SQLite schema implementation, FTS5 search integration, and local "Persona" management (BIP-39).
- **Success Criteria:** Ability to store/retrieve 10,000 messages with < 100ms query latency on mobile hardware.
- **Risks:** SQLite file corruption during sudden power loss on embedded devices.

### Phase 3: Two-Device Handshake (The "Air-Gap" Sync)
**Goal:** Implement the core Merkle-Sync logic between two simulated or wired nodes.
- **Deliverables:** Shared Rust Protocol Library (WASM/Native) and CLI sync test tool.
- **Success Criteria:** Two nodes exchange 100 missing messages in < 2 seconds via a local pipe.
- **Risks:** Merkle Tree generation being too CPU-intensive for older phones.

### Phase 4: Bluetooth LE Transport
**Goal:** Enable physical wireless gossip between two smartphones.
- **Deliverables:** Physical Prototype V1 (see [Prototype V1](physical_prototype_v1.md)).
- **Success Criteria:** Successful message exchange between two Android devices in the background without internet.
- **Risks:** OS-level background restrictions and GATT MTU limits.

### Phase 5: End-to-End Encryption (E2EE) & Security
**Goal:** Secure the mesh against eavesdropping and tampering.
- **Deliverables:** X25519 Key Exchange, AES-GCM payload encryption, and Ed25519 signature verification.
- **Success Criteria:** Messages are unreadable by relay nodes; signature verification rejects tampered packets.
- **Risks:** Key management complexity leading to user data loss (e.g., losing seed phrases).

### Phase 6: LoRa Infrastructure (The "Backbone")
**Goal:** Extend the mesh range with dedicated low-power hardware.
- **Deliverables:** ESP32-S3 Firmware and Solar-powered repeater prototype.
- **Success Criteria:** Successful text relay over a 2km distance between two mobile clusters.
- **Risks:** Radio duty-cycle regulations (EU/US) limiting sync frequency.

### Phase 7: Community Pilot (Alpha Test)
**Goal:** Test the mesh in a real-world high-density environment.
- **Deliverables:** Public Alpha APK/IPA and 5 deployed repeaters in a local neighborhood or park.
- **Success Criteria:** 50+ users successfully communicating for 48 hours without internet access.
- **Risks:** Unforeseen radio interference or "Broadcast Storms" in high-density areas.
