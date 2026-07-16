# MeshNet Security Threat Model

This document analyzes the primary security threats to the MeshNet decentralized network and outlines the mitigation strategies implemented in the protocol.

---

### 1. Spam & Network Flooding
*   **Attack Method:** An attacker generates a massive volume of messages to consume radio airtime, node storage, and battery across the mesh.
*   **Impact:** Denial of Service (DoS) for legitimate users; rapid battery drain; storage exhaustion on constrained nodes (ESP32).
*   **Mitigation:** **Dynamic Proof-of-Work (PoW)**. Every message must solve a computational puzzle. Nodes implement **Network-Pressure PoW**, doubling difficulty when buffers are full.
*   **Trade-offs:** High-power attackers (PCs) can still out-compute mobile phones. PoW itself consumes battery on the sender's device.

### 2. Identity Spoofing
*   **Attack Method:** An attacker attempts to send a message claiming to be from a specific `UserID`.
*   **Impact:** Reputational damage to the victim; social engineering attacks on the victim's contacts.
*   **Mitigation:** **Ed25519 Digital Signatures**. Every message is signed by the User's private key. Nodes and clients verify the signature against the `UserID` (Public Key) before displaying or relaying.
*   **Trade-offs:** Adds 64 bytes to every packet, which is significant for LoRa. Requires nodes to perform CPU-intensive signature verification.

### 3. Message Tampering
*   **Attack Method:** A relay node modifies the payload of a message before passing it to the next peer.
*   **Impact:** Spread of misinformation; alteration of commands in automated mesh systems.
*   **Mitigation:** **Content Addressing & Signatures**. The `MessageID` is a hash of the content. Any change to the content invalidates the `MessageID` and the cryptographic signature.
*   **Trade-offs:** None; this is a core requirement of gossip integrity.

### 4. Tracking Users & Traffic Analysis
*   **Attack Method:** An observer monitors BLE/WiFi-D traffic to see which `UserID` is communicating and when.
*   **Impact:** Loss of anonymity; tracking of user behavior and social graphs.
*   **Mitigation:** **Transport Layer Encryption (X25519)** and **Periodic NodeID Rotation**. BLE advertisements can use ephemeral IDs. Metadata is minimal; only `ChannelID` is exposed to relays.
*   **Trade-offs:** Makes troubleshooting and mesh debugging significantly harder. Ephemeral IDs can complicate the "Inventory Exchange" if not managed carefully.

### 5. Location Leaks
*   **Attack Method:** Using radio triangulation or GPS metadata embedded in messages to find a user's physical position.
*   **Impact:** Physical safety risks for users in sensitive environments.
*   **Mitigation:** **Metadata Stripping**. The protocol explicitly discourages embedding GPS data unless necessary for a "Geographic Channel." Nodes do not append their own location to relayed messages.
*   **Trade-offs:** Geography-based channels become less accurate if users do not provide coordinates.

### 6. Sybil Attacks
*   **Attack Method:** A single attacker creates thousands of fake `UserIDs` to dominate "Web of Trust" signals or directory listings.
*   **Impact:** Manipulation of community reputation; drowning out legitimate content in public channels.
*   **Mitigation:** **Direct Trust (QR Exchanges)** and **PoW-Weighted Reputation**. Messages from "Level 1" (physically verified) contacts are always prioritized over unverified IDs.
*   **Trade-offs:** New users experience a "Cold Start" where their messages have low priority until they are physically verified by someone.

### 7. Malicious Repeaters (The "Black Hole")
*   **Attack Method:** A repeater node (ESP32) accepts messages but never broadcasts them, or it selectively drops messages from specific users.
*   **Impact:** Reduced network reliability; isolation of specific users or regions.
*   **Mitigation:** **Multi-path Gossip**. MNP does not use "Routing Tables." Messages are diffused via multiple neighbors. If one node is a black hole, the message will likely find another path.
*   **Trade-offs:** Multi-path propagation is less efficient than direct routing and uses more total network bandwidth.

### 8. Channel Hijacking
*   **Attack Method:** An attacker attempts to "take over" a channel by posting as the moderator or changing channel settings.
*   **Impact:** Fragmentation of groups; loss of control over private communications.
*   **Mitigation:** **Ownership Certificates**. Channel metadata is signed by the creator's `UserID`. Clients only accept "Updates" (like name changes or new keys) if they are signed by the original owner.
*   **Trade-offs:** If the owner loses their private key, the channel can never be updated or "recovered."
