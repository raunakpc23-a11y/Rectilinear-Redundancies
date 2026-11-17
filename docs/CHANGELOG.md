# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [5.4.0] - 2026-11-16

### Added
- **Sleek Test UI Overhaul**: Complete reimagining of the modern V2 UI activated via `✨ TEST UI` / `✨ Test UI (V2)`.
- **6-Pillar Activity Rail**: Structured navigation into Curriculum Hub, Focus Studio, Revision Lab, Exam & Mock Center, Syllabus Matrix, and Timetable Planner.
- **Exam & Mock Center**:
  - Full Mock Test Attempt Logger with subject breakdowns (Physics, Chemistry, Maths), percentage tracking, and mistake categorization (concept gaps, silly slips, calculation slips, time pressure, wrong guesses).
  - Quizrr Diagnostic Scanner: in-depth test report analyzer with leakage analysis, difficulty distribution, second-half fatigue detection, and projected score improvements.
  - Rapid Recall Quiz: live timed test mode with instant scorecards and performance feedback.
- **Interactive Syllabus Matrix**: Chapter-by-chapter mastery tracker for Class 12 Boards, JEE Mains, and JEE Advanced with real-time subject percentage rings and 4-stage tracking (Unstudied, Theory, PYQs, Mastered).
- **Timetable & Daily Planner**: Interactive daily schedule timeline with custom study blocks, completion checkoffs, and preloaded high-performance JEE study routine.
- **Unified Companion Dock & Audio Synthesizer**: Direct integration with `sealion.js` (jokes, study tips, formula checks, capybara/dog/cat/meme images) and `audio.js` (volume sliders for rain, ocean, cafe, brown noise, binaural beats, plus Lo-Fi study radio and song search).
- **Dynamic AMOLED Themes**: Instant one-click switching between AMOLED Deep Black, Obsidian Slate, Cyberpunk Neon, Forest Jade, Crimson Flame, and Arctic Light.
- **Responsive Architecture**: Full fluid layout scaling down to mobile devices with collapsible drawers and smooth GPU-accelerated micro-interactions.

---

## [5.3.0] - 2026-10-17

### Added
- **Audio Hub v2 & Songs Library**: Integrated `songs.js` containing curated ambient lo-fi and study tracks.
- **Unified Flashcards Database**: Merged multi-deck cards (`cards.js`, `cards2.js`, `cards3.js`) into a consolidated 145 KB flashcard revision deck.
- **Extras Module Integration**: Ingested `extras.js` directly into `script.js`, exposing `window.RRX` for dashboard widgets, mock databases, and lecture checkers.
- **Enterprise Standards**: Added automated GitHub CI workflows, Vercel configuration (`vercel.json`), security policy, and contributing guidelines.

### Changed
- Replaced monolithic legacy files with structured, modern modules.
- Refactored `server.js` with structured logging, health checks (`/api/health`), and `.env` support.
- Upgraded `config.js` to a frozen, documented configuration structure.

---

## [5.2.0] - 2026-10-11

### Added
- **Quizrr Test Integration**: Added `quizrr.js` to parse test-analysis reports and generate personalized performance breakdowns.
- Extended flashcard decks (`cards3.js`).
- Added `extras.css` for enhanced dashboard styling.

---

## [5.1.0] - 2026-10-10

### Added
- **Audio Engine**: Introduced `audio.js` with Web Audio API sound synthesis.
- Split flashcards into modular decks (`cards2.js`).

---

## [4.0.0] - 2026-10-09

### Added
- Comprehensive media assets directory with backgrounds, animal study companions, and mascot icons.
- Glassmorphic card design and AMOLED dark theme enhancements.

---

## [3.0.0] - 2026-10-08

### Added
- **Official Rebranding**: Rebranded project to *Rectilinear Redundancies*.
- **Cloud Sync Backend**: Added `server.js` and `config.js` for cross-device state synchronization.
- **Sea Lion AI Expansion**: Extended conversational capabilities and easter egg interactions.

---

## [2.0.0] - 2026-10-07

### Added
- Modular architecture separation (`index.html`, `styles.css`, `script.js`).
- Initial introduction of the Sea Lion study companion (`sealion.js`).

---

## [1.0.0] - 2026-09-07

### Added
- Initial prototype (*Kitaabi Keeda*) with core Pomodoro timer, syllabus progress tracking, and basic revision cards.
