# LoRa Repeater Specification (MeshNet Infrastructure)

LoRa repeaters provide the "Long-Range Backbone" for MeshNet, connecting isolated Bluetooth/WiFi clusters.

---

### 1. Protocol Integration (MNP-LoRa)

LoRa nodes speak the same MNP protocol but utilize a **Transport Fragmentation Layer (TFL)**.

- **MTU Limit:** 255 bytes (SX1262 hardware limit).
- **Fragmentation:** Larger DATA packets are split into numbered chunks: `[MsgID][TotalChunks][ChunkIndex][Data]`.
- **Compression:** All text payloads MUST be compressed using **Zstd** or **LZ4** before LoRa transmission to minimize airtime.

### 2. Message Prioritisation
Due to LoRa's limited bandwidth, the repeater uses a **Priority Queue**:
1. **System/Emergency:** (Priority > 200) - Bypasses inventory sync, relayed immediately.
2. **Channel Control:** (Invites/Key rotations).
3. **Text Messages:** (Priority 100-200).
4. **Media/Attachments:** (Priority < 50) - **NOT** relayed via LoRa; held in storage until a phone-to-phone WiFi link is available.

### 3. Synchronisation: "LoRa-Sync"
The standard Merkle-Sync is too chatty for LoRa.
- **Bloom Filter Beacons:** Instead of roots, repeaters broadcast a 64-byte Bloom Filter of their recent message IDs.
- **Negative Acknowledgement (NACK):** A peer only requests data if it is *sure* it is missing based on the Bloom Filter.
- **Aggressive Pruning:** Repeaters only sync messages from the last 24-48 hours via LoRa to keep the inventory manageable.

### 4. Storage & Hardware
- **ESP32-S3:** Dual-core allows one core for LoRa radio handling and one for the MNP gossip logic.
- **Flash Storage:** 8MB to 16MB SPI Flash using `LittleFS`.
- **Message Limit:** ~5,000 text messages (pruned by TTL and Priority).

### 5. Power Management (Solar)
- **CAD (Channel Activity Detection):** The SX1262 sleeps and wakes up every 500ms to "sniff" the air for a preamble. If nothing is found, it sleeps again.
- **Deep Sleep:** If Battery < 20%, the node enters "Passive Mode"—only waking up for emergency broadcasts.
- **Telemetry:** Every 60 minutes, the repeater injects a status packet into the mesh: `[NodeID, BattVolt, Temp, MessageCount, Uptime]`.

---

### 6. Where LoRa Improves the Network
- **Range:** Bridges gaps of 5km+ where Bluetooth (50m) fails.
- **Reliability:** Penetrates walls and vegetation better than 2.4GHz signals.
- **Infrastructure:** Provides a constant "Anchor" for a neighborhood even when no phones are moving.

### 7. Where LoRa Does Not Improve the Network
- **Bandwidth:** Totally unsuitable for photos, videos, or bulk database sync.
- **Latency:** A multi-hop LoRa message can take seconds to cross a town.
- **Congestion:** In high-density areas (Festivals), the LoRa band becomes saturated instantly. MNP should prefer Bluetooth in these zones.
