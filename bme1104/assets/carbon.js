/* BME 1104 interactive notes, Chapter 7: carbon and its compounds */
(() => {
'use strict';
const PI = Math.PI;
const SUBD = s => s.replace(/(\d+)/g, d => [...d].map(c => '₀₁₂₃₄₅₆₇₈₉'[c]).join(''));
function formula(mol){ const n = {}; mol.atoms.forEach(a => n[a.el] = (n[a.el] || 0) + 1); const ks = ['C', 'H', ...Object.keys(n).filter(k => k !== 'C' && k !== 'H').sort()].filter(k => n[k]);
  return { txt:ks.map(k => k + (n[k] > 1 ? n[k] : '')).join(''), M:ks.reduce((a, k) => a + n[k]*EL_MASS[EL_SYM.indexOf(k)], 0), n }; }
function hyb(mol){ const c = { sp3:0, sp2:0, sp:0 }; mol.atoms.forEach((a, i) => { if (a.el !== 'C') return; let mx = 1; mol.bonds.forEach(([x, y, o]) => { if (x === i || y === i) mx = Math.max(mx, o); }); c[mx >= 3 ? 'sp' : mx > 1 ? 'sp2' : 'sp3']++; }); return c; }
function placeMol(g, smi, style, sc){ const mol = molecule(smi), sub = new THREE.Group(); drawMolecule(sub, mol, { style, scale:sc || 1 }); const box = new THREE.Box3().setFromObject(sub), c = box.getCenter(new THREE.Vector3()); sub.position.sub(c); const w = new THREE.Group(); w.add(sub); g.add(w); return { w, box, mol }; }

/* ================= 7.1 hybrid orbitals ================= */
{ let mode = 'sp3', grp = null;
  const v = niceGL(view3d($('hy'), { cam:[3.2, 2.4, 5.2], fov:36, build(v){ v.root.add(grp = new THREE.Group()); }, update(dt, v){ v.root.rotation.y += dt*0.2; } }));
  const hM = new THREE.MeshPhysicalMaterial({ color:0xa8b3c0, transparent:true, opacity:0.55, roughness:0.35, depthWrite:false });
  function build(){ const D = { sp3:unitDirs(4, 0)[0], sp2:[0, 1, 2].map(i => new THREE.Vector3(Math.cos(i*2*PI/3), 0, Math.sin(i*2*PI/3))), sp:[new THREE.Vector3(1, 0, 0), new THREE.Vector3(-1, 0, 0)] }[mode];
    if (grp){ clearMesh(grp); grp.add(new THREE.Mesh(new THREE.SphereGeometry(0.2, 32, 20), gloss(atomColor('C'))));
      D.forEach((d, i) => { grp.add(lobe(d, 1.25, hM)); const isC = (mode === 'sp2' && i === 0) || (mode === 'sp' && i === 0), s = new THREE.Mesh(new THREE.SphereGeometry(isC ? 0.2 : 0.14, 28, 18), gloss(atomColor(isC ? 'C' : 'H'))); s.position.copy(d.clone().multiplyScalar(1.45)); grp.add(s);
        const t = textSprite(isC ? 'C' : 'H', { h:0.2, color:'#33404c' }); t.position.copy(d.clone().multiplyScalar(1.8)); grp.add(t); });
      (mode === 'sp2' ? ['pz'] : mode === 'sp' ? ['py', 'pz'] : []).forEach(k => { const m = orbitalMesh(k, 0.95); m.material.opacity = 0.75; grp.add(m); });
      const ct = textSprite('C', { h:0.22, color:'#ffffff', depth:false }); grp.add(ct); v.render(); }
    $('hy_t').textContent = { sp3:'Hybrid orbitals of carbon: sp³ in methane', sp2:'Hybrid orbitals of carbon: sp² in ethene', sp:'Hybrid orbitals of carbon: sp in ethyne' }[mode];
    $('hy_sub').textContent = { sp3:'4 hybrids at 109.5°, no π bond', sp2:'3 hybrids at 120°, 1 p orbital for the π bond', sp:'2 hybrids at 180°, 2 p orbitals for two π bonds' }[mode];
    $('hy_cap').innerHTML = { sp3:'The 2s and the three 2p orbitals mix into four equal sp³ hybrids pointing to the corners of a tetrahedron. Each overlaps a hydrogen 1s orbital end on to form a σ bond. All alkanes are built from sp³ carbons.', sp2:'Three sp² hybrids lie flat at 120°: two bond to hydrogens and one to the other carbon. The leftover p orbital stands at right angles to the plane and overlaps side on with the p orbital of the next carbon: that is the π bond of C=C. It stops rotation about the bond, which is why cis and trans isomers exist.', sp:'Two sp hybrids point in opposite directions, so the molecule is linear. The two remaining p orbitals, at right angles to each other, form two π bonds: with the σ bond this is the C≡C triple bond of ethyne.' }[mode]; }
  segGroup(document.querySelector('#s1 .seg'), m => { mode = m; build(); });
  build(); }

/* ================= 7.2 alkane series ================= */
{ const cv = $('alk'), N = ['methane', 'ethane', 'propane', 'butane', 'pentane', 'hexane', 'heptane', 'octane', 'nonane', 'decane', 'undecane', 'dodecane', 'tridecane', 'tetradecane', 'pentadecane', 'hexadecane', 'heptadecane', 'octadecane', 'nonadecane', 'icosane'];
  const BP = [-162, -89, -42, -1, 36, 69, 98, 126, 151, 174, 196, 216, 235, 254, 271, 287, 302, 316, 330, 343], MP = [-182, -183, -188, -138, -130, -95, -91, -57, -54, -30, -26, -10, -5, 6, 10, 18, 22, 28, 32, 37];
  function draw(){ readColors(); const xs = BP.map((_, i) => i + 1);
    plot(cv, { xmin:0, xmax:21, ymin:-200, ymax:380, xlab:'number of carbon atoms n', ylab:'temperature [°C]', xfmt:v => Number.isInteger(v) ? String(v) : '',
      series:[{ x:xs, y:BP, color:C.crank, w:2.2 }, { x:xs, y:MP, color:C.rod, w:2.2 }], points:xs.map(n => ({ x:n, y:BP[n - 1], color:C.crank, r:4, n })).concat(xs.map(n => ({ x:n, y:MP[n - 1], color:C.rod, r:3, n }))),
      hl:[{ v:25, color:C.muted, label:'room temperature' }], bands:[{ y:[-200, 25], color:C.rod, a:0.0 }], legend:[{ color:C.crank, label:'boiling point' }, { color:C.rod, label:'melting point' }] }); }
  hoverPoints(cv, p => { if (!p) return; const n = p.n, st = BP[n - 1] < 25 ? 'gas' : MP[n - 1] > 25 ? 'solid (wax)' : 'liquid';
    $('al_cap').innerHTML = `${N[n - 1][0].toUpperCase() + N[n - 1].slice(1)}, ${ce(`C${n > 1 ? n : ''}H${2*n + 2}`)}: melts at ${MP[n - 1]} °C, boils at ${BP[n - 1]} °C, a ${st} at room temperature. Molar mass ${fmt(n*12.011 + (2*n + 2)*1.008, 1)} g/mol.`; });
  watchSize(cv, draw); onRedraw(draw); draw(); }

/* ================= 7.2 molecules in 3D ================= */
{ const F = {
    alk:[['methane', 'C', -162, 'The simplest alkane, a tetrahedron. Main component of natural gas and biogas.'], ['ethane', 'CC', -89, 'Rotation about the C–C single bond is free.'], ['propane', 'CCC', -42, 'LPG for cooking and forklifts.'], ['butane', 'CCCC', -1, 'Straight-chain butane (n-butane).'],
      ['2-methylpropane (isobutane)', 'CC(C)C', -12, 'An isomer of butane: same formula C₄H₁₀, branched skeleton, lower boiling point. Used as the refrigerant R-600a in household fridges.'], ['pentane', 'CCCCC', 36, 'Straight chain, the first liquid alkane.'],
      ['2-methylbutane (isopentane)', 'CC(C)CC', 28, 'A branched isomer of pentane.'], ['2,2-dimethylpropane (neopentane)', 'CC(C)(C)C', 10, 'The most compact pentane isomer, nearly spherical, so it has the weakest London forces and the lowest boiling point.'],
      ['octane', 'CCCCCCCC', 126, 'Straight-chain octane knocks badly in an engine.'], ['2,2,4-trimethylpentane (iso-octane)', 'CC(C)(C)CC(C)C', 99, 'The reference fuel defining 100 on the octane scale: its compact branched structure resists knock.']],
    ene:[['ethene (ethylene)', 'C=C', -104, 'Flat, with a C=C double bond. The most produced organic chemical: the monomer of polyethylene.'], ['propene (propylene)', 'C=CC', -48, 'Monomer of polypropylene.'], ['but-1-ene', 'C=CCC', -6, 'Double bond at the end of the chain.'],
      ['but-2-ene', 'CC=CC', 1, 'Internal double bond, so it exists as cis and trans isomers (drawn here as one of them).'], ['2-methylpropene (isobutene)', 'C=C(C)C', -7, 'A branched isomer of butene, used to make butyl rubber for tyre inner tubes.'], ['buta-1,3-diene', 'C=CC=C', -4, 'A diene: two double bonds. Monomer for synthetic rubbers.'],
      ['ethyne (acetylene)', 'C#C', -84, 'Linear, with a C≡C triple bond. Burns with oxygen at about 3100 °C in oxy-acetylene welding and cutting.'], ['propyne', 'C#CC', -23, 'A terminal alkyne.'], ['but-2-yne', 'CC#CC', 27, 'Four carbons in a straight line: no cis or trans forms.']],
    ring:[['cyclopropane', 'C1CC1', -33, 'A strained ring: 60° angles instead of 109.5°, so it is unusually reactive.'], ['cyclobutane', 'C1CCC1', 13, 'A puckered four-membered ring.'], ['cyclopentane', 'C1CCCC1', 49, 'Nearly strain-free.'], ['cyclohexane', 'C1CCCCC1', 81, 'Takes the strain-free chair shape with perfect 109.5° angles. Solvent and raw material for nylon.'],
      ['benzene', 'c1ccccc1', 80, 'Flat hexagon, all C–C bonds equal (139 pm) because the six π electrons are delocalised around the ring. Toxic; a raw material for plastics and dyes.'], ['methylbenzene (toluene)', 'Cc1ccccc1', 111, 'A common solvent in paints and adhesives, and an octane booster in petrol.'], ['naphthalene', 'c1ccc2ccccc2c1', 218, 'Two fused aromatic rings. The smell of mothballs.']],
    fg:[['methanol', 'CO', 65, 'Alcohol. Fuel and solvent; toxic to drink.'], ['ethanol', 'CCO', 78, 'Alcohol. Biofuel blended into petrol (E10), and in drinks.'], ['propan-2-ol (isopropyl alcohol)', 'CC(O)C', 82, 'Secondary alcohol. Cleaning electronics and disinfecting.'], ['ethanamine', 'CCN', 17, 'Primary amine. The lone pair on N makes it a base.'],
      ['chloromethane', 'CCl', -24, 'Organohalide.'], ['dichlorodifluoromethane (R-12)', 'FC(F)(Cl)Cl', -30, 'The old CFC refrigerant, phased out under the Montreal Protocol because chlorine from it destroys stratospheric ozone.'], ['methoxyethane', 'COCC', 7, 'Ether: no O–H, so no hydrogen bonding between molecules and a low boiling point.'],
      ['methanal (formaldehyde)', 'C=O', -19, 'Aldehyde. Used in phenol-formaldehyde and urea-formaldehyde resins (Bakelite, chipboard glue).'], ['propanone (acetone)', 'CC(=O)C', 56, 'Ketone. Solvent and degreaser.'], ['ethanoic acid (acetic acid)', 'CC(=O)O', 118, 'Carboxylic acid; vinegar is about 5 % ethanoic acid.'],
      ['ethyl ethanoate', 'CC(=O)OCC', 77, 'Ester made from ethanoic acid and ethanol. Solvent in glues and nail varnish.'], ['ethanamide', 'CC(N)=O', 221, 'Amide. The amide link –CO–NH– joins the units in nylons and in proteins.']] };
  let fam = 'alk', cur = 0, style = 'ball', grp = null; const chips = $('mv_chips');
  const v = niceGL(view3d($('mv'), { cam:[0, 1.2, 9], fov:36, build(v){ v.root.add(grp = new THREE.Group()); }, update(dt, v){ v.root.rotation.y += dt*0.2; } }));
  function setChips(){ chips.innerHTML = F[fam].map((m, i) => `<button type="button" data-i="${i}" aria-pressed="${i === cur}">${m[0].replace(/ \(.*\)/, '')}</button>`).join(''); }
  function show(){ const m = F[fam][cur], mol = molecule(m[1]), f = formula(mol), h = hyb(mol);
    if (grp){ clearMesh(grp); const r = placeMol(grp, m[1], style, 1); const s = r.box.getSize(new THREE.Vector3()), mx = Math.max(s.x, s.y, s.z); grp.scale.setScalar(Math.min(1.7, 5.5/mx)); v.render(); }
    $('mv_t').textContent = `Molecules in 3D: ${m[0]}`;
    $('mv_sub').textContent = `SMILES ${m[1]}`;
    $('mv_st').innerHTML = statsHTML([['Formula', SUBD(f.txt)], ['Molar mass', `${fmt(f.M, 2)} g/mol`], ['Carbon hybridisation', ['sp3', 'sp2', 'sp'].filter(k => h[k]).map(k => `${h[k]} ${k.replace('3', '³').replace('2', '²')}`).join(', ') || 'none'], ['Boiling point', `${m[2]} °C`]]);
    $('mv_cap').innerHTML = m[3]; }
  chips.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; cur = +b.dataset.i; chips.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b)); show(); });
  segGroup($('mv_fam'), m => { fam = m; cur = 0; setChips(); show(); });
  segGroup($('mv_sty'), s => { style = s; show(); });
  setChips(); show(); }

