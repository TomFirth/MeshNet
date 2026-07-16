# MVP React Native Application Design

## Tech Stack
- **Framework:** Expo + TypeScript.
- **State:** Zustand (for reactive UI updates from the background gossip loop).
- **Database:** `expo-sqlite`.
- **Navigation:** React Navigation (Stack + Bottom Tabs).

## Component Hierarchy
- **App Root**
    - **NavigationContainer**
        - **ChannelListScreen:** Filterable list of joined and nearby channels.
        - **ChatScreen:** Threaded message view with sync status indicators.
        - **DiscoveryScreen:** List of nearby peers and their signal strength.
        - **Settings:** Identity management (Backup seed phrase).

## Background Gossip Service
The app runs a background task using `expo-task-manager`:
1. **Scan:** Listen for BLE Beacons.
2. **Sync:** Trigger the MNP 3-way handshake when a peer is found.
3. **Notify:** Update the SQLite DB and trigger a Zustand store refresh.

## Folder Structure
```text
src/
├── api/          # Gossip & Transport logic
├── database/     # SQLite schema and services
├── store/        # Zustand stores
├── screens/      # React Native screens
└── components/   # UI elements (MessageBubble, SyncIndicator)
```
