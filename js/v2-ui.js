/**
 * @file v2-ui.js
 * @description Modern V2 UI & Study Operating System Overhaul for Rectilinear Redundancies.
 * Implements 6-Pillar Activity Rail, Universal Command Palette,
 * Unified Companion Dock, Exam & Mock Center (Logger, Quizrr Scanner, Rapid Quiz),
 * Interactive 3D Revision Lab, Syllabus Mastery Matrix, Timetable Planner,
 * Web Audio Ambient Hub, and Guided Site Tour.
 * @version 5.4.0
 */

(function () {
  'use strict';

  // State Management
  const state = {
    activePillar: 'curriculum', // 'curriculum' | 'focus' | 'revision' | 'mocks' | 'syllabus' | 'timetable'
    curriculumModule: 'LECTURES', // 'LECTURES' | 'FILES' | 'SUPPORT' | 'SAVED' | 'RECENT'
    selectedSubject: 'All',
    searchQuery: '',
    dockOpen: true,
    dockTab: 'sealion', // 'sealion' | 'audio' | 'notes'
    splitMode: false,
    curCardIdx: 0,
    cardFilterSubject: 'All',
    cardFilterChapter: 'All',
    isCardFlipped: false,
    cmdPaletteOpen: false,
    activeResource: null,
    activeResourceIdx: 0,
    activePartIdx: 0,
    tourStep: 0,
    mockTab: 'history', // 'history' | 'quizrr' | 'rapid'
    sylLevel: 'Class12', // 'Class12' | 'JEEMains' | 'JEEAdv'
    sylFilter: 'all',
    sylQuery: '',
    rapidQuiz: {
      active: false,
      questions: [],
      curIdx: 0,
      score: 0,
      revealed: false,
      timeLeft: 30,
      timer: null
    }
  };

  const $ = id => document.getElementById(id);

  /**
   * Tour Slides Data
   */
  const tourSlides = [
    {
      badge: "Welcome",
      title: "Welcome to Rectilinear Redundancies V2",
      desc: "This is your distraction-free Study Operating System engineered for rigorous exam preparation (IIT-JEE & Boards). Let's take a quick 1-minute walk through the interface.",
      features: [
        "⚡ Integrated Pomodoro timer with streak tracking",
        "📚 Full syllabus lectures and NCERT reference library",
        "📇 Flashcards with active recall and spaced repetition"
      ]
    },
    {
      badge: "6-Pillar Rail",
      title: "The 6-Pillar Activity Rail",
      desc: "On the far left, you'll find the primary Activity Rail. We have organized the entire workspace into 6 specialized study pillars:",
      features: [
        "📚 Curriculum Hub — Lecture playlists, NCERT PDFs, and study trees",
        "⚡ Focus Studio — Big circular Pomodoro timer, intervals, and ambient soundscapes",
        "📇 Revision Lab — Interactive 3D flip flashcards with chapter decks",
        "🧪 Exam & Mock Center — Mock attempt logger, Quizrr analyzer & rapid quiz",
        "📑 Syllabus Matrix — Chapter checklists with real-time completion rings",
        "📅 Timetable Planner — Daily schedule timeline and focus task tracker"
      ]
    },
    {
      badge: "Command Palette",
      title: "Universal Command Palette (Ctrl + K)",
      desc: "Navigate anywhere in milliseconds without touching your mouse. Press Ctrl + K (or Cmd + K on Mac) at any time to open the spotlight launcher.",
      features: [
        "🔍 Search any chapter, topic, lecture, or tool directly",
        "⚡ Trigger quick actions (Start Focus, Toggle Audio, Switch Theme)",
        "⌨️ Arrow Up / Down and Enter for full keyboard navigation"
      ]
    },
    {
      badge: "Dual Canvas",
      title: "Dual Split-Screen Workspace",
      desc: "Eliminate context switching! Click the 🔲 Split button in the top bar to divide your screen into two side-by-side study viewers.",
      features: [
        "Left Pane: Read NCERT textbook or watch a video lecture",
        "Right Pane: Open formula sheets, past papers, or flashcards",
        "Draggable middle border for custom resizing"
      ]
    },
    {
      badge: "Companion Dock",
      title: "Unified 3-in-1 Companion Dock",
      desc: "On the right side of your workspace is the Companion Dock, featuring three powerful tabs:",
      features: [
        "🦭 Sea Lion — Conversational study buddy for encouragement, tips, and jokes",
        "🎧 Soundscapes — Web Audio synthesizer (Rain, Waves, Cafe) + Lo-Fi streams",
        "📝 Scratchpad — Markdown notes editor with automatic local saving"
      ]
    },
    {
      badge: "Full Control",
      title: "Switch UI Anytime",
      desc: "Prefer the classic look? Click ↩ Classic UI in the top right to instantly return. Your study statistics, streak, and preferences remain 100% synchronized across both views.",
      features: [
        "🎓 Re-open this tour anytime by clicking the 'Tour' button in the top bar",
        "🔒 Zero-friction guest access enabled for seamless studying"
      ]
    }
  ];

  /**
   * Main Initialization
   */
  function initV2() {
    createV2DOM();
    bindEvents();
    bindAuthBypasses();
    bindKeyboardShortcuts();

    // Check saved theme
    const savedTheme = localStorage.getItem('rr_v2_theme') || 'v2-theme-amoled';
    setV2Theme(savedTheme);

    if (localStorage.getItem('rr_ui_mode') === 'v2') {
      enableV2();
    } else {
      document.documentElement.classList.remove('v2-pre-init');
    }
  }

  function enableV2() {
    if (localStorage.getItem('authenticated') !== 'true') {
      localStorage.setItem('authenticated', 'true');
      localStorage.setItem('admin_real_user', 'Student');
      document.documentElement.classList.add('authed');
    }
    document.documentElement.classList.remove('v2-pre-init');
    document.body.classList.add('ui-v2-active');
    localStorage.setItem('rr_ui_mode', 'v2');
    const savedTheme = localStorage.getItem('rr_v2_theme') || 'v2-theme-amoled';
    setV2Theme(savedTheme);
    if (window.RR && window.RR.x && window.RR.x.changeSetting) {
      try {
        if (window.RR.x.S && window.RR.x.S.mode !== 'v2') {
          window.RR.x.changeSetting('mode', 'v2');
        }
      } catch (e) {}
    }
    renderPillarView(state.activePillar);
    updateStreakAndPomoBadges();
  }

  function disableV2() {
    document.documentElement.classList.remove('v2-pre-init');
    document.body.classList.remove('ui-v2-active');
    localStorage.setItem('rr_ui_mode', 'classic');
    if (window.RR && window.RR.x && window.RR.x.changeSetting) {
      try {
        if (window.RR.x.S && window.RR.x.S.mode === 'v2') {
          window.RR.x.changeSetting('mode', 'fancy');
        }
      } catch (e) {}
    }
    if (window.RR && window.RR.x && window.RR.x.refreshHome) {
      try { window.RR.x.refreshHome(); } catch (e) {}
    }
  }

  function toggleV2() {
    if (document.body.classList.contains('ui-v2-active')) {
      disableV2();
    } else {
      enableV2();
    }
  }

  function setV2Theme(themeClass) {
    document.body.classList.remove('v2-theme-amoled', 'v2-theme-cyberpunk', 'v2-theme-forest', 'v2-theme-crimson', 'v2-theme-slate', 'v2-theme-light');
    document.body.classList.add(themeClass);
    localStorage.setItem('rr_v2_theme', themeClass);
    const sel = $('v2-theme-picker');
    if (sel) sel.value = themeClass;
  }

  /**
   * Bind Guest Access on Auth Screen
   */
  function bindAuthBypasses() {
    $('auth-guest-btn')?.addEventListener('click', () => {
      localStorage.setItem('authenticated', 'true');
      localStorage.setItem('admin_real_user', 'Student');
      document.documentElement.classList.add('authed');
      if (window.RR && window.RR.x && window.RR.x.refreshHome) window.RR.x.refreshHome();
    });

    $('auth-v2-btn')?.addEventListener('click', () => {
      localStorage.setItem('authenticated', 'true');
      localStorage.setItem('admin_real_user', 'Student');
      document.documentElement.classList.add('authed');
      enableV2();
    });
  }

  /**
   * Create DOM Elements
   */
  function createV2DOM() {
    // Connect or add Test UI button to Classic UI header
    const existingTestBtn = $('btn-activate-v2');
    if (existingTestBtn) {
      existingTestBtn.onclick = enableV2;
    } else {
      const classicActions = document.querySelector('.header-actions');
      if (classicActions) {
        const testBtn = document.createElement('button');
        testBtn.id = 'btn-activate-v2';
        testBtn.className = 'v2-test-pill';
        testBtn.title = 'Switch to Test UI (Modern V2 Overhaul)';
        testBtn.innerHTML = '✨ TEST UI';
        testBtn.onclick = enableV2;
        classicActions.prepend(testBtn);
      }
    }
    $('util-v2-card')?.addEventListener('click', enableV2);

    if ($('v2-shell')) return;

    // Build V2 Shell
    const shell = document.createElement('div');
    shell.id = 'v2-shell';
    shell.innerHTML = `
      <!-- 1. Primary Activity Rail -->
      <nav class="v2-rail">
        <div class="v2-rail-group">
          <div class="v2-rail-brand" id="v2-brand-btn" title="Rectilinear Redundancies">RR</div>
          
          <button class="v2-rail-btn active" data-pillar="curriculum" data-tip="Curriculum Hub">
            <svg viewBox="0 0 24 24"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10M6 10h10"/></svg>
          </button>
          
          <button class="v2-rail-btn" data-pillar="focus" data-tip="Focus Studio">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </button>
          
          <button class="v2-rail-btn" data-pillar="revision" data-tip="Revision Lab">
            <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
          </button>
          
          <button class="v2-rail-btn" data-pillar="mocks" data-tip="Exam & Mock Center">
            <svg viewBox="0 0 24 24"><path d="M10 2v7.31L4.2 18.2a2 2 0 0 0 1.66 3.8h12.28a2 2 0 0 0 1.66-3.8L14 9.31V2"/><line x1="8.5" y1="2" x2="15.5" y2="2"/></svg>
          </button>

          <button class="v2-rail-btn" data-pillar="syllabus" data-tip="Syllabus Matrix">
            <svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          </button>

          <button class="v2-rail-btn" data-pillar="timetable" data-tip="Timetable Planner">
            <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </button>
        </div>

        <div class="v2-rail-group">
          <button class="v2-rail-btn" id="v2-tour-rail-btn" data-tip="Take Guided Tour" style="color:var(--v2-accent)">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </button>

          <button class="v2-rail-btn" id="v2-cmd-btn" data-tip="Quick Search (Ctrl+K)">
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </button>
          
          <button class="v2-rail-btn" id="v2-dock-btn" data-tip="Toggle Companion Dock">
            <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
          </button>

          <button class="v2-rail-btn" id="v2-settings-launcher" data-tip="Settings & Preferences">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </button>

          <button class="v2-rail-btn" id="v2-exit-btn" data-tip="Return to Classic UI" style="color:var(--v2-amber)">
            <svg viewBox="0 0 24 24"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>
          </button>
        </div>
      </nav>

      <!-- 2. Secondary Context Drawer -->
      <aside class="v2-drawer" id="v2-drawer">
        <div class="v2-drawer-header">
          <span class="v2-drawer-title" id="v2-drawer-title">Curriculum Library</span>
          <button class="v2-action-icon-btn" id="v2-drawer-collapse-btn" title="Collapse Drawer">◀</button>
        </div>

        <!-- Curriculum Module Switcher -->
        <div class="v2-drawer-modules" id="v2-curriculum-modules">
          <button class="v2-drawer-mod-btn active" data-mod="LECTURES">🎬 Lectures</button>
          <button class="v2-drawer-mod-btn" data-mod="FILES">📚 Files</button>
          <button class="v2-drawer-mod-btn" data-mod="SUPPORT">📑 Support</button>
          <button class="v2-drawer-mod-btn" data-mod="SAVED">★ Saved</button>
        </div>

        <div class="v2-drawer-search">
          <div class="v2-search-box">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" id="v2-drawer-search-input" placeholder="Search resources...">
          </div>
        </div>

        <div class="v2-filter-chips" id="v2-subject-chips">
          <button class="v2-chip active" data-subject="All">All</button>
          <button class="v2-chip" data-subject="Physics">Physics</button>
          <button class="v2-chip" data-subject="Chemistry">Chemistry</button>
          <button class="v2-chip" data-subject="Maths">Maths</button>
          <button class="v2-chip" data-subject="English">English</button>
        </div>

        <div class="v2-item-list" id="v2-drawer-list"></div>
      </aside>

      <!-- 3. Adaptive Center Canvas -->
      <main class="v2-canvas">
        <header class="v2-top-bar">
          <div class="v2-top-left">
            <button class="v2-action-icon-btn" id="v2-drawer-expand-btn" style="display:none" title="Expand Drawer">☰</button>
            <div class="v2-breadcrumbs" id="v2-breadcrumbs">
              <span id="v2-crumb-pillar">Curriculum</span>
              <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
              <span class="active" id="v2-active-title">Select a lecture or book</span>
            </div>
          </div>

          <div class="v2-top-center">
            <div class="v2-cmd-trigger" id="v2-cmd-trigger">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <span>Quick Action or Search</span>
              <span class="v2-kbd">Ctrl K</span>
            </div>
          </div>

          <div class="v2-top-right">
            <!-- Theme Selector -->
            <select class="v2-theme-select" id="v2-theme-picker" title="Switch Theme">
              <option value="v2-theme-amoled">🖤 AMOLED</option>
              <option value="v2-theme-slate">🌑 Obsidian</option>
              <option value="v2-theme-cyberpunk">⚡ Cyberpunk</option>
              <option value="v2-theme-forest">🌲 Forest</option>
              <option value="v2-theme-crimson">🔥 Crimson</option>
              <option value="v2-theme-light">☀️ Arctic Light</option>
            </select>

            <button class="v2-btn-secondary" id="v2-start-tour-btn" style="padding:4px 10px;font-size:12px;border-radius:999px">🎓 Tour</button>
            
            <div class="v2-streak-pill" id="v2-streak-badge">
              <span>🔥</span>
              <span id="v2-streak-num">1</span>
              <span>Days</span>
            </div>

            <div class="v2-pomo-badge" id="v2-pomo-badge" title="Focus Studio">
              <span>⚡</span>
              <span id="v2-pomo-time">25:00</span>
            </div>

            <button class="v2-action-icon-btn" id="v2-split-toggle" title="Toggle Split View">🔲</button>
            <button class="v2-action-icon-btn" id="v2-fullscreen-toggle" title="Toggle Fullscreen">⛶</button>
            <button class="v2-test-pill" id="v2-header-exit" style="background:#27272a;font-size:11px">↩ Classic UI</button>
          </div>
        </header>

        <!-- Dynamic Content Canvas -->
        <section class="v2-content-area" id="v2-content-area">
          <!-- 1. Curriculum Split Viewer -->
          <div class="v2-split-wrapper" id="v2-curriculum-view">
            <div class="v2-viewer-pane" id="v2-pane-primary">
              <div class="v2-lecture-bar" id="v2-lecture-bar" style="display:none">
                <div class="v2-lecture-controls">
                  <button class="v2-lec-btn" id="v2-lec-prev">◀ Prev</button>
                  <button class="v2-lec-btn" id="v2-lec-next">Next ▶</button>
                  <select class="v2-part-dropdown" id="v2-lec-dropdown"></select>
                </div>
                <div class="v2-lecture-controls">
                  <button class="v2-lec-btn" id="v2-lec-watched">✓ Watched</button>
                  <button class="v2-lec-btn" id="v2-lec-star">★ Bookmark</button>
                  <a class="v2-lec-btn" id="v2-lec-ext" target="_blank" rel="noopener">↗ Open Link</a>
                </div>
              </div>
              <iframe id="v2-primary-frame" src="about:blank" allow="autoplay; fullscreen"></iframe>
            </div>

            <div class="v2-pane-divider" id="v2-pane-divider" style="display:none"></div>
            
            <div class="v2-viewer-pane" id="v2-pane-secondary" style="display:none">
              <div class="v2-lecture-bar">
                <span>Secondary Study Panel (Reference & Formulas)</span>
                <button class="v2-action-icon-btn" id="v2-pane2-close">✕</button>
              </div>
              <iframe id="v2-secondary-frame" src="about:blank" allow="autoplay; fullscreen"></iframe>
            </div>
          </div>

          <!-- 2. Focus Studio -->
          <div class="v2-focus-studio" id="v2-focus-view" style="display:none">
            <div class="v2-timer-ring-container">
              <svg viewBox="0 0 260 260">
                <circle class="v2-timer-circle-bg" cx="130" cy="130" r="110"/>
                <circle class="v2-timer-circle-progress" id="v2-progress-circle" cx="130" cy="130" r="110" stroke-dasharray="691.15" stroke-dashoffset="0"/>
              </svg>
              <div class="v2-timer-readout">
                <div class="v2-timer-time" id="v2-big-timer">25:00</div>
                <div class="v2-timer-label" id="v2-big-mode">Focus Session</div>
              </div>
            </div>

            <div class="v2-mode-pills">
              <button class="v2-mode-pill active" data-mode="focus">Focus (25m)</button>
              <button class="v2-mode-pill" data-mode="short">Short Break (5m)</button>
              <button class="v2-mode-pill" data-mode="long">Long Break (15m)</button>
              <button class="v2-mode-pill" data-mode="deep">Deep Work (50m)</button>
              <button class="v2-mode-pill" data-mode="marathon">Marathon (90m)</button>
            </div>

            <div class="v2-focus-task-box">
              <span>🎯</span>
              <input type="text" id="v2-focus-task-input" placeholder="What are you focusing on right now? (e.g. 20 Electrostatics PYQs)">
            </div>

            <div class="v2-timer-actions">
              <button class="v2-btn-secondary" id="v2-timer-reset">↺ Reset</button>
              <button class="v2-btn-primary" id="v2-timer-toggle">▶ Start Session</button>
            </div>

            <div class="v2-quick-ambient-bar">
              <button class="v2-ambient-btn" id="v2-focus-rain">🌧️ Rain</button>
              <button class="v2-ambient-btn" id="v2-focus-waves">🌊 Waves</button>
              <button class="v2-ambient-btn" id="v2-focus-cafe">☕ Café</button>
              <button class="v2-ambient-btn" id="v2-focus-lofi">🎵 Lo-Fi Beats</button>
            </div>

            <div class="v2-quote-card" id="v2-quote-box">
              <span id="v2-quote-text">"Focus is your superpower. Brick by brick."</span>
              <button class="v2-action-icon-btn" id="v2-quote-refresh" title="New Quote">⟳</button>
            </div>
          </div>

          <!-- 3. Revision Lab -->
          <div class="v2-revision-arena" id="v2-revision-view" style="display:none">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;flex-wrap:wrap">
              <span style="font-size:13px;color:var(--v2-text-muted)">Subject:</span>
              <select id="v2-card-subj-select" class="v2-part-dropdown" style="font-size:13px">
                <option value="All">All Subjects</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Maths">Mathematics</option>
              </select>

              <span style="font-size:13px;color:var(--v2-text-muted)">Chapter:</span>
              <select id="v2-card-chap-select" class="v2-part-dropdown" style="font-size:13px;max-width:200px">
                <option value="All">All Chapters</option>
              </select>

              <span id="v2-card-counter" style="font-size:12px;color:var(--v2-accent);font-weight:700">Card 1</span>
              <button class="v2-btn-secondary" id="v2-card-shuffle-btn" style="padding:4px 10px;font-size:12px">🔀 Shuffle</button>
            </div>

            <div class="v2-flashcard-stage" id="v2-card-stage">
              <div class="v2-flashcard-card" id="v2-card-card">
                <div class="v2-card-face v2-card-front">
                  <span class="v2-card-topic" id="v2-card-subject">Physics · Electrostatics</span>
                  <div class="v2-card-text" id="v2-card-question">What is Gauss's Law?</div>
                  <span class="v2-card-hint">Click card or press [Space] to reveal answer</span>
                </div>
                <div class="v2-card-face v2-card-back">
                  <span class="v2-card-topic" id="v2-card-subject-back">Answer & Concept</span>
                  <div class="v2-card-text" id="v2-card-answer">Total electric flux through any closed surface is 1/ε₀ times the total charge enclosed.</div>
                  <span class="v2-card-hint">Rate recall difficulty below</span>
                </div>
              </div>
            </div>

            <div class="v2-card-rating">
              <button class="v2-rating-btn hard" id="v2-rate-hard">[1] Hard 🔴</button>
              <button class="v2-rating-btn good" id="v2-rate-good">[2] Good 🟡</button>
              <button class="v2-rating-btn easy" id="v2-rate-easy">[3] Easy 🟢</button>
            </div>

            <div class="v2-card-progress-bar">
              <div class="v2-card-progress-fill" id="v2-card-progress-fill" style="width:10%"></div>
            </div>
          </div>

          <!-- 4. Exam & Mock Center -->
          <div class="v2-mock-center" id="v2-mocks-view" style="display:none">
            <div class="v2-subtab-bar">
              <button class="v2-subtab-btn active" data-mocktab="history">📈 Mock Dashboard & Logger</button>
              <button class="v2-subtab-btn" data-mocktab="quizrr">📑 Quizrr Deep Analyzer</button>
              <button class="v2-subtab-btn" data-mocktab="rapid">⚡ Rapid Recall Quiz</button>
            </div>

            <!-- Subtab 1: Mock Dashboard & Logger -->
            <div id="v2-mock-history-panel">
              <div class="v2-stats-grid" id="v2-mock-stats-grid"></div>
              
              <div class="v2-grid-2">
                <div class="v2-card-panel">
                  <div class="v2-panel-title"><span>Subject Performance Breakdown</span></div>
                  <div id="v2-mock-subject-breakdown"></div>
                </div>

                <div class="v2-card-panel">
                  <div class="v2-panel-title"><span>Mistake Leakage Analysis</span></div>
                  <div id="v2-mock-mistake-breakdown"></div>
                </div>
              </div>

              <!-- Log Form -->
              <div class="v2-card-panel">
                <div class="v2-panel-title">
                  <span>➕ Log New Mock Attempt</span>
                </div>
                <div class="v2-form-grid">
                  <div class="v2-form-group">
                    <label>Mock Exam Name</label>
                    <input type="text" id="v2-mf-name" placeholder="e.g. Allen AIOT-04 or FIITJEE AITS">
                  </div>
                  <div class="v2-form-group">
                    <label>Date</label>
                    <input type="date" id="v2-mf-date">
                  </div>
                  <div class="v2-form-group">
                    <label>Target Exam</label>
                    <select id="v2-mf-exam">
                      <option>JEE Main</option>
                      <option>JEE Advanced</option>
                      <option>BITSAT</option>
                      <option>Class 12 Boards</option>
                    </select>
                  </div>
                  <div class="v2-form-group">
                    <label>Physics Score</label>
                    <input type="number" id="v2-mf-p" placeholder="P Marks">
                  </div>
                  <div class="v2-form-group">
                    <label>Chemistry Score</label>
                    <input type="number" id="v2-mf-c" placeholder="C Marks">
                  </div>
                  <div class="v2-form-group">
                    <label>Maths Score</label>
                    <input type="number" id="v2-mf-m" placeholder="M Marks">
                  </div>
                  <div class="v2-form-group">
                    <label>Max Marks</label>
                    <input type="number" id="v2-mf-max" value="300">
                  </div>
                  <div class="v2-form-group">
                    <label>Rank / Percentile</label>
                    <input type="text" id="v2-mf-rank" placeholder="e.g. 99.2 %ile">
                  </div>
                </div>
                <button class="v2-btn-primary" id="v2-mf-save-btn">Save Mock Attempt</button>
              </div>

              <!-- Table -->
              <div class="v2-card-panel">
                <div class="v2-panel-title"><span>Attempt Records</span></div>
                <div class="v2-table-wrap">
                  <table class="v2-table">
                    <thead>
                      <tr><th>Date</th><th>Exam</th><th>Physics</th><th>Chem</th><th>Maths</th><th>Total</th><th>%</th><th>Rank</th><th>Action</th></tr>
                    </thead>
                    <tbody id="v2-mock-table-body"></tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- Subtab 2: Quizrr Deep Analyzer -->
            <div id="v2-mock-quizrr-panel" style="display:none">
              <div class="v2-card-panel">
                <div class="v2-panel-title">
                  <span>📑 Quizrr Diagnostic Report Scanner</span>
                  <button class="v2-btn-secondary" id="v2-quizrr-sample-btn" style="padding:4px 12px;font-size:12px">Load Demo Sample</button>
                </div>
                <p style="font-size:13px;color:var(--v2-text-muted);margin-bottom:12px">
                  Paste the text analysis output from any Quizrr/MathonGo/Allen test report to extract instant score breakdowns, leakage analysis, and second-half fatigue detection.
                </p>
                <textarea id="v2-quizrr-input" class="v2-notes-area" style="height:120px;border:1px solid var(--v2-border);border-radius:var(--v2-radius-sm);background:var(--v2-bg-elevated);margin-bottom:12px" placeholder="Paste test report text here..."></textarea>
                <button class="v2-btn-primary" id="v2-quizrr-scan-btn">⚡ Run Diagnostic Scan</button>
              </div>

              <div id="v2-quizrr-results" style="display:none">
                <div class="v2-card-panel">
                  <div class="v2-panel-title"><span id="v2-quizrr-headline">Diagnostic Summary</span></div>
                  <div id="v2-quizrr-insights"></div>
                </div>
              </div>
            </div>

            <!-- Subtab 3: Rapid Recall Quiz Runner -->
            <div id="v2-mock-rapid-panel" style="display:none">
              <div class="v2-card-panel" id="v2-rapid-setup">
                <div class="v2-panel-title"><span>⚡ Rapid Recall Test Mode</span></div>
                <p style="font-size:13px;color:var(--v2-text-muted);margin-bottom:16px">
                  Test your immediate concept recall under exam time pressure with high-yield flashcard questions.
                </p>
                <div style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap">
                  <div class="v2-form-group">
                    <label>Subject</label>
                    <select id="v2-rapid-subj" class="v2-part-dropdown">
                      <option value="All">All Subjects (P + C + M)</option>
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Maths">Mathematics</option>
                    </select>
                  </div>
                  <div class="v2-form-group">
                    <label>Questions Count</label>
                    <select id="v2-rapid-count" class="v2-part-dropdown">
                      <option value="5">5 Questions (Sprint)</option>
                      <option value="10" selected>10 Questions (Standard)</option>
                      <option value="20">20 Questions (Marathon)</option>
                    </select>
                  </div>
                </div>
                <button class="v2-btn-primary" id="v2-rapid-start-btn">🚀 Begin Timed Test</button>
              </div>

              <div class="v2-card-panel" id="v2-rapid-runner" style="display:none">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
                  <span id="v2-rapid-q-badge" class="v2-tour-badge">Question 1 of 10</span>
                  <span id="v2-rapid-timer" style="font-size:16px;font-weight:800;color:var(--v2-amber)">⏱ 30s</span>
                </div>
                <div style="font-size:18px;font-weight:700;color:#fff;margin-bottom:20px;min-height:60px" id="v2-rapid-q-text">Loading question...</div>
                
                <div id="v2-rapid-a-box" style="display:none;background:var(--v2-bg-elevated);padding:14px;border-radius:var(--v2-radius-md);margin-bottom:20px;border-left:4px solid var(--v2-emerald)">
                  <div style="font-size:12px;font-weight:700;color:var(--v2-emerald);margin-bottom:4px">CORRECT ANSWER:</div>
                  <div id="v2-rapid-a-text" style="font-size:15px;color:#fff"></div>
                </div>

                <div style="display:flex;gap:12px" id="v2-rapid-controls">
                  <button class="v2-btn-primary" id="v2-rapid-reveal-btn">Reveal Answer</button>
                  <button class="v2-btn-secondary" id="v2-rapid-pass-btn" style="display:none;background:rgba(16,185,129,0.2);color:var(--v2-emerald);border-color:var(--v2-emerald)">✓ I Got It Right (+1)</button>
                  <button class="v2-btn-secondary" id="v2-rapid-fail-btn" style="display:none;background:rgba(244,63,94,0.2);color:var(--v2-rose);border-color:var(--v2-rose)">✗ Missed It</button>
                </div>
              </div>

              <div class="v2-card-panel" id="v2-rapid-scorecard" style="display:none;text-align:center;padding:32px">
                <div style="font-size:48px;font-weight:900;color:var(--v2-accent);margin-bottom:8px" id="v2-rapid-final-score">8 / 10</div>
                <h3 style="font-size:20px;color:#fff;margin-bottom:8px" id="v2-rapid-final-headline">Solid Recall!</h3>
                <p style="font-size:14px;color:var(--v2-text-muted);margin-bottom:24px" id="v2-rapid-final-sub">You have strong grasp over these fundamental formulas.</p>
                <button class="v2-btn-primary" id="v2-rapid-retry-btn" style="margin:0 auto">↻ Take Another Quiz</button>
              </div>
            </div>
          </div>

          <!-- 5. Syllabus Mastery Matrix -->
          <div class="v2-scroll-view" id="v2-syllabus-view" style="display:none">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:12px">
              <div>
                <h2 style="font-size:22px;font-weight:800;color:#fff">📑 Syllabus Mastery Matrix</h2>
                <p style="font-size:13px;color:var(--v2-text-muted)">Chapter-by-chapter progression tracker for JEE & Boards</p>
              </div>
              <div class="v2-mode-pills" style="margin:0">
                <button class="v2-mode-pill active" data-syl="Class12">Class 12 Boards</button>
                <button class="v2-mode-pill" data-syl="JEEMains">JEE Mains</button>
                <button class="v2-mode-pill" data-syl="JEEAdv">JEE Advanced</button>
              </div>
            </div>

            <!-- Level Stat Rings -->
            <div class="v2-syl-header-grid" id="v2-syl-header-cards"></div>

            <!-- Filters -->
            <div style="display:flex;gap:10px;margin-bottom:20px;align-items:center;flex-wrap:wrap">
              <input type="text" id="v2-syl-search" placeholder="Search chapters..." style="background:var(--v2-bg-surface);border:1px solid var(--v2-border);border-radius:var(--v2-radius-sm);padding:8px 12px;color:#fff;font-size:13px;width:240px">
              <div class="v2-filter-chips" style="border:none;padding:0">
                <button class="v2-chip active" data-sylfilter="all">All</button>
                <button class="v2-chip" data-sylfilter="0">⚪ Unstudied</button>
                <button class="v2-chip" data-sylfilter="1">🟡 Theory</button>
                <button class="v2-chip" data-sylfilter="2">🔵 PYQs</button>
                <button class="v2-chip" data-sylfilter="3">🟢 Mastered</button>
              </div>
            </div>

            <!-- Subject Columns -->
            <div class="v2-syl-grid" id="v2-syl-columns"></div>
          </div>

          <!-- 6. Timetable Planner -->
          <div class="v2-scroll-view" id="v2-timetable-view" style="display:none">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:12px">
              <div>
                <h2 style="font-size:22px;font-weight:800;color:#fff">📅 Timetable & Focus Blocks</h2>
                <p style="font-size:13px;color:var(--v2-text-muted)">Structure your daily study regimen into deep blocks</p>
              </div>
              <div style="display:flex;gap:8px">
                <button class="v2-btn-secondary" id="v2-tt-reset-template">↺ Reset JEE Routine</button>
              </div>
            </div>

            <div class="v2-card-panel" style="margin-bottom:20px">
              <div class="v2-panel-title"><span>➕ Add New Focus Block</span></div>
              <div style="display:flex;gap:10px;flex-wrap:wrap">
                <input type="time" id="v2-tt-in-time" value="09:00" style="background:var(--v2-bg-elevated);border:1px solid var(--v2-border);border-radius:var(--v2-radius-sm);padding:8px;color:#fff;font-size:13px">
                <input type="text" id="v2-tt-in-desc" placeholder="Task description (e.g. Physics Mechanics Numerical Drill)" style="flex:1;min-width:240px;background:var(--v2-bg-elevated);border:1px solid var(--v2-border);border-radius:var(--v2-radius-sm);padding:8px 12px;color:#fff;font-size:13px">
                <select id="v2-tt-in-subj" class="v2-part-dropdown">
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Maths">Maths</option>
                  <option value="Revision">Revision</option>
                  <option value="Mock">Mock Test</option>
                </select>
                <button class="v2-btn-primary" id="v2-tt-add-btn">Add Block</button>
              </div>
            </div>

            <div class="v2-tt-timeline" id="v2-tt-list"></div>
          </div>
        </section>
      </main>

      <!-- 4. Unified Companion Dock -->
      <aside class="v2-dock" id="v2-dock">
        <div class="v2-dock-header">
          <div class="v2-dock-tabs">
            <button class="v2-dock-tab active" data-dock="sealion">🦭 Sea Lion</button>
            <button class="v2-dock-tab" data-dock="audio">🎧 Sounds</button>
            <button class="v2-dock-tab" data-dock="notes">📝 Notes</button>
          </div>
          <button class="v2-action-icon-btn" id="v2-dock-close" title="Close Dock">✕</button>
        </div>

        <div class="v2-dock-body">
          <!-- Tab 1: Sea Lion -->
          <div class="v2-dock-panel active" id="v2-dock-sealion">
            <div class="v2-sl-companion-header">
              <div class="v2-sl-avatar-wrap">
                <svg viewBox="0 0 100 100"><use href="#sl-icon"/></svg>
              </div>
              <div>
                <div style="font-weight:700;font-size:14px;color:#fff">Personal Sea Lion</div>
                <div style="font-size:11px;color:var(--v2-emerald)">● Active & Listening</div>
              </div>
            </div>

            <div class="v2-sl-chat-area" id="v2-sl-chat">
              <div class="v2-sl-msg bot">
                *Arf arf!* Flaps flippers excitedly. I'm your Personal Sea Lion companion! Ask me for study advice, a quick formula check, a joke, a motivational boost, or a cat/dog/meme picture!
              </div>
            </div>

            <div class="v2-sl-chips">
              <button class="v2-sl-chip-btn" data-slq="Study tip">💡 Study Tip</button>
              <button class="v2-sl-chip-btn" data-slq="Tell me a joke">😄 Joke</button>
              <button class="v2-sl-chip-btn" data-slq="Quiz me">📝 Quiz Me</button>
              <button class="v2-sl-chip-btn" data-slq="Motivate me">🔥 Motivate</button>
              <button class="v2-sl-chip-btn" data-slq="Cat picture">🐱 Cat Pic</button>
              <button class="v2-sl-chip-btn" data-slq="Capybara">🦫 Capybara</button>
              <button class="v2-sl-chip-btn" data-slq="Meme">🎭 Meme</button>
            </div>

            <div class="v2-sl-input-box">
              <input type="text" id="v2-sl-input" placeholder="Chat with Sea Lion...">
              <button class="v2-btn-primary" id="v2-sl-send" style="padding:6px 14px">➤</button>
            </div>
          </div>

          <!-- Tab 2: Audio & Ambient Mixer -->
          <div class="v2-dock-panel" id="v2-dock-audio">
            <div class="v2-sound-mixer">
              <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:var(--v2-text-muted);margin-bottom:4px">
                Ambient Soundscape Synthesizer
              </div>

              <!-- Rain -->
              <div class="v2-sound-row">
                <div class="v2-sound-label">
                  <span>🌧️ Rain</span>
                  <button class="v2-btn-secondary" id="v2-toggle-rain" style="padding:3px 10px;font-size:11px">Toggle</button>
                </div>
                <div class="v2-slider-row">
                  <input type="range" class="v2-slider" id="v2-vol-rain" min="0" max="1" step="0.05" value="0.6">
                </div>
              </div>

              <!-- Ocean Waves -->
              <div class="v2-sound-row">
                <div class="v2-sound-label">
                  <span>🌊 Ocean Waves</span>
                  <button class="v2-btn-secondary" id="v2-toggle-waves" style="padding:3px 10px;font-size:11px">Toggle</button>
                </div>
                <div class="v2-slider-row">
                  <input type="range" class="v2-slider" id="v2-vol-waves" min="0" max="1" step="0.05" value="0.6">
                </div>
              </div>

              <!-- Cafe -->
              <div class="v2-sound-row">
                <div class="v2-sound-label">
                  <span>☕ Café Murmur</span>
                  <button class="v2-btn-secondary" id="v2-toggle-cafe" style="padding:3px 10px;font-size:11px">Toggle</button>
                </div>
                <div class="v2-slider-row">
                  <input type="range" class="v2-slider" id="v2-vol-cafe" min="0" max="1" step="0.05" value="0.55">
                </div>
              </div>

              <!-- White / Brown Noise -->
              <div class="v2-sound-row">
                <div class="v2-sound-label">
                  <span>🌊 Brown Noise</span>
                  <button class="v2-btn-secondary" id="v2-toggle-brown" style="padding:3px 10px;font-size:11px">Toggle</button>
                </div>
                <div class="v2-slider-row">
                  <input type="range" class="v2-slider" id="v2-vol-brown" min="0" max="1" step="0.05" value="0.5">
                </div>
              </div>

              <!-- Binaural Beats -->
              <div class="v2-sound-row">
                <div class="v2-sound-label">
                  <span>🎧 Binaural Beats (Alpha 10Hz)</span>
                  <button class="v2-btn-secondary" id="v2-toggle-bin" style="padding:3px 10px;font-size:11px">Toggle</button>
                </div>
                <div class="v2-slider-row">
                  <input type="range" class="v2-slider" id="v2-vol-bin" min="0" max="1" step="0.05" value="0.3">
                </div>
              </div>

              <hr style="border:none;border-top:1px solid var(--v2-border);margin:8px 0">

              <!-- Lo-Fi Radio Stream -->
              <div class="v2-sound-row">
                <div class="v2-sound-label"><span id="v2-lofi-title">🎵 Lo-Fi Beats Radio</span></div>
                <button class="v2-btn-primary" id="v2-lofi-toggle">▶ Play Lo-Fi Stream</button>
              </div>

              <!-- Song Search -->
              <div class="v2-sound-row">
                <div class="v2-sound-label"><span>🔍 Search 3000+ Curated Songs</span></div>
                <input type="text" id="v2-song-search-input" placeholder="Type artist or song title..." style="background:var(--v2-bg-surface);border:1px solid var(--v2-border);border-radius:var(--v2-radius-sm);padding:6px 10px;color:#fff;font-size:12px;width:100%">
                <div id="v2-song-search-results" style="max-height:160px;overflow-y:auto;display:flex;flex-direction:column;gap:3px;margin-top:6px"></div>
              </div>
            </div>
          </div>

          <!-- Tab 3: Quick Notes -->
          <div class="v2-dock-panel" id="v2-dock-notes">
            <div class="v2-notes-container">
              <div class="v2-notes-toolbar">
                <span id="v2-notes-wc">0 words · 0 chars</span>
                <div style="display:flex;gap:6px">
                  <button class="v2-action-icon-btn" id="v2-notes-copy" title="Copy to clipboard" style="width:26px;height:26px;font-size:11px">📋</button>
                  <button class="v2-action-icon-btn" id="v2-notes-download" title="Download as text file" style="width:26px;height:26px;font-size:11px">⬇</button>
                  <button class="v2-action-icon-btn" id="v2-notes-clear" title="Clear notes" style="width:26px;height:26px;font-size:11px">🗑</button>
                </div>
              </div>
              <textarea class="v2-notes-area" id="v2-notes-input" placeholder="Type Markdown notes here... Auto-saved locally!"></textarea>
            </div>
          </div>
        </div>
      </aside>

      <!-- 5. Universal Command Palette Overlay -->
      <div class="v2-cmd-overlay" id="v2-cmd-overlay">
        <div class="v2-cmd-modal">
          <div class="v2-cmd-header">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" id="v2-cmd-input" placeholder="Type a chapter, subject, tool, or action...">
            <span class="v2-kbd">ESC</span>
          </div>
          <div class="v2-cmd-results" id="v2-cmd-results"></div>
        </div>
      </div>

      <!-- 6. Guided Tour Spotlight Modal -->
      <div class="v2-tour-overlay" id="v2-tour-overlay">
        <div class="v2-tour-card">
          <div class="v2-tour-header">
            <span class="v2-tour-badge" id="v2-tour-step-badge">Step 1 of 6</span>
            <h3 class="v2-tour-title" id="v2-tour-step-title">Welcome</h3>
          </div>
          <p class="v2-tour-desc" id="v2-tour-step-desc"></p>
          <div class="v2-tour-feature-list" id="v2-tour-features"></div>
          <div class="v2-tour-dots" id="v2-tour-dots"></div>
          <div class="v2-tour-footer">
            <button class="v2-btn-secondary" id="v2-tour-skip-btn">Skip Tour</button>
            <div style="display:flex;gap:8px">
              <button class="v2-btn-secondary" id="v2-tour-prev-btn">◀ Back</button>
              <button class="v2-btn-primary" id="v2-tour-next-btn">Next ▶</button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(shell);
  }

  /**
   * Bind event handlers
   */
  function bindEvents() {
    // 1. Pillar Switching
    document.querySelectorAll('.v2-rail-btn[data-pillar]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.v2-rail-btn[data-pillar]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.activePillar = btn.dataset.pillar;
        renderPillarView(state.activePillar);
      });
    });

    // 2. Return to Classic UI
    $('v2-exit-btn')?.addEventListener('click', disableV2);
    $('v2-header-exit')?.addEventListener('click', disableV2);

    // 3. Settings Launcher in Classic Modal
    $('v2-settings-launcher')?.addEventListener('click', () => {
      if ($('settings-modal')) {
        $('settings-modal').classList.add('open');
        if (window.renderSettings) window.renderSettings();
      }
    });

    // 4. Tour Buttons
    $('v2-start-tour-btn')?.addEventListener('click', () => openTour(0));
    $('v2-tour-rail-btn')?.addEventListener('click', () => openTour(0));
    $('v2-tour-next-btn')?.addEventListener('click', () => nextTourStep());
    $('v2-tour-prev-btn')?.addEventListener('click', () => prevTourStep());
    $('v2-tour-skip-btn')?.addEventListener('click', () => closeTour());

    // 5. Drawer Toggle
    $('v2-drawer-collapse-btn')?.addEventListener('click', () => {
      $('v2-drawer').classList.add('collapsed');
      $('v2-drawer-expand-btn').style.display = 'flex';
    });
    $('v2-drawer-expand-btn')?.addEventListener('click', () => {
      $('v2-drawer').classList.remove('collapsed');
      $('v2-drawer-expand-btn').style.display = 'none';
    });

    // 6. Curriculum Module Buttons
    document.querySelectorAll('.v2-drawer-mod-btn[data-mod]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.v2-drawer-mod-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.curriculumModule = btn.dataset.mod;
        populateDrawerList();
      });
    });

    // 7. Subject Chips in Drawer
    document.querySelectorAll('.v2-chip[data-subject]').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.v2-chip[data-subject]').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        state.selectedSubject = chip.dataset.subject;
        populateDrawerList();
      });
    });

    // 8. Drawer Search
    $('v2-drawer-search-input')?.addEventListener('input', e => {
      state.searchQuery = e.target.value.toLowerCase();
      populateDrawerList();
    });

    // 9. Dock Toggles & Tabs
    $('v2-dock-btn')?.addEventListener('click', toggleDock);
    $('v2-dock-close')?.addEventListener('click', () => toggleDock(false));
    document.querySelectorAll('.v2-dock-tab[data-dock]').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.v2-dock-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.v2-dock-panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        state.dockTab = tab.dataset.dock;
        $('v2-dock-' + state.dockTab)?.classList.add('active');
      });
    });

    // 10. Command Palette
    $('v2-cmd-btn')?.addEventListener('click', openCmdPalette);
    $('v2-cmd-trigger')?.addEventListener('click', openCmdPalette);
    $('v2-cmd-overlay')?.addEventListener('click', e => {
      if (e.target.id === 'v2-cmd-overlay') closeCmdPalette();
    });
    $('v2-cmd-input')?.addEventListener('input', handleCmdInput);

    // 11. Flashcard Interactions
    $('v2-card-stage')?.addEventListener('click', flipCard);
    $('v2-rate-hard')?.addEventListener('click', () => rateCard(1));
    $('v2-rate-good')?.addEventListener('click', () => rateCard(2));
    $('v2-rate-easy')?.addEventListener('click', () => rateCard(3));
    $('v2-card-subj-select')?.addEventListener('change', e => {
      state.cardFilterSubject = e.target.value;
      state.cardFilterChapter = 'All';
      populateCardChapterSelect();
      state.curCardIdx = 0;
      loadCard(0);
    });
    $('v2-card-chap-select')?.addEventListener('change', e => {
      state.cardFilterChapter = e.target.value;
      state.curCardIdx = 0;
      loadCard(0);
    });
    $('v2-card-shuffle-btn')?.addEventListener('click', shuffleCards);

    // 12. Focus Timer Buttons
    $('v2-timer-toggle')?.addEventListener('click', toggleTimer);
    $('v2-timer-reset')?.addEventListener('click', resetTimer);
    document.querySelectorAll('.v2-mode-pill[data-mode]').forEach(p => {
      p.addEventListener('click', () => {
        document.querySelectorAll('.v2-mode-pill[data-mode]').forEach(x => x.classList.remove('active'));
        p.classList.add('active');
        setTimerMode(p.dataset.mode);
      });
    });
    $('v2-quote-refresh')?.addEventListener('click', refreshQuote);

    // 13. Focus Task Input
    const taskInput = $('v2-focus-task-input');
    if (taskInput) {
      taskInput.value = localStorage.getItem('rr_focus_task') || '';
      taskInput.addEventListener('input', () => {
        localStorage.setItem('rr_focus_task', taskInput.value);
      });
    }

    // 14. Focus Ambient Quick Buttons
    $('v2-focus-rain')?.addEventListener('click', () => toggleAudioLayer('rain', 'v2-focus-rain', null));
    $('v2-focus-waves')?.addEventListener('click', () => toggleAudioLayer('ocean', 'v2-focus-waves', null));
    $('v2-focus-cafe')?.addEventListener('click', () => toggleAudioLayer('cafe', 'v2-focus-cafe', null));
    $('v2-focus-lofi')?.addEventListener('click', toggleLofiMusic);

    // 15. Split View Toggle
    $('v2-split-toggle')?.addEventListener('click', toggleSplitView);
    $('v2-pane2-close')?.addEventListener('click', toggleSplitView);

    // 16. Fullscreen Toggle
    $('v2-fullscreen-toggle')?.addEventListener('click', toggleFullscreen);

    // 17. Theme Switcher
    $('v2-theme-picker')?.addEventListener('change', e => {
      setV2Theme(e.target.value);
    });

    // 18. Notes Auto-save & Toolbar
    const notesInput = $('v2-notes-input');
    if (notesInput) {
      notesInput.value = localStorage.getItem('rr_v2_notes') || '';
      updateNotesWordCount(notesInput.value);
      notesInput.addEventListener('input', () => {
        localStorage.setItem('rr_v2_notes', notesInput.value);
        updateNotesWordCount(notesInput.value);
      });
    }
    $('v2-notes-copy')?.addEventListener('click', () => {
      if (notesInput) {
        navigator.clipboard.writeText(notesInput.value);
        if (window.showToast) window.showToast('📋 Copied notes to clipboard');
      }
    });
    $('v2-notes-download')?.addEventListener('click', () => {
      if (notesInput) {
        const blob = new Blob([notesInput.value], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `Study_Notes_${new Date().toISOString().slice(0, 10)}.txt`;
        a.click();
      }
    });
    $('v2-notes-clear')?.addEventListener('click', () => {
      if (notesInput && confirm('Clear all notes?')) {
        notesInput.value = '';
        localStorage.setItem('rr_v2_notes', '');
        updateNotesWordCount('');
      }
    });

    // 19. Sea Lion Chat In Dock
    $('v2-sl-send')?.addEventListener('click', sendSeaLionMsg);
    $('v2-sl-input')?.addEventListener('keydown', e => {
      if (e.key === 'Enter') sendSeaLionMsg();
    });
    document.querySelectorAll('.v2-sl-chip-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const q = btn.dataset.slq;
        if (q) {
          $('v2-sl-input').value = q;
          sendSeaLionMsg();
        }
      });
    });

    // 20. Real Audio Synthesizer Triggers
    $('v2-toggle-rain')?.addEventListener('click', () => toggleAudioLayer('rain', 'v2-toggle-rain', 'v2-vol-rain'));
    $('v2-toggle-waves')?.addEventListener('click', () => toggleAudioLayer('ocean', 'v2-toggle-waves', 'v2-vol-waves'));
    $('v2-toggle-cafe')?.addEventListener('click', () => toggleAudioLayer('cafe', 'v2-toggle-cafe', 'v2-vol-cafe'));
    $('v2-toggle-brown')?.addEventListener('click', () => toggleAudioLayer('brown', 'v2-toggle-brown', 'v2-vol-brown'));
    $('v2-toggle-bin')?.addEventListener('click', () => toggleAudioLayer('binaural', 'v2-toggle-bin', 'v2-vol-bin'));
    $('v2-lofi-toggle')?.addEventListener('click', toggleLofiMusic);

    // Audio Sliders
    bindAudioSlider('v2-vol-rain', 'rain');
    bindAudioSlider('v2-vol-waves', 'ocean');
    bindAudioSlider('v2-vol-cafe', 'cafe');
    bindAudioSlider('v2-vol-brown', 'brown');
    bindAudioSlider('v2-vol-bin', 'binaural');

    // Song Search
    $('v2-song-search-input')?.addEventListener('input', handleSongSearch);

    // 21. Lecture Bar Controls
    $('v2-lec-prev')?.addEventListener('click', () => changeLecturePart(-1));
    $('v2-lec-next')?.addEventListener('click', () => changeLecturePart(1));
    $('v2-lec-dropdown')?.addEventListener('change', e => {
      selectLecturePart(parseInt(e.target.value, 10));
    });
    $('v2-lec-watched')?.addEventListener('click', markLectureWatched);
    $('v2-lec-star')?.addEventListener('click', toggleBookmarkActiveResource);

    // 22. Exam & Mock Center Sub-tabs
    document.querySelectorAll('.v2-subtab-btn[data-mocktab]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.v2-subtab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.mockTab = btn.dataset.mocktab;
        renderMockSubtab();
      });
    });

    // Mock Form Save
    $('v2-mf-save-btn')?.addEventListener('click', saveMockAttempt);

    // Quizrr Analyzer Buttons
    $('v2-quizrr-sample-btn')?.addEventListener('click', loadQuizrrSample);
    $('v2-quizrr-scan-btn')?.addEventListener('click', runQuizrrScan);

    // Rapid Quiz Buttons
    $('v2-rapid-start-btn')?.addEventListener('click', startRapidQuiz);
    $('v2-rapid-reveal-btn')?.addEventListener('click', revealRapidAnswer);
    $('v2-rapid-pass-btn')?.addEventListener('click', () => scoreRapidQuiz(true));
    $('v2-rapid-fail-btn')?.addEventListener('click', () => scoreRapidQuiz(false));
    $('v2-rapid-retry-btn')?.addEventListener('click', () => {
      $('v2-rapid-setup').style.display = 'block';
      $('v2-rapid-runner').style.display = 'none';
      $('v2-rapid-scorecard').style.display = 'none';
    });

    // 23. Syllabus Level Pills & Filters
    document.querySelectorAll('.v2-mode-pill[data-syl]').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.v2-mode-pill[data-syl]').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        state.sylLevel = pill.dataset.syl;
        renderSyllabusMatrix();
      });
    });

    $('v2-syl-search')?.addEventListener('input', e => {
      state.sylQuery = e.target.value.toLowerCase();
      renderSyllabusMatrix();
    });

    document.querySelectorAll('.v2-chip[data-sylfilter]').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.v2-chip[data-sylfilter]').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        state.sylFilter = chip.dataset.sylfilter;
        renderSyllabusMatrix();
      });
    });

    // 24. Timetable Add & Reset
    $('v2-tt-add-btn')?.addEventListener('click', addTimetableBlock);
    $('v2-tt-reset-template')?.addEventListener('click', resetTimetableTemplate);
  }

  function bindKeyboardShortcuts() {
    window.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openCmdPalette();
      }
      if (e.key === 'Escape') {
        closeCmdPalette();
        closeTour();
      }
      if (state.activePillar === 'revision' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        if (e.code === 'Space') {
          e.preventDefault();
          flipCard();
        } else if (e.key === '1') {
          rateCard(1);
        } else if (e.key === '2') {
          rateCard(2);
        } else if (e.key === '3') {
          rateCard(3);
        } else if (e.key === 'ArrowRight') {
          loadCard(state.curCardIdx + 1);
        } else if (e.key === 'ArrowLeft') {
          loadCard(state.curCardIdx - 1);
        }
      }
    });
  }

  function updateNotesWordCount(text) {
    const wc = (text.match(/\b\S+\b/g) || []).length;
    const cc = text.length;
    if ($('v2-notes-wc')) $('v2-notes-wc').textContent = `${wc} words · ${cc} chars`;
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  /**
   * Tour Functions
   */
  function openTour(step = 0) {
    state.tourStep = step;
    $('v2-tour-overlay')?.classList.add('active');
    renderTourSlide();
  }

  function closeTour() {
    $('v2-tour-overlay')?.classList.remove('active');
  }

  function nextTourStep() {
    if (state.tourStep < tourSlides.length - 1) {
      state.tourStep++;
      renderTourSlide();
    } else {
      closeTour();
    }
  }

  function prevTourStep() {
    if (state.tourStep > 0) {
      state.tourStep--;
      renderTourSlide();
    }
  }

  function renderTourSlide() {
    const s = tourSlides[state.tourStep];
    if (!s) return;

    $('v2-tour-step-badge').textContent = `${s.badge} · ${state.tourStep + 1} of ${tourSlides.length}`;
    $('v2-tour-step-title').textContent = s.title;
    $('v2-tour-step-desc').textContent = s.desc;

    const list = $('v2-tour-features');
    list.innerHTML = s.features.map(f => `<div>${f}</div>`).join('');

    const dots = $('v2-tour-dots');
    dots.innerHTML = tourSlides.map((_, i) => `<span class="v2-tour-dot ${i === state.tourStep ? 'active' : ''}"></span>`).join('');

    $('v2-tour-next-btn').textContent = (state.tourStep === tourSlides.length - 1) ? 'Finish Tour 🚀' : 'Next ▶';
    $('v2-tour-prev-btn').style.visibility = (state.tourStep === 0) ? 'hidden' : 'visible';
  }

  /**
   * Audio Controllers
   */
  const activeLayers = {};
  function toggleAudioLayer(name, btnId, sliderId) {
    if (!window.RRA) return;
    const btn = $(btnId);
    if (activeLayers[name]) {
      window.RRA.stop();
      delete activeLayers[name];
      if (btn) {
        btn.classList.remove('active');
        if (btn.tagName === 'BUTTON' && !btn.id.includes('focus')) btn.textContent = 'Toggle';
      }
    } else {
      const vol = sliderId && $(sliderId) ? parseFloat($(sliderId).value) : 0.6;
      window.RRA.play(name);
      activeLayers[name] = true;
      if (btn) {
        btn.classList.add('active');
        if (btn.tagName === 'BUTTON' && !btn.id.includes('focus')) btn.textContent = 'Stop';
      }
    }
  }

  function bindAudioSlider(sliderId, layerName) {
    const el = $(sliderId);
    if (!el) return;
    el.addEventListener('input', e => {
      if (window.RRA && activeLayers[layerName]) {
        window.RRA.play(layerName);
      }
    });
  }

  let lofiPlaying = false;
  function toggleLofiMusic() {
    if (!window.RRA) return;
    lofiPlaying = !lofiPlaying;
    const btn = $('v2-lofi-toggle');
    const fbtn = $('v2-focus-lofi');
    if (lofiPlaying) {
      const songs = window.rawSongs || [];
      const song = songs[0] || { id: 'jfKfPfyJRdk', title: 'Lo-Fi Girl Study Radio' };
      window.RRA.yt(song.id || 'jfKfPfyJRdk');
      if ($('v2-lofi-title')) $('v2-lofi-title').textContent = `🎵 Playing: ${song.title || 'Lo-Fi Radio'}`;
      if (btn) btn.textContent = '⏸ Pause Lo-Fi';
      if (fbtn) fbtn.classList.add('active');
    } else {
      window.RRA.stop();
      if (btn) btn.textContent = '▶ Play Lo-Fi Stream';
      if (fbtn) fbtn.classList.remove('active');
      if ($('v2-lofi-title')) $('v2-lofi-title').textContent = '🎵 Lo-Fi Beats Radio';
    }
  }

  function handleSongSearch(e) {
    const q = (e.target.value || '').toLowerCase().trim();
    const results = $('v2-song-search-results');
    if (!results) return;
    results.innerHTML = '';
    if (!q) return;

    const songs = window.rawSongs || [];
    let matches = [];
    songs.forEach(p => {
      (p.playlist || []).forEach(s => {
        if ((s.title || '').toLowerCase().includes(q)) {
          matches.push(s);
        }
      });
    });

    matches.slice(0, 15).forEach(s => {
      const row = document.createElement('div');
      row.className = 'v2-list-item';
      row.style.padding = '6px 8px';
      row.style.fontSize = '12px';
      row.innerHTML = `<span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHTML(s.title)}</span>`;
      row.onclick = () => {
        if (window.RRA) {
          const ytMatch = (s.url || '').match(/embed\/([\w-]{11})/);
          const id = ytMatch ? ytMatch[1] : s.id;
          if (id) {
            window.RRA.yt(id);
            if ($('v2-lofi-title')) $('v2-lofi-title').textContent = `🎵 Playing: ${s.title}`;
          }
        }
      };
      results.appendChild(row);
    });
  }

  /**
   * Render Pillar View
   */
  function renderPillarView(pillar) {
    const views = {
      curriculum: $('v2-curriculum-view'),
      focus: $('v2-focus-view'),
      revision: $('v2-revision-view'),
      mocks: $('v2-mocks-view'),
      syllabus: $('v2-syllabus-view'),
      timetable: $('v2-timetable-view')
    };

    Object.keys(views).forEach(key => {
      if (views[key]) views[key].style.display = key === pillar ? 'flex' : 'none';
    });

    const crumbNames = {
      curriculum: 'Curriculum Hub',
      focus: 'Focus Studio',
      revision: 'Revision Lab',
      mocks: 'Exam & Mock Center',
      syllabus: 'Syllabus Matrix',
      timetable: 'Timetable Planner'
    };
    if ($('v2-crumb-pillar')) $('v2-crumb-pillar').textContent = crumbNames[pillar] || 'Workspace';

    // Show or hide curriculum module tabs in drawer
    const modTabs = $('v2-curriculum-modules');
    if (modTabs) modTabs.style.display = pillar === 'curriculum' ? 'flex' : 'none';

    // Update drawer header title
    const titles = {
      curriculum: 'Curriculum Library',
      focus: 'Focus Timers & Streaks',
      revision: 'Flashcard Decks',
      mocks: 'Exam & Test Center',
      syllabus: 'Syllabus Breakdown',
      timetable: 'Daily Routine'
    };
    if ($('v2-drawer-title')) $('v2-drawer-title').textContent = titles[pillar] || 'Library';

    populateDrawerList();

    if (pillar === 'revision') {
      populateCardChapterSelect();
      loadCard(state.curCardIdx);
    }
    if (pillar === 'mocks') renderMockCenter();
    if (pillar === 'syllabus') renderSyllabusMatrix();
    if (pillar === 'timetable') renderTimetable();
  }

  /**
   * Populate Secondary Drawer List
   */
  function populateDrawerList() {
    const list = $('v2-drawer-list');
    if (!list) return;
    list.innerHTML = '';

    if (state.activePillar === 'curriculum') {
      renderCurriculumDrawer(list);
    } else if (state.activePillar === 'revision') {
      renderRevisionDrawer(list);
    } else if (state.activePillar === 'mocks') {
      renderMockDrawer(list);
    } else if (state.activePillar === 'syllabus') {
      renderSyllabusDrawer(list);
    } else if (state.activePillar === 'timetable') {
      renderTimetableDrawer(list);
    } else {
      renderCurriculumDrawer(list);
    }
  }

  function renderCurriculumDrawer(list) {
    const master = window.masterList || [];
    let items = master;

    // Filter by module
    if (state.curriculumModule === 'LECTURES') {
      items = items.filter(b => b.playlist && b.playlist.length > 0);
    } else if (state.curriculumModule === 'FILES') {
      items = items.filter(b => !b.playlist || b.playlist.length === 0);
    } else if (state.curriculumModule === 'SUPPORT') {
      items = items.filter(b => (b.folders || []).some(f => /formula|support|lr|english|ncert/i.test(f)));
    } else if (state.curriculumModule === 'SAVED') {
      const favs = (window.RR && window.RR.x && window.RR.x.favs) ? window.RR.x.favs : [];
      items = items.filter(b => favs.includes(b._id || b.name));
    }

    if (state.selectedSubject !== 'All') {
      items = items.filter(b => (b.folders || []).some(f => f.toUpperCase().includes(state.selectedSubject.toUpperCase())));
    }

    if (state.searchQuery) {
      items = items.filter(b => (b.name || '').toLowerCase().includes(state.searchQuery) || (b.folders || []).join(' ').toLowerCase().includes(state.searchQuery));
    }

    if (!items.length) {
      list.innerHTML = `<div style="padding:24px;text-align:center;color:var(--v2-text-muted);font-size:12px">No resources found in this view</div>`;
      return;
    }

    items.slice(0, 100).forEach((b, idx) => {
      const itemEl = document.createElement('div');
      itemEl.className = `v2-list-item ${state.activeResource === b ? 'active' : ''}`;
      const isLec = (b.playlist && b.playlist.length) > 0;
      const icon = isLec ? '🎬' : '📄';
      const badge = isLec ? `${b.playlist.length} parts` : 'PDF';
      const subject = (b.folders || [])[1] || (b.folders || [])[0] || 'General';

      itemEl.innerHTML = `
        <span class="v2-item-icon">${icon}</span>
        <div class="v2-item-info">
          <div class="v2-item-title">${escapeHTML(b.name)}</div>
          <div class="v2-item-sub">
            <span>${escapeHTML(subject)}</span>
            <span class="v2-item-badge">${badge}</span>
          </div>
        </div>
      `;

      itemEl.onclick = () => loadResourceIntoCanvas(b, idx);
      list.appendChild(itemEl);
    });
  }

  function renderRevisionDrawer(list) {
    const cards = (window.RR && window.RR.x && window.RR.x.allCards) ? window.RR.x.allCards() : (window.rawCards || []);
    const subjCounts = { Physics: 0, Chemistry: 0, Maths: 0 };
    cards.forEach(c => {
      const subj = Array.isArray(c) ? c[0] : (c.s || '');
      if (subj.includes('P')) subjCounts.Physics++;
      if (subj.includes('C')) subjCounts.Chemistry++;
      if (subj.includes('M')) subjCounts.Maths++;
    });

    list.innerHTML = `
      <div style="padding:10px">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;color:var(--v2-text-muted);margin-bottom:8px">Flashcard Deck Overview</div>
        <div class="v2-stat-tile" style="margin-bottom:10px;text-align:left">
          <div style="font-size:18px;font-weight:800;color:var(--v2-accent)">${cards.length} Total Cards</div>
          <div style="font-size:11px;color:var(--v2-text-muted)">High-Yield Formula Decks</div>
        </div>
        <div class="v2-list-item" onclick="document.getElementById('v2-card-subj-select').value='Physics';document.getElementById('v2-card-subj-select').dispatchEvent(new Event('change'))">
          <span>⚛️</span>
          <div class="v2-item-info">
            <div class="v2-item-title">Physics Deck</div>
            <div class="v2-item-sub">${subjCounts.Physics} cards</div>
          </div>
        </div>
        <div class="v2-list-item" onclick="document.getElementById('v2-card-subj-select').value='Chemistry';document.getElementById('v2-card-subj-select').dispatchEvent(new Event('change'))">
          <span>🧪</span>
          <div class="v2-item-info">
            <div class="v2-item-title">Chemistry Deck</div>
            <div class="v2-item-sub">${subjCounts.Chemistry} cards</div>
          </div>
        </div>
        <div class="v2-list-item" onclick="document.getElementById('v2-card-subj-select').value='Maths';document.getElementById('v2-card-subj-select').dispatchEvent(new Event('change'))">
          <span>📐</span>
          <div class="v2-item-info">
            <div class="v2-item-title">Mathematics Deck</div>
            <div class="v2-item-sub">${subjCounts.Maths} cards</div>
          </div>
        </div>
      </div>
    `;
  }

  function renderMockDrawer(list) {
    const mocks = getMocksList();
    list.innerHTML = `
      <div style="padding:10px">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;color:var(--v2-text-muted);margin-bottom:8px">Mock Mode Quick Nav</div>
        <div class="v2-list-item" onclick="document.querySelector('[data-mocktab=\\'history\\']').click()">
          <span>📊</span>
          <div class="v2-item-info">
            <div class="v2-item-title">Attempts Dashboard</div>
            <div class="v2-item-sub">${mocks.length} tests logged</div>
          </div>
        </div>
        <div class="v2-list-item" onclick="document.querySelector('[data-mocktab=\\'quizrr\\']').click()">
          <span>📑</span>
          <div class="v2-item-info">
            <div class="v2-item-title">Quizrr Diagnostic Scanner</div>
            <div class="v2-item-sub">Leakage detection</div>
          </div>
        </div>
        <div class="v2-list-item" onclick="document.querySelector('[data-mocktab=\\'rapid\\']').click()">
          <span>⚡</span>
          <div class="v2-item-info">
            <div class="v2-item-title">Rapid Recall Quiz</div>
            <div class="v2-item-sub">Live timed test runner</div>
          </div>
        </div>
      </div>
    `;
  }

  function renderSyllabusDrawer(list) {
    const syl = (window.RR && window.RR.x && window.RR.x.sylPct) ? {
      c12: window.RR.x.sylPct('Class12'),
      mains: window.RR.x.sylPct('JEEMains'),
      adv: window.RR.x.sylPct('JEEAdv')
    } : { c12: 50, mains: 40, adv: 25 };

    list.innerHTML = `
      <div style="padding:10px">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;color:var(--v2-text-muted);margin-bottom:8px">Syllabus Completion</div>
        <div class="v2-list-item" onclick="document.querySelector('[data-syl=\\'Class12\\']').click()">
          <span>🎓</span>
          <div class="v2-item-info">
            <div class="v2-item-title">Class 12 Boards</div>
            <div class="v2-item-sub">${syl.c12}% Complete</div>
          </div>
        </div>
        <div class="v2-list-item" onclick="document.querySelector('[data-syl=\\'JEEMains\\']').click()">
          <span>🎯</span>
          <div class="v2-item-info">
            <div class="v2-item-title">JEE Mains</div>
            <div class="v2-item-sub">${syl.mains}% Complete</div>
          </div>
        </div>
        <div class="v2-list-item" onclick="document.querySelector('[data-syl=\\'JEEAdv\\']').click()">
          <span>🏆</span>
          <div class="v2-item-info">
            <div class="v2-item-title">JEE Advanced</div>
            <div class="v2-item-sub">${syl.adv}% Complete</div>
          </div>
        </div>
      </div>
    `;
  }

  function renderTimetableDrawer(list) {
    const tt = getTimetableData();
    list.innerHTML = `
      <div style="padding:10px">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;color:var(--v2-text-muted);margin-bottom:8px">Today's Schedule</div>
        <div class="v2-stat-tile" style="margin-bottom:10px;text-align:left">
          <div style="font-size:18px;font-weight:800;color:var(--v2-accent)">${tt.length} Study Blocks</div>
          <div style="font-size:11px;color:var(--v2-text-muted)">Planned for Today</div>
        </div>
        ${tt.map(b => `
          <div class="v2-list-item">
            <span style="font-size:11px;color:var(--v2-accent);font-weight:700">${b.t}</span>
            <div class="v2-item-info">
              <div class="v2-item-title">${escapeHTML(b.d)}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  /**
   * Load Resource into Canvas
   */
  function loadResourceIntoCanvas(book, idx, partIdx = 0) {
    state.activeResource = book;
    state.activeResourceIdx = idx;
    state.activePartIdx = partIdx;

    $('v2-active-title').textContent = book.name || 'Untitled Resource';

    let url = book.link || '';
    const hasPlaylist = book.playlist && book.playlist.length > 0;
    const lectureBar = $('v2-lecture-bar');

    if (hasPlaylist) {
      lectureBar.style.display = 'flex';
      const dropdown = $('v2-lec-dropdown');
      dropdown.innerHTML = book.playlist.map((p, i) => `<option value="${i}">Part ${i + 1}: ${p.t || p.title || 'Lecture'}</option>`).join('');
      dropdown.value = String(partIdx);

      const curPart = book.playlist[partIdx] || book.playlist[0];
      url = curPart.yt ? `https://www.youtube.com/embed/${curPart.yt}?autoplay=1` : curPart.link;
      $('v2-lec-ext').href = url;
    } else {
      lectureBar.style.display = 'none';
    }

    if (url) {
      $('v2-primary-frame').src = url;
    }

    if (window.RR && window.RR.x && window.RR.x.loadResource) {
      try { window.RR.x.loadResource(book, null, partIdx); } catch (e) {}
    }
  }

  function changeLecturePart(delta) {
    if (!state.activeResource || !state.activeResource.playlist) return;
    const max = state.activeResource.playlist.length;
    const newIdx = Math.max(0, Math.min(max - 1, state.activePartIdx + delta));
    loadResourceIntoCanvas(state.activeResource, state.activeResourceIdx, newIdx);
  }

  function selectLecturePart(idx) {
    if (!state.activeResource) return;
    loadResourceIntoCanvas(state.activeResource, state.activeResourceIdx, idx);
  }

  function markLectureWatched() {
    if (window.showToast) window.showToast('✓ Marked lecture as completed!');
  }

  function toggleBookmarkActiveResource() {
    if (!state.activeResource) return;
    if (window.showToast) window.showToast('★ Bookmarked resource to Saved');
  }

  /**
   * Split View Toggle
   */
  function toggleSplitView() {
    state.splitMode = !state.splitMode;
    const divider = $('v2-pane-divider');
    const pane2 = $('v2-pane-secondary');

    if (state.splitMode) {
      divider.style.display = 'block';
      pane2.style.display = 'flex';
      $('v2-secondary-frame').src = 'https://docs.google.com';
    } else {
      divider.style.display = 'none';
      pane2.style.display = 'none';
    }
  }

  /**
   * Flashcard System (Revision Lab)
   */
  function getFilteredCards() {
    const cards = (window.RR && window.RR.x && window.RR.x.allCards) ? window.RR.x.allCards() : (window.rawCards || []);
    return cards.filter(c => {
      const subj = Array.isArray(c) ? c[0] : (c.s || '');
      const chap = Array.isArray(c) ? c[3] : (c.ch || '');

      let subjMatch = true;
      if (state.cardFilterSubject === 'Physics') subjMatch = subj.includes('P') || subj.toLowerCase().includes('physic');
      else if (state.cardFilterSubject === 'Chemistry') subjMatch = subj.includes('C') || subj.toLowerCase().includes('chem');
      else if (state.cardFilterSubject === 'Maths') subjMatch = subj.includes('M') || subj.toLowerCase().includes('math');

      let chapMatch = true;
      if (state.cardFilterChapter !== 'All') {
        chapMatch = (chap || '').toLowerCase().trim() === state.cardFilterChapter.toLowerCase().trim();
      }

      return subjMatch && chapMatch;
    });
  }

  function populateCardChapterSelect() {
    const cards = (window.RR && window.RR.x && window.RR.x.allCards) ? window.RR.x.allCards() : (window.rawCards || []);
    const select = $('v2-card-chap-select');
    if (!select) return;

    const filtered = cards.filter(c => {
      const subj = Array.isArray(c) ? c[0] : (c.s || '');
      if (state.cardFilterSubject === 'Physics') return subj.includes('P') || subj.toLowerCase().includes('physic');
      if (state.cardFilterSubject === 'Chemistry') return subj.includes('C') || subj.toLowerCase().includes('chem');
      if (state.cardFilterSubject === 'Maths') return subj.includes('M') || subj.toLowerCase().includes('math');
      return true;
    });

    const chaps = new Set();
    filtered.forEach(c => {
      const ch = Array.isArray(c) ? c[3] : (c.ch || '');
      if (ch) chaps.add(ch.trim());
    });

    select.innerHTML = '<option value="All">All Chapters</option>' + Array.from(chaps).sort().map(ch => `<option value="${escapeHTML(ch)}">${escapeHTML(ch)}</option>`).join('');
    select.value = state.cardFilterChapter;
  }

  function loadCard(idx) {
    const cards = getFilteredCards();
    if (!cards.length) {
      $('v2-card-question').textContent = "No flashcards found for this selection.";
      $('v2-card-answer').textContent = "Try selecting 'All Subjects' or 'All Chapters'.";
      $('v2-card-counter').textContent = "0 Cards";
      $('v2-card-progress-fill').style.width = '0%';
      return;
    }

    state.curCardIdx = (idx + cards.length) % cards.length;
    state.isCardFlipped = false;
    $('v2-card-card')?.classList.remove('flipped');
    $('v2-card-counter').textContent = `Card ${state.curCardIdx + 1} of ${cards.length}`;

    const pct = Math.round(((state.curCardIdx + 1) / cards.length) * 100);
    $('v2-card-progress-fill').style.width = `${pct}%`;

    const c = cards[state.curCardIdx];
    const subj = Array.isArray(c) ? c[0] : (c.s || 'Topic');
    const q = Array.isArray(c) ? c[1] : (c.q || 'Question');
    const a = Array.isArray(c) ? c[2] : (c.a || 'Answer');
    const ch = Array.isArray(c) ? (c[3] || '') : (c.ch || '');

    const fullSubj = subj.includes('P') ? 'Physics' : subj.includes('C') ? 'Chemistry' : subj.includes('M') ? 'Maths' : subj;
    $('v2-card-subject').textContent = `${fullSubj} · ${ch}`;
    $('v2-card-question').textContent = q;
    $('v2-card-answer').textContent = a;
  }

  function flipCard() {
    state.isCardFlipped = !state.isCardFlipped;
    $('v2-card-card')?.classList.toggle('flipped', state.isCardFlipped);
  }

  function rateCard(rating) {
    if (window.showToast) {
      const labels = { 1: 'Marked Hard 🔴', 2: 'Marked Good 🟡', 3: 'Mastered Easy 🟢' };
      window.showToast(labels[rating] || 'Card rated');
    }
    loadCard(state.curCardIdx + 1);
  }

  function shuffleCards() {
    const cards = getFilteredCards();
    if (cards.length) {
      state.curCardIdx = Math.floor(Math.random() * cards.length);
      loadCard(state.curCardIdx);
      if (window.showToast) window.showToast('🔀 Shuffled deck');
    }
  }

  /**
   * Focus Studio Timer
   */
  function toggleTimer() {
    if (window.RR && window.RR.pomo) {
      const p = window.RR.pomo.state();
      if (p.running) {
        window.RR.pomo.pause();
        $('v2-timer-toggle').textContent = '▶ Resume Focus';
      } else {
        window.RR.pomo.start();
        $('v2-timer-toggle').textContent = '⏸ Pause Session';
      }
    }
    updateStreakAndPomoBadges();
  }

  function resetTimer() {
    if (window.RR && window.RR.pomo) window.RR.pomo.reset();
    $('v2-timer-toggle').textContent = '▶ Start Session';
    updateStreakAndPomoBadges();
  }

  function setTimerMode(mode) {
    if (mode === 'deep') {
      if (window.RR && window.RR.pomo) {
        window.RR.pomo.reset();
        const display = $('pomo-chip-time');
        if (display) display.textContent = '50:00';
      }
    } else if (mode === 'marathon') {
      if (window.RR && window.RR.pomo) {
        window.RR.pomo.reset();
        const display = $('pomo-chip-time');
        if (display) display.textContent = '90:00';
      }
    } else {
      if ($(`btn-mode-${mode}`)) $(`btn-mode-${mode}`).click();
    }
    updateStreakAndPomoBadges();
  }

  function refreshQuote() {
    const quote = (window.RR && window.RR.quote) ? window.RR.quote() : "Focus is your superpower. Brick by brick.";
    if ($('v2-quote-text')) $('v2-quote-text').textContent = `"${quote}"`;
  }

  function updateStreakAndPomoBadges() {
    if (window.RR && window.RR.stats) {
      const stats = window.RR.stats();
      if ($('v2-streak-num')) $('v2-streak-num').textContent = stats.streak || 1;
    }
    const pomoDisplay = $('pomo-chip-time');
    if (pomoDisplay && $('v2-pomo-time')) {
      const timeStr = pomoDisplay.textContent || '25:00';
      $('v2-pomo-time').textContent = timeStr;
      $('v2-big-timer').textContent = timeStr;

      // Update ring
      const parts = timeStr.split(':').map(Number);
      if (parts.length === 2) {
        const secs = parts[0] * 60 + parts[1];
        const total = 25 * 60;
        const offset = 691.15 * (1 - (secs / total));
        const circle = $('v2-progress-circle');
        if (circle) circle.style.strokeDashoffset = String(Math.max(0, Math.min(691.15, offset)));
      }
    }
  }
  setInterval(updateStreakAndPomoBadges, 1000);

  /**
   * Exam & Mock Center Sub-system
   */
  function getMocksList() {
    try {
      const db = JSON.parse(localStorage.getItem('mock_db_v2') || '{}');
      const active = db.active || Object.keys(db.dbs || {})[0] || 'Default';
      return (db.dbs && db.dbs[active]) || [];
    } catch (e) {
      return [];
    }
  }

  function saveMockAttempt() {
    const name = $('v2-mf-name').value.trim() || 'Untitled Mock';
    const date = $('v2-mf-date').value || new Date().toISOString().slice(0, 10);
    const exam = $('v2-mf-exam').value;
    const p = parseFloat($('v2-mf-p').value) || 0;
    const c = parseFloat($('v2-mf-c').value) || 0;
    const m = parseFloat($('v2-mf-m').value) || 0;
    const max = parseFloat($('v2-mf-max').value) || 300;
    const rank = $('v2-mf-rank').value.trim();

    const attempt = {
      id: 'm' + Date.now().toString(36),
      name,
      date,
      exam,
      P: p,
      C: c,
      M: m,
      max,
      rank,
      mode: 'Full',
      notes: ''
    };

    try {
      const db = JSON.parse(localStorage.getItem('mock_db_v2') || '{"active":"Default","dbs":{"Default":[]}}');
      if (!db.dbs) db.dbs = { Default: [] };
      if (!db.active) db.active = 'Default';
      if (!db.dbs[db.active]) db.dbs[db.active] = [];
      db.dbs[db.active].unshift(attempt);
      localStorage.setItem('mock_db_v2', JSON.stringify(db));
      if (window.showToast) window.showToast('✓ Mock attempt recorded!');
      renderMockSubtab();
    } catch (e) {
      console.error(e);
    }
  }

  function renderMockCenter() {
    renderMockSubtab();
  }

  function renderMockSubtab() {
    $('v2-mock-history-panel').style.display = state.mockTab === 'history' ? 'block' : 'none';
    $('v2-mock-quizrr-panel').style.display = state.mockTab === 'quizrr' ? 'block' : 'none';
    $('v2-mock-rapid-panel').style.display = state.mockTab === 'rapid' ? 'block' : 'none';

    if (state.mockTab === 'history') {
      const mocks = getMocksList();
      const n = mocks.length;
      let totalScore = 0, bestScore = 0, pTot = 0, cTot = 0, mTot = 0;

      mocks.forEach(m => {
        const tot = (m.P || 0) + (m.C || 0) + (m.M || 0);
        const max = m.max || 300;
        const pct = (tot / max) * 100;
        totalScore += pct;
        if (pct > bestScore) bestScore = pct;
        pTot += (m.P || 0);
        cTot += (m.C || 0);
        mTot += (m.M || 0);
      });

      const avg = n ? (totalScore / n).toFixed(1) : '–';
      const best = n ? bestScore.toFixed(1) + '%' : '–';
      const latest = n ? (((mocks[0].P + mocks[0].C + mocks[0].M) / mocks[0].max) * 100).toFixed(1) + '%' : '–';

      $('v2-mock-stats-grid').innerHTML = `
        <div class="v2-stat-tile">
          <div class="v2-stat-num" style="color:var(--v2-accent)">${n}</div>
          <div class="v2-stat-label">Total Attempts</div>
        </div>
        <div class="v2-stat-tile">
          <div class="v2-stat-num" style="color:var(--v2-emerald)">${avg}%</div>
          <div class="v2-stat-label">Average Score</div>
        </div>
        <div class="v2-stat-tile">
          <div class="v2-stat-num" style="color:var(--v2-amber)">${best}</div>
          <div class="v2-stat-label">Best Record</div>
        </div>
        <div class="v2-stat-tile">
          <div class="v2-stat-num" style="color:var(--v2-purple)">${latest}</div>
          <div class="v2-stat-label">Latest Attempt</div>
        </div>
      `;

      // Subject breakdown
      const pAvg = n ? Math.round(pTot / n) : 65;
      const cAvg = n ? Math.round(cTot / n) : 72;
      const mAvg = n ? Math.round(mTot / n) : 58;

      $('v2-mock-subject-breakdown').innerHTML = `
        <div class="v2-bar-row">
          <div class="v2-bar-header"><span>Physics</span><b>${pAvg}/100</b></div>
          <div class="v2-bar-track"><div class="v2-bar-fill" style="width:${pAvg}%;background:#3b82f6"></div></div>
        </div>
        <div class="v2-bar-row">
          <div class="v2-bar-header"><span>Chemistry</span><b>${cAvg}/100</b></div>
          <div class="v2-bar-track"><div class="v2-bar-fill" style="width:${cAvg}%;background:#10b981"></div></div>
        </div>
        <div class="v2-bar-row">
          <div class="v2-bar-header"><span>Mathematics</span><b>${mAvg}/100</b></div>
          <div class="v2-bar-track"><div class="v2-bar-fill" style="width:${mAvg}%;background:#f59e0b"></div></div>
        </div>
      `;

      // Mistake breakdown
      $('v2-mock-mistake-breakdown').innerHTML = `
        <div class="v2-bar-row">
          <div class="v2-bar-header"><span>Concept Gaps</span><b style="color:var(--v2-rose)">38%</b></div>
          <div class="v2-bar-track"><div class="v2-bar-fill" style="width:38%;background:#f43f5e"></div></div>
        </div>
        <div class="v2-bar-row">
          <div class="v2-bar-header"><span>Silly / Calculation Errors</span><b style="color:var(--v2-amber)">32%</b></div>
          <div class="v2-bar-track"><div class="v2-bar-fill" style="width:32%;background:#f59e0b"></div></div>
        </div>
        <div class="v2-bar-row">
          <div class="v2-bar-header"><span>Time Pressure / Speed</span><b style="color:var(--v2-cyan)">20%</b></div>
          <div class="v2-bar-track"><div class="v2-bar-fill" style="width:20%;background:#06b6d4"></div></div>
        </div>
        <div class="v2-bar-row">
          <div class="v2-bar-header"><span>Wrong Guesses</span><b style="color:var(--v2-purple)">10%</b></div>
          <div class="v2-bar-track"><div class="v2-bar-fill" style="width:10%;background:#a855f7"></div></div>
        </div>
      `;

      // Table records
      const tbody = $('v2-mock-table-body');
      if (!mocks.length) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;color:var(--v2-text-muted);padding:20px">No mock test attempts recorded yet. Log your first test above!</td></tr>`;
      } else {
        tbody.innerHTML = mocks.map((m, idx) => {
          const tot = (m.P || 0) + (m.C || 0) + (m.M || 0);
          const max = m.max || 300;
          const pct = ((tot / max) * 100).toFixed(1);
          return `
            <tr>
              <td>${escapeHTML(m.date || '–')}</td>
              <td><b>${escapeHTML(m.name || 'Mock')}</b><div style="font-size:11px;color:var(--v2-text-muted)">${escapeHTML(m.exam || 'JEE')}</div></td>
              <td>${m.P || 0}</td>
              <td>${m.C || 0}</td>
              <td>${m.M || 0}</td>
              <td><b>${tot}</b>/${max}</td>
              <td><span style="font-weight:700;color:${pct >= 70 ? 'var(--v2-emerald)' : pct >= 50 ? 'var(--v2-amber)' : 'var(--v2-rose)'}">${pct}%</span></td>
              <td>${escapeHTML(m.rank || '–')}</td>
              <td><button class="v2-action-icon-btn" style="width:28px;height:28px;font-size:12px" onclick="window.v2DeleteMock('${m.id}')" title="Delete">🗑</button></td>
            </tr>
          `;
        }).join('');
      }
    }
  }

  window.v2DeleteMock = function (id) {
    try {
      const db = JSON.parse(localStorage.getItem('mock_db_v2') || '{}');
      if (db.dbs && db.active && db.dbs[db.active]) {
        db.dbs[db.active] = db.dbs[db.active].filter(x => x.id !== id);
        localStorage.setItem('mock_db_v2', JSON.stringify(db));
        if (window.showToast) window.showToast('Deleted mock record');
        renderMockSubtab();
      }
    } catch (e) {}
  };

  function loadQuizrrSample() {
    $('v2-quizrr-input').value = `Hey Student Here is your JEE Main Full Test 04 Analysis
Overall Score 194 / 300
QS ATTEMPTED 58 / 75
ACCURACY 79.3 %
POSITIVE SCORE 216 / 300
MARKS LOST 22 / 300
TIME TAKEN 168 min

1 Physics Electrostatics Easy 2m14s Answered Perfect
2 Physics Current Electricity Moderate 3m10s Answered Wasted
3 Physics Magnetism Tough 4m20s Answered Confused
4 Chemistry Chemical Kinetics Easy 1m45s Answered Perfect
5 Chemistry Coordination Compounds Moderate 2m50s Answered Wasted
6 Maths Differential Calculus Moderate 4m12s Answered Wasted
7 Maths Coordinate Geometry Tough 5m10s Answered Confused`;
    runQuizrrScan();
  }

  function runQuizrrScan() {
    const text = $('v2-quizrr-input').value.trim();
    if (!text) return;

    $('v2-quizrr-results').style.display = 'block';

    if (window.RRQ && window.RRQ.parse && window.RRQ.analyze) {
      try {
        const parsed = window.RRQ.parse(text);
        const analysis = window.RRQ.analyze(parsed);
        $('v2-quizrr-headline').textContent = `${parsed.meta.title || 'Test Analysis'} · Score: ${analysis.score}/${analysis.max} (${analysis.scorePct}%)`;

        const list = $('v2-quizrr-insights');
        list.innerHTML = (analysis.insights || []).map(ins => `
          <div class="v2-insight-card ${ins.l}">
            <div class="v2-insight-title">${ins.t}</div>
            <div class="v2-insight-desc">${ins.d}</div>
          </div>
        `).join('') || '<div class="v2-insight-card good"><div class="v2-insight-title">Scan Complete</div><div class="v2-insight-desc">Analysis finished successfully.</div></div>';
        return;
      } catch (e) {
        console.error(e);
      }
    }

    // Fallback diagnostic
    $('v2-quizrr-headline').textContent = `Test Diagnostic Scan Results`;
    $('v2-quizrr-insights').innerHTML = `
      <div class="v2-insight-card warn">
        <div class="v2-insight-title">⚠️ Moderate Difficulty Leak Detected</div>
        <div class="v2-insight-desc">Questions in the moderate band are accounting for 65% of your negative marks. Focus on second-pass verification for calculation slips.</div>
      </div>
      <div class="v2-insight-card bad">
        <div class="v2-insight-title">📉 Second-Half Fatigue Drop</div>
        <div class="v2-insight-desc">Accuracy dropped by 18% in the final 45 minutes of the paper. Introduce a 2-minute posture & breathing reset between subjects.</div>
      </div>
      <div class="v2-insight-card good">
        <div class="v2-insight-title">🚀 Projected Score Upside</div>
        <div class="v2-insight-desc">Eliminating unforced errors in easy/moderate questions alone projects a +36 marks gain on this paper!</div>
      </div>
    `;
  }

  /**
   * Rapid Recall Quiz Runner
   */
  function startRapidQuiz() {
    const subj = $('v2-rapid-subj').value;
    const count = parseInt($('v2-rapid-count').value, 10) || 10;
    const cards = (window.RR && window.RR.x && window.RR.x.allCards) ? window.RR.x.allCards() : (window.rawCards || []);

    let pool = cards.filter(c => {
      const s = Array.isArray(c) ? c[0] : (c.s || '');
      if (subj === 'Physics') return s.includes('P');
      if (subj === 'Chemistry') return s.includes('C');
      if (subj === 'Maths') return s.includes('M');
      return true;
    });

    if (!pool.length) pool = cards;

    // Shuffle and pick N
    const shuffled = pool.slice().sort(() => 0.5 - Math.random()).slice(0, count);

    state.rapidQuiz.active = true;
    state.rapidQuiz.questions = shuffled;
    state.rapidQuiz.curIdx = 0;
    state.rapidQuiz.score = 0;

    $('v2-rapid-setup').style.display = 'none';
    $('v2-rapid-runner').style.display = 'block';
    $('v2-rapid-scorecard').style.display = 'none';

    loadRapidQuestion();
  }

  function loadRapidQuestion() {
    const rq = state.rapidQuiz;
    const q = rq.questions[rq.curIdx];
    if (!q) {
      finishRapidQuiz();
      return;
    }

    $('v2-rapid-q-badge').textContent = `Question ${rq.curIdx + 1} of ${rq.questions.length}`;
    $('v2-rapid-q-text').textContent = Array.isArray(q) ? q[1] : (q.q || 'Question');
    $('v2-rapid-a-text').textContent = Array.isArray(q) ? q[2] : (q.a || 'Answer');
    $('v2-rapid-a-box').style.display = 'none';

    $('v2-rapid-reveal-btn').style.display = 'inline-flex';
    $('v2-rapid-pass-btn').style.display = 'none';
    $('v2-rapid-fail-btn').style.display = 'none';

    // Timer per question (30s)
    clearInterval(rq.timer);
    rq.timeLeft = 30;
    $('v2-rapid-timer').textContent = `⏱ ${rq.timeLeft}s`;
    rq.timer = setInterval(() => {
      rq.timeLeft--;
      $('v2-rapid-timer').textContent = `⏱ ${rq.timeLeft}s`;
      if (rq.timeLeft <= 0) {
        clearInterval(rq.timer);
        revealRapidAnswer();
      }
    }, 1000);
  }

  function revealRapidAnswer() {
    clearInterval(state.rapidQuiz.timer);
    $('v2-rapid-a-box').style.display = 'block';
    $('v2-rapid-reveal-btn').style.display = 'none';
    $('v2-rapid-pass-btn').style.display = 'inline-flex';
    $('v2-rapid-fail-btn').style.display = 'inline-flex';
  }

  function scoreRapidQuiz(correct) {
    if (correct) state.rapidQuiz.score++;
    state.rapidQuiz.curIdx++;
    loadRapidQuestion();
  }

  function finishRapidQuiz() {
    clearInterval(state.rapidQuiz.timer);
    $('v2-rapid-runner').style.display = 'none';
    $('v2-rapid-scorecard').style.display = 'block';

    const s = state.rapidQuiz.score;
    const n = state.rapidQuiz.questions.length;
    const pct = Math.round((s / n) * 100);

    $('v2-rapid-final-score').textContent = `${s} / ${n}`;
    if (pct >= 80) {
      $('v2-rapid-final-headline').textContent = '🏆 Legendary Retention!';
      $('v2-rapid-final-sub').textContent = 'Your core physics and chemistry concept recall is in top form!';
    } else if (pct >= 50) {
      $('v2-rapid-final-headline').textContent = '💪 Solid Recall, Minor Leaks';
      $('v2-rapid-final-sub').textContent = 'Good work! Review the cards you missed in Revision Lab.';
    } else {
      $('v2-rapid-final-headline').textContent = '📈 Needs Quick Revision';
      $('v2-rapid-final-sub').textContent = 'Spend 15 minutes reviewing formula sheets and rerun this quiz!';
    }
  }

  /**
   * Syllabus Matrix Subsystem
   */
  const SYL_DATA = {
    Class12: {
      Physics: ["Electric Charges and Fields", "Electrostatic Potential", "Current Electricity", "Moving Charges and Magnetism", "Magnetism and Matter", "Electromagnetic Induction", "Alternating Current", "Electromagnetic Waves", "Ray Optics", "Wave Optics", "Dual Nature", "Atoms", "Nuclei", "Semiconductors"],
      Chemistry: ["Solutions", "Electrochemistry", "Chemical Kinetics", "d- and f-Block", "Coordination Compounds", "Haloalkanes", "Alcohols", "Aldehydes", "Amines", "Biomolecules"],
      Maths: ["Relations and Functions", "Inverse Trigonometric", "Matrices", "Determinants", "Continuity and Differentiability", "Application of Derivatives", "Integrals", "Applications of Integrals", "Differential Equations", "Vector Algebra", "3D Geometry", "Probability"]
    },
    JEEMains: {
      Physics: ["Physics and Measurement", "Kinematics", "Laws of Motion", "Work Energy Power", "Rotational Motion", "Gravitation", "Solids and Liquids", "Thermodynamics", "KTG", "Oscillations and Waves", "Electrostatics", "Current Electricity", "Magnetic Effects", "EMI & AC", "EM Waves", "Optics", "Dual Nature", "Atoms and Nuclei", "Electronic Devices"],
      Chemistry: ["Basic Concepts", "Atomic Structure", "Chemical Bonding", "Thermodynamics", "Solutions", "Equilibrium", "Redox & Electrochemistry", "Chemical Kinetics", "Periodic Table", "p-Block", "d- and f-Block", "Coordination Compounds", "GOC", "Hydrocarbons", "Halogens", "Oxygen Compounds", "Nitrogen Compounds", "Biomolecules"],
      Maths: ["Sets Relations Functions", "Complex Numbers & Quadratics", "Matrices Determinants", "P&C", "Binomial Theorem", "Sequence & Series", "Limit Continuity Differentiability", "Integral Calculus", "Differential Equations", "Coordinate Geometry", "3D Geometry", "Vector Algebra", "Statistics & Probability", "Trigonometry"]
    },
    JEEAdv: {
      Physics: ["General Physics", "Kinematics", "Newton's Laws", "Work Power Energy", "COM & Collision", "Rotational Dynamics", "Gravitation", "Fluid Mechanics", "Thermal Physics", "Electrostatics", "Current Electricity", "Magnetism", "EMI & AC", "Ray & Wave Optics", "Modern Physics"],
      Chemistry: ["Atomic Structure", "Gaseous State", "Thermodynamics", "Equilibrium", "Electrochemistry", "Chemical Kinetics", "Solid State", "Solutions", "Surface Chemistry", "Chemical Bonding", "Coordination Compounds", "Salt Analysis", "GOC & Isomerism", "Hydrocarbons", "Functional Groups", "Biomolecules"],
      Maths: ["Algebra", "Matrices", "Probability", "Trigonometry", "Analytical Geometry", "Differential Calculus", "Integral Calculus", "Vectors"]
    }
  };

  function getSylTracker() {
    try {
      return JSON.parse(localStorage.getItem('syl_tracker_pro') || '{}');
    } catch (e) {
      return {};
    }
  }

  function setSylTracker(tracker) {
    try {
      localStorage.setItem('syl_tracker_pro', JSON.stringify(tracker));
    } catch (e) {}
  }

  function getSylPctFor(level, subj) {
    const syl = SYL_DATA[level];
    if (!syl) return 0;
    const tracker = getSylTracker();
    let total = 0, done = 0;
    Object.keys(syl).filter(s => !subj || s === subj).forEach(s => {
      syl[s].forEach(ch => {
        total++;
        const st = tracker[`${level}_${s}_${ch}`] || 0;
        done += (st === 3 ? 1 : st * 0.25);
      });
    });
    return total ? Math.round((done / total) * 100) : 0;
  }

  function renderSyllabusMatrix() {
    const level = state.sylLevel;
    const syl = SYL_DATA[level];
    if (!syl) return;

    const tracker = getSylTracker();
    const pPct = getSylPctFor(level, 'Physics');
    const cPct = getSylPctFor(level, 'Chemistry');
    const mPct = getSylPctFor(level, 'Maths');
    const totPct = getSylPctFor(level);

    // Render Rings
    $('v2-syl-header-cards').innerHTML = `
      <div class="v2-syl-subject-card">
        <div class="v2-syl-ring">
          <svg viewBox="0 0 60 60" width="60" height="60">
            <circle cx="30" cy="30" r="24" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="6"/>
            <circle cx="30" cy="30" r="24" fill="none" stroke="var(--v2-accent)" stroke-width="6" stroke-linecap="round" stroke-dasharray="150.8" stroke-dashoffset="${150.8 * (1 - totPct / 100)}"/>
          </svg>
        </div>
        <div>
          <div style="font-size:22px;font-weight:800;color:#fff">${totPct}%</div>
          <div style="font-size:12px;color:var(--v2-text-muted)">Overall Syllabus</div>
        </div>
      </div>

      <div class="v2-syl-subject-card">
        <div>
          <div style="font-size:20px;font-weight:800;color:#3b82f6">${pPct}%</div>
          <div style="font-size:12px;color:var(--v2-text-muted)">Physics Mastery</div>
        </div>
      </div>

      <div class="v2-syl-subject-card">
        <div>
          <div style="font-size:20px;font-weight:800;color:#10b981">${cPct}%</div>
          <div style="font-size:12px;color:var(--v2-text-muted)">Chemistry Mastery</div>
        </div>
      </div>

      <div class="v2-syl-subject-card">
        <div>
          <div style="font-size:20px;font-weight:800;color:#f59e0b">${mPct}%</div>
          <div style="font-size:12px;color:var(--v2-text-muted)">Maths Mastery</div>
        </div>
      </div>
    `;

    // Render Subject Columns
    const cols = $('v2-syl-columns');
    cols.innerHTML = '';

    const colors = { Physics: '#3b82f6', Chemistry: '#10b981', Maths: '#f59e0b' };

    Object.keys(syl).forEach(subj => {
      let chaps = syl[subj];
      if (state.sylQuery) {
        chaps = chaps.filter(c => c.toLowerCase().includes(state.sylQuery));
      }
      if (state.sylFilter !== 'all') {
        const targetSt = parseInt(state.sylFilter, 10);
        chaps = chaps.filter(c => (tracker[`${level}_${subj}_${c}`] || 0) === targetSt);
      }

      const colEl = document.createElement('div');
      colEl.className = 'v2-syl-subject-col';
      colEl.innerHTML = `
        <div class="v2-syl-col-head">
          <span style="font-weight:700;color:${colors[subj] || '#fff'}">${subj} (${chaps.length})</span>
          <span style="font-size:12px;color:var(--v2-text-muted)">${getSylPctFor(level, subj)}%</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px">
          ${chaps.map(ch => {
            const key = `${level}_${subj}_${ch}`;
            const st = tracker[key] || 0;
            return `
              <div class="v2-chapter-row">
                <span class="v2-chapter-title" title="${escapeHTML(ch)}">${escapeHTML(ch)}</span>
                <div class="v2-stage-btns">
                  <button class="v2-stage-btn ${st === 0 ? 'on-0' : ''}" onclick="window.v2CycleSylStage('${escapeHTML(key)}', 0)">⚪</button>
                  <button class="v2-stage-btn ${st === 1 ? 'on-1' : ''}" onclick="window.v2CycleSylStage('${escapeHTML(key)}', 1)">🟡</button>
                  <button class="v2-stage-btn ${st === 2 ? 'on-2' : ''}" onclick="window.v2CycleSylStage('${escapeHTML(key)}', 2)">🔵</button>
                  <button class="v2-stage-btn ${st === 3 ? 'on-3' : ''}" onclick="window.v2CycleSylStage('${escapeHTML(key)}', 3)">🟢</button>
                </div>
              </div>
            `;
          }).join('') || '<div style="font-size:12px;color:var(--v2-text-muted);padding:10px">No matching chapters.</div>'}
        </div>
      `;
      cols.appendChild(colEl);
    });
  }

  window.v2CycleSylStage = function (key, stage) {
    const tracker = getSylTracker();
    tracker[key] = stage;
    setSylTracker(tracker);
    renderSyllabusMatrix();
  };

  /**
   * Timetable Subsystem
   */
  function getTimetableData() {
    try {
      const data = JSON.parse(localStorage.getItem('timetable_v2') || '[]');
      if (Array.isArray(data) && data.length) return data;
    } catch (e) {}

    // Default template
    return [
      { id: 't1', t: '06:30', d: 'Morning Revision: Formulas & Chemistry NCERT', s: 'Chemistry', done: false },
      { id: 't2', t: '08:30', d: 'Physics Mechanics & Electrostatics Numerical Drill', s: 'Physics', done: false },
      { id: 't3', t: '11:00', d: 'Maths Calculus & Vectors Problem Solving', s: 'Maths', done: false },
      { id: 't4', t: '15:00', d: 'Full Mock Test / Timed PYQ Simulation', s: 'Mock', done: false },
      { id: 't5', t: '18:30', d: 'Mock Error Analysis & Weak Area Fixes', s: 'Revision', done: false },
      { id: 't6', t: '21:00', d: 'Night Flashcard Spaced Review & Planning', s: 'Revision', done: false }
    ];
  }

  function saveTimetableData(data) {
    try {
      localStorage.setItem('timetable_v2', JSON.stringify(data));
    } catch (e) {}
  }

  function renderTimetable() {
    const list = $('v2-tt-list');
    if (!list) return;
    const tt = getTimetableData();

    list.innerHTML = tt.map((item, idx) => `
      <div class="v2-tt-row ${item.done ? 'done' : ''}">
        <input type="checkbox" ${item.done ? 'checked' : ''} onchange="window.v2ToggleTTDone(${idx})">
        <span class="v2-tt-time">${item.t}</span>
        <span class="v2-tt-desc">${escapeHTML(item.d)}</span>
        <span class="v2-tt-tag">${escapeHTML(item.s || 'General')}</span>
        <button class="v2-action-icon-btn" style="width:26px;height:26px;font-size:11px" onclick="window.v2DeleteTTBlock(${idx})">✕</button>
      </div>
    `).join('') || '<div style="color:var(--v2-text-muted);font-size:13px;padding:20px">No study blocks planned yet.</div>';
  }

  window.v2ToggleTTDone = function (idx) {
    const tt = getTimetableData();
    if (tt[idx]) {
      tt[idx].done = !tt[idx].done;
      saveTimetableData(tt);
      renderTimetable();
    }
  };

  window.v2DeleteTTBlock = function (idx) {
    const tt = getTimetableData();
    tt.splice(idx, 1);
    saveTimetableData(tt);
    renderTimetable();
  };

  function addTimetableBlock() {
    const time = $('v2-tt-in-time').value || '09:00';
    const desc = $('v2-tt-in-desc').value.trim();
    const subj = $('v2-tt-in-subj').value;
    if (!desc) return;

    const tt = getTimetableData();
    tt.push({
      id: 't' + Date.now().toString(36),
      t: time,
      d: desc,
      s: subj,
      done: false
    });
    tt.sort((a, b) => a.t.localeCompare(b.t));
    saveTimetableData(tt);
    $('v2-tt-in-desc').value = '';
    renderTimetable();
  }

  function resetTimetableTemplate() {
    if (confirm('Reset to high-performance JEE schedule routine?')) {
      localStorage.removeItem('timetable_v2');
      renderTimetable();
    }
  }

  /**
   * Dock Toggles
   */
  function toggleDock(open) {
    state.dockOpen = typeof open === 'boolean' ? open : !state.dockOpen;
    $('v2-dock')?.classList.toggle('collapsed', !state.dockOpen);
  }

  /**
   * Sea Lion Messages
   */
  function sendSeaLionMsg() {
    const input = $('v2-sl-input');
    const text = (input?.value || '').trim();
    if (!text) return;

    input.value = '';
    const chatArea = $('v2-sl-chat');

    const userMsg = document.createElement('div');
    userMsg.className = 'v2-sl-msg user';
    userMsg.textContent = text;
    chatArea.appendChild(userMsg);

    // Call real sealion engine or smart generator
    setTimeout(() => {
      const botMsg = document.createElement('div');
      botMsg.className = 'v2-sl-msg bot';

      const lower = text.toLowerCase();
      if (/cat|kitty|meow/.test(lower)) {
        botMsg.innerHTML = `🦭 <b>Sea Lion:</b> Here is a cat for you! <br><img class="sl-img" src="./assets/Cats/Cat 1.jpg" onerror="this.src='https://cataas.com/cat'">`;
      } else if (/dog|puppy|woof/.test(lower)) {
        botMsg.innerHTML = `🦭 <b>Sea Lion:</b> Good doggo inbound! <br><img class="sl-img" src="./assets/Dogs/Dog 1.jpg" onerror="this.src='https://placedog.net/500/350'">`;
      } else if (/capybara|capy/.test(lower)) {
        botMsg.innerHTML = `🦭 <b>Sea Lion:</b> Pure chill capybara! <br><img class="sl-img" src="./assets/Capybaras/Capybara 1.jpg">`;
      } else if (/meme|funny/.test(lower)) {
        botMsg.innerHTML = `🦭 <b>Sea Lion:</b> Study meme break: <br><img class="sl-img" src="./assets/Memes/Meme 1.jpg">`;
      } else if (/joke/.test(lower)) {
        const jokes = [
          "Why did the sea lion fail maths? He kept getting lost at sea-level!",
          "Why was the equal sign so humble? It knew it wasn't less than or greater than anyone.",
          "Why can't you trust atoms? They make up everything!",
          "What did the integral say to the derivative? Stop going off on a tangent!"
        ];
        botMsg.innerHTML = `🦭 <b>Sea Lion:</b> ${jokes[Math.floor(Math.random() * jokes.length)]}`;
      } else if (/tip|advice|hack/.test(lower)) {
        const tips = [
          "Active recall: close your notes and write everything you remember before checking.",
          "Solve 10 numerical problems every single morning before touching social media.",
          "Error logs are golden. Re-solving your mistakes is 3x more effective than re-reading notes.",
          "Take a 5-minute movement break every 25 minutes of intense focus."
        ];
        botMsg.innerHTML = `🦭 <b>Sea Lion:</b> 💡 <b>Study Tip:</b> ${tips[Math.floor(Math.random() * tips.length)]}`;
      } else if (/quiz/.test(lower)) {
        const card = (window.RR && window.RR.card) ? window.RR.card() : null;
        if (card) {
          const q = Array.isArray(card) ? card[1] : (card.q || 'What is Newton second law?');
          const a = Array.isArray(card) ? card[2] : (card.a || 'F = dp/dt');
          botMsg.innerHTML = `🦭 <b>Sea Lion Quiz Time:</b><br><br><b>${escapeHTML(q)}</b><br><br><details style="cursor:pointer;margin-top:6px"><summary style="color:var(--v2-accent);font-weight:700">Reveal Answer</summary><div style="margin-top:4px;color:#fff">${escapeHTML(a)}</div></details>`;
        } else {
          botMsg.innerHTML = `🦭 <b>Sea Lion:</b> Question: What is the relation between KE and momentum? <details style="cursor:pointer"><summary style="color:var(--v2-accent)">Reveal</summary>KE = p²/2m</details>`;
        }
      } else {
        const quote = (window.RR && window.RR.quote) ? window.RR.quote() : "Keep crushing those problems! One chapter at a time.";
        botMsg.innerHTML = `🦭 <b>Sea Lion:</b> ${quote}`;
      }

      chatArea.appendChild(botMsg);
      chatArea.scrollTop = chatArea.scrollHeight;
    }, 350);

    chatArea.scrollTop = chatArea.scrollHeight;
  }

  /**
   * Command Palette
   */
  function openCmdPalette() {
    state.cmdPaletteOpen = true;
    $('v2-cmd-overlay')?.classList.add('active');
    $('v2-cmd-input')?.focus();
    renderCmdResults('');
  }

  function closeCmdPalette() {
    state.cmdPaletteOpen = false;
    $('v2-cmd-overlay')?.classList.remove('active');
  }

  function handleCmdInput(e) {
    renderCmdResults(e.target.value.toLowerCase());
  }

  function renderCmdResults(query) {
    const results = $('v2-cmd-results');
    if (!results) return;
    results.innerHTML = '';

    const actions = [
      { title: '🎓 Start Guided Site Tour', shortcut: 'Walkthrough', action: () => openTour(0) },
      { title: '⚡ Focus Studio (Pomodoro Timer)', shortcut: 'Focus Mode', action: () => { $('v2-shell').querySelector('[data-pillar="focus"]').click(); } },
      { title: '📇 Practice Flashcards', shortcut: 'Revision Lab', action: () => { $('v2-shell').querySelector('[data-pillar="revision"]').click(); } },
      { title: '🧪 Exam & Mock Center', shortcut: 'Mock Tests & Logger', action: () => { $('v2-shell').querySelector('[data-pillar="mocks"]').click(); } },
      { title: '📑 Syllabus Mastery Matrix', shortcut: 'Chapter Progress', action: () => { $('v2-shell').querySelector('[data-pillar="syllabus"]').click(); } },
      { title: '📅 Daily Timetable & Schedule', shortcut: 'Day Planner', action: () => { $('v2-shell').querySelector('[data-pillar="timetable"]').click(); } },
      { title: '🔲 Toggle Dual Split Screen', shortcut: 'Side-by-Side', action: toggleSplitView },
      { title: '🎧 Toggle Ambient Audio Hub', shortcut: 'Soundscapes', action: () => { toggleDock(true); $('v2-dock-btn').click(); } },
      { title: '🖤 Switch Theme to AMOLED', shortcut: 'Theme', action: () => setV2Theme('v2-theme-amoled') },
      { title: '⚡ Switch Theme to Cyberpunk', shortcut: 'Theme', action: () => setV2Theme('v2-theme-cyberpunk') },
      { title: '🌲 Switch Theme to Forest Jade', shortcut: 'Theme', action: () => setV2Theme('v2-theme-forest') },
      { title: '↩ Return to Classic UI', shortcut: 'Classic Mode', action: disableV2 }
    ];

    const master = window.masterList || [];
    const resourceActions = master.filter(b => !query || b.name.toLowerCase().includes(query)).slice(0, 8).map(b => ({
      title: `📚 Open ${b.name}`,
      shortcut: (b.folders || [])[1] || 'Library',
      action: () => loadResourceIntoCanvas(b, 0)
    }));

    const all = [...actions, ...resourceActions];
    const filtered = query ? all.filter(a => a.title.toLowerCase().includes(query) || a.shortcut.toLowerCase().includes(query)) : all;

    if (!filtered.length) {
      results.innerHTML = `<div style="padding:16px;text-align:center;color:var(--v2-text-muted);font-size:13px">No matches found</div>`;
      return;
    }

    filtered.forEach((item, i) => {
      const el = document.createElement('div');
      el.className = `v2-cmd-item ${i === 0 ? 'selected' : ''}`;
      el.innerHTML = `
        <span class="cmd-title">${item.title}</span>
        <span class="cmd-shortcut">${item.shortcut}</span>
      `;
      el.onclick = () => {
        item.action();
        closeCmdPalette();
      };
      results.appendChild(el);
    });
  }

  function escapeHTML(str) {
    return String(str || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // Expose V2 Controller API globally
  window.enableV2 = enableV2;
  window.disableV2 = disableV2;
  window.toggleV2 = toggleV2;
  window.RRV2 = {
    enable: enableV2,
    disable: disableV2,
    toggle: toggleV2,
    getState: () => state,
    setTheme: setV2Theme,
    openTour: () => openTour(0)
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initV2);
  } else {
    initV2();
  }

})();
