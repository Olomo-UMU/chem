/* BME 1104 interactive notes, Chapter 6: solids and material structure */
(() => {
'use strict';
const PI = Math.PI, S3 = Math.sqrt(3), S2 = Math.sqrt(2);

/* ================= 6.2 unit cells in 3D ================= */
{ const T = { // label, atoms per cell text, coordination, packing, relation, examples, caption
    sc:['Simple cubic', '8 × ⅛ = 1', '6', '0.52', 'a = 2r', 'polonium (the only element)', 'Atoms touch along the cube edges. Only 52 % of the space is filled, so almost no metal chooses this structure.'],
    bcc:['Body-centred cubic', '8 × ⅛ + 1 = 2', '8', '0.68', 'a = 4r/√3', 'α-iron (ferrite), Cr, W, Mo, Na, K', 'Atoms touch along the body diagonal. Iron is body-centred cubic below 912 °C; carbon dissolves in it only slightly.'],
    fcc:['Face-centred cubic', '8 × ⅛ + 6 × ½ = 4', '12', '0.74', 'a = 2√2 r', 'Cu, Al, Ni, Au, Ag, Pb, γ-iron (austenite)', 'Atoms touch along the face diagonals. This is a close-packed structure: 74 % of space is filled, the most possible for equal spheres. FCC metals stay ductile at low temperature.'],
    hcp:['Hexagonal close-packed', '12 × ⅙ + 2 × ½ + 3 = 6', '12', '0.74', 'c/a = 1.633', 'Mg, Ti, Zn, Co, Zr', 'The other close-packed stacking (ABAB instead of ABCABC). It has fewer easy slip planes than FCC, so HCP metals are less ductile at room temperature.'],
    nacl:['Sodium chloride (rock salt)', '4 Na⁺ + 4 Cl⁻', '6 : 6', '', 'a = 2(r₊ + r₋)', 'NaCl, MgO, FeO, KCl', 'An FCC lattice of chloride ions with sodium ions in all the octahedral holes (along the edges and at the centre). Each ion has six neighbours of the other kind.'],
    cscl:['Caesium chloride', '1 Cs⁺ + 1 Cl⁻', '8 : 8', '', 'a√3 = 2(r₊ + r₋)', 'CsCl, CsBr, NH₄Cl', 'Chloride ions at the corners and a caesium ion at the centre. Large cations of similar size to the anion prefer this eight-fold coordination. It is not body-centred cubic, because the centre and corner ions are different.'],
    diamond:['Diamond cubic', '8 × ⅛ + 6 × ½ + 4 = 8', '4', '0.34', 'a√3 = 8r', 'diamond, Si, Ge, grey tin', 'An FCC lattice with four more atoms in half the tetrahedral holes. Every atom has four covalent bonds at 109.5°. The open structure fills only 34 % of space, yet the bonds make diamond the hardest natural material.'],
    graphite:['Graphite', '4 per hexagonal cell', '3 (in the sheet)', '', 'C–C 142 pm, sheets 335 pm apart', 'graphite; hexagonal boron nitride is similar', 'Flat sheets of hexagonal rings stacked ABAB. Strong covalent bonds within each sheet, weak London forces between sheets: the sheets slide, so graphite is soft and a good lubricant, and it conducts along the sheets.'] };
  const KEYS = Object.keys(T); let cur = 'fcc', view = 'clip', grp = null; const chips = $('uc_chips');
  chips.innerHTML = KEYS.map(k => `<button type="button" data-k="${k}" aria-pressed="${k === cur}">${T[k][0]}</button>`).join('');
  const v = niceGL(view3d($('uc'), { cam:[3.4, 2.6, 4.6], fov:36, build(v){ v.R.localClippingEnabled = true; v.ctl.autoRotate = true; v.ctl.autoRotateSpeed = 0.9; v.root.add(grp = new THREE.Group()); } }));
  const MAT = {}, mat = (c, clip) => { const k = c + '|' + (clip ? 1 : 0); if (!MAT[k]) MAT[k] = gloss(c); return MAT[k]; };
  const edgeM = new THREE.MeshBasicMaterial({ color:0x2b3138 });
  function edges(pts, pairs, g){ pairs.forEach(([i, j]) => g.add(cylBetween(pts[i], pts[j], 0.012, edgeM, 6))); }
  function cubeEdges(g, s, o){ const P = []; for (const x of [0, 1]) for (const y of [0, 1]) for (const z of [0, 1]) P.push(new THREE.Vector3(x*s + o.x, y*s + o.y, z*s + o.z));
    const pr = []; for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++){ const d = P[i].distanceTo(P[j]); if (Math.abs(d - s) < 1e-6) pr.push([i, j]); } edges(P, pr, g); }
  function planesBox(h){ return [new THREE.Plane(new THREE.Vector3(1, 0, 0), h), new THREE.Plane(new THREE.Vector3(-1, 0, 0), h), new THREE.Plane(new THREE.Vector3(0, 1, 0), h), new THREE.Plane(new THREE.Vector3(0, -1, 0), h), new THREE.Plane(new THREE.Vector3(0, 0, 1), h), new THREE.Plane(new THREE.Vector3(0, 0, -1), h)]; }
  function build(){ if (!grp) return; clearMesh(grp); const s = 2, h = 1, g = grp, sg = new THREE.SphereGeometry(1, 40, 28);
    const ball = (p, r, c, clip) => { const m = new THREE.Mesh(sg, clip ? gloss(c, { clippingPlanes:clip }) : mat(c)); m.scale.setScalar(r); m.position.copy(p); g.add(m);
      if (clip){ const cut = new THREE.Mesh(sg, new THREE.MeshBasicMaterial({ color:new THREE.Color(c).multiplyScalar(0.55), side:THREE.BackSide, clippingPlanes:clip })); cut.scale.setScalar(r*0.999); cut.position.copy(p); g.add(cut); } return m; };
    if (['sc', 'bcc', 'fcc', 'nacl', 'cscl', 'diamond'].includes(cur)){
      const sites = cellSites(cur), R = { sc:[0.5], bcc:[S3/4], fcc:[S2/4], nacl:[0.18, 0.32], cscl:[0.424, 0.44], diamond:[S3/8] }[cur], COL = { nacl:[0x8e44ad, 0x2fa84a], cscl:[0xe0a020, 0x2fa84a] }[cur] || [cur === 'diamond' ? 0x3b3f45 : 0xc8743f];
      const n = view === 'block' ? 2 : 1, clip = view === 'clip' ? planesBox(h) : null, pts = view === 'pts';
      const all = []; for (let ix = 0; ix < n; ix++) for (let iy = 0; iy < n; iy++) for (let iz = 0; iz < n; iz++) sites.forEach(p => { const q = [p[0] + ix, p[1] + iy, p[2] + iz, p[3]]; if (!all.some(a => Math.abs(a[0] - q[0]) + Math.abs(a[1] - q[1]) + Math.abs(a[2] - q[2]) < 1e-6)) all.push(q); });
      const off = -n*s/2, P = q => new THREE.Vector3(q[0]*s + off, q[1]*s + off, q[2]*s + off);
      all.forEach(q => { const r = R[q[3]] || R[0]; ball(P(q), pts ? 0.09 : (cur === 'diamond' && view !== 'clip' ? r*s*0.55 : r*s), COL[q[3]] || COL[0], clip); });
      if (cur === 'diamond' && view !== 'clip'){ const bm = gloss(0xb8bec6); for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++){ const d = P(all[i]).distanceTo(P(all[j])); if (Math.abs(d - S3/4*s) < 1e-3) g.add(cylBetween(P(all[i]), P(all[j]), 0.05, bm, 12)); } }
      for (let ix = 0; ix < n; ix++) for (let iy = 0; iy < n; iy++) for (let iz = 0; iz < n; iz++) cubeEdges(g, s, new THREE.Vector3(off + ix*s, off + iy*s, off + iz*s));
      if (cur === 'nacl' || cur === 'cscl'){ const lab = [cur === 'nacl' ? 'Na⁺' : 'Cs⁺', 'Cl⁻']; [0, 1].forEach(k => { const q = all.find(a => a[3] === k); if (!q) return; const sp = textSprite(lab[k], { h:0.26, color:'#ffffff', depth:false }); sp.position.copy(P(q)); g.add(sp); }); } }
    else if (cur === 'hcp'){ const a = 1.2, c = 1.633*a, hx = []; for (let i = 0; i < 6; i++) hx.push([a*Math.cos(i*PI/3), a*Math.sin(i*PI/3)]);
      const n = view === 'block' ? 2 : 1, r = a/2, ps = [];
      for (let k = 0; k < n; k++){ const y0 = -c*n/2 + k*c; [0, 1].forEach(t => { const y = y0 + t*c; ps.push([0, y, 0]); hx.forEach(([x, z]) => ps.push([x, y, z])); });
        [0, 2, 4].forEach(i => { const ang = i*PI/3 + PI/6, rr = a/S3; ps.push([rr*Math.cos(ang), y0 + c/2, rr*Math.sin(ang)]); }); }
      const uniq = []; ps.forEach(p => { if (!uniq.some(u => Math.hypot(u[0] - p[0], u[1] - p[1], u[2] - p[2]) < 1e-6)) uniq.push(p); });
      let clip = null; if (view === 'clip'){ clip = []; for (let i = 0; i < 6; i++){ const ang = i*PI/3 + PI/6; clip.push(new THREE.Plane(new THREE.Vector3(-Math.cos(ang), 0, -Math.sin(ang)), a*S3/2)); } clip.push(new THREE.Plane(new THREE.Vector3(0, 1, 0), c*n/2), new THREE.Plane(new THREE.Vector3(0, -1, 0), c*n/2)); }
      uniq.forEach(p => ball(new THREE.Vector3(...p), view === 'pts' ? 0.09 : r, 0x8f99a6, clip));
      for (let k = 0; k <= n; k++){ const y = -c*n/2 + k*c, P = hx.map(([x, z]) => new THREE.Vector3(x, y, z)); edges(P, [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0]], g);
        if (k < n) hx.forEach(([x, z]) => g.add(cylBetween(new THREE.Vector3(x, y, z), new THREE.Vector3(x, y + c, z), 0.012, edgeM, 6))); } }
    else { // graphite: three sheets ABA, ball and stick
      const d = 0.42, sep = 0.335/0.142*d, cm = gloss(0x3b3f45), bm = gloss(0xb8bec6), atoms = [], N = view === 'block' ? 4 : 3;
      for (let L = 0; L < N; L++){ const y = (L - (N - 1)/2)*sep, shift = L % 2 ? d : 0, pts = [];
        for (let i = -5; i <= 5; i++) for (let j = -5; j <= 5; j++) [0, d].forEach(bx0 => { const x = (i + j)*1.5*d + bx0 + shift - d, z = (i - j)*S3/2*d; if (Math.hypot(x, z) < 1.7) pts.push(new THREE.Vector3(x, y, z)); });
        const uniq = []; pts.forEach(p => { if (!uniq.some(u => u.distanceTo(p) < 1e-4)) uniq.push(p); }); uniq.forEach(p => { ball(p, view === 'pts' ? 0.06 : 0.11, 0x3b3f45); atoms.push([L, p]); });
        for (let i = 0; i < uniq.length; i++) for (let j = i + 1; j < uniq.length; j++) if (Math.abs(uniq[i].distanceTo(uniq[j]) - d) < 1e-3) g.add(cylBetween(uniq[i], uniq[j], 0.035, bm, 10)); }
      const dm = new THREE.MeshBasicMaterial({ color:0x8a96a3 }); for (let L = 0; L < N - 1; L++){ const y0 = (L - (N - 1)/2)*sep; for (let k = 0; k < 8; k++){ const a = new THREE.Vector3(-1.2 + 0.15*0, y0 + k*sep/8 + 0.02, 1.5), b = a.clone(); b.y += sep/16; g.add(cylBetween(a, b, 0.012, dm, 6)); } } }
    v.render(); }
  function info(){ const t = T[cur];
    $('uc_t').textContent = `Unit cells in 3D: ${t[0].toLowerCase()}`;
    $('uc_sub').textContent = t[5];
    $('uc_st').innerHTML = statsHTML([['Particles per cell', t[1]], ['Coordination number', t[2]], ['Packing fraction', t[3] || 'n/a'], ['Geometry', t[4]]]);
    $('uc_cap').innerHTML = t[6]; }
  chips.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; cur = b.dataset.k; chips.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b)); build(); info(); });
  segGroup(document.querySelector('#s2 .seg'), m => { view = m; build(); });
  build(); info(); }