/* ================= 7.3 naming example ================= */
example($('ex1'), { title:'Example 7.1: naming organic compounds', src:'Example 13.2 in the notes',
  q:'Give the IUPAC names of (a) {ce:CH3CH2CH(CH3)CH2CH3}, (b) {ce:CH3CH(CH3)CHClCH3}, (c) {ce:CH3-O-CH2CH2CH3} and (d) {ce:CH3CH(NH2)CH3}.', inputs:[],
  solve:() => [['(a) A branched alkane. The longest chain has 5 carbons: pentane. Numbered from either end, the methyl group is on carbon 3.', '3-methylpentane', true],
    ['(b) An alkyl chloride. The longest chain has 4 carbons: butane. Number from the left so the substituents get the lowest numbers: chlorine on carbon 2 and a methyl group on carbon 3. Substituents are listed alphabetically.', '2-chloro-3-methylbutane', true],
    ['The notes give "2-chlorobutane", which misses the methyl branch: 2-chlorobutane would be {ce:CH3CHClCH2CH3}.', ''],
    ['(c) An ether. The larger alkyl group, propyl, is the parent (propane); the smaller, methyl, becomes the methoxy prefix on carbon 1.', '1-methoxypropane', true],
    ['(d) A primary amine. The chain has 3 carbons: propane. The –NH₂ group is on carbon 2 from either end; the number goes before the -amine ending.', 'propan-2-amine', true]] });

