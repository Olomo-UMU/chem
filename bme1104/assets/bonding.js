/* BME 1104 interactive notes, Chapter 3: chemical bonding */
(() => {
'use strict';
const PI = Math.PI;
const Z = s => EL_SYM.indexOf(s) + 1, EN = s => EL_EN[Z(s) - 1];
const sub = s => s.replace(/(\d)/g, d => '₀₁₂₃₄₅₆₇₈₉'[d]);
const shellsOf = e => { const s = []; for (const o of econfig(e)) s[o.n - 1] = (s[o.n - 1] || 0) + o.e; return [...s].map(v => v || 0); };
const gcd = (a, b) => b ? gcd(b, a % b) : a;

/* ================= 3.1 electron transfer ================= */
{ const MET = ['Li', 'Na', 'K', 'Mg', 'Ca', 'Al'], NON = ['F', 'Cl', 'O', 'S', 'N'];
  const cv = $('tf'), sm = $('tf_m'), sn = $('tf_n'); let k = 0, run = false;
  sm.innerHTML = MET.map(s => `<option value="${s}">${EL_NAME[Z(s) - 1]}</option>`).join(''); sn.innerHTML = NON.map(s => `<option value="${s}">${EL_NAME[Z(s) - 1]}</option>`).join('');
  sm.value = 'Na'; sn.value = 'Cl';
  function setup(){ const m = sm.value, n = sn.value, cm = valence(Z(m)), ca = 8 - valence(Z(n)), L = cm*ca/gcd(cm, ca), nm = L/cm, nn = L/ca;
    const atoms = []; for (let i = 0; i < nm; i++) atoms.push({ s:m, metal:true }); for (let i = 0; i < nn; i++) atoms.push({ s:n, metal:false });
    return { m, n, cm, ca, nm, nn, atoms }; }
  function draw(){ const { ctx, W, H } = prep(cv); readColors(); const S = setup(), N = S.atoms.length, cw = W/N, R = Math.min(cw*0.42, H*0.36), cy = H*0.47;
    const pos = S.atoms.map((a, i) => [cw*(i + 0.5), cy]); const ease = k*k*(3 - 2*k);
    // free slots on the non-metals and the electrons leaving the metals
    const slots = [], movers = [];
    S.atoms.forEach((a, i) => { const sh = shellsOf(Z(a.s)), n = sh.length, rr = R*(0.3 + 0.7*n/Math.max(3, n));
      if (a.metal) for (let j = 0; j < S.cm; j++){ const ang = -PI/2 + 2*PI*j/Math.max(S.cm, 1) + 0.4; movers.push([pos[i][0] + rr*Math.cos(ang), pos[i][1] + rr*Math.sin(ang)]); }
      else { const v = valence(Z(a.s)); for (let j = v; j < 8; j++){ const ang = -PI/2 + 2*PI*(Math.floor(j/2)/4) + (j % 2 ? 0.17 : -0.17); slots.push([pos[i][0] + rr*Math.cos(ang), pos[i][1] + rr*Math.sin(ang)]); } } });
    S.atoms.forEach((a, i) => { const z = Z(a.s), sh = shellsOf(z), n = sh.length, [x, y] = pos[i];
      sh.forEach((ne, si) => { const rr = R*(0.3 + 0.7*(si + 1)/Math.max(3, n)), outer = si === n - 1, gone = a.metal && outer;
        ctx.strokeStyle = alpha(C.muted, gone ? 0.6*(1 - ease) + 0.05 : 0.6); ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y, rr, 0, 7); ctx.stroke();
        if (gone) return; const cnt = ne;
        for (let j = 0; j < cnt; j++){ const ang = outer && !a.metal ? -PI/2 + 2*PI*(Math.floor(j/2)/4) + (j % 2 ? 0.17 : -0.17) : -PI/2 + 2*PI*j/cnt;
          const ex = x + rr*Math.cos(ang), ey = y + rr*Math.sin(ang); if (a.metal){ ctx.strokeStyle = C.crank; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ex - 3.5, ey - 3.5); ctx.lineTo(ex + 3.5, ey + 3.5); ctx.moveTo(ex + 3.5, ey - 3.5); ctx.lineTo(ex - 3.5, ey + 3.5); ctx.stroke(); }
          else { ctx.fillStyle = C.rod; ctx.beginPath(); ctx.arc(ex, ey, 3.6, 0, 7); ctx.fill(); } } });
      ctx.fillStyle = a.metal ? alpha(C.crank, 0.15) : alpha(C.rod, 0.15); ctx.beginPath(); ctx.arc(x, y, R*0.16, 0, 7); ctx.fill(); ctx.fillStyle = C.ink; ctx.font = `700 ${Math.max(12, R*0.2)}px ${C.mono}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(a.s, x, y);
      if (ease > 0.95){ const q = a.metal ? `${S.cm > 1 ? S.cm : ''}+` : `${S.ca > 1 ? S.ca : ''}−`, rr = R*1.02; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(x - rr + 8, y - rr); ctx.lineTo(x - rr, y - rr); ctx.lineTo(x - rr, y + rr); ctx.lineTo(x - rr + 8, y + rr); ctx.moveTo(x + rr - 8, y - rr); ctx.lineTo(x + rr, y - rr); ctx.lineTo(x + rr, y + rr); ctx.lineTo(x + rr - 8, y + rr); ctx.stroke();
        ctx.font = `600 14px ${C.mono}`; ctx.textAlign = 'left'; ctx.fillText(q, x + rr + 3, y - rr + 4); } });
    movers.forEach((p, j) => { const t = slots[j]; if (!t || ease >= 1 && false) return; const x = p[0] + (t[0] - p[0])*ease, y = p[1] + (t[1] - p[1])*ease - Math.sin(PI*ease)*R*0.5;
      ctx.strokeStyle = C.crank; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 3.5, y - 3.5); ctx.lineTo(x + 3.5, y + 3.5); ctx.moveTo(x + 3.5, y - 3.5); ctx.lineTo(x - 3.5, y + 3.5); ctx.stroke(); });
    ctx.fillStyle = C.muted; ctx.font = `12px ${C.mono}`; ctx.textAlign = 'center'; ctx.fillText(ease < 0.05 ? 'before: neutral atoms (× metal electrons, • non-metal electrons)' : ease > 0.95 ? 'after: ions with noble-gas configurations' : 'electrons moving', W/2, H - 14); }
  function info(){ const S = setup(), f = (S.nm > 1 ? S.m + S.nm : S.m) + (S.nn > 1 ? S.n + S.nn : S.n), ions = `${S.m}^{${S.cm > 1 ? S.cm : ''}+}`;
    const gas = z => EL_NAME[[2, 10, 18, 36].reduce((a, g) => Math.abs(g - z) < Math.abs(a - z) ? g : a, 2) - 1].toLowerCase();
    $('tf_t').innerHTML = `Electron transfer: ${EL_NAME[Z(S.m) - 1].toLowerCase()} and ${EL_NAME[Z(S.n) - 1].toLowerCase()} form ${ce(f)}`;
    $('tf_sub').innerHTML = `${ce(`${S.m}^{${S.cm > 1 ? S.cm : ''}+}`)} and ${ce(`${S.n}^{${S.ca > 1 ? S.ca : ''}-}`)}`;
    $('tf_cap').innerHTML = `Each ${EL_NAME[Z(S.m) - 1].toLowerCase()} atom has ${S.cm} valence electron${S.cm > 1 ? 's' : ''} and loses ${S.cm > 1 ? 'them' : 'it'} to reach the configuration of ${gas(Z(S.m) - S.cm)}. Each ${EL_NAME[Z(S.n) - 1].toLowerCase()} atom needs ${S.ca} more to reach ${gas(Z(S.n) + S.ca)}. The charges must balance: ${S.nm} × (+${S.cm}) + ${S.nn} × (−${S.ca}) = 0, which gives the formula ${ce(f)}.`; }
  const an = animate(cv, dt => { if (run){ k = Math.min(1, k + dt/1.8); if (k >= 1) run = false; } draw(); });
  $('tf_go').addEventListener('click', () => { if (k >= 1){ k = 0; $('tf_go').textContent = 'Transfer the electrons'; draw(); return; } run = true; $('tf_go').textContent = 'Start again'; if (!an.playing){ k = 1; draw(); } });
  [sm, sn].forEach(s => s.addEventListener('change', () => { k = 0; run = false; $('tf_go').textContent = 'Transfer the electrons'; info(); draw(); }));
  watchSize(cv, draw); onRedraw(draw); info(); draw(); }

/* ================= 3.2 ionic pair energy ================= */
{ const cv = $('cl'), P = {}, NB = 9, PAIRS = [['NaCl', 1, 1, 102, 181], ['KCl', 1, 1, 138, 181], ['LiF', 1, 1, 76, 133], ['NaF', 1, 1, 102, 133], ['CsI', 1, 1, 167, 220], ['MgO', 2, 2, 72, 140], ['CaO', 2, 2, 100, 140], ['Al2O3', 3, 2, 54, 140]];
  const chips = $('cl_chips'); chips.innerHTML = PAIRS.map((p, i) => `<button type="button" data-i="${i}" aria-pressed="${i === 0}">${ce(p[0])}</button>`).join('');
  const H = controls($('cl_c'), [['zp', 'Cation charge', 1, 3, 1, 1, ''], ['zn', 'Anion charge', 1, 3, 1, 1, ''], ['rp', 'Cation radius', 50, 200, 1, 102, 'pm'], ['rn', 'Anion radius', 100, 230, 1, 181, 'pm']], P, () => { chips.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', 'false')); draw(); });
  chips.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; const p = PAIRS[+b.dataset.i]; H.zp.set(p[1]); H.zn.set(p[2]); H.rp.set(p[3]); H.rn.set(p[4]); chips.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b)); draw(); });
  const kJ = K_C*Q_E*Q_E*N_A/1000; // kJ/mol times m
  function draw(){ readColors(); const r0 = (P.rp + P.rn)*1e-12, A = kJ*P.zp*P.zn, B = A*Math.pow(r0, NB - 1)/NB;
    const xs = [], at = [], rp = [], tot = []; for (let d = 80; d <= 800; d += 2){ const r = d*1e-12; xs.push(d); at.push(-A/r); rp.push(B/Math.pow(r, NB)); tot.push(-A/r + B/Math.pow(r, NB)); }
    const Emin = -A/r0*(1 - 1/NB), Ec = -A/r0, lo = Math.min(-600, Ec*1.25);
    plot(cv, { xmin:80, xmax:800, ymin:lo, ymax:-lo*0.6, xlab:'distance between the ion centres d [pm]', ylab:'energy [kJ/mol]', pl:70,
      series:[{ x:xs, y:at, color:C.rod, dash:[5, 4] }, { x:xs, y:rp, color:C.muted, dash:[2, 3] }, { x:xs, y:tot, color:C.crank, w:2.6 }],
      hl:[{ v:0, color:C.muted }], points:[{ x:(P.rp + P.rn), y:Emin, color:C.crank, r:6, label:`minimum ${fmt(Emin, 0)} kJ/mol at ${P.rp + P.rn} pm`, bold:true }],
      legend:[{ color:C.crank, label:'total' }, { color:C.rod, label:'attraction k q₁q₂/d' }, { color:C.muted, label:'repulsion of the electron clouds' }] });
    $('cl_sub').innerHTML = `d = ${P.rp} + ${P.rn} = ${P.rp + P.rn} pm, attraction alone ${fmt(Ec, 0)} kJ/mol`;
    $('cl_cap').innerHTML = `The bond length is the sum of the radii, ${P.rp + P.rn} pm, and the well depth is ${fmt(-Emin, 0)} kJ/mol for one mole of separate ion pairs. Doubling both charges makes the well four times deeper; making the ions smaller moves the minimum inwards and also deepens it. In a real crystal each ion has several neighbours, so the lattice energy is larger still (787 kJ/mol for NaCl, 3800 kJ/mol for MgO), which is why MgO melts at 2852 °C and NaCl at 801 °C.`; }
  watchSize(cv, draw); onRedraw(draw); draw(); }

example($('ex1'), { title:'Example 3.1: energy of a sodium ion and a chloride ion', src:"Coulomb's law",
  q:'The ionic radii are {ce:Na+} 102 pm and {ce:Cl-} 181 pm. Find the potential energy of one ion pair at the bond length, and for one mole of pairs.',
  inputs:[['rp', 'Radius of the cation', 102, 'pm'], ['rn', 'Radius of the anion', 181, 'pm'], ['z1', 'Charge number of the cation', 1, ''], ['z2', 'Charge number of the anion', -1, '']],
  solve:v => { const d = (v.rp + v.rn)*1e-12, E = K_C*v.z1*v.z2*Q_E*Q_E/d;
    return [['Bond length d = r₊ + r₋ =', `${fmt((v.rp + v.rn), 0)} pm = ${sci(d, 3)} m`], [`E = k q₁q₂/d = 8.988 × 10⁹ × (${v.z1} × 1.602 × 10⁻¹⁹) × (${v.z2} × 1.602 × 10⁻¹⁹) / ${sci(d, 3)}`, ''],
      ['Energy of one pair E =', `${sci(E, 3)} J`, true], ['For one mole, multiply by N_A = 6.022 × 10²³:', `${fmt(E*N_A/1000, 0)} kJ/mol`, true],
      ['The negative sign means the ions attract. The repulsion of the electron clouds, ignored here, reduces this by roughly an eighth.', '']]; } });

/* ================= 3.2 electronegativity and polarity ================= */
{ const LIST = ['H', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'K', 'Ca', 'Br', 'I', 'Cs'];
  const QUICK = [['H', 'H'], ['C', 'H'], ['H', 'Cl'], ['O', 'H'], ['Na', 'Cl'], ['Cs', 'F']];
  const cv = $('en'), sa = $('en_a'), sb = $('en_b'); const opt = LIST.map(s => `<option value="${s}">${s} (${EN(s)})</option>`).join(''); sa.innerHTML = opt; sb.innerHTML = opt; sa.value = 'H'; sb.value = 'Cl';
  $('en_chips').innerHTML = QUICK.map(([a, b]) => `<button type="button" data-a="${a}" data-b="${b}">${a}–${b}</button>`).join('');
  $('en_chips').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; sa.value = b.dataset.a; sb.value = b.dataset.b; draw(); });
  [sa, sb].forEach(s => s.addEventListener('change', draw));
  function draw(){ const { ctx, W, H } = prep(cv); readColors(); const a = sa.value, b = sb.value, ea = EN(a), eb = EN(b), d = Math.abs(ea - eb), ion = 1 - Math.exp(-d*d/4);
    const kind = d <= 0.4 ? 'nonpolar covalent' : d < 2 ? 'polar covalent' : 'ionic';
    const xa = W*0.3, xb = W*0.7, y = H*0.4, ra = 18 + EL_RAD[Z(a) - 1]*0.12, rb = 18 + EL_RAD[Z(b) - 1]*0.12, sh = (eb - ea)/(ea + eb)*1.15, cx = (xa + xb)/2 + sh*(xb - xa)*0.5*Math.min(1, ion*1.6 + 0.1);
    const g = ctx.createRadialGradient(cx, y, 4, cx, y, (xb - xa)*0.55); g.addColorStop(0, alpha(C.rod, 0.45)); g.addColorStop(1, alpha(C.rod, 0)); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(cx, y, (xb - xa)*0.55, H*0.26, 0, 0, 7); ctx.fill();
    [[xa, ra, a], [xb, rb, b]].forEach(([x, r, s]) => { ctx.fillStyle = alpha(C.ink, 0.08); ctx.strokeStyle = C.ink; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = C.ink; ctx.font = `700 15px ${C.mono}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y); });
    ctx.fillStyle = C.rod; [-5, 5].forEach(o => { ctx.beginPath(); ctx.arc(cx + o, y, 4, 0, 7); ctx.fill(); });
    if (d > 0.05){ const neg = eb > ea ? [xb, rb] : [xa, ra], pos = eb > ea ? [xa, ra] : [xb, rb]; ctx.font = `600 15px ${C.mono}`; ctx.fillStyle = C.ink;
      ctx.fillText(kind === 'ionic' ? '−' : 'δ−', neg[0], y - neg[1] - 14); ctx.fillText(kind === 'ionic' ? '+' : 'δ+', pos[0], y - pos[1] - 14); }
    // scale
    const x0 = 30, x1 = W - 30, sy = H - 46, X = v => x0 + v/3.3*(x1 - x0);
    [[0, 0.4, C.ok, 'nonpolar'], [0.4, 2, C.mass, 'polar covalent'], [2, 3.3, C.crank, 'ionic']].forEach(([p, q, c, t]) => { ctx.fillStyle = alpha(c, 0.18); ctx.fillRect(X(p), sy, X(q) - X(p), 14); ctx.fillStyle = C.muted; ctx.font = `11px ${C.mono}`; ctx.textAlign = 'center'; ctx.fillText(t, (X(p) + X(q))/2, sy + 26); });
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.moveTo(X(d), sy - 1); ctx.lineTo(X(d) - 6, sy - 10); ctx.lineTo(X(d) + 6, sy - 10); ctx.closePath(); ctx.fill(); ctx.textAlign = 'left'; ctx.fillText(`ΔEN = ${fmt(d, 2)}`, Math.min(X(d) + 8, W - 90), sy - 12);
    $('en_t').textContent = `Who gets the electrons? ${a}–${b}`;
    $('en_sub').textContent = `EN ${a} ${ea}, ${b} ${eb}, difference ${fmt(d, 2)}`;
    $('en_cap').innerHTML = `The ${a}–${b} bond is <b>${kind}</b>. ${d < 0.05 ? 'Both atoms pull equally, so the pair sits in the middle.' : `The pair is pulled towards ${eb > ea ? b : a}, the more electronegative atom.`} Pauling's estimate of the ionic character is 1 − e<sup>−(ΔEN)²/4</sup> = ${fmt(ion*100, 0)} %. No bond is completely ionic: even CsF is about ${fmt(100*(1 - Math.exp(-((3.98 - 0.79)**2)/4)), 0)} % by this estimate.`; }
  watchSize(cv, draw); onRedraw(draw); draw(); }

