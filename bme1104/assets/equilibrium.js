/* BME 1104 interactive notes, Chapter 4: equilibrium, acids and bases */
(() => {
'use strict';
const PI = Math.PI, KW = 1e-14, RL = 0.08206;
const lg = Math.log10;
/* [H3O+] from a charge balance: bal(H) is positive when H is too high */
function solveH(bal){ let lo = -16, hi = 1.5; for (let i = 0; i < 80; i++){ const m = (lo + hi)/2; if (bal(Math.pow(10, m)) > 0) hi = m; else lo = m; } return Math.pow(10, (lo + hi)/2); }
/* PCl5 <=> PCl3 + Cl2: shift x so that (b + x)(c + x)/(a - x) = K */
function shift(a, b, c, K){ const B = b + c + K, Cc = b*c - K*a; return (-B + Math.sqrt(B*B - 4*Cc))/2; }

/* ================= 4.1 dynamic equilibrium ================= */
{ const box = $('dq_box'), gr = $('dq_g'), P = {}, N = 140; let mol = [], hist = [], t = 0, acc = 0;
  controls($('dq_c'), [['kf', 'Forward rate constant k_f', 0.05, 1, 0.01, 0.4, '1/s'], ['kr', 'Reverse rate constant k_r', 0.05, 1, 0.01, 0.2, '1/s', (v, P) => `K = k_f/k_r = ${fmt(P.kf/P.kr, 2)}`]], P, () => {});
  function reset(){ mol = []; for (let i = 0; i < N; i++) mol.push({ x:Math.random(), y:Math.random(), vx:(Math.random() - 0.5)*0.3, vy:(Math.random() - 0.5)*0.3, b:false, f:0 }); hist = []; t = 0; acc = 0; }
  function step(dt){ let fw = 0, rv = 0;
    mol.forEach(m => { m.x += m.vx*dt; m.y += m.vy*dt; if (m.x < 0 || m.x > 1){ m.vx *= -1; m.x = clamp(m.x, 0, 1); } if (m.y < 0 || m.y > 1){ m.vy *= -1; m.y = clamp(m.y, 0, 1); } m.f = Math.max(0, m.f - dt*2);
      if (!m.b && Math.random() < P.kf*dt){ m.b = true; m.f = 1; fw++; } else if (m.b && Math.random() < P.kr*dt){ m.b = false; m.f = 1; rv++; } });
    t += dt; acc += dt; if (acc > 0.25){ acc = 0; const nb = mol.filter(m => m.b).length; hist.push([t, (mol.length - nb)/N, nb/N]); if (hist.length > 400) hist.shift(); } }
  function draw(){ readColors(); { const { ctx, W, H } = prep(box), pad = 16, w = W - 2*pad, h = H - 2*pad - 18;
      ctx.strokeStyle = C.rule; ctx.strokeRect(pad, pad, w, h);
      mol.forEach(m => { const x = pad + 6 + m.x*(w - 12), y = pad + 6 + m.y*(h - 12); ctx.fillStyle = m.b ? C.crank : C.rod; ctx.beginPath(); ctx.arc(x, y, m.b ? 4.5 : 5.5, 0, 7); ctx.fill();
        if (m.f > 0){ ctx.strokeStyle = alpha(C.ink, m.f); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, 8 + 6*(1 - m.f), 0, 7); ctx.stroke(); } });
      const nb = mol.filter(m => m.b).length; ctx.fillStyle = C.muted; ctx.font = `12px ${C.mono}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(`A (large, orange): ${mol.length - nb}    B (small, blue): ${nb}    a ring marks a change`, pad, H - 12); }
    const tm = Math.max(30, t), K = P.kf/P.kr, Ntot = mol.length/N, xs = [], ta = [], tb = []; for (let s = 0; s <= tm; s += tm/100){ const e = Math.exp(-(P.kf + P.kr)*s); xs.push(s); }
    // theory from the last restart: fraction of A decays to kr/(kf+kr)
    const t0 = hist.length ? hist[0][0] - 0.25 : 0, a0 = hist.length ? hist[0][1] : 1, aeq = Ntot*P.kr/(P.kf + P.kr);
    xs.forEach(s => { const e = Math.exp(-(P.kf + P.kr)*Math.max(0, s - t0)); ta.push(aeq + (a0 - aeq)*e); tb.push(Ntot - (aeq + (a0 - aeq)*e)); });
    plot(gr, { xmin:0, xmax:tm, ymin:0, ymax:Math.max(1.05, Ntot*1.05), xlab:'time [s]', ylab:'amount (fraction of the start)', pl:52,
      series:[{ x:xs, y:ta, color:alpha(C.rod, 0.35), dash:[4, 3] }, { x:xs, y:tb, color:alpha(C.crank, 0.35), dash:[4, 3] }, { x:hist.map(h => h[0]), y:hist.map(h => h[1]), color:C.rod, w:2.2 }, { x:hist.map(h => h[0]), y:hist.map(h => h[2]), color:C.crank, w:2.2 }],
      legend:[{ color:C.rod, label:'[A]' }, { color:C.crank, label:'[B]' }, { color:C.muted, label:'dashed: rate equations' }] });
    const nb = mol.filter(m => m.b).length, na = mol.length - nb, rf = P.kf*na, rr = P.kr*nb;
    $('dq_sub').textContent = `forward rate k_f[A] = ${fmt(rf, 1)}/s, reverse rate k_r[B] = ${fmt(rr, 1)}/s`;
    $('dq_cap').innerHTML = Math.abs(rf - rr) < 0.15*(rf + rr) + 1 && t > 4/(P.kf + P.kr) ? `<b>Dynamic equilibrium.</b> Molecules still change in both directions (watch the rings), but the forward and reverse rates are equal, so the amounts hold steady at [B]/[A] close to K = ${fmt(K, 2)}.` : rf > rr ? 'The forward reaction is faster than the reverse, so A is being used up and B is building up.' : 'The reverse reaction is faster, so B is turning back into A.'; }
  const an = animate(box, dt => { step(dt); draw(); }); playButton($('dq_play'), an);
  $('dq_reset').addEventListener('click', () => { reset(); draw(); });
  $('dq_add').addEventListener('click', () => { for (let i = 0; i < 50; i++) mol.push({ x:Math.random(), y:Math.random(), vx:(Math.random() - 0.5)*0.3, vy:(Math.random() - 0.5)*0.3, b:false, f:1 }); hist = hist.slice(-1); if (hist.length) hist[0] = [t, mol.filter(m => !m.b).length/N, mol.filter(m => m.b).length/N]; draw(); });
  watchSize(box, draw); watchSize(gr, draw); onRedraw(draw); reset(); for (let i = 0; i < 4; i++) step(0.05); draw(); }

/* ================= 4.2 examples ================= */
example($('ex1'), { title:'Example 4.1: equilibrium constant from known equilibrium amounts', src:'Example 7.1 in the notes',
  q:'At equilibrium a 2 L vessel holds 0.4 mol of sulfur dioxide, 1.0 mol of oxygen and 1.4 mol of sulfur trioxide. Find {m:K_{eq}} for {ce:2SO2(g) + O2(g) <=> 2SO3(g)}.',
  inputs:[['a', 'SO₂ at equilibrium', 0.4, 'mol'], ['b', 'O₂ at equilibrium', 1.0, 'mol'], ['c', 'SO₃ at equilibrium', 1.4, 'mol'], ['V', 'Volume', 2, 'L']],
  solve:v => { const A = v.a/v.V, B = v.b/v.V, Cc = v.c/v.V, K = Cc*Cc/(A*A*B);
    return [['Expression: K = {m:[\\mathrm{SO_3}]}² / ({m:[\\mathrm{SO_2}]}² {m:[\\mathrm{O_2}]})', ''], ['Concentrations: {m:[\\mathrm{SO_2}]}, {m:[\\mathrm{O_2}]}, {m:[\\mathrm{SO_3}]} =', `${fmt(A, 3)} M, ${fmt(B, 3)} M, ${fmt(Cc, 3)} M`], [`K = ${fmt(Cc, 3)}² / (${fmt(A, 3)}² × ${fmt(B, 3)}) =`, `${fmt(K, 3)} M⁻¹`, true],
      ['K is well above 1, so at equilibrium the mixture is mainly sulfur trioxide. This is the key step of the contact process for sulfuric acid.', '']]; } });
example($('ex2'), { title:'Example 4.2: equilibrium concentrations from the starting concentration', src:'Example 7.2 in the notes',
  q:'Phosphorus pentachloride at 0.100 M decomposes at 250 °C: {ce:PCl5(g) <=> PCl3(g) + Cl2(g)}, {m:K_{eq}} = 0.030 M. Find the equilibrium concentrations.',
  inputs:[['c0', 'Starting [PCl₅]', 0.100, 'M'], ['K', 'K_eq', 0.030, 'M']],
  solve:v => { const x = shift(v.c0, 0, 0, v.K);
    return [['Let x mol/L of PCl₅ decompose: {m:[\\mathrm{PCl_5}]} = c₀ − x, {m:[\\mathrm{PCl_3}]} = {m:[\\mathrm{Cl_2}]} = x', ''], [`K = x²/(c₀ − x), so x² + ${fmt(v.K, 3)}x − ${fmt(v.K*v.c0, 4)} = 0`, ''],
      ['x = (−b + √(b² − 4ac))/2a =', `${fmt(x, 4)} M`], ['{m:[\\mathrm{PCl_5}]} =', `${fmt(v.c0 - x, 3)} M`, true], ['{m:[\\mathrm{PCl_3}]} = {m:[\\mathrm{Cl_2}]} =', `${fmt(x, 3)} M`, true],
      [`Check: ${fmt(x, 4)}² / ${fmt(v.c0 - x, 4)} = ${fmt(x*x/(v.c0 - x), 4)}`, '']]; } });
example($('ex3'), { title:'Example 4.3: the same reaction in partial pressures', src:'Example 7.3 in the notes',
  q:'Express {m:K_{eq}} of Example 4.2 in atmospheres at 250 °C (523 K) and find the equilibrium partial pressures.',
  inputs:[['K', 'K_eq', 0.030, 'M'], ['c0', 'Starting [PCl₅]', 0.100, 'M'], ['T', 'Temperature', 523, 'K']],
  solve:v => { const RT = RL*v.T, Kp = v.K*RT, P0 = v.c0*RT, x = shift(P0, 0, 0, Kp);
    return [['Δn = (1 + 1) − 1 = 1, so K(atm) = K(M) × (RT)¹', ''], [`K(atm) = ${v.K} × 0.08206 × ${v.T} =`, `${fmt(Kp, 3)} atm`, true], ['Starting pressure P = MRT =', `${fmt(P0, 3)} atm`],
      [`x²/(${fmt(P0, 2)} − x) = ${fmt(Kp, 2)}, so x² + ${fmt(Kp, 2)}x − ${fmt(Kp*P0, 2)} = 0: x =`, `${fmt(x, 3)} atm`], ['P(PCl₅) =', `${fmt(P0 - x, 2)} atm`, true], ['P(PCl₃) = P(Cl₂) =', `${fmt(x, 2)} atm`, true]]; } });

/* ================= 4.3 Le Chatelier ================= */
{ const cv = $('lc'), DH = 88000, K0 = 0.030, T0 = 523; let S, prev, dist, msg = '', anim = 1;
  const K = T => K0*Math.exp(-DH/R_G*(1/T - 1/T0));
  function eqm(s){ const k = K(s.T), x = shift(s.a/s.V, s.b/s.V, s.c/s.V, k)*s.V; return { a:s.a - x, b:s.b + x, c:s.c + x, V:s.V, T:s.T }; }
  function reset(){ S = eqm({ a:0.1, b:0, c:0, V:1, T:523 }); prev = S; dist = S; msg = 'Start: 0.100 mol of PCl₅ in 1.00 L at 250 °C has settled to equilibrium. Choose a change.'; anim = 1; }
  const Q = s => (s.b/s.V)*(s.c/s.V)/(s.a/s.V);
  function act(a){ prev = S; const s = Object.assign({}, S);
    if (a === 'reset'){ reset(); draw(); info(); return; }
    if (a === 'addR') s.a += 0.2; if (a === 'addP') s.c += 0.1; if (a === 'remP') s.c /= 2; if (a === 'volU') s.V *= 2; if (a === 'volD') s.V /= 2; if (a === 'hot') s.T += 25; if (a === 'cold') s.T -= 25;
    s.T = clamp(s.T, 373, 773); dist = s; S = eqm(s); anim = 0;
    const q = Q(dist), k = K(s.T);
    msg = { addR:'Adding a reactant makes Q smaller than K, so the reaction shifts to the right and uses up some of the added PCl₅.', addP:'Adding a product makes Q larger than K, so the reaction shifts to the left and uses up some of the added Cl₂.',
      remP:'Removing a product makes Q smaller than K, so more PCl₅ decomposes to replace some of the lost Cl₂.', volU:'Doubling the volume halves every concentration. One mole of gas on the left becomes two on the right, so the reaction shifts right, towards more moles, partly restoring the pressure.',
      volD:'Halving the volume doubles every concentration. The reaction shifts left, towards fewer moles of gas, to relieve the rise in pressure.',
      hot:'The forward reaction is endothermic (ΔH = +88 kJ/mol). Heating favours the direction that absorbs heat, so K itself increases and more PCl₅ decomposes.',
      cold:'Cooling favours the direction that releases heat, the reverse (exothermic) reaction. K decreases and PCl₅ re-forms.' }[a]
      + ` Q just after the change = ${fmt(q, 4)}, K = ${fmt(k, 4)}: ${Math.abs(lg(q/k)) < 0.01 ? 'already at equilibrium' : q < k ? 'Q < K, shift to the right' : 'Q > K, shift to the left'}.`;
    info(); }
  document.querySelectorAll('#s3 [data-a]').forEach(b => b.addEventListener('click', () => act(b.dataset.a)));
  function info(){ const k = K(S.T);
    $('lc_sub').textContent = `T = ${S.T} K (${S.T - 273} °C), V = ${fmt(S.V, 2)} L, K = ${fmt(k, 4)} M`;
    $('lc_st').innerHTML = statsHTML([['[PCl₅]', `${fmt(S.a/S.V, 4)} M`], ['[PCl₃]', `${fmt(S.b/S.V, 4)} M`], ['[Cl₂]', `${fmt(S.c/S.V, 4)} M`], ['Q after the change', fmt(Q(dist), 4)], ['K at this temperature', fmt(k, 4)]]);
    $('lc_cap').innerHTML = msg; }
  function draw(){ const { ctx, W, H } = prep(cv); readColors(); const e = anim*anim*(3 - 2*anim);
    const cur = { a:dist.a + (S.a - dist.a)*e, b:dist.b + (S.b - dist.b)*e, c:dist.c + (S.c - dist.c)*e, V:S.V };
    const sets = [['before', prev], ['just after the change', dist], [anim < 1 ? 'settling' : 'new equilibrium', cur]], sp = ['PCl₅', 'PCl₃', 'Cl₂'], keys = ['a', 'b', 'c'], cols = [C.rod, C.crank, C.ok];
    const maxc = Math.max(0.12, ...sets.flatMap(([, s]) => keys.map(k => s[k]/s.V)))*1.12, gx = 60, gw = W - 80, gy = 26, gh = H - 120, Y = v => gy + gh - v/maxc*gh;
    ctx.font = `11px ${C.mono}`; ctx.textBaseline = 'middle'; ctx.textAlign = 'right';
    for (let v = 0; v <= maxc; v += niceStep(maxc, 5)){ ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(gx, Y(v)); ctx.lineTo(gx + gw, Y(v)); ctx.stroke(); ctx.fillStyle = C.muted; ctx.fillText(fmt(v, 2), gx - 6, Y(v)); }
    ctx.save(); ctx.translate(14, gy + gh/2); ctx.rotate(-PI/2); ctx.textAlign = 'center'; ctx.fillText('concentration [M]', 0, 0); ctx.restore();
    const gwid = gw/3; sets.forEach(([lab, s], i) => { const x0 = gx + i*gwid + gwid*0.12, bw = gwid*0.76/3;
      keys.forEach((k, j) => { const v = s[k]/s.V, x = x0 + j*bw; ctx.fillStyle = alpha(cols[j], i === 0 ? 0.35 : 0.85); ctx.fillRect(x + 2, Y(v), bw - 4, gy + gh - Y(v)); ctx.fillStyle = C.text; ctx.textAlign = 'center'; ctx.fillText(fmt(v, 3), x + bw/2, Y(v) - 8); ctx.fillStyle = C.muted; ctx.fillText(sp[j], x + bw/2, gy + gh + 10); });
      ctx.fillStyle = C.ink; ctx.font = `600 12px ${C.mono}`; ctx.fillText(lab, x0 + bw*1.5, gy + gh + 26); ctx.font = `11px ${C.mono}`; });
    // Q against K on a log scale
    const k = K(S.T), q = Q(cur), lx0 = 60, lx1 = W - 30, ly = H - 34, lo = lg(k) - 1.5, hi = lg(k) + 1.5, X = v => lx0 + (clamp(lg(v), lo, hi) - lo)/(hi - lo)*(lx1 - lx0);
    ctx.strokeStyle = C.rule; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(lx0, ly); ctx.lineTo(lx1, ly); ctx.stroke(); ctx.lineWidth = 1;
    ctx.fillStyle = C.ink; ctx.fillRect(X(k) - 1.5, ly - 12, 3, 24); ctx.textAlign = 'center'; ctx.fillText('K', X(k), ly + 20);
    ctx.fillStyle = C.crank; ctx.beginPath(); ctx.arc(X(q), ly, 7, 0, 7); ctx.fill(); ctx.fillText('Q', X(q), ly - 18);
    ctx.fillStyle = C.muted; ctx.textAlign = 'left'; ctx.fillText('Q < K: shifts right', lx0, ly + 20); ctx.textAlign = 'right'; ctx.fillText('Q > K: shifts left', lx1, ly + 20); }
  reset(); animate(cv, dt => { if (anim < 1){ anim = Math.min(1, anim + dt/1.6); } draw(); }); watchSize(cv, draw); onRedraw(draw); info(); draw(); }

example($('ex4'), { title:'Example 4.4: adding a reactant', src:'Example 7.4 in the notes',
  q:'An equilibrium mixture in a 1.00 L container holds 0.058 M {ce:PCl5}, 0.042 M {ce:PCl3} and 0.042 M {ce:Cl2} ({m:K_{eq}} = 0.030 M at 250 °C). 0.2 mol of {ce:PCl5} is added. Find the new equilibrium concentrations.',
  inputs:[['a', '[PCl₅] before', 0.058, 'M'], ['b', '[PCl₃] before', 0.042, 'M'], ['c', '[Cl₂] before', 0.042, 'M'], ['d', 'PCl₅ added', 0.2, 'mol'], ['V', 'Volume', 1.00, 'L'], ['K', 'K_eq', 0.030, 'M']],
  solve:v => { const a = v.a + v.d/v.V, x = shift(a, v.b, v.c, v.K), Q = v.b*v.c/a;
    return [[`Just after adding: {m:[\\mathrm{PCl_5}]} = ${v.a} + ${fmt(v.d/v.V, 3)} = ${fmt(a, 3)} M, so Q = ${fmt(Q, 4)} < K: the reaction shifts to the right`, ''],
      [`(${v.b} + x)(${v.c} + x)/(${fmt(a, 3)} − x) = ${v.K}, so x² + ${fmt(v.b + v.c + v.K, 3)}x − ${fmt(v.K*a - v.b*v.c, 5)} = 0`, ''], ['x =', `${fmt(x, 4)} M`],
      ['{m:[\\mathrm{PCl_5}]} =', `${fmt(a - x, 3)} M`, true], ['{m:[\\mathrm{PCl_3}]} = {m:[\\mathrm{Cl_2}]} =', `${fmt(v.b + x, 3)} M`, true],
      ['The notes write this quadratic with 0.42 and 0.78 in place of 0.042 and 0.258; the answer x = 0.039 M is the same.', '']]; } });
example($('ex5'), { title:'Example 4.5: increasing the volume', src:'Example 7.5 in the notes',
  q:'The same equilibrium (0.058 M {ce:PCl5}, 0.042 M {ce:PCl3}, 0.042 M {ce:Cl2}) is expanded from 1.00 L to 2.00 L. Find the direction of the shift and the new equilibrium concentrations.',
  inputs:[['a', '[PCl₅] before', 0.058, 'M'], ['b', '[PCl₃] before', 0.042, 'M'], ['c', '[Cl₂] before', 0.042, 'M'], ['V1', 'Volume before', 1.00, 'L'], ['V2', 'Volume after', 2.00, 'L'], ['K', 'K_eq', 0.030, 'M']],
  solve:v => { const f = v.V1/v.V2, a = v.a*f, b = v.b*f, c = v.c*f, x = shift(a, b, c, v.K);
    return [[`Every concentration falls by the factor V₁/V₂ = ${fmt(f, 3)}: ${fmt(a, 4)}, ${fmt(b, 4)} and ${fmt(c, 4)} M`, ''], [`Q = ${fmt(b*c/a, 4)} ${b*c/a < v.K ? '<' : '>'} K, so the reaction shifts ${b*c/a < v.K ? 'right, towards more moles of gas' : 'left'}`, ''],
      [`(${fmt(b, 3)} + x)(${fmt(c, 3)} + x)/(${fmt(a, 3)} − x) = ${v.K}: x =`, `${fmt(x, 4)} M`], ['{m:[\\mathrm{PCl_5}]} =', `${fmt(a - x, 3)} M`, true], ['{m:[\\mathrm{PCl_3}]} = {m:[\\mathrm{Cl_2}]} =', `${fmt(b + x, 3)} M`, true]]; } });

/* ================= 4.4 pH of a solution ================= */
{ const cv = $('ph'), P = {}; let kind = 'sa';
  const ACIDS = [['hydrofluoric acid', 3.17], ['formic acid', 3.75], ['acetic acid', 4.76], ['carbonic acid', 6.35], ['hydrocyanic acid', 9.21]], BASES = [['methylamine', 3.36], ['ammonia', 4.75], ['pyridine', 8.77]];
  const H = controls($('ph_c'), [['lc', 'log₁₀ of the concentration', -6, 0, 0.1, -1, '', v => `${sci(Math.pow(10, v), 2).replace(/<\/?sup>/g, '')} M`],
    ['pk', 'pKa (acid) or pKb (base)', 2, 11, 0.01, 4.76, '', v => { const L = kind === 'wb' ? BASES : ACIDS; const n = L.reduce((a, x) => Math.abs(x[1] - v) < Math.abs(a[1] - v) ? x : a); return Math.abs(n[1] - v) < 0.3 ? n[0] : ''; }]], P, draw);
  const SUBS = [['stomach acid', 1.5], ['lemon juice', 2.2], ['vinegar', 2.9], ['coffee', 5.0], ['rain', 5.6], ['pure water', 7.0], ['blood', 7.4], ['sea water', 8.1], ['baking soda', 8.3], ['household ammonia', 11.6], ['bleach', 12.5], ['drain cleaner', 13.5]];
  const UNI = ['#d7263d', '#e8492f', '#ef7d2a', '#f2a93b', '#f5d342', '#d9df48', '#9fcf4a', '#58b84f', '#3aa37a', '#2c8fa3', '#2f6fc0', '#3f50b0', '#5a3f9e', '#6b2f8c', '#5a2470'];
  function calc(){ const Cc = Math.pow(10, P.lc), K = Math.pow(10, -P.pk);
    if (kind === 'sa') return solveH(h => h - KW/h - Cc);
    if (kind === 'sb') return solveH(h => h + Cc - KW/h);
    if (kind === 'wa') return solveH(h => h - KW/h - Cc*K/(K + h));
    const Ka = KW/K; return solveH(h => h + Cc*h/(Ka + h) - KW/h); }
  function draw(){ const { ctx, W, H: Hh } = prep(cv); readColors(); const h = calc(), pH = -lg(h), Cc = Math.pow(10, P.lc), x0 = 30, x1 = W - 30, y = Hh*0.46, X = p => x0 + p/14*(x1 - x0);
    for (let i = 0; i < 14; i++){ ctx.fillStyle = UNI[i]; ctx.fillRect(X(i), y - 12, X(i + 1) - X(i) + 0.5, 24); }
    ctx.font = `11px ${C.mono}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (let i = 0; i <= 14; i++){ ctx.fillStyle = C.muted; ctx.fillText(String(i), X(i), y + 22); }
    SUBS.forEach(([n, p], i) => { const up = i % 2 === 0, yy = up ? y - 38 - (i % 4 === 0 ? 14 : 0) : y + 46 + (i % 4 === 1 ? 14 : 0); ctx.strokeStyle = alpha(C.muted, 0.6); ctx.beginPath(); ctx.moveTo(X(p), up ? y - 13 : y + 32); ctx.lineTo(X(p), yy + (up ? 6 : -6)); ctx.stroke(); ctx.fillStyle = C.muted; ctx.fillText(n, clamp(X(p), x0 + 30, x1 - 30), yy); });
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.moveTo(X(pH), y - 14); ctx.lineTo(X(pH) - 8, y - 28); ctx.lineTo(X(pH) + 8, y - 28); ctx.closePath(); ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.strokeRect(X(pH) - 2, y - 14, 4, 28); ctx.lineWidth = 1;
    const nm = { sa:'strong acid (like HCl)', wa:'weak acid', sb:'strong base (like NaOH)', wb:'weak base' }[kind];
    $('ph_t').textContent = `pH of a solution: ${fmt(Cc, Cc < 0.01 ? 6 : 3)} M ${nm}`;
    $('ph_sub').textContent = `pH = −log(${sci(h, 2).replace(/<\/?sup>/g, '').replace(' × 10', 'e')}) = ${fmt(pH, 2)}`;
    const ion = kind === 'wa' ? (Math.pow(10, -P.pk)/(Math.pow(10, -P.pk) + h)) : kind === 'wb' ? (h/(KW/Math.pow(10, -P.pk) + h)) : 1;
    $('ph_st').innerHTML = statsHTML([['pH', fmt(pH, 2)], ['pOH', fmt(14 - pH, 2)], ['[H₃O⁺]', `${sci(h, 2)} M`], ['[OH⁻]', `${sci(KW/h, 2)} M`], ['Fraction ionised', kind[0] === 'w' ? `${fmt(ion*100, ion < 0.1 ? 2 : 1)} %` : '100 %']]);
    $('ph_cap').innerHTML = kind[0] === 's' ? `A strong ${kind === 'sa' ? 'acid' : 'base'} ionises completely, so ${kind === 'sa' ? '[H₃O⁺]' : '[OH⁻]'} equals its concentration${Cc < 3e-7 ? ', except that at such low concentrations the ions from water itself matter and pull the pH towards 7' : ''}. Each tenfold dilution moves the pH one unit towards 7.`
      : `Only ${fmt(ion*100, ion < 0.1 ? 2 : 1)} % of the ${kind === 'wa' ? 'acid' : 'base'} is ionised. For a weak acid that is not too dilute, [H₃O⁺] is close to √(K_a C), so a tenfold dilution moves the pH only half a unit. Diluting a weak ${kind === 'wa' ? 'acid' : 'base'} increases the fraction that ionises.`;
    $('ph_c').querySelectorAll('.ctl')[1].style.display = kind[0] === 'w' ? '' : 'none'; }
  segGroup(document.querySelector('#s4 .seg'), v => { kind = v; H.pk.set(v === 'wb' ? 4.75 : 4.76); draw(); });
  watchSize(cv, draw); onRedraw(draw); draw(); }

example($('ex6'), { title:'Example 4.6: ions in a strong acid', src:'Example 5.2 in the notes',
  q:'Find {m:[\\mathrm{H_3O^+}]} and {m:[\\mathrm{OH^-}]} in a 0.015 M solution of hydrochloric acid at 25 °C.',
  inputs:[['c', 'Concentration of HCl', 0.015, 'M']],
  solve:v => [['HCl is a strong acid and ionises completely: {ce:HCl(aq) + H2O(l) -> H3O+(aq) + Cl-(aq)}', ''], ['{m:[\\mathrm{H_3O^+}]} =', `${v.c} M`, true], ['{m:[\\mathrm{OH^-}]} = K_w / {m:[\\mathrm{H_3O^+}]} = 1.0 × 10⁻¹⁴ /', `${sci(1e-14/v.c, 2)} M`, true], ['pH = −log{m:[\\mathrm{H_3O^+}]} =', fmt(-lg(v.c), 2)]] });
example($('ex7'), { title:'Example 4.7: ion concentrations from pH', src:'Example 5.3 in the notes',
  q:'A solution has a pH of 6.10 at 25 °C. Find {m:[\\mathrm{H_3O^+}]} and {m:[\\mathrm{OH^-}]}.',
  inputs:[['p', 'pH', 6.10, '']],
  solve:v => { const h = Math.pow(10, -v.p); return [['{m:[\\mathrm{H_3O^+}]} = 10^(−pH) = 10^(−' + v.p + ') =', `${sci(h, 2)} M`, true], ['{m:[\\mathrm{OH^-}]} = K_w / {m:[\\mathrm{H_3O^+}]} =', `${sci(1e-14/h, 2)} M`, true], [h > 1e-7 ? 'The solution is slightly acidic.' : 'The solution is basic.', '']]; } });
example($('ex8'), { title:'Example 4.8: pH of a strong base', src:'Example 5.4 in the notes',
  q:'Find the pH and pOH of a 0.025 M solution of sodium hydroxide at 25 °C.',
  inputs:[['c', 'Concentration of NaOH', 0.025, 'M']],
  solve:v => [['NaOH ionises completely, so {m:[\\mathrm{OH^-}]} =', `${v.c} M`], ['pOH = −log(' + v.c + ') =', fmt(-lg(v.c), 2), true], ['pH = 14 − pOH =', fmt(14 + lg(v.c), 2), true]] });

/* ================= 4.4 titration on the bench ================= */
{ const P = {}, cvg = $('ti'); let acid = 's', run = false, drops = [], liq = null, flaskLiq = null, v = null;
  const Va = 25, Ca = 0.1, Cb = 0.1, Ka = () => acid === 's' ? 1e7 : 1.8e-5;
  const pHat = vb => { const ca = Ca*Va/(Va + vb), na = Cb*vb/(Va + vb), K = Ka(); return -lg(solveH(h => h + na - KW/h - ca*K/(K + h))); };
  const H = controls($('ti_c'), [['vb', 'NaOH added from the burette', 0, 50, 0.1, 0, 'mL']], P, () => { run = false; $('ti_run').textContent = 'Open the tap'; upd(); });
  const pinkF = p => clamp((p - 8.2)/1.6, 0, 1);
  // 3D bench
  const glass = () => new THREE.MeshPhysicalMaterial({ color:0xffffff, roughness:0.05, metalness:0, transparent:true, opacity:0.22, clearcoat:1, side:THREE.DoubleSide, depthWrite:false });
  v = niceGL(view3d($('ti3'), { cam:[3.4, 3.0, 7.6], target:[-0.2, 2.2, 0], fov:38,
    build(v){ const R = v.root, steel = metal(0x9aa3ad, { roughness:0.3 }), dark = gloss(0x2b3138, { roughness:0.5 });
      const base = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.08, 1.4), dark); base.position.set(-0.3, 0.04, 0); R.add(base);
      const tile = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.03, 1.0), gloss(0xffffff, { roughness:0.2 })); tile.position.set(0.05, 0.095, 0); R.add(tile);
      const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 4.8, 20), steel); rod.position.set(-1.1, 2.44, 0); R.add(rod);
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.1, 16), steel); arm.rotation.z = PI/2; arm.position.set(-0.55, 3.6, 0); R.add(arm);
      const boss = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.14, 0.12), dark); boss.position.set(-1.1, 3.6, 0); R.add(boss);
      [3.6].forEach(y => { const cl = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.025, 10, 30), dark); cl.rotation.x = PI/2; cl.position.set(0, y, 0); R.add(cl); });
      // burette: 50 mL between y = 2.0 (50) and y = 4.6 (0)
      const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 3.0, 32, 1, true), glass()); tube.position.set(0, 3.3, 0); R.add(tube);
      liq = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 1, 32), new THREE.MeshPhysicalMaterial({ color:0x8fb8da, transparent:true, opacity:0.8, roughness:0.1 })); R.add(liq);
      const tipG = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.02, 0.35, 24, 1, true), glass()); tipG.position.set(0, 1.62, 0); R.add(tipG);
      const tap = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.3, 16), gloss(0x2f6fd8)); tap.rotation.z = PI/2; tap.position.set(0, 1.75, 0); R.add(tap); v.tap = tap;
      for (let m = 0; m <= 50; m += 5){ const y = 4.6 - m/50*2.6, mk = new THREE.Mesh(new THREE.BoxGeometry(m % 10 ? 0.05 : 0.09, 0.006, 0.004), new THREE.MeshBasicMaterial({ color:0x222222 })); mk.position.set(0.02, y, 0.087); R.add(mk);
        if (m % 10 === 0){ const s = textSprite(String(m), { h:0.09, color:'#222' }); s.position.set(0.17, y, 0.09); R.add(s); } }
      // conical flask by lathe
      const prof = [[0.001, 0], [0.5, 0], [0.55, 0.05], [0.16, 0.85], [0.14, 0.9], [0.14, 1.15], [0.16, 1.18]].map(([x, y]) => new THREE.Vector2(x, y));
      const fl = new THREE.Mesh(new THREE.LatheGeometry(prof, 64), glass()); fl.position.set(0, 0.11, 0); R.add(fl);
      flaskLiq = new THREE.Group(); flaskLiq.position.set(0, 0.115, 0); R.add(flaskLiq);
      const dG = new THREE.SphereGeometry(0.025, 12, 8), dM = new THREE.MeshPhysicalMaterial({ color:0xcfe3f5, transparent:true, opacity:0.8 }); v.drop = () => { const d = new THREE.Mesh(dG, dM); d.position.set(0, 1.44, 0); R.add(d); return d; }; },
    update(dt, v){ if (run){ const rate = Math.abs(P.vb - 25) < 3 ? 0.5 : 3; const nv = Math.min(50, P.vb + rate*dt); H.vb.set(+nv.toFixed(2)); if (nv >= 50){ run = false; $('ti_run').textContent = 'Open the tap'; } upd(true);
        if (Math.random() < dt*(rate > 1 ? 14 : 4)) drops.push(v.drop()); }
      const top = 0.115 + level();
      drops = drops.filter(d => { d.position.y -= dt*3.2; if (d.position.y < top){ v.root.remove(d); return false; } return true; });
      v.tap.rotation.x = run ? PI/2 : 0; } }));
  function level(){ const vol = Va + P.vb; return 0.04 + vol/75*0.42; }
  function upd(fromRun){ const p = pHat(P.vb), f = pinkF(p);
    if (v){ const used = P.vb, top = 4.6 - used/50*2.6, bot = 1.8, h = Math.max(0.01, top - bot); liq.scale.y = h; liq.position.set(0, bot + h/2, 0);
      clearMesh(flaskLiq); const hh = level(), rAt = y => 0.5 - (0.5 - 0.16)*(y/0.85) - 0.03, pts = [[0.001, 0.0], [0.47, 0.0], [0.5, 0.04], [rAt(hh), hh], [0.001, hh]].map(([x, y]) => new THREE.Vector2(x, y));
      const col = new THREE.Color(0x8fb8da).lerp(new THREE.Color(0xd62f8b), f*0.85);
      flaskLiq.add(new THREE.Mesh(new THREE.LatheGeometry(pts, 64), new THREE.MeshPhysicalMaterial({ color:col, transparent:true, opacity:0.8, roughness:0.1, clearcoat:0.5 })));
      if (!v.anim.playing) v.render(); }
    drawCurve(); info(p); }
  function drawCurve(){ readColors(); const xs = [], ys = []; for (let x = 0; x <= 50; x += 0.25){ xs.push(x); ys.push(pHat(x)); }
    const pts = [{ x:P.vb, y:pHat(P.vb), color:C.crank, r:6 }], k = Ka();
    if (acid === 'w') pts.push({ x:12.5, y:pHat(12.5), color:C.rod, r:4, label:`half-way: pH = pKa = ${fmt(-lg(k), 2)}` });
    plot(cvg, { xmin:0, xmax:50, ymin:0, ymax:14, xlab:'NaOH added [mL]', ylab:'pH', pl:44, series:[{ x:xs, y:ys, color:alpha(C.ink, 0.7), w:2 }], points:pts,
      bands:[{ y:[8.2, 10], color:'#d62f8b', a:0.12, label:'phenolphthalein turns pink' }], vl:[{ v:25, color:C.muted, label:`equivalence, pH ${fmt(pHat(25), 2)}` }] }); }
  function info(p){ $('ti_t').textContent = `Titration of ${acid === 's' ? 'hydrochloric' : 'acetic'} acid with sodium hydroxide`;
    $('ti_sub').textContent = `25.0 mL of 0.100 M acid, 0.100 M NaOH: ${fmt(P.vb, 1)} mL added, pH ${fmt(p, 2)}`;
    $('ti_cap').innerHTML = P.vb < 24 ? `Before the equivalence point the acid is in excess. ${acid === 'w' ? 'With acetic acid the flask now holds both the acid and its conjugate base, a buffer, so the pH rises only slowly.' : 'The pH stays low until almost all the HCl is used up.'}`
      : P.vb <= 26 ? `<b>Equivalence point</b> at 25.0 mL: moles of NaOH = moles of acid. The pH jumps by several units for a drop or two, which is why an indicator can mark it sharply. ${acid === 'w' ? 'For a weak acid the equivalence pH is above 7 (about 8.7), because acetate is a weak base.' : 'For a strong acid and strong base the equivalence pH is 7.'}`
      : 'After the equivalence point the excess hydroxide sets the pH, and the solution is pink with phenolphthalein.'; }
  segGroup(document.querySelector('#ti_c').previousElementSibling.querySelector('.seg'), a => { acid = a; H.vb.set(0); run = false; $('ti_run').textContent = 'Open the tap'; upd(); });
  $('ti_run').addEventListener('click', () => { if (P.vb >= 50) H.vb.set(0); run = !run; $('ti_run').textContent = run ? 'Close the tap' : 'Open the tap'; if (run && v && !v.anim.playing) v.anim.playing = true; if (!v && run){ run = false; H.vb.set(25); upd(); } });
  $('ti_reset').addEventListener('click', () => { run = false; $('ti_run').textContent = 'Open the tap'; H.vb.set(0); upd(); });
  watchSize(cvg, drawCurve); onRedraw(drawCurve); upd(); }