example($('ex1'), { title:'Example 6.1: density of copper from its unit cell', src:'density',
  q:'Copper is face-centred cubic with a cell edge a = 361.5 pm. Its molar mass is 63.55 g/mol. Find its density.',
  inputs:[['a', 'Cell edge a', 361.5, 'pm'], ['M', 'Molar mass', 63.55, 'g/mol'], ['n', 'Atoms per cell', 4, '']],
  solve:v => { const V = Math.pow(v.a*1e-10, 3), m = v.n*v.M/N_A, r = m/V;
    return [['FCC: n = 8 × ⅛ + 6 × ½ = 4 atoms per cell', ''], ['Cell volume a³ = (' + v.a + ' × 10⁻¹⁰ cm)³ =', `${sci(V, 4)} cm³`], ['Mass in the cell = n M / N_A =', `${sci(m, 4)} g`], ['Density ρ =', `${fmt(r, 2)} g/cm³`, true],
      ['The handbook value is 8.96 g/cm³. Atomic radius r = a√2/4 = ' + fmt(v.a*S2/4, 1) + ' pm.', '']]; } });
example($('ex2'), { title:'Example 6.2: density of iron and of sodium chloride', src:'density',
  q:'(a) α-iron is body-centred cubic with atomic radius 124.1 pm (M = 55.85 g/mol). (b) Sodium chloride has a = 564 pm with four NaCl units per cell (M = 58.44 g/mol). Find both densities.',
  inputs:[['r', 'Radius of an iron atom', 124.1, 'pm'], ['M1', 'Molar mass of Fe', 55.85, 'g/mol'], ['a2', 'Cell edge of NaCl', 564, 'pm'], ['M2', 'Molar mass of NaCl', 58.44, 'g/mol']],
  solve:v => { const a = 4*v.r/S3, r1 = 2*v.M1/N_A/Math.pow(a*1e-10, 3), r2 = 4*v.M2/N_A/Math.pow(v.a2*1e-10, 3);
    return [['(a) BCC: atoms touch along the body diagonal, a√3 = 4r, so a =', `${fmt(a, 1)} pm`], ['n = 2: ρ = 2 × ' + v.M1 + ' / (6.022 × 10²³ × (' + fmt(a, 1) + ' × 10⁻¹⁰)³) =', `${fmt(r1, 2)} g/cm³`, true],
      ['(b) NaCl: n = 4 formula units: ρ = 4 × ' + v.M2 + ' / (6.022 × 10²³ × (' + v.a2 + ' × 10⁻¹⁰)³) =', `${fmt(r2, 2)} g/cm³`, true], ['Handbook values: iron 7.87 g/cm³, sodium chloride 2.17 g/cm³.', '']]; } });

