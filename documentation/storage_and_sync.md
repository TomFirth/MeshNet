# Storage and Synchronization

## Local Database Design (SQLite)
MeshNet uses SQLite with WAL mode for performance on mobile and embedded devices.

### Schema Highlights
- **`messages`:** Stores binary UUIDs (BLOB) for speed.
- **`channels`:** Tracks local subscriptions and encryption keys.
- **`sync_buckets`:** Caches hashes of time-slices to speed up Merkle Tree generation.
- **`fts_messages`:** FTS5 virtual table for full-text search (plaintext only).

### Indexing Strategy
- Index on `(channel_id, timestamp DESC)` for fast UI rendering.
- Partial index on `expiry` for efficient background pruning.

## Adaptive Merkle-Sync Algorithm
To minimize radio airtime, MeshNet avoids sending full inventories.

1. **Partitioning:** Messages are sorted by timestamp and partitioned into time-buckets (e.g., Hour, Day, Month).
2. **Root Comparison:** Nodes first exchange roots of high-level buckets.
3. **Logarithmic Search:** If a root differs, nodes exchange hashes of sub-buckets until the specific missing Message IDs are isolated.
4. **Resumption:** Since hashes are deterministic, interrupted transfers can be resumed from the last verified branch.

### Efficiency Comparison
| Metric | List Inventory | **Adaptive Merkle** |
| :--- | :--- | :--- |
| Data Sent (In Sync) | ~160 KB (10k msgs) | **< 100 Bytes** |
| Data Sent (1 Missing) | ~160 KB | **~1 KB** |
| Reliability | 100% | **100%** |
