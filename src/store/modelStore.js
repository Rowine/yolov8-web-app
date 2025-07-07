import { create } from 'zustand';
import * as tf from "@tensorflow/tfjs";
import { loadClassificationModel } from '../utils/ml/classify';

// Removed FIREBASE_HOST since we're using local static files
const MODEL_PATH = '/v3/model.json'; // Static path to your model

const useModelStore = create((set, get) => ({
  loading: true,
  progress: 0,
  net: null,
  classificationModel: null,
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
      // Load detection model from static path
      console.log('Loading YOLOv8 detection model...');
      const yolov8 = await tf.loadGraphModel(MODEL_PATH, {
        onProgress: (fractions) => {
          // Update progress for detection model (0-80% of total progress)
          set({ loading: true, progress: fractions * 0.8 });
        },
      });

      // Warm up detection model
      const dummyInput = tf.ones(yolov8.inputs[0].shape);
      const warmupResults = yolov8.execute(dummyInput);
      tf.dispose([warmupResults, dummyInput]);

      console.log('YOLOv8 detection model loaded successfully');

      // Load classification model
      console.log('Loading rice leaf classification model...');
      set({ progress: 0.8 }); // 80% progress before classification model

      const classificationModel = await loadClassificationModel();

      console.log('Classification model loaded successfully');

      set({
        loading: false,
        progress: 1,
        net: yolov8,
        classificationModel,
        inputShape: yolov8.inputs[0].shape,
        modelName: "v0",
        isInitialized: true,
      });

      console.log('All models initialized successfully');

    } catch (error) {
      console.error("Error initializing models:", error);
      set({
        loading: false,
        error: "Failed to load models. Please check your internet connection and try again.",
        isInitialized: false,
      });
    }
  },

  resetModel: () => {
    const state = get();
    if (state.net) {
      state.net.dispose();
    }
    // Note: Classification model disposal is handled in the classify.js module
    set({
      loading: true,
      progress: 0,
      net: null,
      classificationModel: null,
      inputShape: [1, 0, 0, 3],
      error: null,
      isInitialized: false,
    });
  },
}));

export default useModelStore; 