/* ================= 6.3 melting point and ionic bond strength ================= */
{ const cv = $('mp'), R = { Li:76, Na:102, K:138, Cs:167, Mg:72, Ca:100, Sr:118, Ba:135, Al:54, F:133, Cl:181, Br:196, I:220, O:140 }, Q = { Li:1, Na:1, K:1, Cs:1, Mg:2, Ca:2, Sr:2, Ba:2, Al:3, F:1, Cl:1, Br:1, I:1, O:2 };
  const D = [['NaF', 'Na', 'F', 996], ['NaCl', 'Na', 'Cl', 801], ['NaBr', 'Na', 'Br', 747], ['NaI', 'Na', 'I', 661], ['LiF', 'Li', 'F', 845], ['KF', 'K', 'F', 858], ['KCl', 'K', 'Cl', 770], ['CsCl', 'Cs', 'Cl', 645], ['KI', 'K', 'I', 681],
    ['MgO', 'Mg', 'O', 2852], ['CaO', 'Ca', 'O', 2613], ['SrO', 'Sr', 'O', 2531], ['BaO', 'Ba', 'O', 1923], ['MgF₂', 'Mg', 'F', 1263], ['CaF₂', 'Ca', 'F', 1418], ['Al₂O₃', 'Al', 'O', 2072]];
  function draw(){ readColors(); const pts = D.map(([f, a, b, m]) => ({ x:Q[a]*Q[b]/(R[a] + R[b])*100, y:m, color:Q[a]*Q[b] > 1 ? C.crank : C.rod, r:5, label:f, f, a, b }));
    plot(cv, { xmin:0.2, xmax:3.4, ymin:0, ymax:3100, xlab:'q₁q₂ / (r₊ + r₋)  [charge units per 100 pm]', ylab:'melting point [°C]', points:pts, legend:[{ color:C.rod, label:'charges ±1' }, { color:C.crank, label:'larger charges' }] }); }
  hoverPoints(cv, p => { if (!p) return; $('mp_cap').innerHTML = `${p.f}: ions ${p.a} (${R[p.a]} pm, charge ${Q[p.a]}+) and ${p.b} (${R[p.b]} pm, charge ${Q[p.b]}−), bond length ${R[p.a] + R[p.b]} pm, melts at ${p.y} °C.`; });
  watchSize(cv, draw); onRedraw(draw); draw(); }

