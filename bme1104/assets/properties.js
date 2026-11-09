/* BME 1104 interactive notes, Chapter 1: properties of materials */
(() => {
'use strict';
const PI = Math.PI;

/* ================= 1.2 oxide films: Pilling–Bedworth ratio ================= */
{ const MET = [ // metal, M, rho, oxide (ce), Mox, rho_ox, n
    ['Aluminium', 26.98, 2.70, 'Al2O3', 101.96, 3.95, 2], ['Iron', 55.85, 7.87, 'Fe2O3', 159.69, 5.24, 2], ['Magnesium', 24.31, 1.74, 'MgO', 40.30, 3.58, 1],
    ['Chromium', 52.00, 7.19, 'Cr2O3', 151.99, 5.22, 2], ['Nickel', 58.69, 8.91, 'NiO', 74.69, 6.67, 1], ['Copper', 63.55, 8.96, 'Cu2O', 143.09, 6.00, 2],
    ['Titanium', 47.87, 4.51, 'TiO2', 79.87, 4.23, 1], ['Zinc', 65.38, 7.14, 'ZnO', 81.38, 5.61, 1], ['Sodium', 22.99, 0.97, 'Na2O', 61.98, 2.27, 2], ['Tungsten', 183.84, 19.30, 'WO3', 231.84, 7.16, 1] ];
  let cur = 0, t0 = performance.now(); const cv = $('pb'), chips = $('pb_chips');
  chips.innerHTML = MET.map((m, i) => `<button type="button" data-i="${i}" aria-pressed="${i === 0}">${m[0]}</button>`).join('');
  chips.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; cur = +b.dataset.i; chips.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b)); t0 = performance.now(); info(); });
  const pbr = m => m[4]*m[2]/(m[6]*m[1]*m[5]);
  function info(){ const m = MET[cur], r = pbr(m);
    $('pb_st').innerHTML = statsHTML([['Metal', m[0]], ['Oxide', ce(m[3])], ['Metal density', `${m[2]} g/cm³`], ['Oxide density', `${m[5]} g/cm³`], ['PBR', fmt(r, 2), r < 1 || r > 2 ? 'bad' : 'ok']]);
    $('pb_sub').innerHTML = `${ce(m[3])}: PBR = ${fmt(m[4], 2)} × ${m[2]} / (${m[6]} × ${m[1]} × ${m[5]}) = ${fmt(r, 2)}`;
    $('pb_cap').innerHTML = r < 1 ? `<b>Porous film.</b> The oxide takes up less room than the metal it replaces, so it cannot cover the surface. Oxygen keeps reaching fresh metal and the metal is eaten away at a steady rate.`
      : r <= 2 ? `<b>Protective film.</b> The oxide takes up a little more room than the metal and forms a continuous skin. Oxygen has to diffuse through it, so the growth slows down and stops at a few nanometres.`
      : `<b>Film cracks and flakes off.</b> The oxide takes up much more room than the metal, so it builds up compressive stress, cracks and spalls. Fresh metal is exposed again and again, as in rusting steel.`; }
  function draw(){ const { ctx, W, H } = prep(cv); const m = MET[cur], r = pbr(m), t = ((performance.now() - t0)/1000) % 14, k = Math.min(1, t/10);
    const y0 = H*0.42, x0 = 30, x1 = W - 30; ctx.fillStyle = alpha(C.steel, 0.35); ctx.fillRect(x0, y0, x1 - x0, H - y0 - 20);
    const metalLoss = r < 1 ? 26*k : r <= 2 ? 6*Math.sqrt(k) : 22*k; ctx.fillStyle = alpha(C.steel, 0.8); ctx.fillRect(x0, y0 + metalLoss, x1 - x0, H - y0 - 20 - metalLoss);
    ctx.fillStyle = C.ink; ctx.font = `12px ${C.mono}`; ctx.textAlign = 'left'; ctx.fillText(m[0] + ' (metal)', x0 + 8, H - 32);
    const oc = r < 1 ? '#a8a8a8' : r <= 2 ? '#d6c9a5' : '#a4532a', th = (r < 1 ? 10 : r <= 2 ? 8*Math.sqrt(k) + 2 : 28*k + 2);
    ctx.fillStyle = oc;
    if (r < 1){ for (let x = x0; x < x1; x += 22){ const w = 14, hh = th*(0.6 + 0.4*Math.sin(x)); ctx.fillRect(x, y0 + metalLoss - hh, w, hh); } }
    else if (r <= 2){ ctx.fillRect(x0, y0 + metalLoss - th, x1 - x0, th); }
    else { let x = x0; let i = 0; while (x < x1){ const w = 40 + 25*Math.abs(Math.sin(i*1.7)), lift = (i % 3 === 0 ? 1 : 0)*k*14, ang = (i % 3 === 0 ? -0.18 : 0)*k;
        ctx.save(); ctx.translate(x + w/2, y0 + metalLoss - th/2 - lift); ctx.rotate(ang); ctx.fillRect(-w/2 + 2, -th/2, w - 4, th); ctx.restore(); x += w; i++; } }
    // oxygen molecules arriving
    for (let i = 0; i < 18; i++){ const x = x0 + ((i*97 + t*40) % (x1 - x0)), yy = 18 + ((i*53 + t*30*(1 + i % 3)) % (y0 - 40)); ctx.fillStyle = '#d8302c'; ctx.beginPath(); ctx.arc(x, yy, 3.2, 0, 7); ctx.arc(x + 5, yy, 3.2, 0, 7); ctx.fill(); }
    ctx.fillStyle = C.muted; ctx.textAlign = 'right'; ctx.fillText('O₂ from the air', x1, 14); ctx.textAlign = 'left'; ctx.fillStyle = C.ink;
    ctx.fillText('oxide ' + m[3].replace(/(\d)/g, d => '₀₁₂₃₄₅₆₇₈₉'[d]), x0 + 8, y0 + metalLoss - th - 8); }
  info(); animate(cv, () => draw()); watchSize(cv, draw); onRedraw(draw); }

