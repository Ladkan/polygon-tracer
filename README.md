# 📍 Image Polygon Tracer

An interactive, 100% client-side web application to load local images, trace custom polygons, name them, and export the resulting data into multiple formats: **CSS Clip-Path**, **SVG Tag**, and **JSON coordinates**.

Live Demo: [https://ladkan.github.io/polygon-tracer/](https://ladkan.github.io/polygon-tracer/)

![Project Preview](https://i.postimg.cc/WpFbY77p/obrazek.png)

---

## ✨ Features

- **🔒 100% Private & Client-Side:** Your images never leave your computer. All processing, rendering, and calculation happen directly in your browser.
- **🗺️ Interactive Polygon Tracing:** Click anywhere on the loaded image to place anchor points and draw perfect shapes.
- **🏷️ Name Your Shapes:** Organize your work by naming individual polygons.
- **💾 Multi-Format Export:**
  - **CSS Clip-Path:** Instantly copy-paste the `polygon(...)` rule for modern web layouts and image masking.
  - **SVG Tag:** Copy raw `<polygon>` tags ready to be embedded in HTML.
  - **JSON Object:** Download or copy a structured coordinate mapping (ideal for data scientists, developers, and ML image annotation).

---

## 🛠️ Tech Stack

- **Framework:** React + TypeScript
- **Bundler:** Vite
- **Styling:** CSS / Tailwind CSS
- **Icons:** Google Material Symbols

---

## 🚀 Getting Started

To run this project locally, follow these simple steps:

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (v18 or higher recommended) and `pnpm` installed.

### Installation & Setup

1. **Clone the repository:**
```bash
   git clone [https://github.com/ladkan/polygon-tracer.git](https://github.com/ladkan/polygon-tracer.git)
   cd polygon-tracer
```

2. **Install dependencies:**
```bash
 pnpm install
```

3. **Start the development server:**
```bash
 pnpm run dev
```

Open `http://localhost:5173` in your browser to see the app running.

4. **Build for production:**
```bash
 pnpm run build
```
