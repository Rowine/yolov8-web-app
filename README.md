# Object Detection using YOLOv8 and Tensorflow.js

<p align="center">
  <img src="./sample.png" />
</p>

![love](https://img.shields.io/badge/Made%20with-🖤-white)
![tensorflow.js](https://img.shields.io/badge/tensorflow.js-white?logo=tensorflow)

---

Object Detection application right in your browser. Serving YOLOv8 in browser using tensorflow.js
with `webgl` backend.

**Setup**

```bash
git clone https://github.com/Hyuto/yolov8-tfjs.git
cd yolov8-tfjs
yarn install #Install dependencies
```

**Scripts**

```bash
yarn start # Start dev server
yarn build # Build for productions
```

## Model

YOLOv8n model converted to tensorflow.js.

```
used model : yolov8n
size       : 13 Mb
```

**Use another model**

Use another YOLOv8 model.

1. Export YOLOv8 model to tfjs format. Read more on the [official documentation](https://docs.ultralytics.com/tasks/detection/#export)

   ```python
   from ultralytics import YOLO

   # Load a model
   model = YOLO("yolov8n.pt")  # load an official model

   # Export the model
   model.export(format="tfjs")
   ```

2. Copy `yolov8*_web_model` to `./public`
3. Update `modelName` in `App.jsx` to new model name
   ```jsx
   ...
   // model configs
   const modelName = "yolov8*"; // change to new model name
   ...
   ```
4. Done! 😊

**Note: Custom Trained YOLOv8 Models**

Please update `src/utils/labels.json` with your new classes.

## Reference

- https://github.com/ultralytics/ultralytics
- https://github.com/Hyuto/yolov8-onnxruntime-web

## New Roboflow Configuration (Two-Project Setup)

The app now automatically uploads to two separate Roboflow projects:

### Environment Variables Required

Add these to your `.env` file:

```env
# Roboflow API Configuration
VITE_ROBOFLOW_API_KEY=your_roboflow_api_key

# Project 1: Classification Project (Rice Leaf vs Not Rice Leaf)
VITE_ROBOFLOW_CLASSIFICATION_PROJECT_ID=your_classification_project_id

# Project 2: Detection Project (Disease/Pest Detection + Healthy Rice Leaves)
VITE_ROBOFLOW_DETECTION_PROJECT_ID=your_detection_project_id

# Legacy project ID (kept for backward compatibility)
VITE_ROBOFLOW_PROJECT_ID=your_legacy_project_id
```

### How It Works

1. **Classification Project**: All captured images are uploaded here with labels:

   - `rice_leaf` for images classified as rice leaves
   - `not_rice_leaf` (or specific class name) for non-rice leaf images

2. **Detection Project**: Only rice leaf images are uploaded here:
   - Images with detected diseases/pests are uploaded with bounding box annotations
   - Healthy rice leaf images are uploaded unlabeled for future training

### Automatic Upload Behavior

- Uploads happen automatically when detection results are saved
- No manual intervention required
- Uploads only occur when the user is online
- Errors are logged but don't interrupt the user experience