/* ================= 1.3 property chart ================= */
{ const P = { rho:['Density', 'kg/m³', false, 300, 30000], tm:['Melting point', '°C', false, 0, 3600], k:['Thermal conductivity', 'W/(m K)', true, 0.05, 1000], s:['Electrical conductivity', 'S/m', true, 1e-16, 1e9],
    E:["Young's modulus", 'GPa', true, 0.001, 1000], uts:['Tensile strength', 'MPa', true, 1, 3000], el:['Elongation at break', '%', true, 0.1, 1000] };
  const M = [ // name, class, rho, Tm, k, sigma, E, UTS, elong
    ['Mild steel', 'metal', 7850, 1520, 52, 6.0e6, 200, 420, 25], ['Stainless steel 304', 'metal', 8000, 1450, 16, 1.4e6, 193, 515, 40], ['Aluminium 6061-T6', 'metal', 2700, 600, 167, 2.5e7, 69, 310, 12],
    ['Copper (annealed)', 'metal', 8960, 1085, 401, 5.96e7, 117, 220, 45], ['Brass 70/30', 'metal', 8530, 930, 120, 1.6e7, 110, 330, 55], ['Titanium Ti-6Al-4V', 'metal', 4430, 1660, 6.7, 5.8e5, 114, 950, 14],
    ['Grey cast iron', 'metal', 7200, 1200, 50, 1.5e6, 100, 200, 0.5], ['Tungsten', 'metal', 19300, 3422, 173, 1.8e7, 411, 980, 2], ['Lead', 'metal', 11340, 327, 35, 4.8e6, 16, 17, 50], ['Silver', 'metal', 10490, 962, 429, 6.3e7, 83, 170, 50],
    ['Alumina', 'ceramic', 3950, 2072, 30, 1e-12, 380, 300, 0.1], ['Soda-lime glass', 'ceramic', 2500, null, 1.0, 1e-12, 70, 50, 0.1], ['Concrete', 'ceramic', 2400, null, 1.7, 1e-6, 30, 3, 0.1],
    ['HDPE', 'polymer', 950, 130, 0.48, 1e-15, 1.0, 30, 600], ['PVC (rigid)', 'polymer', 1400, null, 0.19, 1e-14, 3.0, 50, 40], ['Nylon 66', 'polymer', 1140, 264, 0.25, 1e-12, 2.9, 80, 60],
    ['Natural rubber', 'polymer', 920, null, 0.13, 1e-14, 0.01, 25, 700], ['PTFE', 'polymer', 2200, 327, 0.25, 1e-16, 0.5, 25, 300],
    ['Pine wood (along grain)', 'other', 500, null, 0.12, 1e-14, 10, 80, 1], ['CFRP (along fibres)', 'other', 1600, null, 5, 1e4, 135, 1500, 1.5] ];
  const idx = { rho:2, tm:3, k:4, s:5, E:6, uts:7, el:8 }, CL = { metal:'--crank', ceramic:'--rod', polymer:'--vel', other:'--force' };
  const sx = $('ash_x'), sy = $('ash_y'); for (const s of [sx, sy]) s.innerHTML = Object.entries(P).map(([k, p]) => `<option value="${k}">${p[0]}</option>`).join('');
  sx.value = 'rho'; sy.value = 'E'; let cls = 'all', hov = null; const cv = $('ash');
  function draw(){ const px = P[sx.value], py = P[sy.value];
    const pts = M.filter(m => (cls === 'all' || m[1] === cls) && m[idx[sx.value]] != null && m[idx[sy.value]] != null).map(m => ({ x:m[idx[sx.value]], y:m[idx[sy.value]], color:css(CL[m[1]]), label:m[0], m, r:hov === m ? 7 : 5, bold:hov === m }));
    plot(cv, { xlog:px[2], ylog:py[2], xmin:px[3], xmax:px[4], ymin:py[3], ymax:py[4], xlab:`${px[0]} [${px[1]}]`, ylab:`${py[0]} [${py[1]}]`, points:pts,
      legend:[['metal', 'Metals'], ['ceramic', 'Ceramics and glass'], ['polymer', 'Polymers'], ['other', 'Composites and natural']].map(([k, l]) => ({ color:css(CL[k]), label:l })) }); }
  const say = m => { if (!m) return; hov = m; $('ash_cap').innerHTML = `<b>${m[0]}</b>: density ${m[2].toLocaleString()} kg/m³, melting point ${m[3] == null ? 'none (softens or decomposes)' : m[3] + ' °C'}, thermal conductivity ${m[4]} W/(m K), electrical conductivity ${sci(m[5], 1)} S/m, Young's modulus ${m[6]} GPa, tensile strength ${m[7]} MPa, elongation ${m[8]} %.`; draw(); };
  hoverPoints(cv, p => p && say(p.m));
  [sx, sy].forEach(s => s.addEventListener('change', draw));
  segGroup(cv.parentElement.querySelector('.seg'), (val, b) => { cls = b.dataset.cls; draw(); });
  watchSize(cv, draw); onRedraw(draw); }