/* ================= 7.5 reactions in 3D ================= */
{ const RX = [
    ['Addition', 'Bromine adds to ethene', [['C=C', 'ethene'], ['BrBr', 'bromine']], [['BrCCBr', '1,2-dibromoethane']], 'Br2 + CH2=CH2 -> BrCH2CH2Br', 'The π bond opens and one bromine atom adds to each carbon. The brown colour of bromine water disappears: the standard test for a C=C double bond.'],
    ['Addition', 'Hydrogen chloride adds to ethene', [['C=C', 'ethene'], ['Cl', 'hydrogen chloride']], [['CCCl', 'chloroethane']], 'CH2=CH2 + HCl -> CH3CH2Cl', 'H goes to one carbon and Cl to the other. The double bond becomes single and the carbons change from sp² to sp³.'],
    ['Elimination', 'Dehydration of ethanol', [['CCO', 'ethanol']], [['C=C', 'ethene'], ['O', 'water']], 'C2H5OH ->[conc. H2SO4][170 °C] C2H4 + H2O', 'Hot concentrated sulfuric acid removes H and OH from neighbouring carbons as water, leaving a double bond: the reverse of adding water to ethene.'],
    ['Substitution', 'A tertiary alcohol with HCl', [['CC(C)(C)O', '2-methylpropan-2-ol'], ['Cl', 'hydrogen chloride']], [['CC(C)(C)Cl', '2-chloro-2-methylpropane'], ['O', 'water']], '(CH3)3COH + HCl -> (CH3)3CCl + H2O', 'The –OH is replaced by –Cl. With three methyl groups crowding the carbon, the reaction goes through a carbocation (CH₃)₃C⁺ (S<sub>N</sub>1). A primary alcohol reacts in one step instead (S<sub>N</sub>2).'],
    ['Condensation', 'Ethanoic acid and ethanol form an ester', [['CC(=O)O', 'ethanoic acid'], ['CCO', 'ethanol']], [['CC(=O)OCC', 'ethyl ethanoate'], ['O', 'water']], 'CH3COOH + C2H5OH <=> CH3COOC2H5 + H2O', 'Two molecules join and give off water. Repeating this with molecules that have two acid groups and two alcohol groups builds a polyester such as PET (Chapter 8).'],
    ['Oxidation', 'Complete combustion of methane', [['C', 'methane'], ['O=O', 'oxygen'], ['O=O', 'oxygen']], [['O=C=O', 'carbon dioxide'], ['O', 'water'], ['O', 'water']], 'CH4 + 2O2 -> CO2 + 2H2O', 'Carbon goes from oxidation state −4 to +4. The reaction releases 890 kJ per mole of methane (Chapter 9).']];
  let cur = 0, grp = null; const chips = $('rx_chips');
  chips.innerHTML = RX.map((r, i) => `<button type="button" data-i="${i}" aria-pressed="${i === cur}">${r[0]}: ${r[1].toLowerCase()}</button>`).join('');
  const v = niceGL(view3d($('rx'), { cam:[0, 1.6, 13], fov:36, build(v){ v.root.add(grp = new THREE.Group()); },
    update(dt, v){ grp.children.forEach(c => { if (c.userData.spin) c.children[0].rotation.y += dt*0.4; }); } }));
  function show(){ const r = RX[cur];
    if (grp){ clearMesh(grp); const place = (list, x0, x1) => { const n = list.length; list.forEach(([s, nm], i) => { const x = n === 1 ? (x0 + x1)/2 : x0 + i*(x1 - x0)/(n - 1), p = placeMol(grp, s, 'ball', 1); const sz = p.box.getSize(new THREE.Vector3()); p.w.scale.setScalar(Math.min(1.1, 2.3/Math.max(sz.x, sz.y, 0.1))); p.w.position.set(x, 0.3, 0); p.w.userData.spin = true;
        const t = textSprite(nm, { h:0.32, color:'#33404c' }); t.position.set(x, -1.7, 0); grp.add(t); if (i < n - 1){ const plus = textSprite('+', { h:0.5, color:'#33404c' }); plus.position.set(x + (x1 - x0)/(n - 1)/2, 0.3, 0); grp.add(plus); } }); };
      place(r[2], -4.9, -1.9); place(r[3], 1.9, 4.9); grp.add(arrow3(new THREE.Vector3(-0.8, 0.3, 0), new THREE.Vector3(0.8, 0.3, 0), 0x33404c, 0.05)); v.render(); }
    $('rx_t').textContent = `Reaction types: ${r[0].toLowerCase()}`; $('rx_sub').textContent = r[1];
    $('rx_eq').innerHTML = ce(r[4]); $('rx_cap').innerHTML = r[5]; }
  chips.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; cur = +b.dataset.i; chips.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b)); show(); });
  show(); }

