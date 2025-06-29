# My Typing Simulator

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://www.apache.org/licenses/LICENSE-2.0)

A beautiful, customizable React app that simulates search engine typing animations. Perfect for demos, presentations, or as a fun UI component. Built with Vite, React, TypeScript, and Tailwind CSS.

## Features

- **Realistic Typing Animation:** Simulates typing and deleting multiple search queries with adjustable typing speed, delete speed, and pause between queries.
- **Customizable Search Strings:** Add, remove, and reorder search queries using the left sidebar.
- **Modern UI:** Inspired by search engines, with a clean, responsive, and production-ready design.
- **Display Options:**
  - Toggle search title ("Search") and search buttons ("Search" and "I'm Feeling Lucky")
  - Choose your search icon using an emoji picker
  - Set custom placeholder text
  - Select icon position (left or right of the search box)
- **Animation Controls:**
  - Play, pause, and reset the typing animation
  - Loop animation or keep the last string visible
  - Fast delete mode (select all & delete in one go)
- **Styling & Appearance:**
  - Choose from multiple background gradients or a solid color for the search area
  - Select from a variety of modern, production fonts (Inter, Poppins, Roboto, Open Sans, Lato, Montserrat, Source Sans Pro, Nunito, Work Sans, IBM Plex Sans, Playfair Display)
  - Live font preview in the settings panel
- **Export as Video:**
  - Export your typing animation as a high-quality `.webm` video (with progress indicator)
  - All animation and appearance settings are reflected in the export
- **Settings Persistence:**
  - All settings (queries, animation, appearance, etc.) are automatically saved in your browser's localStorage and restored on reload
- **Sidebars for Productivity:**
  - Left sidebar: manage your list of search queries (add, remove, reorder)
  - Right sidebar: adjust animation, display, background, and typography settings
- **Accessibility & UX:**
  - Keyboard navigation for adding queries
  - Responsive layout and smooth transitions
  - Glassy, modern sidebars and cards

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