example($('ex1'), { title:'Example 1.1: mass of a shaft in steel and in aluminium', src:'density',
  q:'A solid shaft is 40 mm in diameter and 500 mm long. Find its mass in mild steel (ρ = 7850 kg/m³) and in aluminium alloy (ρ = 2700 kg/m³).',
  inputs:[['d', 'Diameter d', 40, 'mm'], ['L', 'Length L', 500, 'mm'], ['r1', 'Density of steel', 7850, 'kg/m³'], ['r2', 'Density of aluminium', 2700, 'kg/m³']],
  solve:v => { const V = PI/4*(v.d/1000)**2*(v.L/1000), m1 = V*v.r1, m2 = V*v.r2;
    return [['Volume V = (π/4) d² L =', `${sci(V, 3)} m³`], ['Mass in steel m = ρV =', `${fmt(m1, 2)} kg`, true], ['Mass in aluminium m = ρV =', `${fmt(m2, 2)} kg`, true],
      [`The aluminium shaft is ${fmt(100*(1 - m2/m1), 0)} % lighter, but its Young's modulus is about a third of steel's, so it would bend and twist about three times as much.`, '']]; } });
example($('ex2'), { title:'Example 1.2: heat through the wall of a heat exchanger', src:'thermal conductivity',
  q:'Heat flows through a plate 2 mm thick with an area of 0.5 m² and a temperature difference of 15 °C. Compare a copper plate (k = 401 W/(m K)) with a stainless steel plate (k = 16 W/(m K)).',
  inputs:[['A', 'Area A', 0.5, 'm²'], ['L', 'Thickness L', 2, 'mm'], ['dT', 'Temperature difference ΔT', 15, '°C'], ['k1', 'k of copper', 401, 'W/(m K)'], ['k2', 'k of stainless steel', 16, 'W/(m K)']],
  solve:v => { const q1 = v.k1*v.A*v.dT/(v.L/1000), q2 = v.k2*v.A*v.dT/(v.L/1000);
    return [["Fourier's law: Q = k A ΔT / L", ''], ['Copper: Q =', `${fmt(q1/1000, 1)} kW`, true], ['Stainless steel: Q =', `${fmt(q2/1000, 1)} kW`, true],
      [`Copper passes ${fmt(q1/q2, 0)} times as much heat for the same plate. Stainless steel is still used where corrosion would destroy copper.`, '']]; } });

