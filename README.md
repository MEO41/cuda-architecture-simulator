# CUDA GPU Simulator Web App 🖥️🚀

![CUDA GPU Simulator Screenshot](https://via.placeholder.com/800x400.png?text=CUDA+GPU+Simulator+Preview)

## 🔍 Overview

This is an interactive web-based simulator that helps users understand the fundamental concepts of **CUDA GPU programming**. Inspired by the [NYU Introduction to GPUs - CUDA](https://nyu-cds.github.io/python-gpu/02-cuda/) course, the app visually demonstrates how CUDA threads, blocks, grids, and memory types work together in GPU-accelerated computation.

## ✨ Features

- 🎛 **Thread Hierarchy Visualization**  
  Configure and visualize CUDA's thread and block architecture (1D, 2D, 3D).

- 🧠 **Memory Architecture Simulation**  
  Explore shared, local, and global memory usage, including access patterns and performance implications.

- ⚙️ **Kernel Execution Demo**  
  Run simplified kernels and see how threads cooperate and synchronize in real time.

- 📊 **Streaming Multiprocessors & Warps**  
  Learn how warps are scheduled and how memory coalescing affects performance.

- 🧪 **Interactive Learning Modules**  
  Tutorials, quizzes, and animations to guide learning and assess understanding.

## 🛠 Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript (React.js)
- **Rendering:** WebGL / Canvas API
- **Bundler:** Vite / Webpack
- **Deployment:** GitHub Pages / Netlify

## 🚀 Getting Started

```bash
# Clone the repo
git clone https://github.com/yourusername/cuda-gpu-simulator.git
cd cuda-gpu-simulator

# Install dependencies
npm install

# Run the dev server
npm run dev
```

## 📁 Project Structure

```
src/
├── components/       # UI components
├── simulations/      # Core GPU simulation logic
├── assets/           # Images, icons
├── App.jsx           # Main app entry
└── index.html        # HTML entry point
```

## 🧠 Educational Goal

This simulator aims to bridge the gap between theory and practice in parallel programming. It’s ideal for students, educators, or anyone curious about how GPUs achieve massive speedups using thousands of threads.

## 📷 Screenshots

> _(Replace with actual screenshots once available)_

## 📝 License

This project is licensed under the MIT License. See `LICENSE` for details.

---

Made with ❤️ to help people learn GPUs!

