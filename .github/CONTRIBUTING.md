# Contributing to Rectilinear Redundancies

Thank you for your interest in contributing! Whether you are reporting a bug, proposing a new theme, or improving syllabus coverage, your help makes this study dashboard better for everyone.

---

## 🛠️ Development Setup

Rectilinear Redundancies is engineered with pure standard web technologies—meaning **no compilation or bundling step is required**.

1. Fork and clone the repository:
   ```bash
   git clone https://github.com/your-username/Rectilinear-Redundancies.git
   cd Rectilinear-Redundancies
   ```

2. Start a local HTTP server:
   ```bash
   npm run dev
   # or: npx serve .
   ```

3. Open your browser to the local server address (e.g., `http://localhost:3000`).

---

## 📂 Code Organization

- **`index.html`**: Entry point and markup structure.
- **`styles.css`**: Design tokens, themes (AMOLED, Charcoal, Slate, Midnight), animations, and responsive breakpoints.
- **`script.js`**: Core state management, Pomodoro cycle engine, syllabus tracking, and UI orchestration.
- **`sealion.js`**: Interactive Sea Lion assistant component and conversational logic.
- **`audio.js`**: Soundscape and ambient audio engine using Web Audio API.
- **`songs.js`**: Curated study tracks and ambient stream registry.
- **`cards.js`**: Flashcard decks and revision questions.
- **`quizrr.js`**: Test evaluation and mock analysis parser.
- **`server.js`**: Zero-dependency Node.js synchronization backend.

---

## 🧪 Verification & Style Guide

Before submitting a pull request:
1. Ensure the code conforms to our syntax checks:
   ```bash
   npm test
   ```
2. Verify that themes (`theme-amoled`, `theme-charcoal`, `theme-slate`) render cleanly without visual artifacts.
3. Test touch responsiveness on both desktop and mobile viewports.

---

## 📜 Pull Request Guidelines

1. Create a descriptive branch name (e.g., `feat/lofi-playlist`, `fix/timer-reset`).
2. Write concise, meaningful commit messages.
3. Ensure no local test result PDFs or personal data are included.
4. Open a Pull Request referencing any related issues.