/* ================= 4.5 buffer against water ================= */
{ const cv = $('bf'), P = {}, pKa = 4.76, Ka = Math.pow(10, -pKa), V = 0.1;
  controls($('bf_c'), [['ca', 'Acetic acid [HA]', 0.01, 1, 0.01, 0.10, 'M'], ['cb', 'Sodium acetate [A⁻]', 0.01, 1, 0.01, 0.10, 'M', (v, P) => `pH = 4.76 + log(${fmt(P.cb, 2)}/${fmt(P.ca, 2)}) = ${fmt(pKa + lg(P.cb/P.ca), 2)}`]], P, draw);
  const pHb = n => { const na = P.cb*V + Math.max(0, -n), cl = Math.max(0, n), Ct = (P.ca + P.cb)*V; return -lg(solveH(h => (h - KW/h)*V + na - cl - Ct*Ka/(Ka + h))); };
  const pHw = n => { const na = Math.max(0, -n), cl = Math.max(0, n); return -lg(solveH(h => (h - KW/h)*V + na - cl)); };
  function draw(){ readColors(); const xs = [], yb = [], yw = []; for (let x = -0.04; x <= 0.04 + 1e-9; x += 0.0004){ xs.push(x*1000); yb.push(pHb(x)); yw.push(pHw(x)); }
    const p0 = pHb(0), p1 = pHb(0.001), w1 = pHw(0.001);
    plot(cv, { xmin:-40, xmax:40, ymin:0, ymax:14, xlab:'NaOH added (left of 0) or HCl added (right of 0) [mmol]', ylab:'pH', pl:44, series:[{ x:xs, y:yw, color:C.muted, w:2, dash:[5, 4] }, { x:xs, y:yb, color:C.rod, w:2.6 }],
      bands:[{ y:[pKa - 1, pKa + 1], color:C.rod, a:0.08, label:'useful range pKa ± 1' }], vl:[{ v:0, color:alpha(C.muted, 0.5) }],
      points:[{ x:0, y:p0, color:C.rod, r:5 }, { x:1, y:p1, color:C.crank, r:4 }, { x:1, y:w1, color:C.crank, r:4 }], legend:[{ color:C.rod, label:'acetate buffer, 100 mL' }, { color:C.muted, label:'100 mL of pure water' }] });
    $('bf_sub').textContent = `buffer pH ${fmt(p0, 2)}, capacity about ${fmt(Math.min(P.ca, P.cb)*V*1000, 1)} mmol of acid or base`;
    $('bf_cap').innerHTML = `Adding 1 mmol of HCl (about 0.17 mL of 6 M acid) lowers the buffer from pH ${fmt(p0, 2)} to ${fmt(p1, 2)}, a change of ${fmt(p0 - p1, 2)}. The same acid in pure water drops the pH from 7.00 to ${fmt(w1, 2)}. The buffer holds until the added acid uses up the acetate (or the added base uses up the acetic acid); after that the curve falls away like water. Raising both concentrations raises the capacity without changing the pH.`; }
  watchSize(cv, draw); onRedraw(draw); draw(); }