example($('ex2'), { title:'Example 7.2: carbon dioxide from a tank of petrol', src:'combustion of an alkane',
  q:'Treat petrol as octane, {ce:C8H18} (density 0.74 kg/L). How much carbon dioxide does burning 40 L produce? {ce:2C8H18 + 25O2 -> 16CO2 + 18H2O}',
  inputs:[['V', 'Volume of petrol', 40, 'L'], ['rho', 'Density', 0.74, 'kg/L']],
  solve:v => { const m = v.V*v.rho*1000, Mo = 8*12.011 + 18*1.008, n = m/Mo, co2 = n*8*44.009/1000;
    return [['Mass of fuel = ' + v.V + ' L × ' + v.rho + ' kg/L =', `${fmt(m/1000, 1)} kg`], ['Molar mass of octane = 8 × 12.011 + 18 × 1.008 =', `${fmt(Mo, 2)} g/mol`], ['Moles of octane =', `${fmt(n, 0)} mol`],
      ['Each mole gives 8 mol of CO₂ (44.01 g/mol):', `${fmt(co2, 1)} kg of CO₂`, true], ['The carbon dioxide weighs about three times as much as the fuel, because each carbon atom picks up two oxygen atoms from the air.', '']]; } });

/* ================= quiz ================= */
quiz($('qz'), [
  { q:'A carbon atom with one double bond and two single bonds is', o:['sp³', 'sp²', 'sp', 'not hybridised'], a:1, why:'One π bond means sp² hybridisation: three σ bonds at 120°.' },
  { q:'The general formula of the alkenes is', o:['{m:\\mathrm{C}_n\\mathrm{H}_{2n+2}}', '{m:\\mathrm{C}_n\\mathrm{H}_{2n}}', '{m:\\mathrm{C}_n\\mathrm{H}_{2n-2}}', '{m:\\mathrm{C}_n\\mathrm{H}_{n}}'], a:1, why:'One double bond removes two hydrogens from the alkane formula.' },
  { q:'Butane and 2-methylpropane are', o:['the same compound', 'structural isomers', 'cis and trans isomers', 'different alkenes'], a:1, why:'Both are {ce:C4H10}, with different carbon skeletons.' },
  { q:'Why do the alkynes have no cis and trans isomers?', o:['They have no double bonds', 'The sp carbons of the triple bond are linear', 'They are always cyclic', 'They are too reactive'], a:1, why:'Each triple-bond carbon has only one other substituent, in a straight line, so there are no "sides".' },
  { q:'The IUPAC name of {ce:CH3CH2CH2OH} is', o:['propanal', 'propan-1-ol', 'propan-2-ol', 'propanone'], a:1, why:'Three carbons, an alcohol (-ol) on carbon 1.' },
  { q:'Which functional group is present in ethyl ethanoate?', o:['carboxylic acid', 'ester', 'ether', 'ketone'], a:1, why:'–COO– linking two alkyl groups is an ester.' },
  { q:'Bromine water losing its colour when shaken with a hydrocarbon shows', o:['an alcohol', 'a C=C double bond', 'an aromatic ring', 'a saturated alkane'], a:1, why:'Bromine adds across the double bond (an addition reaction).' },
  { q:'Making ethene from ethanol with hot concentrated sulfuric acid is', o:['addition', 'substitution', 'elimination', 'condensation'], a:2, why:'Water is removed from ethanol, leaving a double bond.' }]);
})();
