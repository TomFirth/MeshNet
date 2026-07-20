# MeshNet Monorepo

MeshNet is a decentralized, serverless gossip network. This repository is organized as a monorepo to facilitate code sharing between mobile, relay, and simulation platforms.

## Tech Stack

- **Monorepo Manager:** [npm workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces)
- **Core Logic:** [TypeScript](https://www.typescriptlang.org/) (Protocol, Storage, Gossip)
- **Mobile Platform:** [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/)
- **Database:** [SQLite](https://www.sqlite.org/) (via expo-sqlite)
- **P2P Transport:** Bluetooth Low Energy (BLE)

## Repository Structure

### `/apps` (Deployment Targets)
- **`mobile/`**: Expo-based mobile application (iOS/Android). Uses `react-native-ble-manager` for real P2P sync.
- **`simulator/`**: TypeScript-based network visualizer.
- **`relay/`**: Node.js implementation for permanent mesh infrastructure.

### `/packages` (Shared Modules)
- **`protocol/`**: Core implementation of the gossip engine, database models, and transport interfaces.

### `/scripts`
- Automation for building and deploying.

---

## Getting Started

### 1. Installation
```bash
npm install
```

### 2. Running the Mobile App (Simulator Mode)
```bash
npm run start:client
```
Enable the "Mesh Simulator" in the app's **Settings** tab to see virtual peers gossip messages and channels.

### 3. Running on Physical Hardware
Native Bluetooth requires a development build:
```bash
npm run mobile:android
# OR
npm run mobile:ios
```

### 4. Build for Play Store
```bash
./scripts/build-android.sh
```

---

## Testing
Run tests across all workspaces:
```bash
npm test
```

## Documentation
For detailed specifications, see the `/documentation` directory.
