/* audio.js - Audio hub v2: layered, seamless generative sound mixer + online mixes. Exposes window.RRA */
(function () {
  const $ = id => document.getElementById(id);
  const K = 'audio_mix_v2';
  const store = { get(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  const LAYERS = [
    ['brown', '🌊', 'Brown noise', .5], ['pink', '🌸', 'Pink noise', .45], ['white', '📻', 'White noise', .3], ['green', '🍃', 'Green noise', .5],
    ['rain', '🌧️', 'Rain', .6], ['thunder', '⛈️', 'Thunder', .4], ['ocean', '🌅', 'Ocean waves', .6], ['wind', '💨', 'Wind', .45],
    ['stream', '🏞️', 'Stream', .5], ['fire', '🔥', 'Fireplace', .5], ['crickets', '🦗', 'Night crickets', .35], ['cafe', '☕', 'Café murmur', .55],
    ['lofi', '🎹', 'Lo-fi beat (generated)', .6], ['vinyl', '💿', 'Vinyl crackle', .4], ['pad', '🌌', 'Ambient pad', .35], ['binaural', '🎧', 'Binaural beats', .3]
  ];
  const BIN = { delta: ['Delta 2 Hz (deep sleep)', 2], theta: ['Theta 6 Hz (meditation)', 6], alpha: ['Alpha 10 Hz (calm focus)', 10], beta: ['Beta 18 Hz (alert)', 18], gamma: ['Gamma 40 Hz (peak focus)', 40] };
  const PRESETS = {
    'Deep Focus': { brown: .5, pad: .18, binaural: .25, _bin: 'alpha' }, 'Rainy Library': { rain: .6, thunder: .3, pad: .12 },
    'Café Study': { cafe: .6, lofi: .4, vinyl: .25 }, 'Night Owl': { crickets: .45, wind: .25, stream: .3 },
    'Ocean Calm': { ocean: .65, wind: .2, pad: .15 }, 'Lo-fi Beats': { lofi: .65, vinyl: .4, rain: .2 },
    'Gamma Boost': { pink: .3, binaural: .35, _bin: 'gamma' }, 'Sleep': { brown: .35, ocean: .3, binaural: .25, _bin: 'delta' }
  };
  const YT = [['jfKfPfyJRdk', '🎧 Lofi Beats (Lofi Girl Radio)'], ['oT_5l_u30O0', '🎬 Blade Runner Synth (Ambient)'], ['1-xGerv5FOk', '📚 Dark Academia Strings'], ['8nOswEELJbA', '🌿 Studio Ghibli Piano Collection'], ['yJ6C1Gq7N-I', '🌌 Hans Zimmer Epic Focus'], ['XbTq6jCqPDU', '🔥 Mario Kart Study Music'], ['4xDzrUhVKVA', '🌃 Cyberpunk Synthwave'], ['mPZkdNFkNps', '🌧️ Rain & Thunder in Forest']];
  let st = Object.assign({ master: .7, sel: { brown: .5 }, bin: 'alpha', sleep: 0, auto: false }, store.get(K, {}));
  let ctx, master, comp, live = {}, playing = false, sleepT = null, sleepEnd = 0, autoStarted = false, bufs = {};
  const save = () => store.set(K, st);

  /* ---------- engine ---------- */
  function AC() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      comp = ctx.createDynamicsCompressor(); comp.threshold.value = -20; comp.ratio.value = 4; comp.connect(ctx.destination);
      master = ctx.createGain(); master.gain.value = st.master; master.connect(comp);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  window.RRA_ctx = AC; // shared by other modules
  function noiseBuf(type) {
    if (bufs[type]) return bufs[type];
    const c = AC(), sr = c.sampleRate, L = sr * 8, F = Math.floor(sr * .6), N = L + F, b = c.createBuffer(2, L, sr);
    for (let ch = 0; ch < 2; ch++) {
      const o = new Float32Array(N); let last = 0, b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < N; i++) {
        const w = Math.random() * 2 - 1;
        if (type === 'white') o[i] = w * .35;
        else if (type === 'brown') { last = (last + .02 * w) / 1.02; o[i] = last * 3.2; }
        else { b0 = .99886 * b0 + w * .0555179; b1 = .99332 * b1 + w * .0750759; b2 = .969 * b2 + w * .153852; b3 = .8665 * b3 + w * .3104856; b4 = .55 * b4 + w * .5329522; b5 = -.7616 * b5 - w * .016898; o[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * .5362) * .11; b6 = w * .115926; }
      }
      for (let i = 0; i < F; i++) { const t = i / F; o[i] = o[i] * t + o[L + i] * (1 - t); } // seamless loop
      b.getChannelData(ch).set(o.subarray(0, L));
    }
    return bufs[type] = b;
  }
  function sparse(kind) {
    const key = 's' + kind; if (bufs[key]) return bufs[key];
    const c = AC(), sr = c.sampleRate, L = sr * 6, b = c.createBuffer(1, L, sr), o = b.getChannelData(0);
    const P = { rain: [260, .004, .5], fire: [34, .012, 1], vinyl: [14, .002, .6] }[kind];
    for (let e = 0; e < P[0]; e++) { const pos = Math.floor(Math.random() * L), len = Math.floor(sr * P[1] * (.5 + Math.random())), amp = P[2] * Math.random() ** 2; for (let j = 0; j < len; j++) o[(pos + j) % L] += (Math.random() * 2 - 1) * amp * Math.exp(-j / (len * .3)); }
    return bufs[key] = b;
  }
  const loopSrc = (c, b, u) => { const s = u(c.createBufferSource()); s.buffer = b; s.loop = true; s.start(0, Math.random() * (b.duration - 1)); return s; };
  const flt = (c, type, f, q) => { const n = c.createBiquadFilter(); n.type = type; n.frequency.value = f; if (q) n.Q.value = q; return n; };
  const gn = (c, v) => { const g = c.createGain(); g.gain.value = v; return g; };
  const lfo = (c, u, f, depth, target) => { const o = u(c.createOscillator()); o.frequency.value = f; const g = gn(c, depth); o.connect(g); g.connect(target); o.start(); return o; };
  const mf = n => 440 * Math.pow(2, (n - 69) / 12);

  const mk = {
    white: (c, o, u) => loopSrc(c, noiseBuf('white'), u).connect(o),
    pink: (c, o, u) => loopSrc(c, noiseBuf('pink'), u).connect(o),
    brown: (c, o, u) => loopSrc(c, noiseBuf('brown'), u).connect(o),
    green: (c, o, u) => { loopSrc(c, noiseBuf('pink'), u).connect(flt(c, 'bandpass', 520, .7)).connect(gn(c, 2.4)).connect(o); },
    rain: (c, o, u) => {
      loopSrc(c, noiseBuf('pink'), u).connect(flt(c, 'highpass', 500)).connect(flt(c, 'lowpass', 8000)).connect(gn(c, .9)).connect(o);
      loopSrc(c, sparse('rain'), u).connect(flt(c, 'bandpass', 3400, .8)).connect(gn(c, .9)).connect(o);
    },
    thunder: (c, o, u, T) => {
      const roll = () => { const t = c.currentTime + .05, s = c.createBufferSource(), g = gn(c, 0); s.buffer = noiseBuf('brown'); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(1.8, t + .5 + Math.random()); g.gain.exponentialRampToValueAtTime(.001, t + 5 + Math.random() * 3); s.connect(flt(c, 'lowpass', 170)).connect(g).connect(o); s.start(t, Math.random() * 5); s.stop(t + 9); };
      const loop = () => { roll(); T.push(setTimeout(loop, 14000 + Math.random() * 36000)); }; T.push(setTimeout(loop, 2500 + Math.random() * 6000));
    },
    ocean: (c, o, u) => { const w = gn(c, .5); loopSrc(c, noiseBuf('brown'), u).connect(flt(c, 'lowpass', 900)).connect(w).connect(o); lfo(c, u, .085, .4, w.gain); lfo(c, u, .13, .15, w.gain); },
    wind: (c, o, u) => { const bp = flt(c, 'bandpass', 500, .9); loopSrc(c, noiseBuf('pink'), u).connect(bp).connect(gn(c, 1.5)).connect(o); lfo(c, u, .06, 280, bp.frequency); },
    stream: (c, o, u) => { const g = gn(c, 1); loopSrc(c, noiseBuf('white'), u).connect(flt(c, 'bandpass', 2200, .45)).connect(g).connect(o); lfo(c, u, .4, .25, g.gain); },
    fire: (c, o, u) => {
      loopSrc(c, noiseBuf('brown'), u).connect(flt(c, 'lowpass', 400)).connect(gn(c, 1.1)).connect(o);
      loopSrc(c, sparse('fire'), u).connect(flt(c, 'bandpass', 1800, .9)).connect(gn(c, 1.6)).connect(o);
    },
    crickets: (c, o, u) => { const x = u(c.createOscillator()); x.frequency.value = 4300; const a = gn(c, .5), b = gn(c, .5); x.connect(a); a.connect(b); b.connect(gn(c, .08)).connect(o); x.start(); lfo(c, u, 17, .5, a.gain); lfo(c, u, 1.3, .5, b.gain); },
    cafe: (c, o, u) => { const m = gn(c, .6); loopSrc(c, noiseBuf('pink'), u).connect(flt(c, 'bandpass', 800, .6)).connect(m).connect(gn(c, 1.6)).connect(o); [[.37, .15], [.71, .12], [1.13, .1]].forEach(p => lfo(c, u, p[0], p[1], m.gain)); },
    vinyl: (c, o, u) => { loopSrc(c, sparse('vinyl'), u).connect(flt(c, 'highpass', 1500)).connect(gn(c, 1.3)).connect(o); loopSrc(c, noiseBuf('white'), u).connect(flt(c, 'highpass', 4000)).connect(gn(c, .03)).connect(o); },
    binaural: (c, o, u) => {
      const beat = BIN[st.bin][1], car = 190;
      [[-1, car - beat / 2], [1, car + beat / 2]].forEach(p => { const x = u(c.createOscillator()); x.frequency.value = p[1]; const pan = c.createStereoPanner ? c.createStereoPanner() : gn(c, 1); if (pan.pan) pan.pan.value = p[0]; x.connect(pan); pan.connect(o); x.start(); });
    },
    pad: (c, o, u, T) => {
      const CH = [[130.8, 196, 261.6, 329.6], [110, 164.8, 220, 277.2], [116.5, 174.6, 233.1, 293.7], [98, 146.8, 196, 246.9]], lp = flt(c, 'lowpass', 700, .5); lp.connect(o); lfo(c, u, .05, 300, lp.frequency);
      const vs = [0, 1, 2, 3].map(i => { const g = gn(c, .11); g.connect(lp); return [-7, 7].map(d => { const x = u(c.createOscillator()); x.type = 'sawtooth'; x.detune.value = d; x.frequency.value = CH[0][i]; x.connect(g); x.start(); return x; }); });
      let k = 0; T.push(setInterval(() => { k = (k + 1) % CH.length; vs.forEach((os, i) => os.forEach(x => x.frequency.setTargetAtTime(CH[k][i], c.currentTime, 2.5))); }, 14000));
    },
    lofi: (c, o, u, T) => {
      const CHD = [[50, 53, 57, 60, 64], [43, 53, 59, 64, 69], [48, 52, 55, 59, 62], [45, 52, 55, 60, 64]], BPM = 76, BT = 60 / BPM, BAR = BT * 4, warm = flt(c, 'lowpass', 1900); warm.connect(o);
      const env = (g, t, a, d, v) => { g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + a); g.gain.exponentialRampToValueAtTime(.0008, t + a + d); };
      const tone = (n, t, a, d, v, type, dest) => { const x = c.createOscillator(), g = c.createGain(); x.type = type; x.frequency.value = mf(n); env(g, t, a, d, v); x.connect(g); g.connect(dest || warm); x.start(t); x.stop(t + a + d + .1); };
      const nz = (t, dur, f, q, v, type) => { const s = c.createBufferSource(); s.buffer = noiseBuf('white'); const g = c.createGain(); env(g, t, .002, dur, v); s.connect(flt(c, type || 'bandpass', f, q)).connect(g).connect(warm); s.start(t, Math.random() * 6); s.stop(t + dur + .1); };
      const kick = t => { const x = c.createOscillator(), g = c.createGain(); x.frequency.setValueAtTime(120, t); x.frequency.exponentialRampToValueAtTime(42, t + .12); env(g, t, .002, .22, .55); x.connect(g); g.connect(warm); x.start(t); x.stop(t + .3); };
      const PENTA = [72, 74, 76, 79, 81, 84];
      const bar = (t, b) => {
        const ch = CHD[b % 4];
        ch.forEach((n, i) => { const tt = t + i * .014 + Math.random() * .01; tone(n, tt, .03, BAR * .95, .045, 'sine'); tone(n + 12, tt, .03, BAR * .6, .02, 'triangle'); });
        tone(ch[0] - 12, t, .01, BT * .9, .26, 'sine'); tone(ch[0] - 12, t + BT * 2.5, .01, BT * .6, .2, 'sine');
        kick(t); kick(t + BT * 2); if (Math.random() < .5) kick(t + BT * 2.75);
        nz(t + BT, .14, 1800, .8, .12); nz(t + BT * 3, .14, 1800, .8, .12);
        for (let k = 0; k < 8; k++) if (Math.random() < .75) nz(t + k * BT / 2 + (k % 2 ? BT * .09 : 0), .04, 7500, .5, k % 2 ? .035 : .055, 'highpass');
        for (let k = 0; k < 4; k++) if (Math.random() < .4) tone(PENTA[Math.floor(Math.random() * PENTA.length)], t + k * BT + (Math.random() < .5 ? BT / 2 : 0), .01, .5, .05, 'triangle');
      };
      let next = c.currentTime + .15, b = 0;
      const sched = () => { while (next < c.currentTime + .6) { bar(next, b++); next += BAR; } };
      sched(); T.push(setInterval(sched, 150));
    }
  };

  function startLayer(id) {
    if (live[id]) return; const c = AC(), out = c.createGain(), S = [], T = [], h = { out, S, T };
    out.gain.value = 0; out.connect(master);
    try { mk[id](c, out, n => { S.push(n); return n; }, T); } catch (e) { console.error('audio layer', id, e); return; }
    live[id] = h; out.gain.setTargetAtTime(st.sel[id] != null ? st.sel[id] : .5, c.currentTime, .6);
  }
  function stopLayer(id) {
    const h = live[id]; if (!h) return; delete live[id];
    h.T.forEach(t => { clearInterval(t); clearTimeout(t); }); h.out.gain.cancelScheduledValues(ctx.currentTime); h.out.gain.setTargetAtTime(0, ctx.currentTime, .15);
    setTimeout(() => { h.S.forEach(n => { try { n.stop(); } catch (e) {} }); try { h.out.disconnect(); } catch (e) {} }, 900);
  }
  function start(auto) {
    if (!Object.keys(st.sel).length) { st.sel = { brown: .5 }; }
    AC(); master.gain.cancelScheduledValues(ctx.currentTime); master.gain.setTargetAtTime(st.master, ctx.currentTime, .3);
    Object.keys(st.sel).forEach(startLayer); playing = true; autoStarted = !!auto; paint(); armSleep();
  }
  function stop() { if (!ctx) { playing = false; paint(); return; } Object.keys(live).forEach(stopLayer); playing = false; autoStarted = false; clearTimeout(sleepT); sleepT = null; sleepEnd = 0; paint(); }
  function toggle() { playing ? stop() : start(); }
  function armSleep() { clearTimeout(sleepT); sleepT = null; sleepEnd = 0; if (st.sleep > 0 && playing) { sleepEnd = Date.now() + st.sleep * 60000; sleepT = setTimeout(() => { if (ctx) master.gain.setTargetAtTime(0, ctx.currentTime, 3); setTimeout(stop, 9000); }, st.sleep * 60000); } }
  function applyPreset(name) {
    const p = PRESETS[name]; if (!p) return false; const was = playing;
    Object.keys(live).forEach(stopLayer); st.sel = {}; Object.keys(p).forEach(k => { if (k === '_bin') st.bin = p[k]; else st.sel[k] = p[k]; }); save();
    if (was || true) setTimeout(() => start(), was ? 700 : 0); return true;
  }

  /* ---------- UI ---------- */
  function buildUI() {
    const wrap = document.querySelector('#audio-drawer .audio-wrapper'); if (!wrap) return;
    wrap.innerHTML = `<div class="aud">
      <div class="aud-top"><button class="primary-btn" id="aud-play">▶ Play mix</button><label class="aud-vol" title="Master volume">🔊<input type="range" id="aud-master" min="0" max="1" step="0.01"></label></div>
      <div class="aud-row"><label for="aud-sleep">😴 Sleep timer</label><select id="aud-sleep"><option value="0">Off</option>${[15, 30, 45, 60, 90, 120].map(m => `<option value="${m}">${m} min</option>`).join('')}</select><span id="aud-left" class="muted"></span></div>
      <label class="aud-chk"><input type="checkbox" id="aud-auto"> Auto-play while a focus session runs</label>
      <h5>Presets</h5><div class="aud-presets">${Object.keys(PRESETS).map(p => `<button class="chip" data-preset="${p}">${p}</button>`).join('')}</div>
      <h5>Mixer <small class="muted">(tap a sound to add it; slide for volume)</small></h5>
      <div class="aud-layers">${LAYERS.map(l => `<div class="aud-l" data-id="${l[0]}"><button class="aud-t" data-t="${l[0]}"><span>${l[1]}</span>${l[2]}</button><input type="range" min="0.05" max="1" step="0.01" data-v="${l[0]}"></div>`).join('')}</div>
      <div class="aud-row" id="aud-binrow"><label for="aud-bin">🎧 Binaural mode</label><select id="aud-bin">${Object.keys(BIN).map(k => `<option value="${k}">${BIN[k][0]}</option>`).join('')}</select></div>
      <p class="muted" style="font-size:.78em;margin:2px 0 8px">Binaural beats work with stereo headphones. Generated sounds loop seamlessly and use no data.</p>
      <h5>Online mixes (YouTube)</h5>
      <select id="aud-yt">${YT.map(y => `<option value="${y[0]}">${y[1]}</option>`).join('')}</select>
      <div class="aud-yrow"><button class="outline-btn" id="aud-yhere">▶ Play here</button><button class="outline-btn" id="aud-ymain">🖥️ Main screen</button><button class="outline-btn" id="aud-ystop">⏹</button></div>
      <p id="aud-ymsg" class="muted" style="font-size:.8em"></p>
      <div id="audio-iframe-box" style="display:none"><iframe id="audio-frame" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen frameborder="0"></iframe></div>
    </div>`;
    $('aud-master').value = st.master; $('aud-sleep').value = String(st.sleep); $('aud-auto').checked = !!st.auto; $('aud-bin').value = st.bin;
    paint();
  }
  function paint() {
    const p = $('aud-play'); if (!p) return;
    p.textContent = playing ? '⏹ Stop' : '▶ Play mix'; p.classList.toggle('danger', playing);
    document.querySelectorAll('.aud-l').forEach(r => { const id = r.dataset.id, on = st.sel[id] != null; r.classList.toggle('on', on); const s = r.querySelector('input'); s.value = on ? st.sel[id] : (LAYERS.find(l => l[0] === id)[3]); s.disabled = !on; });
    document.querySelectorAll('.aud-presets .chip').forEach(c => c.classList.remove('active'));
    const bb = $('audio-btn'); if (bb) bb.classList.toggle('aud-live', playing);
    const br = $('aud-binrow'); if (br) br.style.display = st.sel.binaural != null ? 'flex' : 'none';
  }
  setInterval(() => { const l = $('aud-left'); if (!l) return; l.textContent = sleepEnd ? Math.max(0, Math.ceil((sleepEnd - Date.now()) / 60000)) + ' min left' : ''; }, 5000);
  function ytStop() { const f = $('audio-frame'); if (f) f.src = ''; const b = $('audio-iframe-box'); if (b) b.style.display = 'none'; }
  async function ytGo(main) {
    const id = $('aud-yt').value, msg = $('aud-ymsg'); msg.textContent = '';
    try { const r = window.RRX && window.RRX.checkId ? await window.RRX.checkId(id) : null; if (r && (r.s === 'gone' || r.s === 'blocked')) { msg.textContent = '⚠ This mix is no longer available on YouTube. Try another one.'; return; } } catch (e) {}
    const url = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
    if (main) {
      const t = $('aud-yt').options[$('aud-yt').selectedIndex].text, X = window.RR && window.RR.x; if (!X) return;
      X.clearCur(); X.setView('viewer'); $('lecture-bar').style.display = 'none'; $('current-title').textContent = t; $('current-path').textContent = 'Workspace › Audio › ' + t;
      $('frame-1').src = url; ytStop(); $('audio-drawer').classList.remove('open');
    } else { $('audio-iframe-box').style.display = 'block'; $('audio-frame').src = url; }
  }
  function bind() {
    const d = $('audio-drawer'); if (!d) return;
    d.addEventListener('click', e => {
      const t = e.target.closest('[data-t]'), pr = e.target.closest('[data-preset]');
      if (e.target.closest('#aud-play')) toggle();
      else if (t) { const id = t.dataset.t; if (st.sel[id] != null) { delete st.sel[id]; stopLayer(id); } else { st.sel[id] = LAYERS.find(l => l[0] === id)[3]; if (playing) startLayer(id); } save(); paint(); }
      else if (pr) { applyPreset(pr.dataset.preset); pr.classList.add('active'); }
      else if (e.target.closest('#aud-yhere')) ytGo(false); else if (e.target.closest('#aud-ymain')) ytGo(true); else if (e.target.closest('#aud-ystop')) ytStop();
    });
    d.addEventListener('input', e => {
      const v = e.target.dataset && e.target.dataset.v;
      if (v) { st.sel[v] = parseFloat(e.target.value); if (live[v]) live[v].out.gain.setTargetAtTime(st.sel[v], ctx.currentTime, .1); save(); }
      else if (e.target.id === 'aud-master') { st.master = parseFloat(e.target.value); if (master) master.gain.setTargetAtTime(st.master, ctx.currentTime, .1); save(); }
    });
    d.addEventListener('change', e => {
      if (e.target.id === 'aud-sleep') { st.sleep = +e.target.value; save(); armSleep(); }
      else if (e.target.id === 'aud-auto') { st.auto = e.target.checked; save(); }
      else if (e.target.id === 'aud-bin') { st.bin = e.target.value; save(); if (live.binaural) { stopLayer('binaural'); setTimeout(() => startLayer('binaural'), 300); } }
    });
  }
  /* auto-play with the Focus timer */
  setInterval(() => {
    try {
      if (!st.auto || !window.RR || !RR.pomo) return; const P = RR.pomo.state(), focusing = P.running && P.mode === 'focus';
      if (focusing && !playing) start(true); else if (!focusing && playing && autoStarted) stop();
    } catch (e) {}
  }, 1500);
  document.addEventListener('visibilitychange', () => { if (!document.hidden && ctx && ctx.state === 'suspended' && playing) ctx.resume(); });

  window.RRA = {
    play: name => { if (PRESETS[name]) return applyPreset(name); const l = LAYERS.find(x => x[0] === name || x[2].toLowerCase().includes(String(name).toLowerCase())); if (!l) return false; st.sel = {}; st.sel[l[0]] = l[3]; Object.keys(live).forEach(stopLayer); save(); start(); return l[2]; },
    stop, toggle, playing: () => playing, presets: () => Object.keys(PRESETS), layers: () => LAYERS.map(l => l[0]),
    setSleep: m => { st.sleep = +m || 0; save(); const s = $('aud-sleep'); if (s) s.value = String(st.sleep); armSleep(); }, names: () => LAYERS.map(l => [l[0], l[2]])
  };
  const go = () => { buildUI(); bind(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
})();
