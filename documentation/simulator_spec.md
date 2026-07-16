# Network Simulator Specification (MNP-Sim)

## Purpose
A Discrete Event Simulator (DES) used to validate the MNP protocol at scale (up to 100,000 nodes) before physical deployment. It models realistic radio physics and human mobility to stress-test the gossip logic.

## Core Simulation Engine
- **Asynchronous Event Queue:** Processes radio events (collisions, range entry/exit) with microsecond precision.
- **Spatial Indexing:** Dynamic QuadTree for $O(N \log N)$ neighbor detection.
- **Energy Modeling:** Real-time battery drain based on MCU state (Deep Sleep, Scan, Tx/Rx).

## Realistic Mobility Models
The simulator moves beyond random walks to model specific human behaviors:

### 1. The Festival (High Density)
- **Model:** 5,000+ nodes in a 500m x 500m area. High-density clusters around "stages" with periodic mass shifts.
- **Gossip Impact:** Extreme radio congestion.
- **Channel Dynamics:** Many short-lived, high-volume channels (e.g., "Stage 1 Chat").

### 2. Office Workers (Point-to-Point)
- **Model:** Diurnal cycles. Nodes move from Home (A) to Work (B) via defined commute paths.
- **Gossip Impact:** Creates reliable daytime "Hotspots" where data syncs quickly, followed by "Commute Bursts."

### 3. Dog Walkers (Cyclical Local)
- **Model:** Repeatable circular routes in neighborhood parks. Predictable daily overlap.
- **Gossip Impact:** Acts as the "Social Anchor" for local community channels.

### 4. Tourists (Long-Jump Mules)
- **Model:** Low-frequency, high-distance movement between distant regions (clusters).
- **Gossip Impact:** The primary mechanism for bridging network partitions between isolated towns.

### 5. Rural Users (Sparse Static)
- **Model:** Stationary nodes with large inter-node distances.
- **Gossip Impact:** Minimal opportunistic sync; heavy reliance on LoRa repeaters and high-gain antennas.

### 6. Train Commuters (Linear Temporal Bridges)
- **Model:** High-velocity linear movement (80-160 km/h) through multiple clusters.
- **Gossip Impact:** Creates brief "Hyper-Sync" windows that connect disjointed meshes along the rail line.

## Visualization & Debugging
The simulator includes a dedicated **Visual Debugger** (see `visual_debugger_spec.md`) that allows real-time monitoring of:
- **Nodes & Links:** Real-time mesh topology.
- **Propagation:** Visual "ripples" for message spreads.
- **Node State:** Deep inspection of local SQLite databases and relay queues.
- **Chaos Injection:** Manual triggering of node failures and network partitions.

## Technology Stack Recommendation
- **Engine:** Rust (for performance and memory safety).
- **Spatial Index:** QuadTree or R-tree for $O(N \log N)$ neighbor detection.
- **UI:** WebGL/PixiJS dashboard for real-time propagation visualization via a WASM bridge.

