# Offline AI-Driven 3D Character System

A complete offline system where a rigged 3D character is animated procedurally based on a real neural AI model running locally via ONNX Runtime Web. No internet required after setup.

## Features
- Real offline AI (tiny MLP decision model) that interprets user text and outputs motion commands.
- Fully procedural bone animation (no pre-made clips).
- Character rig setup page: upload any GLTF/GLB, assign bones.
- Main page with Three.js viewer, camera controls, AI interaction.
- Extensible for offline speech (placeholders included).
- Deployable to GitHub Pages, convertible to Android APK (WebView).

## How to Setup & Run

### 1. Generate the AI Model (real ONNX)
- Install Python 3.8+, then run:
```bash
pip install numpy scikit-learn onnx onnxruntime skl2onnx
python create_model.py