example($('ex9'), { title:'Example 4.9: buffer after adding a strong acid', src:'Example 5.7 in the notes',
  q:'A buffer is made from 10.00 g of acetic acid and 0.12 mol of sodium acetate in 200 mL of solution ({m:K_a} = 1.8 × 10⁻⁵). Find its pH after adding 2.00 mL of 6.00 M HCl.',
  inputs:[['m', 'Mass of acetic acid', 10.00, 'g'], ['M', 'Molar mass of acetic acid', 60.05, 'g/mol'], ['nb', 'Sodium acetate', 0.12, 'mol'], ['V', 'Buffer volume', 200, 'mL'], ['va', 'HCl added', 2.00, 'mL'], ['ca', 'HCl concentration', 6.00, 'M']],
  solve:v => { const Ka = 1.8e-5, na = v.m/v.M, nh = v.ca*v.va/1000, A = na + nh, B = v.nb - nh, Vt = (v.V + v.va)/1000, h0 = Ka*na/v.nb, h = Ka*(A/Vt)/(B/Vt);
    return [['Acetic acid: ' + v.m + ' g / ' + v.M + ' g/mol =', `${fmt(na, 3)} mol`], ['Before adding acid: pH = pKa + log(n(A⁻)/n(HA)) =', fmt(-lg(h0), 2)], ['H₃O⁺ added = ' + v.ca + ' M × ' + fmt(v.va/1000, 5) + ' L =', `${fmt(nh, 4)} mol`],
      ['The acetate takes up all the added H₃O⁺: acetic acid', `${fmt(A, 3)} mol`], ['Acetate left', `${fmt(B, 3)} mol`], [`New volume ${fmt(Vt*1000, 0)} mL: {m:[\\mathrm{HA}]} = ${fmt(A/Vt, 2)} M, {m:[\\mathrm{A^-}]} = ${fmt(B/Vt, 2)} M`, ''],
      ['{m:[\\mathrm{H_3O^+}]} = K_a {m:[\\mathrm{HA}]}/{m:[\\mathrm{A^-}]} =', `${sci(h, 3)} M`], ['pH =', fmt(-lg(h), 2), true], ['The notes round the acetic acid to 0.17 mol, which gives 0.90 M and pH 4.51.', ''], ['The notes print the ratio upside down in the formula, but the numbers used (0.90/0.53) are right.', '']]; } });
