/* extras.js - Home dashboard v2, Mock database, Video availability/title checker. Exposes window.RRX */
(function () {
  const $ = id => document.getElementById(id);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const X = () => (window.RR && window.RR.x) || null;
  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const num = v => { const n = parseFloat(v); return isFinite(n) ? n : 0; };
  const toast = m => window.showToast && window.showToast(m);
  const trunc = (s, n) => { s = String(s || ''); if (s.length <= n) return s; const c = s.slice(0, n - 1), i = c.lastIndexOf(' '); return (i > n * .6 ? c.slice(0, i) : c).replace(/[\s,\-–:|·]+$/, '') + '…'; };
  const dlFile = (name, text, type) => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: type || 'application/json' })); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); };

  /* =============== VIDEO CHECKER =============== */
  const VK = 'vid_check_v2', OV = 'vid_title_ov_v1', IG = 'vid_title_ok_v1';
  let vc = load(VK, {}), ov = load(OV, {}), ig = load(IG, {}); const pend = {};
  const vid = url => { const m = /embed\/([\w-]{6,})/.exec(url || ''); return m && m[1]; };
  async function checkId(id) {
    const c = vc[id], age = c ? Date.now() - c.ts : 1e13;
    if (c && ((c.s === 'ok' && age < 6048e5) || (c.s !== 'ok' && age < 864e5))) return c;
    if (pend[id]) return pend[id];
    return pend[id] = (async () => {
      try {
        const r = await fetch('https://www.youtube.com/oembed?format=json&url=' + encodeURIComponent('https://www.youtube.com/watch?v=' + id));
        let o;
        if (r.ok) { const j = await r.json(); o = { s: 'ok', t: j.title || '', a: j.author_name || '', ts: Date.now() }; }
        else if (r.status === 404) o = { s: 'gone', ts: Date.now() }; else if (r.status === 401 || r.status === 403) o = { s: 'blocked', ts: Date.now() }; else o = { s: 'err', ts: Date.now() };
        if (o.s !== 'err') { vc[id] = o; save(VK, vc); } return o;
      } catch (e) { return { s: 'err', ts: Date.now() }; } finally { delete pend[id]; }
    })();
  }
  const STOPW = new Set('the a an of and or to in on for with by is are vs full class lecture lectures chapter ch one shot oneshot complete revision jee neet mains advanced pw physics wallah physicswallah video part new batch lec'.split(' '));
  const EXP = { shm: ['harmonic'], com: ['mass'], ktg: ['kinetic'], emi: ['induction'], nlm: ['motion', 'newton'], goc: ['general', 'organic'], ac: ['alternating'], poc: ['practical', 'principles'], ioc: ['inorganic'], pyq: ['previous'], dpp: ['practice'], rbd: ['rigid'], em: ['electromagnetic'], wep: ['work'], bio: ['biomolecules'] };
  const tok = s => String(s || '').toLowerCase().replace(/[^a-z0-9\u0900-\u097f]+/g, ' ').split(' ').filter(w => w.length > 1 && !STOPW.has(w));
  function mismatch(listed, real) {
    const A = tok(listed), B = tok(real); if (!A.length || !B.length) return false; let hit = 0;
    A.forEach(w => { if (B.some(b => b === w || (b.length > 3 && w.length > 3 && (b.startsWith(w.slice(0, 5)) || w.startsWith(b.slice(0, 5))))) || (EXP[w] && EXP[w].some(x => B.some(b => b.startsWith(x))))) hit++; });
    return hit / A.length < .34;
  }
  function banner(html, cls) {
    let b = $('vid-banner');
    if (!b) { b = document.createElement('div'); b.id = 'vid-banner'; const lb = $('lecture-bar'); lb && lb.parentNode.insertBefore(b, lb.nextSibling); }
    if (!html) { b.style.display = 'none'; b.innerHTML = ''; return; }
    b.className = 'vid-banner ' + (cls || ''); b.innerHTML = html; b.style.display = 'flex';
  }
  function fillTitles(b) {
    const dd = $('playlist-select'), x = X(); if (!dd || !b || !b.playlist) return; const w = ((x.prog[b._id] || {}).watched) || {}, S = x.S;
    Array.from(dd.options).forEach((o, i) => {
      const v = b.playlist[i], id = vid(v && v.url), c = id && vc[id]; let t = v.title;
      if (id && ov[id]) t = ov[id]; else if (S.realTitles && c && c.s === 'ok' && c.t) t = c.t;
      if (id && c && (c.s === 'gone' || c.s === 'blocked')) t = '⚠ ' + t;
      o.textContent = (w[i] ? '✓ ' : '') + (i + 1) + '. ' + trunc(t, 62); o.title = t;
    });
  }
  function onPlay(b, i) {
    const x = X(); if (!x || !b || !b.playlist) return; const v = b.playlist[i], id = vid(v.url);
    banner(''); fillTitles(b);
    const shown = id && ov[id] ? ov[id] : v.title; const p = $('current-path'); if (p) p.textContent = (b._f || []).join(' › ') + ' › ' + (i + 1) + '. ' + trunc(shown, 70);
    if (!id) return;
    checkId(id).then(r => {
      if (x.cur !== b || x.curIdx !== i) return;
      if (r.s === 'gone' || r.s === 'blocked') {
        banner(`<span>⚠️ <b>Video unavailable</b> — ${r.s === 'gone' ? 'it was removed or made private' : 'it is private or embedding is disabled'}.</span><span class="vb-act"><button class="btn sm" data-vb="next">Next ▶</button><a class="btn ghost sm" target="_blank" rel="noopener" href="https://www.youtube.com/watch?v=${id}">Open on YouTube</a><a class="btn ghost sm" target="_blank" rel="noopener" href="https://www.youtube.com/results?search_query=${encodeURIComponent(v.title + ' ' + (b._t || ''))}">Find replacement</a></span>`, 'bad');
        fillTitles(b);
      } else if (r.s === 'ok') {
        if (x.S.realTitles || ov[id]) { fillTitles(b); }
        if (!ov[id] && !ig[id] && mismatch(v.title, r.t)) banner(`<span>ℹ️ <b>Title mismatch</b> — listed as “${esc(trunc(v.title, 50))}”, but YouTube calls it “${esc(trunc(r.t, 70))}”.</span><span class="vb-act"><button class="btn sm" data-vb="use" data-id="${id}">Use YouTube title</button><button class="btn ghost sm" data-vb="ok" data-id="${id}">Looks fine</button></span>`, 'warn');
      }
    });
    const nx = b.playlist[i + 1]; if (nx && vid(nx.url)) setTimeout(() => checkId(vid(nx.url)), 1500);
  }
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-vb]'); if (!t) return; const x = X(), id = t.dataset.id;
    if (t.dataset.vb === 'next') x.playIdx(x.curIdx + 1);
    else if (t.dataset.vb === 'use') { ov[id] = (vc[id] || {}).t || ''; save(OV, ov); banner(''); fillTitles(x.cur); toast('Using the YouTube title'); }
    else if (t.dataset.vb === 'ok') { ig[id] = 1; save(IG, ig); banner(''); }
  });

  function allVideos() { const x = X(), out = []; if (!x) return out; x.idMap.forEach(b => { if (b.playlist) b.playlist.forEach((v, i) => { const id = vid(v.url); if (id) out.push({ b, i, v, id }); }); }); return out; }
  function health() { const all = allVideos(); let chk = 0, bad = 0, mis = 0; all.forEach(o => { const c = vc[o.id]; if (c) { chk++; if (c.s === 'gone' || c.s === 'blocked') bad++; else if (c.s === 'ok' && !ov[o.id] && !ig[o.id] && mismatch(o.v.title, c.t)) mis++; } }); return { total: all.length, chk, bad, mis }; }
  async function scan(progress) {
    const all = allVideos(), ids = [...new Set(all.map(o => o.id))]; let done = 0, i = 0;
    const worker = async () => { while (i < ids.length) { const id = ids[i++]; await checkId(id); done++; progress && progress(done, ids.length); } };
    await Promise.all([worker(), worker(), worker(), worker(), worker()]);
  }
  function reviewModal() {
    const x = X(); let m = $('rrx-modal'); if (!m) { m = document.createElement('div'); m.id = 'rrx-modal'; m.className = 'rrx-modal'; document.body.appendChild(m); }
    const rows = allVideos().map(o => { const c = vc[o.id]; if (!c) return null; if (c.s === 'gone' || c.s === 'blocked') return { o, k: 'bad', msg: c.s === 'gone' ? 'Removed / private' : 'Embedding disabled / private' }; if (c.s === 'ok' && !ov[o.id] && !ig[o.id] && mismatch(o.v.title, c.t)) return { o, k: 'warn', msg: 'YouTube title: ' + trunc(c.t, 60) }; return null; }).filter(Boolean);
    m.innerHTML = `<div class="rrx-card"><div class="rrx-head"><b>🩺 Library health</b><button class="icon-btn" data-m="close">✖</button></div><p class="muted">${rows.length ? rows.length + ' item(s) need attention.' : 'All checked videos look good.'}</p>
      <div class="rrx-list">${rows.map((r, n) => `<div class="rrx-row ${r.k}"><div><b>${esc(trunc(r.o.v.title, 56))}</b><small>${esc(trunc(r.o.b._t, 44))} · #${r.o.i + 1} · ${esc(r.msg)}</small></div><span><button class="btn ghost sm" data-m="open" data-n="${n}">Open</button>${r.k === 'warn' ? `<button class="btn sm" data-m="use" data-n="${n}">Use title</button>` : ''}</span></div>`).join('')}</div>
      ${rows.some(r => r.k === 'warn') ? '<button class="outline-btn" data-m="useall">Use YouTube title for all mismatches</button>' : ''}</div>`;
    m.classList.add('open'); m.onclick = e => {
      if (e.target === m || e.target.closest('[data-m="close"]')) { m.classList.remove('open'); return; }
      const t = e.target.closest('[data-m]'); if (!t) return; const r = rows[+t.dataset.n];
      if (t.dataset.m === 'open') { m.classList.remove('open'); x.loadResource(r.o.b, null, r.o.i); }
      else if (t.dataset.m === 'use') { ov[r.o.id] = vc[r.o.id].t; save(OV, ov); reviewModal(); }
      else if (t.dataset.m === 'useall') { rows.filter(q => q.k === 'warn').forEach(q => { ov[q.o.id] = vc[q.o.id].t; }); save(OV, ov); reviewModal(); renderHome(); }
    };
  }

  /* =============== MOCK DATABASE =============== */
  const MK = 'mock_db_v2', MIST = [['concept', 'Concept gap'], ['silly', 'Silly mistake'], ['calc', 'Calculation'], ['time', 'Time pressure'], ['guess', 'Wrong guess']], EXAMS = ['JEE Main', 'JEE Advanced', 'BITSAT', 'Board', 'Other'];
  let mdb = load(MK, null); if (!mdb || !mdb.dbs) mdb = { active: 'My Mocks', dbs: { 'My Mocks': [] } };
  const msave = () => save(MK, mdb), cur = () => mdb.dbs[mdb.active] || (mdb.dbs[mdb.active] = []);
  const mtotal = e => num(e.P) + num(e.C) + num(e.M), mpct = e => e.max ? mtotal(e) / e.max * 100 : 0;
  function mockSummary() {
    const L = cur().slice().sort((a, b) => a.date < b.date ? -1 : 1), n = L.length; if (!n) return { n: 0 };
    const p = L.map(mpct), avg = p.reduce((a, b) => a + b, 0) / n, last = L[n - 1];
    const k = Math.min(3, Math.floor(n / 2)), trend = k ? p.slice(-k).reduce((a, b) => a + b, 0) / k - p.slice(-2 * k, -k).reduce((a, b) => a + b, 0) / k : 0;
    return { n, avg, best: Math.max(...p), last: { name: last.name, pct: mpct(last), total: mtotal(last), max: last.max, date: last.date }, trend, db: mdb.active };
  }
  function chart(L) {
    if (L.length < 2) return '<p class="muted" style="text-align:center;padding:18px 0">Log at least two mocks to see your trend.</p>';
    const W = 600, H = 190, pl = 34, pr = 10, pt = 10, pb = 22, n = L.length, xs = i => pl + (W - pl - pr) * (n === 1 ? .5 : i / (n - 1)), ys = v => pt + (H - pt - pb) * (1 - Math.max(0, Math.min(100, v)) / 100);
    const S = [['Total', e => mpct(e), 'var(--accent-color)', 3], ['P', e => e.max ? num(e.P) / (e.max / 3) * 100 : 0, '#3b82f6', 1.6], ['C', e => e.max ? num(e.C) / (e.max / 3) * 100 : 0, '#10b981', 1.6], ['M', e => e.max ? num(e.M) / (e.max / 3) * 100 : 0, '#f59e0b', 1.6]];
    let g = [0, 25, 50, 75, 100].map(v => `<line x1="${pl}" x2="${W - pr}" y1="${ys(v)}" y2="${ys(v)}" class="mk-grid"/><text x="${pl - 5}" y="${ys(v) + 4}" text-anchor="end" class="mk-ax">${v}</text>`).join('');
    S.forEach(s => { g += `<polyline fill="none" stroke="${s[2]}" stroke-width="${s[3]}" stroke-linejoin="round" points="${L.map((e, i) => xs(i).toFixed(1) + ',' + ys(s[1](e)).toFixed(1)).join(' ')}"/>`; });
    g += L.map((e, i) => `<circle cx="${xs(i)}" cy="${ys(mpct(e))}" r="3.6" fill="var(--accent-color)"><title>${esc(e.name)} · ${mpct(e).toFixed(1)}%</title></circle>`).join('');
    return `<svg viewBox="0 0 ${W} ${H}" class="mk-chart">${g}</svg><div class="mk-legend">${S.map(s => `<span><i style="background:${s[2]}"></i>${s[0]}</span>`).join('')}<span class="muted">% of max, oldest → newest</span></div>`;
  }
  let mui = { edit: null, exam: 'All', open: false };
  function mocks(up) {
    const render = () => {
      const L = cur().slice().sort((a, b) => a.date < b.date ? 1 : -1), asc = L.slice().reverse(), sm = mockSummary(), e0 = mui.edit ? cur().find(z => z.id === mui.edit) : null, F = e0 || { date: new Date().toISOString().slice(0, 10), exam: 'JEE Main', mode: 'Full', max: 300, mist: {} };
      const flt = L.filter(e => mui.exam === 'All' || e.exam === mui.exam);
      const cor = asc.reduce((a, e) => a + num(e.cor), 0), wr = asc.reduce((a, e) => a + num(e.wr), 0), acc = cor + wr ? cor / (cor + wr) * 100 : null;
      const sj = ['P', 'C', 'M'].map(k => [k, asc.length ? asc.reduce((a, e) => a + (e.max ? num(e[k]) / (e.max / 3) * 100 : 0), 0) / asc.length : 0, { P: '#3b82f6', C: '#10b981', M: '#f59e0b' }[k]]);
      const mt = MIST.map(m => [m[1], asc.reduce((a, e) => a + num((e.mist || {})[m[0]]), 0)]), mtot = mt.reduce((a, b) => a + b[1], 0) || 1;
      const weak = asc.length ? sj.slice().sort((a, b) => a[1] - b[1])[0] : null, nm = { P: 'Physics', C: 'Chemistry', M: 'Maths' };
      up.innerHTML = `<div class="panel mk"><div class="mk-bar"><h2>🧪 Mock Tests</h2><div class="mk-db"><select id="mk-db">${Object.keys(mdb.dbs).map(k => `<option ${k === mdb.active ? 'selected' : ''}>${esc(k)}</option>`).join('')}</select><button class="outline-btn sm" data-a="newdb" title="Create a new database">➕ New</button><button class="outline-btn sm" data-a="rendb" title="Rename">✏️</button><button class="outline-btn sm" data-a="deldb" title="Delete this database">🗑</button></div></div>
      <div class="tiles mk-tiles"><div class="card tile"><b>${sm.n || 0}</b><span>Attempts</span></div><div class="card tile"><b>${sm.n ? sm.avg.toFixed(1) + '%' : '–'}</b><span>Average</span></div><div class="card tile"><b>${sm.n ? sm.best.toFixed(1) + '%' : '–'}</b><span>Best</span></div><div class="card tile"><b>${sm.n ? sm.last.pct.toFixed(1) + '%' : '–'}</b><span>Latest</span></div><div class="card tile"><b class="${sm.trend >= 0 ? 'up' : 'down'}">${sm.n > 1 ? (sm.trend >= 0 ? '▲ ' : '▼ ') + Math.abs(sm.trend).toFixed(1) : '–'}</b><span>Trend</span></div><div class="card tile"><b>${acc == null ? '–' : acc.toFixed(0) + '%'}</b><span>Accuracy</span></div></div>
      <div class="card"><h4>Score trend</h4>${chart(asc)}</div>
      ${asc.length ? `<div class="two"><div class="card"><h4>Subject average</h4>${sj.map(s => `<div class="mk-b"><span>${nm[s[0]]}</span><div><i style="width:${Math.max(0, s[1])}%;background:${s[2]}"></i></div><em>${s[1].toFixed(0)}%</em></div>`).join('')}${weak ? `<p class="muted">Weakest: <b>${nm[weak[0]]}</b></p>` : ''}</div><div class="card"><h4>Where marks leak</h4>${mt.map(m => `<div class="mk-b"><span>${m[0]}</span><div><i style="width:${m[1] / mtot * 100}%;background:#ef4444"></i></div><em>${m[1]}</em></div>`).join('')}</div></div>` : ''}
      <details class="card mk-form" ${mui.open || e0 || !asc.length ? 'open' : ''}><summary>${e0 ? '✏️ Edit attempt' : '➕ Log a mock attempt'}</summary>
        <div class="mk-grid2"><label>Name<input id="f-name" type="text" placeholder="e.g. Allen AIOT-3" value="${esc(F.name || '')}"></label><label>Date<input id="f-date" type="date" value="${esc(F.date)}"></label>
        <label>Exam<select id="f-exam">${EXAMS.map(x => `<option ${x === F.exam ? 'selected' : ''}>${x}</option>`).join('')}</select></label><label>Type<select id="f-mode">${['Full', 'Part', 'Chapter'].map(x => `<option ${x === F.mode ? 'selected' : ''}>${x}</option>`).join('')}</select></label>
        <label>Physics<input id="f-P" type="number" value="${F.P != null ? F.P : ''}"></label><label>Chemistry<input id="f-C" type="number" value="${F.C != null ? F.C : ''}"></label><label>Maths<input id="f-M" type="number" value="${F.M != null ? F.M : ''}"></label><label>Max marks<input id="f-max" type="number" value="${F.max}"></label>
        <label>Correct<input id="f-cor" type="number" min="0" value="${F.cor != null ? F.cor : ''}"></label><label>Wrong<input id="f-wr" type="number" min="0" value="${F.wr != null ? F.wr : ''}"></label><label>Unattempted<input id="f-un" type="number" min="0" value="${F.un != null ? F.un : ''}"></label><label>Time (min)<input id="f-time" type="number" min="0" value="${F.time != null ? F.time : ''}"></label>
        <label>Rank<input id="f-rank" type="number" min="0" value="${F.rank != null ? F.rank : ''}"></label><label>Percentile<input id="f-pctl" type="number" step="0.01" min="0" max="100" value="${F.pctl != null ? F.pctl : ''}"></label></div>
        <p class="muted" style="margin:10px 0 4px">Mistakes by cause (number of questions)</p><div class="mk-grid2 mk-m">${MIST.map(m => `<label>${m[1]}<input id="m-${m[0]}" type="number" min="0" value="${(F.mist || {})[m[0]] != null ? F.mist[m[0]] : ''}"></label>`).join('')}</div>
        <label class="mk-notes">Notes / what to fix<textarea id="f-notes" rows="2">${esc(F.notes || '')}</textarea></label>
        <div class="row center"><button class="primary-btn" data-a="save">${e0 ? 'Update' : 'Save attempt'}</button>${e0 ? '<button class="outline-btn" data-a="cancel">Cancel</button>' : ''}</div></details>
      <div class="card"><div class="mk-bar"><h4>All attempts</h4><div class="chips">${['All', ...EXAMS].map(x => `<button class="chip ${mui.exam === x ? 'active' : ''}" data-ex="${x}">${x}</button>`).join('')}</div></div>
        ${flt.length ? `<div class="mk-tw"><table class="mk-table"><thead><tr><th>Date</th><th>Mock</th><th>P</th><th>C</th><th>M</th><th>Total</th><th>%</th><th>Rank</th><th></th></tr></thead><tbody>${flt.map(e => `<tr><td>${esc(e.date)}</td><td><b>${esc(e.name || 'Untitled')}</b><small>${esc(e.exam)} · ${esc(e.mode)}${e.notes ? ' · 📝' : ''}</small></td><td>${num(e.P)}</td><td>${num(e.C)}</td><td>${num(e.M)}</td><td><b>${mtotal(e)}</b>/${e.max}</td><td>${mpct(e).toFixed(1)}</td><td>${e.rank || (e.pctl ? e.pctl + '%ile' : '–')}</td><td class="mk-act"><button class="icon-btn" data-edit="${e.id}" title="Edit">✏️</button><button class="icon-btn" data-del="${e.id}" title="Delete">🗑</button></td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">No attempts here yet.</p>'}
        <div class="row center" style="margin-top:12px"><button class="outline-btn sm" data-a="exp">⬇ Export JSON</button><button class="outline-btn sm" data-a="csv">⬇ CSV</button><button class="outline-btn sm" data-a="imp">⬆ Import</button><input type="file" id="mk-imp" accept=".json" hidden></div></div></div>`;
    };
    up.onclick = e => {
      const a = e.target.closest('[data-a]'), ex = e.target.closest('[data-ex]'), ed = e.target.closest('[data-edit]'), dl = e.target.closest('[data-del]');
      if (ex) { mui.exam = ex.dataset.ex; render(); return; }
      if (ed) { mui.edit = ed.dataset.edit; render(); up.querySelector('.mk-form')?.scrollIntoView({ behavior: 'smooth' }); return; }
      if (dl) { if (confirm('Delete this attempt?')) { mdb.dbs[mdb.active] = cur().filter(z => z.id !== dl.dataset.del); msave(); render(); } return; }
      if (!a) return; const k = a.dataset.a;
      if (k === 'cancel') { mui.edit = null; render(); }
      else if (k === 'save') {
        const v = id => $(id).value, o = { id: mui.edit || 'm' + Date.now().toString(36), name: v('f-name').trim() || 'Untitled mock', date: v('f-date'), exam: v('f-exam'), mode: v('f-mode'), P: num(v('f-P')), C: num(v('f-C')), M: num(v('f-M')), max: num(v('f-max')) || 300, cor: v('f-cor') === '' ? null : num(v('f-cor')), wr: v('f-wr') === '' ? null : num(v('f-wr')), un: v('f-un') === '' ? null : num(v('f-un')), time: v('f-time') === '' ? null : num(v('f-time')), rank: v('f-rank') === '' ? null : num(v('f-rank')), pctl: v('f-pctl') === '' ? null : num(v('f-pctl')), notes: v('f-notes').trim(), mist: {} };
        MIST.forEach(m => { o.mist[m[0]] = num(v('m-' + m[0])); });
        const L = cur(); const i = L.findIndex(z => z.id === o.id); if (i >= 0) L[i] = o; else L.push(o); mui.edit = null; mui.open = false; msave(); toast('Mock saved'); render();
      }
      else if (k === 'newdb') { const n = (prompt('Name for the new mock database (e.g. "Allen 2026"):') || '').trim().slice(0, 40); if (n && !mdb.dbs[n]) { mdb.dbs[n] = []; mdb.active = n; msave(); render(); } else if (n) toast('A database with that name already exists'); }
      else if (k === 'rendb') { const n = (prompt('Rename database:', mdb.active) || '').trim().slice(0, 40); if (n && n !== mdb.active && !mdb.dbs[n]) { mdb.dbs[n] = mdb.dbs[mdb.active]; delete mdb.dbs[mdb.active]; mdb.active = n; msave(); render(); } }
      else if (k === 'deldb') { if (Object.keys(mdb.dbs).length < 2) { toast('Keep at least one database'); return; } if (confirm('Delete database "' + mdb.active + '" and all its attempts?')) { delete mdb.dbs[mdb.active]; mdb.active = Object.keys(mdb.dbs)[0]; msave(); render(); } }
      else if (k === 'exp') dlFile('mock-database.json', JSON.stringify(mdb, null, 2));
      else if (k === 'csv') { const rows = [['date', 'name', 'exam', 'type', 'physics', 'chemistry', 'maths', 'total', 'max', 'percent', 'rank', 'percentile', 'correct', 'wrong', 'unattempted', 'time_min', 'notes']].concat(cur().map(e => [e.date, e.name, e.exam, e.mode, e.P, e.C, e.M, mtotal(e), e.max, mpct(e).toFixed(2), e.rank || '', e.pctl || '', e.cor == null ? '' : e.cor, e.wr == null ? '' : e.wr, e.un == null ? '' : e.un, e.time == null ? '' : e.time, (e.notes || '').replace(/\n/g, ' ')])); dlFile(mdb.active + '.csv', rows.map(r => r.map(c => '"' + String(c == null ? '' : c).replace(/"/g, '""') + '"').join(',')).join('\n'), 'text/csv'); }
      else if (k === 'imp') $('mk-imp').click();
    };
    up.onchange = e => {
      if (e.target.id === 'mk-db') { mdb.active = e.target.value; msave(); mui = { edit: null, exam: 'All', open: false }; render(); }
      else if (e.target.id === 'mk-imp' && e.target.files[0]) { const r = new FileReader(); r.onload = () => { try { const o = JSON.parse(r.result); if (!o.dbs) throw 0; Object.keys(o.dbs).forEach(k => { const have = mdb.dbs[k] || (mdb.dbs[k] = []), ids = new Set(have.map(z => z.id)); (o.dbs[k] || []).forEach(z => { if (!ids.has(z.id)) have.push(z); }); }); msave(); toast('Mock database imported'); render(); } catch (err) { toast('That file is not a valid mock database'); } }; r.readAsText(e.target.files[0]); }
    };
    render();
  }

  /* =============== HOME =============== */
  const dayKey = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  function examDays() { const x = X(); if (!x || !x.S.examDate) return null; const d = new Date(x.S.examDate + 'T00:00:00'); if (isNaN(d)) return null; const t = new Date(); t.setHours(0, 0, 0, 0); return { days: Math.ceil((d - t) / 864e5), name: x.S.examName || 'Exam' }; }
  function todayPlan() { const x = X(); if (!x) return []; const now = x.nowMin(), toM = t => { const [h, m] = String(t || '0:0').split(':').map(Number); return h * 60 + m; }; return x.tt().slice().sort((a, b) => toM(a.time) - toM(b.time)).map(e => Object.assign({ end: toM(e.time) + (e.dur || 60), start: toM(e.time) }, e)).map(e => Object.assign(e, { state: e.done ? 'done' : (e.end < now ? 'late' : (e.start <= now ? 'now' : 'next')) })); }
  function renderHome() {
    const x = X(), el = $('home-dash'); if (!x || !el) return false;
    const now = new Date(), h = now.getHours(), g = h < 5 ? 'Burning the midnight oil' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : h < 22 ? 'Good evening' : 'Late night grind', S = x.S;
    $('home-greet').textContent = g + (S.name ? ', ' + S.name : '') + '!'; $('home-quote').textContent = x.QUOTES[now.getDate() % x.QUOTES.length];
    const today = x.minsOn(x.ld()), goal = S.goal * 60, syl = Math.round((x.sylPct('Class12') + x.sylPct('JEEMains') + x.sylPct('JEEAdv')) / 3), ed = examDays();
    const week = []; for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); week.push([d.toLocaleDateString([], { weekday: 'narrow' }), x.minsOn(dayKey(d))]); }
    const wmax = Math.max(goal, ...week.map(w => w[1]), 30), wtot = week.reduce((a, w) => a + w[1], 0);
    const plan = todayPlan(), cards = x.allCards(), mastered = cards.filter(c => (x.boxes[c.id] || 0) >= 4).length, weak = cards.filter(c => (x.boxes[c.id] || 0) <= 1).length;
    const cod = cards.length ? cards[(now.getFullYear() * 400 + now.getMonth() * 31 + now.getDate()) % cards.length] : null, ms = mockSummary(), hl = health();
    const rb = x.recents[0] && x.idMap.get(x.recents[0]), pg = rb && rb.playlist ? (x.prog[rb._id] || { watched: {} }) : null, wc = pg ? Object.keys(pg.watched || {}).length : 0;
    const row = id => { const b = x.idMap.get(id); return b ? `<button class="link-row" data-open="${esc(id)}">${x.KIND_ICON[b._k]} <span>${esc(trunc(b._t, 60))}</span></button>` : ''; };
    const rec = x.recents.map(row).filter(Boolean).slice(0, 4).join('') || '<p class="muted">Nothing opened yet.</p>', sv = x.favs.map(row).filter(Boolean).slice(0, 4).join('') || '<p class="muted">Tap ☆ on any item to save it here.</p>';
    el.innerHTML = `<div class="tiles">
      <div class="card tile">${x.ring(goal ? today / goal : 0, Math.round(today) + 'm')}<span>Today / ${S.goal}h goal</span></div>
      <div class="card tile"><b>${x.streakNow()} 🔥</b><span>Day streak</span></div>
      <div class="card tile"><b>${(x.totalMins() / 60).toFixed(1)}h</b><span>Total focus</span></div>
      <div class="card tile">${x.ring(syl / 100, syl + '%')}<span>Syllabus</span></div>
      ${ed ? `<div class="card tile tile-exam"><b>${ed.days > 0 ? ed.days : ed.days === 0 ? 'Today!' : '✔'}</b><span>${ed.days > 0 ? 'days to ' + esc(ed.name) : ed.days === 0 ? esc(ed.name) + ' day' : esc(ed.name) + ' done'}</span></div>` : ''}</div>
    ${rb ? `<div class="card hcont"><div><h4>▶ Continue where you left off</h4><b>${esc(trunc(rb._t, 70))}</b><small class="muted">${esc((rb._f || []).join(' › '))}${pg ? ' · video ' + ((pg.last || 0) + 1) + '/' + rb.playlist.length + ' · ' + wc + ' watched' : ''}</small>${pg ? `<div class="prog"><div style="width:${wc / rb.playlist.length * 100}%"></div></div>` : ''}</div><button class="primary-btn" data-open="${esc(rb._id)}">Resume</button></div>` : ''}
    <div class="two"><div class="card"><h4>📈 This week <small class="muted">${(wtot / 60).toFixed(1)} h</small></h4><div class="hbars">${week.map((w, i) => `<div class="hb ${i === 6 ? 'today' : ''}"><i style="height:${Math.max(3, w[1] / wmax * 100)}%" title="${Math.round(w[1])} min"></i><span>${w[0]}</span></div>`).join('')}</div></div>
      <div class="card"><h4>🗓 Today's plan</h4>${plan.length ? plan.slice(0, 5).map(p => `<div class="plan ${p.state}"><b>${esc(p.time)}</b><span>${esc(trunc(p.text, 38))}</span><em>${p.state === 'now' ? 'now' : p.state === 'done' ? '✓' : p.state === 'late' ? 'missed' : ''}</em></div>`).join('') + (plan.length > 5 ? `<p class="muted">+${plan.length - 5} more</p>` : '') : '<p class="muted">Nothing planned. Add blocks in the Timetable.</p>'}<button class="outline-btn sm" data-util="timetable">Open timetable</button></div></div>
    <div class="two"><div class="card"><h4>📇 Card of the day</h4>${cod ? `<div class="cod" data-rrx="flip"><div class="cod-q"><small>${esc(cod.s)}</small>${esc(cod.q)}</div><div class="cod-a">${esc(cod.a)}</div></div>` : '<p class="muted">No cards.</p>'}<p class="muted" style="margin:8px 0">${mastered}/${cards.length} mastered · ${weak} to revise</p><button class="outline-btn sm" data-util="flashcards">Review cards</button></div>
      <div class="card"><h4>🧪 Mock tests <small class="muted">${esc(mdb.active)}</small></h4>${ms.n ? `<div class="mock-snap"><b>${ms.last.pct.toFixed(1)}%</b><span>${esc(trunc(ms.last.name, 28))} · ${ms.last.total}/${ms.last.max}</span><small class="${ms.trend >= 0 ? 'up' : 'down'}">${ms.n > 1 ? (ms.trend >= 0 ? '▲ ' : '▼ ') + Math.abs(ms.trend).toFixed(1) + ' trend · ' : ''}${ms.n} attempts · avg ${ms.avg.toFixed(1)}%</small></div>` : '<p class="muted">Log your mock attempts to track scores, mistakes and trends.</p>'}<button class="outline-btn sm" data-util="mocks">${ms.n ? 'Open database' : 'Log first mock'}</button></div></div>
    <div class="two"><div class="card"><h4>🕘 Recent</h4>${rec}</div><div class="card"><h4>★ Saved</h4>${sv}</div></div>
    <div class="card hhealth"><div><h4>🩺 Library health</h4><small class="muted">${hl.chk ? hl.chk + ' of ' + hl.total + ' videos checked · ' + (hl.bad || hl.mis ? '<b class="down">' + hl.bad + ' unavailable, ' + hl.mis + ' title mismatches</b>' : 'no problems found') : 'Check that every lecture video still plays and matches its title.'}</small></div><span><button class="outline-btn sm" data-rrx="scan">${hl.chk ? 'Re-scan' : 'Scan videos'}</button>${hl.bad || hl.mis ? '<button class="outline-btn sm" data-rrx="review">Review</button>' : ''}</span></div>
    <div class="card"><h4>Quick actions</h4><div class="quick"><button class="outline-btn" data-util="focus">🎯 Start focus</button><button class="outline-btn" data-util="flashcards">📇 Flashcards</button><button class="outline-btn" data-util="mocks">🧪 Mocks</button><button class="outline-btn" data-util="timetable">📅 Timetable</button><button class="outline-btn" data-util="analytics">📊 Analytics</button><button class="outline-btn" data-util="syllabus">📑 Syllabus</button><button class="outline-btn" data-rrx="audio">🎧 Focus sounds</button></div></div>`;
    return true;
  }
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-rrx]'); if (!t || !$('home-dash').contains(t)) return; const k = t.dataset.rrx;
    if (k === 'flip') t.classList.toggle('flip');
    else if (k === 'audio') $('audio-btn').click();
    else if (k === 'review') reviewModal();
    else if (k === 'scan') { t.disabled = true; scan((d, n) => { t.textContent = 'Checking ' + d + '/' + n + '…'; }).then(() => { renderHome(); reviewModal(); }); }
  });

  function addMock(o) { const L = cur(); const i = L.findIndex(z => z.id === o.id); if (i >= 0) L[i] = o; else L.push(o); msave(); }
  window.RRX = { addMock, home: renderHome, mocks, onPlay, checkId, mockSummary, examDays, todayPlan, health, review: reviewModal, scan, trunc };
  const boot = () => { const x = X(); if (x && x.refreshHome) x.refreshHome(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