/* ================= 1.4 tensile test ================= */
{ const quad = (a, b, x) => a + (b - a)*(1 - (1 - x)**2);
  const gen = p => e => { const ey = p.sy/p.E; if (e <= ey) return p.E*e; if (e <= p.eu) return quad(p.sy, p.uts, (e - ey)/(p.eu - ey)); return p.uts - (p.uts - p.sf)*((e - p.eu)/(p.ef - p.eu))**2; };
  const MAT = [
    { n:'Mild steel', E:200000, ef:0.30, eu:0.20, f:e => { if (e <= 0.0015) return 200000*e; if (e < 0.0022) return 300 - (e - 0.0015)/0.0007*30; if (e < 0.02) return 270; if (e < 0.2) return quad(270, 420, (e - 0.02)/0.18); return 420 - 90*((e - 0.2)/0.1)**2; }, note:'Mild steel shows a sharp upper and lower yield point, a flat region where bands of yielding run along the specimen, then work hardening up to the tensile strength and a neck before it breaks: a ductile cup-and-cone fracture.' },
    { n:'Aluminium 6061-T6', E:69000, ef:0.12, eu:0.08, f:gen({ E:69000, sy:276, uts:310, eu:0.08, ef:0.12, sf:270 }), note:'Heat-treated aluminium has no sharp yield point: the yield strength is read at 0.2 % permanent strain. It is a third as stiff as steel.' },
    { n:'Copper (annealed)', E:117000, ef:0.50, eu:0.40, f:gen({ E:117000, sy:70, uts:220, eu:0.40, ef:0.50, sf:180 }), note:'Annealed copper yields early and work-hardens a lot: very ductile, which is why it is drawn into wire.' },
    { n:'Grey cast iron', E:100000, ef:0.006, eu:0.006, f:e => 210*(1 - Math.exp(-100000*e/210*0.8)), note:'Grey cast iron breaks with almost no plastic strain. The graphite flakes act as tiny cracks: strong in compression, weak and brittle in tension.' },
    { n:'HDPE', E:1000, ef:6, eu:0.1, f:e => { if (e < 0.1) return 26*(1 - (1 - e/0.1)**2); if (e < 0.25) return 26 - 8*(e - 0.1)/0.15; if (e < 4) return 18; return 18 + 12*((e - 4)/2)**2; }, note:'A semi-crystalline polymer yields, forms a neck and then cold-draws: the neck runs along the specimen while the chains line up, before strain hardening and fracture at several hundred per cent.' },
    { n:'Natural rubber', E:1.2, ef:6, eu:6, f:e => { const l = 1 + e; return 0.4*(l - 1/(l*l)) + 0.017*Math.pow(e, 4); }, note:'Rubber is elastic up to several hundred per cent strain: the tangled chains straighten and spring back. The curve turns up at large strain as the chains line up and crystallise.' } ];
  let cur = 0, e = 0, play = null, broke = false; const cvS = $('tt_s'), cvC = $('tt_c'), chips = $('tt_chips');
  chips.innerHTML = MAT.map((m, i) => `<button type="button" data-i="${i}" aria-pressed="${i === 0}">${m.n}</button>`).join('');
  chips.addEventListener('click', ev => { const b = ev.target.closest('button'); if (!b) return; cur = +b.dataset.i; chips.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b)); reset(); });
  const curve = m => { const N = 600, x = [], y = []; for (let i = 0; i <= N; i++){ const ee = m.ef*i/N; x.push(ee); y.push(m.f(ee)); } return { x, y }; };
  function stats(m){ const c = curve(m); let uts = 0, eu = 0, U = 0; for (let i = 1; i < c.x.length; i++){ if (c.y[i] > uts){ uts = c.y[i]; eu = c.x[i]; } U += 0.5*(c.y[i] + c.y[i - 1])*(c.x[i] - c.x[i - 1]); }
    // 0.2 % offset yield
    let sy = null; for (let i = 1; i < c.x.length; i++){ const line = m.E*(c.x[i] - 0.002); if (line >= c.y[i] && c.x[i] > 0.002){ sy = c.y[i]; break; } }
    if (m.n === 'Mild steel') sy = 270; if (m.n === 'Natural rubber' || m.n === 'Grey cast iron') sy = null;
    return { uts, eu, U, sy }; }
  function reset(){ e = 0; broke = false; if (play){ cancelAnimationFrame(play); play = null; } $('tt_play').textContent = 'Run the test'; const m = MAT[cur], s = stats(m);
    $('tt_t').textContent = 'Tensile test: ' + m.n; $('tt_sub').textContent = 'specimen gauge length 50 mm, diameter 10 mm';
    $('tt_st').innerHTML = statsHTML([["Young's modulus", m.E >= 1000 ? `${fmt(m.E/1000, 0)} GPa` : `${fmt(m.E, 1)} MPa`], ['Yield strength', s.sy ? `${fmt(s.sy, 0)} MPa` : 'none'], ['Tensile strength', `${fmt(s.uts, 0)} MPa`], ['Elongation at break', `${fmt(m.ef*100, m.ef < 0.05 ? 1 : 0)} %`], ['Toughness (area)', `${fmt(s.U, s.U < 1 ? 2 : 0)} MJ/m³`]]);
    $('tt_cap').innerHTML = m.note; draw(); }
  function draw(){ const m = MAT[cur]; drawSpec(m); drawCurve(m); }
  function drawSpec(m){ const { ctx, W, H } = prep(cvS); readColors(); const cx = W/2, L0 = Math.min(H*0.34, 150), r0 = Math.min(W*0.06, 22);
    const vis = m.ef > 1 ? 1.2*Math.log(1 + e)/Math.log(1 + m.ef) : 1.1*e/m.ef, Lv = L0*(1 + vis*0.9), top = H/2 - Lv/2 - 20;
    // grips
    ctx.fillStyle = alpha(C.steel, 0.9); ctx.fillRect(cx - r0*3, top - 60, r0*6, 46); ctx.fillRect(cx - r0*3, top + Lv + 54, r0*6, 46);
    ctx.fillStyle = alpha(C.steel, 0.45); ctx.fillRect(cx - r0*2.2, 4, r0*4.4, top - 64);
    const neckStart = m.n === 'HDPE' ? 0.1 : m.eu, neck = e > neckStart && m.n !== 'Natural rubber' && m.n !== 'Grey cast iron' ? Math.min(1, (e - neckStart)/(m.ef - neckStart)) : 0;
    const uni = m.n === 'Natural rubber' ? 1/Math.sqrt(1 + e) : 1/Math.sqrt(1 + Math.min(e, m.eu)*0.9);
    const draw1 = (y0, y1, side) => { ctx.beginPath(); const pts = 60; for (let i = 0; i <= pts; i++){ const t = i/pts, y = y0 + (y1 - y0)*t, z = side === 'b' ? t : 1 - t;
        let rr = r0*uni; if (m.n === 'HDPE' && e > 0.1){ const drawn = Math.min(1, (e - 0.1)/4); const d = Math.abs((y - (top + 34 + Lv/2))/(Lv/2)); if (d < drawn + 0.08) rr *= 0.55; }
        else if (neck > 0){ const d = (y - (top + 34 + Lv/2))/(Lv*0.12); rr *= 1 - 0.45*neck*Math.exp(-d*d); }
        ctx.lineTo(cx - rr, y); }
      for (let i = pts; i >= 0; i--){ const t = i/pts, y = y0 + (y1 - y0)*t; let rr = r0*uni; if (m.n === 'HDPE' && e > 0.1){ const drawn = Math.min(1, (e - 0.1)/4); const d = Math.abs((y - (top + 34 + Lv/2))/(Lv/2)); if (d < drawn + 0.08) rr *= 0.55; } else if (neck > 0){ const d = (y - (top + 34 + Lv/2))/(Lv*0.12); rr *= 1 - 0.45*neck*Math.exp(-d*d); } ctx.lineTo(cx + rr, y); }
      ctx.closePath(); ctx.fill(); ctx.stroke(); };
    ctx.fillStyle = m.n === 'HDPE' ? '#e9edf1' : m.n === 'Natural rubber' ? '#3b3f45' : m.n === 'Grey cast iron' ? '#7d828a' : m.n.startsWith('Copper') ? '#c87533' : '#b9c0c8'; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2;
    // shoulders
    ctx.fillRect(cx - r0*1.6, top - 14, r0*3.2, 48); ctx.fillRect(cx - r0*1.6, top + Lv + 34, r0*3.2, 48);
    if (!broke){ draw1(top + 34, top + Lv + 34, 'a'); }
    else { const mid = top + 34 + Lv/2, gap = 10; draw1(top + 34, mid - gap/2, 'a'); draw1(mid + gap/2, top + Lv + 34, 'a'); }
    ctx.fillStyle = C.ink; ctx.font = `12px ${C.mono}`; ctx.textAlign = 'left'; ctx.fillText(`F = ${fmt(m.f(e)*PI*25/1000, 2)} kN`, 10, H - 28); ctx.fillText(`ΔL = ${fmt(e*50, e*50 < 1 ? 3 : 1)} mm`, 10, H - 12);
    // gauge marks
    ctx.strokeStyle = C.bad; ctx.lineWidth = 1.5; [top + 34 + Lv*0.12, top + 34 + Lv*0.88].forEach(y => { ctx.beginPath(); ctx.moveTo(cx + r0*1.4, y); ctx.lineTo(cx + r0*2.6, y); ctx.stroke(); }); }
  function drawCurve(m){ const c = curve(m), k = c.x.findIndex(x => x >= e); const xs = c.x, ys = c.y.map((y, i) => i <= (k < 0 ? c.x.length : k) ? y : NaN);
    const s = stats(m); chart(cvC, { x:xs, xmin:0, xmax:m.ef*1.02, series:[{ y:c.y, color:alpha(C.muted, 0.25), w:1.2 }, { y:ys, color:C.crank, w:2.4 }], ylab:'Stress σ [MPa]', xlab:'Strain ε',
      markers:e > 0 ? [{ x:Math.min(e, m.ef), y:m.f(Math.min(e, m.ef)), color:C.bad, label:`σ = ${fmt(m.f(e), 0)} MPa` }] : [],
      hlines:[{ v:s.uts, color:C.rod, label:'tensile strength', right:true }].concat(s.sy ? [{ v:s.sy, color:C.vel, label:'yield', right:true }] : []) }); }
  $('tt_play').addEventListener('click', () => { if (play){ cancelAnimationFrame(play); play = null; $('tt_play').textContent = 'Carry on'; return; } const m = MAT[cur]; if (broke) reset(); let last = performance.now(); $('tt_play').textContent = 'Pause';
    const step = now => { const dt = (now - last)/1000; last = now; e += m.ef*dt/7; if (e >= m.ef){ e = m.ef; broke = true; play = null; $('tt_play').textContent = 'Run the test again'; draw(); return; } draw(); play = requestAnimationFrame(step); }; play = requestAnimationFrame(step); });
  $('tt_reset').addEventListener('click', reset); watchSize(cvS, draw); watchSize(cvC, draw); onRedraw(draw); reset(); }