example($('ex2'), { title:'Example 3.2: partial charges in hydrogen chloride', src:'dipole moment',
  q:'The H–Cl bond is 127 pm long and the dipole moment of HCl is 1.08 D (1 D = 3.336 × 10⁻³⁰ C m). Find the partial charge δ as a fraction of the electron charge.',
  inputs:[['mu', 'Dipole moment μ', 1.08, 'D'], ['d', 'Bond length d', 127, 'pm']],
  solve:v => { const mu = v.mu*3.336e-30, dl = mu/(v.d*1e-12);
    return [['μ in SI units =', `${sci(mu, 3)} C m`], ['δ = μ / d =', `${sci(dl, 3)} C`], ['As a fraction of e = 1.602 × 10⁻¹⁹ C:', `δ = ${fmt(dl/Q_E, 3)} e`, true],
      [`So the bond is about ${fmt(100*dl/Q_E, 0)} % ionic, close to Pauling's estimate from ΔEN = 0.96 (21 %).`, '']]; } });

/* ================= 3.3 molecular orbital diagrams ================= */
{ const MOL = [ // name, valence electrons per atom, period, bond length pm, bond energy kJ/mol
    ['H2', 1, 1, 74, 436], ['He2', 2, 1, null, 0], ['Li2', 1, 2, 267, 105], ['B2', 3, 2, 159, 290], ['C2', 4, 2, 124, 602], ['N2', 5, 2, 110, 945], ['O2', 6, 2, 121, 498], ['F2', 7, 2, 142, 159], ['Ne2', 8, 2, null, 0]];
  let cur = 6; const cv = $('mo'), chips = $('mo_chips');
  chips.innerHTML = MOL.map((m, i) => `<button type="button" data-i="${i}" aria-pressed="${i === cur}">${ce(m[0])}</button>`).join('');
  chips.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; cur = +b.dataset.i; chips.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b)); draw(); });
  function levels(m){ if (m[2] === 1) return { ao:[['1s', 0, 1]], mo:[['σ1s', -1.6, 1, 1], ['σ*1s', 1.9, 1, -1]] };
    const late = ['O2', 'F2', 'Ne2'].includes(m[0]);
    return { ao:[['2s', 0, 1], ['2p', 4, 3]], mo:[['σ2s', -1.3, 1, 1], ['σ*2s', 1.4, 1, -1], late ? ['σ2p', 2.6, 1, 1] : ['π2p', 2.9, 2, 1], late ? ['π2p', 3.3, 2, 1] : ['σ2p', 3.6, 1, 1], ['π*2p', 5.1, 2, -1], ['σ*2p', 6.4, 1, -1]] }; }
  function fill(n, deg){ const out = []; for (let i = 0; i < deg; i++) out.push(0); for (let k = 0; k < n; k++) out[k % deg]++; return out; } // Hund: one each, then pair
  function draw(){ const { ctx, W, H } = prep(cv); readColors(); const m = MOL[cur], L = levels(m); let left = 2*m[1], bond = 0, anti = 0, unp = 0;
    const emin = Math.min(...L.mo.map(o => o[1])) - 0.6, emax = Math.max(...L.mo.map(o => o[1])) + 0.6, Y = e => H - 30 - (e - emin)/(emax - emin)*(H - 60);
    const xl = W*0.16, xr = W*0.84, xm = W*0.5, bw = Math.min(46, W*0.07);
    ctx.font = `13px ${C.mono}`; ctx.textBaseline = 'middle';
    const box = (x, y, n, deg) => { const occ = fill(n, deg), tot = deg*bw + (deg - 1)*8, x0 = x - tot/2; occ.forEach((c, i) => { const bx = x0 + i*(bw + 8); ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bx, y); ctx.lineTo(bx + bw, y); ctx.stroke();
      ctx.fillStyle = C.crank; ctx.font = `600 18px ${C.mono}`; ctx.textAlign = 'center'; if (c >= 1) ctx.fillText('↑', bx + bw*(c === 2 ? 0.35 : 0.5), y - 11); if (c === 2){ ctx.fillStyle = C.rod; ctx.fillText('↓', bx + bw*0.65, y - 11); } }); return [x0, x0 + tot]; };
    // atomic orbitals, each atom
    let pa = m[1]; const aoFill = L.ao.map(([n, e, deg]) => { const k = Math.min(pa, 2*deg); pa -= k; return k; });
    const moFill = L.mo.map(o => { const k = Math.min(left, 2*o[2]); left -= k; if (o[3] > 0) bond += k; else anti += k; const occ = fill(k, o[2]); unp += occ.filter(c => c === 1).length; return k; });
    L.ao.forEach(([n, e, deg], i) => { [xl, xr].forEach((x, s) => { const [a, b] = box(x, Y(e), aoFill[i], deg); ctx.fillStyle = C.muted; ctx.font = `13px ${C.mono}`; ctx.textAlign = s ? 'left' : 'right'; ctx.fillText(n, s ? b + 8 : a - 8, Y(e));
        L.mo.forEach(o => { const fromP = n.endsWith('p'), toP = o[0].includes('p'), to1 = o[0].includes('1s'); if (fromP !== toP || (n === '1s') !== to1) return; ctx.strokeStyle = alpha(C.muted, 0.45); ctx.setLineDash([3, 3]); ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(s ? a - 4 : b + 4, Y(e)); ctx.lineTo(s ? xm + (o[2]*bw + 8)/2 + 6 : xm - (o[2]*bw + 8)/2 - 6, Y(o[1])); ctx.stroke(); ctx.setLineDash([]); }); }); });
    L.mo.forEach((o, i) => { const [a, b] = box(xm, Y(o[1]), moFill[i], o[2]); ctx.fillStyle = o[3] > 0 ? C.ink : C.muted; ctx.font = `13px ${C.mono}`; ctx.textAlign = 'left'; ctx.fillText(o[0], b + 10, Y(o[1])); });
    ctx.fillStyle = C.muted; ctx.textAlign = 'center'; ctx.font = `12px ${C.mono}`; ctx.fillText('atom A', xl, 12); ctx.fillText(`molecule ${sub(m[0])}`, xm, 12); ctx.fillText('atom B', xr, 12);
    ctx.save(); ctx.translate(14, H/2); ctx.rotate(-PI/2); ctx.fillText('energy', 0, 0); ctx.restore(); arrow(ctx, 26, H - 30, 26, 30, C.muted, 1.2);
    const bo = (bond - anti)/2;
    $('mo_t').innerHTML = `Molecular orbital diagram: ${ce(m[0])}`;
    $('mo_sub').textContent = `${2*m[1]} valence electrons, bond order ½(${bond} − ${anti}) = ${fmt(bo, 1)}`;
    $('mo_cap').innerHTML = (bo <= 0 ? `Bond order 0: the antibonding electrons cancel the bonding ones, so ${ce(m[0])} does not exist as a stable molecule.` : `Bond order ${fmt(bo, 1)}${bo === 3 ? ' (a triple bond)' : bo === 2 ? ' (a double bond)' : bo === 1 ? ' (a single bond)' : ''}: bond length ${m[3]} pm, bond energy ${m[4]} kJ/mol. `)
      + (unp ? ` ${unp} unpaired electrons, so ${ce(m[0])} is <b>paramagnetic</b>.${m[0] === 'O2' ? ' Liquid oxygen sticks between the poles of a magnet. The simple dot structure, with all electrons paired, cannot explain this; the MO model can.' : ''}` : bo > 0 ? ` All electrons are paired, so ${ce(m[0])} is diamagnetic.` : '')
      + (['B2', 'C2', 'N2'].includes(m[0]) ? ' For B₂, C₂ and N₂ the σ2p orbital lies above the π2p orbitals, because 2s and 2p mix.' : ''); }
  watchSize(cv, draw); onRedraw(draw); draw(); }

