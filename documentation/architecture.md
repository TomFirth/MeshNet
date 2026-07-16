# MeshNet Architecture

## Vision
MeshNet is a communication infrastructure designed to function where the internet does not. See [Philosophy and Scope](philosophy_and_scope.md) for our core principles.

## Core Principles
- **No Central Authority:** No servers, no accounts, no central DNS.
- **Agnostic Transport:** Operates over Bluetooth LE (local discovery), WiFi Direct (bulk sync), and LoRa (long-range backbone).
- **Geography as Logical Logic:** Geographic communities are treated as channel IDs, not routing constraints.
- **Heterogeneous Nodes:** Phones act as high-speed nodes, while ESP32 repeaters act as persistent long-range infrastructure.
- **Decoupled Storage:** Nodes store messages for the mesh, regardless of whether the user subscribes to the channel.
- **Inventory Handshaking:** Nodes exchange inventories (Merkle Roots) before transferring message data to minimize airtime.

## Component Diagram
```text
+-----------------------------------------------------------+
|                  Application Layer (UI)                    |
|      (Filters: Channel IDs, Key-based Decryption)         |
+-----------------------------------------------------------+
|                  Mesh Controller (Orchestrator)            |
+-----------------------------------------------------------+
| [ Message Store ] | [ Routing Logic ] | [ Crypto Engine ] |
| (SQLite/KV/Flash) |  (Gossip/TTL)     | (Ed25519/AES-GCM) |
+-------------------+-------------------+-------------------+
|               Transport Abstraction Layer                 |
+-----------------------------------------------------------+
|  [ Bluetooth LE ]  |  [ WiFi Direct ]  |  [ LoRa/Sub-GHz ]|
+-----------------------------------------------------------+
```

## Data Flow
1. **Ingress:** A message is signed, hashed, and stored locally.
2. **Discovery:** Nodes broadcast beacons via BLE/LoRa.
3. **Sync:** Nodes compare Merkle roots of their message databases.
4. **Replication:** Missing messages are requested and transferred over the best available link (WiFi-D for bulk, BLE for text, LoRa for pings).
5. **Egress:** The local client filters and decrypts messages for subscribed channels.

## Software Architecture
MeshNet is built as a multi-language monorepo using **Rust** for the core protocol and **React Native/C++** for platform-specific interfaces. See [Repository & Software Architecture](repo_architecture.md) for the full breakdown.
