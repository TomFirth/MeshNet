# MeshNet Repository & Software Architecture

MeshNet is organized as a **Monorepo** to maximize code reuse of the protocol logic, cryptographic primitives, and data models across diverse platforms (Mobile, Desktop, Embedded).

---

### 1. Repository Structure (Monorepo)

We use a **pnpm workspaces** or **NX** based monorepo for JavaScript/TypeScript parts, with a sub-directory for low-level systems code (Rust/C++).

```text
MeshNet/
├── packages/
│   ├── protocol/           # Shared Logic (Rust/WASM)
│   │   ├── src/gossip/     # Sync & Merkle Logic
│   │   ├── src/crypto/     # Ed25519 & AES wrappers
│   │   └── src/models/     # MNP Binary serialization
│   ├── database-schema/    # Shared SQLite definitions (SQL/TypeORM)
│   └── transport-core/     # Abstract transport interfaces
├── apps/
│   ├── mobile/             # React Native (iOS/Android)
│   ├── simulator/          # Desktop Simulator (Rust/WASM + PixiJS)
│   ├── relay-node/         # Raspberry Pi / Linux CLI (Rust)
│   └── hardware-repeater/  # ESP32-S3 Firmware (C++/Arduino or ESP-IDF)
├── documentation/          # Project specs
└── tools/                  # Build scripts and test runners
```

---

### 2. Language & Technology Stack

| Layer | Technology | Reason |
| :--- | :--- | :--- |
| **Shared Protocol** | **Rust** | Compiles to WASM (Mobile/Web) and Native (Pi/Simulator). Memory safe. |
| **Cryptography** | **Rust (`ed25519-dalek`, `aes-gcm`)** | High performance, audited primitives. |
| **Mobile UI** | **React Native (TS)** | Fast iteration, high-quality UI, native module support. |
| **Desktop Simulator**| **Rust + PixiJS** | High-performance spatial simulation. |
| **ESP32 Firmware** | **C++ / ESP-IDF** | Direct control over SX1262 LoRa hardware and deep sleep. |

---

### 3. Layered Design

#### A. Protocol Layer (The "Brain")
- **Responsibility:** Implements the MNP state machine, Merkle Tree generation, and PoW validation.
- **Shared:** This is a pure Rust library. It does not know about radios or screens.

#### B. Transport Layer (The "Vessels")
- **Responsibility:** Implements the `TransportInterface`.
- **Platform-Specific:** 
    - `MobileTransport`: Wraps Native BLE/WiFi-D modules.
    - `LoRaTransport`: Direct SPI communication with SX1262 (C++).
    - `SimulatedTransport`: Virtual radio pipes in the desktop simulator.

#### C. Storage Layer (The "Memory")
- **Responsibility:** CRUD operations for messages and peer metadata.
- **Implementation:** **SQLite** across all platforms. 
    - Mobile uses `expo-sqlite`. 
    - Linux/Simulator uses `rusqlite`.
    - ESP32 uses a lightweight SQL engine or LittleFS for raw binary storage.

#### D. UI / Application Layer (The "Face")
- **Responsibility:** Rendering the chat, managing identities, and filtering channels.
- **Implementation:** React Native for mobile; CLI for Linux nodes.

---

### 4. Build System & Testing Strategy

- **Build System:** **Turborepo** to orchestrate builds across Rust (Cargo) and JS (pnpm).
- **Testing:**
    - **Unit Tests:** Rust `#[test]` for protocol/crypto; Jest for React Native components.
    - **Integration Tests:** Cross-compiling the Rust core and running it in a Node.js environment via WASM.
    - **Simulation-in-CI:** Headless runs of the Desktop Simulator to verify gossip convergence on every PR.
- **Hardware-in-Loop (HIL):** Automated testing on a physical ESP32 + LoRa rig for power consumption and radio reliability.

---

### 5. Why this Architecture?
1. **Consistency:** By writing the Merkle-Sync logic once in Rust, we ensure that an ESP32 and a Phone will always agree on the "Network State."
2. **Performance:** Computationally heavy tasks (Crypto/Sync) happen in a native layer, leaving the JS thread free for smooth UI interactions.
3. **Portability:** Moving to a new platform (e.g., a Windows Desktop app) only requires implementing a new UI and Transport layer.