/* ================= 6.3 shifting a plane ================= */
{ const cv = $('clv'), P = {}; let kind = 'ion';
  controls($('clv_c'), [['s', 'Shift of the upper half', 0, 1, 0.01, 0, 'spacings']], P, draw);
  function draw(){ const { ctx, W, H } = prep(cv); readColors(); const nx = 14, ny = 6, d = Math.min((W - 40)/nx, (H - 40)/ny), x0 = (W - (nx - 1)*d)/2, y0 = (H - (ny - 1)*d)/2, sh = P.s*d;
    if (kind === 'met'){ ctx.fillStyle = alpha('#e0b000', 0.12); ctx.fillRect(x0 - d/2, y0 - d/2, (nx)*d, ny*d); }
    let bad = 0; for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++){ const up = j < ny/2, x = x0 + i*d + (up ? sh : 0), y = y0 + j*d; if (x > x0 + (nx - 0.5)*d) continue;
      const pos = (i + j) % 2 === 0, r = kind === 'ion' ? (pos ? d*0.26 : d*0.4) : d*0.42;
      ctx.fillStyle = kind === 'ion' ? (pos ? '#8e44ad' : '#2fa84a') : '#c8743f'; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = `600 ${Math.max(9, d*0.32)}px ${C.mono}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(kind === 'ion' ? (pos ? '+' : '−') : '+', x, y);
      if (kind === 'ion' && j === ny/2 - 1){ const below = (i + j + 1) % 2 === 0; if (P.s > 0.75 && pos === below) bad++; } }
    if (kind === 'met'){ for (let k = 0; k < 40; k++){ const x = x0 - d/2 + ((k*97.3 + performance.now()*0.03) % (nx*d)), y = y0 - d/2 + ((k*53.7) % (ny*d)); ctx.fillStyle = '#e0b000'; ctx.beginPath(); ctx.arc(x, y, 2.2, 0, 7); ctx.fill(); } }
    const yc = y0 + (ny/2 - 0.5)*d; ctx.strokeStyle = C.muted; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(x0 - d/2, yc); ctx.lineTo(x0 + (nx - 0.5)*d, yc); ctx.stroke(); ctx.setLineDash([]);
    if (kind === 'ion' && P.s > 0.75){ ctx.strokeStyle = C.bad; ctx.lineWidth = 2; for (let i = 0; i < nx; i += 2){ const x = x0 + i*d + sh/2; ctx.beginPath(); ctx.moveTo(x - 6, yc - 6); ctx.lineTo(x + 6, yc + 6); ctx.moveTo(x + 6, yc - 6); ctx.lineTo(x - 6, yc + 6); ctx.stroke(); } ctx.lineWidth = 1; }
    $('cl_t').textContent = kind === 'ion' ? 'Shifting a plane of ions' : 'Shifting a plane of metal atoms';
    $('cl_sub').textContent = `shift ${fmt(P.s, 2)} of a spacing`;
    $('clv_cap').innerHTML = kind === 'ion' ? (P.s < 0.3 ? 'Each ion is still next to ions of opposite charge across the dashed plane.' : P.s < 0.75 ? 'Halfway: the attraction across the plane weakens.' : 'Now like charges face each other across the plane (marked ×). They repel, and the crystal splits cleanly along the plane: cleavage. This is why ionic crystals and ceramics are brittle.')
      : 'Every metal ion is the same, and the electron sea holds them together whatever their positions. After the shift the crystal is bonded just as before, so the metal deforms plastically instead of breaking: it is malleable and ductile.'; }
  segGroup(document.querySelector('#s3 .seg'), m => { kind = m; draw(); });
  animate(cv, () => { if (kind === 'met') draw(); }); watchSize(cv, draw); onRedraw(draw); draw(); }

/* ================= 6.6 metals across the table ================= */
{ const cv = $('mt'); let mode = 'mp';
  const P4 = ['K', 'Ca', 'Sc', 'Ti', 'V', 'Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn'], P5 = ['Rb', 'Sr', 'Y', 'Zr', 'Nb', 'Mo', 'Tc', 'Ru', 'Rh', 'Pd', 'Ag', 'Cd'], P6 = ['Cs', 'Ba', 'La', 'Hf', 'Ta', 'W', 'Re', 'Os', 'Ir', 'Pt', 'Au', 'Hg'];
  const MP = { 4:[63, 842, 1541, 1668, 1910, 1907, 1246, 1538, 1495, 1455, 1085, 420], 5:[39, 777, 1526, 1855, 2477, 2623, 2157, 2334, 1964, 1555, 962, 321], 6:[28, 727, 920, 2233, 3017, 3422, 3186, 3033, 2446, 1768, 1064, -39] };
  const EC = { 4:[13.9, 29.8, 1.8, 2.5, 5.0, 7.9, 0.69, 10.0, 17.2, 14.3, 59.6, 16.9], 5:[8.3, 7.6, 1.8, 2.4, 6.6, 18.7, 6.7, 14.1, 23.3, 9.5, 63.0, 13.8], 6:[4.8, 2.9, 1.6, 3.3, 7.6, 18.9, 5.6, 12.3, 21.3, 9.4, 45.2, 1.0] };
  const G = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], NM = { 4:P4, 5:P5, 6:P6 };
  function draw(){ readColors(); const D = mode === 'mp' ? MP : EC, cols = { 4:C.rod, 5:C.ok, 6:C.crank }, pts = [];
    [4, 5, 6].forEach(p => D[p].forEach((y, i) => pts.push({ x:G[i], y, color:cols[p], r:4, label:(mode === 'mp' && i === 5) || (mode === 'ec' && i === 10) ? NM[p][i] : '', el:NM[p][i], per:p })));
    plot(cv, { xmin:0.5, xmax:12.5, ymin:mode === 'mp' ? -100 : 0, ymax:mode === 'mp' ? 3600 : 70, xlab:'group', ylab:mode === 'mp' ? 'melting point [°C]' : 'electrical conductivity [MS/m]', xfmt:v => Number.isInteger(v) ? String(v) : '',
      series:[4, 5, 6].map(p => ({ x:G, y:D[p], color:cols[p], w:2 })), points:pts, legend:[{ color:C.rod, label:'period 4 (K to Zn)' }, { color:C.ok, label:'period 5 (Rb to Cd)' }, { color:C.crank, label:'period 6 (Cs to Hg)' }] });
    $('mt_t').textContent = mode === 'mp' ? 'Melting points of the metals across the periodic table' : 'Electrical conductivity of the metals across the periodic table';
    $('mt_cap').innerHTML = mode === 'mp' ? 'Melting points rise to a peak at group 6 (Cr, Mo, W), where the d and s subshells are about half full and the most electrons take part in bonding, then fall towards groups 11 and 12, whose d subshells are full. Tungsten (3422 °C) is used for lamp filaments and rocket nozzles; mercury is liquid.' : 'Conductivity peaks sharply at group 11: copper, silver and gold each have one easily delocalised s electron outside a full d subshell. This is why copper is used for wiring, with silver and gold for contacts. Manganese and the early transition metals conduct poorly.'; }
  hoverPoints(cv, p => { if (!p) return; $('mt_cap').innerHTML = `${EL_NAME[EL_SYM.indexOf(p.el)]} (${p.el}), group ${p.x}, period ${p.per}: ${mode === 'mp' ? `melts at ${p.y} °C` : `${p.y} × 10⁶ S/m`}.`; });
  segGroup(document.querySelector('#s6 .seg'), m => { mode = m; draw(); });
  watchSize(cv, draw); onRedraw(draw); draw(); }

/* ================= 6.6 alloys ================= */
{ const cv = $('al'); let kind = 'pure';
  function draw(){ const { ctx, W, H } = prep(cv); readColors(); const nx = 16, ny = 6, d = Math.min((W - 40)/nx, (H - 30)/ny), x0 = (W - (nx - 1)*d)/2 - d*0.25, y0 = (H - (ny - 1)*d*0.87)/2;
    let rnd = 7; const R = () => (rnd = (rnd*16807) % 2147483647)/2147483647;
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++){ const x = x0 + i*d + (j % 2 ? d/2 : 0), y = y0 + j*d*0.87, zn = kind === 'sub' && R() < 0.33;
      ctx.fillStyle = kind === 'int' ? '#8f99a6' : zn ? '#9aa4ae' : '#c8743f'; ctx.strokeStyle = alpha(C.ink, 0.4); ctx.beginPath(); ctx.arc(x, y, d*(zn ? 0.47 : 0.45), 0, 7); ctx.fill(); ctx.stroke();
      if (kind === 'int' && R() < 0.12 && i < nx - 1 && j < ny - 1){ ctx.fillStyle = '#2b2b2b'; ctx.beginPath(); ctx.arc(x + d/2, y + d*0.29, d*0.14, 0, 7); ctx.fill(); } }
    $('al_t').textContent = { pure:'Alloy structures: pure copper', sub:'Alloy structures: brass', int:'Alloy structures: carbon steel' }[kind];
    $('al_cap').innerHTML = { pure:'Identical atoms in regular rows. Planes of atoms slip easily past one another, so pure copper is soft and ductile.', sub:'Zinc atoms (grey) take the places of about a third of the copper atoms. They are slightly larger, so they distort the rows and make slip harder: brass is stronger and harder than copper, and casts and machines well.', int:'Small carbon atoms (black) squeeze into the gaps between the iron atoms. Each one strains the lattice around it and pins the planes against slip. Steel with 0.2 % carbon is several times stronger than pure iron; with 0.8 % or more it becomes hard enough for tools.' }[kind]; }
  segGroup(document.querySelector('#s6 .panel:nth-of-type(2) .seg') || document.querySelectorAll('#s6 .seg')[1], m => { kind = m; draw(); });
  watchSize(cv, draw); onRedraw(draw); draw(); }

/* ================= 6.7 crystal and glass ================= */
{ const cs = $('gls'), cc = $('glc'); let kind = 'c';
  function net(){ const { ctx, W, H } = prep(cs); readColors(); const d = 34, nx = Math.floor((W - 30)/(d*1.5)), ny = Math.floor((H - 40)/(d*0.87*2)), si = [];
    let rnd = 11; const R = () => (rnd = (rnd*16807) % 2147483647)/2147483647;
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++){ let x = 20 + i*d*1.5 + d*0.5, y = 24 + j*d*1.73 + (i % 2 ? d*0.87 : 0); if (kind === 'g'){ x += (R() - 0.5)*d*0.7; y += (R() - 0.5)*d*0.7; } si.push([x, y]); }
    const links = []; for (let a = 0; a < si.length; a++) for (let b = a + 1; b < si.length; b++){ const dd = Math.hypot(si[a][0] - si[b][0], si[a][1] - si[b][1]); if (dd < d*1.95 && dd > d*0.6) links.push([a, b, dd]); }
    const deg = si.map(() => 0); links.sort((p, q) => p[2] - q[2]).forEach(l => { if (deg[l[0]] < 3 && deg[l[1]] < 3){ deg[l[0]]++; deg[l[1]]++; l.ok = true; } });
    links.filter(l => l.ok).forEach(([a, b]) => { const mx = (si[a][0] + si[b][0])/2, my = (si[a][1] + si[b][1])/2; ctx.strokeStyle = alpha(C.muted, 0.6); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(si[a][0], si[a][1]); ctx.lineTo(si[b][0], si[b][1]); ctx.stroke(); ctx.fillStyle = '#d8302c'; ctx.beginPath(); ctx.arc(mx, my, 5, 0, 7); ctx.fill(); });
    si.forEach(([x, y]) => { ctx.fillStyle = '#c9b28a'; ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.arc(x, y, 7, 0, 7); ctx.fill(); ctx.stroke(); });
    ctx.fillStyle = C.muted; ctx.font = `12px ${C.mono}`; ctx.textAlign = 'left'; ctx.fillText('Si (tan), O (red)', 10, H - 10); }
  function curve(){ readColors(); const xs = [], cr = [], gl = []; for (let T = 0; T <= 2000; T += 10){ xs.push(T); cr.push(T < 1700 ? 1 + 0.00003*T : 1.12 + 0.0001*(T - 1700)); gl.push(T < 1200 ? 1 + 0.00005*T : 1.06 + 0.0001*(T - 1200)); }
    plot(cc, { xmin:0, xmax:2000, ymin:0.98, ymax:1.18, xlab:'temperature [°C]', ylab:'volume (relative)', pl:52, yfmt:v => fmt(v, 2), series:[{ x:xs, y:cr, color:C.rod, w:kind === 'c' ? 3 : 1.4 }, { x:xs, y:gl, color:C.crank, w:kind === 'g' ? 3 : 1.4 }],
      vl:[{ v:1700, color:C.rod, label:'T_m', dy:0 }, { v:1200, color:C.crank, label:'T_g', dy:14 }], legend:[{ color:C.rod, label:'crystal' }, { color:C.crank, label:'glass' }] }); }
  function draw(){ net(); curve(); $('gl_t').textContent = kind === 'c' ? 'Crystal and glass: quartz' : 'Crystal and glass: silica glass';
    $('gl_cap').innerHTML = kind === 'c' ? 'In crystalline quartz every silicon is bonded through oxygen to its neighbours in a regular repeating pattern. On heating, the volume jumps sharply at a single melting point.' : 'Silica glass has the same local bonding (each silicon linked through oxygens) but the rings have different sizes and no long-range pattern. There is no sharp melting point: the curve only changes slope at the glass transition T_g, and the glass softens gradually above it. Schematic values.'; }
  segGroup(document.querySelector('#s7 .seg'), m => { kind = m; draw(); });
  watchSize(cs, draw); watchSize(cc, curve); onRedraw(draw); draw(); }

/* ================= quiz ================= */
quiz($('qz'), [
  { q:'How many atoms belong to one face-centred cubic unit cell?', o:['1', '2', '4', '14'], a:2, why:'Eight corners × ⅛ + six faces × ½ = 1 + 3 = 4.' },
  { q:'The coordination number in a body-centred cubic metal is', o:['6', '8', '12', '4'], a:1, why:'The centre atom touches the eight corner atoms.' },
  { q:'Which two structures fill 74 % of space?', o:['SC and BCC', 'BCC and FCC', 'FCC and HCP', 'HCP and diamond'], a:2, why:'FCC and HCP are both close-packed stackings of equal spheres.' },
  { q:'Chromium is BCC with a = 288 pm and M = 52.00 g/mol. Its density is about', o:['3.6 g/cm³', '7.2 g/cm³', '14.4 g/cm³', '1.8 g/cm³'], a:1, why:'ρ = 2 × 52.00/(6.022 × 10²³ × (2.88 × 10⁻⁸ cm)³) = 7.2 g/cm³.' },
  { q:'Ionic crystals are brittle because', o:['the ions are too small', 'a small shift brings like charges together and they repel', 'they contain free electrons', 'their bonds are weak'], a:1, why:'Shifting a plane of ions by half a spacing puts like charges face to face; the repulsion splits the crystal.' },
  { q:'Graphite conducts electricity because', o:['it has ions that move', 'each carbon has a delocalised electron within the sheets', 'it is a metal', 'its sheets are covalently bonded to each other'], a:1, why:'Each carbon uses three electrons in σ bonds; the fourth is delocalised over the sheet.' },
  { q:'Steel is an example of', o:['a substitutional alloy', 'an interstitial alloy', 'an ionic solid', 'an amorphous solid'], a:1, why:'Small carbon atoms occupy the holes in the iron lattice.' },
  { q:'Unlike a crystal, a glass', o:['has a sharp melting point', 'softens over a range of temperature', 'has long-range order', 'cannot be annealed'], a:1, why:'A glass has no long-range order and passes through a glass transition instead of a sharp melting point.' }]);
})();
