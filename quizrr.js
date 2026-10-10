/* quizrr.js - Mock Analyzer: reads a Quizrr test-analysis PDF (or pasted text) and builds a deeper, personalised report.
   Standalone: adds a "Mock Analyzer" card to the Tools tab, renders inside #util-panel. Exposes window.RRQ. */
(function () {
  'use strict';
  const SUBJ = 'Physics|Chemistry|Mathematics|Maths|Biology|Botany|Zoology';
  const DIFF = /^(Easy|Moderate|Medium|Tough|Hard|Difficult)$/i;
  const TAGS = ['Concept gap', 'Formula / memory', 'Calculation slip', 'Unit / sign slip', 'Misread question', 'Time pressure', 'Guess'];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = s => String(s || '').replace(/[¦\n\f\r\t]/g, ' ').replace(/\s+/g, ' ').trim();
  const fmt = s => s >= 3600 ? Math.floor(s / 3600) + 'h ' + Math.floor(s % 3600 / 60) + 'm' : s >= 60 ? Math.floor(s / 60) + 'm ' + Math.round(s % 60) + 's' : Math.round(s) + 's';
  const toSecs = t => { let s = 0, m; if ((m = /(\d+)\s*h/.exec(t))) s += m[1] * 3600; if ((m = /(\d+)\s*m(?!i)/.exec(t))) s += m[1] * 60; if ((m = /(\d+)\s*s/.exec(t))) s += +m[1]; return s; };
  const med = a => { if (!a.length) return 0; const s = a.slice().sort((x, y) => x - y), h = s.length >> 1; return s.length % 2 ? s[h] : (s[h - 1] + s[h]) / 2; };
  const avg = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
  const pct = (a, b) => b ? Math.round(a / b * 100) : 0;
  const cap = s => s ? s[0].toUpperCase() + s.slice(1).toLowerCase() : s;

  /* ---------------- parsing ---------------- */
  function splitCT(ct) {
    const t = ct.split(' ');
    for (let k = Math.floor(t.length / 2); k >= 1; k--) if (t.slice(-k).join(' ') === t.slice(-2 * k, -k).join(' ')) return [t.slice(0, -k).join(' '), t.slice(-k).join(' ')];
    return [ct, ''];
  }
  const mkRow = (n, subject, ct, diff, time, status, ev) => { const c = splitCT(ct); return { n: +n, subject: cap(subject === 'Maths' ? 'Mathematics' : subject), chapter: c[0], topic: c[1], diff: cap(diff === 'Medium' ? 'Moderate' : diff === 'Hard' || diff === 'Difficult' ? 'Tough' : diff), secs: toSecs(time), status: norm(status), ev: norm(ev || '-') }; };
  function parse(input) {
    const flat = norm(typeof input === 'string' ? input : input.flat), grouped = typeof input === 'string' ? '' : (input.grouped || '');
    const g = (re, i) => { const m = re.exec(flat); return m ? (i == null ? m : m[i]) : null; }, num = v => v == null ? null : parseFloat(v);
    const meta = {};
    meta.name = g(/Hey\s+([A-Za-z][\w'-]*)/, 1) || '';
    let title = g(/Here is your\s+(.+?)\s*Analysis/, 1) || 'Untitled test';
    meta.title = title.replace(/\s+(Topic Test|Full Test|Part Test|Chapter Test|Mock Test|Mock)\)?$/i, ' ($1)').replace(/\s+/g, ' ');
    const sd = g(/\b((?:JEE|NEET|CUET|BITSAT)[^]{0,160}?)\s*Test Attempt Date:\s*([A-Za-z]+\s+\d{1,2},\s*\d{4})/);
    meta.series = sd ? sd[1].replace(/\)$/, '').replace(/\s*\(/, ' · ').trim() : ''; meta.date = sd ? sd[2] : '';
    const iso = meta.date ? new Date(meta.date + ' 12:00') : null; meta.ts = iso && !isNaN(iso) ? iso.getTime() : Date.now();
    const ov = {};
    let m;
    if ((m = g(/Overall Score\s*(-?\d+(?:\.\d+)?)\s*\/\s*(\d+)/))) { ov.score = +m[1]; ov.max = +m[2]; }
    if ((m = g(/QS ATTEMPTED\s*(\d+)\s*\/\s*(\d+)/i))) { ov.att = +m[1]; ov.n = +m[2]; }
    ov.acc = num(g(/ACCURACY\s*([\d.]+)\s*%/i, 1));
    if ((m = g(/POSITIVE SCORE\s*(\d+(?:\.\d+)?)\s*\/\s*(\d+)/i))) ov.pos = +m[1];
    if ((m = g(/MARKS LOST\s*(\d+(?:\.\d+)?)\s*\/\s*(\d+)/i))) ov.lost = +m[1];
    ov.mins = num(g(/TIME TAKEN\s*(\d+)\s*min/i, 1));
    /* question rows */
    let rows = [];
    String(grouped).split('\n').forEach(line => {
      const c = line.split('¦').map(s => s.trim()).filter(Boolean);
      const i = c.findIndex((x, k) => /^\d{1,3}$/.test(x) && new RegExp('^(' + SUBJ + ')$', 'i').test(c[k + 1] || ''));
      if (i < 0) return; const j = c.findIndex((x, k) => k > i + 1 && DIFF.test(x)); if (j < i + 3) return;
      const ct = c.slice(i + 2, j); if (!/^(\d+\s*[hms]\s*)+$/i.test(c[j + 1] || '')) return;
      const r = mkRow(c[i], c[i + 1], ct.join(' '), c[j], c[j + 1], c[j + 2] || '', c[j + 3]);
      if (ct.length > 1) { r.chapter = ct[0]; r.topic = ct.slice(1).join(' '); } rows.push(r);
    });
    if (!rows.length) {
      const re = new RegExp('(?:^|\\s)(\\d{1,3})\\s+(' + SUBJ + ')\\s+(.+?)\\s+(Easy|Moderate|Medium|Tough|Hard|Difficult)\\s+((?:\\d+h\\s*)?(?:\\d+m\\s*)?(?:\\d+s))\\s+(Not Answered|Answered|Not Visited|Marked for Review)\\s*(Perfect|Wasted|Overtime|Confused|-)?', 'gi');
      let x; while ((x = re.exec(flat))) rows.push(mkRow(x[1], x[2], x[3], x[4], x[5], x[6], x[7]));
    }
    const seen = {}; rows = rows.filter(r => r.n > 0 && r.n <= 300 && !seen[r.n] && (seen[r.n] = 1)).sort((a, b) => a.n - b.n);
    return { meta, ov, rows };
  }
  function classify(rep) {
    const rows = rep.rows, ov = rep.ov;
    rows.forEach(r => { const st = r.status.toLowerCase(), ev = (r.ev || '-').toLowerCase();
      r.res = /not visited/.test(st) ? 'unseen' : (/not answered/.test(st) || (/marked/.test(st) && !/answered/.test(st))) ? 'skip' : ev === 'perfect' ? 'correct' : (ev === 'wasted' || ev === '-') ? 'wrong' : 'amb'; });
    let need = ov.acc != null && ov.att ? Math.round(ov.acc / 100 * ov.att) - rows.filter(r => r.res === 'correct').length : 0;
    rows.forEach(r => { if (r.res === 'amb') { if (need > 0) { r.res = 'correct'; need--; } else r.res = 'wrong'; } });
    return rep;
  }

  /* ---------------- analysis ---------------- */
  function analyze(rep) {
    classify(rep); const rows = rep.rows, ov = rep.ov, N = rows.length, A = { insights: [], plan: [] };
    const cnt = f => rows.filter(f).length, corr = cnt(r => r.res === 'correct'), wrong = cnt(r => r.res === 'wrong'), skip = cnt(r => r.res === 'skip'), unseen = cnt(r => r.res === 'unseen'), att = corr + wrong;
    let plus = ov.max && N ? ov.max / N : 4; if (!(plus > 0 && plus <= 10)) plus = 4; plus = Math.round(plus * 2) / 2;
    let minus = ov.score != null && wrong ? (corr * plus - ov.score) / wrong : (ov.lost && wrong ? ov.lost / wrong : 1);
    if (!(minus >= 0 && minus <= 5)) minus = 1; minus = Math.round(minus * 2) / 2;
    const score = ov.score != null ? ov.score : corr * plus - wrong * minus, max = ov.max || N * plus, secs = rows.reduce((a, r) => a + r.secs, 0);
    Object.assign(A, { N, corr, wrong, skip, unseen, att, plus, minus, score, max, scorePct: pct(score, max), acc: pct(corr, att), attRate: pct(att, N), secs, avgSecs: N ? secs / N : 0 });
    const grp = key => { const o = {}; rows.forEach(r => { const k = r[key] || '—'; const x = o[k] = o[k] || { name: k, n: 0, corr: 0, wrong: 0, skip: 0, secs: 0 }; x.n++; x.secs += r.secs; if (r.res === 'correct') x.corr++; else if (r.res === 'wrong') x.wrong++; else x.skip++; }); return o; };
    A.bySub = grp('subject'); A.byDiff = grp('diff'); A.byChap = grp('chapter');
    const half = Math.ceil(N / 2), h1 = rows.slice(0, half), h2 = rows.slice(half), hs = a => ({ att: a.filter(r => r.res === 'correct' || r.res === 'wrong').length, corr: a.filter(r => r.res === 'correct').length, n: a.length, from: a[0] && a[0].n, to: a.length && a[a.length - 1].n });
    A.halves = [hs(h1), hs(h2)];
    A.fixWrong = score + wrong * (plus + minus); A.best = A.fixWrong + (skip + unseen) * plus;
    A.wrongs = rows.filter(r => r.res === 'wrong'); A.skipped = rows.filter(r => r.res === 'skip' || r.res === 'unseen');
    const ct = rows.filter(r => r.res === 'correct').map(r => r.secs), wt = A.wrongs.map(r => r.secs), mAll = med(rows.map(r => r.secs));
    A.medAll = mAll; A.medCorrect = med(ct); A.avgWrong = avg(wt);
    const I = (l, t, d) => A.insights.push({ l, t, d }), L = n => n.map(r => 'Q' + r.n).join(', ');
    const lvl = A.scorePct >= 85 ? ['Excellent', '🏆', 'good'] : A.scorePct >= 70 ? ['Strong', '💪', 'good'] : A.scorePct >= 50 ? ['Decent, with clear upside', '📈', 'warn'] : ['Needs a rebuild', '🛠️', 'bad'];
    A.verdict = { label: lvl[0], icon: lvl[1], cls: lvl[2] };
    /* headline */
    if (wrong || skip + unseen) I('info', 'Where your marks went', `You scored ${score}/${max}. Each wrong answer cost you ${plus + minus} marks against a correct one (${plus} not gained + ${minus} deducted). ${wrong ? `Fixing ${L(A.wrongs)} alone lifts you to ${A.fixWrong}/${max}.` : ''} ${skip + unseen ? `Attempting ${L(A.skipped)} could add ${(skip + unseen) * plus} more.` : ''}`);
    else I('good', 'Clean sheet', `Every question attempted and correct: ${score}/${max}.`);
    /* difficulty */
    const dOrder = ['Easy', 'Moderate', 'Tough'], dd = dOrder.map(k => A.byDiff[k]).filter(Boolean);
    dd.forEach(d => { const a = d.corr + d.wrong; if (d.name === 'Easy' && d.wrong) I('bad', `Easy questions dropped (${d.wrong})`, `Easy questions are the marks you can't afford to lose. ${d.wrong} missed: read each easy question twice before locking it in.`);
      else if (d.name !== 'Easy' && a >= 3 && pct(d.corr, a) < 70) I('warn', `${d.name} accuracy is ${pct(d.corr, a)}%`, `${d.corr}/${a} attempted ${d.name.toLowerCase()} questions were right. This is your leakiest band.`); });
    const eT = A.byDiff.Easy, mT = A.byDiff.Moderate, tT = A.byDiff.Tough;
    if (tT && mT && tT.corr === tT.corr + tT.wrong && tT.corr && mT.wrong > 0) I('info', 'Hard question solved, moderates missed', `You got the tough question right but lost ${mT.wrong} moderate one${mT.wrong > 1 ? 's' : ''}. That pattern usually points to attention lapses (a skipped step, a sign or a unit) rather than missing concepts, so check how each miss actually went wrong.`);
    if (eT && !eT.wrong && eT.corr) I('good', 'Easy band is solid', `${eT.corr}/${eT.n} easy questions correct${tT && tT.corr ? ', and the tough one too' : ''}.`);
    /* fatigue / halves */
    const [a1, a2] = A.halves; if (a1.att >= 3 && a2.att >= 3) { const p1 = pct(a1.corr, a1.att), p2 = pct(a2.corr, a2.att);
      if (p1 - p2 >= 20) I('warn', 'Accuracy dropped in the second half', `Q${a1.from}–${a1.to}: ${p1}% correct. Q${a2.from}–${a2.to}: ${p2}%. Concentration or care fades late; build a 20-second verification habit for the last third of a paper.`);
      else if (p2 - p1 >= 20) I('info', 'You warm up slowly', `First half ${p1}% vs second half ${p2}%. Start with a couple of confidence questions.`); }
    /* time behaviour */
    if (wt.length && ct.length) { if (A.avgWrong < A.medCorrect * .6) I('warn', 'Wrong answers were rushed', `Wrong answers took ${fmt(A.avgWrong)} on average vs a median ${fmt(A.medCorrect)} for correct ones. Slow down on anything you're answering instinctively.`);
      else if (A.avgWrong > A.medCorrect * 1.5) I('warn', 'Wrong answers took longer', `${fmt(A.avgWrong)} on wrong answers vs ${fmt(A.medCorrect)} median for correct ones: you got stuck and still missed. Set a hard cut-off, then skip and return.`);
      else I('info', 'Mistakes weren\'t about speed', `Wrong answers took about the same time (${fmt(A.avgWrong)}) as correct ones (median ${fmt(A.medCorrect)}). So it wasn't rushing or getting stuck, it was a specific step or idea going wrong. Redo them to find which.`); }
    const snaps = rows.filter(r => r.res === 'correct' && r.secs <= 20); if (snaps.length >= 3) I('good', `${snaps.length} instant-recall answers`, `${L(snaps)} were correct in 20s or less: formulas and dimension checks are already automatic.`);
    const BENCH = 144; if (A.avgSecs && A.avgSecs < BENCH * .45 && A.acc < 95) I('info', 'Plenty of time left to double-check', `You averaged ${fmt(A.avgSecs)} per question; a full JEE Main paper allows about 2.4 min each. Spend even 15 extra seconds verifying answers before moving on.`);
    const slow = rows.filter(r => r.secs > mAll * 3 && r.secs > 60); if (slow.length) I('info', 'Slowest questions', `${slow.map(r => `Q${r.n} (${fmt(r.secs)}, ${r.res})`).join(', ')} took 3x your median. ${slow.every(r => r.res === 'correct') ? 'You got them right, so this is a speed opportunity, not an accuracy one.' : 'Review whether a shorter method exists.'}`);
    /* skipped */
    A.skipped.forEach(r => { if (r.res === 'skip') I(r.secs < 20 ? 'warn' : 'info', `Q${r.n} skipped after ${fmt(r.secs)}`, r.secs < 20 ? `That's barely a read-through of a ${r.diff.toLowerCase()} question. Try a rule: read it, give it 30 seconds, then decide.` : `You spent ${fmt(r.secs)} and still left it. Check whether the setup was the blocker.`); });
    /* chapters / subjects */
    const ch = Object.values(A.byChap).filter(c => c.n >= 3 && c.corr + c.wrong >= 3 && pct(c.corr, c.corr + c.wrong) < 70); ch.forEach(c => I('warn', `Weak chapter: ${c.name}`, `${pct(c.corr, c.corr + c.wrong)}% accuracy over ${c.corr + c.wrong} attempted.`));
    const subs = Object.values(A.bySub); if (subs.length > 1) { const w = subs.slice().sort((x, y) => pct(x.corr, x.corr + x.wrong) - pct(y.corr, y.corr + y.wrong))[0]; I('warn', `Weakest subject: ${w.name}`, `${pct(w.corr, w.corr + w.wrong)}% accuracy (${w.corr}/${w.corr + w.wrong}).`); }
    /* plan */
    const main = (A.wrongs[0] || A.skipped[0] || rows[0] || {}), subj = main.subject || 'General', chap = main.chapter || 'this chapter', SJ = ['Physics', 'Chemistry', 'Maths'].includes(subj === 'Mathematics' ? 'Maths' : subj) ? (subj === 'Mathematics' ? 'Maths' : subj) : 'General';
    A.subjKey = SJ;
    if (wrong) A.plan.push({ t: `Redo ${L(A.wrongs)} from scratch without looking at solutions, then write one line per question: which step failed?`, m: 20, subj: SJ });
    if (A.skipped.length) A.plan.push({ t: `Attempt ${L(A.skipped)} untimed first, then compare with the solution and note what blocked you.`, m: 10, subj: SJ });
    const wd = dd.filter(d => d.wrong).sort((x, y) => y.wrong - x.wrong)[0];
    A.plan.push({ t: `Drill 15 ${wd ? wd.name.toLowerCase() : 'mixed-level'} questions on ${chap}, under 60s each, with a 10-second sanity check (units, sign, order of magnitude) after every answer.`, m: 30, subj: SJ });
    if (a2.att >= 3 && a1.att >= 3 && pct(a1.corr, a1.att) - pct(a2.corr, a2.att) >= 20) A.plan.push({ t: 'Do one 30-question timed set and keep the last 10 questions as a deliberate "slow and verify" block.', m: 40, subj: SJ });
    A.plan.push({ t: `Re-test ${chap} in 3–5 days. Target: accuracy 90%+ and zero wrong on easy/moderate questions.`, m: 25, subj: SJ });
    return A;
  }

  /* ---------------- storage ---------------- */
  const HK = 'rr_qz_hist_v1', mem = {};
  const lsGet = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return k in mem ? mem[k] : d; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { mem[k] = v; } };
  let hist = [];
  const hid = m => (m.title || '') + '|' + (m.date || '');
  function saveRep(rep) {
    const id = hid(rep.meta); let e = hist.find(h => h.id === id);
    const rows = rep.rows.map(r => ({ n: r.n, subject: r.subject, chapter: r.chapter, topic: r.topic, diff: r.diff, secs: r.secs, status: r.status, ev: r.ev }));
    if (!e) { e = { id, meta: rep.meta, ov: rep.ov, rows, tags: {}, savedAt: Date.now() }; hist.push(e); } else { e.meta = rep.meta; e.ov = rep.ov; e.rows = rows; }
    hist.sort((a, b) => a.meta.ts - b.meta.ts); lsSet(HK, hist); return e;
  }
  const entryAnalysis = e => analyze({ meta: e.meta, ov: e.ov, rows: e.rows.map(r => Object.assign({}, r)) });

  /* ---------------- PDF ---------------- */
  let pdfP;
  const loadPdf = () => window.pdfjsLib ? Promise.resolve(window.pdfjsLib) : pdfP || (pdfP = new Promise((res, rej) => {
    const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    s.onload = () => { window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'; res(window.pdfjsLib); };
    s.onerror = () => { pdfP = null; rej(new Error('Could not load the PDF reader (are you offline?). Use "Paste text" instead.')); }; document.head.appendChild(s);
  }));
  async function pdfToText(file) {
    const lib = await loadPdf(), pdf = await lib.getDocument({ data: await file.arrayBuffer() }).promise; let flat = [], grouped = [];
    for (let p = 1; p <= pdf.numPages; p++) {
      const tc = await (await pdf.getPage(p)).getTextContent(), rows = [];
      flat.push(tc.items.map(i => i.str).join(' '));
      tc.items.forEach(it => { const s = (it.str || '').trim(); if (!s) return; let r = rows.find(r => Math.abs(r.y - it.transform[5]) < 3); if (!r) rows.push(r = { y: it.transform[5], a: [] }); r.a.push([it.transform[4], s]); });
      rows.sort((a, b) => b.y - a.y).forEach(r => grouped.push(r.a.sort((x, y) => x[0] - y[0]).map(z => z[1]).join('¦')));
    }
    return { flat: flat.join(' '), grouped: grouped.join('\n') };
  }

  /* ---------------- rendering ---------------- */
  const SAMPLE = 'Hey Raunak, Here is your Units and Dimensions - Test 2 (Topic Test) Analysis JEE Main 2027 Full Test Series for Dropper (September Batch) Test Attempt Date: October 10, 2026 QS ATTEMPTED 14/15 ACCURACY 78.57% POSITIVE SCORE 44/60 MARKS LOST 3/60 TIME TAKEN 9min Overall Score 41/60 ' +
    '1 Physics Units and Dimensions Dimensions Easy 39s Answered Perfect 2 Physics Units and Dimensions Dimensions Easy 36s Answered Perfect 3 Physics Units and Dimensions Dimensions Tough 1m 2s Answered Perfect 4 Physics Units and Dimensions Dimensions Easy 14s Answered Perfect 5 Physics Units and Dimensions Dimensions Easy 42s Answered Perfect 6 Physics Units and Dimensions Dimensions Easy 35s Answered Perfect 7 Physics Units and Dimensions Dimensions Moderate 13s Not Answered - - 8 Physics Units and Dimensions Dimensions Moderate 1m 46s Answered Perfect 9 Physics Units and Dimensions Dimensions Moderate 50s Answered - ' +
    '10 Physics Units and Dimensions Dimensions Moderate 35s Answered Perfect 11 Physics Units and Dimensions Dimensions Moderate 13s Answered Perfect 12 Physics Units and Dimensions Dimensions Moderate 32s Answered - 13 Physics Units and Dimensions Dimensions Moderate 15s Answered Perfect 14 Physics Units and Dimensions Dimensions Moderate 14s Answered Perfect 15 Physics Units and Dimensions Dimensions Moderate 32s Answered -';
  const CSS = `.qz{padding:22px;max-width:1040px;margin:0 auto;display:flex;flex-direction:column;gap:14px;text-align:left}.qz h2{text-align:center;font-size:1.6em}.qz h4{margin-bottom:8px}.qz .sub{text-align:center;color:var(--text-muted);font-size:.88em;margin-top:-8px}
.qz-drop{border:2px dashed var(--border-color);border-radius:var(--radius-lg);padding:22px;text-align:center;cursor:pointer;transition:.2s;background:var(--sidebar-bg)}.qz-drop:hover,.qz-drop.over{border-color:var(--accent-color);background:var(--folder-bg)}.qz-drop b{display:block;font-size:1.05em;margin-bottom:4px}
.qz-paste{width:100%;min-height:90px;background:var(--folder-bg);color:var(--text-color);border:1px solid var(--border-color);border-radius:var(--radius-md);padding:10px;resize:vertical}
.qz-err{color:var(--danger);font-weight:600;font-size:.9em}.qz-ok{color:var(--success)}.qz-tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px}.qz-tiles .card{padding:12px;text-align:center}.qz-tiles b{display:block;font-size:1.6em;color:var(--accent-color)}.qz-tiles span{font-size:.72em;color:var(--text-muted);font-weight:700;text-transform:uppercase}
.qz-verdict{display:flex;gap:14px;align-items:center}.qz-verdict .big{font-size:2.4em}.qz-verdict h3{font-size:1.2em}
.qz-strip{display:flex;flex-wrap:wrap;gap:6px}.qz-q{width:46px;padding:4px 0;border-radius:8px;text-align:center;font-size:.72em;font-weight:700;color:#fff;cursor:default}.qz-q small{display:block;font-weight:500;opacity:.85}.qz-q.correct{background:#16a34a}.qz-q.wrong{background:#dc2626}.qz-q.skip{background:#d97706}.qz-q.unseen{background:#64748b}
.qz-bar{display:flex;align-items:center;gap:10px;font-size:.85em;margin:6px 0}.qz-bar>span:first-child{width:92px;color:var(--text-muted)}.qz-track{flex:1;height:10px;border-radius:5px;background:var(--border-color);overflow:hidden;display:flex}.qz-track i{display:block;height:100%}.qz-bar b{width:86px;text-align:right}
.qz-ins{border-left:4px solid var(--border-color);padding:8px 12px;margin:8px 0;background:var(--folder-bg);border-radius:0 var(--radius-md) var(--radius-md) 0}.qz-ins.good{border-color:#16a34a}.qz-ins.warn{border-color:#d97706}.qz-ins.bad{border-color:#dc2626}.qz-ins.info{border-color:var(--accent-color)}.qz-ins b{display:block;margin-bottom:2px}.qz-ins p{font-size:.88em;color:var(--text-muted);line-height:1.45}
.qz-plan li{margin:8px 0 8px 18px;line-height:1.45;font-size:.92em}.qz-plan li small{color:var(--text-muted)}.qz-hist td,.qz-hist th{padding:6px 8px;border-bottom:1px solid var(--border-color);text-align:left;font-size:.85em}.qz-mist{display:flex;gap:8px;align-items:center;margin:6px 0;flex-wrap:wrap;font-size:.88em}.qz-mist select{padding:5px 8px}
.qz-svg{width:100%;height:auto}.qz-svg text{fill:var(--text-muted);font-size:9px}@media(max-width:768px){.qz{padding:12px}.qz-q{width:40px}}`;
  const bar = (label, parts, right) => `<div class="qz-bar"><span>${esc(label)}</span><div class="qz-track">${parts.map(p => p[0] ? `<i style="width:${p[0]}%;background:${p[1]}" title="${esc(p[2] || '')}"></i>` : '').join('')}</div><b>${right}</b></div>`;
  const COL = { correct: '#16a34a', wrong: '#dc2626', skip: '#d97706', unseen: '#64748b' };
  const stackBars = (o, n) => [[pct(o.corr, n), COL.correct, 'correct'], [pct(o.wrong, n), COL.wrong, 'wrong'], [pct(o.skip, n), COL.skip, 'skipped']];

  function timeChart(A, rows) {
    const W = Math.max(rows.length * 22, 300), H = 90, mx = Math.max(...rows.map(r => r.secs), A.medAll, 1);
    let s = `<svg viewBox="0 0 ${W} ${H + 18}" class="qz-svg">`;
    rows.forEach((r, i) => { const h = r.secs / mx * H; s += `<rect x="${i * 22 + 3}" y="${H - h}" width="16" height="${h}" rx="3" fill="${COL[r.res]}"><title>Q${r.n}: ${fmt(r.secs)} (${r.res})</title></rect><text x="${i * 22 + 11}" y="${H + 12}" text-anchor="middle">${r.n}</text>`; });
    const y = H - A.medAll / mx * H; return s + `<line x1="0" x2="${W}" y1="${y}" y2="${y}" stroke="var(--text-muted)" stroke-dasharray="4 3"/><text x="${W - 2}" y="${y - 3}" text-anchor="end">median ${fmt(A.medAll)}</text></svg>`;
  }
  function trendChart() {
    if (hist.length < 2) return '<p class="muted">Upload at least two reports to see your trend.</p>';
    const pts = hist.map(e => { const a = entryAnalysis(e); return { s: a.scorePct, c: a.acc, t: e.meta.title }; }), W = 360, H = 110, step = W / Math.max(1, pts.length - 1);
    const line = (k, col) => `<polyline fill="none" stroke="${col}" stroke-width="2" points="${pts.map((p, i) => (i * step).toFixed(1) + ',' + (H - Math.max(0, p[k]) / 100 * H).toFixed(1)).join(' ')}"/>` + pts.map((p, i) => `<circle cx="${i * step}" cy="${H - Math.max(0, p[k]) / 100 * H}" r="3" fill="${col}"><title>${esc(p.t)}: ${p[k]}%</title></circle>`).join('');
    return `<svg viewBox="-10 -6 ${W + 20} ${H + 24}" class="qz-svg">${line('s', 'var(--accent-color)')}${line('c', '#16a34a')}<text x="0" y="${H + 16}">● score %  <tspan fill="#16a34a">● accuracy %</tspan></text></svg>`;
  }
  function viewHTML(cur) {
    const rep = cur.rep, A = cur.A, m = rep.meta, entry = cur.entry;
    const dd = ['Easy', 'Moderate', 'Tough'].map(k => A.byDiff[k]).filter(Boolean);
    const mistakes = A.wrongs.concat(A.skipped).sort((a, b) => a.n - b.n);
    let h = `<div class="card qz-verdict"><div class="big">${A.verdict.icon}</div><div><h3>${esc(m.title)}</h3><p class="muted">${esc(m.series)} ${m.date ? '· ' + esc(m.date) : ''}</p><p><b>${A.verdict.label}</b>${m.name ? ' — here\'s your breakdown, ' + esc(m.name) : ''}.</p></div></div>
    <div class="qz-tiles"><div class="card"><b>${A.score}/${A.max}</b><span>Score · ${A.scorePct}%</span></div><div class="card"><b>${A.acc}%</b><span>Accuracy</span></div><div class="card"><b>${A.att}/${A.N}</b><span>Attempted</span></div><div class="card"><b>${A.corr}·${A.wrong}·${A.skip + A.unseen}</b><span>Right · Wrong · Left</span></div><div class="card"><b>${fmt(A.secs)}</b><span>Time · ${fmt(A.avgSecs)}/Q</span></div></div>
    <div class="card"><h4>🎯 Score potential</h4>${bar('Actual', [[pct(A.score, A.best), 'var(--accent-color)']], A.score)}${A.wrong ? bar('Fix wrong', [[pct(A.fixWrong, A.best), 'var(--accent-color)']], A.fixWrong) : ''}${bar('Best case', [[100, '#16a34a']], A.best)}<p class="muted">Computed from ${A.plus} marks per correct and −${A.minus} per wrong.</p></div>
    <div class="card"><h4>🧠 Personalised insights</h4>${A.insights.map(i => `<div class="qz-ins ${i.l}"><b>${esc(i.t)}</b><p>${esc(i.d)}</p></div>`).join('')}</div>
    <div class="card"><h4>Question map</h4><div class="qz-strip">${rep.rows.map(r => `<div class="qz-q ${r.res}" title="Q${r.n} · ${esc(r.diff)} · ${fmt(r.secs)} · ${r.res}">${r.n}<small>${esc(r.diff[0] || '')} ${fmt(r.secs)}</small></div>`).join('')}</div><div style="margin-top:12px">${timeChart(A, rep.rows)}</div></div>
    <div class="two"><div class="card"><h4>By difficulty</h4>${dd.map(d => bar(d.name, stackBars(d, d.n), d.corr + '/' + d.n)).join('')}</div><div class="card"><h4>By chapter</h4>${Object.values(A.byChap).map(c => bar(c.name.slice(0, 14), stackBars(c, c.n), c.corr + '/' + c.n)).join('')}</div></div>`;
    if (mistakes.length) h += `<div class="card"><h4>📝 Error log <span class="muted">(tag the cause; it feeds your patterns)</span></h4>${mistakes.map(r => `<div class="qz-mist"><b>Q${r.n}</b><span class="muted">${esc(r.chapter)} · ${esc(r.diff)} · ${fmt(r.secs)} · ${r.res === 'wrong' ? 'wrong' : 'not answered'}</span><select data-tag="${r.n}"><option value="">Cause?</option>${TAGS.map(t => `<option ${entry.tags[r.n] === t ? 'selected' : ''}>${t}</option>`).join('')}</select></div>`).join('')}</div>`;
    h += `<div class="card qz-plan"><h4>✅ Your next 7 days</h4><ol>${A.plan.map(p => `<li>${esc(p.t)} <small>(~${p.m} min)</small></li>`).join('')}</ol><div class="row"><button class="primary-btn" data-qa="tt">📅 Add today's tasks to Timetable</button><button class="outline-btn" data-qa="copy">📋 Copy report</button></div></div>`;
    return h;
  }
  function historyHTML() {
    if (!hist.length) return '';
    const tags = {}, chap = {}; hist.forEach(e => { Object.values(e.tags).forEach(t => tags[t] = (tags[t] || 0) + 1); const a = entryAnalysis(e); Object.values(a.byChap).forEach(c => { const x = chap[c.name] = chap[c.name] || { corr: 0, att: 0 }; x.corr += c.corr; x.att += c.corr + c.wrong; }); });
    const tm = Math.max(1, ...Object.values(tags)), tl = Object.keys(tags).sort((a, b) => tags[b] - tags[a]);
    return `<div class="card"><h4>📚 History & trends (${hist.length} saved on this device)</h4>${trendChart()}
    <table class="qz-hist" style="width:100%;border-collapse:collapse"><tr><th>Test</th><th>Date</th><th>Score</th><th>Acc.</th><th></th></tr>${hist.slice().reverse().map(e => { const a = entryAnalysis(e); return `<tr><td>${esc(e.meta.title)}</td><td>${esc(e.meta.date)}</td><td>${a.score}/${a.max}</td><td>${a.acc}%</td><td><button class="chip" data-load="${esc(e.id)}">Open</button> <button class="chip" data-del="${esc(e.id)}">✕</button></td></tr>`; }).join('')}</table>
    <h4 style="margin-top:14px">Chapter accuracy across all tests</h4>${Object.keys(chap).map(k => bar(k.slice(0, 14), [[pct(chap[k].corr, chap[k].att), pct(chap[k].corr, chap[k].att) < 70 ? '#dc2626' : '#16a34a']], pct(chap[k].corr, chap[k].att) + '%')).join('')}
    ${tl.length ? `<h4 style="margin-top:14px">Your mistake patterns</h4>${tl.map(t => bar(t, [[tags[t] / tm * 100, 'var(--accent-color)']], tags[t])).join('')}` : ''}</div>`;
  }
  function reportText(cur) {
    const A = cur.A, m = cur.rep.meta; return [`${m.title} — ${m.date}`, `Score ${A.score}/${A.max} (${A.scorePct}%), accuracy ${A.acc}%, ${A.att}/${A.N} attempted, time ${fmt(A.secs)}`, '', 'Insights:'].concat(A.insights.map(i => `- ${i.t}: ${i.d}`), ['', 'Plan:'], A.plan.map((p, i) => `${i + 1}. ${p.t}`)).join('\n');
  }

  /* ---------------- UI ---------------- */
  const $ = id => document.getElementById(id);
  let cur = null, msg = '', busy = false;
  function mount(up) {
    if (!$('qz-css')) { const s = document.createElement('style'); s.id = 'qz-css'; s.textContent = CSS; document.head.appendChild(s); }
    hist = lsGet(HK, []); if (!Array.isArray(hist)) hist = [];
    const draw = () => {
      up.innerHTML = `<div class="qz"><h2>🧬 Mock Analyzer</h2><p class="sub">Drop a Quizrr analysis PDF to get deeper, personalised feedback. Everything is read in your browser; nothing is uploaded.</p>
      <div class="qz-drop" id="qz-drop"><b>${busy ? '⏳ Reading…' : '📄 Drop Quizrr PDF(s) here or click to choose'}</b><span class="muted">Also works with pasted text. Reports are saved on this device for trends.</span><input type="file" id="qz-file" accept=".pdf,.txt" multiple hidden></div>
      <details><summary>Paste text instead / try the sample</summary><textarea class="qz-paste" id="qz-text" placeholder="Paste the text of the report…"></textarea><div class="row"><button class="outline-btn" data-qa="parse">Analyze pasted text</button><button class="outline-btn" data-qa="sample">Load sample report</button></div></details>
      ${msg ? `<p class="qz-err">${esc(msg)}</p>` : ''}${cur ? viewHTML(cur) : ''}${historyHTML()}</div>`;
      const dz = $('qz-drop'); dz.onclick = () => $('qz-file').click();
      dz.ondragover = e => { e.preventDefault(); dz.classList.add('over'); }; dz.ondragleave = () => dz.classList.remove('over');
      dz.ondrop = e => { e.preventDefault(); dz.classList.remove('over'); handle([...e.dataTransfer.files]); };
    };
    const show = (input, label) => {
      let rep; try { rep = parse(input); } catch (e) { msg = 'Could not read ' + label + ': ' + e.message; return false; }
      if (!rep.rows.length) { msg = `No question table found in ${label}. Make sure it's the full Quizrr analysis (the "Complete Overview" pages). You can also paste the text.`; return false; }
      const A = analyze(rep), entry = saveRep(rep); cur = { rep, A, entry }; msg = ''; return true;
    };
    const handle = async files => {
      if (!files.length) return; busy = true; draw();
      for (const f of files) { try { const isPdf = /\.pdf$/i.test(f.name) || f.type === 'application/pdf'; show(isPdf ? await pdfToText(f) : await f.text(), f.name); } catch (e) { msg = f.name + ': ' + e.message; } }
      busy = false; draw();
    };
    up.onchange = e => { if (e.target.id === 'qz-file') handle([...e.target.files]); else if (e.target.dataset && e.target.dataset.tag) { cur.entry.tags[e.target.dataset.tag] = e.target.value; if (!e.target.value) delete cur.entry.tags[e.target.dataset.tag]; lsSet(HK, hist); draw(); } };
    up.onclick = e => {
      const b = e.target.closest('[data-qa],[data-load],[data-del]'); if (!b) return;
      if (b.dataset.load) { const en = hist.find(h => h.id === b.dataset.load); if (en) { const rep = { meta: en.meta, ov: en.ov, rows: en.rows.map(r => Object.assign({}, r)) }; cur = { rep, A: analyze(rep), entry: en }; msg = ''; draw(); up.scrollTop = 0; } return; }
      if (b.dataset.del) { if (!confirm('Remove this report from history?')) return; hist = hist.filter(h => h.id !== b.dataset.del); lsSet(HK, hist); if (cur && cur.entry.id === b.dataset.del) cur = null; draw(); return; }
      const a = b.dataset.qa;
      if (a === 'parse') { show($('qz-text').value, 'the pasted text'); draw(); }
      else if (a === 'sample') { show(SAMPLE, 'the sample'); draw(); }
      else if (a === 'copy') { const t = reportText(cur); (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => window.showToast && showToast('Report copied'), () => window.prompt('Copy report:', t)); }
      else if (a === 'tt') {
        const X = window.RR && window.RR.x; if (!X || !X.addTT) { window.showToast && showToast('Timetable not available'); return; }
        let t = Math.ceil((X.nowMin() + 20) / 15) * 15; cur.A.plan.slice(0, 3).forEach(p => { const hh = String(Math.floor(t / 60) % 24).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0'); X.addTT(hh, p.t.length > 70 ? p.t.slice(0, 67) + '…' : p.t, p.m, p.subj); t += p.m + 10; });
        window.showToast && showToast('Added to your timetable'); }
    };
    draw();
  }
  function open() {
    const X = window.RR && window.RR.x; if (!X) return;
    X.setView('error'); X.setView('util');
    $('current-title').textContent = '🧬 Mock Analyzer'; $('current-path').textContent = 'Tools › Mock Analyzer';
    const up = $('util-panel'); up.onclick = up.onchange = up.oninput = up.onfocusout = null; mount(up);
  }
  function inject() {
    if ($('qz-open')) return true; const menu = document.querySelector('#view-utilities .util-menu'); if (!menu || !(window.RR && window.RR.x)) return false;
    const b = document.createElement('button'); b.className = 'util-card-btn'; b.id = 'qz-open';
    b.innerHTML = '<span class="icon">🧬</span><div class="info"><h3>Mock Analyzer</h3><p>Upload a Quizrr PDF for deep personal insights</p></div>'; b.addEventListener('click', open); menu.appendChild(b); return true;
  }
  if (typeof document !== 'undefined') { let n = 0; const iv = setInterval(() => { if (inject() || ++n > 80) clearInterval(iv); }, 250); }
  const api = { parse, analyze, open, SAMPLE };
  if (typeof window !== 'undefined') window.RRQ = api;
  if (typeof module !== 'undefined') module.exports = api;
})();
