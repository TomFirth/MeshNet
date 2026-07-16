# MeshNet Monorepo

MeshNet is a decentralized, serverless gossip network. This repository is organized as a monorepo to facilitate code sharing between mobile, desktop, and embedded platforms.

## Tech Stack

- **Monorepo Manager:** [npm workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces)
- **Core Logic:** [TypeScript](https://www.typescriptlang.org/) (Models, Storage, Gossip)
- **Mobile Platform:** [React Native](https://reactnative.dev/)
- **Hardware Platform:** Node.js (Raspberry Pi)
- **Simulator:** TypeScript (Web/Node)

## Repository Structure

### `/apps` (Deployment Targets)
- **`mobile/`**: React Native application (iOS/Android).
- **`simulator/`**: TypeScript-based network visualizer.
- **`relay-node/`**: Node.js CLI tool for Raspberry Pi/Linux.

### `/packages` (Shared Modules)
- **`protocol/`**: The core TypeScript implementation of the MeshNet Protocol (MNP).

### `/documentation`
- Technical specifications, RFCs, identity models, and threat analysis.

---

## Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [npm](https://www.npmjs.com/)

### 2. Installation
```bash
npm install
```

### 3. Build Core Protocol
```bash
npm run build -w @meshnet/protocol
```

---

## Running the Components

### Developer CLI (Relay Node)
Use this to test the protocol logic manually across multiple virtual nodes (A, B, C).
```bash
npm run start:relay
```
**Commands:**
- `switch <node>`: Change context (e.g., `switch B`).
- `create-channel <name>`: Create a new 128-bit UUID channel.
- `send-message <channel_id> <text>`: Send a message from the current node.
- `sync <peer>`: Manually trigger a gossip handshake (e.g., `sync B`).
- `show-storage`: View the messages in the current node's SQLite database.

---

## Testing

### Core Protocol Logic
Run the shared protocol unit tests (Storage, Gossip, Models):
```bash
cd packages/protocol
cargo test
```

### Simulation Logic
The simulator includes tests for network convergence:
```bash
cd apps/simulator
cargo test
```

---

## Documentation
For detailed specifications, see the `/documentation` directory:
- [Architecture](documentation/architecture.md)
- [Protocol RFC](documentation/protocol.md)
- [Identity Model](documentation/identity_model.md)
- [Roadmap](documentation/roadmap.md)
