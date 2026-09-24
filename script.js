function initApp() {
    try {
        // ==========================================
        // 0. BRANDING & SYSTEM EVENTS
        // ==========================================
        try {
            const sidebarLogo = document.getElementById('sidebar-logo');
            if (sidebarLogo) {
                sidebarLogo.onerror = function() {
                    this.onerror = null; 
                    this.src = this.src.replace('.jpg', '.png').replace('.JPG', '.png');
                };
                sidebarLogo.src = Math.random() < 0.1 ? './assets/Important/Logo 1.jpg' : './assets/Important/Logo 2.jpg';
            }
        } catch(e) {}

        document.getElementById('sidebar-toggle')?.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                document.getElementById('sidebar')?.classList.toggle('mobile-open');
            } else {
                document.getElementById('sidebar')?.classList.toggle('collapsed');
            }
        });

        document.getElementById('mobile-sidebar-close')?.addEventListener('click', () => {
            document.getElementById('sidebar')?.classList.remove('mobile-open');
        });

        window.addEventListener('offline', () => document.getElementById('offline-overlay')?.classList.add('active'));
        window.addEventListener('online', () => document.getElementById('offline-overlay')?.classList.remove('active'));

        window.showToast = (msg) => {
            const container = document.getElementById('toast-container');
            if(!container) return;
            const toast = document.createElement('div');
            toast.className = 'toast';
            toast.innerText = msg;
            container.appendChild(toast);
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transition = 'opacity 0.3s';
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        };

        // ==========================================
        // 1. DATA INGESTION
        // ==========================================
        const rawLecturesData = window.rawLectures || [];
        const rawFilesData = window.rawFiles || [];
        
        let safeFiles = [];
        try {
            safeFiles = rawFilesData.filter(b => b.folders && !b.folders.some(f => f.toUpperCase().includes('CLASS 10') || f.toUpperCase().includes('NUCLEUS')));
        } catch(e) {
            safeFiles = rawFilesData;
        }

        window.libraryData = {
            LECTURES: rawLecturesData,
            FILES: safeFiles.filter(b => b.folders && (b.folders.includes('COACHINGS') || b.folders.includes('SUBJECTS') || b.folders.includes('PUBLICATIONS') || b.folders.includes('NCERT'))),
            SUPPORT: safeFiles.filter(b => b.folders && (b.folders.includes('EXTRAS') || b.folders.includes('MATHANGO')))
        };

        let activeModule = 'LECTURES';
        window.masterList = [];
        for(let k in window.libraryData) window.masterList.push(...window.libraryData[k]);

        // ==========================================
        // 2. SETTINGS & THEMING
        // ==========================================
        let studyStats = {};
        try {
            studyStats = JSON.parse(localStorage.getItem('study_stats_pro')) || {};
        } catch(e) {}
        
        const todayStr = new Date().toISOString().split('T')[0];
        if (!studyStats[todayStr]) studyStats[todayStr] = 0;
        if (!studyStats['subjects']) studyStats['subjects'] = { 'Physics': 0, 'Chemistry': 0, 'Maths': 0, 'General': 0 };

        let pomoSettings = { focusTime: 25, theme: 'theme-amoled', accent: '#3b82f6', icon: '⚡', bg: 'bg-none', pomoTheme: 'plant' };
        try {
            const savedPomo = JSON.parse(localStorage.getItem('pomo_settings_pro'));
            if(savedPomo) pomoSettings = { ...pomoSettings, ...savedPomo };
        } catch(e) {}
        
        function applySettings() {
            document.body.className = `${pomoSettings.theme || 'theme-amoled'} font-medium`;
            document.documentElement.style.setProperty('--accent-color', pomoSettings.accent || '#3b82f6');
            try {
                let c = pomoSettings.accent || '#3b82f6';
                const rgb = parseInt(c.slice(1,3),16)+','+parseInt(c.slice(3,5),16)+','+parseInt(c.slice(5,7),16);
                document.documentElement.style.setProperty('--accent-glow', `rgba(${rgb}, 0.4)`);
            } catch(e) {}
            
            const iEl = document.getElementById('pomo-icon-display');
            if (iEl) iEl.textContent = pomoSettings.icon;
            
            const bgEl = document.getElementById('ambient-bg');
            if (bgEl) bgEl.className = pomoSettings.bg || 'bg-none';
        }
        applySettings();

        // ==========================================
        // 3. POMODORO TIMER
        // ==========================================
        let pomoSeconds = pomoSettings.focusTime * 60;
        let pomoInterval = null;
        let isPomoRunning = false;

        const growthThemes = {
            plant: ['🌱', '🌿', '🪴', '🌳'],
            beaker: ['🧫', '💧', '🧪', '🧬'],
            flame: ['💨', '🕯️', '🪵', '🔥']
        };

        const pomoQuotes = [
            "You're doing great!", "Focus is your superpower.", "One concept at a time.", 
            "Growth happens in the struggle.", "Trust the process!", "No distractions.",
            "Deep breath. Next problem.", "Discipline equals freedom.", "Stay hard!",
            "Rome wasn't built in a day.", "Brick by brick.", "Keep pushing.",
            "The magic you are looking for is in the work you're avoiding.",
            "Embrace the grind.", "Small steps, big mountain.", "Conquer the day."
        ];

        function updatePomoDisplay() {
            let m = String(Math.floor(pomoSeconds / 60)).padStart(2, '0');
            let s = String(pomoSeconds % 60).padStart(2, '0');
            const dEl = document.getElementById('pomo-time');
            if(dEl) dEl.textContent = `${m}:${s}`;

            let total = pomoSettings.focusTime * 60;
            let pct = ((total - pomoSeconds) / total) * 100;
            const prog = document.getElementById('pomo-progress-fill');
            if(prog) prog.style.width = `${pct}%`;
            
            let currentThemeArr = growthThemes[pomoSettings.pomoTheme] || growthThemes.plant;
            let icon = currentThemeArr[0]; 
            if (pct > 25) icon = currentThemeArr[1]; 
            if (pct > 60) icon = currentThemeArr[2]; 
            if (pct > 90) icon = currentThemeArr[3]; 
            const stage = document.getElementById('pomo-plant-stage');
            if(stage) stage.textContent = icon;

            if (isPomoRunning && pomoSeconds % 30 === 0) {
                const quoteEl = document.getElementById('pomo-quote');
                if(quoteEl) quoteEl.textContent = pomoQuotes[Math.floor(Math.random() * pomoQuotes.length)];
            }
        }

        function checkBurnout() {
            try {
                let todaySessions = studyStats[todayStr] || 0;
                let hoursStudied = (todaySessions * pomoSettings.focusTime) / 60;
                if (hoursStudied >= 4 && !sessionStorage.getItem('burnout_shown')) {
                    document.getElementById('burnout-overlay')?.classList.add('active');
                    sessionStorage.setItem('burnout_shown', 'true');
                }
            } catch(e) {}
        }

        document.getElementById('burnout-close')?.addEventListener('click', () => {
            document.getElementById('burnout-overlay')?.classList.remove('active');
        });

        document.getElementById('pomo-toggle')?.addEventListener('click', (e) => {
            const card = document.getElementById('pomo-card');
            if (isPomoRunning) {
                clearInterval(pomoInterval);
                isPomoRunning = false;
                e.target.innerHTML = '▶ Resume Focus';
                card?.classList.remove('running');
                const quoteEl = document.getElementById('pomo-quote');
                if(quoteEl) quoteEl.textContent = "Paused. Ready when you are.";
            } else {
                isPomoRunning = true;
                e.target.innerHTML = '⏸ Pause Focus';
                card?.classList.add('running');
                const quoteEl = document.getElementById('pomo-quote');
                if(quoteEl) quoteEl.textContent = "Let's lock in!";
                
                pomoInterval = setInterval(() => {
                    if (pomoSeconds > 0) {
                        pomoSeconds--;
                        updatePomoDisplay();
                    } else {
                        clearInterval(pomoInterval);
                        isPomoRunning = false;
                        e.target.innerHTML = '▶ Start Focus';
                        card?.classList.remove('running');
                        
                        studyStats[todayStr]++;
                        let subjEl = document.getElementById('pomo-subject');
                        let currentSubject = subjEl ? subjEl.value : 'General';
                        studyStats['subjects'][currentSubject] += (pomoSettings.focusTime / 60);
                        
                        try {
                            localStorage.setItem('study_stats_pro', JSON.stringify(studyStats));
                        } catch(err) {}
                        
                        if(quoteEl) quoteEl.textContent = "Session complete! Level up!";
                        window.showToast("Focus Session Complete! Great job.");
                        pomoSeconds = pomoSettings.focusTime * 60;
                        updatePomoDisplay();
                        checkBurnout();
                    }
                }, 1000);
            }
        });

        document.getElementById('pomo-reset')?.addEventListener('click', () => {
            clearInterval(pomoInterval);
            isPomoRunning = false;
            pomoSeconds = pomoSettings.focusTime * 60;
            const btn = document.getElementById('pomo-toggle');
            if(btn) btn.innerHTML = '▶ Start Focus';
            document.getElementById('pomo-card')?.classList.remove('running');
            const quoteEl = document.getElementById('pomo-quote');
            if(quoteEl) quoteEl.textContent = "Timer reset. Ready!";
            updatePomoDisplay();
        });
        updatePomoDisplay();

        // ==========================================
        // 4. FOLDER TREE RENDERER
        // ==========================================
        function buildTree(books) {
            const root = { _files: [] };
            books.forEach(b => {
                let current = root;
                let paths = [...(b.folders||[])];
                
                if (activeModule === 'LECTURES' && paths[0] === 'LECTURES') paths.shift();
                if (activeModule === 'FILES' && paths[0] === 'IIT-JEE') paths.shift();
                if (activeModule === 'SUPPORT') {
                    if (paths[0] === 'IIT-JEE') paths.shift();
                    if (paths[0] === 'EXTRAS') paths.shift(); 
                }

                paths.forEach(folder => {
                    if (!current[folder]) current[folder] = { _files: [] };
                    current = current[folder];
                });
                current._files.push(b);
            });
            return root;
        }

        function createDOMTree(node, isOpen) {
            const container = document.createElement('div');
            Object.keys(node).sort().forEach(key => {
                if (key === '_files') return;
                let d = document.createElement('details');
                d.open = isOpen;
                d.innerHTML = `<summary>${key}</summary><div class="folder-contents"></div>`;
                d.querySelector('.folder-contents').appendChild(createDOMTree(node[key], isOpen));
                container.appendChild(d);
            });
            if (node._files && node._files.length > 0) {
                node._files.forEach(book => {
                    let item = document.createElement('div');
                    item.className = 'book-item';
                    item.innerHTML = `<span>${book.title || 'Untitled'}</span>`;
                    item.onclick = () => window.loadResource(book, item);
                    container.appendChild(item);
                });
            }
            return container;
        }

        function renderLibrary(query = '') {
            const list = document.getElementById('book-list');
            if(!list) return;
            list.innerHTML = '';
            const data = window.libraryData[activeModule];
            if (!data) return;

            let filtered = data.filter(b => ((b.title || '') + " " + (b.folders||[]).join(" ")).toLowerCase().includes(query.toLowerCase()));
            
            if(filtered.length === 0) { 
                list.innerHTML = `
                <div style="padding:40px 15px; text-align:center; opacity:0.8; display:flex; flex-direction:column; align-items:center;">
                    <img src="./assets/Important/Found Nothing 1.jpg" onerror="this.onerror=null; this.src=this.src.replace('.jpg', '.png').replace('.JPG', '.png');" style="max-width:180px; border-radius:16px; margin-bottom:20px; animation:float 3s infinite ease-in-out;">
                    <h4 style="color:var(--text-color); font-size:1.1em; text-transform:uppercase; font-weight:800;">Found Literally Nothing</h4>
                    <p style="color:var(--text-muted); font-size:0.9em; margin-top:8px;">Try spelling it correctly this time.</p>
                </div>`; 
                return; 
            }

            const tree = buildTree(filtered);
            list.appendChild(createDOMTree(tree, query.length > 0));
        }

        document.getElementById('search-bar')?.addEventListener('input', (e) => renderLibrary(e.target.value));

        window.loadResource = function(book, el) {
            document.querySelectorAll('.book-item').forEach(i => i.classList.remove('active'));
            if (el) el.classList.add('active');

            if (window.innerWidth <= 768) document.getElementById('sidebar')?.classList.remove('mobile-open');

            document.getElementById('home-title-area').style.display = 'none';
            document.getElementById('current-title').style.display = 'block';
            document.getElementById('current-path').style.display = 'block';

            document.getElementById('placeholder-box').style.display = 'none';
            document.getElementById('error-box').style.display = 'none';
            document.getElementById('util-panel').style.display = 'none';
            
            document.getElementById('viewer-1').style.display = 'block';
            document.getElementById('split-btn').style.display = 'flex';
            
            document.getElementById('current-title').textContent = book.title || 'Untitled';
            document.getElementById('current-path').textContent = (book.folders||[]).join(" > ");
            
            const dropdown = document.getElementById('playlist-select');
            const frame1 = document.getElementById('frame-1');
            const frame2 = document.getElementById('frame-2');
            
            frame1.onerror = () => { 
                document.getElementById('viewer-1').style.display = 'none'; 
                document.getElementById('error-box').style.display = 'flex'; 
            };

            if (book.playlist && book.playlist.length > 0) {
                dropdown.style.display = 'block';
                dropdown.innerHTML = '';
                book.playlist.forEach((vid) => {
                    let opt = document.createElement('option');
                    opt.value = vid.url;
                    opt.textContent = vid.title;
                    dropdown.appendChild(opt);
                });
                dropdown.onchange = (e) => { frame1.src = e.target.value; frame2.src = e.target.value; };
                frame1.src = book.playlist[0].url; frame2.src = book.playlist[0].url;
            } else {
                dropdown.style.display = 'none';
                frame1.src = book.url || ''; frame2.src = book.url || '';
            }

            const notesArea = document.getElementById('notes-area');
            if(notesArea) {
                try {
                    notesArea.value = localStorage.getItem('notes_' + book.title) || '';
                    notesArea.oninput = () => {
                        try { localStorage.setItem('notes_' + book.title, notesArea.value); } catch(err){}
                    };
                } catch(e) {}
            }
        };

        // ==========================================
        // 5. TABS & UTILITIES
        // ==========================================
        document.getElementById('module-tabs')?.addEventListener('click', (e) => {
            if(e.target.classList.contains('mod-tab')) {
                document.querySelectorAll('.mod-tab').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                activeModule = e.target.getAttribute('data-tab');
                
                document.querySelectorAll('.sidebar-view').forEach(v => v.classList.remove('active'));
                
                if(activeModule === 'UTILITIES') {
                    document.getElementById('view-utilities')?.classList.add('active');
                } else {
                    document.getElementById('view-library')?.classList.add('active');
                    renderLibrary();
                }
            }
        });

        document.getElementById('view-utilities')?.addEventListener('click', (e) => {
            const btn = e.target.closest('.util-card-btn');
            if(btn) openUtility(btn.getAttribute('data-util'));
        });

        function openUtility(type) {
            if (window.innerWidth <= 768) document.getElementById('sidebar')?.classList.remove('mobile-open');

            document.getElementById('home-title-area').style.display = 'none';
            document.getElementById('current-title').style.display = 'block';
            document.getElementById('current-path').style.display = 'block';

            document.getElementById('placeholder-box').style.display = 'none';
            document.getElementById('error-box').style.display = 'none';
            document.getElementById('viewer-1').style.display = 'none';
            document.getElementById('viewer-2').style.display = 'none';
            document.getElementById('resizer').style.display = 'none';
            document.getElementById('split-btn').style.display = 'none';
            document.getElementById('playlist-select').style.display = 'none';
            
            const up = document.getElementById('util-panel');
            up.style.display = 'block';
            
            document.getElementById('current-title').textContent = type.charAt(0).toUpperCase() + type.slice(1);
            document.getElementById('current-path').textContent = "Utilities > " + type;

            if (type === 'analytics') {
                let total = 0, streak = 0, d = new Date();
                for(let k in studyStats) { if (k !== 'subjects') total += studyStats[k]; }
                while(studyStats[d.toISOString().split('T')[0]] > 0) { streak++; d.setDate(d.getDate()-1); }
                
                let subData = studyStats['subjects'];
                let maxHours = Math.max(0.1, subData['Physics'], subData['Chemistry'], subData['Maths'], subData['General']);
                let chartHtml = '';
                ['Physics', 'Chemistry', 'Maths', 'General'].forEach(s => {
                    let h = subData[s] || 0;
                    let pct = (h / maxHours) * 100;
                    chartHtml += `
                        <div style="display:flex; flex-direction:column; gap:8px; align-items:center;">
                            <div style="height:140px; width:45px; background:var(--folder-bg); border-radius:8px; display:flex; align-items:flex-end; border:1px solid var(--border-color); overflow:hidden;">
                                <div style="width:100%; height:${pct}%; background:var(--accent-color); transition:height 1s ease-out;"></div>
                            </div>
                            <span style="font-size:0.85em; font-weight:bold; color:var(--text-muted);">${s}</span>
                            <span style="font-size:0.8em; font-family:monospace;">${h.toFixed(1)}h</span>
                        </div>`;
                });

                let heatmapHtml = '<div class="heatmap-container">';
                let hd = new Date();
                for(let i = 29; i >= 0; i--) {
                    let iterDate = new Date(hd);
                    iterDate.setDate(iterDate.getDate() - i);
                    let dStr = iterDate.toISOString().split('T')[0];
                    let hours = (studyStats[dStr] || 0) * (pomoSettings.focusTime / 60);
                    
                    let blockColor = 'var(--folder-bg)';
                    if (hours > 0 && hours <= 1.5) blockColor = 'rgba(59, 130, 246, 0.3)';
                    else if (hours > 1.5 && hours <= 3.5) blockColor = 'rgba(59, 130, 246, 0.6)';
                    else if (hours > 3.5 && hours <= 5.5) blockColor = 'rgba(59, 130, 246, 0.9)';
                    else if (hours > 5.5) blockColor = 'var(--accent-color)';

                    heatmapHtml += `<div class="heatmap-block" style="background: ${blockColor};" title="${dStr}: ${hours.toFixed(1)} hrs"></div>`;
                }
                heatmapHtml += '</div>';

                up.innerHTML = `
                    <div class="util-workspace-inner" style="padding:30px; max-width:1000px; margin:0 auto;">
                        <h2 style="font-size:2em; margin-bottom:30px; text-align:center;">📊 Analytics Dashboard</h2>
                        <h3 style="font-size:1.3em; margin-bottom:15px; text-align:center;">30-Day Consistency Heatmap</h3>
                        ${heatmapHtml}
                        <div class="util-grid">
                            <div class="stat-box"><h3>${total}</h3><p>Sessions</p></div>
                            <div class="stat-box"><h3 style="color:var(--danger);">${streak} 🔥</h3><p>Streak</p></div>
                            <div class="stat-box"><h3 style="color:var(--success);">${((total*pomoSettings.focusTime)/60).toFixed(1)}</h3><p>Hours</p></div>
                        </div>
                        <h3 style="font-size:1.3em; margin-bottom:15px; text-align:center;">Subject Mastery</h3>
                        <div style="display:flex; flex-wrap:wrap; gap:30px; padding:30px; background:var(--sidebar-bg); border-radius:var(--radius-lg); border:1px solid var(--border-color); box-shadow:var(--card-shadow); justify-content:space-around; width:100%;">
                            ${chartHtml}
                        </div>
                    </div>`;
            } else if(type === 'timetable') {
                up.innerHTML = `
                    <div class="tt-layout">
                        <h2 style="font-size:1.8em; margin-bottom:10px; text-align:center;">📅 Timeline</h2>
                        <div class="tt-form">
                            <input type="time" id="tt-start">
                            <input type="text" id="tt-task" placeholder="Task description...">
                            <button class="primary-btn" id="tt-add">Add Task</button>
                        </div>
                        <div class="tt-list" id="tt-list"></div>
                    </div>`;
                
                window.ttTasks = [];
                try {
                    window.ttTasks = JSON.parse(localStorage.getItem('timeline_tasks_pro')) || [];
                } catch(e) {}

                window.renderTT = () => {
                    const list = document.getElementById('tt-list');
                    if(!list) return;
                    list.innerHTML = window.ttTasks.sort((a,b)=>a.time.localeCompare(b.time)).map((t, i) => `
                        <div class="tt-item ${t.done ? 'done':''}">
                            <input type="checkbox" class="tt-check" data-index="${i}" ${t.done?'checked':''}>
                            <span class="tt-time">${t.time}</span>
                            <span style="flex-grow:1; font-weight:600; font-size:1.1em; ${t.done?'text-decoration:line-through':''}">${t.text}</span>
                            <button class="icon-btn tt-del" data-index="${i}" style="color:var(--danger);">✖</button>
                        </div>`).join('');
                };
                
                document.getElementById('tt-add').onclick = () => {
                    let tm = document.getElementById('tt-start').value || "12:00";
                    let txt = document.getElementById('tt-task').value.trim();
                    if(txt) { 
                        window.ttTasks.push({time:tm, text:txt, done:false}); 
                        try { localStorage.setItem('timeline_tasks_pro', JSON.stringify(window.ttTasks)); } catch(e){}
                        window.renderTT(); 
                    }
                };

                document.getElementById('tt-list').addEventListener('click', (e) => {
                    if(e.target.classList.contains('tt-del')) {
                        window.ttTasks.splice(e.target.getAttribute('data-index'), 1);
                        try { localStorage.setItem('timeline_tasks_pro', JSON.stringify(window.ttTasks)); } catch(e){}
                        window.renderTT();
                    }
                });

                document.getElementById('tt-list').addEventListener('change', (e) => {
                    if(e.target.classList.contains('tt-check')) {
                        let i = e.target.getAttribute('data-index');
                        window.ttTasks[i].done = e.target.checked;
                        try { localStorage.setItem('timeline_tasks_pro', JSON.stringify(window.ttTasks)); } catch(e){}
                        window.renderTT();
                    }
                });
                
                window.renderTT();
            } else if(type === 'syllabus') {
                const deepSyllabus = {
                    "Class12": {
                        "Physics": ["Electric Charges and Fields", "Electrostatic Potential", "Current Electricity", "Moving Charges and Magnetism", "Magnetism and Matter", "Electromagnetic Induction", "Alternating Current", "Electromagnetic Waves", "Ray Optics", "Wave Optics", "Dual Nature", "Atoms", "Nuclei", "Semiconductors"],
                        "Chemistry": ["Solutions", "Electrochemistry", "Chemical Kinetics", "d-and f-Block", "Coordination Compounds", "Haloalkanes", "Alcohols", "Aldehydes", "Amines", "Biomolecules"],
                        "Maths": ["Relations and Functions", "Inverse Trigonometric", "Matrices", "Determinants", "Continuity and Differentiability", "Application of Derivatives", "Integrals", "Applications of Integrals", "Differential Equations", "Vector Algebra", "3D Geometry", "Probability"]
                    },
                    "JEEMains": {
                        "Physics": ["Physics and Measurement", "Kinematics", "Laws of Motion", "Work Energy Power", "Rotational Motion", "Gravitation", "Solids and Liquids", "Thermodynamics", "KTG", "Oscillations and Waves", "Electrostatics", "Current Electricity", "Magnetic Effects", "EMI & AC", "EM Waves", "Optics", "Dual Nature", "Atoms and Nuclei", "Electronic Devices"],
                        "Chemistry": ["Basic Concepts", "Atomic Structure", "Chemical Bonding", "Thermodynamics", "Solutions", "Equilibrium", "Redox & Electrochemistry", "Chemical Kinetics", "Periodic Table", "p-Block", "d- and f-Block", "Coordination Compounds", "GOC", "Hydrocarbons", "Halogens", "Oxygen Compounds", "Nitrogen Compounds", "Biomolecules"],
                        "Maths": ["Sets Relations Functions", "Complex Numbers & Quadratics", "Matrices Determinants", "P&C", "Binomial Theorem", "Sequence & Series", "Limit Continuity Differentiability", "Integral Calculus", "Differential Equations", "Coordinate Geometry", "3D Geometry", "Vector Algebra", "Statistics & Probability", "Trigonometry"]
                    },
                    "JEEAdv": {
                        "Physics": ["General Physics", "Kinematics", "Newton's Laws", "Work Power Energy", "COM & Collision", "Rotational Dynamics", "Gravitation", "Fluid Mechanics", "Thermal Physics", "Electrostatics", "Current Electricity", "Magnetism", "EMI & AC", "Ray & Wave Optics", "Modern Physics"],
                        "Chemistry": ["Atomic Structure", "Gaseous State", "Thermodynamics", "Equilibrium", "Electrochemistry", "Chemical Kinetics", "Solid State", "Solutions", "Surface Chemistry", "Chemical Bonding", "Coordination Compounds", "Salt Analysis", "GOC & Isomerism", "Hydrocarbons", "Functional Groups", "Biomolecules"],
                        "Maths": ["Algebra", "Matrices", "Probability", "Trigonometry", "Analytical Geometry", "Differential Calculus", "Integral Calculus", "Vectors"]
                    }
                };
                window.sylStates = [
                    { t: '⚪ Unstudied', c: 'var(--text-color)', b: 'transparent' },
                    { t: '🟡 Theory', c: '#000', b: '#fde047' },
                    { t: '🔵 PYQs', c: '#fff', b: '#3b82f6' },
                    { t: '🟢 Mastered', c: '#fff', b: '#22c55e' }
                ];
                window.sylData = {};
                try {
                    window.sylData = JSON.parse(localStorage.getItem('syl_tracker_pro')) || {};
                } catch(e) {}

                up.innerHTML = `
                    <div class="syl-tracker">
                        <h2 style="font-size:1.8em; margin-bottom:10px; text-align:center;">📑 Syllabus Mastery</h2>
                        <div class="syl-tabs" style="display:flex; gap:10px; background:var(--folder-bg); padding:8px; border-radius:12px; border:1px solid var(--border-color);">
                            <button class="syl-tab active" data-target="Class12" style="flex:1; padding:12px; font-weight:bold; border-radius:8px; border:none; cursor:pointer; background:var(--sidebar-bg); color:var(--accent-color); box-shadow:var(--card-shadow); transition:0.2s;">Class 12 Boards</button>
                            <button class="syl-tab" data-target="JEEMains" style="flex:1; padding:12px; font-weight:bold; border-radius:8px; border:none; cursor:pointer; background:transparent; color:var(--text-muted); transition:0.2s;">JEE Mains</button>
                            <button class="syl-tab" data-target="JEEAdv" style="flex:1; padding:12px; font-weight:bold; border-radius:8px; border:none; cursor:pointer; background:transparent; color:var(--text-muted); transition:0.2s;">JEE Advanced</button>
                        </div>
                        <div class="syl-progress-bar"><div class="syl-progress-fill" id="syl-prog-fill"></div></div>
                        <div id="syl-content" style="display:flex; flex-direction:column; gap:16px; margin-top:20px;"></div>
                    </div>`;

                window._renderSylContent = (level) => {
                    const container = document.getElementById('syl-content');
                    if(!container) return;
                    let html = '';
                    let total=0, done=0;
                    const data = deepSyllabus[level];
                    Object.keys(data).forEach(subj => {
                        html += `<details class="syl-subject-card" open><summary>${subj}</summary><div class="syl-grid">`;
                        data[subj].forEach(chap => {
                            total++;
                            let key = `${level}_${subj}_${chap}`;
                            let st = window.sylData[key] || 0;
                            if(st === 3) done++; else if (st>0) done += (st*0.25);
                            
                            html += `
                                <div class="syl-chap-row">
                                    <span style="font-size:0.9em; font-weight:600;">${chap}</span>
                                    <button class="syl-btn" data-key="${key}" data-level="${level}" style="background:${window.sylStates[st].b}; color:${window.sylStates[st].c};">${window.sylStates[st].t}</button>
                                </div>`;
                        });
                        html += `</div></details>`;
                    });
                    container.innerHTML = html;
                    let pct = total===0?0:Math.round((done/total)*100);
                    document.getElementById('syl-prog-fill').style.width = `${pct}%`;
                };

                document.getElementById('syl-content').addEventListener('click', (e) => {
                    if(e.target.classList.contains('syl-btn')) {
                        let key = e.target.getAttribute('data-key');
                        let level = e.target.getAttribute('data-level');
                        window.sylData[key] = ((window.sylData[key]||0)+1)%4;
                        try { localStorage.setItem('syl_tracker_pro', JSON.stringify(window.sylData)); } catch(err){}
                        window._renderSylContent(level);
                    }
                });
                
                let currentSylTab = 'Class12';
                window._renderSylContent(currentSylTab);

                document.querySelectorAll('.syl-tab').forEach(tab => {
                    tab.onclick = (e) => {
                        document.querySelectorAll('.syl-tab').forEach(t=>{
                            t.classList.remove('active');
                            t.style.background = 'transparent';
                            t.style.color = 'var(--text-muted)';
                            t.style.boxShadow = 'none';
                        });
                        e.target.classList.add('active');
                        e.target.style.background = 'var(--sidebar-bg)';
                        e.target.style.color = 'var(--accent-color)';
                        e.target.style.boxShadow = 'var(--card-shadow)';
                        currentSylTab = e.target.getAttribute('data-target');
                        window._renderSylContent(currentSylTab);
                    };
                });
            } else if(type === 'flashcards') {
                window.fcDeck = [
                    { q: "What is the formula for Capacitance of a parallel plate capacitor?", a: "C = (ε₀ * A) / d" },
                    { q: "State Gauss's Law in Electrostatics.", a: "Φ = q_enclosed / ε₀" },
                    { q: "Relation between Electric Field (E) and Potential (V)?", a: "E = -dV/dr" },
                    { q: "Define Raoult's Law.", a: "Partial vapour pressure is directly proportional to its mole fraction." },
                    { q: "General formula for Grignard Reagent?", a: "R-Mg-X" },
                    { q: "De Broglie wavelength formula?", a: "λ = h / p" },
                    { q: "Order of an SN2 reaction?", a: "Second order (bimolecular)" }
                ];
                window.fcCurrent = 0;
                window.fcFlipped = false;

                up.innerHTML = `
                    <div class="fc-container">
                        <h2 style="font-size:2em; margin-bottom:10px;">📇 High-Yield Flashcards</h2>
                        <p style="color:var(--text-muted); margin-bottom:30px;">Active Recall Testing</p>
                        <div class="fc-card" id="fc-card">
                            <div class="fc-inner" id="fc-inner">
                                <div class="fc-front" id="fc-front">${window.fcDeck[0].q}</div>
                                <div class="fc-back" id="fc-back">${window.fcDeck[0].a}</div>
                            </div>
                        </div>
                        <div style="display:flex; gap:20px;">
                            <button class="pomo-btn-sec" id="fc-prev">◀ Prev</button>
                            <button class="primary-btn" id="fc-next">Next ▶</button>
                        </div>
                    </div>`;

                window.updateFC = () => {
                    document.getElementById('fc-front').innerText = window.fcDeck[window.fcCurrent].q;
                    document.getElementById('fc-back').innerText = window.fcDeck[window.fcCurrent].a;
                    if(window.fcFlipped) {
                        document.getElementById('fc-inner').style.transform = 'rotateY(0deg)';
                        window.fcFlipped = false;
                    }
                };

                document.getElementById('fc-card').onclick = () => {
                    window.fcFlipped = !window.fcFlipped;
                    document.getElementById('fc-inner').style.transform = window.fcFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)';
                };
                document.getElementById('fc-next').onclick = () => { window.fcCurrent = (window.fcCurrent+1)%window.fcDeck.length; window.updateFC(); };
                document.getElementById('fc-prev').onclick = () => { window.fcCurrent = (window.fcCurrent-1+window.fcDeck.length)%window.fcDeck.length; window.updateFC(); };
            }
        }

        // ==========================================
        // 6. AUDIO HUB (Moved to Drawer & Header)
        // ==========================================
        let synthNode = null;
        let synthGain = null;

        function stopAllAudio() {
            if(synthNode) { try{synthNode.stop(); synthNode.disconnect();}catch(e){} synthNode=null; }
            const aud = document.getElementById('audio-frame');
            if(aud) aud.src = '';
        }

        document.getElementById('audio-select')?.addEventListener('change', (e) => {
            const val = e.target.value;
            const isSynth = ['brown', 'pink', 'white', 'binaural'].includes(val);
            document.getElementById('volume-container').style.display = isSynth ? 'flex' : 'none';
            document.getElementById('audio-to-main-btn').style.display = isSynth ? 'none' : 'flex';
            
            document.getElementById('audio-iframe-box').style.display = 'none';
            stopAllAudio();
            const toggleBtn = document.getElementById('audio-toggle');
            if(toggleBtn) toggleBtn.textContent = "▶ Start Audio";
        });

        document.getElementById('audio-volume')?.addEventListener('input', (e) => {
            if(synthGain) synthGain.gain.value = parseFloat(e.target.value);
        });

        document.getElementById('audio-toggle')?.addEventListener('click', (e) => {
            const type = document.getElementById('audio-select').value;
            const isSynth = ['brown', 'pink', 'white', 'binaural'].includes(type);
            
            if(e.target.textContent.includes('Stop')) {
                stopAllAudio();
                e.target.textContent = "▶ Start Audio";
                document.getElementById('audio-iframe-box').style.display = 'none';
                return;
            }

            e.target.textContent = "⏹ Stop Audio";
            
            if(isSynth) {
                document.getElementById('audio-iframe-box').style.display = 'none';
                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                synthGain = ctx.createGain();
                synthGain.gain.value = parseFloat(document.getElementById('audio-volume').value);
                synthGain.connect(ctx.destination);
                
                if(type === 'binaural') {
                    const osc1 = ctx.createOscillator(); osc1.frequency.value = 200;
                    const osc2 = ctx.createOscillator(); osc2.frequency.value = 240;
                    const merger = ctx.createChannelMerger(2);
                    osc1.connect(merger, 0, 0); osc2.connect(merger, 0, 1);
                    merger.connect(synthGain);
                    osc1.start(); osc2.start();
                    synthNode = { stop: ()=>{osc1.stop();osc2.stop();}, disconnect: ()=>merger.disconnect() };
                } else {
                    const bSize = 2 * ctx.sampleRate;
                    const buff = ctx.createBuffer(1, bSize, ctx.sampleRate);
                    const out = buff.getChannelData(0);
                    let last=0, b0=0, b1=0, b2=0, b3=0, b4=0, b5=0, b6=0;
                    
                    for(let i=0; i<bSize; i++) {
                        let w = Math.random()*2-1;
                        if(type==='white') { out[i] = w * 0.1; }
                        else if(type==='brown') { last = (last + (0.02 * w)) / 1.02; out[i] = last * 1.5; }
                        else if(type==='pink') {
                            b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759;
                            b2 = 0.96900 * b2 + w * 0.1538520; b3 = 0.86650 * b3 + w * 0.3104856;
                            b4 = 0.55000 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.0168980;
                            out[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11; b6 = w * 0.115926;
                        }
                    }
                    const node = ctx.createBufferSource(); node.buffer = buff; node.loop = true;
                    node.connect(synthGain); node.start();
                    synthNode = node;
                }
            } else {
                document.getElementById('audio-iframe-box').style.display = 'block';
                document.getElementById('audio-frame').src = `https://www.youtube.com/embed/${type}?autoplay=1`;
            }
        });

        document.getElementById('audio-to-main-btn')?.addEventListener('click', () => {
            const select = document.getElementById('audio-select');
            const type = select.value;
            const titleText = select.options[select.selectedIndex].text;
            
            document.getElementById('placeholder-box').style.display = 'none';
            document.getElementById('error-box').style.display = 'none';
            document.getElementById('util-panel').style.display = 'none';
            
            document.getElementById('viewer-1').style.display = 'block';
            document.getElementById('split-btn').style.display = 'flex';
            
            document.getElementById('settings-btn-main').style.display = 'none';
            document.getElementById('current-title').style.display = 'block';
            document.getElementById('current-path').style.display = 'block';
            
            document.getElementById('current-title').textContent = titleText;
            document.getElementById('current-path').textContent = 'Workspace > Audio > ' + titleText;
            
            document.getElementById('frame-1').src = `https://www.youtube.com/embed/${type}?autoplay=1`;
            
            if(document.getElementById('viewer-2').style.display === 'block') {
                document.getElementById('frame-2').src = document.getElementById('frame-1').src;
            }

            stopAllAudio();
            const toggleBtn = document.getElementById('audio-toggle');
            if(toggleBtn) toggleBtn.textContent = "▶ Start Audio";
            document.getElementById('audio-iframe-box').style.display = 'none';
            
            document.getElementById('audio-drawer')?.classList.remove('open');
            
            if (window.innerWidth <= 768) {
                document.getElementById('sidebar')?.classList.remove('mobile-open');
            }
        });

        // ==========================================
        // 7. HEADER, SPLIT, & MODALS
        // ==========================================
        
        document.getElementById('home-btn')?.addEventListener('click', () => {
            document.getElementById('viewer-1').style.display = 'none';
            document.getElementById('viewer-2').style.display = 'none';
            document.getElementById('resizer').style.display = 'none';
            document.getElementById('util-panel').style.display = 'none';
            document.getElementById('placeholder-box').style.display = 'flex';
            document.getElementById('error-box').style.display = 'none';
            
            document.getElementById('current-title').style.display = 'none';
            document.getElementById('current-path').style.display = 'none';
            document.getElementById('home-title-area').style.display = 'flex';
            
            document.getElementById('playlist-select').style.display = 'none';
            
            const f1 = document.getElementById('frame-1');
            const f2 = document.getElementById('frame-2');
            if (f1) f1.src = '';
            if (f2) f2.src = '';
            
            document.querySelectorAll('.book-item').forEach(i => i.classList.remove('active'));
            
            if (window.innerWidth <= 768) {
                document.getElementById('sidebar')?.classList.remove('mobile-open');
            }
        });

        document.getElementById('fs-btn')?.addEventListener('click', () => {
            try { if (!document.fullscreenElement) document.documentElement.requestFullscreen(); else document.exitFullscreen(); } catch(e){}
        });

        document.getElementById('notes-btn')?.addEventListener('click', () => {
            document.getElementById('audio-drawer')?.classList.remove('open');
            document.getElementById('notes-drawer')?.classList.add('open');
        });
        document.getElementById('notes-close')?.addEventListener('click', () => document.getElementById('notes-drawer')?.classList.remove('open'));

        document.getElementById('audio-btn')?.addEventListener('click', () => {
            document.getElementById('notes-drawer')?.classList.remove('open');
            document.getElementById('audio-drawer')?.classList.add('open');
        });
        document.getElementById('audio-close')?.addEventListener('click', () => document.getElementById('audio-drawer')?.classList.remove('open'));

        let isSplit = false;
        document.getElementById('split-btn')?.addEventListener('click', () => {
            isSplit = !isSplit;
            const main = document.getElementById('main-workspace');
            const v1 = document.getElementById('viewer-1');
            const v2 = document.getElementById('viewer-2');
            const res = document.getElementById('resizer');
            
            if(isSplit) {
                main.style.flexDirection = 'row';
                v2.style.display = 'block'; res.style.display = 'flex';
                v1.style.width = '50%'; v2.style.width = '50%';
                document.getElementById('frame-2').src = document.getElementById('frame-1').src;
            } else {
                v2.style.display = 'none'; res.style.display = 'none';
                v1.style.width = '100%';
            }
        });

        let isRes = false;
        document.getElementById('resizer')?.addEventListener('mousedown', () => { isRes=true; document.getElementById('resizer').classList.add('dragging'); document.body.style.cursor='col-resize'; });
        document.addEventListener('mousemove', (e) => {
            if(!isRes) return;
            const rect = document.getElementById('main-workspace').getBoundingClientRect();
            let pct = ((e.clientX - rect.left) / rect.width)*100;
            if(pct>20 && pct<80) { document.getElementById('viewer-1').style.width=`${pct}%`; document.getElementById('viewer-2').style.width=`${100-pct}%`; }
        });
        document.addEventListener('mouseup', () => { if(isRes) { isRes=false; document.getElementById('resizer')?.classList.remove('dragging'); document.body.style.cursor='default'; }});

        document.getElementById('settings-btn-main')?.addEventListener('click', () => {
            document.getElementById('set-theme').value = pomoSettings.theme || 'theme-amoled';
            document.getElementById('set-bg').value = pomoSettings.bg || 'bg-none';
            document.getElementById('set-pomo-theme').value = pomoSettings.pomoTheme || 'plant';
            document.getElementById('set-focus').value = pomoSettings.focusTime || 25;
            document.getElementById('set-icon').value = pomoSettings.icon || '⚡';
            document.querySelectorAll('.color-dot').forEach(d => { d.classList.remove('active'); if(d.getAttribute('data-color') === pomoSettings.accent) d.classList.add('active'); });
            document.getElementById('settings-modal')?.classList.add('open');
        });
        
        document.getElementById('settings-close')?.addEventListener('click', () => document.getElementById('settings-modal')?.classList.remove('open'));
        
        document.getElementById('settings-modal')?.addEventListener('click', (e) => {
            if(e.target === document.getElementById('settings-modal')) {
                document.getElementById('settings-modal').classList.remove('open');
            }
        });
        
        document.querySelectorAll('.color-dot').forEach(d => d.addEventListener('click', (e) => { 
            document.querySelectorAll('.color-dot').forEach(b=>b.classList.remove('active')); e.target.classList.add('active'); 
        }));

        document.getElementById('save-settings')?.addEventListener('click', () => {
            pomoSettings.theme = document.getElementById('set-theme').value;
            pomoSettings.bg = document.getElementById('set-bg').value;
            pomoSettings.pomoTheme = document.getElementById('set-pomo-theme').value;
            pomoSettings.focusTime = parseInt(document.getElementById('set-focus').value);
            pomoSettings.icon = document.getElementById('set-icon').value;
            
            const activeDot = document.querySelector('.color-dot.active');
            if(activeDot) pomoSettings.accent = activeDot.getAttribute('data-color');
            
            try { localStorage.setItem('pomo_settings_pro', JSON.stringify(pomoSettings)); } catch(e){}
            applySettings();
            document.getElementById('settings-modal')?.classList.remove('open');
            if(!isPomoRunning) { pomoSeconds = pomoSettings.focusTime*60; updatePomoDisplay(); }
            window.showToast("Settings applied successfully!");
        });

        // Initialize view finally
        renderLibrary();

    } catch (err) {
        console.error("Critical Application Error:", err);
    }
}

// Assured Execution Wrapper to bypass strict DOM load timing issues
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
