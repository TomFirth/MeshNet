# Transport Layer Specifications

## 1. Bluetooth Low Energy (BLE)
**Role:** Always-on discovery and small message gossip.
- **Profile:** Custom GATT Profile with `Handshake`, `Request`, and `DataStream` characteristics.
- **MTU Management:** Automated fragmentation for messages exceeding BLE MTU (typically 185-512 bytes).
- **Optimization:** Adaptive scan intervals based on battery level.

## 2. WiFi Direct (P2P)
**Role:** High-speed bulk transfer and attachments.
- **Discovery:** DNS-SD (Bonjour) service records contain sync metadata.
- **Lifecycle:** "Flash Groups" - connect, burst-sync, and disconnect immediately to save power.
- **Limitation:** Used primarily for Android-to-Android or iOS-to-iOS. Android-to-iOS requires legacy Hotspot fallback.

## 3. LoRa (Sub-GHz Long Range)
**Role:** Long-range backbone and bridge for sparse environments.
- **Hardware:** ESP32-S3 + SX1262 LoRa Radio.
- **Integration:** LoRa nodes participate as full gossip peers but with a "Constrained" profile.
- **Protocol Adaptation:** MNP packets are fragmented at the transport layer to fit LoRa's 255-byte MTU.
- **Range:** 2km - 15km depending on terrain and SF (Spreading Factor).
- **Duty Cycle:** Complies with regional regulations (e.g., 1% in EU) using a token-bucket rate limiter.

## Transport Selection Logic
1. **Beacons:** Use BLE for constant background peer discovery.
2. **Small Sync (<50KB):** Complete entirely over BLE.
3. **Large Sync (>50KB/Files):** Trigger WiFi Direct if both nodes have >20% battery.
4. **Distance (>50m):** Fallback to LoRa if available.
