## Solis — Smart Solar Panel Companion (PWA Prototype)

A sleek, mobile-first companion app concept for managing and monitoring a residential solar cleaning system. Built as a lightweight Progressive Web App with an Apple-inspired UI, microinteractions, and offline capability for a polished portfolio showcase.

### Highlights

- **Installable PWA**: `manifest.json` + Service Worker for offline and homescreen install
- **Delightful UI**: Apple-style typography, 8pt spacing grid, subtle shadows, spring animations
- **Dark Mode**: System-like dark theme toggle
- **Feature-rich Screens**: Splash, Signup, Dashboard, Operate (Setup/Manual/Auto), Settings, Modals
- **Zero dependencies**: Vanilla HTML/CSS/JS; no build step required

---

### Table of Contents

- Overview
- Screens & Features
- Tech Stack
- Project Structure
- Getting Started
- PWA & Offline
- Configuration
- Deployment
- Accessibility & UX
- Performance Notes
- Known Limitations
- Roadmap
- License & Credits

---

### Overview

Solis visualizes solar performance (efficiency, kWh, sun time) and provides intuitive controls for a hypothetical cleaning device. The prototype focuses on crisp UX, motion, and responsive layout that feels at home on iOS while remaining accessible in any modern browser.

### Screens & Features

- **Splash**: On-brand loading with animated spinner and logo.
- **Signup**: Friendly first-run experience with typography and spacing tuned for readability.
- **Dashboard**:
  - Circular efficiency meter with animated progress
  - kWh, sun time, and daily averages
  - House/array visualization card
- **Operate**:
  - **Setup**: Panel angle slider, dimensions, quantity, and output inputs
  - **Manual**: Brush pressure and water spray sliders
  - **Auto**: Schedule next clean, frequency, last run, Clean Now, Pause/Resume
- **Settings**:
  - Notifications, Wi‑Fi status modal, account, support, about, terms & privacy
  - Dark mode toggle
- **Global**:
  - Side navigation, modal system, microinteractions, responsive iPhone frame on desktop

### Tech Stack

- **Core**: HTML5, modern CSS (custom properties), vanilla JavaScript (ES6+)
- **Fonts**: Google Fonts `Poppins`
- **PWA**: `manifest.json`, `service-worker.js` (cache-first for static assets)
- **No framework / no build step**

### Project Structure

```
/ (project root)
├── index.html               # Main single-page prototype
├── index copy.html          # Alternate snapshot (not used by PWA)
├── manifest.json            # PWA manifest (name, theme, icons)
├── service-worker.js        # Cache-first service worker
└── 2.png                    # App icon / logo (used in UI & manifest)
```

### Getting Started

- **Option A: Quick open**
  - Double-click `index.html` to preview UI (PWA/offline won’t activate from file://).
- **Option B: Local server (recommended for PWA)**
  - Install a simple static server and run from the project root:

```bash
npx serve -s .
```

- Open the printed `http://localhost:PORT` URL in your browser.

### PWA & Offline

- `manifest.json` defines app name, short_name, theme/background colors, and icons for install.
- `service-worker.js` implements a simple cache-first strategy:
  - Caches a static asset list on install
  - Cleans up old caches on activate
  - Serves cached responses on fetch with network fallback
- Service workers require HTTPS (or `http://localhost`). Use a local server for testing.

### Configuration

- **Manifest (`manifest.json`)**
  - Update `name`, `short_name`, `theme_color`, `background_color` as needed
  - Replace the icons with your own (ensure 192×192 and 512×512 PNGs)
- **Service Worker (`service-worker.js`)**
  - Ensure `staticAssets` matches real files in this repo. For this prototype, update or remove placeholders like `Solis_hifi.html`, `style.css`, `script.js`, `icon-192.png`, `icon-512.png` if they don’t exist. You can cache `index.html` and `2.png` instead.
  - If deploying under a subpath (e.g., `/solis`), change the registration path in `index.html` from `'/service-worker.js'` to `'./service-worker.js'`.
- **Branding**
  - Replace `2.png` with your logo; update references in `manifest.json` and CSS backgrounds.

### Deployment

- Any static host works (GitHub Pages, Netlify, Vercel, Cloudflare Pages).
- Requirements:
  - Serve over HTTPS
  - Keep `manifest.json` and `service-worker.js` at the same scope or adjust registration
- Example flow (Netlify): drag-and-drop the folder or connect the repo; no build command needed.

### Accessibility & UX

- Large touch targets, consistent 8pt spacing, high-contrast dark mode
- Focus outlines on inputs and buttons, reduced motion-friendly transitions
- Semantic structure in `index.html` with clear sectioning and headings

### Performance Notes

- No heavy libraries; minimal network requests
- `preconnect` to Google Fonts to improve font loading
- Cache-first SW keeps core UI available offline once visited

### Known Limitations

- Prototype: no real authentication, device connectivity, or backend persistence
- Static demo data for metrics and schedules
- Service worker asset list includes placeholders; align with actual files before production
- Icon filenames in SW (`icon-192.png`, `icon-512.png`) are not present; manifest currently points to `2.png`

### Roadmap (Portfolio Direction)

- Real device API integration (status, telemetry, commands)
- Auth + profile, persistent schedules, history
- Charts for production/consumption, exportable CSV
- Push notifications (clean reminders, weather-based suggestions)
- i18n, RTL support, and enhanced accessibility audits

### License & Credits

- License: All rights reserved (portfolio prototype).
- Design & development: Tejas Patel

### Screenshots (optional)

Add screenshots or GIFs to showcase flows (e.g., `splash`, `dashboard`, `operate`):

- `2.png` (logo placeholder)
- Drag images into the repo and reference them here.

---

### Portfolio Blurb (you can copy-paste)

Solis is a mobile-first solar companion PWA prototype that blends a crisp, Apple-inspired interface with practical controls for array maintenance. It demonstrates thoughtful motion, dark mode, and a cache-first offline experience—built with just HTML, CSS, and JavaScript, making it fast to load and easy to deploy anywhere.

