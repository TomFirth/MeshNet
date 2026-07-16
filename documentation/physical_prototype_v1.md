# Physical Prototype V1: Two-Phone Android Mesh

This document specifies the design for the first physical prototype of MeshNet, focusing on a two-device Android-to-Android synchronization over Bluetooth LE.

---

### 1. Prototype Scope
The goal is to prove the **Adaptive Merkle-Sync** logic and **BLE Transport** on real hardware in a "Dark Mesh" (no internet, no server) environment.

- **Devices:** 2x Android Smartphones (API 30+).
- **Transport:** Bluetooth Low Energy (using GATT characteristics).
- **Persistence:** Local SQLite (`expo-sqlite`).
- **Identity:** Locally generated Ed25519 keys (no accounts).

### 2. Core Features

#### A. Identity Setup
On first boot, each phone generates a User Identity (Master Key) and a Device Identity. The UserID (Public Key) is displayed as a truncated hex string.

#### B. Channel Creation
- Node A creates a channel: "Field Test 1".
- Node A displays a **Join QR Code** containing the `ChannelID` and `ChannelKey`.
- Node B scans the QR code to "Join" (store the metadata and key).

#### C. Messaging
- Both nodes can compose and send messages to "Field Test 1".
- Messages are signed but remain in the "Outbox" (local DB) until a sync occurs.

#### D. Proximity Sync (The "Handshake")
- When the phones are within ~5-10 meters, the background BLE service detects the peer.
- **Handshake:** Node A (Central) connects to Node B (Peripheral).
- **Sync:** The MNP 3-way handshake triggers via GATT.
- **Verification:** Both phones should now display the messages sent by the other.

---

### 3. Measurement & Metrics

| Metric | Target | Measurement Method |
| :--- | :--- | :--- |
| **Sync Speed** | < 2s for 10 msgs | Internal logs: `HandshakeStart` to `AllMessagesSaved`. |
| **Discovery Latency** | < 10s | Time from "In Range" to "Connection Established". |
| **Battery Impact** | < 2% / hour | Android System Battery Monitor over a 4-hour idle period. |
| **Reliability** | 100% Delivery | Verify `COUNT(*)` in SQLite on both devices after 100 sync cycles. |

---

### 4. Implementation Steps

1. **Native Bridge:** Implement a React Native module for `BleTransport` using `react-native-ble-manager`.
2. **Foreground Service:** Use an Android Foreground Service to keep the BLE advertiser/scanner alive when the screen is off.
3. **Database Integration:** Connect the `Zustand` store to the `ChatScreen` to show "Delivered" checkmarks once a message has been successfully gossiped to at least one peer.

---

### 5. Identified Potential Issues (Pre-Complexity)

- **GATT MTU Limits:** Android's default MTU is small (23 bytes). We must negotiate a higher MTU (up to 517) or implement packet chunking immediately to handle message payloads.
- **MAC Randomization:** Android rotates its MAC address. We must use the `NodeID` inside the **Service Data** of the BLE advertisement to reliably identify the peer.
- **Congestion:** If the two phones are in a room with 50 other Bluetooth devices, discovery speed may drop significantly.
- **Permissions:** "Fine Location" and "Nearby Devices" permissions are hurdles for user onboarding.