/* ================= 3.4 VSEPR shapes in 3D ================= */
{ const M = [ // formula, central, terminal, groups, lone pairs, bond order, angle text, note
    ['CO2', 'C', ['O', 'O'], 2, 0, 2, '180°', 'Two double bonds, two electron groups: linear. Each C=O bond is polar, but the two dipoles cancel.'],
    ['BeCl2', 'Be', ['Cl', 'Cl'], 2, 0, 1, '180°', 'Beryllium has only four valence electrons around it, fewer than an octet.'],
    ['BF3', 'B', ['F', 'F', 'F'], 3, 0, 1, '120°', 'Boron has only six electrons around it. Three equal B–F dipoles at 120° cancel.'],
    ['SO2', 'S', ['O', 'O'], 3, 1, 2, '119°', 'Three electron groups, one of them a lone pair: the molecule is bent and polar.'],
    ['CH4', 'C', ['H', 'H', 'H', 'H'], 4, 0, 1, '109.5°', 'The perfect tetrahedron. C–H bonds are almost nonpolar and cancel anyway.'],
    ['NH3', 'N', ['H', 'H', 'H'], 4, 1, 1, '107°', 'The lone pair pushes the three N–H bonds together: trigonal pyramidal and polar.'],
    ['H2O', 'O', ['H', 'H'], 4, 2, 1, '104.5°', 'Two lone pairs squeeze the angle further: bent and strongly polar.'],
    ['NH4+', 'N', ['H', 'H', 'H', 'H'], 4, 0, 1, '109.5°', 'The ammonium ion: one N–H bond is dative, but all four are identical once formed.'],
    ['PCl5', 'P', ['Cl', 'Cl', 'Cl', 'Cl', 'Cl'], 5, 0, 1, '120° and 90°', 'An expanded octet: ten electrons around phosphorus. Three equatorial and two axial bonds.'],
    ['SF4', 'S', ['F', 'F', 'F', 'F'], 5, 1, 1, '102° and 173°', 'The lone pair takes an equatorial position, where it has more room: seesaw.'],
    ['ClF3', 'Cl', ['F', 'F', 'F'], 5, 2, 1, '87.5°', 'Two equatorial lone pairs leave a T shape.'],
    ['XeF2', 'Xe', ['F', 'F'], 5, 3, 1, '180°', 'Three lone pairs fill the equator, so the two fluorines are opposite each other: linear.'],
    ['SF6', 'S', ['F', 'F', 'F', 'F', 'F', 'F'], 6, 0, 1, '90°', 'Six bonds to the corners of an octahedron. Very stable and used as an insulating gas in high-voltage switchgear.'],
    ['BrF5', 'Br', ['F', 'F', 'F', 'F', 'F'], 6, 1, 1, '85°', 'One lone pair: square pyramidal and polar.'],
    ['XeF4', 'Xe', ['F', 'F', 'F', 'F'], 6, 2, 1, '90°', 'Two lone pairs opposite each other leave a flat square: nonpolar.']];
  let cur = 5, grp = null, lpG = null, dpG = null; const chips = $('vs_chips');
  chips.innerHTML = M.map((m, i) => `<button type="button" data-i="${i}" aria-pressed="${i === cur}">${ce(m[0])}</button>`).join('');
  const v = niceGL(view3d($('vs'), { cam:[0.6, 1.2, 6.8], fov:34, build(v){ v.root.add(grp = new THREE.Group()); }, update(dt, v){ v.root.rotation.y += dt*0.2; } }));
  const lpM = new THREE.MeshPhysicalMaterial({ color:0xa8b3c0, transparent:true, opacity:0.38, roughness:0.4, depthWrite:false });
  function build(){ const m = M[cur], [bd, lp] = unitDirs(m[3], m[4]), c = m[1];
    let net = new THREE.Vector3(); const dmag = [];
    if (grp){ clearMesh(grp); lpG = new THREE.Group(); dpG = new THREE.Group(); grp.add(lpG, dpG);
      const rc = c === 'H' ? 0.24 : Math.max(0.34, COV(c)*0.55), cM = gloss(atomColor(c)), bM = gloss(0xd7dbe0, { roughness:0.45 });
      grp.add(new THREE.Mesh(new THREE.SphereGeometry(rc, 40, 28), cM));
      bd.forEach((d, i) => { const t = m[2][i], L = (COV(c) + COV(t))*1.25, rt = t === 'H' ? 0.24 : Math.max(0.3, COV(t)*0.55), p = d.clone().multiplyScalar(L);
        const s = new THREE.Mesh(new THREE.SphereGeometry(rt, 36, 24), gloss(atomColor(t))); s.position.copy(p); grp.add(s);
        if (m[5] === 2){ const ref = Math.abs(d.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0), pp = ref.sub(d.clone().multiplyScalar(ref.dot(d))).normalize().multiplyScalar(0.08);
          [-1, 1].forEach(f => grp.add(cylBetween(pp.clone().multiplyScalar(f), p.clone().addScaledVector(pp, f), 0.055, bM))); }
        else grp.add(cylBetween(new THREE.Vector3(), p, 0.075, bM));
        const lab = textSprite(t, { h:0.26, color:'#33404c', depth:false }); lab.position.copy(d.clone().multiplyScalar(L + rt + 0.2)); grp.add(lab);
        const dEN = EN(t) - EN(c); dmag.push(dEN); net.addScaledVector(d, dEN);
        if (Math.abs(dEN) > 0.05){ const a = d.clone().multiplyScalar(dEN > 0 ? rc + 0.12 : L - rt - 0.12), b = d.clone().multiplyScalar(dEN > 0 ? L - rt - 0.12 : rc + 0.12);
          const mid = a.clone().lerp(b, 0.5), half = b.clone().sub(a).multiplyScalar(Math.min(0.5, 0.18 + Math.abs(dEN)*0.25)), off = (Math.abs(d.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(0, 0, 1)).sub(d.clone().multiplyScalar(Math.abs(d.y) < 0.9 ? d.y : d.z)).normalize().multiplyScalar(0.3);
          dpG.add(arrow3(mid.clone().sub(half).add(off), mid.clone().add(half).add(off), 0x7a3fb0, 0.022)); } });
      lp.forEach(d => lpG.add(lobe(d, 1.25, lpM)));
      const cl = textSprite(c, { h:0.3, color:'#ffffff', depth:false }); grp.add(cl);
      if (net.length() > 0.08){ const n = net.clone().normalize(); dpG.add(arrow3(n.clone().multiplyScalar(-1.1), n.clone().multiplyScalar(-1.1 + Math.min(2.6, 0.9 + net.length()*0.9)), 0xd8302c, 0.06)); }
      lpG.visible = $('vs_lp').checked; dpG.visible = $('vs_dp').checked; v.render(); }
    else bd.forEach((d, i) => net.addScaledVector(d, EN(m[2][i]) - EN(c)));
    const polar = net.length() > 0.08;
    $('vs_t').innerHTML = `Molecular shapes in 3D: ${ce(m[0])}`;
    $('vs_sub').textContent = `${m[3] - m[4]} bond${m[3] - m[4] > 1 ? 's' : ''} + ${m[4]} lone pair${m[4] === 1 ? '' : 's'} = ${m[3]} electron groups`;
    $('vs_st').innerHTML = statsHTML([['Electron groups', m[3]], ['Electron geometry', EGEOM[m[3]]], ['Molecular shape', SHAPES[m[3]][m[4]]], ['Bond angle', m[6]], ['Molecule', polar ? 'polar' : 'nonpolar', polar ? 'bad' : 'ok']]);
    $('vs_cap').innerHTML = m[7]; }
  chips.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; cur = +b.dataset.i; chips.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b)); build(); });
  $('vs_lp').addEventListener('change', () => { if (lpG){ lpG.visible = $('vs_lp').checked; v.render(); } });
  $('vs_dp').addEventListener('change', () => { if (dpG){ dpG.visible = $('vs_dp').checked; v.render(); } });
  build(); }

