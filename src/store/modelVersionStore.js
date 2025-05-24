import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { openDB } from 'idb';

const FIREBASE_HOST = 'https://rice-pest-disease-detection.web.app';

const useModelVersionStore = create(
  persist(
    (set, get) => ({
      currentVersion: 'v0',
      latestVersion: null,
      availableVersions: {},
      updateAvailable: false,
      isChecking: false,
      error: null,

      checkForUpdates: async () => {
        set({ isChecking: true, error: null });
        try {
          const response = await fetch(`${FIREBASE_HOST}/models/latest.json`);
          const data = await response.json();

          const current = get().currentVersion;
          const latest = data.latest_version;
          const updateAvailable = latest > current;

          set({
            latestVersion: latest,
            availableVersions: data.versions,
            updateAvailable,
            isChecking: false,
          });

          return updateAvailable;
        } catch (error) {
          console.error('Error checking for updates:', error);
          set({
            error: 'Failed to check for updates',
            isChecking: false
          });
          return false;
        }
      },

      downloadAndUpdateModel: async (version) => {
        const versionInfo = get().availableVersions[version];
        if (!versionInfo) return false;

        try {
          // First verify we can access the model.json
          const modelResponse = await fetch(`${FIREBASE_HOST}${versionInfo.path}`);
          if (!modelResponse.ok) throw new Error('Failed to access model file');

          // Update the current version
          set({ currentVersion: version });

          // Clear the existing model from IndexedDB using idb
          const db = await openDB('tensorflowjs', 1);
          await db.clear('models_store');
          db.close();

          return true;
        } catch (error) {
          console.error('Error updating model:', error);
          set({ error: 'Failed to update model' });
          return false;
        }
      },
    }),
    {
      name: 'model-version-storage',
      partialize: (state) => ({ currentVersion: state.currentVersion }),
    }
  )
);

export default useModelVersionStore; 