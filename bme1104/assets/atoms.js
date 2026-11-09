/* BME 1104 interactive notes, Chapter 2: atomic structure */
(() => {
'use strict';
const PI = Math.PI;
const MP = 1.007276, MN = 1.008665, ME = 0.00054858;
const shellsOf = e => { const s = []; for (const o of econfig(e)) s[o.n - 1] = (s[o.n - 1] || 0) + o.e; return [...s].map(v => v || 0); };
const SHELL = 'KLMNOPQ';

/* ================= 2.1 build an atom ================= */
{ // stable neutron numbers for Z = 1 to 20
  const STABLE = [[0, 1], [1, 2], [3, 4], [5], [5, 6], [6, 7], [7, 8], [8, 9, 10], [10], [10, 11, 12], [12], [12, 13, 14], [14], [14, 15, 16], [16], [16, 17, 18, 20], [18, 20], [18, 20, 22], [20, 22], [20, 22, 23, 24, 26, 28]];
  const S = { p:6, n:6, e:6 }; let nuc = null, shells = null, v = null, t = 0;
  const PCOL = 0xd2463a, NCOL = 0x9aa3ad, ECOL = 0x2f6fd8;
  v = niceGL(view3d($('at'), { cam:[0, 2.6, 6.2], fov:38,
    build(v){ v.root.add(nuc = new THREE.Group()); v.root.add(shells = new THREE.Group()); },
    update(dt){ t += dt; nuc.rotation.y += dt*0.25; shells.children.forEach((g, i) => { g.children[1].rotation.z += dt*(1.3/(i + 1)); }); } }));
  const pM = gloss(PCOL), nM = gloss(NCOL), eM = gloss(ECOL, { emissive:0x0c2a66, emissiveIntensity:0.6 });
  const ringM = new THREE.MeshBasicMaterial({ color:0x8796a8, transparent:true, opacity:0.55 });
  function rebuild(){ if (!v) return; clearMesh(nuc); clearMesh(shells);
    const A = S.p + S.n, rr = 0.13, R0 = rr*1.05*Math.cbrt(A), sph = new THREE.SphereGeometry(rr, 28, 18);
    // spread protons and neutrons evenly through the nucleus
    const kinds = []; for (let i = 0; i < A; i++) kinds.push(Math.floor((i + 1)*S.p/A) - Math.floor(i*S.p/A) ? 'p' : 'n');
    for (let i = 0; i < A; i++){ const f = (i + 0.5)/A, r = A === 1 ? 0 : R0*Math.cbrt(f), th = Math.acos(1 - 2*((i*0.618034) % 1)), ph = i*2.39996;
      const m = new THREE.Mesh(sph, kinds[i] === 'p' ? pM : nM); m.position.set(r*Math.sin(th)*Math.cos(ph), r*Math.cos(th), r*Math.sin(th)*Math.sin(ph)); nuc.add(m); }
    const sh = shellsOf(S.e), eG = new THREE.SphereGeometry(0.075, 20, 14);
    sh.forEach((ne, i) => { const R = 1.0 + 0.62*i, g = new THREE.Group(); g.rotation.x = PI/2 + (i % 2 ? 0.28 : -0.22); g.rotation.y = i*0.5;
      const ring = new THREE.Mesh(new THREE.TorusGeometry(R, 0.008, 6, 160), ringM); g.add(ring);
      const eg = new THREE.Group(); for (let k = 0; k < ne; k++){ const a = 2*PI*k/ne, m = new THREE.Mesh(eG, eM); m.position.set(R*Math.cos(a), R*Math.sin(a), 0); eg.add(m); }
      g.add(eg); const lab = textSprite(SHELL[i], { h:0.2, color:'#5d6b7a', weight:500 }); lab.position.set(R + 0.16, 0, 0); g.add(lab); shells.add(g); });
    v.render(); }
  function info(){ const p = S.p, n = S.n, e = S.e, A = p + n, q = p - e, sym = EL_SYM[p - 1], nm = EL_NAME[p - 1];
    const stable = p <= 20 ? STABLE[p - 1].includes(n) : null, chg = q === 0 ? 'neutral atom' : q > 0 ? `positive ion, charge +${q}` : `negative ion, charge ${q}`;
    const mass = p*MP + n*MN + e*ME;
    $('at_t').textContent = `Build an atom: ${nm}-${A}`;
    $('at_sub').innerHTML = `${p} p, ${n} n, ${e} e`;
    const qs = q === 0 ? '' : `^{${Math.abs(q) > 1 ? Math.abs(q) : ''}${q > 0 ? '+' : '-'}}`;
    $('at_box').innerHTML = `<div class="sym">${tx(`{}^{${A}}_{${p}}\\mathrm{${sym}}${qs}`)}<small>${nm}</small></div><div>
      <div>Atomic number Z = <b>${p}</b> (this fixes the element)</div><div>Mass number A = Z + N = ${p} + ${n} = <b>${A}</b></div>
      <div>Charge: ${chg}</div><div>Mass of the particles: ${fmt(mass, 3)} u (tabulated atomic weight of ${sym}: ${EL_MASS[p - 1]})</div>
      <div>Shells: ${shellsOf(e).map((k, i) => `${SHELL[i]} ${k}`).join(', ') || 'none'}</div></div>`;
    const iso = stable === null ? '' : stable ? `${nm}-${A} is a stable isotope.` : `${nm}-${A} is not a stable isotope: with ${n} neutrons for ${p} protons the nucleus is radioactive and decays. Stable ${nm} has ${STABLE[p - 1].map(x => x + p).join(' or ')} nucleons.`;
    const dm = mass - EL_MASS[p - 1];
    $('at_cap').innerHTML = `${iso} Adding a proton changes the element; adding a neutron makes another isotope of the same element; adding or removing an electron makes an ion. ${Math.abs(dm) > 0.6 ? '' : `The mass of the separate particles (${fmt(mass, 3)} u) is slightly more than the real atom: the difference is the binding energy of the nucleus (E = mc²).`}`; }
  const lim = { p:[1, 20], n:[0, 30], e:[0, 22] };
  document.querySelectorAll('#s1 [data-d]').forEach(b => b.addEventListener('click', () => { const k = b.dataset.d[0], d = b.dataset.d[1] === '+' ? 1 : -1;
    S[k] = clamp(S[k] + d, ...lim[k]); if (k === 'p' && d > 0 && S.e === S.p - 1) S.e = S.p; if (k === 'p' && d < 0 && S.e === S.p + 1) S.e = S.p; S.e = Math.min(S.e, S.p + 2);
    rebuild(); info(); }));
  if (v) playButton($('at_play'), v.anim); else $('at_play').hidden = true;
  rebuild(); info(); }

/* ================= examples in 2.2 ================= */
example($('ex1'), { title:'Example 2.1: average atomic mass of chlorine', src:'isotopes',
  q:'Natural chlorine is a mixture of {ce:^{35}Cl} and {ce:^{37}Cl} in the ratio 3 to 1. Find the average atomic mass.',
  inputs:[['A1', 'Mass number of isotope 1', 35, ''], ['x1', 'Share of isotope 1', 3, 'parts'], ['A2', 'Mass number of isotope 2', 37, ''], ['x2', 'Share of isotope 2', 1, 'parts']],
  solve:v => { const A = (v.A1*v.x1 + v.A2*v.x2)/(v.x1 + v.x2);
    return [[`Weighted average: (${v.x1} × ${v.A1} + ${v.x2} × ${v.A2}) / (${v.x1} + ${v.x2}) =`, `${fmt(v.A1*v.x1 + v.A2*v.x2, 2)} / ${fmt(v.x1 + v.x2, 2)}`], ['Average atomic mass =', fmt(A, 2), true],
      ['The tabulated value, 35.45, uses the exact isotope masses (34.969 and 36.966 u) and abundances (75.8 % and 24.2 %).', '']]; } });
example($('ex2'), { title:'Example 2.2: wavelength of an electron', src:'de Broglie',
  q:'An electron (m = 9.109 × 10⁻³¹ kg) is accelerated from rest through a potential difference of 100 V. Find its speed and its de Broglie wavelength.',
  inputs:[['V', 'Accelerating voltage V', 100, 'V']],
  solve:v => { const m = 9.109e-31, E = Q_E*v.V, vel = Math.sqrt(2*E/m), lam = H_P/(m*vel);
    return [['Kinetic energy E = eV =', `${sci(E, 3)} J`], ['Speed v = √(2E/m) =', `${sci(vel, 3)} m/s`], ['Wavelength λ = h/(mv) =', `${sci(lam, 3)} m = ${fmt(lam*1e9, 3)} nm`, true],
      ['This is about the spacing of atoms in a crystal, which is why electron beams are diffracted by crystals (the basis of the electron microscope).', '']]; } });
example($('ex3'), { title:'Example 2.3: an electron confined to an atom', src:'uncertainty principle',
  q:'An electron is known to be somewhere within an atom 0.1 nm across. Find the smallest uncertainty in its speed.',
  inputs:[['dx', 'Uncertainty in position Δx', 0.1, 'nm']],
  solve:v => { const m = 9.109e-31, dp = H_P/(4*PI*v.dx*1e-9), dv = dp/m;
    return [['Δp ≥ h/(4π Δx) =', `${sci(dp, 3)} kg m/s`], ['Δv = Δp/m ≥', `${sci(dv, 3)} m/s`, true],
      ['The speed is uncertain by hundreds of kilometres per second, so a definite orbit cannot be traced. For a 1 g ball located to 1 μm the uncertainty would be about 10⁻²⁶ m/s, far too small to notice.', '']]; } });

/* ================= 2.3 energy levels and spectral lines ================= */
{ const cv = $('bl'), P = {}; let t = 0;
  const SER = ['Lyman', 'Balmer', 'Paschen', 'Brackett', 'Pfund', 'Humphreys'];
  const H = controls($('bl_c'), [['Z', 'Nuclear charge Z', 1, 3, 1, 1, '', z => ['hydrogen', 'He⁺ ion', 'Li²⁺ ion'][z - 1]],
    ['ni', 'Upper level n', 2, 7, 1, 3, ''], ['nf', 'Lower level n', 1, 6, 1, 2, '', n => SER[n - 1] + ' series']], P, k => { if (P.nf >= P.ni){ if (k === 'nf') H.ni.set(Math.min(7, P.nf + 1)); else H.nf.set(P.ni - 1); } t = 0; draw(); });
  const E = (n, Z = P.Z) => -13.6*Z*Z/(n*n);
  function wlColor(l){ if (l < 380 || l > 750) return null; let r = 0, g = 0, b = 0;
    if (l < 440){ r = (440 - l)/60; b = 1; } else if (l < 490){ g = (l - 440)/50; b = 1; } else if (l < 510){ g = 1; b = (510 - l)/20; } else if (l < 580){ r = (l - 510)/70; g = 1; } else if (l < 645){ r = 1; g = (645 - l)/65; } else r = 1;
    return `rgb(${Math.round(255*r)},${Math.round(255*g)},${Math.round(255*b)})`; }
  function draw(){ const { ctx, W, H: Hh } = prep(cv); readColors(); const dE = E(P.ni) - E(P.nf), lam = 1239.84/dE, col = wlColor(lam);
    const x0 = 70, x1 = Math.min(W*0.5, 360), top = 22, bot = Hh - 70, Emin = E(1), Y = e => top + (bot - top)*(e/Emin);
    ctx.font = `11.5px ${C.mono}`; ctx.textBaseline = 'middle';
    for (let n = 1; n <= 7; n++){ const y = Y(E(n)); ctx.strokeStyle = n === P.ni || n === P.nf ? C.ink : C.rule; ctx.lineWidth = n === P.ni || n === P.nf ? 2 : 1.2; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
      if (n <= 4 || n === P.ni || n === P.nf){ ctx.fillStyle = C.muted; ctx.textAlign = 'right'; ctx.fillText(`n = ${n}`, x0 - 8, y); ctx.textAlign = 'left'; ctx.fillText(`${fmt(E(n), 2)} eV`, x1 + 6, y); } }
    ctx.strokeStyle = C.rule; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(x0, Y(0)); ctx.lineTo(x1, Y(0)); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = C.muted; ctx.textAlign = 'right'; ctx.fillText('free', x0 - 8, Y(0) - 8);
    // electron falling and photon leaving
    const ph = (t % 3.2), xa = (x0 + x1)/2, ya = Y(E(P.ni)), yb = Y(E(P.nf)), fall = Math.min(1, ph/0.8);
    arrow(ctx, xa, ya, xa, yb, C.crank, 2); ctx.fillStyle = C.crank; ctx.beginPath(); ctx.arc(xa, ya + (yb - ya)*fall, 6, 0, 7); ctx.fill();
    const pc = col || C.muted; if (ph > 0.8){ const s = Math.min(1, (ph - 0.8)/1.6), xs = xa + 14, xe = xs + (W - 30 - xs)*s, ym = (ya + yb)/2, k = 2*PI/Math.max(14, Math.min(60, lam/10));
      ctx.strokeStyle = pc; ctx.lineWidth = 2; ctx.beginPath(); for (let x = xs; x <= xe; x += 1.5){ const yy = ym + 7*Math.sin((x - xs)*k); x === xs ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy); } ctx.stroke();
      ctx.fillStyle = C.text; ctx.textAlign = 'left'; ctx.fillText(`photon, hf = ${fmt(dE, 2)} eV`, Math.min(xe, W - 170), ym - 18); }
    // spectrum strip for the series
    const sy = Hh - 40, sx0 = 30, sx1 = W - 30, lmin = 1239.84/(13.6*P.Z*P.Z*(1/(P.nf*P.nf))) * 0.98, lmax = 1239.84/(13.6*P.Z*P.Z*(1/(P.nf*P.nf) - 1/((P.nf + 1)**2)))*1.03;
    const LX = l => sx0 + (Math.log(l) - Math.log(lmin))/(Math.log(lmax) - Math.log(lmin))*(sx1 - sx0);
    ctx.fillStyle = alpha(C.ink, 0.06); ctx.fillRect(sx0, sy, sx1 - sx0, 18);
    for (let l = 380; l <= 750; l += 2) if (l > lmin && l < lmax){ ctx.fillStyle = alpha(wlColor(l), 0.25); ctx.fillRect(LX(l), sy, Math.max(1, LX(l + 2) - LX(l)), 18); }
    for (let n = P.nf + 1; n <= 20; n++){ const l = 1239.84/(E(n) - E(P.nf)); ctx.strokeStyle = n === P.ni ? (col || C.ink) : alpha(C.ink, 0.45); ctx.lineWidth = n === P.ni ? 3 : 1; ctx.beginPath(); ctx.moveTo(LX(l), sy - (n === P.ni ? 4 : 0)); ctx.lineTo(LX(l), sy + 18); ctx.stroke(); }
    ctx.fillStyle = C.muted; ctx.textAlign = 'left'; ctx.fillText(`${SER[P.nf - 1]} series, wavelength (log scale): ${fmt(lmin/0.98, 0)} nm`, sx0, sy + 30); ctx.textAlign = 'right'; ctx.fillText(`${fmt(lmax/1.03, 0)} nm`, sx1, sy + 30);
    const band = lam < 380 ? 'ultraviolet' : lam > 750 ? 'infrared' : 'visible light';
    $('bl_sub').innerHTML = `ΔE = 13.6 × ${P.Z}² × (1/${P.nf}² − 1/${P.ni}²) = ${fmt(dE, 3)} eV, λ = ${fmt(lam, 1)} nm`;
    $('bl_cap').innerHTML = `The electron drops from n = ${P.ni} to n = ${P.nf} and gives out a photon of ${fmt(dE, 2)} eV, wavelength ${fmt(lam, 1)} nm (${band}). ${P.nf === 2 && P.Z === 1 ? 'The Balmer lines of hydrogen are the visible lines seen in its spectrum: red at 656 nm, blue-green at 486 nm and violet at 434 and 410 nm.' : P.nf === 1 ? 'All lines that end on n = 1 are in the ultraviolet, because the jump to the lowest level is so large.' : ''} An atom absorbs exactly the same wavelengths when it is lifted between the same two levels.`; }
  const an = animate(cv, dt => { t += dt; draw(); }); watchSize(cv, draw); onRedraw(draw); draw(); }

/* ================= 2.3 orbital shapes ================= */
{ const ORB = [ // key, label, n, l, kinds, text
    ['1s', '1s', 1, 0, ['s'], 'An s orbital is a sphere around the nucleus: the electron is equally likely in every direction. There is one s orbital in every shell.'],
    ['2px', '2p<sub>x</sub>', 2, 1, ['px'], 'A p orbital has two lobes of opposite sign either side of the nucleus, with a nodal plane through the nucleus where the electron is never found.'],
    ['2py', '2p<sub>y</sub>', 2, 1, ['py'], 'The same dumbbell shape, pointing along the y axis.'],
    ['2pz', '2p<sub>z</sub>', 2, 1, ['pz'], 'The same dumbbell shape, pointing along the z axis.'],
    ['2p', 'all three 2p', 2, 1, ['px', 'py', 'pz'], 'The three p orbitals point along x, y and z, at right angles to one another. Together a full p subshell (6 electrons) is spherically symmetric.'],
    ['3dxy', '3d<sub>xy</sub>', 3, 2, ['dxy'], 'A d orbital has four lobes and two nodal planes. d<sub>xy</sub> lies in the xy plane with its lobes between the axes.'],
    ['3dx2y2', '3d<sub>x²−y²</sub>', 3, 2, ['dx2-y2'], 'd<sub>x²−y²</sub> lies in the xy plane with its lobes along the x and y axes. In a crystal these lobes point straight at neighbouring atoms.'],
    ['3dz2', '3d<sub>z²</sub>', 3, 2, ['dz2'], 'd<sub>z²</sub> has two lobes along z and a ring (torus) of opposite sign around the middle.'],
    ['3d', 'all five 3d', 3, 2, ['dxy', 'dxz', 'dyz', 'dx2-y2', 'dz2'], 'The five d orbitals of a shell, drawn together. Partly filled d subshells give the transition metals their colours, their magnetism and their many oxidation states.'],
    ['4fz3', '4f<sub>z³</sub>', 4, 3, ['fz3'], 'An f orbital has three nodal planes or cones and six or eight lobes. f subshells fill in the lanthanides and actinides.'],
    ['4fxyz', '4f<sub>xyz</sub>', 4, 3, ['fxyz'], 'f<sub>xyz</sub> has eight lobes pointing to the corners of a cube.']];
  let cur = 0, grp = null; const chips = $('orb_chips');
  chips.innerHTML = ORB.map((o, i) => `<button type="button" data-i="${i}" aria-pressed="${i === 0}">${o[1]}</button>`).join('');
  const v = niceGL(view3d($('orb'), { cam:[3.2, 2.4, 4.2], fov:36,
    build(v){ const L = 1.9, axM = new THREE.MeshBasicMaterial({ color:0x8796a8 });
      [['x', [1, 0, 0]], ['y', [0, 0, -1]], ['z', [0, 1, 0]]].forEach(([n, d]) => { const dv = new THREE.Vector3(...d); v.root.add(cylBetween(dv.clone().multiplyScalar(-L), dv.clone().multiplyScalar(L), 0.008, axM, 8));
        const s = textSprite(n, { h:0.22, color:'#4c5967' }); s.position.copy(dv.clone().multiplyScalar(L + 0.15)); v.root.add(s); });
      const nu = new THREE.Mesh(new THREE.SphereGeometry(0.05, 20, 14), gloss(0x222222)); v.root.add(nu); v.root.add(grp = new THREE.Group()); },
    update(dt, v){ v.root.rotation.y += dt*0.15; } }));
  function show(){ const o = ORB[cur]; if (grp){ clearMesh(grp); o[4].forEach(k => { const m = orbitalMesh(k, k === 's' ? 0.9 : o[4].length > 1 ? 1.45 : 1.6); if (o[4].length > 2) m.material.opacity = 0.75; grp.add(m); }); v.render(); }
    const l = o[3], ms = [...Array(2*l + 1)].map((_, i) => i - l).join(', ');
    $('orb_t').innerHTML = `Shapes of the atomic orbitals: ${o[1]}`;
    $('orb_sub').innerHTML = `n = ${o[2]}, l = ${l}, m = ${ms}`;
    $('orb_cap').innerHTML = `${o[5]} This subshell has ${2*l + 1} orbital${l ? 's' : ''} and holds up to ${2*(2*l + 1)} electrons.`; }
  chips.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; cur = +b.dataset.i; chips.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b)); show(); });
  show(); }