/* ================= 1.4 Charpy impact tester (3D) ================= */
{ const m = 20, R = 0.75, g = 9.81, SY = 0.24, PY = SY + 0.75; let alpha0 = 150, T = 20, mat = 0, state = 'ready', th = 0, w = 0, peak = 0, broken = false, Eabs = 0, sep = 0, bend = 0;
  const SPEC = [
    { n:'Mild steel', E:Tc => 4 + 146*(1 + Math.tanh((Tc + 10)/12))/2, duct:Tc => (1 + Math.tanh((Tc + 10)/12))/2, col:0xb9c0c8 },
    { n:'Stainless steel 304', E:() => 150, duct:() => 1, col:0xd0d4d8 },
    { n:'Aluminium 6061-T6', E:() => 18, duct:() => 0.6, col:0xd9dde2 },
    { n:'Grey cast iron', E:() => 3, duct:() => 0, col:0x7d828a },
    { n:'Rigid PVC', E:Tc => Tc > 0 ? 6 : 2, duct:() => 0.1, col:0x8fa8c7 } ];
  let parts = {}, pv;
  const v = view3d($('cp'), { cam:[2.0, 1.25, 2.9], target:[0.05, 0.75, 0], fov:38,
    build(v){ niceGL(v); const G = THREE, frame = new THREE.MeshPhysicalMaterial({ color:0x2e5b8a, roughness:0.45, metalness:0.2, clearcoat:0.4 }), steel = metal(0xc8ccd0, { roughness:0.3 }), dark = new THREE.MeshStandardMaterial({ color:0x2b2e33, roughness:0.6 });
      const base = new G.Mesh(new G.BoxGeometry(1.5, 0.1, 0.9), frame); base.position.y = 0.05; v.root.add(base);
      [-0.36, 0.36].forEach(z => { const up = new G.Mesh(new G.BoxGeometry(0.14, PY + 0.05, 0.12), frame); up.position.set(0, (PY + 0.05)/2 + 0.05, z); v.root.add(up); });
      const top = new G.Mesh(new G.BoxGeometry(0.2, 0.1, 0.86), frame); top.position.set(0, PY + 0.12, 0); v.root.add(top);
      const axle = new G.Mesh(new G.CylinderGeometry(0.035, 0.035, 0.86, 24), steel); axle.rotation.x = PI/2; axle.position.set(0, PY, 0); v.root.add(axle);
      const plat = new G.Mesh(new G.BoxGeometry(0.16, SY - 0.07, 0.36), frame); plat.position.set(0.21, (SY - 0.07)/2 + 0.1, 0); v.root.add(plat);
      [-0.05, 0.05].forEach(z => { const an = new G.Mesh(new G.BoxGeometry(0.03, 0.05, 0.03), dark); an.position.set(0.235, SY + 0.005, z); v.root.add(an); });
      pv = new G.Group(); pv.position.set(0, PY, 0); v.root.add(pv);
      const arm = new G.Mesh(new G.CylinderGeometry(0.022, 0.022, R - 0.1, 20), steel); arm.position.y = -(R - 0.1)/2; pv.add(arm);
      const ham = new G.Mesh(new G.CylinderGeometry(0.15, 0.15, 0.07, 48), new THREE.MeshPhysicalMaterial({ color:0xd23b2a, roughness:0.4, clearcoat:0.7 })); ham.rotation.x = PI/2; ham.position.y = -R; pv.add(ham);
      const strk = new G.Mesh(new G.BoxGeometry(0.05, 0.02, 0.04), steel); strk.position.set(0.17, -R, 0); pv.add(strk);
      const dial = new G.Mesh(new G.CylinderGeometry(0.24, 0.24, 0.01, 64), new THREE.MeshStandardMaterial({ color:0xf3f1ea, roughness:0.7 })); dial.rotation.x = PI/2; dial.position.set(0, PY, 0.43); v.root.add(dial);
      for (let i = 0; i <= 24; i++){ const a = -PI*0.9 + i*PI*1.8/24, tk = new G.Mesh(new G.BoxGeometry(0.004, i % 4 ? 0.022 : 0.045, 0.004), dark); tk.position.set(0.205*Math.sin(a), PY - 0.205*Math.cos(a), 0.437); tk.rotation.z = a; v.root.add(tk); }
      parts.ptr = new G.Mesh(new G.BoxGeometry(0.008, 0.2, 0.006), new THREE.MeshStandardMaterial({ color:0xc62828 })); parts.ptr.geometry.translate(0, -0.1, 0); parts.ptr.position.set(0, PY, 0.443); v.root.add(parts.ptr);
      const sm = gloss(SPEC[mat].col, { metalness:0.6, roughness:0.35, clearcoat:0.2 }); parts.sm = sm;
      parts.h1 = new G.Mesh(new G.BoxGeometry(0.02, 0.02, 0.055), sm); parts.h1.geometry.translate(0, 0, -0.0275); parts.h2 = new G.Mesh(new G.BoxGeometry(0.02, 0.02, 0.055), sm); parts.h2.geometry.translate(0, 0, 0.0275); v.root.add(parts.h1, parts.h2);
      const shadow = new G.Mesh(new G.CircleGeometry(1.2, 48), new THREE.MeshBasicMaterial({ color:0x000000, transparent:true, opacity:0.08 })); shadow.rotation.x = -PI/2; shadow.position.y = 0.001; v.root.add(shadow); },
    update(dt){ step(dt); pose(); } });
  if (!v) return;
  function pose(){ pv.rotation.z = th; parts.ptr.rotation.z = peak; const s = Math.max(sep, 0);
    const x0 = 0.205; parts.h1.position.set(x0 + s*0.5, SY + 0.0, -s*0.35); parts.h2.position.set(x0 + s*0.5, SY + 0.0, s*0.35);
    parts.h1.rotation.set(0, -bend - s*2.5, 0); parts.h2.rotation.set(0, bend + s*2.5, 0); }
  const toRad = d => d*PI/180;
  function reset(){ state = 'ready'; th = -toRad(alpha0); w = 0; peak = th; broken = false; sep = 0; bend = 0; Eabs = 0; parts.sm.color.setHex(SPEC[mat].col); $('cp_go').disabled = false; info(); pose(); v.render(); }
  function step(dt){ if (state !== 'swing') return; const n = 8; for (let i = 0; i < n; i++){ const h = dt/n, prev = th; w += -(g/R)*Math.sin(th)*h; th += w*h;
      if (!broken && prev < 0 && th >= 0){ const S = SPEC[mat], E = S.E(T), ke = 0.5*m*R*R*w*w; Eabs = Math.min(E, ke); w = Math.sqrt(Math.max(0, ke - Eabs)*2/(m*R*R)); broken = true; bend = 0.6*S.duct(T); info(); }
      if (broken && sep < 1) sep += h*(0.8 + 1.5*(1 - SPEC[mat].duct(T)));
      if (th > peak) peak = th;
      if (broken && w <= 0 && th > 0){ state = 'done'; $('cp_go').disabled = true; info(); break; } } }
  function info(){ const S = SPEC[mat], E = S.E(T), avail = m*g*R*(1 - Math.cos(toRad(alpha0)));
    const beta = Math.acos(Math.min(1, Math.max(-1, Math.cos(toRad(alpha0)) + E/(m*g*R))))*180/PI;
    $('cp_sub').textContent = `${S.n} at ${T} °C; pendulum ${m} kg on a ${R} m arm released from ${alpha0}°`;
    $('cp_st').innerHTML = statsHTML([['Energy available', `${fmt(avail, 0)} J`], ['Energy absorbed', state === 'ready' ? 'release to measure' : `${fmt(Eabs, 0)} J`, state === 'ready' ? '' : Eabs < 27 ? 'bad' : 'ok'], ['Rise after impact β', state === 'ready' ? '' : `${fmt(beta, 1)}°`], ['Fracture', state === 'ready' ? '' : S.duct(T) > 0.5 ? 'ductile (bent, fibrous)' : 'brittle (flat, shiny)']]);
    $('cp_cap').innerHTML = state === 'ready' ? 'The pendulum is latched at the release angle. Release it to break the specimen; the red pointer stays at the highest angle the pendulum reaches after the break.'
      : `E<sub>abs</sub> = mgR(cos β − cos α) = ${m} × 9.81 × ${R} × (cos ${fmt(beta, 1)}° − cos ${alpha0}°) = <b>${fmt(Eabs, 0)} J</b>. ${Eabs < 27 ? 'Below the 27 J often required for structural steel at its service temperature: this material would be brittle here.' : 'Plenty of toughness at this temperature.'}`; }
  const chips = $('cp_chips'); chips.innerHTML = SPEC.map((s, i) => `<button type="button" data-i="${i}" aria-pressed="${i === 0}">${s.n}</button>`).join('');
  chips.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; mat = +b.dataset.i; chips.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b)); reset(); });
  const CP = {}; controls($('cp_c'), [['T', 'Specimen temperature', -80, 60, 5, 20, '°C'], ['a', 'Release angle α', 90, 160, 5, 150, '°']], CP, () => { T = CP.T; alpha0 = CP.a; reset(); });
  $('cp_go').addEventListener('click', () => { if (state !== 'ready') return; state = 'swing'; w = 0; v.anim.playing = true; });
  $('cp_reset').addEventListener('click', reset); reset(); }

