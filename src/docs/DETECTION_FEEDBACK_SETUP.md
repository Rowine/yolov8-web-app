# Detection Annotation Feedback Setup Guide

This guide explains how to use the detection annotation feedback feature that allows users to correct missed or incorrect disease/pest detections by drawing new bounding boxes and labeling them correctly.

## Overview

The detection annotation feedback feature allows users to:

- View original model detections (shown as red dashed boxes)
- Draw new bounding boxes to mark missed diseases/pests
- Correct mislabeled detections by drawing new annotations
- Select appropriate labels from the available disease/pest classes
- Upload corrected annotations to Roboflow for model improvement

## How It Works

### 1. **Accessing the Feature**

- After receiving detection results for a rice leaf image
- Click the "Correct Detections" button (orange button next to "Upload to Roboflow")
- The annotation feedback modal will open

### 2. **Interface Overview**

- **View Mode**: Default mode for viewing existing detections
- **Annotate Mode**: Switch to this mode to draw new bounding boxes
- **Original Detections**: Shown as red dashed boxes with confidence percentages
- **User Corrections**: Shown as green solid boxes labeled as "corrected"

### 3. **Making Corrections**

#### Switching to Annotate Mode

1. Click the "Annotate Mode" button in the modal
2. Select the appropriate disease/pest label from the dropdown
3. The cursor will change to a crosshair for drawing

#### Drawing Bounding Boxes

1. Click and drag on the image to draw a bounding box
2. The box will appear in blue while drawing
3. Release the mouse to finalize the annotation
4. The box will turn green and be added to your corrections list

#### Managing Annotations

- View all your corrections in the "Your Corrections" section
- Remove incorrect annotations by clicking "Remove" next to each item
- Switch back to "View Mode" to see the overall result

### 4. **Submitting Feedback**

1. Ensure you have at least one correction annotation
2. Click "Submit Annotations (X)" where X is the number of annotations
3. Wait for the upload confirmation
4. Your corrections will be uploaded to the same Roboflow project as regular detections

## Technical Details

### Data Format

- Annotations are converted to YOLO format automatically
- Normalized coordinates ensure compatibility across different image sizes
- Metadata includes original detection count and correction count

### Integration

- Uses the same Roboflow project credentials as regular detection uploads
- No additional environment variables required
- Feedback data is tagged with "user_feedback" and "detection_correction"

### Canvas Drawing

- Interactive HTML5 canvas for precise annotation drawing
- Real-time feedback while drawing bounding boxes
- Coordinate conversion between canvas and normalized formats

## Use Cases

### Common Scenarios

1. **Missed Detections**: Model didn't detect a visible disease/pest
2. **False Negatives**: Important symptoms were overlooked
3. **Boundary Corrections**: Existing detection boxes don't cover the full affected area
4. **Label Corrections**: Disease/pest was detected but misclassified

### Best Practices

1. **Be Precise**: Draw tight bounding boxes around the affected areas
2. **Select Correct Labels**: Choose the most appropriate disease/pest class
3. **Complete Coverage**: Annotate all missed instances in the image
4. **Quality Over Quantity**: Focus on clear, unambiguous cases

## Data Usage

### Model Improvement

- Feedback data helps identify model weaknesses
- Common patterns in corrections guide training improvements
- Real-world examples improve model robustness

### Dataset Enhancement

- Corrections become part of the training dataset
- Helps balance classes with fewer examples
- Improves detection accuracy over time

## Features

### User Experience

- **Intuitive Interface**: Easy-to-use drawing tools
- **Visual Feedback**: Clear distinction between original and corrected annotations
- **Validation**: Prevents submission without corrections
- **Responsive Design**: Works on different screen sizes

### Technical Features

- **Real-time Drawing**: Smooth canvas interaction
- **Coordinate Normalization**: Ensures data consistency
- **Error Handling**: Graceful handling of upload failures
- **Progress Indication**: Loading states during submission

## Requirements

- **Internet Connection**: Required for uploading feedback
- **Rice Leaf Image**: Feature only available for confirmed rice leaf images
- **Existing Roboflow Setup**: Uses the same project as regular detections

## Troubleshooting

### Common Issues

1. **Can't Draw**: Ensure you're in "Annotate Mode"
2. **No Submit Button**: Add at least one annotation
3. **Upload Fails**: Check internet connection and Roboflow credentials
4. **Boxes Not Visible**: Ensure canvas has loaded properly

### Tips

- **Zoom In**: Use browser zoom for precise annotations on small features
- **Multiple Sessions**: You can close and reopen the modal as needed
- **Practice**: Try a few annotations to get comfortable with the interface

This feature helps create a collaborative feedback loop between users and the AI model, continuously improving detection accuracy through real-world corrections.
