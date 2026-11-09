/* Laboratory instruments in detail: interactive figures */
(() => {
'use strict';
const fx = (v, d = 1) => n2(v, d);
let seed = 5; const rnd = () => { seed = (seed*16807) % 2147483647; return (seed - 1)/2147483646; };
const gauss = () => { const u = Math.max(rnd(), 1e-12), v = rnd(); return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v); };
const tickText = v => v >= 1000 ? (v/1000) + 'k' : String(+v.toPrecision(3));
// axes for a custom plot: o = {xl,xr,yb,yt, xticks, yticks, xlab, ylab, ylog, xlog}
function axes(cv, o){ const pl = 56, pr = 14, pt = 22, pb = 32, { ctx, W, H } = prep(cv), w = W - pl - pr, h = H - pt - pb;
  const tx = v => o.xlog ? Math.log10(v) : v, ty = v => o.ylog ? Math.log10(v) : v;
  const X = v => pl + (tx(v) - tx(o.xl))/(tx(o.xr) - tx(o.xl))*w, Y = v => pt + (ty(o.yt) - ty(v))/(ty(o.yt) - ty(o.yb))*h;
  ctx.font = `11px ${C.mono}`; ctx.textBaseline = 'middle'; ctx.lineWidth = 1;
  for (const v of o.yticks){ ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(pl, Y(v)); ctx.lineTo(pl + w, Y(v)); ctx.stroke(); ctx.fillStyle = C.muted; ctx.textAlign = 'right'; ctx.fillText(o.yfmt ? o.yfmt(v) : tickText(v), pl - 6, Y(v)); }
  for (const v of o.xticks){ ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(X(v), pt); ctx.lineTo(X(v), pt + h); ctx.stroke(); ctx.fillStyle = C.muted; ctx.textAlign = 'center'; ctx.fillText(o.xfmt ? o.xfmt(v) : tickText(v), X(v), pt + h + 11); }
  ctx.textAlign = 'right'; ctx.fillText(o.xlab || '', pl + w, pt + h + 25);
  ctx.save(); ctx.translate(12, pt + h/2); ctx.rotate(-Math.PI/2); ctx.textAlign = 'center'; rich(ctx, o.ylab || '', 0, 0); ctx.restore();
  const line = (xs, ys, col, wd = 1.8, dash) => { ctx.save(); ctx.beginPath(); ctx.rect(pl, pt, w, h); ctx.clip(); ctx.strokeStyle = col; ctx.lineWidth = wd; ctx.setLineDash(dash || []); ctx.beginPath(); let on = false; xs.forEach((x, i) => { const y = ys[i]; if (!isFinite(y) || !isFinite(x)){ on = false; return; } const px = X(x), py = Y(y); on ? ctx.lineTo(px, py) : ctx.moveTo(px, py); on = true; }); ctx.stroke(); ctx.restore(); };
  const legend = items => { let lx = pl; ctx.font = `11px ${C.mono}`; items.forEach(([t, col, dash]) => { ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.setLineDash(dash || []); ctx.beginPath(); ctx.moveTo(lx, 10); ctx.lineTo(lx + 14, 10); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = C.muted; ctx.textAlign = 'left'; lx += 26 + rich(ctx, t, lx + 18, 10); }); };
  return { ctx, W, H, X, Y, pl, pt, w, h, line, legend }; }

/* ============ 1. viscosity ============ */
{ const P = {};
  controls($('vt_c2'), [['n40', 'ν at 40 °C (new oil)', 10, 400, 0.5, 46, 'mm²/s'], ['n100', 'ν at 100 °C (new oil)', 2, 40, 0.1, 6.8, 'mm²/s'], ['To', 'Operating temperature', -10, 120, 1, 60, '°C'], ['used', 'Used oil ν at 40 °C', 10, 400, 0.5, 51, 'mm²/s']], P, () => draw());
  function draw(){ const ll = v => Math.log10(Math.log10(v + 0.7)), lt = T => Math.log10(T + 273.15), B = (ll(P.n40) - ll(P.n100))/(lt(100) - lt(40)), A = ll(P.n40) + B*lt(40);
    const nu = T => 10**(10**(A - B*lt(T))) - 0.7, ts = [], ns = []; for (let T = -10; T <= 130; T += 1){ ts.push(T); ns.push(nu(T)); }
    const top = Math.max(...ns), yt = 10**Math.ceil(Math.log10(top)), yb = 10**Math.floor(Math.log10(Math.min(...ns)));
    const yticks = []; for (let d = yb; d <= yt; d *= 10) [1, 2, 5].forEach(k => { if (d*k <= yt) yticks.push(d*k); });
    const a = axes($('vt'), { xl:-10, xr:130, yb, yt, ylog:true, xticks:[0, 20, 40, 60, 80, 100, 120], yticks, xlab:'temperature [°C]', ylab:'ν [mm²/s] (log scale)' });
    a.line(ts, ns, C.crank, 2); a.legend([['ASTM D341 line through the two measurements', C.crank]]);
    [[40, P.n40], [100, P.n100]].forEach(([T, v]) => dotAt(a.ctx, a.X(T), a.Y(v), C.ink, 4.5));
    const vo = nu(P.To); dotAt(a.ctx, a.X(P.To), a.Y(vo), C.bad, 6); label(a.ctx, `${fx(vo, 1)} mm²/s at ${P.To} °C`, a.X(P.To) + 8, a.Y(vo) - 12, C.bad, 'left', 11.5);
    // gauge
    const ch = (P.used/P.n40 - 1)*100, g = fitXY($('vt_c'), { xl:-35, xr:35, yb:-1, yt:1 }, 26), q = g.ctx, band = (a1, b1, col) => { q.fillStyle = alpha(col, 0.22); q.fillRect(g.PX(a1), g.PY(0.3), g.PX(b1) - g.PX(a1), g.PY(-0.3) - g.PY(0.3)); };
    band(-35, -20, C.bad); band(-20, -10, C.force); band(-10, 10, C.ok); band(10, 20, C.force); band(20, 35, C.bad);
    [-30, -20, -10, 0, 10, 20, 30].forEach(v => label(q, `${v > 0 ? '+' : ''}${v}%`, g.PX(v), g.PY(-0.45), C.muted, 'center', 10.5, false));
    const cx = g.PX(clamp(ch, -35, 35)); q.strokeStyle = C.ink; q.lineWidth = 3; q.beginPath(); q.moveTo(cx, g.PY(0.45)); q.lineTo(cx, g.PY(-0.32)); q.stroke();
    label(q, `used oil: ${ch >= 0 ? '+' : ''}${fx(ch, 1)}% vs new`, cx, g.PY(0.6), C.ink, 'center', 12); label(q, 'normal ±10%', g.PX(0), g.PY(0.85), C.ok, 'center', 10.5, false); label(q, 'caution', g.PX(-15), g.PY(0.85), C.force, 'center', 10.5, false); label(q, 'caution', g.PX(15), g.PY(0.85), C.force, 'center', 10.5, false); label(q, 'critical', g.PX(-27), g.PY(0.85), C.bad, 'center', 10.5, false); label(q, 'critical', g.PX(27), g.PY(0.85), C.bad, 'center', 10.5, false);
    const rho = 870*(1 - 0.00065*(P.To - 15)), verdict = Math.abs(ch) >= 20 ? 'critical' : Math.abs(ch) >= 10 ? 'caution' : 'normal';
    $('vt_st').innerHTML = statsHTML([['D341 constants A, B', `${fx(A, 4)}, ${fx(B, 4)}`], ['ν at operating temperature', `${fx(vo, 2)} mm²/s`], ['η at operating temperature (ρ ≃ 870 kg/m³ at 15 °C)', `${fx(vo*rho/1000, 2)} mPa⋅s`], ['Thinning from 40 °C to 100 °C', `× ${fx(P.n40/P.n100, 2)}`], ['Used oil', `${verdict}${ch > 0 ? ': thicker (oxidation, soot, wrong oil?)' : ch < 0 ? ': thinner (fuel dilution, wrong oil?)' : ''}`, verdict === 'normal' ? '' : 'bad']]);
    $('vt_sub').textContent = 'defaults: an ISO VG 46 hydraulic oil'; }
  ['vt', 'vt_c'].forEach(id => watchSize($(id), draw)); onRedraw(draw); draw(); }

/* ============ 2. conductivity ============ */
{ const P = {}; const REF = [['ultrapure', 0.055], ['HP boiler cation', 0.2], ['distilled (air)', 1.5], ['rain', 15], ['drinking water', 300], ['cooling tower', 2500], ['0.01 M KCl', 1413], ['seawater', 53000]];
  controls($('cd_c'), [['lk', 'Meter reading (uncompensated)', -1.3, 4.9, 0.01, 2.6, '', v => `${fx(10**v, 10**v < 1 ? 3 : 0)} μS/cm`], ['T', 'Sample temperature', 0, 60, 0.5, 31, '°C'], ['a', 'Temperature coefficient α', 1.5, 2.5, 0.05, 2.0, '%/°C'], ['k', 'TDS factor k', 0.5, 0.8, 0.01, 0.64, '']], P, () => draw());
  function draw(){ const kT = 10**P.lk, k25 = kT/(1 + P.a/100*(P.T - 25)), tds = P.k*k25;
    const g = fitXY($('cd'), { xl:-1.6, xr:5.1, yb:-1, yt:1 }, 26), q = g.ctx; q.strokeStyle = C.muted; q.lineWidth = 1.5; q.beginPath(); q.moveTo(g.PX(-1.5), g.PY(0)); q.lineTo(g.PX(5), g.PY(0)); q.stroke();
    for (let d = -1; d <= 5; d++){ q.beginPath(); q.moveTo(g.PX(d), g.PY(0) - 5); q.lineTo(g.PX(d), g.PY(0) + 5); q.stroke(); label(q, d < 0 ? '0.1' : tickText(10**d), g.PX(d), g.PY(0) + 16, C.muted, 'center', 10.5, false); }
    label(q, 'μS/cm at 25 °C (log scale)', g.PX(5), g.PY(-0.55), C.muted, 'right', 10.5, false);
    REF.forEach(([n, v], i) => { const up = i % 2 === 0, y = up ? 0.3 + 0.18*((i/2) % 2) : -0.3 - 0.18*(((i - 1)/2) % 2); q.strokeStyle = C.grid; q.beginPath(); q.moveTo(g.PX(Math.log10(v)), g.PY(0)); q.lineTo(g.PX(Math.log10(v)), g.PY(y)); q.stroke(); dotAt(q, g.PX(Math.log10(v)), g.PY(0), C.muted, 3.5); label(q, n, g.PX(Math.log10(v)), g.PY(y) + (up ? -6 : 6), C.text, 'center', 10.5); });
    const sx = g.PX(Math.log10(k25)); arrow(q, sx, g.PY(0.95), sx, g.PY(0.08), C.bad, 2.4); label(q, `sample ${fx(k25, k25 < 1 ? 3 : 0)} μS/cm`, sx, g.PY(0.97) + 2, C.bad, 'center', 12);
    const cls = k25 < 0.1 ? 'ultrapure / high-pressure boiler quality' : k25 < 5 ? 'distilled or demineralised' : k25 < 100 ? 'low-mineral fresh water' : k25 < 1500 ? 'typical drinking or process water' : k25 < 10000 ? 'concentrated cooling or brackish water' : 'brine or seawater';
    $('cd_st').innerHTML = statsHTML([['Reading at sample temperature', `${fx(kT, kT < 1 ? 3 : 1)} μS/cm at ${P.T} °C`], ['Compensated to 25 °C', `${fx(k25, k25 < 1 ? 3 : 1)} μS/cm`], ['Error if not compensated', `${fx((kT/k25 - 1)*100, 1)}%`], ['Estimated TDS', `${fx(tds, tds < 10 ? 2 : 0)} mg/L`], ['Water class', cls]]);
    $('cd_sub').textContent = 'readings rise about 2% per °C, so always compare at 25 °C'; }
  watchSize($('cd'), draw); onRedraw(draw); draw(); }

/* ============ 3. titration ============ */
{ const P = {}; let ns = []; const mk = () => { ns = Array.from({ length:400 }, gauss); }; mk();
  controls($('tt_c'), [['tbn', 'True base number of the oil', 2, 20, 0.1, 10, 'mg KOH/g'], ['m', 'Sample mass', 0.5, 5, 0.05, 2, 'g'], ['N', 'Acid titrant normality', 0.05, 0.2, 0.005, 0.1, 'mol/L'], ['inc', 'Titrant increment', 0.02, 0.5, 0.01, 0.1, 'mL'], ['bl', 'Blank', 0, 0.3, 0.01, 0.05, 'mL']], P, () => draw());
  function draw(){ const nB = P.tbn*P.m/56.1, Veq = nB/P.N + P.bl, V0 = 60, Kw = 1e-14, Vmax = Math.max(1, Veq*1.8);
    const E = V => { const d = (P.N*Math.max(0, V - P.bl) - nB)/(V0 + V), h = (d + Math.sqrt(d*d + 4*Kw))/2; return 400 + 59.16*Math.log10(h); };
    const vs = [], es = []; let k = 0; for (let V = 0; V <= Vmax + 1e-9; V += P.inc){ vs.push(V); es.push(E(V) + 1.5*ns[k++ % 400]); }
    const dv = [], de = []; for (let i = 1; i < vs.length; i++){ dv.push((vs[i] + vs[i - 1])/2); de.push((es[i] - es[i - 1])/(vs[i] - vs[i - 1])); }
    let im = 0; de.forEach((v, i) => { if (Math.abs(v) > Math.abs(de[im])) im = i; }); const Vep = dv[im], tbn = (Vep - P.bl)*P.N*56.1/P.m;
    chart($('tt'), { x:vs, series:[{ y:es, color:C.crank, label:'electrode potential [mV]' }], vlines:[{ v:Vep, color:C.bad, label:`end point ${fx(Vep, 2)} mL` }], ylab:'E [mV]', xlab:'titrant added [mL]', zero:false });
    chart($('tt_d'), { x:dv, series:[{ y:de, color:C.acc, label:'dE/dV [mV/mL]' }], vlines:[{ v:Veq, color:C.muted, label:'true equivalence' }], ylab:'dE/dV', xlab:'titrant added [mL]' });
    $('tt_st').innerHTML = statsHTML([['Base in the sample', `${fx(nB, 4)} mmol`], ['True equivalence volume', `${fx(Veq, 3)} mL`], ['End point found', `${fx(Vep, 3)} mL`], ['TBN = (V − V_blank) N × 56.1 / m', `${fx(tbn, 2)} mg KOH/g`], ['Error from step size', `${fx(tbn - P.tbn, 2)} mg KOH/g`, Math.abs(tbn - P.tbn) > 0.3 ? 'bad' : '']]);
    $('tt_sub').textContent = Veq < 2 ? 'small titre: use more sample or weaker titrant for better precision' : P.inc > 0.25 ? 'large increments: the end point is only known to half a step' : 'the end point is the steepest part of the curve'; }
  ['tt', 'tt_d'].forEach(id => watchSize($(id), draw)); onRedraw(draw); draw(); }

/* ============ 4. Karl Fischer example ============ */
example($('ex1'), { title:'Worked example: water in a hydraulic oil by coulometric Karl Fischer', src:'illustrative readings', q:'A syringe weighs 12.4810 g with oil and 10.3470 g after injection. The titration takes 1.5 minutes and passes 3.85 C of charge. The cell drift is 5 μg/min. Find the water content in ppm (mg/kg).',
  inputs:[['w1', 'Syringe before', 12.4810, 'g'], ['w2', 'Syringe after', 10.3470, 'g'], ['Q', 'Charge', 3.85, 'C'], ['t', 'Titration time', 1.5, 'min'], ['d', 'Drift', 5, 'μg/min']],
  solve:o => { const m = o.w1 - o.w2, w = o.Q/10.712*1000, net = w - o.d*o.t; return [['Sample mass by difference', `${fx(m, 4)} g`], ['Water from charge: Q × 18.015/(2 × 96,485)', `${fx(w, 1)} μg`], ['Drift correction d × t', `${fx(o.d*o.t, 1)} μg`], ['Net water', `${fx(net, 1)} μg`], ['Water content = net μg / sample g', `${fx(net/m, 0)} ppm`, true], ['Verdict for a hydraulic oil', net/m < 200 ? 'acceptable (below about 200 ppm)' : 'investigate the source of water', true]]; } });

/* ============ 5. oil analysis trend ============ */
{ const EL = [['Fe', 100, C.crank], ['Cr', 10, C.vel], ['Al', 20, C.steel || C.muted], ['Cu', 30, C.force], ['Pb', 30, C.acc], ['Si', 25, C.rod || C.muted], ['Na', 25, C.ok]];
  const lin = (a, b, n = 8, s = 0) => Array.from({ length:n }, (_, i) => i < s ? a : a + (b - a)*((i - s)/(n - 1 - s))**1.6);
  const SC = { normal:{ Fe:lin(28, 34), Cr:lin(2, 3), Al:lin(4, 5), Cu:lin(6, 8), Pb:lin(3, 4), Si:lin(8, 10), Na:lin(4, 5), dx:'All elements stable and below caution levels: normal wear. Continue the routine sampling interval.' },
    dirt:{ Fe:lin(28, 115, 8, 3), Cr:lin(2, 14, 8, 3), Al:lin(4, 24, 8, 3), Cu:lin(6, 9), Pb:lin(3, 5), Si:lin(8, 48, 8, 2), Na:lin(4, 5), dx:'Silicon rose first, then iron, chromium and aluminium: dirt is entering (check the air filter and intake ducting) and causing abrasive wear of liners, rings and pistons.' },
    coolant:{ Fe:lin(28, 45), Cr:lin(2, 3), Al:lin(4, 6), Cu:lin(6, 42, 8, 3), Pb:lin(3, 5), Si:lin(8, 11), Na:lin(4, 95, 8, 3), dx:'Sodium (and copper) rising together: glycol coolant is leaking into the oil, possibly through the oil cooler or a head gasket. Confirm with FTIR glycol bands or a glycol test; act quickly, as glycol damages bearings.' },
    bearing:{ Fe:lin(28, 38), Cr:lin(2, 3), Al:lin(4, 6), Cu:lin(6, 48, 8, 4), Pb:lin(3, 62, 8, 4), Si:lin(8, 10), Na:lin(4, 5), dx:'Lead and copper rising sharply with little change in iron or silicon: wear of copper–lead bearing shells. Check oil pressure and consider a bearing inspection.' } };
  let sc = 'normal';
  function draw(){ const d = SC[sc], hrs = Array.from({ length:8 }, (_, i) => 250*(i + 1));
    chart($('oa'), { x:hrs, series:EL.map(([e, , col]) => ({ y:d[e], color:col, label:e })), ylab:'concentration [mg/kg]', xlab:'engine hours at sampling' });
    const g = axes($('oa_b'), { xl:0, xr:EL.length, yb:0, yt:400, xticks:[], yticks:[0, 100, 200, 300, 400], ylab:'latest value, % of caution level', xlab:'' }), q = g.ctx;
    EL.forEach(([e, lim, col], i) => { const v = Math.min(400, d[e][7]/lim*100), x0 = g.X(i + 0.2), x1 = g.X(i + 0.8); q.fillStyle = v >= 100 ? C.bad : alpha(C.ok, 0.6); q.fillRect(x0, g.Y(v), x1 - x0, g.Y(0) - g.Y(v)); label(q, e, (x0 + x1)/2, g.Y(0) + 11, C.text, 'center', 11, false); label(q, fx(d[e][7], 0), (x0 + x1)/2, g.Y(v) - 9, C.text, 'center', 10.5, false); });
    q.strokeStyle = C.bad; q.setLineDash([5, 4]); q.beginPath(); q.moveTo(g.pl, g.Y(100)); q.lineTo(g.pl + g.w, g.Y(100)); q.stroke(); q.setLineDash([]); label(q, 'caution level', g.pl + g.w - 4, g.Y(100) - 9, C.bad, 'right', 10.5);
    $('oa_st').innerHTML = `<b>Diagnosis.</b> ${d.dx}`; $('oa_st').className = sc === 'normal' ? 'note' : 'note warn';
    $('oa_sub').textContent = 'eight samples, 250 h apart; indicative limits only'; }
  segGroup($('oa_seg'), v => { sc = v; draw(); }); ['oa', 'oa_b'].forEach(id => watchSize($(id), draw)); onRedraw(draw); draw(); }

/* ============ 6. FTIR polymers ============ */
{ const PK = { 'Polyethylene (PE)':[[2915, 1, 18], [2848, 0.8, 14], [1472, 0.22, 6], [1462, 0.2, 6], [730, 0.22, 5], [718, 0.2, 5]],
    'Polypropylene (PP)':[[2950, 0.8, 16], [2915, 0.9, 16], [2838, 0.45, 12], [1455, 0.4, 12], [1376, 0.35, 8], [1167, 0.15, 8], [997, 0.12, 6], [973, 0.15, 6]],
    'PET (polyester)':[[2960, 0.06, 30], [1712, 1, 16], [1408, 0.15, 8], [1240, 0.95, 20], [1095, 0.8, 16], [1017, 0.35, 8], [872, 0.15, 8], [723, 0.7, 8]],
    'Nylon 6 (polyamide)':[[3298, 0.5, 55], [3080, 0.12, 30], [2930, 0.4, 22], [2860, 0.3, 18], [1635, 1, 22], [1538, 0.85, 22], [1200, 0.2, 18], [690, 0.2, 30]],
    'PVC':[[2910, 0.18, 25], [1427, 0.45, 10], [1330, 0.2, 9], [1254, 0.55, 12], [960, 0.5, 16], [690, 0.6, 14], [615, 0.55, 14]],
    'Polystyrene (PS)':[[3025, 0.3, 12], [2920, 0.4, 18], [1601, 0.2, 6], [1493, 0.45, 7], [1452, 0.4, 8], [1028, 0.15, 6], [757, 0.7, 7], [698, 1, 8]] };
  const names = Object.keys(PK), ss = $('ir_s'), sa = $('ir_a'); ss.add(new Option('(unknown only)', '')); names.forEach(n => { ss.add(new Option(n, n)); sa.add(new Option(n, n)); });
  let unk = names[2], nz = []; const pick = () => { unk = names[Math.floor(Math.random()*names.length)]; nz = Array.from({ length:700 }, gauss); }; nz = Array.from({ length:700 }, gauss);
  const spec = (n, noise) => { const xs = [], ys = []; for (let i = 0; i < 700; i++){ const w = 4000 - i*(3400/699); let a = 0.02; PK[n].forEach(([c, h, s]) => { a += h*Math.exp(-0.5*((w - c)/s)**2); }); xs.push(w); ys.push(a + (noise ? 0.008*nz[i] : 0)); } return [xs, ys]; };
  let verdict = '';
  function draw(){ const a = axes($('ir'), { xl:4000, xr:600, yb:-0.05, yt:1.15, xticks:[4000, 3500, 3000, 2500, 2000, 1500, 1000, 600], yticks:[0, 0.25, 0.5, 0.75, 1], yfmt:v => v.toFixed(2), xlab:'wavenumber [cm⁻¹]', ylab:'absorbance' });
    const [ux, uy] = spec(unk, true); a.line(ux, uy, C.ink, 1.6); const leg = [['unknown sample', C.ink]];
    if (ss.value){ const [rx, ry] = spec(ss.value, false); a.line(rx, ry, C.bad, 1.5, [5, 3]); leg.push([`reference: ${ss.value}`, C.bad, [5, 3]]); }
    a.legend(leg); $('ir_st').innerHTML = statsHTML([['Task', 'Overlay references and match the main peaks, then choose your answer'], ['Result', verdict || '–', verdict.startsWith('Not') ? 'bad' : '']]);
    $('ir_sub').textContent = 'ATR-FTIR, simulated from characteristic band positions'; }
  ss.addEventListener('change', draw); $('ir_new').addEventListener('click', () => { pick(); verdict = ''; draw(); });
  $('ir_chk').addEventListener('click', () => { verdict = sa.value === unk ? `Correct: it is ${unk}.` : `Not quite: look again at the strongest bands (it is not ${sa.value}).`; draw(); });
  watchSize($('ir'), draw); onRedraw(draw); draw(); }

/* ============ 7. Duval triangle ============ */
const duval = (m, e, a) => { if (m >= 98) return 'PD'; if (e < 23 && a >= 13) return 'D1'; if ((e >= 23 && e < 40 && a >= 13) || (e >= 40 && a >= 29)) return 'D2'; if (a < 4){ if (e < 20) return 'T1'; if (e < 50) return 'T2'; } if (e >= 50 && a < 15) return 'T3'; return 'DT'; };
const ZN = { PD:['partial discharges', '#7e57c2'], D1:['discharges of low energy', '#ef6c00'], D2:['discharges of high energy (arcing)', '#c62828'], T1:['thermal fault below 300 °C', '#fdd835'], T2:['thermal fault 300 to 700 °C', '#fb8c00'], T3:['thermal fault above 700 °C', '#8d6e63'], DT:['mixture of thermal and electrical faults', '#90a4ae'] };
{ const P = {};
  controls($('dv_c'), [['h2', 'Hydrogen H₂', 0, 1000, 1, 80, 'ppm'], ['ch4', 'Methane CH₄', 0, 1000, 1, 120, 'ppm'], ['c2h6', 'Ethane C₂H₆', 0, 1000, 1, 40, 'ppm'], ['c2h4', 'Ethylene C₂H₄', 0, 1000, 1, 60, 'ppm'], ['c2h2', 'Acetylene C₂H₂', 0, 500, 0.5, 2, 'ppm']], P, () => draw());
  function draw(){ const g = fitView($('dv'), { xl:-0.05, xr:1.05, yb:-0.12, yt:1.0 }, 12), q = g.ctx, Vt = [0.5, Math.sqrt(3)/2], Vr = [1, 0], Vl = [0, 0];
    const pt = (m, e, a) => [ (m*Vt[0] + e*Vr[0] + a*Vl[0])/100, (m*Vt[1] + e*Vr[1] + a*Vl[1])/100 ];
    const cnt = {}; const st = 0.012; for (let a = 0; a <= 100; a += st*100) for (let e = 0; e <= 100 - a; e += st*100){ const m = 100 - a - e, z = duval(m, e, a), p = pt(m, e, a); q.fillStyle = alpha(ZN[z][1], 0.55); const s = st*g.sc*1.15; q.fillRect(g.PX(p[0]) - s/2, g.PY(p[1]) - s/2, s, s); (cnt[z] = cnt[z] || [0, 0, 0])[0] += p[0]; cnt[z][1] += p[1]; cnt[z][2]++; }
    q.strokeStyle = C.ink; q.lineWidth = 1.6; q.beginPath(); [Vt, Vr, Vl, Vt].forEach((v, i) => i ? q.lineTo(g.PX(v[0]), g.PY(v[1])) : q.moveTo(g.PX(v[0]), g.PY(v[1]))); q.stroke();
    Object.entries(cnt).forEach(([z, [sx, sy, n]]) => { let x = sx/n, y = sy/n; if (z === 'PD'){ x += 0.07; y -= 0.01; } label(q, z, g.PX(x), g.PY(y), C.ink, 'center', 11.5); });
    label(q, '% CH₄', g.PX(0.5), g.PY(0.95), C.text, 'center', 11, false); label(q, '% C₂H₂', g.PX(0), g.PY(-0.07), C.text, 'center', 11, false); label(q, '% C₂H₄', g.PX(1), g.PY(-0.07), C.text, 'center', 11, false);
    const s = P.ch4 + P.c2h4 + P.c2h2; let z = null, pc = [0, 0, 0];
    if (s > 0){ pc = [P.ch4/s*100, P.c2h4/s*100, P.c2h2/s*100]; z = duval(...pc); const p = pt(...pc); q.fillStyle = C.sheet; q.strokeStyle = C.ink; q.lineWidth = 2.5; q.beginPath(); q.arc(g.PX(p[0]), g.PY(p[1]), 7, 0, 7); q.fill(); q.stroke(); }
    // chromatogram
    const pk = [['H₂', 1.1, P.h2, 0.06], ['CH₄', 2.0, P.ch4, 0.08], ['C₂H₄', 4.0, P.c2h4, 0.11], ['C₂H₆', 4.7, P.c2h6, 0.12], ['C₂H₂', 5.6, P.c2h2, 0.13]], ts = [], ys = [];
    for (let t = 0; t <= 7; t += 0.01){ ts.push(t); let y = 0; pk.forEach(([, tr, a, w]) => { y += a*Math.exp(-0.5*((t - tr)/w)**2)/(w*12); }); ys.push(y); }
    chart($('dv_g'), { x:ts, series:[{ y:ys, color:C.crank, label:'detector signal (simulated)' }], markers:pk.map(([n, tr, a, w]) => ({ x:tr, y:a/(w*12), color:C.ink, label:n, dy:-12 })), ylab:'signal', xlab:'retention time [min]' });
    $('dv_st').innerHTML = statsHTML([['Relative %: CH₄ / C₂H₄ / C₂H₂', s ? pc.map(v => fx(v, 1)).join(' / ') : '–'], ['Duval zone', z ? `${z}: ${ZN[z][0]}` : 'no gases', z && z !== 'T1' ? 'bad' : ''], ['Total dissolved combustible gas', `${fx(P.h2 + P.ch4 + P.c2h6 + P.c2h4 + P.c2h2, 0)} ppm`]]);
    $('dv_sub').textContent = 'apply only when gas levels or their rates of increase are already significant (IEC 60599)'; }
  ['dv', 'dv_g'].forEach(id => watchSize($(id), draw)); onRedraw(draw); draw(); }

/* ============ 8. TGA ============ */
{ const F = { coal:{ M:5, V:32, A:10, Tv:480, sv:70, n:'bituminous coal' }, wood:{ M:10, V:75, A:1, Tv:340, sv:45, n:'wood' }, bagasse:{ M:8, V:76, A:4, Tv:330, sv:45, n:'sugarcane bagasse' }, char:{ M:5, V:15, A:3, Tv:560, sv:70, n:'wood charcoal' } };
  let fu = 'coal';
  const Tprog = t => t < 4.1 ? 25 + 20*t : t < 15 ? 107 : t < 31.9 ? 107 + 50*(t - 15) : t < 45 ? 950 : t < 49 ? 950 - 50*(t - 45) : 750;
  function draw(){ const f = F[fu], FC = 100 - f.M - f.V - f.A, dt = 0.02; let mw = f.M, vr = f.V, fc = FC; const ts = [], ms = [], Ts = [], dm = []; let prev = 100;
    for (let t = 0; t <= 70; t += dt){ const T = Tprog(t); if (T > 60) mw -= mw*dt*Math.min(3, 0.15*(T - 60)/10);
      const target = f.V/(1 + Math.exp(-(T - f.Tv)/f.sv)), done = f.V - vr; if (target > done) vr -= Math.min(vr, (target - done)*Math.min(1, dt*2.5));
      if (t > 50) fc -= fc*dt*0.45; const m = mw + vr + fc + f.A; ts.push(t); ms.push(m); Ts.push(T/10); dm.push((prev - m)/dt); prev = m; }
    const at = tt => ms[Math.round(tt/dt)], Mr = 100 - at(14.9), Vr = at(14.9) - at(49.9), Ar = ms[ms.length - 1];
    chart($('tg'), { x:ts, series:[{ y:ms, color:C.crank, label:'mass [%]' }, { y:Ts, color:C.muted, dash:[4, 3], label:'temperature ÷ 10 [°C]' }], vlines:[{ v:15, color:C.muted, label:'moisture out' }, { v:50, color:C.bad, label:'switch to air' }], ylab:'mass % or T/10', xlab:'time [min]' });
    chart($('tg_d'), { x:ts, series:[{ y:dm, color:C.acc, label:'rate of mass loss [%/min]' }], ylab:'−dm/dt [%/min]', xlab:'time [min]' });
    $('tg_st').innerHTML = statsHTML([['Moisture', `${fx(Mr, 1)}%`], ['Volatile matter', `${fx(Vr, 1)}%`], ['Ash', `${fx(Ar, 1)}%`], ['Fixed carbon (by difference)', `${fx(100 - Mr - Vr - Ar, 1)}%`], ['Fuel ratio FC/VM', fx((100 - Mr - Vr - Ar)/Vr, 2)]]);
    $('tg_sub').textContent = `${f.n}: nitrogen to 950 °C, then air at 750 °C`; }
  segGroup($('tg_seg'), v => { fu = v; draw(); }); ['tg', 'tg_d'].forEach(id => watchSize($(id), draw)); onRedraw(draw); draw(); }

/* ============ 9. potentiostat ============ */
{ const P = {}; const Ec = -650;
  controls($('pt_c'), [['li', 'Corrosion current density i_corr', -1, 2, 0.01, 1.0, '', v => `${fx(10**v, 10**v < 1 ? 2 : 1)} μA/cm²`], ['ba', 'Anodic Tafel slope β_a', 40, 200, 1, 60, 'mV/decade'], ['bc', 'Cathodic Tafel slope β_c', 60, 250, 1, 120, 'mV/decade'], ['il', 'Oxygen limiting current', 10, 500, 5, 200, 'μA/cm²']], P, () => draw());
  function draw(){ const ic = 10**P.li, net = eta => { const ia = ic*10**(eta/P.ba), icc0 = ic*10**(-eta/P.bc), icc = 1/(1/icc0 + 1/P.il); return ia - icc*(1 + ic/P.il); };
    const a = axes($('pt'), { xl:0.01, xr:10000, yb:Ec - 260, yt:Ec + 260, xlog:true, xticks:[0.01, 0.1, 1, 10, 100, 1000, 10000], yticks:[-900, -800, -700, -600, -500, -400], xlab:'|i| [μA/cm²] (log scale)', ylab:'E [mV vs SCE]' });
    const es = [], is = []; for (let e = -250; e <= 250; e += 1){ es.push(Ec + e); is.push(Math.max(1e-3, Math.abs(net(e)))); } a.line(is, es, C.crank, 2);
    const ta = [], tae = [], tc = [], tce = []; for (let e = 0; e <= 250; e += 5){ ta.push(ic*10**(e/P.ba)); tae.push(Ec + e); tc.push(ic*10**(e/P.bc)); tce.push(Ec - e); }
    a.line(ta, tae, C.vel, 1.2, [5, 4]); a.line(tc, tce, C.vel, 1.2, [5, 4]); dotAt(a.ctx, a.X(ic), a.Y(Ec), C.bad, 5); label(a.ctx, `i_corr = ${fx(ic, 2)} μA/cm²`, a.X(ic) + 8, a.Y(Ec) + 14, C.bad, 'left', 11);
    a.legend([['measured curve', C.crank], ['Tafel lines', C.vel, [5, 4]]]);
    const xs = [], ys = []; for (let e = -20; e <= 20; e += 0.5){ xs.push(e); ys.push(net(e)); }
    const Rpohm = 2e-3/((net(1) - net(-1))*1e-6), B = P.ba*P.bc/(2.303*(P.ba + P.bc)), icLPR = B*1e-3/Rpohm*1e6;
    chart($('pt_l'), { x:xs, series:[{ y:ys, color:C.acc, label:'i [μA/cm²]' }], ylab:'i [μA/cm²]', xlab:'E − E_corr [mV]' });
    $('pt_st').innerHTML = statsHTML([['Polarisation resistance R_p', `${fx(Rpohm/1000, 2)} kΩ⋅cm²`], ['Stern–Geary constant B', `${fx(B, 1)} mV`], ['i_corr from LPR (B/R_p)', `${fx(icLPR, 2)} μA/cm²`], ['Corrosion rate of steel (ASTM G102)', `${fx(0.0116*ic, 3)} mm/year`], ['Concrete rating', ic < 0.1 ? 'negligible' : ic < 0.5 ? 'low' : ic < 1 ? 'moderate' : 'high', ic >= 1 ? 'bad' : '']]);
    $('pt_sub').textContent = icLPR/ic < 0.9 ? 'the cathodic branch is diffusion-limited, so LPR with these Tafel slopes is less exact' : 'Tafel extrapolation and LPR agree'; }
  ['pt', 'pt_l'].forEach(id => watchSize($(id), draw)); onRedraw(draw); draw(); }

quiz($('qz'), [
  { q:'A glass capillary viscometer gives a flow time of 250 s with C = 0.1832 mm²/s². The kinematic viscosity is', o:['45.8 mm²/s', '1,365 mm²/s', '0.73 mm²/s', '250 mm²/s'], a:0, why:'ν = C t = 0.1832 × 250 = 45.8 mm²/s, an ISO VG 46 oil.' },
  { q:'Why is conductivity always reported at 25 °C?', o:['Meters only work at 25 °C', 'Conductivity rises about 2% per °C, so readings must be normalised to compare', 'It is a legal requirement', 'Water freezes below 25 °C'], a:1, why:'Ion mobility rises with temperature.' },
  { q:'An engine oil had TBN 10 when new and now reads 4.5 with TAN 3. What does this suggest?', o:['The oil is fine', 'Additive reserve is depleted: below half of new; plan an oil change', 'There is a coolant leak', 'The engine is under-loaded'], a:1, why:'A common condemning limit is 50% of new TBN.' },
  { q:'Coulometric Karl Fischer needs no titrant standardisation because', o:['iodine is generated electrically and Faraday\'s law relates charge to water', 'it uses no iodine', 'water is weighed directly', 'it measures conductivity'], a:0, why:'10.71 C corresponds to 1 mg of water.' },
  { q:'In used engine oil, rising silicon followed by rising iron, chromium and aluminium suggests', o:['coolant leak', 'dirt ingress causing abrasive wear', 'bearing failure', 'fuel dilution'], a:1, why:'Silica dust is abrasive to liners, rings and pistons.' },
  { q:'A strong band at 1712 cm⁻¹ with bands at 1240 and 1095 cm⁻¹ indicates', o:['polyethylene', 'PET (polyester)', 'PVC', 'nylon'], a:1, why:'The ester carbonyl and C–O stretches identify PET.' },
  { q:'Acetylene in transformer oil is a warning sign mainly of', o:['normal ageing', 'electrical arcing (high-energy discharge)', 'moisture', 'low load'], a:1, why:'C₂H₂ forms only at very high temperatures, typically in arcs.' },
  { q:'Salt spray test hours', o:['convert directly to years of service', 'compare coatings under one standard condition and do not predict service life', 'are only used for paints', 'measure pH'], a:1, why:'Continuous salt fog does not reproduce real wet–dry and UV exposure.' } ]);
})();
