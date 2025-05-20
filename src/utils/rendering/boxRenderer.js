import labels from "../data/labels.json";

/**
 * Color palette utility for rendering detection boxes
 * @class Colors
 */
class Colors {
    constructor() {
        // Ultralytics color palette https://ultralytics.com/
        this.palette = [
            "#FF3838", "#FF9D97", "#FF701F", "#FFB21D", "#CFD231",
            "#48F90A", "#92CC17", "#3DDB86", "#1A9334", "#00D4BB",
            "#2C99A8", "#00C2FF", "#344593", "#6473FF", "#0018EC",
            "#8438FF", "#520085", "#CB38FF", "#FF95C8", "#FF37C7",
        ];
        this.n = this.palette.length;
    }

    /**
     * Gets a color from the palette based on index
     * @param {number} i - Color index
     * @returns {string} Hex color code
     */
    get = (i) => this.palette[Math.floor(i) % this.n];

    /**
     * Converts hex color to rgba
     * @param {string} hex - Hex color code
     * @param {number} alpha - Alpha value
     * @returns {string|null} RGBA color string
     */
    static hexToRgba = (hex, alpha) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? `rgba(${[
                parseInt(result[1], 16),
                parseInt(result[2], 16),
                parseInt(result[3], 16)
            ].join(", ")}, ${alpha})`
            : null;
    };
}

/**
 * Configuration for box rendering
 * @typedef {Object} BoxRenderConfig
 * @property {number} minFontSize - Minimum font size in pixels
 * @property {number} minLineWidth - Minimum line width in pixels
 * @property {string} fontFamily - Font family for labels
 * @property {number} boxAlpha - Alpha value for box fill
 */
const DEFAULT_CONFIG = {
    minFontSize: 14,
    minLineWidth: 2.5,
    fontFamily: 'Arial',
    boxAlpha: 0.2
};

/**
 * Gets the class label for a given index
 * @param {number} index - The class index
 * @returns {string} The class label
 */
const getClassLabel = (index) => {
    if (index >= 0 && index < labels.length) {
        return labels[index];
    }
    console.warn(`Invalid class index: ${index}`);
    return 'Unknown';
};

/**
 * Renders prediction boxes on a canvas
 * @param {HTMLCanvasElement} canvasRef - Canvas element reference
 * @param {number[]} boxes_data - Array of box coordinates [y1, x1, y2, x2, ...]
 * @param {number[]} scores_data - Array of confidence scores
 * @param {number[]} classes_data - Array of class indices
 * @param {[number, number]} ratios - Scale ratios [xRatio, yRatio]
 * @param {Partial<BoxRenderConfig>} [config] - Optional rendering configuration
 */
export const renderBoxes = (
    canvasRef,
    boxes_data,
    scores_data,
    classes_data,
    ratios,
    config = {}
) => {
    const ctx = canvasRef.getContext("2d");
    const { minFontSize, minLineWidth, fontFamily, boxAlpha } = { ...DEFAULT_CONFIG, ...config };

    // Clear canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Initialize colors
    const colors = new Colors();

    // Configure font
    const fontSize = Math.max(
        Math.round(Math.max(ctx.canvas.width, ctx.canvas.height) / 40),
        minFontSize
    );
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.textBaseline = "top";

    // Log for debugging
    console.log('Rendering boxes:', {
        boxes: boxes_data,
        scores: scores_data,
        classes: classes_data.map(idx => ({ idx, label: getClassLabel(idx) }))
    });

    // Draw each box
    for (let i = 0; i < scores_data.length; ++i) {
        const classIndex = classes_data[i];
        const klass = getClassLabel(classIndex);
        const color = colors.get(classIndex);
        const score = (scores_data[i] * 100).toFixed(1);

        // Calculate box coordinates
        let [y1, x1, y2, x2] = boxes_data.slice(i * 4, (i + 1) * 4);
        x1 *= ratios[0];
        x2 *= ratios[0];
        y1 *= ratios[1];
        y2 *= ratios[1];
        const width = x2 - x1;
        const height = y2 - y1;

        // Draw box fill
        ctx.fillStyle = Colors.hexToRgba(color, boxAlpha);
        ctx.fillRect(x1, y1, width, height);

        // Draw box border
        ctx.strokeStyle = color;
        ctx.lineWidth = Math.max(
            Math.min(ctx.canvas.width, ctx.canvas.height) / 200,
            minLineWidth
        );
        ctx.strokeRect(x1, y1, width, height);

        // Draw label background
        const label = `${klass} - ${score}%`;
        ctx.fillStyle = color;
        const textWidth = ctx.measureText(label).width;
        const textHeight = fontSize;
        const yText = y1 - (textHeight + ctx.lineWidth);
        ctx.fillRect(
            x1 - 1,
            yText < 0 ? 0 : yText,
            textWidth + ctx.lineWidth,
            textHeight + ctx.lineWidth
        );

        // Draw label text
        ctx.fillStyle = "#ffffff";
        ctx.fillText(label, x1 - 1, yText < 0 ? 0 : yText);
    }
}; 