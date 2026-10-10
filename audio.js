/* audio.js v3 - Audio hub: 100% synthesized, layered, seamless sound mixer. Drop-in replacement. Exposes window.RRA + window.RRA_ctx.
   No network, no YouTube: every sound is generated with the Web Audio API. */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const K = 'audio_mix_v3', mem = {};
  const store = {
    get(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return k in mem ? mem[k] : d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { mem[k] = v; } }
  };
  const GROUPS = ['Noise colours', 'Nature', 'Ambience', 'Music (generated)', 'Tones & focus'];
  const LAYERS = [
    ['brown', '🌊', 'Brown noise', .5, 0], ['pink', '🌸', 'Pink noise', .45, 0], ['white', '📻', 'White noise', .3, 0], ['green', '🍃', 'Green noise', .5, 0], ['blue', '🔷', 'Blue noise', .25, 0], ['violet', '🟣', 'Violet noise', .2, 0], ['grey', '🩶', 'Grey noise', .35, 0],
    ['rain', '🌧️', 'Rain', .6, 1], ['rainroof', '🏠', 'Rain on tin roof', .55, 1], ['thunder', '⛈️', 'Thunder', .4, 1], ['ocean', '🌅', 'Ocean waves', .6, 1], ['wind', '💨', 'Wind', .45, 1], ['stream', '🏞️', 'Stream', .5, 1], ['waterfall', '💦', 'Waterfall', .45, 1], ['fire', '🔥', 'Fireplace', .5, 1], ['snow', '❄️', 'Snowy wind', .4, 1], ['forest', '🌲', 'Forest birds', .5, 1], ['crickets', '🦗', 'Night crickets', .35, 1], ['frogs', '🐸', 'Pond frogs', .35, 1], ['underwater', '🫧', 'Underwater', .5, 1],
    ['cafe', '☕', 'Café murmur', .55, 2], ['library', '📚', 'Quiet library', .5, 2], ['keyboard', '⌨️', 'Keyboard typing', .4, 2], ['clock', '🕰️', 'Ticking clock', .3, 2], ['train', '🚆', 'Train ride', .5, 2], ['plane', '✈️', 'Airplane cabin', .45, 2], ['fan', '🌀', 'Fan hum', .45, 2], ['city', '🌃', 'Night city', .45, 2], ['heartbeat', '💓', 'Heartbeat', .3, 2], ['spacehum', '🚀', 'Spaceship hum', .4, 2], ['vinyl', '💿', 'Vinyl crackle', .4, 2],
    ['lofi', '🎹', 'Lo-fi beat', .6, 3], ['chillhop', '🎷', 'Chillhop beat', .6, 3], ['jazz', '🎺', 'Late-night jazz', .55, 3], ['synth', '🌆', 'Synthwave', .5, 3], ['piano', '🎼', 'Soft piano', .55, 3], ['musicbox', '🧸', 'Music box', .45, 3], ['harp', '🪕', 'Harp', .5, 3], ['pad', '🌌', 'Ambient pad', .35, 3], ['choir', '👼', 'Ethereal choir', .35, 3], ['tanpura', '🪔', 'Tanpura drone', .5, 3], ['drone', '🕉️', 'Deep drone', .35, 3], ['bowls', '🔔', 'Singing bowls', .5, 3], ['windchimes', '🎐', 'Wind chimes', .4, 3],
    ['binaural', '🎧', 'Binaural beats', .3, 4], ['isochronic', '📶', 'Isochronic pulses', .3, 4], ['schumann', '🌍', 'Schumann 7.83 Hz', .3, 4], ['tone432', '🎵', '432 Hz tone', .25, 4]
  ];
  const IDS = LAYERS.map(l => l[0]), LBY = {}; LAYERS.forEach(l => LBY[l[0]] = l);
  const BIN = { delta: ['Delta 2 Hz (deep sleep)', 2], theta: ['Theta 6 Hz (meditation)', 6], alpha: ['Alpha 10 Hz (calm focus)', 10], beta: ['Beta 18 Hz (alert)', 18], gamma: ['Gamma 40 Hz (peak focus)', 40] };
  const PRESETS = {
    'Deep Focus': { brown: .5, pad: .18, binaural: .25, _bin: 'alpha' }, 'Rainy Library': { rain: .6, thunder: .3, pad: .12 }, 'Café Study': { cafe: .6, lofi: .4, vinyl: .25 },
    'Night Owl': { crickets: .45, wind: .25, stream: .3 }, 'Ocean Calm': { ocean: .65, wind: .2, pad: .15 }, 'Lo-fi Beats': { lofi: .65, vinyl: .4, rain: .2 },
    'Gamma Boost': { pink: .3, binaural: .35, _bin: 'gamma' }, 'Sleep': { brown: .35, ocean: .3, binaural: .25, _bin: 'delta' },
    'Library Night': { library: .55, rainroof: .35, clock: .2, pad: .1 }, 'Forest Morning': { forest: .7, stream: .35, windchimes: .2 }, 'Study Jazz': { jazz: .6, rain: .25, vinyl: .2 },
    'Synthwave Drive': { synth: .5, rain: .2, wind: .1 }, 'Tanpura Focus': { tanpura: .55, drone: .25, binaural: .2, _bin: 'alpha' }, 'Meditation': { bowls: .5, drone: .3, choir: .2 },
    'Piano & Rain': { piano: .55, rain: .45, thunder: .15 }, 'Heartbeat Sleep': { heartbeat: .3, brown: .3, underwater: .2 }, 'Train Journey': { train: .55, rain: .2, wind: .15 },
    'Typing Flow': { keyboard: .5, cafe: .25, lofi: .3 }, 'Schumann Calm': { schumann: .3, forest: .3, stream: .3 }, 'Midnight City': { city: .5, rain: .3, chillhop: .4 },
    'Space Study': { spacehum: .5, pad: .15, binaural: .2, _bin: 'theta' }, 'Cozy Cabin': { fire: .55, snow: .4, musicbox: .25 }, 'Storm': { rain: .7, thunder: .5, wind: .4 }, 'Exam Hall': { fan: .3, clock: .3, pink: .12 }
  };
  const clean = o => { const r = {}; Object.keys(o || {}).forEach(k => { if (LBY[k] && typeof o[k] === 'number') r[k] = o[k]; }); return r; };
  let st = Object.assign({ master: .7, sel: { brown: .5 }, bin: 'alpha', sleep: 0, auto: false, custom: {}, last: '' }, store.get(K, {}));
  st.sel = clean(st.sel); if (!BIN[st.bin]) st.bin = 'alpha'; if (!st.custom || typeof st.custom !== 'object') st.custom = {};
  let ctx, master, comp, rvIn, mixT = null, live = {}, playing = false, sleepT = null, sleepEnd = 0, autoStarted = false, bufs = {};
  const save = () => store.set(K, st);

  /* ---------- engine ---------- */
  function AC() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      comp = ctx.createDynamicsCompressor(); comp.threshold.value = -20; comp.ratio.value = 4; comp.connect(ctx.destination);
      master = ctx.createGain(); master.gain.value = st.master; master.connect(comp);
      const L = Math.floor(ctx.sampleRate * 2.8), ib = ctx.createBuffer(2, L, ctx.sampleRate);
      for (let ch = 0; ch < 2; ch++) { const d = ib.getChannelData(ch); for (let i = 0; i < L; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / L, 2.8); }
      rvIn = ctx.createGain(); const cv = ctx.createConvolver(); cv.buffer = ib; const rg = ctx.createGain(); rg.gain.value = .9; rvIn.connect(cv); cv.connect(rg); rg.connect(master);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  window.RRA_ctx = AC; // shared by other modules (timer chime)
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
    const P = { rain: [260, .004, .5], tin: [420, .005, .7], fire: [34, .012, 1], vinyl: [14, .002, .6] }[kind];
    for (let e = 0; e < P[0]; e++) { const pos = Math.floor(Math.random() * L), len = Math.floor(sr * P[1] * (.5 + Math.random())), amp = P[2] * Math.random() ** 2; for (let j = 0; j < len; j++) o[(pos + j) % L] += (Math.random() * 2 - 1) * amp * Math.exp(-j / (len * .3)); }
    return bufs[key] = b;
  }
  const loopSrc = (c, b, u) => { const s = u(c.createBufferSource()); s.buffer = b; s.loop = true; s.start(0, Math.random() * (b.duration - 1)); return s; };
  const flt = (c, type, f, q, g) => { const n = c.createBiquadFilter(); n.type = type; n.frequency.value = f; if (q) n.Q.value = q; if (g != null) n.gain.value = g; return n; };
  const gn = (c, v) => { const g = c.createGain(); g.gain.value = v; return g; };
  const lfo = (c, u, f, depth, target) => { const o = u(c.createOscillator()); o.frequency.value = f; const g = gn(c, depth); o.connect(g); g.connect(target); o.start(); return o; };
  const mf = n => 440 * Math.pow(2, (n - 69) / 12);
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const rvSend = (c, node, amt) => { const g = gn(c, amt); node.connect(g); g.connect(rvIn); };
  const envG = (c, t, a, d, v) => { const g = c.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + a); g.gain.exponentialRampToValueAtTime(.0008, t + a + d); return g; };
  const burst = (c, dst, t, d, f, q, v, type) => { const s = c.createBufferSource(); s.buffer = noiseBuf('white'); s.loop = true; s.connect(flt(c, type || 'bandpass', f, q)).connect(envG(c, t, .002, d, v)).connect(dst); s.start(t, Math.random() * 6); s.stop(t + d + .05); };
  const thump = (c, dst, t, f0, f1, d, v, type) => { const x = c.createOscillator(); x.type = type || 'sine'; x.frequency.setValueAtTime(f0, t); x.frequency.exponentialRampToValueAtTime(f1, t + d * .6); x.connect(envG(c, t, .002, d, v)).connect(dst); x.start(t); x.stop(t + d + .05); };
  /* look-ahead scheduler: calls fn(time) at random gaps (seconds); robust in background tabs */
  const spawn = (c, T, fn, min, max, first) => { let next = c.currentTime + (first || .3); const run = () => { while (next < c.currentTime + 2.5) { fn(next); next += min + Math.random() * (max - min); } }; run(); T.push(setInterval(run, 400)); };
  const panner = (c, dst, p) => { if (!c.createStereoPanner) return dst; const n = c.createStereoPanner(); n.pan.value = p; n.connect(dst); return n; };

  /* melodic one-shots: piano, music box, harp, chimes, bowls */
  const notes = cfg => (c, o, u, T) => {
    const out = gn(c, 1), lp = flt(c, 'lowpass', cfg.lp || 3200); out.connect(lp); lp.connect(o); rvSend(c, lp, cfg.rv || .5);
    let ri = 0, cnt = 0;
    const voice = (n, t, v) => { const f = mf(n); cfg.p.forEach(p => { const x = c.createOscillator(), g = c.createGain(); x.type = cfg.type || 'sine'; x.frequency.value = f * p[0]; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(p[1] * v, t + (cfg.att || .01)); g.gain.exponentialRampToValueAtTime(.0008, t + cfg.dec); x.connect(g); g.connect(out); x.start(t); x.stop(t + cfg.dec + .1); }); };
    spawn(c, T, t => {
      if (++cnt % 12 === 0) ri = (ri + 1) % cfg.roots.length; const base = cfg.base + cfg.roots[ri];
      if (cfg.run) { const n = 4 + Math.floor(Math.random() * 3), s0 = Math.floor(Math.random() * 3); for (let i = 0; i < n; i++) voice(base + cfg.scale[Math.min(cfg.scale.length - 1, s0 + i)], t + i * .13, .3); }
      else { voice(base + pick(cfg.scale), t, .35 + Math.random() * .2); if (Math.random() < cfg.dy) voice(base + pick(cfg.scale) - 12, t + .02, .25); }
    }, cfg.gap[0], cfg.gap[1]);
  };
  /* band / beat makers: lo-fi, chillhop, jazz, synthwave */
  const song = cfg => (c, o, u, T) => {
    const BT = 60 / cfg.bpm, BAR = BT * 4, warm = flt(c, 'lowpass', cfg.cut); warm.connect(o); rvSend(c, warm, cfg.rv);
    const tone = (n, t, a, d, v, type) => { const x = c.createOscillator(); x.type = type; x.frequency.value = mf(n); x.connect(envG(c, t, a, d, v)).connect(warm); x.start(t); x.stop(t + a + d + .1); };
    const kick = (t, v) => thump(c, warm, t, 120, 42, .22, v || .55, 'sine'), snare = (t, v) => burst(c, warm, t, .14, 1800, .8, v || .12, 'bandpass'), hat = (t, v) => burst(c, warm, t, .04, 7500, .5, v, 'highpass');
    const bar = (t, b) => {
      const ch = cfg.chords[b % cfg.chords.length], R = Math.random;
      if (cfg.comp === 'saw') ch.forEach(n => tone(n, t, .06, BAR * .9, .028, 'sawtooth'));
      else ch.forEach((n, i) => { const tt = t + i * .014 + R() * .01; tone(n, tt, .03, BAR * .95, .045, 'sine'); tone(n + 12, tt, .03, BAR * .6, .02, 'triangle'); });
      if (cfg.bass === 'root') { tone(ch[0] - 12, t, .01, BT * .9, .26, 'sine'); tone(ch[0] - 12, t + BT * 2.5, .01, BT * .6, .2, 'sine'); }
      else if (cfg.bass === 'walk') { const w = [0, R() < .5 ? 2 : 4, 7, R() < .5 ? 5 : 9]; for (let k = 0; k < 4; k++) tone(ch[0] - 12 + w[k], t + k * BT, .01, BT * .85, .24, 'triangle'); }
      else for (let k = 0; k < 8; k++) tone(ch[0] - 24, t + k * BT / 2, .004, BT * .42, .12, 'sawtooth');
      if (cfg.drums === 'lofi') { kick(t); kick(t + BT * 2); if (R() < .5) kick(t + BT * 2.75); snare(t + BT); snare(t + BT * 3); for (let k = 0; k < 8; k++) if (R() < .75) hat(t + k * BT / 2 + (k % 2 ? BT * .09 : 0), k % 2 ? .035 : .055); }
      else if (cfg.drums === 'brush') { for (let k = 0; k < 4; k++) { burst(c, warm, t + k * BT, BT * .7, 5000, .4, .05, 'highpass'); hat(t + BT * (k + .66), .04); } thump(c, warm, t, 100, 50, .15, .12); thump(c, warm, t + BT * 2, 100, 50, .15, .1); }
      else { for (let k = 0; k < 4; k++) { kick(t + k * BT, .5); hat(t + k * BT + BT / 2, .05); } snare(t + BT, .16); snare(t + BT * 3, .16); }
      if (cfg.arp) for (let k = 0; k < 8; k++) tone(ch[k % ch.length] + 12, t + k * BT / 2, .005, BT * .4, .03, 'sawtooth');
      for (let k = 0; k < 4; k++) if (R() < cfg.melP) tone(pick(cfg.scale), t + k * BT + (R() < .5 ? BT / 2 : 0), .01, .5, .05, 'triangle');
    };
    let next = c.currentTime + .15, b = 0; const sched = () => { while (next < c.currentTime + 2) { bar(next, b++); next += BAR; } }; sched(); T.push(setInterval(sched, 250));
  };

  const mk = {
    white: (c, o, u) => loopSrc(c, noiseBuf('white'), u).connect(o),
    pink: (c, o, u) => loopSrc(c, noiseBuf('pink'), u).connect(o),
    brown: (c, o, u) => loopSrc(c, noiseBuf('brown'), u).connect(o),
    green: (c, o, u) => { loopSrc(c, noiseBuf('pink'), u).connect(flt(c, 'bandpass', 520, .7)).connect(gn(c, 2.4)).connect(o); },
    blue: (c, o, u) => { loopSrc(c, noiseBuf('pink'), u).connect(flt(c, 'highpass', 2500)).connect(gn(c, 3)).connect(o); },
    violet: (c, o, u) => { loopSrc(c, noiseBuf('white'), u).connect(flt(c, 'highpass', 6000)).connect(gn(c, 1.6)).connect(o); },
    grey: (c, o, u) => { loopSrc(c, noiseBuf('white'), u).connect(flt(c, 'lowshelf', 150, 0, 9)).connect(flt(c, 'highshelf', 8000, 0, 8)).connect(flt(c, 'peaking', 3000, .5, -9)).connect(o); },
    rain: (c, o, u) => {
      loopSrc(c, noiseBuf('pink'), u).connect(flt(c, 'highpass', 500)).connect(flt(c, 'lowpass', 8000)).connect(gn(c, .9)).connect(o);
      loopSrc(c, sparse('rain'), u).connect(flt(c, 'bandpass', 3400, .8)).connect(gn(c, .9)).connect(o);
    },
    rainroof: (c, o, u) => {
      loopSrc(c, noiseBuf('pink'), u).connect(flt(c, 'highpass', 900)).connect(flt(c, 'lowpass', 7000)).connect(gn(c, .6)).connect(o);
      loopSrc(c, sparse('tin'), u).connect(flt(c, 'bandpass', 2200, 1.1)).connect(gn(c, 1.3)).connect(o);
      loopSrc(c, sparse('rain'), u).connect(flt(c, 'lowpass', 700)).connect(gn(c, 1.1)).connect(o);
    },
    thunder: (c, o, u, T) => {
      const roll = () => { const t = c.currentTime + .05, s = c.createBufferSource(), g = gn(c, 0); s.buffer = noiseBuf('brown'); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(1.8, t + .5 + Math.random()); g.gain.exponentialRampToValueAtTime(.001, t + 5 + Math.random() * 3); s.connect(flt(c, 'lowpass', 170)).connect(g).connect(o); s.start(t, Math.random() * 5); s.stop(t + 9); };
      const loop = () => { roll(); T.push(setTimeout(loop, 14000 + Math.random() * 36000)); }; T.push(setTimeout(loop, 2500 + Math.random() * 6000));
    },
    ocean: (c, o, u) => { const w = gn(c, .5); loopSrc(c, noiseBuf('brown'), u).connect(flt(c, 'lowpass', 900)).connect(w).connect(o); lfo(c, u, .085, .4, w.gain); lfo(c, u, .13, .15, w.gain); },
    wind: (c, o, u) => { const bp = flt(c, 'bandpass', 500, .9); loopSrc(c, noiseBuf('pink'), u).connect(bp).connect(gn(c, 1.5)).connect(o); lfo(c, u, .06, 280, bp.frequency); },
    snow: (c, o, u) => { const g = gn(c, .7); loopSrc(c, noiseBuf('pink'), u).connect(flt(c, 'highpass', 1200)).connect(flt(c, 'lowpass', 4200)).connect(g).connect(o); lfo(c, u, .05, .35, g.gain); },
    stream: (c, o, u) => { const g = gn(c, 1); loopSrc(c, noiseBuf('white'), u).connect(flt(c, 'bandpass', 2200, .45)).connect(g).connect(o); lfo(c, u, .4, .25, g.gain); },
    waterfall: (c, o, u) => { loopSrc(c, noiseBuf('white'), u).connect(flt(c, 'lowpass', 5200)).connect(gn(c, 1.1)).connect(o); loopSrc(c, noiseBuf('pink'), u).connect(flt(c, 'lowpass', 1200)).connect(gn(c, 1.6)).connect(o); },
    fire: (c, o, u) => {
      loopSrc(c, noiseBuf('brown'), u).connect(flt(c, 'lowpass', 400)).connect(gn(c, 1.1)).connect(o);
      loopSrc(c, sparse('fire'), u).connect(flt(c, 'bandpass', 1800, .9)).connect(gn(c, 1.6)).connect(o);
    },
    crickets: (c, o, u) => { const x = u(c.createOscillator()); x.frequency.value = 4300; const a = gn(c, .5), b = gn(c, .5); x.connect(a); a.connect(b); b.connect(gn(c, .08)).connect(o); x.start(); lfo(c, u, 17, .5, a.gain); lfo(c, u, 1.3, .5, b.gain); },
    forest: (c, o, u, T) => {
      const g = gn(c, .5); loopSrc(c, noiseBuf('pink'), u).connect(flt(c, 'bandpass', 1400, .5)).connect(g).connect(o); lfo(c, u, .07, .3, g.gain);
      spawn(c, T, t => { const f = 2400 + Math.random() * 3000, n = 2 + Math.floor(Math.random() * 4), dst = panner(c, o, Math.random() * 1.6 - .8); for (let i = 0; i < n; i++) { const s = t + i * .11, x = c.createOscillator(), e = c.createGain(), up = Math.random() < .5; x.frequency.setValueAtTime(f * (up ? .8 : 1.2), s); x.frequency.exponentialRampToValueAtTime(f * (up ? 1.25 : .75), s + .07); e.gain.setValueAtTime(0, s); e.gain.linearRampToValueAtTime(.12, s + .012); e.gain.exponentialRampToValueAtTime(.001, s + .09); x.connect(e); e.connect(dst); x.start(s); x.stop(s + .12); } }, 1.5, 7);
    },
    frogs: (c, o, u, T) => {
      spawn(c, T, t => { const f = 180 + Math.random() * 120, n = 3 + Math.floor(Math.random() * 3), dst = panner(c, o, Math.random() * 1.4 - .7), bp = flt(c, 'bandpass', 650, 4); bp.connect(dst); for (let i = 0; i < n; i++) { const s = t + i * .09, x = c.createOscillator(); x.type = 'sawtooth'; x.frequency.setValueAtTime(f * 1.3, s); x.frequency.exponentialRampToValueAtTime(f, s + .06); x.connect(envG(c, s, .01, .06, .5)).connect(bp); x.start(s); x.stop(s + .1); } }, 1.2, 5);
    },
    underwater: (c, o, u, T) => {
      const g = gn(c, 1.6); loopSrc(c, noiseBuf('brown'), u).connect(flt(c, 'lowpass', 350)).connect(g).connect(o); lfo(c, u, .11, .4, g.gain);
      spawn(c, T, t => { const x = c.createOscillator(), f = 300 + Math.random() * 300; x.frequency.setValueAtTime(f, t); x.frequency.exponentialRampToValueAtTime(f * 2.2, t + .08); x.connect(envG(c, t, .005, .09, .1)).connect(panner(c, o, Math.random() * 1.4 - .7)); x.start(t); x.stop(t + .16); }, .3, 1.6);
    },
    cafe: (c, o, u) => { const m = gn(c, .6); loopSrc(c, noiseBuf('pink'), u).connect(flt(c, 'bandpass', 800, .6)).connect(m).connect(gn(c, 1.6)).connect(o); [[.37, .15], [.71, .12], [1.13, .1]].forEach(p => lfo(c, u, p[0], p[1], m.gain)); },
    library: (c, o, u, T) => {
      loopSrc(c, noiseBuf('pink'), u).connect(flt(c, 'lowpass', 600)).connect(gn(c, .55)).connect(o);
      spawn(c, T, t => { burst(c, o, t, .4, 3800, .7, .14, 'bandpass'); if (Math.random() < .3) thump(c, o, t + .1, 120, 80, .08, .12, 'sine'); }, 7, 18, 3);
    },
    keyboard: (c, o, u, T) => {
      spawn(c, T, t => { const k = 3 + Math.floor(Math.random() * 9); let s = t; for (let i = 0; i < k; i++) { s += .07 + Math.random() * .1; burst(c, o, s, .02, 3000, 1, .3, 'bandpass'); thump(c, o, s, 170, 110, .04, .22, 'sine'); } }, 1.5, 6);
    },
    clock: (c, o, u, T) => { let i = 0; spawn(c, T, t => { i ^= 1; burst(c, o, t, .03, i ? 2600 : 2000, 2, .5, 'bandpass'); thump(c, o, t, i ? 1300 : 1000, 700, .03, .15, 'sine'); }, 1, 1); },
    train: (c, o, u, T) => {
      loopSrc(c, noiseBuf('brown'), u).connect(flt(c, 'lowpass', 200)).connect(gn(c, .9)).connect(o);
      spawn(c, T, t => { [0, .14].forEach(d => { burst(c, o, t + d, .05, 700, 1.2, .5, 'bandpass'); thump(c, o, t + d, 90, 60, .08, .28, 'sine'); }); }, .5, .5);
    },
    plane: (c, o, u) => {
      loopSrc(c, noiseBuf('brown'), u).connect(flt(c, 'lowpass', 600)).connect(gn(c, 1.6)).connect(o);
      loopSrc(c, noiseBuf('pink'), u).connect(flt(c, 'highpass', 2000)).connect(flt(c, 'lowpass', 5000)).connect(gn(c, .25)).connect(o);
      [92, 184].forEach(f => { const x = u(c.createOscillator()); x.frequency.value = f; x.connect(gn(c, .03)).connect(o); x.start(); });
    },
    fan: (c, o, u) => {
      loopSrc(c, noiseBuf('brown'), u).connect(flt(c, 'lowpass', 260)).connect(gn(c, 1.2)).connect(o);
      const g = gn(c, .5); loopSrc(c, noiseBuf('pink'), u).connect(flt(c, 'bandpass', 700, .8)).connect(g).connect(o); lfo(c, u, .5, .08, g.gain);
    },
    city: (c, o, u, T) => {
      const g = gn(c, .6); loopSrc(c, noiseBuf('brown'), u).connect(flt(c, 'bandpass', 220, .5)).connect(gn(c, 2)).connect(o);
      loopSrc(c, noiseBuf('pink'), u).connect(flt(c, 'bandpass', 900, .6)).connect(g).connect(o); lfo(c, u, .05, .3, g.gain);
      spawn(c, T, t => { const s = c.createBufferSource(), bp = flt(c, 'bandpass', 350, 1), e = c.createGain(); s.buffer = noiseBuf('pink'); s.loop = true; bp.frequency.setValueAtTime(350, t); bp.frequency.linearRampToValueAtTime(1100, t + 1.5); bp.frequency.linearRampToValueAtTime(350, t + 3.5); e.gain.setValueAtTime(0, t); e.gain.linearRampToValueAtTime(.7, t + 1.6); e.gain.linearRampToValueAtTime(0, t + 3.6); s.connect(bp); bp.connect(e); e.connect(panner(c, o, Math.random() * 1.6 - .8)); s.start(t, Math.random() * 4); s.stop(t + 3.7); }, 6, 16, 2);
    },
    heartbeat: (c, o, u, T) => { spawn(c, T, t => { thump(c, o, t, 70, 45, .16, .9, 'sine'); thump(c, o, t + .3, 60, 40, .14, .55, 'sine'); }, .98, 1.02); },
    spacehum: (c, o, u) => {
      const lp = flt(c, 'lowpass', 240, .6); lp.connect(o); lfo(c, u, .03, 120, lp.frequency);
      [55, 82.4, 110.2].forEach((f, i) => { const x = u(c.createOscillator()); x.type = 'sawtooth'; x.frequency.value = f; x.detune.value = i * 4 - 4; x.connect(gn(c, .08)).connect(lp); x.start(); });
    },
    vinyl: (c, o, u) => { loopSrc(c, sparse('vinyl'), u).connect(flt(c, 'highpass', 1500)).connect(gn(c, 1.3)).connect(o); loopSrc(c, noiseBuf('white'), u).connect(flt(c, 'highpass', 4000)).connect(gn(c, .03)).connect(o); },
    lofi: song({ bpm: 76, cut: 1900, rv: .15, comp: 'pad', bass: 'root', drums: 'lofi', melP: .4, scale: [72, 74, 76, 79, 81, 84], chords: [[50, 53, 57, 60, 64], [43, 53, 59, 64, 69], [48, 52, 55, 59, 62], [45, 52, 55, 60, 64]] }),
    chillhop: song({ bpm: 86, cut: 2400, rv: .2, comp: 'pad', bass: 'root', drums: 'lofi', melP: .45, scale: [72, 75, 77, 79, 82, 84], chords: [[48, 51, 55, 58, 62], [44, 51, 55, 58, 60], [41, 48, 51, 55, 58], [43, 50, 53, 59, 62]] }),
    jazz: song({ bpm: 96, cut: 2600, rv: .3, comp: 'pad', bass: 'walk', drums: 'brush', melP: .5, scale: [72, 74, 76, 79, 81, 83], chords: [[50, 53, 57, 60, 64], [43, 53, 57, 59, 64], [48, 52, 55, 59, 62], [45, 52, 55, 61, 64]] }),
    synth: song({ bpm: 104, cut: 4500, rv: .25, comp: 'saw', bass: 'saw8', drums: 'synth', arp: true, melP: 0, scale: [69, 72, 74, 76, 79, 81], chords: [[45, 57, 60, 64], [41, 53, 57, 60], [48, 60, 64, 67], [43, 55, 59, 62]] }),
    piano: notes({ base: 60, roots: [0, -3, -7, -5], scale: [0, 2, 4, 7, 9, 12, 14, 16], p: [[1, .5], [2, .18], [3, .06]], dec: 3.4, att: .008, gap: [.9, 3.2], dy: .3, rv: .5, lp: 3200 }),
    musicbox: notes({ base: 84, roots: [0, -3, -5, -7], scale: [0, 2, 4, 7, 9, 12], p: [[1, .35], [2.01, .12], [5.4, .05]], dec: 1.7, att: .004, gap: [.5, 1.4], dy: .15, rv: .6, lp: 7000 }),
    harp: notes({ base: 55, roots: [0, 5, 7, -2], scale: [0, 2, 4, 7, 9, 12, 14, 16], p: [[1, .4], [2, .15]], type: 'triangle', dec: 2.4, att: .006, gap: [3, 6], dy: 0, rv: .7, lp: 4000, run: true }),
    windchimes: notes({ base: 60, roots: [0], scale: [24, 26, 28, 31, 33, 36], p: [[1, .35], [2.76, .1], [5.4, .04]], dec: 4.5, att: .003, gap: [2.5, 8], dy: .5, rv: .8, lp: 7000 }),
    bowls: notes({ base: 48, roots: [0, 5, 7, -2], scale: [0, 2, 7, 12], p: [[1, .4], [1.005, .4], [2.76, .2], [5.4, .09], [8.9, .04]], dec: 10, att: .04, gap: [8, 14], dy: .2, rv: 1, lp: 4000 }),
    pad: (c, o, u, T) => {
      const CH = [[130.8, 196, 261.6, 329.6], [110, 164.8, 220, 277.2], [116.5, 174.6, 233.1, 293.7], [98, 146.8, 196, 246.9]], lp = flt(c, 'lowpass', 700, .5); lp.connect(o); lfo(c, u, .05, 300, lp.frequency);
      const vs = [0, 1, 2, 3].map(i => { const g = gn(c, .11); g.connect(lp); return [-7, 7].map(d => { const x = u(c.createOscillator()); x.type = 'sawtooth'; x.detune.value = d; x.frequency.value = CH[0][i]; x.connect(g); x.start(); return x; }); });
      let k = 0; T.push(setInterval(() => { k = (k + 1) % CH.length; vs.forEach((os, i) => os.forEach(x => x.frequency.setTargetAtTime(CH[k][i], c.currentTime, 2.5))); }, 14000));
    },
    choir: (c, o, u, T) => {
      const CH = [[130.8, 196, 261.6, 329.6], [110, 164.8, 220, 277.2], [116.5, 174.6, 233.1, 293.7], [98, 146.8, 196, 246.9]], bus = gn(c, .12), sum = gn(c, 1); sum.connect(o); rvSend(c, sum, .6);
      [[700, 5, 1], [1100, 6, .6], [2600, 8, .25]].forEach((f, i) => { const b = flt(c, 'bandpass', f[0], f[1]); bus.connect(b); b.connect(gn(c, f[2])).connect(sum); if (!i) lfo(c, u, .07, 150, b.frequency); });
      const vs = CH[0].map(fr => [-6, 6].map(d => { const x = u(c.createOscillator()); x.type = 'sawtooth'; x.detune.value = d; x.frequency.value = fr; x.connect(bus); x.start(); lfo(c, u, 5 + Math.random(), 6, x.detune); return x; }));
      let k = 0; T.push(setInterval(() => { k = (k + 1) % CH.length; vs.forEach((os, i) => os.forEach(x => x.frequency.setTargetAtTime(CH[k][i], c.currentTime, 2.5))); }, 13000));
    },
    tanpura: (c, o, u, T) => {
      const lpo = gn(c, 1); lpo.connect(o); rvSend(c, lpo, .45); const P = [98, 130.8, 130.8, 65.4]; let i = 0;
      spawn(c, T, t => { const f = P[i++ % 4], lp = flt(c, 'lowpass', 3000, .7), e = c.createGain(); lp.frequency.setValueAtTime(3000, t); lp.frequency.exponentialRampToValueAtTime(450, t + 3); e.gain.setValueAtTime(0, t); e.gain.linearRampToValueAtTime(.16, t + .015); e.gain.exponentialRampToValueAtTime(.0008, t + 5); lp.connect(e); e.connect(lpo); [-5, 5].forEach(d => { const x = c.createOscillator(); x.type = 'sawtooth'; x.frequency.value = f; x.detune.value = d; x.connect(lp); x.start(t); x.stop(t + 5.1); }); }, 1.25, 1.35);
    },
    drone: (c, o, u) => {
      const lp = flt(c, 'lowpass', 600, .5), g = gn(c, .8); lp.connect(g); g.connect(o); lfo(c, u, .07, .25, g.gain);
      [[65.41, 'sine', .5], [130.8, 'sawtooth', .08], [196, 'sine', .12], [98, 'sine', .15]].forEach(p => { const x = u(c.createOscillator()); x.type = p[1]; x.frequency.value = p[0]; x.connect(gn(c, p[2])).connect(lp); x.start(); });
    },
    binaural: (c, o, u) => {
      const beat = BIN[st.bin][1], car = 190;
      [[-1, car - beat / 2], [1, car + beat / 2]].forEach(p => { const x = u(c.createOscillator()); x.frequency.value = p[1]; const pan = c.createStereoPanner ? c.createStereoPanner() : gn(c, 1); if (pan.pan) pan.pan.value = p[0]; x.connect(pan); pan.connect(o); x.start(); });
    },
    isochronic: (c, o, u) => { const g = gn(c, .5); [180, 270].forEach((f, i) => { const x = u(c.createOscillator()); x.frequency.value = f; x.connect(gn(c, i ? .15 : .6)).connect(g); x.start(); }); g.connect(o); lfo(c, u, BIN[st.bin][1], .5, g.gain); },
    schumann: (c, o, u) => { const g = gn(c, .5); const x = u(c.createOscillator()); x.frequency.value = 136.1; x.connect(g); x.start(); g.connect(o); lfo(c, u, 7.83, .5, g.gain); },
    tone432: (c, o, u) => { const g = gn(c, .5); [[432, .5], [648, .15]].forEach(p => { const x = u(c.createOscillator()); x.frequency.value = p[0]; x.connect(gn(c, p[1])).connect(g); x.start(); }); g.connect(o); lfo(c, u, .08, .12, g.gain); }
  };

  function startLayer(id) {
    if (live[id] || !mk[id]) return; const c = AC(), out = c.createGain(), S = [], T = [], h = { out, S, T };
    out.gain.value = 0; out.connect(master);
    try { mk[id](c, out, n => { S.push(n); return n; }, T); } catch (e) { console.error('audio layer', id, e); T.forEach(t => { clearInterval(t); clearTimeout(t); }); return; }
    live[id] = h; out.gain.setTargetAtTime(st.sel[id] != null ? st.sel[id] : .5, c.currentTime, .6);
  }
  function stopLayer(id) {
    const h = live[id]; if (!h) return; delete live[id];
    h.T.forEach(t => { clearInterval(t); clearTimeout(t); }); h.out.gain.cancelScheduledValues(ctx.currentTime); h.out.gain.setTargetAtTime(0, ctx.currentTime, .15);
    setTimeout(() => { h.S.forEach(n => { try { n.stop(); } catch (e) {} }); try { h.out.disconnect(); } catch (e) {} }, 900);
  }
  function start(auto) {
    if (!Object.keys(st.sel).length) st.sel = { brown: .5 };
    AC(); master.gain.cancelScheduledValues(ctx.currentTime); master.gain.setTargetAtTime(st.master, ctx.currentTime, .3);
    Object.keys(st.sel).forEach(startLayer); playing = true; autoStarted = !!auto; paint(); armSleep();
  }
  function stop() { clearTimeout(mixT); mixT = null; if (!ctx) { playing = false; paint(); return; } Object.keys(live).forEach(stopLayer); playing = false; autoStarted = false; clearTimeout(sleepT); sleepT = null; sleepEnd = 0; paint(); }
  function toggle() { playing ? stop() : start(); }
  function armSleep() { clearTimeout(sleepT); sleepT = null; sleepEnd = 0; if (st.sleep > 0 && playing) { sleepEnd = Date.now() + st.sleep * 60000; sleepT = setTimeout(() => { if (ctx) master.gain.setTargetAtTime(0, ctx.currentTime, 3); setTimeout(stop, 9000); }, st.sleep * 60000); } }
  function setMix(sel, bin, name) {
    const was = playing; if (ctx) Object.keys(live).forEach(stopLayer);
    st.sel = clean(sel); if (bin && BIN[bin]) st.bin = bin; st.last = name || ''; save(); paint();
    clearTimeout(mixT); mixT = setTimeout(() => { mixT = null; start(); }, was ? 700 : 0);
  }
  function applyPreset(name) {
    if (PRESETS[name]) { const p = PRESETS[name], s = {}; Object.keys(p).forEach(k => { if (k !== '_bin') s[k] = p[k]; }); setMix(s, p._bin, name); return true; }
    const cp = st.custom[name]; if (cp) { setMix(cp.sel, cp.bin, name); return true; } return false;
  }
  function randomMix() {
    const g = n => LAYERS.filter(l => l[4] === n && l[0] !== 'thunder'), s = {}, add = l => { s[l[0]] = Math.round((.25 + Math.random() * .35) * 100) / 100; };
    add(pick(g(0).concat(g(1)))); add(pick(g(1))); add(pick(g(2))); if (Math.random() < .7) add(pick(g(3))); if (Math.random() < .3) add(pick(g(4)));
    setMix(s, null, '');
  }

  /* ---------- UI ---------- */
  function css() {
    if ($('au3-css')) return; const s = document.createElement('style'); s.id = 'au3-css';
    s.textContent = `.au3{display:flex;flex-direction:column;gap:10px;font-size:.92em}.au3 h5{margin:6px 0 0;font-size:.8em;text-transform:uppercase;letter-spacing:.1em;color:var(--text-muted)}.au3 h6{margin:10px 0 6px;font-size:.78em;color:var(--accent-color);letter-spacing:.06em}
.au3-top,.au3-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.au3-top .primary-btn{flex:1}.au3-vol{display:flex;gap:6px;align-items:center}.au3-vol input{width:100px}.au3-row label{font-weight:600}.au3-row select{flex:1;min-width:120px}.au3-row .outline-btn{flex:1;padding:7px 8px;font-size:.85em}
.au3-chk{display:flex;gap:8px;align-items:center;font-size:.88em;cursor:pointer}.au3-chips{display:flex;flex-wrap:wrap;gap:6px}.au3-chips .chip b{margin-left:6px;opacity:.6;cursor:pointer}.au3-chips .chip b:hover{opacity:1}
.au3-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px}.au3-l{border:1px solid var(--border-color);border-radius:var(--radius-md);padding:6px 8px;display:flex;flex-direction:column;gap:4px;background:var(--folder-bg);transition:.2s}.au3-l.on{border-color:var(--accent-color);box-shadow:0 0 0 1px var(--accent-color) inset}
.au3-t{background:none;border:none;color:var(--text-color);text-align:left;cursor:pointer;font-weight:600;font-size:.82em;display:flex;gap:6px;align-items:center;padding:2px 0}.au3-l input[type=range]{width:100%;accent-color:var(--accent-color)}.au3-l input:disabled{opacity:.25}
#audio-btn.aud-live{color:var(--accent-color);box-shadow:0 0 0 2px var(--accent-glow);animation:pulseGlow 2s infinite}#aud-filter{width:100%}.au3 .danger{background:var(--danger)!important;color:#fff!important}`;
    document.head.appendChild(s);
  }
  function renderPresets() {
    const el = $('aud-presets'); if (!el) return;
    el.innerHTML = Object.keys(PRESETS).map(p => `<button class="chip${st.last === p ? ' active' : ''}" data-preset="${p}">${p}</button>`).join('') + Object.keys(st.custom).map(p => `<button class="chip${st.last === p ? ' active' : ''}" data-preset="${p.replace(/"/g, '&quot;')}">⭐ ${p.replace(/</g, '&lt;')}<b data-delp="${p.replace(/"/g, '&quot;')}">×</b></button>`).join('');
  }
  function buildUI() {
    const wrap = document.querySelector('#audio-drawer .audio-wrapper'); if (!wrap) return; css();
    wrap.innerHTML = `<div class="au3">
      <div class="au3-top"><button class="primary-btn" id="aud-play">▶ Play mix</button><label class="au3-vol" title="Master volume">🔊<input type="range" id="aud-master" min="0" max="1" step="0.01"></label></div>
      <div class="au3-row"><label for="aud-sleep">😴 Sleep timer</label><select id="aud-sleep"><option value="0">Off</option>${[15, 30, 45, 60, 90, 120].map(m => `<option value="${m}">${m} min</option>`).join('')}</select><span id="aud-left" class="muted"></span></div>
      <label class="au3-chk"><input type="checkbox" id="aud-auto"> Auto-play while a focus session runs</label>
      <div class="au3-row"><button class="outline-btn" id="aud-rand">🎲 Random mix</button><button class="outline-btn" id="aud-save">💾 Save mix</button><button class="outline-btn" id="aud-clear">✖ Clear</button></div>
      <h5>Presets</h5><div class="au3-chips" id="aud-presets"></div>
      <h5>Mixer <small class="muted">(tap to add · slide for volume)</small></h5>
      <input type="text" id="aud-filter" placeholder="Search ${LAYERS.length} sounds…">
      <div id="aud-layers">${GROUPS.map((g, gi) => `<div class="au3-g"><h6>${g}</h6><div class="au3-grid">${LAYERS.filter(l => l[4] === gi).map(l => `<div class="au3-l" data-id="${l[0]}" data-name="${l[2].toLowerCase()}"><button class="au3-t" data-t="${l[0]}"><span>${l[1]}</span>${l[2]}</button><input type="range" min="0.05" max="1" step="0.01" data-v="${l[0]}"></div>`).join('')}</div></div>`).join('')}</div>
      <div class="au3-row" id="aud-binrow"><label for="aud-bin">🎧 Beat frequency</label><select id="aud-bin">${Object.keys(BIN).map(k => `<option value="${k}">${BIN[k][0]}</option>`).join('')}</select></div>
      <h5>🎵 Music videos <small class="muted">(YouTube)</small></h5>
      <div id="yt-box"></div>
      <div class="au3-row"><input type="text" id="yt-url" placeholder="Paste a YouTube link or ID…" style="flex:1;min-width:0"><button class="outline-btn" id="yt-add">➕ Add</button></div>
      <div class="au3-chips" id="yt-list"></div>
      <p class="muted" style="font-size:.78em;margin:2px 0 8px">Every sound is generated live in your browser: loops seamlessly, works offline, uses no data. Binaural beats need stereo headphones.</p>
    </div>`;
    $('aud-master').value = st.master; $('aud-sleep').value = String(st.sleep); $('aud-auto').checked = !!st.auto; $('aud-bin').value = st.bin;
    renderPresets(); paint();
  }
  function paint() {
    const p = $('aud-play'); if (!p) return;
    p.textContent = playing ? '⏹ Stop' : '▶ Play mix'; p.classList.toggle('danger', playing);
    document.querySelectorAll('.au3-l').forEach(r => { const id = r.dataset.id, on = st.sel[id] != null; r.classList.toggle('on', on); const s = r.querySelector('input'); s.value = on ? st.sel[id] : LBY[id][3]; s.disabled = !on; });
    renderPresets();
    const bb = $('audio-btn'); if (bb) bb.classList.toggle('aud-live', playing);
    const br = $('aud-binrow'); if (br) br.style.display = (st.sel.binaural != null || st.sel.isochronic != null) ? 'flex' : 'none';
  }
  setInterval(() => { const l = $('aud-left'); if (!l) return; l.textContent = sleepEnd ? Math.max(0, Math.ceil((sleepEnd - Date.now()) / 60000)) + ' min left' : ''; }, 5000);
  function bind() {
    const d = $('audio-drawer'); if (!d) return;
    d.addEventListener('click', e => {
      const t = e.target.closest('[data-t]'), del = e.target.closest('[data-delp]'), pr = e.target.closest('[data-preset]');
      if (e.target.closest('#aud-play')) toggle();
      else if (del) { delete st.custom[del.dataset.delp]; if (st.last === del.dataset.delp) st.last = ''; save(); renderPresets(); }
      else if (t) { const id = t.dataset.t; if (st.sel[id] != null) { delete st.sel[id]; stopLayer(id); } else { st.sel[id] = LBY[id][3]; if (playing) startLayer(id); } st.last = ''; save(); paint(); }
      else if (pr) applyPreset(pr.dataset.preset);
      else if (e.target.closest('#aud-rand')) randomMix();
      else if (e.target.closest('#aud-clear')) { stop(); st.sel = {}; st.last = ''; save(); paint(); }
      else if (e.target.closest('#aud-save')) {
        if (!Object.keys(st.sel).length) return; const n = (window.prompt('Name this mix:') || '').trim().slice(0, 24); if (!n) return;
        st.custom[n] = { sel: Object.assign({}, st.sel), bin: st.bin }; st.last = n; save(); renderPresets();
      }
    });
    d.addEventListener('input', e => {
      const v = e.target.dataset && e.target.dataset.v;
      if (v) { st.sel[v] = parseFloat(e.target.value); st.last = ''; if (live[v]) live[v].out.gain.setTargetAtTime(st.sel[v], ctx.currentTime, .1); save(); }
      else if (e.target.id === 'aud-master') { st.master = parseFloat(e.target.value); if (master) master.gain.setTargetAtTime(st.master, ctx.currentTime, .1); save(); }
      else if (e.target.id === 'aud-filter') {
        const q = e.target.value.trim().toLowerCase(); document.querySelectorAll('.au3-l').forEach(r => { r.style.display = !q || r.dataset.name.includes(q) ? '' : 'none'; });
        document.querySelectorAll('.au3-g').forEach(g => { g.style.display = [...g.querySelectorAll('.au3-l')].some(r => r.style.display !== 'none') ? '' : 'none'; });
      }
    });
    d.addEventListener('change', e => {
      if (e.target.id === 'aud-sleep') { st.sleep = +e.target.value; save(); armSleep(); }
      else if (e.target.id === 'aud-auto') { st.auto = e.target.checked; save(); }
      else if (e.target.id === 'aud-bin') { st.bin = e.target.value; save(); ['binaural', 'isochronic'].forEach(id => { if (live[id]) { stopLayer(id); setTimeout(() => startLayer(id), 300); } }); }
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

  const find = name => { name = String(name).toLowerCase(); return LAYERS.find(x => x[0] === name || x[2].toLowerCase() === name) || LAYERS.find(x => x[2].toLowerCase().includes(name)); };
  window.RRA = {
    play: name => { if (PRESETS[name] || st.custom[name]) return applyPreset(name); const l = find(name); if (!l) return false; const s = {}; s[l[0]] = l[3]; setMix(s, null, ''); return l[2]; },
    add: name => { const l = find(name); if (!l) return false; if (st.sel[l[0]] == null) st.sel[l[0]] = l[3]; st.last = ''; save(); if (playing) startLayer(l[0]); paint(); return l[2]; },
    yt: id => { const v = ytId(id); if (v) ytPlay(v); return !!v; }, stop, toggle, playing: () => playing, random: randomMix, mix: () => Object.assign({}, st.sel),
    presets: () => Object.keys(PRESETS).concat(Object.keys(st.custom)), layers: () => IDS.slice(),
    setSleep: m => { st.sleep = +m || 0; save(); const s = $('aud-sleep'); if (s) s.value = String(st.sleep); armSleep(); }, names: () => LAYERS.map(l => [l[0], l[2]])
  };

  /* ---- YouTube music videos ---- */
  const YT0 = [['jfKfPfyJRdk', '☕ Lofi Girl – beats to study'], ['5yx6BWlEVcY', '🎷 Chillhop Radio'], ['4xDzrJKXOOY', '🌆 Synthwave Radio'], ['rUxyKA_-grg', '🌙 Lofi sleep'], ['5qap5aO4i9A', '📚 Lofi study']];
  let ytc = []; try { ytc = JSON.parse(localStorage.getItem('aud_yt_custom') || '[]'); } catch (e) {}
  let ytNow = null;
  const ytId = v => { v = String(v || '').trim(); const m = v.match(/(?:v=|youtu\.be\/|embed\/|live\/|shorts\/)([\w-]{11})/); return m ? m[1] : /^[\w-]{11}$/.test(v) ? v : null; };
  function ytPaint() {
    const L = $('yt-list'), B = $('yt-box'); if (!L || !B) return;
    const all = YT0.map(x => ({ id: x[0], t: x[1] })).concat(ytc.map(x => ({ id: x[0], t: x[1], c: 1 })));
    L.innerHTML = all.map(v => `<button class="chip${ytNow === v.id ? ' active' : ''}" data-yt="${v.id}">${v.t.replace(/</g, '&lt;')}${v.c ? `<b data-ytdel="${v.id}">×</b>` : ''}</button>`).join('');
    if (!ytNow) { B.innerHTML = ''; return; }
    if (!B.querySelector('iframe[data-id="' + ytNow + '"]')) B.innerHTML = `<div class="yt-frame"><iframe data-id="${ytNow}" src="https://www.youtube.com/embed/${ytNow}?autoplay=1&rel=0" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe></div><div class="au3-row"><button class="outline-btn" id="yt-stop">⏹ Stop video</button><a class="outline-btn" target="_blank" rel="noopener" href="https://www.youtube.com/watch?v=${ytNow}">Open on YouTube ↗</a></div><small class="muted" id="yt-warn"></small>`;
  }
  function ytPlay(id) {
    if (ytNow === id) return; ytNow = id; if (playing) stop(); ytPaint();
    if (window.RRX && RRX.checkId) RRX.checkId(id).then(r => { const w = $('yt-warn'); if (w && ytNow === id && r && r.s && r.s !== 'ok') w.textContent = '⚠ This video may be unavailable. Try another, or paste your own link.'; }).catch(() => {});
  }
  const ytCss = document.createElement('style'); ytCss.id = 'au3-yt-css';
  ytCss.textContent = '.yt-frame{position:relative;width:100%;aspect-ratio:16/9;border-radius:10px;overflow:hidden;background:#000;margin-bottom:8px}.yt-frame iframe{position:absolute;inset:0;width:100%;height:100%;border:0}#yt-list{margin-bottom:10px}';
  document.head.appendChild(ytCss);
  document.addEventListener('click', e => {
    const d = $('audio-drawer'); if (!d || !d.contains(e.target)) return;
    const del = e.target.closest('[data-ytdel]'), p = e.target.closest('[data-yt]');
    if (del) { ytc = ytc.filter(x => x[0] !== del.dataset.ytdel); try { localStorage.setItem('aud_yt_custom', JSON.stringify(ytc)); } catch (_) {} if (ytNow === del.dataset.ytdel) ytNow = null; $('yt-box').innerHTML = ''; ytPaint(); }
    else if (p) { ytNow === p.dataset.yt ? (ytNow = null, $('yt-box').innerHTML = '', ytPaint()) : ytPlay(p.dataset.yt); }
    else if (e.target.closest('#yt-stop')) { ytNow = null; $('yt-box').innerHTML = ''; ytPaint(); }
    else if (e.target.closest('#yt-add')) {
      const id = ytId($('yt-url').value); if (!id) { window.showToast && showToast('Not a valid YouTube link'); return; }
      if (!ytc.some(x => x[0] === id) && !YT0.some(x => x[0] === id)) { ytc.push([id, '🎬 ' + id]); try { localStorage.setItem('aud_yt_custom', JSON.stringify(ytc)); } catch (_) {} }
      $('yt-url').value = ''; ytPlay(id); ytPaint();
    }
  });
  const go = () => { buildUI(); bind(); ytPaint(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
})();
