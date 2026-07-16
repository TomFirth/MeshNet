# Impact of Mobility on Mesh Dynamics

This document analyzes how realistic human movement patterns affect the four pillars of the MeshNet Protocol (MNP).

---

### 1. Message Propagation
| Scenario | Propagation Type | Speed |
| :--- | :--- | :--- |
| **Festival** | Epidemic (Flooding) | **Near Instant** |
| **Office** | Scheduled (Commute) | Periodic (2x daily) |
| **Tourists** | Store-Carry-Forward | Slow (Hours/Days) |
| **Train** | Sequential Diffusion | Fast along path |

**Analysis:** High-density scenarios (Festivals) favor rapid epidemic spread but suffer from "Broadcast Storms." Low-density scenarios (Rural) rely on "Data Mules" (Tourists) where propagation speed is limited by physical travel velocity.

---

### 2. Channel Discovery
- **Proximity-Driven (Festival/Dog Walkers):** Users discover channels via BLE Beacons because they are physically co-located with people sharing similar interests.
- **Social-Driven (Office):** Discovery happens via "Channel Links" sent in persistent work/social groups.
- **Infrastructure-Driven (Rural):** Users discover channels via a "Directory" hosted on a static LoRa repeater.

---

### 3. Storage & Pruning
- **High-Churn (Festival):** Short-lived channels dominate. Storage logic must prioritize "Recent" over "Trusted" to capture the ephemeral event data.
- **High-Consistency (Dog Walkers):** Local community channels have high "Temporal Locality." Messages should be kept longer as they are relevant for weeks.
- **Relay-Heavy (Tourists):** Tourist nodes act as "Dark Storage." They may carry 100MB of encrypted messages they cannot read, requiring a dedicated "Relay Cache" partition in SQLite.

---

### 4. Relay Behaviour
- **Stationary Relays (Rural/Office):** These nodes are "Anchors." They provide 100% uptime and act as the mesh's backbone.
- **Opportunistic Relays (Train/Tourists):** These nodes provide "Bridges." Their value is not in uptime, but in their ability to cross geographic boundaries.
- **High-Density Relays (Festival):** These nodes are "Noise." MNP must implement aggressive rate-limiting on these nodes to prevent them from drowning out priority traffic.
