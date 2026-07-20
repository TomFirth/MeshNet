import { create } from 'zustand';

import repository from '../database/sqlite.service';

interface SettingsState {
  isSimulatorEnabled: boolean;
  nodeId: string | null;
  setSimulatorEnabled: (enabled: boolean) => void;
  setNodeId: (id: string) => void;
  clearAllBlocks: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  isSimulatorEnabled: true, // Default to enabled for development
  nodeId: null,
  setSimulatorEnabled: (enabled: boolean) => set({ isSimulatorEnabled: enabled }),
  setNodeId: (id: string) => set({ nodeId: id }),

  clearAllBlocks: async () => {
    try {
      const blockedIds = await repository.getBlockedIds();
      for (const id of blockedIds) {
        await repository.unblock(id);
      }
    } catch (error) {
      console.error('Failed to clear blocks:', error);
    }
  }
}));