/* ================= 3.5 hydrogen bonds in water ================= */
{ const v = niceGL(view3d($('hb'), { cam:[0, 2, 12.5], fov:34, update(dt, v){ v.root.rotation.y += dt*0.25; },
    build(v){ const T = unitDirs(4, 0)[0], OM = gloss(atomColor('O')), HM = gloss(atomColor('H')), bM = gloss(0xd7dbe0), dM = new THREE.MeshBasicMaterial({ color:0x2f6fd8 });
      const lpM = new THREE.MeshPhysicalMaterial({ color:0xa8b3c0, transparent:true, opacity:0.3, depthWrite:false });
      const water = (O, hd, lps) => { const g = v.root, o = new THREE.Mesh(new THREE.SphereGeometry(0.42, 36, 24), OM); o.position.copy(O); g.add(o);
        hd.forEach(d => { const h = O.clone().addScaledVector(d, 0.96), s = new THREE.Mesh(new THREE.SphereGeometry(0.26, 28, 18), HM); s.position.copy(h); g.add(s); g.add(cylBetween(O, h, 0.08, bM)); });
        (lps || []).forEach(d => { const l = lobe(d, 0.8, lpM); l.position.add(O); g.add(l); }); };
      const dash = (a, b) => { const n = 7; for (let i = 0; i < n; i++){ const p = a.clone().lerp(b, (i + 0.25)/n), q = a.clone().lerp(b, (i + 0.65)/n); v.root.add(cylBetween(p, q, 0.035, dM, 8)); } };
      const orient = (target, spin) => { const q = new THREE.Quaternion().setFromUnitVectors(T[0], target.clone().normalize()), r = new THREE.Quaternion().setFromAxisAngle(target.clone().normalize(), spin); return T.map(d => d.clone().applyQuaternion(q).applyQuaternion(r)); };
      const O0 = new THREE.Vector3(); water(O0, [T[0], T[1]], [T[2], T[3]]);
      T.forEach((t, k) => { const On = t.clone().multiplyScalar(2.76);
        if (k < 2){ const D = orient(t.clone().negate(), k*1.3 + 0.4); water(On, [D[1], D[2]]); dash(t.clone().multiplyScalar(0.96 + 0.3), On.clone().addScaledVector(t, -0.42)); }
        else { const D = orient(t.clone().negate(), k*0.9); water(On, [D[0], D[1]]); dash(On.clone().addScaledVector(t, -0.96 - 0.3), O0.clone().addScaledVector(t, 0.42)); } }); } }));
  if (v) playButton($('hb_play'), v.anim); else $('hb_play').hidden = true; }

