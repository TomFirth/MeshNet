# Visual Debugger Specification (MeshNet-Visualizer)

The MeshNet Visualizer is a real-time monitoring and manipulation tool for the MNP-Sim environment. It allows developers to observe gossip dynamics, test failure scenarios, and inspect the internal state of individual nodes.

---

### 1. UI Layout & Viewports

The debugger is divided into three primary zones:

#### A. The Mesh Canvas (Primary View)
- **Engine:** WebGL-accelerated canvas (via PixiJS or Three.js).
- **Nodes:** Represented as circles. Color indicates battery level (Green -> Red) or storage pressure.
- **Links:** Transient lines appearing between nodes during an active BLE/WiFi-D/LoRa handshake. Line thickness represents bandwidth.
- **Propagation Ripples:** A colored "pulse" that radiates from a node when it sends a DATA packet. Different colors for different `ChannelIDs`.

#### B. The Global Control Panel (Left Sidebar)
- **Time Controls:** Play/Pause/Fast-Forward (1x, 10x, 100x).
- **Injection Tool:** Select a `ChannelID`, input a payload, and click a node to "inject" a new message.
- **Chaos Controls:**
    - "Kill Random %": Instantly disables nodes.
    - "Radio Jammer": Disables a specific transport (e.g., "Kill all Bluetooth") in a selected radius.
    - "Battery Drain": Accelerates battery loss for all nodes.

#### C. The Node Inspector (Right Sidebar)
Active only when a node is clicked.
- **Identity:** `NodeID` (truncated hex) and current coordinates.
- **Database View:** A paginated list of `Stored Message IDs` with TTL and Priority.
- **Relay Queue:** List of messages currently buffered for the next gossip encounter.
- **Sync History:** A log of recent peers met and the outcome of the Merkle-Sync (e.g., "Matched", "Synced 5 Msgs", "Failed").
- **Subscriptions:** List of `ChannelIDs` this node is actively monitoring.

---

### 2. Interaction Features

- **Drag-and-Drop:** Move a node physically to see how it bridges or breaks a network partition.
- **Toggle Connections:** Manually disconnect a node from its neighbors to simulate shielding or hardware failure.
- **Trace Route:** Click a `MessageID` in the inspector to highlight all nodes currently holding that message across the map.

---

### 3. Implementation Stack

**The "Web-Native" Approach:**

- **Frontend Framework:** **React** or **Vue 3** for the UI/Panels.
- **Graphics Engine:** **PixiJS** (2D) or **Three.js** (3D). PixiJS is preferred for 10,000+ nodes due to its highly optimized sprite batching.
- **Communication:** **WebWorkers** or **SharedArrayBuffer**. The simulation engine (Rust/WASM) runs in a background thread and streams state updates to the UI thread to ensure a smooth 60fps interaction.
- **State Management:** **Zustand** or **Redux** to sync the Node Inspector with the simulation engine's data.

---

### 4. Debugging Scenarios

1. **The "Island" Resync:** Create two isolated clusters, inject a message in one, and then drag a node from Cluster A to Cluster B. Watch the message "jump" the gap.
2. **The Spam Storm:** Use the Injection Tool to flood a node with 500 messages and watch how neighbors use **Network-Pressure PoW** (from Chaos Spec) to slow it down.
3. **The Dead Battery:** Observe how the mesh re-routes (or fails) as high-traffic nodes in a "Festival" scenario run out of power.
