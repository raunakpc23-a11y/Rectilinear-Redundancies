# Data Formats & Schemas Reference

This document provides schema specifications for the data datasets loaded across **Rectilinear Redundancies**.

---

## 1. Curriculum & Resources (`data.js`)

`data.js` exposes the global variable `window.rawFiles`, which contains an array of curriculum resource objects:

```javascript
[
  {
    "name": "NCERT Class 12 Physics Part 1",
    "folders": ["IIT-JEE", "PHYSICS", "NCERT"],
    "link": "https://drive.google.com/...",
    "type": "pdf"
  }
]
```

---

## 2. Flashcard Decks (`cards.js`)

`cards.js` exposes `window.rawCards`, formatted as a tabular matrix (Array of Arrays) for fast evaluation and low memory footprint:

```javascript
[
  [
    "Physics",                                   // Subject
    "What is Gauss's Law?",                      // Question / Prompt
    "Total electric flux through a closed...",   // Answer / Explanation
    "Electrostatics"                             // Chapter / Topic
  ]
]
```

---

## 3. Ambient Track Registry (`songs.js`)

`songs.js` exposes `window.rawSongs`, defining ambient lo-fi streams and study audio:

```javascript
[
  {
    "title": "Lofi Hip Hop Radio - Beats to Relax/Study to",
    "artist": "Lofi Girl",
    "id": "jfKfPfyJRdk",
    "category": "Lofi"
  }
]
```

---

## 4. Local Storage State Keys

| Storage Key | Type | Description |
| :--- | :--- | :--- |
| `pomo_settings_pro` | Object | User UI preferences, theme selection, and timer durations |
| `study_stats_pro` | Object | Cumulative study minutes, daily records, and subject distribution |
| `study_log_pro` | Array | Rolling chronological log of completed study sessions |
| `authenticated` | String (`"true"`) | Site access session lock state |
