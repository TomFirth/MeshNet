# Chaos Testing Specification: MeshNet Resilience

Chaos testing for MeshNet aims to identify "Breaking Points" in the decentralized gossip protocol by simulating extreme environmental and adversarial conditions.

---

### 1. Failure Scenarios

#### A. Connectivity & Infrastructure Failures
- **Mass Outage:** Randomly disable 10%, 50%, and 90% of nodes to measure the "Critical Connectivity Threshold."
- **Transport Blackout:** Disable Bluetooth LE globally or in specific clusters to force fallback to WiFi-D or LoRa.
- **Repeater Collapse:** Disable static infrastructure nodes (RPis/ESP32s) to observe the impact on rural/low-density zones.
- **Deep Partitioning:** Physically separate the simulation into two halves to test how "Tourist" nodes eventually bridge the gap.

#### B. Resource Constraints (Node-Level)
- **Power Crisis:** Force nodes into "Low Battery" mode (Scan interval 10x slower, WiFi-D disabled).
- **Storage Exhaustion:** Fill 100% of node storage with junk data to test LRU pruning and "Priority-Based Deletion."
- **Memory Pressure:** Simulate low-RAM environments (ESP32) where Merkle Tree depth must be truncated.

#### C. Adversarial & Malicious Behavior
- **Flooding Attack:** 5% of nodes inject 1,000 messages/second with invalid/valid PoW.
- **The "Black Hole":** Malicious nodes accept all messages but relay none.
- **Sybil/Fake Channels:** Inject thousands of random 128-bit `ChannelIDs` to pollute the discovery layer.
- **Eclipse Attack:** Malicious nodes surround a target and only provide them with fake/old data.

---

### 2. Metrics for Resilience

| Metric | Target | Failure Condition |
| :--- | :--- | :--- |
| **Recovery Time (TTR)** | < 5 mins | Time for a partition to sync after a bridge node appears. |
| **Gossip Integrity** | 100% | % of legitimate messages that survived a flooding attack. |
| **Mesh Diameter** | < 20 hops | Max hops between any two nodes in a dense cluster. |
| **Connected Communities** | N/A | Number of isolated "islands" detected via graph analysis. |
| **Pruning Efficiency** | > 95% | Accuracy of deleting spam vs. deleting trusted content. |

---

### 3. Anticipated Failure Modes & Protocol Mitigations

Based on preliminary chaos simulations, the following protocol changes are recommended:

#### 1. Adaptive PoW Difficulty
- **Observation:** Static PoW fails during a flooding attack from high-power devices (PCs).
- **Change:** Implement **Network-Pressure PoW**. If a node's ingress buffer is > 80% full, it doubles the required PoW difficulty for its neighbors.

#### 2. The "Trust-Weighted Relay"
- **Observation:** Black Hole nodes degrade the mesh without penalty.
- **Change:** Nodes track "Peer ROI" (Messages Received vs. Messages Successfully Gossiped back). Nodes with low ROI are deprioritized during inventory exchange.

#### 3. Delta-First Sync
- **Observation:** In 90% outage scenarios, Merkle Sync wastes battery checking empty buckets.
- **Change:** Implement a "Recent-Only" bit in the BEACON. If set, nodes skip the Merkle Tree and just exchange the last 5 minutes of data.

#### 4. Multimodal Discovery Fallback
- **Observation:** Fake channels pollute the BLE advertisement space.
- **Change:** Move discovery of "Low Trust" channels to a background LoRa/WiFi-D pull only, keeping BLE advertisements reserved for "High Trust/Verified" channels.
