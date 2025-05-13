import * as tf from "@tensorflow/tfjs";
import { renderBoxes } from "./renderBox";
import labels from "./labels.json";

const numClass = labels.length;

/**
 * Preprocess image / frame before forwarded into the model
 * @param {HTMLVideoElement|HTMLImageElement} source
 * @param {Number} modelWidth
 * @param {Number} modelHeight
 * @returns input tensor, xRatio and yRatio
 */
const preprocess = (source, modelWidth, modelHeight) => {
  let xRatio, yRatio; // ratios for boxes

  const input = tf.tidy(() => {
    const img = tf.browser.fromPixels(source);

    // padding image to square => [n, m] to [n, n], n > m
    const [h, w] = img.shape.slice(0, 2); // get source width and height
    const maxSize = Math.max(w, h); // get max size
    const imgPadded = img.pad([
      [0, maxSize - h], // padding y [bottom only]
      [0, maxSize - w], // padding x [right only]
      [0, 0],
    ]);

    xRatio = maxSize / w; // update xRatio
    yRatio = maxSize / h; // update yRatio

    return tf.image
      .resizeBilinear(imgPadded, [modelWidth, modelHeight]) // resize frame
      .div(255.0) // normalize
      .expandDims(0); // add batch
  });

  return [input, xRatio, yRatio];
};

/**
 * Function to detect objects in an image/frame
 * @param {HTMLImageElement|HTMLVideoElement|HTMLCanvasElement} source
 * @param {Object} model loaded YOLOv8 model
 * @returns Array of detections with class, confidence and bounding box
 */
export const detect = async (source, model) => {
  const [modelWidth, modelHeight] = model.inputShape.slice(1, 3);

  tf.engine().startScope();
  const [input, xRatio, yRatio] = preprocess(source, modelWidth, modelHeight);

  const res = model.net.execute(input);
  const transRes = res.transpose([0, 2, 1]);

  const boxes = tf.tidy(() => {
    const w = transRes.slice([0, 0, 2], [-1, -1, 1]);
    const h = transRes.slice([0, 0, 3], [-1, -1, 1]);
    const x1 = tf.sub(transRes.slice([0, 0, 0], [-1, -1, 1]), tf.div(w, 2));
    const y1 = tf.sub(transRes.slice([0, 0, 1], [-1, -1, 1]), tf.div(h, 2));
    return tf.concat(
      [
        y1,
        x1,
        tf.add(y1, h),
        tf.add(x1, w),
      ],
      2
    ).squeeze();
  });

  const [scores, classes] = tf.tidy(() => {
    const rawScores = transRes.slice([0, 0, 4], [-1, -1, numClass]).squeeze(0);
    return [rawScores.max(1), rawScores.argMax(1)];
  });

  const nms = await tf.image.nonMaxSuppressionAsync(boxes, scores, 500, 0.45, 0.5);

  const boxes_data = boxes.gather(nms, 0).dataSync();
  const scores_data = scores.gather(nms, 0).dataSync();
  const classes_data = classes.gather(nms, 0).dataSync();

  tf.dispose([res, transRes, boxes, scores, classes, nms]);
  tf.engine().endScope();

  // Format detections for return
  const detections = [];
  for (let i = 0; i < scores_data.length; ++i) {
    const classIndex = Math.round(classes_data[i]);
    const bbox = boxes_data.slice(i * 4, (i + 1) * 4).map((coord, idx) => {
      return idx % 2 === 0 ? coord * yRatio : coord * xRatio;
    });

    detections.push({
      class: labels[classIndex],
      classIndex: classIndex,
      confidence: scores_data[i],
      bbox: bbox // [y1, x1, y2, x2]
    });
  }

  // Also render boxes on the canvas if provided
  if (source instanceof HTMLCanvasElement) {
    renderBoxes(source, boxes_data, scores_data, classes_data, [xRatio, yRatio]);
  }

  return detections;
};

/**
 * Function to detect video from every source.
 * @param {HTMLVideoElement} vidSource video source
 * @param {tf.GraphModel} model loaded YOLOv8 tensorflow.js model
 * @param {HTMLCanvasElement} canvasRef canvas reference
 */
export const detectVideo = (vidSource, model, canvasRef) => {
  /**
   * Function to detect every frame from video
   */
  const detectFrame = async () => {
    if (vidSource.videoWidth === 0 && vidSource.srcObject === null) {
      const ctx = canvasRef.getContext("2d");
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // clean canvas
      return; // handle if source is closed
    }

    detect(vidSource, model, canvasRef, () => {
      requestAnimationFrame(detectFrame); // get another frame
    });
  };

  detectFrame(); // initialize to detect every frame
};
