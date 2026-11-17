# Rectilinear Redundancies

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://raunakpc23-a11y.github.io/Rectilinear-Redundancies/)
[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel)](https://rectilinear-redundancies.vercel.app)
[![Version](https://img.shields.io/badge/version-5.4.0-orange.svg)]()

> A distraction-free study dashboard engineered for deep focus, structured syllabus progress, interactive flashcards, ambient soundscapes, and gamified study tracking.

---

## ⚡ Highlights

- 🍅 **Pomodoro & Focus Analytics:** Configurable cycles, streak tracking, daily minutes, and burnout alerts.
- 🦭 **Personal Sea Lion Companion:** Interactive virtual study buddy with dynamic mood reactions and study prompts.
- 🎧 **Audio & Lo-Fi Hub:** Web Audio API ambient sound synthesis (rain, white noise) plus curated lo-fi study streams.
- 📇 **Interactive Flashcards & Quiz Engine:** Comprehensive revision decks and mock test evaluation.
- 🎨 **AMOLED Dark Mode & V2 Overhaul:** Includes both Classic mode and the modern 4-Pillar Activity Rail interface (switchable anytime via the **`✨ TEST UI`** button).
- 🔄 **Cloud Synchronization:** Zero-dependency Node.js sync server to preserve progress across devices.

---

## 🚀 Quick Start

No build step or compilation required. Runs directly in any modern browser:

```bash
# 1. Clone the repository
git clone https://github.com/raunakpc23-a11y/Rectilinear-Redundancies.git
cd Rectilinear-Redundancies

# 2. Serve locally
npx serve .
```

Open **`http://localhost:3000`** in your browser.

---

## 📁 Project Architecture

```text
├── assets/          # Wallpapers, vector backgrounds, and mascots
├── css/             # Design system and themes (styles.css)
├── docs/            # Architecture specs, data schemas, and deployment guides
├── js/              # Modular frontend application scripts
├── server/          # Lightweight zero-dependency sync backend
├── .github/         # CI/CD workflows and community issue templates
├── index.html       # Single-page dashboard entry point
└── package.json     # Project metadata and run scripts
```

For deeper technical documentation:
- 📖 [**System Architecture**](docs/ARCHITECTURE.md)
- 🔌 [**Sync Server Deployment Guide**](docs/SYNC_SERVER.md)
- 📊 [**Data Schemas & Storage Reference**](docs/DATA_FORMATS.md)
- 📝 [**Changelog**](docs/CHANGELOG.md)

---

## 📄 License

Distributed under the [MIT License](LICENSE).
