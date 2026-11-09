/* BME 1104 interactive notes, Chapter 5: electrochemistry */
(() => {
'use strict';
const PI = Math.PI, lg = Math.log10;
const sup = n => n === 1 ? '+' : n + '+';
const gcd = (a, b) => b ? gcd(b, a % b) : a;

/* ================= 5.1 oxidation states ================= */
{ const OX = [ // ce formula, [element, state, count], charge, note
    ['H2O', [['H', 1, 2], ['O', -2, 1]], 0, 'Hydrogen +1 and oxygen −2, the usual values.'],
    ['H2O2', [['H', 1, 2], ['O', -1, 2]], 0, 'A peroxide: the two oxygens are bonded to each other, so each is only −1.'],
    ['NaH', [['Na', 1, 1], ['H', -1, 1]], 0, 'A metal hydride: hydrogen is the more electronegative partner, so it is −1.'],
    ['CH4', [['C', -4, 1], ['H', 1, 4]], 0, 'Carbon is at its lowest oxidation state. Burning it to CO₂ takes it to +4: methane is a reducing agent (a fuel).'],
    ['CO2', [['C', 4, 1], ['O', -2, 2]], 0, 'Carbon at its highest oxidation state: fully oxidised, it cannot burn further.'],
    ['Fe2O3', [['Fe', 3, 2], ['O', -2, 3]], 0, 'Rust: iron(III) oxide. Two irons share +6 to balance three oxygens at −6.'],
    ['KMnO4', [['K', 1, 1], ['Mn', 7, 1], ['O', -2, 4]], 0, 'Manganese at +7 is eager to gain electrons: potassium permanganate is a strong oxidising agent.'],
    ['K2Cr2O7', [['K', 1, 2], ['Cr', 6, 2], ['O', -2, 7]], 0, 'Chromium(VI), a strong oxidising agent. Hexavalent chromium is toxic, which is why chromium plating baths are tightly controlled.'],
    ['SO4^2-', [['S', 6, 1], ['O', -2, 4]], -2, 'In an ion the oxidation states add up to the charge, here −2.'],
    ['NO3-', [['N', 5, 1], ['O', -2, 3]], -1, 'Nitrogen at its highest state, +5.'],
    ['NH4+', [['N', -3, 1], ['H', 1, 4]], 1, 'Nitrogen at its lowest state, −3.'],
    ['O2', [['O', 0, 2]], 0, 'An element: oxidation state 0.']];
  let cur = 6; const chips = $('ox_chips'); const sgn = n => n > 0 ? '+' + n : n < 0 ? '−' + (-n) : '0';
  chips.innerHTML = OX.map((o, i) => `<button type="button" data-i="${i}" aria-pressed="${i === cur}">${ce(o[0])}</button>`).join('');
  function show(){ const o = OX[cur];
    $('ox_t').innerHTML = `Find the oxidation states: ${ce(o[0])}`;
    $('ox_big').innerHTML = o[1].map(([e, s]) => `<span style="display:inline-block;text-align:center;margin-right:18px"><span style="display:block;font-size:14px;color:var(--crank);font-weight:600">${sgn(s)}</span>${e}</span>`).join('');
    $('ox_sub').textContent = `sum: ${o[1].map(([e, s, n]) => `${n} × (${sgn(s)})`).join(' + ')} = ${sgn(o[2])}`;
    $('ox_cap').innerHTML = o[3]; }
  chips.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; cur = +b.dataset.i; chips.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b)); show(); });
  show(); }

