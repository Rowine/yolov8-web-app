import { create } from 'zustand';
import * as tf from "@tensorflow/tfjs";
import useModelVersionStore from './modelVersionStore';

const FIREBASE_HOST = 'https://rice-pest-disease-detection.web.app';

const useModelStore = create((set, get) => ({
  loading: true,
  progress: 0,
  net: null,
  inputShape: [1, 0, 0, 3],
  modelName: "v0",
  error: null,
  isInitialized: false,

  initializeModel: async () => {
    // If model is already initialized, don't initialize again
    if (get().isInitialized) return;

    await tf.ready();
    set({ loading: true, error: null });

    try {
      const currentVersion = useModelVersionStore.getState().currentVersion;
      const modelPath = `${FIREBASE_HOST}/models/${currentVersion}/model.json`;

      const yolov8 = await tf.loadGraphModel(modelPath, {
        onProgress: (fractions) => {
          set({ loading: true, progress: fractions });
        },
      });

      // Warm up model
      const dummyInput = tf.ones(yolov8.inputs[0].shape);
      const warmupResults = yolov8.execute(dummyInput);

      set({
        loading: false,
        progress: 1,
        net: yolov8,
        inputShape: yolov8.inputs[0].shape,
        modelName: currentVersion,
        isInitialized: true,
      });

      // Cleanup memory
      tf.dispose([warmupResults, dummyInput]);
    } catch (error) {
      console.error("Error initializing model:", error);
      set({
        loading: false,
        error: "Failed to load model",
        isInitialized: false,
      });
    }
  },

  resetModel: () => {
    if (get().net) {
      get().net.dispose();
    }
    set({
      loading: true,
      progress: 0,
      net: null,
      inputShape: [1, 0, 0, 3],
      error: null,
      isInitialized: false,
    });
  },
}));

export default useModelStore; 