example($('ex3'), { title:'Example 1.3: reading a tensile test', src:'stress, strain and modulus',
  q:'A steel specimen 10 mm in diameter carries a load of 25 kN in the elastic region, and a 50 mm gauge length stretches by 0.080 mm. Find the stress, the strain and Young\'s modulus.',
  inputs:[['d', 'Diameter d', 10, 'mm'], ['F', 'Load F', 25, 'kN'], ['L', 'Gauge length L₀', 50, 'mm'], ['dL', 'Extension ΔL', 0.08, 'mm']],
  solve:v => { const A = PI/4*v.d*v.d, s = v.F*1000/A, e = v.dL/v.L, E = s/e;
    return [['Area A₀ = (π/4) d² =', `${fmt(A, 2)} mm²`], ['Stress σ = F/A₀ =', `${fmt(s, 1)} MPa`, true], ['Strain ε = ΔL/L₀ =', `${fmt(e, 5)}`, true], ["Young's modulus E = σ/ε =", `${fmt(E/1000, 1)} GPa`, true],
      [E/1000 > 180 && E/1000 < 220 ? 'About 200 GPa: typical of steel.' : 'Compare with about 200 GPa for steel and 70 GPa for aluminium.', '']]; } });
example($('ex4'), { title:'Example 1.4: energy absorbed in a Charpy test', src:'impact toughness',
  q:'A 20 kg pendulum with its striker 0.75 m from the pivot is released from 150° and rises to 98° after breaking the specimen. How much energy did the specimen absorb?',
  inputs:[['m', 'Mass m', 20, 'kg'], ['R', 'Arm R', 0.75, 'm'], ['a', 'Release angle α', 150, '°'], ['b', 'Rise angle β', 98, '°']],
  solve:v => { const E0 = v.m*9.81*v.R*(1 - Math.cos(v.a*PI/180)), E1 = v.m*9.81*v.R*(1 - Math.cos(v.b*PI/180)), E = E0 - E1;
    return [['Energy before impact mgR(1 − cos α) =', `${fmt(E0, 1)} J`], ['Energy left after impact mgR(1 − cos β) =', `${fmt(E1, 1)} J`], ['Energy absorbed E = mgR(cos β − cos α) =', `${fmt(E, 1)} J`, true],
      [E < 27 ? 'Low: a brittle fracture.' : 'A tough, ductile fracture.', '']]; } });