/* ================= 5.2 to 5.4 galvanic cell in 3D ================= */
const MET = { // symbol: [n, E°, metal colour, solution colour, name]
  Mg:[2, -2.37, 0xc8ccd0, 0xdfe8ef, 'magnesium'], Al:[3, -1.66, 0xd0d4d8, 0xdfe8ef, 'aluminium'], Zn:[2, -0.76, 0x9aa4ae, 0xdfe8ef, 'zinc'], Fe:[2, -0.44, 0x6d6f73, 0xc9e3b5, 'iron'],
  Cd:[2, -0.40, 0xb4b9c0, 0xdfe8ef, 'cadmium'], Ni:[2, -0.25, 0xb3ad98, 0x86cf86, 'nickel'], Sn:[2, -0.14, 0xd0d0cb, 0xdfe8ef, 'tin'], Pb:[2, -0.13, 0x5d6470, 0xdfe8ef, 'lead'],
  Cu:[2, 0.34, 0xc8743f, 0x4f93dc, 'copper'], Ag:[1, 0.80, 0xe2e4e7, 0xdfe8ef, 'silver'] };
{ const P = {}; let v = null, cellG = null, eG = null, iG = null, path = null, bridge = null, screen = null, scrTx = null, t = 0, wear = 0;
  const sl = $('gc_l'), sr = $('gc_r'); const opts = Object.keys(MET).map(s => `<option value="${s}">${MET[s][4][0].toUpperCase() + MET[s][4].slice(1)} (${s})</option>`).join(''); sl.innerHTML = opts; sr.innerHTML = opts; sl.value = 'Zn'; sr.value = 'Cu';
  controls($('gc_c'), [['cl', 'Ion concentration, left beaker', 0.001, 2, 0.001, 1, 'M'], ['cr', 'Ion concentration, right beaker', 0.001, 2, 0.001, 1, 'M'], ['T', 'Temperature', 273, 373, 1, 298, 'K']], P, () => { calc(); drawSeries(); });
  function calc(){ const L = sl.value, R = sr.value, eL = MET[L][1], eR = MET[R][1], cat = eR >= eL ? R : L, an = cat === R ? L : R, ca = cat === R ? P.cr : P.cl, aa = cat === R ? P.cl : P.cr;
    const na = MET[an][0], nc = MET[cat][0], n = na*nc/gcd(na, nc), E0 = MET[cat][1] - MET[an][1], Q = Math.pow(aa, n/na)/Math.pow(ca, n/nc), E = L === R ? 0.05916*P.T/298.15/MET[L][0]*lg(Math.max(P.cl, P.cr)/Math.min(P.cl, P.cr)) : E0 - 2.303*R_G*P.T/(n*F_C)*lg(Q);
    return { L, R, an, cat, na, nc, n, E0, Q, E, aa, ca }; }
  function info(){ const c = calc(), same = c.L === c.R, A = c.an, K = c.cat, ka = c.n/c.na, kc = c.n/c.nc, k = x => x > 1 ? x : '';
    $('gc_t').textContent = same ? `Galvanic cell: concentration cell, ${MET[A][4]} | ${MET[A][4]}` : `Galvanic cell: ${MET[A][4]} anode, ${MET[K][4]} cathode`;
    $('gc_sub').textContent = `E° = ${fmt(c.E0, 2)} V, E = ${fmt(c.E, 3)} V`;
    $('gc_eq').innerHTML = same ? `<div class="w">Both half-cells are the same metal. A voltage appears only if the concentrations differ: electrons flow from the dilute side to the concentrated side.</div>` :
      `${ce(`${k(ka)}${A}(s) -> ${k(ka)}${A}^{${sup(c.na)}}(aq) + ${c.n}e-`)}&emsp;<span style="color:var(--muted)">anode, oxidation</span><br>${ce(`${k(kc)}${K}^{${sup(c.nc)}}(aq) + ${c.n}e- -> ${k(kc)}${K}(s)`)}&emsp;<span style="color:var(--muted)">cathode, reduction</span><br>${ce(`${k(ka)}${A}(s) + ${k(kc)}${K}^{${sup(c.nc)}}(aq) -> ${k(ka)}${A}^{${sup(c.na)}}(aq) + ${k(kc)}${K}(s)`)}`
      + `<div class="w">${tx(`E=E^\\circ-\\frac{2.303RT}{${c.n}F}\\log Q=${fmt(c.E0, 2)}-\\frac{2.303\\times8.314\\times${P.T}}{${c.n}\\times96\\,485}\\log\\frac{${ka > 1 ? `${fmt(c.aa, 3)}^{${ka}}` : fmt(c.aa, 3)}}{${kc > 1 ? `${fmt(c.ca, 3)}^{${kc}}` : fmt(c.ca, 3)}}=${fmt(c.E, 3)}\\ \\mathrm{V}`)}</div>`;
    $('gc_cap').innerHTML = same ? 'A concentration cell. Corrosion often works this way: where oxygen or ion concentrations differ along a metal surface (under a washer, in a crevice), a small cell forms and the metal dissolves on one side.'
      : `${MET[A][4][0].toUpperCase() + MET[A][4].slice(1)} has the lower reduction potential (${MET[A][1]} V), so it is oxidised and is the anode; the ${MET[K][4]} electrode (${MET[K][1] > 0 ? '+' : ''}${MET[K][1]} V) is the cathode. E°cell = ${MET[K][1]} − (${MET[A][1]}) = ${fmt(c.E0, 2)} V. ${Math.abs(c.E - c.E0) > 0.005 ? `The concentrations make Q = ${sci(c.Q, 2)}, so the voltage is ${c.E < c.E0 ? 'lower' : 'higher'} than standard.` : 'At 1 M and 298 K the cell gives its standard potential.'} The anode slowly thins while metal plates onto the cathode.`;
    if (screen){ const g = scrTx.image.getContext('2d'); g.fillStyle = '#b9c7a5'; g.fillRect(0, 0, 256, 128); g.fillStyle = '#1d2618'; g.font = '700 64px Roboto, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(`${fmt(Math.abs(c.E), 3)} V`, 128, 68); scrTx.needsUpdate = true; } }
  function build(){ if (!cellG) return; clearMesh(cellG); wear = 0; const c = calc(), gl = new THREE.MeshPhysicalMaterial({ color:0xffffff, roughness:0.05, transparent:true, opacity:0.18, clearcoat:1, side:THREE.DoubleSide, depthWrite:false });
    [[-1, c.L, P.cl], [1, c.R, P.cr]].forEach(([s, m, conc]) => { const x = s*1.4;
      const bk = new THREE.Mesh(new THREE.CylinderGeometry(0.66, 0.62, 1.35, 48, 1, true), gl); bk.position.set(x, 0.68, 0); cellG.add(bk);
      const bt = new THREE.Mesh(new THREE.CircleGeometry(0.62, 48), gl); bt.rotation.x = -PI/2; bt.position.set(x, 0.01, 0); cellG.add(bt);
      const col = new THREE.Color(MET[m][3]); if (MET[m][3] !== 0xdfe8ef) col.lerp(new THREE.Color(0xdfe8ef), 1 - clamp(0.35 + 0.65*Math.sqrt(conc/2), 0, 1));
      const lq = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.95, 48), new THREE.MeshPhysicalMaterial({ color:col, transparent:true, opacity:0.55, roughness:0.1 })); lq.position.set(x, 0.49, 0); cellG.add(lq);
      const el = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.7, 0.06), metal(MET[m][2], { roughness:m === 'Pb' || m === 'Fe' ? 0.55 : 0.3 })); el.position.set(s*1.62, 1.0, 0); el.userData.side = s; cellG.add(el);
      const isA = m === c.an && !(c.L === c.R && s > 0), lab = textSprite(c.L === c.R ? (s < 0 ? (P.cl < P.cr ? 'anode (−)' : 'cathode (+)') : (P.cl < P.cr ? 'cathode (+)' : 'anode (−)')) : (isA ? 'anode (−)' : 'cathode (+)'), { h:0.2, color:'#33404c' }); lab.position.set(x, -0.2, 0.4); cellG.add(lab);
      const ion = textSprite(`${m}${sup(MET[m][0]).replace('+', '⁺').replace(/^(\d)/, d => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d])} ${fmt(conc, 3)} M`, { h:0.16, color:'#33404c' }); ion.position.set(x - s*0.15, 0.35, 0.68); cellG.add(ion); });
    v.render(); }
  v = niceGL(view3d($('gc'), { cam:[0.4, 2.4, 6.4], target:[0, 1.2, 0], fov:38,
    build(v){ const R = v.root; const bench = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.06, 2.2), gloss(0xe9e6df, { roughness:0.6 })); bench.position.y = -0.03; R.add(bench);
      bridge = new THREE.CatmullRomCurve3([[-1.12, 0.35], [-1.12, 1.55], [-0.85, 2.0], [0.85, 2.0], [1.12, 1.55], [1.12, 0.35]].map(([x, y]) => new THREE.Vector3(x, y, -0.15)));
      R.add(new THREE.Mesh(new THREE.TubeGeometry(bridge, 80, 0.08, 16, false), new THREE.MeshPhysicalMaterial({ color:0xf1ece0, transparent:true, opacity:0.55, roughness:0.2, clearcoat:0.8 })));
      const wm = gloss(0xc0392b, { roughness:0.4 }), wb = gloss(0x22272d, { roughness:0.4 });
      const A = [[-1.62, 1.85], [-1.62, 2.75], [-1.5, 2.85], [-0.45, 2.85]].map(([x, y]) => new THREE.Vector3(x, y, 0)), B = [[0.45, 2.85], [1.5, 2.85], [1.62, 2.75], [1.62, 1.85]].map(([x, y]) => new THREE.Vector3(x, y, 0));
      [[A, wb], [B, wm]].forEach(([pts, m]) => { const cr = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.05); R.add(new THREE.Mesh(new THREE.TubeGeometry(cr, 40, 0.022, 8, false), m)); });
      [-1.62, 1.62].forEach(x => { const cl = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.12), metal(0x8a6a3a)); cl.position.set(x, 1.86, 0); R.add(cl); });
      path = new THREE.CurvePath(); [...A, ...B].forEach((p, i, arr) => { if (i) path.add(new THREE.LineCurve3(arr[i - 1], p)); });
      const vm = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.62, 0.22), gloss(0xf2c230, { roughness:0.45 })); vm.position.set(0, 2.88, 0); R.add(vm);
      const c = document.createElement('canvas'); c.width = 256; c.height = 128; scrTx = new THREE.CanvasTexture(c); scrTx.encoding = THREE.sRGBEncoding;
      screen = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 0.34), new THREE.MeshBasicMaterial({ map:scrTx, toneMapped:false })); screen.position.set(0, 2.92, 0.111); R.add(screen);
      const vl = textSprite('voltmeter', { h:0.11, color:'#3a3a2a' }); vl.position.set(0, 2.66, 0.12); R.add(vl);
      R.add(cellG = new THREE.Group()); R.add(eG = new THREE.Group()); R.add(iG = new THREE.Group());
      const em = new THREE.MeshStandardMaterial({ color:0xffd23f, emissive:0x8a6a00, emissiveIntensity:0.6 }), sg = new THREE.SphereGeometry(0.045, 14, 10);
      for (let i = 0; i < 16; i++){ const s = new THREE.Mesh(sg, em); s.userData.u = i/16; eG.add(s); }
      const an = gloss(0x2fa84a), ca = gloss(0x8e44ad), ig = new THREE.SphereGeometry(0.05, 14, 10);
      for (let i = 0; i < 12; i++){ const s = new THREE.Mesh(ig, i % 2 ? ca : an); s.userData.u = i/12; s.userData.cat = i % 2 === 1; iG.add(s); } },
    update(dt, v){ const c = calc(), sp = clamp(Math.abs(c.E), 0, 3)*0.08, dir = (c.an === c.L && c.L !== c.R) || (c.L === c.R && P.cl < P.cr) ? 1 : -1; t += dt;
      eG.children.forEach(s => { s.userData.u = (s.userData.u + dir*sp*dt + 1) % 1; s.position.copy(path.getPointAt(s.userData.u)); s.position.z += 0.0; });
      iG.children.forEach(s => { const toCat = s.userData.cat ? 1 : -1; s.userData.u = (s.userData.u + toCat*dir*sp*0.5*dt + 1) % 1; s.position.copy(bridge.getPointAt(s.userData.u)); });
      if (sp > 0.001 && wear < 1){ wear = Math.min(1, wear + dt*0.012); cellG.children.forEach(m => { if (m.userData.side == null) return; const isAn = (m.userData.side < 0) === (dir > 0); m.scale.z = isAn ? 1 - 0.6*wear : 1 + 0.8*wear; m.scale.x = isAn ? 1 - 0.15*wear : 1; }); } } }));
  if (v) playButton($('gc_play'), v.anim); else $('gc_play').hidden = true;
  function drawSeries(){ const cv = $('gc_s'), { ctx, W, H } = prep(cv); readColors(); const c = calc(), x0 = 40, x1 = W - 30, X = e => x0 + (e + 3.2)/(3.2 + 1.8)*(x1 - x0), y = H*0.55;
    ctx.strokeStyle = C.muted; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
    ctx.font = `11px ${C.mono}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (let e = -3; e <= 1.5; e += 0.5){ ctx.fillStyle = C.muted; ctx.fillRect(X(e) - 0.5, y, 1, 5); ctx.fillText(fmt(e, 1), X(e), y + 14); }
    ctx.fillText('standard reduction potential E° [V]', (x0 + x1)/2, H - 10);
    const all = Object.entries(MET).map(([s, m]) => [s, m[1]]).concat([['Li', -3.04], ['Na', -2.71], ['H₂', 0], ['Au', 1.50]]).sort((a, b) => a[1] - b[1]);
    all.forEach(([s, e], i) => { const on = s === c.an || s === c.cat, yy = y - 16 - (i % 3)*14; ctx.fillStyle = on ? (s === c.an ? C.rod : C.crank) : C.muted; ctx.font = `${on ? 700 : 400} 11.5px ${C.mono}`; ctx.fillText(s, X(e), yy); ctx.fillRect(X(e) - 1, y - 6, 2, 6); });
    if (c.L !== c.R){ const ya = y - 64; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(X(MET[c.an][1]), ya); ctx.lineTo(X(MET[c.cat][1]), ya); ctx.stroke();
      ctx.fillStyle = C.ink; ctx.font = `600 12px ${C.mono}`; ctx.fillText(`E°cell = ${fmt(c.E0, 2)} V`, (X(MET[c.an][1]) + X(MET[c.cat][1]))/2, ya - 10);
      [c.an, c.cat].forEach(s => { ctx.beginPath(); ctx.moveTo(X(MET[s][1]), ya - 5); ctx.lineTo(X(MET[s][1]), ya + 5); ctx.stroke(); }); }
    ctx.fillStyle = C.rod; ctx.font = `11px ${C.mono}`; ctx.textAlign = 'left'; ctx.fillText('easily oxidised (good reducing agents)', x0, 12); ctx.fillStyle = C.crank; ctx.textAlign = 'right'; ctx.fillText('easily reduced (good oxidising agents)', x1, 12);
    info(); }
  [sl, sr].forEach(s => s.addEventListener('change', () => { build(); drawSeries(); }));
  watchSize($('gc_s'), drawSeries); onRedraw(drawSeries); build(); drawSeries();
  // Table 5.1
  const T = [['Li+ + e- -> Li', -3.04], ['K+ + e- -> K', -2.93], ['Ca^2+ + 2e- -> Ca', -2.87], ['Na+ + e- -> Na', -2.71], ['Mg^2+ + 2e- -> Mg', -2.37], ['Al^3+ + 3e- -> Al', -1.66], ['Zn^2+ + 2e- -> Zn', -0.76], ['Fe^2+ + 2e- -> Fe', -0.44],
    ['Cd^2+ + 2e- -> Cd', -0.40], ['Ni^2+ + 2e- -> Ni', -0.25], ['Sn^2+ + 2e- -> Sn', -0.14], ['Pb^2+ + 2e- -> Pb', -0.13], ['2H+ + 2e- -> H2', 0.00], ['Cu^2+ + 2e- -> Cu', 0.34], ['O2 + 2H2O + 4e- -> 4OH-', 0.40], ['Fe^3+ + e- -> Fe^2+', 0.77],
    ['Ag+ + e- -> Ag', 0.80], ['O2 + 4H+ + 4e- -> 2H2O', 1.23], ['Cl2 + 2e- -> 2Cl-', 1.36], ['Au^3+ + 3e- -> Au', 1.50], ['F2 + 2e- -> 2F-', 2.87], ['MnO4- + 8H+ + 5e- -> Mn^2+ + 4H2O', 1.51]].sort((a, b) => a[1] - b[1]);
  const h = Math.ceil(T.length/2); let rows = ''; for (let i = 0; i < h; i++){ const a = T[i], b = T[i + h]; rows += `<tr><td>${ce(a[0])}</td><td class="num">${a[1] > 0 ? '+' : ''}${a[1].toFixed(2)}</td><td>${b ? ce(b[0]) : ''}</td><td class="num">${b ? (b[1] > 0 ? '+' : '') + b[1].toFixed(2) : ''}</td></tr>`; }
  $('tab51').innerHTML = rows; }

example($('ex1'), { title:'Example 5.1: the Daniell cell', src:'standard cell potential',
  q:'Find the standard cell potential of a cell made from a zinc half-cell ({m:E^\\circ} = −0.76 V) and a copper half-cell ({m:E^\\circ} = +0.34 V), and name the anode.',
  inputs:[['ea', 'E° of zinc', -0.76, 'V'], ['ec', 'E° of copper', 0.34, 'V']],
  solve:v => { const an = v.ea < v.ec ? 'zinc' : 'copper', E = Math.abs(v.ec - v.ea);
    return [['The half-cell with the lower reduction potential is oxidised, so the anode is', an, true], [`E°cell = E°cathode − E°anode = ${Math.max(v.ea, v.ec)} − (${Math.min(v.ea, v.ec)}) =`, `${fmt(E, 2)} V`, true], ['The energy available per mole of zinc is ΔG° = −nFE° = −2 × 96 485 × ' + fmt(E, 2) + ' =', `${fmt(-2*F_C*E/1000, 0)} kJ`]]; } });
example($('ex2'), { title:'Example 5.2: cell potential at non-standard concentrations', src:'Example 10.5 in the notes',
  q:'Find the potential at 25 °C of a cell built from the half-reactions {ce:Cd^2+ + 2e- -> Cd} ({m:E^\\circ} = −0.40 V) and {ce:Pb^2+ + 2e- -> Pb} ({m:E^\\circ} = −0.13 V), with {ce:Cd^2+} at 0.02 M and {ce:Pb^2+} at 0.20 M.',
  inputs:[['ea', 'E° of Cd²⁺/Cd', -0.40, 'V'], ['ec', 'E° of Pb²⁺/Pb', -0.13, 'V'], ['ca', '[Cd²⁺]', 0.02, 'M'], ['cc', '[Pb²⁺]', 0.20, 'M'], ['T', 'Temperature', 298, 'K']],
  solve:v => { const E0 = v.ec - v.ea, Q = v.ca/v.cc, k = 2.303*R_G*v.T/(2*F_C), E = E0 - k*lg(Q);
    return [['Cadmium has the lower E°, so it is the anode: {ce:Pb^2+(aq) + Cd(s) -> Cd^2+(aq) + Pb(s)}, n = 2', ''], [`E°cell = ${v.ec} − (${v.ea}) =`, `${fmt(E0, 2)} V`],
      [`Q = [Cd²⁺]/[Pb²⁺] = ${v.ca}/${v.cc} =`, fmt(Q, 3)], [`2.303RT/(nF) = ${fmt(k, 4)} V`, ''], [`E = ${fmt(E0, 2)} − ${fmt(k, 4)} × log(${fmt(Q, 3)}) =`, `${fmt(E, 3)} V`, true],
      ['The solid electrodes do not appear in Q. A low concentration of the product ion and a high concentration of the reactant ion push the voltage above the standard value.', '']]; } });

/* ================= 5.5 electroplating ================= */
{ const PL = { Ag:['silver', 1, 107.87, 10.49, '#d9dde2', 'AgNO₃'], Cu:['copper', 2, 63.55, 8.96, '#c8743f', 'CuSO₄'], Ni:['nickel', 2, 58.69, 8.91, '#b3ad98', 'NiSO₄'], Zn:['zinc', 2, 65.38, 7.14, '#9aa4ae', 'ZnSO₄'], Cr:['chromium', 6, 52.00, 7.19, '#c7ccd6', 'CrO₃ (Cr⁶⁺)'], Au:['gold', 1, 196.97, 19.3, '#d4af37', 'KAu(CN)₂'] };
  let cur = 'Ag', t = 0; const cv = $('ep'), P = {}, chips = $('ep_chips');
  chips.innerHTML = Object.keys(PL).map(k => `<button type="button" data-k="${k}" aria-pressed="${k === cur}">${PL[k][0]}</button>`).join('');
  chips.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; cur = b.dataset.k; chips.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b)); info(); });
  controls($('ep_c'), [['I', 'Current I', 0.1, 10, 0.1, 2, 'A'], ['t', 'Time t', 1, 240, 1, 30, 'min'], ['A', 'Area of the part', 1, 500, 1, 100, 'cm²']], P, info);
  const res = () => { const p = PL[cur], q = P.I*P.t*60, ne = q/F_C, m = ne/p[1]*p[2], th = m/p[3]/P.A*1e4; return { p, q, ne, m, th, cd:P.I/(P.A/100) }; };
  function info(){ const r = res();
    $('ep_t').textContent = `Electroplating with ${r.p[0]}`;
    $('ep_sub').textContent = `m = I t M/(n F) = ${P.I} × ${P.t*60} × ${r.p[2]}/(${r.p[1]} × 96 485)`;
    $('ep_st').innerHTML = statsHTML([['Charge q = I t', `${fmt(r.q, 0)} C`], ['Electrons', `${fmt(r.ne, 4)} mol`], ['Mass deposited', `${fmt(r.m, 3)} g`], ['Average thickness', `${fmt(r.th, 2)} μm`], ['Current density', `${fmt(r.cd, 2)} A/dm²`, r.cd > 8 ? 'bad' : '']]);
    $('ep_cap').innerHTML = `The part is the cathode; ${cur === 'Cr' || cur === 'Au' ? 'an inert or' : 'a ' + r.p[0]} anode completes the circuit in ${r.p[5]} solution. Each ${cur} ion needs ${r.p[1]} electron${r.p[1] > 1 ? 's' : ''}. ${cur === 'Cr' ? 'Chromium plating from Cr(VI) baths has a current efficiency of only about 15 to 25 %, so in practice it needs four to six times the charge calculated here.' : 'This assumes 100 % current efficiency; real baths reach 95 to 99 % for this metal.'} ${r.cd > 8 ? 'This current density is high for most baths: the deposit would be rough or burnt at the edges.' : 'Typical decorative coatings are 0.5 to 25 μm thick.'}`; }
  function draw(){ const { ctx, W, H } = prep(cv); readColors(); const r = res(), x0 = W*0.15, x1 = W*0.85, yT = H*0.3, yB = H - 24, ax = x0 + (x1 - x0)*0.18, cx = x0 + (x1 - x0)*0.78, f = clamp(r.th/30, 0, 1)*Math.min(1, (t % 12)/8);
    ctx.fillStyle = alpha('#9ec5e8', 0.35); ctx.fillRect(x0, yT + 20, x1 - x0, yB - yT - 20); ctx.strokeStyle = C.muted; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, yT); ctx.lineTo(x0, yB); ctx.lineTo(x1, yB); ctx.lineTo(x1, yT); ctx.stroke();
    // anode and part
    const am = cur === 'Cr' || cur === 'Au' ? '#7d858f' : r.p[4]; ctx.fillStyle = am; ctx.fillRect(ax - 9 + 4*f, yT - 10, 18 - 8*f, yB - yT - 20);
    ctx.fillStyle = '#6d6f73'; ctx.beginPath(); ctx.arc(cx, yT + (yB - yT)*0.5, 34, 0, 7); ctx.fill(); ctx.fillRect(cx - 5, yT - 10, 10, (yB - yT)*0.5 - 20);
    ctx.strokeStyle = r.p[4]; ctx.lineWidth = 2 + 8*f; ctx.beginPath(); ctx.arc(cx, yT + (yB - yT)*0.5, 34 + 1 + 4*f, 0, 7); ctx.stroke(); ctx.lineWidth = 1;
    ctx.fillStyle = C.ink; ctx.font = `12px ${C.mono}`; ctx.textAlign = 'center'; ctx.fillText('anode (+)', ax, yB + 14); ctx.fillText('part to plate, cathode (−)', cx, yB + 14);
    // power supply and wires
    const bx = W/2, by = 26; ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ax, yT - 10); ctx.lineTo(ax, by); ctx.lineTo(bx - 40, by); ctx.moveTo(bx + 40, by); ctx.lineTo(cx, by); ctx.lineTo(cx, yT - 10); ctx.stroke();
    ctx.fillStyle = C.sheet; ctx.fillRect(bx - 40, by - 14, 80, 28); ctx.strokeRect(bx - 40, by - 14, 80, 28); ctx.fillStyle = C.ink; ctx.textBaseline = 'middle'; ctx.fillText(`${fmt(P.I, 1)} A`, bx, by); ctx.lineWidth = 1;
    ctx.fillText('+', bx - 52, by - 10); ctx.fillText('−', bx + 52, by - 10);
    // electrons from anode up and over to the part; metal ions across the bath
    const sp = 0.25 + P.I*0.08; for (let i = 0; i < 10; i++){ const u = ((t*sp + i/10) % 1), L1 = yT - 10 - by, L2 = bx - 40 - ax, L3 = cx - bx - 40, L4 = yT - 10 - by, Lt = L1 + L2 + L3 + L4; let d = u*Lt, x, y;
      if (d < L1){ x = ax; y = yT - 10 - d; } else if ((d -= L1) < L2){ x = ax + d; y = by; } else if ((d -= L2) < L3){ x = bx + 40 + d; y = by; } else { d -= L3; x = cx; y = by + d; }
      if (x > bx - 40 && x < bx + 40) continue; ctx.fillStyle = '#e0b000'; ctx.beginPath(); ctx.arc(x, y, 3, 0, 7); ctx.fill(); }
    for (let i = 0; i < 18; i++){ const u = ((t*sp*0.6 + i*0.137) % 1), x = ax + 14 + u*(cx - 48 - ax - 14), y = yT + 40 + ((i*53) % (yB - yT - 70)); ctx.fillStyle = r.p[4]; ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.arc(x, y, 5, 0, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = C.ink; ctx.font = `9px ${C.mono}`; ctx.fillText('+', x, y); }
    ctx.font = `12px ${C.mono}`; ctx.fillStyle = C.muted; ctx.fillText(`${cur} ions drift to the part and take up electrons`, (x0 + x1)/2, yT + 8); }
  animate(cv, dt => { t += dt; draw(); }); watchSize(cv, draw); onRedraw(draw); info(); draw(); }

example($('ex3'), { title:'Example 5.3: time to plate copper', src:'Example 10.7 in the notes',
  q:'How long does it take to plate 5.0 g of copper onto a metal key from copper nitrate solution with a current of 1 A?',
  inputs:[['m', 'Mass of copper', 5.0, 'g'], ['M', 'Molar mass of copper', 63.55, 'g/mol'], ['n', 'Electrons per ion', 2, ''], ['I', 'Current', 1, 'A']],
  solve:v => { const mol = v.m/v.M, ne = v.n*mol, q = ne*F_C, t = q/v.I;
    return [['{ce:Cu^2+(aq) + 2e- -> Cu(s)}: 2 mol of electrons per mole of copper', ''], ['Copper: ' + v.m + ' g / ' + v.M + ' g/mol =', `${fmt(mol, 4)} mol`], ['Electrons: ' + v.n + ' × ' + fmt(mol, 4) + ' =', `${fmt(ne, 4)} mol (faradays)`],
      ['Charge q = n F =', `${fmt(q, 0)} C`], ['Time t = q/I =', `${fmt(t, 0)} s = ${fmt(t/60, 1)} min`, true], ['The notes give 15 345 C and 255.8 min; 0.158 F × 96 485 C/F is 15 245 C, about 254 min (253 min without rounding).', '']]; } });

/* ================= 5.6 fuel cell ================= */
{ const cv = $('fc'), P = {}; let t = 0;
  controls($('fc_c'), [['i', 'Current density drawn', 0.02, 1.4, 0.01, 0.5, 'A/cm²']], P, info);
  const V = i => clamp(1.23 - 0.06*Math.log(1 + i/0.002) - 0.18*i - 0.06*Math.exp(4*(i - 1.35)), 0, 1.23);
  function info(){ const v = V(P.i); $('fc_sub').textContent = `${fmt(v, 2)} V per cell, ${fmt(v*P.i, 2)} W/cm²`;
    $('fc_cap').innerHTML = `At ${P.i} A/cm² each cell gives ${fmt(v, 2)} V and ${fmt(v*P.i, 2)} W per cm² of membrane. Efficiency against the heating value of hydrogen is about V/1.48 = ${fmt(100*v/1.48, 0)} %. Drawing more current lowers the voltage (activation, resistance and gas-supply losses), so power peaks and then falls. A car stack of about 370 cells in series gives roughly 300 V.`; }
  function draw(){ const { ctx, W, H } = prep(cv); readColors(); const v = V(P.i), sp = 0.15 + P.i*0.35, y0 = 104, y1 = H - 34, xm = W/2, xa = xm - 60, xc = xm + 60;
    ctx.fillStyle = alpha('#9ec5e8', 0.25); ctx.fillRect(30, y0, xa - 40, y1 - y0); ctx.fillStyle = alpha('#f2b5a0', 0.25); ctx.fillRect(xc + 10, y0, W - 30 - xc - 10, y1 - y0);
    ctx.fillStyle = '#4b535c'; ctx.fillRect(xa - 10, y0, 12, y1 - y0); ctx.fillRect(xc - 2, y0, 12, y1 - y0); ctx.fillStyle = alpha('#e6c84a', 0.6); ctx.fillRect(xa + 2, y0, xc - xa - 4, y1 - y0);
    ctx.font = `12px ${C.mono}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = C.ink;
    ctx.textAlign = 'right'; ctx.fillText('anode (−)', xa + 2, y1 + 16); ctx.textAlign = 'center'; ctx.fillText('membrane', xm, y1 + 30); ctx.textAlign = 'left'; ctx.fillText('cathode (+)', xc - 2, y1 + 16); ctx.textAlign = 'center'; ctx.fillText('H₂ in', 60, y0 + 14); ctx.fillText('O₂ (air) in', W - 70, y0 + 14); ctx.fillText('H₂O out', W - 70, y1 - 12);
    // external circuit and lamp
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(xa - 4, y0); ctx.lineTo(xa - 4, 30); ctx.lineTo(xm - 18, 30); ctx.moveTo(xm + 18, 30); ctx.lineTo(xc + 4, 30); ctx.lineTo(xc + 4, y0); ctx.stroke(); ctx.lineWidth = 1;
    const glow = clamp(v*P.i*2, 0, 1); const g = ctx.createRadialGradient(xm, 30, 2, xm, 30, 40); g.addColorStop(0, `rgba(255,214,80,${0.9*glow})`); g.addColorStop(1, 'rgba(255,214,80,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(xm, 30, 40, 0, 7); ctx.fill();
    ctx.strokeStyle = C.ink; ctx.fillStyle = C.sheet; ctx.beginPath(); ctx.arc(xm, 30, 16, 0, 7); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(xm - 9, 37); ctx.lineTo(xm - 4, 24); ctx.lineTo(xm, 34); ctx.lineTo(xm + 4, 24); ctx.lineTo(xm + 9, 37); ctx.stroke();
    // particles
    for (let i = 0; i < 8; i++){ const u = (t*sp*0.7 + i/8) % 1, x = 40 + u*(xa - 60), y = y0 + 30 + ((i*37) % (y1 - y0 - 50)); ctx.fillStyle = '#e8e8e8'; ctx.strokeStyle = C.ink; [0, 9].forEach(o => { ctx.beginPath(); ctx.arc(x + o, y, 5, 0, 7); ctx.fill(); ctx.stroke(); }); }
    for (let i = 0; i < 8; i++){ const u = (t*sp + i/8) % 1, x = xa + u*(xc - xa), y = y0 + 20 + ((i*47) % (y1 - y0 - 40)); ctx.fillStyle = '#d8302c'; ctx.beginPath(); ctx.arc(x, y, 4, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = `8px ${C.mono}`; ctx.fillText('+', x, y); }
    const Lp = (y0 - 30)*2 + (xc - xa + 8); for (let i = 0; i < 10; i++){ let d = ((t*sp + i/10) % 1)*Lp, x, y; if (d < y0 - 30){ x = xa - 4; y = y0 - d; } else if ((d -= y0 - 30) < xc - xa + 8){ x = xa - 4 + d; y = 30; } else { d -= xc - xa + 8; x = xc + 4; y = 30 + d; }
      if (Math.abs(x - xm) < 18 && y < 50) continue; ctx.fillStyle = '#e0b000'; ctx.beginPath(); ctx.arc(x, y, 3.2, 0, 7); ctx.fill(); }
    for (let i = 0; i < 6; i++){ const u = (t*sp*0.5 + i/6) % 1, x = W - 40 - u*(W - 70 - xc - 20), y = y0 + 30 + ((i*41) % (y1 - y0 - 90)); ctx.fillStyle = '#d8302c'; ctx.strokeStyle = C.ink; [0, 9].forEach(o => { ctx.beginPath(); ctx.arc(x + o, y, 5, 0, 7); ctx.fill(); ctx.stroke(); }); }
    for (let i = 0; i < 5; i++){ const u = (t*sp*0.5 + i/5) % 1, x = xc + 24 + u*(W - 80 - xc), y = y1 - 30 + Math.sin(u*9 + i)*4; ctx.fillStyle = '#5b9be0'; ctx.beginPath(); ctx.arc(x, y, 5.5, 0, 7); ctx.fill(); }
    ctx.fillStyle = C.muted; ctx.font = `11px ${C.mono}`; ctx.fillText('electrons through the lamp', xm, 62); ctx.fillText('H⁺ through the membrane', xm, y0 - 10); }
  animate(cv, dt => { t += dt; draw(); }); watchSize(cv, draw); onRedraw(draw); info(); draw(); }

/* ================= 5.7 lithium-ion intercalation ================= */
{ const cv = $('li'); let mode = 'dis', t = 0; const N = 12;
  function draw(){ const { ctx, W, H } = prep(cv); readColors(); const xa0 = 40, xa1 = W*0.38, xc0 = W*0.62, xc1 = W - 40, y0 = 70, y1 = H - 30, ph = (t % 9)/7, k = clamp(ph, 0, 1);
    const LA = 6, rows = i => y0 + 14 + i*(y1 - y0 - 28)/(LA - 1);
    for (let i = 0; i < LA; i++){ ctx.fillStyle = '#3b3f45'; ctx.fillRect(xa0, rows(i) - 3, xa1 - xa0, 6); ctx.fillStyle = '#2f4f8a'; ctx.fillRect(xc0, rows(i) - 4, xc1 - xc0, 8); }
    ctx.strokeStyle = C.muted; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(W/2, y0); ctx.lineTo(W/2, y1); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = `12px ${C.mono}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = C.ink; ctx.fillText('graphite anode (C₆)', (xa0 + xa1)/2, y1 + 16); ctx.fillText('separator', W/2, y1 + 16); ctx.fillText('cobalt oxide cathode (CoO₂)', (xc0 + xc1)/2, y1 + 16);
    // ions: discharge moves them anode -> cathode
    for (let j = 0; j < N; j++){ const row = j % (LA - 1), col = Math.floor(j/(LA - 1)), ya = (rows(row) + rows(row + 1))/2, xa = xa0 + 30 + col*((xa1 - xa0 - 50)/2), xc = xc0 + 30 + col*((xc1 - xc0 - 50)/2);
      const s = clamp(k*N*1.0 - j*0.75, 0, 1), f = mode === 'dis' ? s : 1 - s, e = f*f*(3 - 2*f), x = xa + (xc - xa)*e, y = ya + Math.sin(e*PI)*((j % 2) ? -14 : 14);
      ctx.fillStyle = '#a77bd6'; ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.arc(x, y, 6, 0, 7); ctx.fill(); ctx.stroke(); }
    // external circuit
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo((xa0 + xa1)/2, y0); ctx.lineTo((xa0 + xa1)/2, 28); ctx.lineTo(W/2 - 50, 28); ctx.moveTo(W/2 + 50, 28); ctx.lineTo((xc0 + xc1)/2, 28); ctx.lineTo((xc0 + xc1)/2, y0); ctx.stroke(); ctx.lineWidth = 1;
    ctx.fillStyle = C.sheet; ctx.fillRect(W/2 - 50, 14, 100, 28); ctx.strokeRect(W/2 - 50, 14, 100, 28); ctx.fillStyle = C.ink; ctx.fillText(mode === 'dis' ? 'phone (load)' : 'charger', W/2, 28);
    const Lw = (y0 - 28)*2 + ((xc0 + xc1)/2 - (xa0 + xa1)/2); for (let i = 0; i < 8; i++){ let u = ((t*0.25 + i/8) % 1); if (mode === 'chg') u = 1 - u; let d = u*Lw, x, y; const xl = (xa0 + xa1)/2, xr = (xc0 + xc1)/2;
      if (d < y0 - 28){ x = xl; y = y0 - d; } else if ((d -= y0 - 28) < xr - xl){ x = xl + d; y = 28; } else { d -= xr - xl; x = xr; y = 28 + d; } if (Math.abs(x - W/2) < 50 && y < 44) continue; ctx.fillStyle = '#e0b000'; ctx.beginPath(); ctx.arc(x, y, 3.2, 0, 7); ctx.fill(); }
    $('li_sub').textContent = mode === 'dis' ? 'Li⁺ through the electrolyte, electrons through the device' : 'the charger pushes Li⁺ back into the graphite';
    $('li_cap').innerHTML = mode === 'dis' ? 'Discharge: lithium in the graphite gives up an electron (' + ce('LiC6 -> C6 + Li+ + e-') + '). The ion crosses the separator and slips between the cobalt oxide layers, where Co⁴⁺ takes the electron that came round the outside circuit and becomes Co³⁺.' : 'Charge: the charger forces electrons back to the graphite, and lithium ions leave the cobalt oxide and return between the graphite layers, ready for the next discharge. Nothing dissolves or plates out, which is why the cell survives hundreds of cycles.'; }
  segGroup(document.querySelector('#s7 .seg'), m => { mode = m; t = 0; draw(); });
  animate(cv, dt => { t += dt; draw(); }); watchSize(cv, draw); onRedraw(draw); draw(); }

/* ================= 5.7 battery pack ================= */
{ const cv = $('bpk'), P = {};
  controls($('bp_c'), [['v', 'Cell voltage (nominal)', 1.2, 3.7, 0.1, 3.6, 'V'], ['ah', 'Cell capacity', 0.5, 5, 0.1, 3.2, 'Ah'], ['s', 'Cells in series', 1, 120, 1, 96, ''], ['p', 'Cells in parallel', 1, 100, 1, 74, ''], ['g', 'Mass of one cell', 20, 80, 1, 47, 'g']], P, upd);
  function upd(){ const V = P.v*P.s, Ah = P.ah*P.p, E = V*Ah/1000, n = P.s*P.p, M = n*P.g/1000;
    $('bp_sub').textContent = `${P.s}s${P.p}p: ${n} cells`;
    $('bp_st').innerHTML = statsHTML([['Pack voltage', `${fmt(V, 1)} V`], ['Pack capacity', `${fmt(Ah, 1)} Ah`], ['Energy', `${fmt(E, 1)} kWh`], ['Cells', String(n)], ['Mass of the cells', `${fmt(M, 0)} kg`], ['Specific energy', `${fmt(E*1000/M, 0)} Wh/kg`]]);
    $('bp_cap').innerHTML = `Cells in series add their voltages (${P.s} × ${P.v} V = ${fmt(V, 1)} V); cells in parallel add their capacities (${P.p} × ${P.ah} Ah = ${fmt(Ah, 1)} Ah). Energy = V × Ah. A high pack voltage lowers the current for the same power, so cables and motor windings can be thinner. ${P.v <= 1.3 ? 'With NiMH cells (1.2 V) the same pack needs three times as many cells in series.' : ''}`; draw(); }
  function draw(){ const { ctx, W, H } = prep(cv); readColors(); const ms = Math.min(P.s, 48), mp = Math.min(P.p, 12), cw = Math.min(18, (W - 60)/ms), ch = Math.min(14, (H - 50)/mp), x0 = (W - ms*cw)/2, y0 = 24;
    for (let i = 0; i < ms; i++) for (let j = 0; j < mp; j++){ ctx.fillStyle = (i % 2) ? alpha(C.rod, 0.75) : alpha(C.rod, 0.55); ctx.beginPath(); ctx.arc(x0 + i*cw + cw/2, y0 + j*ch + ch/2, Math.min(cw, ch)*0.42, 0, 7); ctx.fill(); }
    ctx.fillStyle = C.muted; ctx.font = `11px ${C.mono}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(`${P.s} in series${P.s > ms ? ` (first ${ms} drawn)` : ''}`, W/2, 10); ctx.save(); ctx.translate(x0 - 14, y0 + mp*ch/2); ctx.rotate(-PI/2); ctx.fillText(`${P.p} in parallel${P.p > mp ? ` (${mp} drawn)` : ''}`, 0, 0); ctx.restore();
    ctx.fillText(`${fmt(P.v*P.s, 0)} V, ${fmt(P.v*P.s*P.ah*P.p/1000, 1)} kWh`, W/2, H - 10); }
  watchSize(cv, draw); onRedraw(draw); upd(); }

example($('ex4'), { title:'Example 5.4: an electric car battery', src:'batteries',
  q:'An electric car battery stores 85 kWh in 7104 lithium-ion cells of 3.6 V nominal, arranged as 96 groups in series. Find the pack voltage, the number of cells in parallel in each group, and the capacity of one cell.',
  inputs:[['E', 'Pack energy', 85, 'kWh'], ['n', 'Number of cells', 7104, ''], ['s', 'Groups in series', 96, ''], ['v', 'Cell voltage', 3.6, 'V']],
  solve:v => { const V = v.s*v.v, p = v.n/v.s, Ah = v.E*1000/V, cell = Ah/p;
    return [['Pack voltage = ' + v.s + ' × ' + v.v + ' V =', `${fmt(V, 1)} V`, true], ['Cells in parallel per group = ' + v.n + ' / ' + v.s + ' =', fmt(p, 1), true], ['Pack capacity = energy / voltage =', `${fmt(Ah, 0)} Ah`],
      ['Capacity of one cell =', `${fmt(cell, 2)} Ah`, true], ['Energy per cell = ' + fmt(v.E*1000/v.n, 1) + ' Wh. The notes call this an "85 kW" battery; energy is in kWh, while kW measures power.', '']]; } });

/* ================= quiz ================= */
quiz($('qz'), [
  { q:'In {ce:Zn(s) + Cu^2+(aq) -> Zn^2+(aq) + Cu(s)}, the oxidising agent is', o:['Zn', '{ce:Cu^2+}', '{ce:Zn^2+}', 'Cu'], a:1, why:'{ce:Cu^2+} takes electrons from zinc, so it oxidises zinc and is itself reduced.' },
  { q:'The oxidation state of manganese in {ce:KMnO4} is', o:['+2', '+4', '+7', '−1'], a:2, why:'K is +1 and four O are −8, so Mn must be +7 for the sum to be zero.' },
  { q:'In a galvanic cell the anode is where', o:['reduction occurs and it is positive', 'oxidation occurs and it is negative', 'metal is deposited', 'the salt bridge connects'], a:1, why:'Oxidation releases electrons at the anode, which makes it the negative terminal of a galvanic cell.' },
  { q:'A cell is made from Mg (E° = −2.37 V) and Ag (E° = +0.80 V). The standard cell potential is', o:['1.57 V', '3.17 V', '−3.17 V', '0.80 V'], a:1, why:'E°cell = 0.80 − (−2.37) = 3.17 V, with magnesium as the anode.' },
  { q:'The salt bridge is needed to', o:['carry electrons between the beakers', 'keep both solutions electrically neutral', 'raise the voltage', 'stop the reaction'], a:1, why:'Ions move through the bridge to balance the charge created by the electrode reactions; electrons go through the wire.' },
  { q:'Doubling the current while plating for the same time', o:['halves the mass deposited', 'doubles the mass deposited', 'leaves the mass unchanged', 'changes the metal deposited'], a:1, why:'By Faraday\'s first law m is proportional to q = It.' },
  { q:'A 12 V lead–acid car battery contains', o:['six 2 V cells in parallel', 'six 2 V cells in series', 'one 12 V cell', 'twelve 1 V cells in parallel'], a:1, why:'Series connection adds voltages: 6 × 2.1 V = 12.6 V.' },
  { q:'During discharge of a lithium-ion cell, lithium ions move', o:['from the graphite to the metal oxide', 'from the metal oxide to the graphite', 'through the external wire', 'nowhere; only electrons move'], a:0, why:'Lithium leaves the graphite anode, crosses the electrolyte and inserts into the oxide cathode, while electrons go round the outside circuit.' }]);
})();