/* ================= 3.5 boiling points of hydrides ================= */
{ const cv = $('bp'), G = [['group 14', ['CH4', 'SiH4', 'GeH4', 'SnH4'], [-161.5, -111.9, -88.5, -52]], ['group 15', ['NH3', 'PH3', 'AsH3', 'SbH3'], [-33.3, -87.7, -62.5, -17]],
    ['group 16', ['H2O', 'H2S', 'H2Se', 'H2Te'], [100, -60.3, -41.3, -2.2]], ['group 17', ['HF', 'HCl', 'HBr', 'HI'], [19.5, -85.1, -66.8, -35.4]]];
  function draw(){ readColors(); const cols = [C.muted, C.mass, C.rod, C.crank], pts = [];
    G.forEach((g, i) => g[1].forEach((f, j) => pts.push({ x:j + 2, y:g[2][j], color:cols[i], r:5, label:sub(f), bold:j === 0 && i > 0 })));
    plot(cv, { xmin:1.7, xmax:5.5, ymin:-180, ymax:120, xlab:'period', ylab:'boiling point [°C]', xfmt:v => Number.isInteger(v) ? String(v) : '', series:G.map((g, i) => ({ x:[2, 3, 4, 5], y:g[2], color:cols[i], w:2 })), points:pts,
      hl:[{ v:0, color:alpha(C.muted, 0.6), label:'0 °C' }], legend:G.map((g, i) => ({ color:cols[i], label:g[0] })) }); }
  watchSize(cv, draw); onRedraw(draw); draw(); }

