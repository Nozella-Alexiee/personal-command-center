# Personal Command Center

> A quiet, fast, and intentional personal dashboard. Zero bloat, zero AI slop, local-first.

**Version**: 1.0.0  
**Stack**: React 19, TypeScript, Vite, CSS Modules, Lucide Icons, localStorage  

---

## Overview

Personal Command Center is a personal web dashboard designed for daily focused work. It prioritizes typographic hierarchy, high density, and instant client-side interaction over decorative SaaS templates.

### Core Modules

1. **Tasks**: Fast checklist with inline double-click editing, completion animations, status filtering, and live progress indicators.
2. **Projects**: Tracking active, paused, and completed development projects, with quick links and tech stacks.
3. **Notes**: Distraction-free scratchpad with word counts, recent edit timestamps, and live search.
4. **Bookmarks**: Quick launcher for local development ports and frequently accessed services with automated favicon lookups.
5. **Command Palette (`⌘K` / `Ctrl+K`)**: Universal search across all items, quick navigation (1-5), theme toggling, and JSON data backup/restore.
6. **Themes**: Respects System preference with dedicated Light and Dark modes.

---

## Architecture & Multi-Device Note

* **100% Client-Side**: No backend, no database server, no tracking, and no external authentication required.
* **Local-First Storage**: Data is persisted synchronously in browser `localStorage`.
* **Separate Storage Per Device**: When accessed online (e.g. laptop vs. phone), each browser maintains its own local storage space.
* **Data Portability**: Use **Command Palette (`⌘K`) -> Backup & Export Data (JSON)** and **Restore / Import Data (JSON)** to move or snapshot your data across devices anytime.

---

## Getting Started

### Local Development

```bash
# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

### Production Build

```bash
# Typecheck and build production bundle into /dist
npm run build

# Preview production build locally
npm run preview
```

---

## Deployment Target

* **Platform**: Vercel (Static Vite SPA)
* **Build Command**: `npm run build`
* **Output Directory**: `dist`
* **Routing**: Handled via `vercel.json` rewrite to `/index.html`.