example($('ex10'), { title:'Example 4.10: Henderson–Hasselbalch equation', src:'Example 5.8 in the notes',
  q:'Find the pH of a buffer containing 0.10 M carbonic acid and 0.5 M sodium hydrogen carbonate. For {ce:H2CO3}, pKa = 6.38.',
  inputs:[['pk', 'pKa', 6.38, ''], ['a', '[A⁻] = [HCO₃⁻]', 0.5, 'M'], ['ha', '[HA] = [H₂CO₃]', 0.10, 'M']],
  solve:v => [['{ce:H2CO3(aq) + H2O(l) <=> H3O+(aq) + HCO3-(aq)}', ''], [`pH = pKa + log({m:[\\mathrm{A^-}]}/{m:[\\mathrm{HA}]}) = ${v.pk} + log(${v.a}/${v.ha}) = ${v.pk} + ${fmt(lg(v.a/v.ha), 2)} =`, fmt(v.pk + lg(v.a/v.ha), 2), true],
    ['The same carbonic acid and hydrogen carbonate pair buffers human blood at pH 7.4.', '']] });

/* ================= quiz ================= */
quiz($('qz'), [
  { q:'At dynamic equilibrium', o:['both reactions have stopped', 'the forward and reverse rates are equal', 'the concentrations of reactants and products are equal', 'only the forward reaction continues'], a:1, why:'Both reactions continue at equal rates, so the concentrations stay constant, but they are generally not equal to each other.' },
  { q:'For {ce:CaCO3(s) <=> CaO(s) + CO2(g)}, the equilibrium constant is', o:['{m:[\\mathrm{CaO}][\\mathrm{CO_2}]/[\\mathrm{CaCO_3}]}', '{m:[\\mathrm{CO_2}]}', '{m:1/[\\mathrm{CO_2}]}', '{m:[\\mathrm{CaO}]/[\\mathrm{CaCO_3}]}'], a:1, why:'Pure solids are left out of the expression, leaving only the gas.' },
  { q:'For {ce:N2(g) + 3H2(g) <=> 2NH3(g)}, compressing the mixture to half its volume', o:['shifts it towards ammonia', 'shifts it towards nitrogen and hydrogen', 'has no effect', 'changes K'], a:0, why:'Four moles of gas become two, so the reaction shifts towards fewer moles, towards ammonia. K does not change.' },
  { q:'Which change alters the value of {m:K_{eq}}?', o:['Adding a catalyst', 'Adding more reactant', 'Changing the temperature', 'Changing the pressure'], a:2, why:'Only temperature changes K. The others shift the position of equilibrium (or, for a catalyst, only the speed of reaching it).' },
  { q:'If Q > K, the reaction', o:['shifts to the right', 'shifts to the left', 'is at equilibrium', 'stops'], a:1, why:'There are too many products for equilibrium, so products turn back into reactants.' },
  { q:'In {ce:NH3 + H2O <=> NH4+ + OH-}, the conjugate acid of ammonia is', o:['{ce:H2O}', '{ce:OH-}', '{ce:NH4+}', '{ce:H3O+}'], a:2, why:'Ammonia accepts a proton to become {ce:NH4+}, its conjugate acid.' },
  { q:'A 0.001 M HCl solution has a pH of', o:['1', '3', '11', '0.001'], a:1, why:'Complete ionisation gives [H₃O⁺] = 10⁻³ M, so pH = 3.' },
  { q:'A buffer of acetic acid (pKa 4.76) with equal concentrations of acid and acetate has a pH of', o:['7.00', '4.76', '2.38', '9.24'], a:1, why:'With [A⁻] = [HA], log(1) = 0 and pH = pKa.' }]);
})();
