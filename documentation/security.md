# Security and Spam Prevention

## Cryptographic Model
MeshNet uses a layered identity and encryption model to ensure privacy and integrity.
- **Identity:** See [Identity Model](identity_model.md) for details on Device vs. User personas.
- **Algorithm Suite:** Curve25519 (Ed25519 for signatures, X25519 for key exchange).
- **Threat Analysis:** See [Security Threat Model](threat_model.md) for detailed analysis of potential attacks and their mitigations.
- **Encryption:** AES-256-GCM for all encrypted payloads.
- **Identity:** Public Key is the User ID. No central registry.
- **Forward Secrecy:** Epoch-based key rotation for private group channels.

## Anti-Spam (Mesh-Immune System)
MeshNet uses economic and social barriers to prevent flooding.

### 1. Dynamic Proof-of-Work (PoW)
Every message must solve a Hashcash-style puzzle.
- **Low Priority:** ~3s CPU time.
- **Normal:** ~10s CPU time.
- **Emergency:** ~30s CPU time. (Prioritized by relay nodes).

### 2. Reputation & Web of Trust (WoT)
- **Direct Trust:** Peer keys exchanged via QR code.
- **Transitive Trust:** Friends-of-friends are prioritized in storage and UI.
- **Mute Gossip:** Collaborative "Mute" signals propagate through the mesh to suppress malicious actors.

### 3. Rate Limiting
Nodes implement local per-peer rate limits at the radio layer to prevent a single neighbor from hogging airtime.

## Threat Model Mitigations
- **Sybil Attacks:** Defended by PoW (calculating 1,000,000 nonces is computationally expensive).
- **Black Holes:** Multi-path gossip ensures messages bypass non-cooperative nodes.
- **Eavesdropping:** E2EE by default on all non-public channels.