example($('ex5'), { title:'Example 1.5: Brinell hardness', src:'hardness test',
  q:'A 10 mm ball under 3000 kgf leaves a dent 4.0 mm across in a steel part. Find the Brinell hardness number.',
  inputs:[['P', 'Load P', 3000, 'kgf'], ['D', 'Ball diameter D', 10, 'mm'], ['d', 'Dent diameter d', 4.0, 'mm']],
  solve:v => { const r = Math.sqrt(v.D*v.D - v.d*v.d), HB = 2*v.P/(PI*v.D*(v.D - r));
    return [['√(D² − d²) =', `${fmt(r, 3)} mm`], ['HB = 2P / (π D (D − √(D² − d²))) =', `${fmt(HB, 0)}`, true], [`A rough rule for steels: tensile strength in MPa is about 3.45 × HB, here about ${fmt(3.45*HB, 0)} MPa.`, '']]; } });

/* ================= fatigue S–N curve ================= */
{ const P = {}; const cv = $('sn');
  const steel = N => Math.max(210, 900*Math.pow(2*N, -0.09)), alu = N => 760*Math.pow(2*N, -0.105);
  const life = (f, s) => { if (f === steel && s <= 210) return Infinity; let lo = 1e2, hi = 1e10; for (let i = 0; i < 80; i++){ const mid = Math.sqrt(lo*hi); if (f(mid) > s) lo = mid; else hi = mid; } return lo; };
  function draw(){ const Ns = []; for (let e = 2; e <= 9; e += 0.05) Ns.push(Math.pow(10, e)); const s = P.s*P.kt;
    const n1 = life(steel, s), n2 = life(alu, s);
    plot(cv, { xlog:true, xmin:1e2, xmax:1e9, ymin:0, ymax:800, xlab:'Cycles to failure N', ylab:'Stress amplitude [MPa]',
      series:[{ x:Ns, y:Ns.map(steel), color:C.crank }, { x:Ns, y:Ns.map(alu), color:C.rod }], hl:[{ v:s, color:C.bad, label:`local stress ${fmt(s, 0)} MPa` }],
      points:[isFinite(n1) ? { x:n1, y:s, color:C.crank } : null, isFinite(n2) && n2 < 1e9 ? { x:n2, y:s, color:C.rod } : null].filter(Boolean),
      legend:[{ color:C.crank, label:'Steel (UTS 420 MPa): endurance limit' }, { color:C.rod, label:'Aluminium alloy: no endurance limit' }] });
    $('sn_sub').textContent = `nominal ${P.s} MPa × stress concentration ${P.kt} = ${fmt(s, 0)} MPa at the root of the notch`;
    $('sn_cap').innerHTML = `Steel: ${isFinite(n1) ? `fails after about <b>${sci(n1, 1)}</b> cycles` : '<b>below the endurance limit</b>: it should last indefinitely'}. Aluminium alloy: ${n2 >= 1e9 ? 'more than 10<sup>9</sup> cycles' : `about <b>${sci(n2, 1)}</b> cycles`}. A notch or sharp corner (stress concentration) cuts the life sharply: a shaft turning at 1500 rpm makes 2 × 10<sup>6</sup> cycles a day.`; }
  controls($('sn_c'), [['s', 'Nominal stress amplitude', 50, 500, 5, 180, 'MPa'], ['kt', 'Stress concentration factor Kₜ', 1, 3, 0.1, 1, '']], P, draw); watchSize(cv, draw); onRedraw(draw); draw(); }

