# Search Engine Typing Simulator

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://www.apache.org/licenses/LICENSE-2.0)

A beautiful, customizable React app that simulates search engine typing animations. Perfect for demos, presentations, or as a fun UI component. Built with Vite, React, TypeScript, and Tailwind CSS.

## Features

- **Realistic Typing Animation:** Simulates typing and deleting multiple search queries with adjustable speed and pause.
- **Customizable Search Strings:** Add, remove, and reorder search queries.
- **Modern UI:** Inspired by search engines, with a clean, responsive design.
- **Display Options:**
  - Toggle search title and buttons
  - Choose search icon (emoji)
  - Set placeholder text
  - Select icon position (left/right)
- **Animation Controls:**
  - Play, pause, and reset animation
  - Loop animation or keep the last string
  - Fast delete (select all & delete)
- **Styling:**
  - Choose from multiple background gradients or solid color
  - Select from a variety of modern fonts
- **Settings Persistence:** All settings are saved in your browser's localStorage.

## Getting Started

### Prerequisites

- Node.js (v18 or newer recommended)
- npm (v9 or newer)

### Installation

```bash
npm install
```

### Running the App

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Building for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Customization

- **Add/Remove Search Strings:** Use the left sidebar to manage your search queries.
- **Adjust Animation:** Use the right sidebar to tweak typing speed, delete speed, pause, looping, and more.
- **Change Appearance:** Select fonts, background styles, icon, and placeholder text in the settings panel.

## Tech Stack

- [React 18](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide React](https://lucide.dev/)

## Project Structure

```
├── src/
│   ├── App.tsx         # Main app component
│   ├── main.tsx        # Entry point
│   ├── index.css       # Tailwind and custom styles
│   └── ...
├── index.html          # HTML template
├── package.json        # Project metadata and scripts
├── tailwind.config.js  # Tailwind configuration
├── postcss.config.js   # PostCSS configuration
└── ...
```

## Linting

Run ESLint to check code quality:

```bash
npm run lint
```

## License

This project is licensed under the [Apache License 2.0](LICENSE).

---

*Made with ❤️ using React, Vite, and Tailwind CSS.* 