/* ================= quiz ================= */
quiz($('qz'), [
  { q:'Magnesium (group 2) and nitrogen (group 15) form an ionic compound with the formula', o:['{ce:MgN}', '{ce:Mg2N3}', '{ce:Mg3N2}', '{ce:MgN2}'], a:2, why:'{ce:Mg^2+} and {ce:N^3-}: three magnesium ions (+6) balance two nitride ions (−6).' },
  { q:'Which is larger?', o:['A sodium atom', 'A sodium ion {ce:Na+}', 'They are the same size', 'It depends on temperature'], a:0, why:'The cation has lost its whole outer shell and the remaining electrons are pulled in harder, so {ce:Na+} (102 pm) is much smaller than Na (about 186 pm).' },
  { q:'Why does MgO melt at a much higher temperature than NaCl?', o:['Mg is heavier than Na', 'The charges are doubled and the ions are smaller, so the attraction is much stronger', 'MgO is covalent', 'Oxygen is a gas'], a:1, why:'The Coulomb energy scales with q₁q₂/d: charges of 2 and 2 give four times the product, and the shorter bond adds to it.' },
  { q:'The H–Cl bond (ΔEN = 0.96) is', o:['nonpolar covalent', 'polar covalent', 'ionic', 'metallic'], a:1, why:'ΔEN between 0.4 and about 2 gives a polar covalent bond, with δ− on chlorine.' },
  { q:'The bond order of {ce:N2} is', o:['1', '2', '3', '0'], a:2, why:'Ten valence electrons: 8 in bonding orbitals and 2 in σ*2s, so ½(8 − 2) = 3, a triple bond.' },
  { q:'{ce:NH3} has four electron groups. Its molecular shape is', o:['tetrahedral', 'trigonal planar', 'trigonal pyramidal', 'bent'], a:2, why:'Three bonds and one lone pair: the electron groups are tetrahedral, but the atoms form a pyramid.' },
  { q:'Which molecule is nonpolar even though its bonds are polar?', o:['{ce:H2O}', '{ce:SO2}', '{ce:NH3}', '{ce:CO2}'], a:3, why:'The two C=O dipoles are equal and point in opposite directions, so they cancel.' },
  { q:'Water boils at 100 °C while {ce:H2S} boils at −60 °C because', o:['water molecules are heavier', 'water forms hydrogen bonds', 'H₂S is ionic', 'sulfur is less reactive'], a:1, why:'O–H bonds are very polar and oxygen has lone pairs, so water molecules hydrogen bond to one another. {ce:H2S} is actually heavier.' }]);
})();