/* ================= creep curve ================= */
{ const P = {}; const cv = $('cr');
  function draw(){ const T = P.T + 273.15, rate = 2.5e10*Math.pow(P.s, 4)*Math.exp(-380000/(8.314*T)); // strain per hour, steady state
    const e0 = P.s/170000, ep = 0.004, tr = 0.12/rate; const t = [], e = []; const tmax = Math.min(tr*1.05, 2e6);
    for (let i = 0; i <= 400; i++){ const x = tmax*i/400; let y = e0 + ep*(1 - Math.exp(-x/(tr*0.05))) + rate*x; if (x > tr*0.7) y += 0.02*(Math.exp((x - tr*0.7)/(tr*0.07)) - 1)*0.05; t.push(x); e.push(Math.min(y*100, 25)); }
    chart(cv, { x:t, series:[{ y:e, color:C.acc, w:2.2 }], ylab:'Strain [%]', xlab:'Time [h]', shade:[{ a:0, b:tr*0.15, color:C.crank, label:'primary' }, { a:tr*0.15, b:tr*0.7, color:C.vel, label:'secondary (steady)' }, { a:tr*0.7, b:tmax, color:C.bad, label:'tertiary' }] });
    $('cr_sub').textContent = `low-alloy steel at ${P.T} °C under ${P.s} MPa`;
    $('cr_cap').innerHTML = `Steady creep rate about <b>${sci(rate*100, 1)} % per hour</b>; rupture after roughly <b>${tr > 1e5 ? fmt(tr/8760, 0) + ' years' : tr > 48 ? fmt(tr/24, 0) + ' days' : fmt(tr, 1) + ' hours'}</b>. A rise of 50 °C or a modest rise in stress shortens the life many times over: creep rate grows exponentially with temperature.`; }
  controls($('cr_c'), [['T', 'Temperature', 450, 650, 5, 550, '°C'], ['s', 'Stress', 40, 250, 5, 120, 'MPa']], P, draw); watchSize(cv, draw); onRedraw(draw); draw(); }

/* ================= self-check ================= */
quiz($('qz'), [
  { q:'Aluminium does not rust away like iron because', o:['it does not react with oxygen', 'its oxide forms a thin continuous film that stops further oxidation', 'its oxide is soluble in water', 'it is lighter than iron'], a:1, why:'Aluminium reacts readily with oxygen, but its oxide (Pilling–Bedworth ratio about 1.3) forms a tight film that protects the metal under it.' },
  { q:'Which of these is a physical property?', o:['Corrosion resistance', 'Toxicity', 'Thermal conductivity', 'Reactivity with acids'], a:2, why:'Thermal conductivity can be measured without changing the chemical composition of the material.' },
  { q:'Toughness is best described as', o:['resistance to scratching', 'the energy absorbed before fracture', 'the stress at which yielding begins', 'the stiffness in the elastic region'], a:1, why:'Toughness combines strength and ductility; it is the area under the stress–strain curve and is measured in impact tests.' },
  { q:'A steel that breaks with 120 J in a Charpy test at 20 °C breaks with 8 J at −40 °C. This shows', o:['creep', 'fatigue', 'a ductile-to-brittle transition', 'work hardening'], a:2, why:'Body-centred cubic steels become brittle below their transition temperature.' },
  { q:'Fatigue failure happens', o:['only above the tensile strength', 'under repeated loading at stresses below the tensile strength', 'only at high temperature', 'only in polymers'], a:1, why:'Cracks start at notches and surface defects and grow a little with each cycle.' },
  { q:'Which property is most important for a turbine blade running hot for years?', o:['Creep resistance', 'Electrical conductivity', 'Transparency', 'Low density only'], a:0, why:'Creep is slow deformation under steady load at high temperature.' },
  { q:'The refractive index of a material is', o:['speed of light in the material / speed in a vacuum', 'speed of light in a vacuum / speed in the material', 'the angle of reflection', 'the share of light transmitted'], a:1, why:'n = c/v, so it is always greater than 1 for real materials.' },
  { q:'A specimen 10 mm in diameter carries 15.7 kN. The stress is about', o:['20 MPa', '200 MPa', '2000 MPa', '1.57 MPa'], a:1, why:'A = 78.5 mm², σ = 15 700/78.5 = 200 MPa.' } ]);
})();