/* ================= 2.4 filling the orbitals ================= */
{ let z = 8, prev = null, timer = null; const ZMAX = 54, sel = $('cf_sel'), mad = $('cf_mad');
  sel.innerHTML = [...Array(ZMAX)].map((_, i) => `<option value="${i + 1}">${i + 1} ${EL_NAME[i]}</option>`).join('');
  const ORDER = SUB_ORDER.slice(0, 19).map(([n, l]) => ({ n, l, key:n + LL[l], cap:2*(2*l + 1) }));
  function boxes(e, nb){ const out = []; for (let i = 0; i < nb; i++) out.push([i < e ? 1 : 0, i + nb < e ? 1 : 0]); return out; }
  function render(){ const cfg = econfig(z), get = k => (cfg.find(o => o.key === k) || { e:0 }).e, old = prev ? econfig(prev) : [], getOld = k => (old.find(o => o.key === k) || { e:0 }).e;
    let lastIdx = 0; ORDER.forEach((o, i) => { if (get(o.key) > 0) lastIdx = i; });
    const show = ORDER.slice(0, Math.min(ORDER.length, lastIdx + 2)), changed = prev != null ? show.filter(o => get(o.key) > getOld(o.key)).map(o => o.key) : [];
    $('cf_box').innerHTML = show.map(o => { const e = get(o.key), nb = 2*o.l + 1, bx = boxes(e, nb);
      return `<div class="osub${changed.includes(o.key) ? ' new' : ''}"><div class="row">${bx.map(([u, d], i) => `<span class="box${changed.includes(o.key) && ((e <= nb && i === e - 1) || (e > nb && i === e - nb - 1)) ? ' last' : ''}">${u ? '<span class="up">↑</span>' : ''}${d ? '<span class="dn">↓</span>' : ''}</span>`).join('')}</div><div class="lab">${o.key}${e ? ` (${e})` : ''}</div></div>`; }).join('');
    $('cf_cfg').innerHTML = tx(`\\mathrm{${EL_SYM[z - 1]}}:\\ ${econfigTex(z)}`) + (z > 2 ? `<span style="font-size:15px;color:var(--muted);margin-left:16px">short form ${tx(econfigTex(z, true))}</span>` : '');
    $('cf_t').textContent = `Fill the orbitals: ${EL_NAME[z - 1]} (Z = ${z})`;
    const unp = cfg.reduce((a, o) => { const nb = 2*o.l + 1; return a + (o.e <= nb ? o.e : 2*nb - o.e); }, 0);
    $('cf_sub').textContent = `${unp} unpaired electron${unp === 1 ? '' : 's'}, ${valence(z)} in the outer shell`;
    let why = '';
    const nk = changed[0], no = nk ? ORDER.find(o => o.key === nk) : null;
    if ([24, 29, 42, 47, 79].includes(z)) why = `${EL_NAME[z - 1]} is an exception: one s electron moves into the d subshell, because a half-full or full d subshell is especially stable. The simple order would give ${z === 24 || z === 42 ? 'd⁴ s²' : 'd⁹ s²'}.`;
    else if (no && no.l > 0 && get(nk) > 1 && get(nk) <= 2*no.l + 1) why = `Hund's rule: the new electron goes into an empty ${nk} orbital with the same spin, rather than pairing up.`;
    else if (no && no.l > 0 && get(nk) > 2*no.l + 1) why = `Every ${nk} orbital already has one electron, so the new electron pairs up with opposite spin (Pauli).`;
    else if (nk === '4s' && z === 19) why = 'Potassium: the 4s subshell (n + l = 4) is lower in energy than 3d (n + l = 5), so the 19th electron goes into 4s, not 3d.';
    else if (no && no.l === 2 && get(nk) === 1) why = `The first ${nk} electron: from here the d-block (transition metals) begins.`;
    else if (no) why = `The new electron goes into the lowest free orbital, ${nk}.`;
    else why = 'Use the buttons to add electrons one at a time and watch which orbital each one goes into.';
    $('cf_cap').innerHTML = why; sel.value = z; drawMad(get); }
  function drawMad(get){ const { ctx, W, H } = prep(mad); readColors(); const n = ORDER.length, perRow = W < 560 ? Math.ceil(n/2) : n, rows = Math.ceil(n/perRow);
    const gap = 4, cw = Math.min(56, (W - 24 - gap*(perRow - 1))/perRow), ch = Math.min(52, (H - 34 - 20*rows)/rows), x0 = (W - (cw*perRow + gap*(perRow - 1)))/2;
    ctx.font = `12px ${C.mono}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = C.muted; ctx.fillText('order of filling (lowest n + l first; for equal n + l, lowest n first)', W/2, 11);
    const LC = [C.crank, C.rod, C.mass, C.vel];
    ORDER.forEach((o, i) => { const r = Math.floor(i/perRow), c = i % perRow, x = x0 + c*(cw + gap), y = 26 + r*(ch + 20), e = get(o.key), f = e/o.cap;
      ctx.fillStyle = C.sheet; ctx.fillRect(x, y, cw, ch); ctx.fillStyle = alpha(LC[o.l], 0.32); ctx.fillRect(x, y + ch*(1 - f), cw, ch*f);
      ctx.strokeStyle = e > 0 && e < o.cap ? C.ink : C.rule; ctx.lineWidth = e > 0 && e < o.cap ? 2 : 1; ctx.strokeRect(x + 0.5, y + 0.5, cw - 1, ch - 1);
      ctx.fillStyle = C.ink; ctx.font = `600 13px ${C.mono}`; ctx.fillText(o.key, x + cw/2, y + ch*0.38); ctx.font = `11px ${C.mono}`; ctx.fillStyle = C.muted; ctx.fillText(`${e}/${o.cap}`, x + cw/2, y + ch*0.72);
      ctx.fillText(`n+l=${o.n + o.l}`, x + cw/2, y + ch + 9); }); }
  const go = d => { prev = z; z = clamp(z + d, 1, ZMAX); render(); };
  $('cf_p').addEventListener('click', () => go(1)); $('cf_m').addEventListener('click', () => go(-1));
  sel.addEventListener('change', () => { prev = null; z = +sel.value; render(); });
  $('cf_play').addEventListener('click', e => { if (timer){ clearInterval(timer); timer = null; e.target.textContent = 'Fill automatically'; return; }
    if (z >= ZMAX){ prev = null; z = 1; render(); } e.target.textContent = 'Stop';
    timer = setInterval(() => { if (z >= 36){ clearInterval(timer); timer = null; $('cf_play').textContent = 'Fill automatically'; return; } go(1); }, 900); });
  watchSize(mad, render); onRedraw(render); render();
  // Table 2.4
  const tb = document.querySelector('#tab24 tbody'); let h = '';
  for (let i = 1; i <= 9; i++){ const j = i + 9; h += `<tr><td class="num">${i}</td><td>${EL_NAME[i - 1]}</td><td>${tx(econfigTex(i))}</td><td class="num">${j}</td><td>${EL_NAME[j - 1]}</td><td>${tx(econfigTex(j))}</td></tr>`; }
  tb.innerHTML = h; }

/* ================= 2.5 periodic table ================= */
{ const CATC = { alkali:'#f2b5a0', alkaline:'#f5d39c', transition:'#c3d4ea', post:'#c9e0c6', metalloid:'#d8cbe9', nonmetal:'#b7ded3', halogen:'#efe08f', noble:'#e9bfd6', lanthanide:'#e6d8bf', actinide:'#d9c3b3' };
  const BLC = { s:'#f2b5a0', p:'#efe08f', d:'#c3d4ea', f:'#c9e0c6' };
  const PROP = { en:['Electronegativity (Pauling)', EL_EN, ''], ie:['First ionisation energy', EL_IE, 'kJ/mol'], rad:['Covalent radius', EL_RAD, 'pm'] };
  const pt = $('pt'); let mode = 'cat', on = 26;
  let h = ''; for (let z = 1; z <= 118; z++){ const [r, c] = elPos(z); h += `<button type="button" class="el" data-z="${z}" style="grid-row:${r};grid-column:${c}" aria-label="${EL_NAME[z - 1]}, atomic number ${z}"><span class="z">${z}</span><span class="s">${EL_SYM[z - 1]}</span><span class="v"></span></button>`; }
  h += '<span class="flabel" style="grid-row:6;grid-column:3">57–71</span><span class="flabel" style="grid-row:7;grid-column:3">89–103</span><span style="grid-row:8;grid-column:1;height:8px"></span><span class="flabel" style="grid-row:9;grid-column:1/4">lanthanides</span><span class="flabel" style="grid-row:10;grid-column:1/4">actinides</span>';
  pt.innerHTML = h; const els = [...pt.querySelectorAll('.el')];
  const lerp = (a, b, f) => { const A = [1, 3, 5].map(i => parseInt(a.substr(i, 2), 16)), B = [1, 3, 5].map(i => parseInt(b.substr(i, 2), 16)); return `rgb(${A.map((x, i) => Math.round(x + (B[i] - x)*f)).join(',')})`; };
  function paint(){ const pr = PROP[mode]; let lo = Infinity, hi = -Infinity; if (pr) pr[1].forEach(x => { if (x > 0){ lo = Math.min(lo, x); hi = Math.max(hi, x); } });
    els.forEach(b => { const z = +b.dataset.z, vEl = b.querySelector('.v'); let bg, fg = '#18222c', val = '';
      if (mode === 'cat'){ bg = CATC[elCategory(z)]; val = z <= 103 ? fmt(EL_MASS[z - 1], EL_MASS[z - 1] > 100 ? 1 : 2) : ''; }
      else if (mode === 'block'){ bg = BLC[elBlock(z)]; val = elBlock(z) + '-block'; }
      else { const x = pr[1][z - 1]; if (!x){ bg = '#e7e9ec'; fg = '#7a8590'; val = 'n/a'; } else { const f = (x - lo)/(hi - lo); bg = lerp('#f1f5fa', '#1f4e8c', f); fg = f > 0.55 ? '#ffffff' : '#18222c'; val = String(x); } }
      b.style.background = bg; b.style.color = fg; b.querySelector('.z').style.color = fg; vEl.textContent = val; b.classList.toggle('on', z === on); });
    $('pt_key').innerHTML = mode === 'cat' ? Object.entries(CATC).map(([k, c]) => `<span><i style="background:${c}"></i>${CAT_NAME[k]}</span>`).join('')
      : mode === 'block' ? Object.entries(BLC).map(([k, c]) => `<span><i style="background:${c}"></i>${k}-block (${k} subshell filling)</span>`).join('')
      : `<span><i style="background:#f1f5fa"></i>low ${pr[0].toLowerCase()} (${lo}${pr[2] ? ' ' + pr[2] : ''})</span><span><i style="background:${lerp('#f1f5fa', '#1f4e8c', 0.5)}"></i></span><span><i style="background:#1f4e8c"></i>high (${hi}${pr[2] ? ' ' + pr[2] : ''})</span><span><i style="background:#e7e9ec"></i>no value (noble gases have no Pauling value; data shown up to Z = 86)</span>`; }
  function info(){ const z = on, g = elGroup(z), d = k => PROP[k][1][z - 1];
    $('pt_info').innerHTML = `<div class="sym"><small>${z}</small>${EL_SYM[z - 1]}<small>${EL_NAME[z - 1]}</small></div><div>
      <div><b>${CAT_NAME[elCategory(z)]}</b>, ${g ? `group ${g}, ` : ''}period ${elPeriod(z)}, ${elBlock(z)}-block</div>
      <div>Atomic weight ${EL_MASS[z - 1]}</div><div>Configuration ${tx(econfigTex(z, true))}</div>
      ${z <= 86 ? `<div>Electronegativity ${d('en') || 'n/a'}, first ionisation energy ${d('ie')} kJ/mol, covalent radius ${d('rad')} pm</div>` : ''}</div>`; }
  pt.addEventListener('click', e => { const b = e.target.closest('.el'); if (!b) return; on = +b.dataset.z; paint(); info(); });
  segGroup(document.querySelector('#s5 .seg'), m => { mode = m; paint(); });
  paint(); info(); }

/* ================= 2.6 trends ================= */
{ const cv = $('tr'), PROP = { ie:['First ionisation energy', EL_IE, 'kJ/mol', 0, 2600], rad:['Covalent radius', EL_RAD, 'pm', 0, 260], en:['Electronegativity', EL_EN, '', 0.5, 4.2] };
  let mode = 'ie'; const NOBLE = [2, 10, 18, 36, 54, 86], ALK = [3, 11, 19, 37, 55];
  function draw(){ readColors(); const p = PROP[mode], xs = [], ys = [], pts = [];
    for (let z = 1; z <= 86; z++){ const v = p[1][z - 1]; if (!v) continue; xs.push(z); ys.push(v);
      const hi = (mode === 'rad' ? ALK : NOBLE).includes(z) || (mode === 'en' && [9, 17, 35, 53].includes(z)) || (mode !== 'en' && ALK.includes(z) && mode === 'ie');
      pts.push({ x:z, y:v, color:NOBLE.includes(z) ? C.rod : ALK.includes(z) ? C.crank : C.muted, r:hi ? 4.5 : 2.6, label:hi ? EL_SYM[z - 1] : '', z }); }
    plot(cv, { xmin:0, xmax:88, ymin:p[3], ymax:p[4], xlab:'atomic number Z', ylab:`${p[0]}${p[2] ? ' [' + p[2] + ']' : ''}`, series:[{ x:xs, y:ys, color:alpha(C.ink, 0.55), w:1.4 }], points:pts,
      vl:NOBLE.slice(0, 5).map(z => ({ v:z + 0.5, color:alpha(C.muted, 0.6) })), legend:[{ color:C.crank, label:'alkali metals' }, { color:C.rod, label:'noble gases' }] });
    $('tr_t').textContent = `How a property repeats with atomic number: ${p[0].toLowerCase()}`; }
  hoverPoints(cv, q => { if (!q) return; const p = PROP[mode]; $('tr_cap').innerHTML = `Z = ${q.z}, ${EL_NAME[q.z - 1]} (${CAT_NAME[elCategory(q.z)].toLowerCase()}, period ${elPeriod(q.z)}): ${p[0].toLowerCase()} ${q.y}${p[2] ? ' ' + p[2] : ''}.`; });
  segGroup(document.querySelector('#s6 .seg'), m => { mode = m; draw();
    $('tr_cap').innerHTML = m === 'ie' ? 'Ionisation energy peaks at each noble gas and drops sharply at the alkali metal that follows, which has a single electron in a new shell.' : m === 'rad' ? 'Atoms are largest at the alkali metals and shrink across each period as the growing nuclear charge pulls the shell in.' : 'Electronegativity rises across each period to the halogen and falls down each group. Fluorine is the highest of all.'; });
  watchSize(cv, draw); onRedraw(draw); draw(); }

/* ================= quiz ================= */
quiz($('qz'), [
  { q:'Which particle decides which element an atom belongs to?', o:['The neutron', 'The proton', 'The electron', 'The nucleon'], a:1, why:'The number of protons (atomic number Z) defines the element. Changing the number of neutrons gives an isotope; changing the number of electrons gives an ion.' },
  { q:'{ce:^{35}_{17}Cl} has how many neutrons?', o:['17', '18', '35', '52'], a:1, why:'N = A − Z = 35 − 17 = 18.' },
  { q:'Argon-40 and calcium-40 are', o:['isotopes', 'isobars', 'isotones', 'allotropes'], a:1, why:'They have the same mass number (40) but different atomic numbers (18 and 20), so they are isobars.' },
  { q:'How many electrons can the n = 3 shell hold?', o:['8', '9', '18', '32'], a:2, why:'A shell holds 2n² electrons: 2 × 3² = 18 (3s 2, 3p 6, 3d 10).' },
  { q:'Why does the 19th electron of potassium go into 4s and not 3d?', o:['3d is full', '4s has the lower value of n + l', 'Hund\'s rule forbids 3d', '4s is closer to the nucleus'], a:1, why:'4s has n + l = 4 and 3d has n + l = 5, so 4s is lower in energy and fills first (Madelung\'s rule).' },
  { q:'Nitrogen ({m:1s^2\\,2s^2\\,2p^3}) has how many unpaired electrons?', o:['0', '1', '3', '5'], a:2, why:'By Hund\'s rule the three 2p electrons occupy the three 2p orbitals singly with parallel spins.' },
  { q:'Across a period from sodium to argon, the atomic radius', o:['increases', 'decreases', 'stays the same', 'first increases, then decreases'], a:1, why:'The nuclear charge rises while electrons are added to the same shell, so the shell is pulled in.' },
  { q:'Which element has the highest electronegativity?', o:['Oxygen', 'Chlorine', 'Fluorine', 'Caesium'], a:2, why:'Fluorine, at 3.98 on the Pauling scale. Electronegativity rises to the top right of the table (noble gases excluded).' }]);
})();
