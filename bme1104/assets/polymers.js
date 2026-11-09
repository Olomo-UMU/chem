/* BME 1104 interactive notes, Chapter 8: polymers */
(() => {
'use strict';
const PI = Math.PI;
const lgam = x => { const c = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5]; let y = x, t = x + 5.5; t -= (x + 0.5)*Math.log(t); let s = 1.000000000190015; for (const k of c) s += k/++y; return -t + Math.log(2.5066282746310005*s/x); };

/* ================= 8.1 molecular weight distribution ================= */
{ const cv = $('mw'), P = {}, M0 = 28.05;
  controls($('mw_c'), [['xn', 'Number-average degree of polymerisation', 200, 20000, 50, 3000, ''], ['pdi', 'Dispersity Mw/Mn', 1.02, 5, 0.01, 2, '']], P, draw);
  function draw(){ readColors(); const k = 1/(P.pdi - 1), Mn = P.xn*M0, Mw = Mn*P.pdi, xs = [], nf = [], wf = [];
    for (let i = 0; i <= 240; i++){ const M = Mn/30*Math.pow(900, i/240), x = M/Mn; const ln = k*Math.log(k) - lgam(k) + (k - 1)*Math.log(x) - k*x; xs.push(M); nf.push(Math.exp(ln)*x); wf.push(Math.exp(ln)*x*x); }
    const mx = Math.max(...nf, ...wf); plot(cv, { xlog:true, xmin:Mn/30, xmax:Mn*30, ymin:0, ymax:1.1, xlab:'molar mass M [g/mol]', ylab:'fraction (scaled)', yfmt:() => '',
      series:[{ x:xs, y:nf.map(v => v/mx), color:C.rod, w:2.2, fill:true }, { x:xs, y:wf.map(v => v/mx), color:C.crank, w:2.2 }],
      vl:[{ v:Mn, color:C.rod, label:'Mn' }, { v:Mw, color:C.crank, label:'Mw', dy:14 }], legend:[{ color:C.rod, label:'number of chains' }, { color:C.crank, label:'mass in those chains' }] });
    $('mw_sub').textContent = `polyethylene, repeat unit 28.05 g/mol`;
    $('mw_st').innerHTML = statsHTML([['Mn', `${fmt(Mn/1000, 1)} kg/mol`], ['Mw', `${fmt(Mw/1000, 1)} kg/mol`], ['Dispersity', fmt(P.pdi, 2)], ['DP (number average)', fmt(P.xn, 0)]]);
    $('mw_cap').innerHTML = `Most chains are near M<sub>n</sub>, but the long chains carry a large share of the mass, so the weight average M<sub>w</sub> = ${fmt(Mw/1000, 1)} kg/mol lies to the right. ${P.pdi < 1.2 ? 'A narrow distribution like this comes from carefully controlled (living) polymerisation.' : P.pdi > 3 ? 'A broad distribution: the short chains help the melt flow in moulding, the long chains give strength and toughness.' : 'Commercial addition polymers typically have a dispersity of 2 to 5.'} Strength, toughness and melt viscosity rise with chain length.`; }
  watchSize(cv, draw); onRedraw(draw); draw(); }

example($('ex1'), { title:'Example 8.1: number and weight average molar mass', src:'molecular weight',
  q:'A polymer sample contains 100 chains of molar mass 10 000 g/mol, 200 chains of 50 000 g/mol and 50 chains of 200 000 g/mol. Find {m:\\bar M_n}, {m:\\bar M_w} and the dispersity.',
  inputs:[['n1', 'Chains in fraction 1', 100, ''], ['M1', 'Molar mass 1', 10000, 'g/mol'], ['n2', 'Chains in fraction 2', 200, ''], ['M2', 'Molar mass 2', 50000, 'g/mol'], ['n3', 'Chains in fraction 3', 50, ''], ['M3', 'Molar mass 3', 200000, 'g/mol']],
  solve:v => { const N = v.n1 + v.n2 + v.n3, S1 = v.n1*v.M1 + v.n2*v.M2 + v.n3*v.M3, S2 = v.n1*v.M1**2 + v.n2*v.M2**2 + v.n3*v.M3**2, Mn = S1/N, Mw = S2/S1;
    return [['Σnᵢ =', fmt(N, 0)], ['ΣnᵢMᵢ =', sci(S1, 3) + ' g/mol'], ['M̄n = ΣnᵢMᵢ / Σnᵢ =', `${fmt(Mn, 0)} g/mol`, true], ['ΣnᵢMᵢ² =', sci(S2, 3) + ' (g/mol)²'], ['M̄w = ΣnᵢMᵢ² / ΣnᵢMᵢ =', `${fmt(Mw, 0)} g/mol`, true], ['Dispersity M̄w/M̄n =', fmt(Mw/Mn, 2), true],
      ['Only 50 of the 350 chains are long, yet they hold more than half of the mass, which pulls M̄w well above M̄n.', '']]; } });

/* ================= 8.1 copolymers ================= */
{ const cv = $('cpo'); let kind = 'rand';
  function draw(){ const { ctx, W, H } = prep(cv); readColors(); const n = Math.max(4, Math.min(30, Math.floor((W - 40)/22))), r = 9, gap = 22, x0 = (W - (n - 1)*gap)/2, y = kind === 'graft' ? H*0.3 : H/2;
    let s = 5; const R = () => (s = (s*16807) % 2147483647)/2147483647;
    const seq = [...Array(n)].map((_, i) => kind === 'rand' ? (R() < 0.5 ? 0 : 1) : kind === 'alt' ? i % 2 : kind === 'block' ? (Math.floor(i/6) % 2) : 0);
    const col = [C.rod, C.crank];
    ctx.strokeStyle = C.muted; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 + (n - 1)*gap, y); ctx.stroke();
    if (kind === 'graft') [4, 13, 22].filter(i => i < n).forEach(i => { ctx.strokeStyle = C.muted; ctx.beginPath(); ctx.moveTo(x0 + i*gap, y); ctx.lineTo(x0 + i*gap, y + 5*gap*0.8); ctx.stroke(); for (let k = 1; k <= 5; k++){ ctx.fillStyle = col[1]; ctx.beginPath(); ctx.arc(x0 + i*gap, y + k*gap*0.8, r, 0, 7); ctx.fill(); } });
    seq.forEach((t, i) => { ctx.fillStyle = col[t]; ctx.beginPath(); ctx.arc(x0 + i*gap, y, r, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = `600 10px ${C.mono}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(t ? 'B' : 'A', x0 + i*gap, y); });
    $('cp_t').textContent = `Copolymer arrangements: ${{ rand:'random', alt:'alternating', block:'block', graft:'graft' }[kind]}`;
    $('cp_cap').innerHTML = { rand:'A and B follow each other at random along the chain. Ethylene–vinyl acetate (EVA) is an example: the acetate groups break up the crystals and keep the plastic flexible in the cold.', alt:'A and B strictly alternate, ABAB. This happens when each monomer reacts much faster with the other than with itself.', block:'Long runs of A followed by long runs of B. Block copolymers such as SBS (styrene–butadiene–styrene) behave as rubbers at room temperature yet can be melted and moulded: thermoplastic elastomers for shoe soles and seals.', graft:'Chains of B grafted onto a backbone of A. High-impact polystyrene and ABS use rubber grafts to stop cracks, making them tough.' }[kind]; }
  segGroup(document.querySelector('#s1 .seg'), m => { kind = m; draw(); });
  watchSize(cv, draw); onRedraw(draw); draw(); }

/* ================= 8.2 polymerisation animation ================= */
{ const cv = $('pz'); let mode = 'add', CL = [], waters = [], t = 0;
  function reset(){ CL = []; waters = []; t = 0; const { W, H } = { W:cv.clientWidth || 800, H:cv.clientHeight || 380 }; const n = mode === 'add' ? 80 : 70;
    for (let i = 0; i < n; i++){ const a = Math.random()*2*PI; CL.push({ x:30 + Math.random()*(W - 60), y:30 + Math.random()*(H - 70), vx:Math.cos(a)*30, vy:Math.sin(a)*30, u:mode === 'add' ? [0] : [i % 2], rad:false, dead:false, ph:Math.random()*6 }); }
    if (mode === 'add') for (let i = 0; i < 4; i++) CL[i].rad = true; }
  const ends = c => mode === 'con' ? [c.u[0], c.u[c.u.length - 1]] : null;
  const beadPos = (c, i) => { const s = 9, a = c.ph + 0.5*Math.sin(i*0.35 + c.ph); let x = c.x, y = c.y; for (let k = 0; k < i; k++){ const ak = c.ph + 0.9*Math.sin(k*0.45 + c.ph*1.7); x += s*Math.cos(ak); y += s*Math.sin(ak); } return [x, y]; };
  function step(dt){ const W = cv.clientWidth, H = cv.clientHeight - 30; t += dt;
    CL.forEach(c => { const sp = 1/Math.sqrt(c.u.length); c.vx += (Math.random() - 0.5)*80*dt; c.vy += (Math.random() - 0.5)*80*dt; const m = Math.hypot(c.vx, c.vy) || 1; c.vx *= 30/m; c.vy *= 30/m;
      c.x += c.vx*sp*dt; c.y += c.vy*sp*dt; if (c.x < 15 || c.x > W - 15) c.vx *= -1; if (c.y < 15 || c.y > H - 15) c.vy *= -1; c.x = clamp(c.x, 15, W - 15); c.y = clamp(c.y, 15, H - 15); c.ph += dt*0.15; });
    for (let i = 0; i < CL.length; i++) for (let j = 0; j < CL.length; j++){ if (i === j) continue; const a = CL[i], b = CL[j]; if (!a || !b) continue;
      const tail = beadPos(a, a.u.length - 1), d = Math.hypot(tail[0] - b.x, tail[1] - b.y); if (d > (mode === 'add' ? 22 : 15)) continue;
      if (mode === 'add'){ if (!a.rad || a.dead) continue; if (b.rad && !b.dead && b.u.length > 1){ a.u = a.u.concat(b.u.slice().reverse()); a.dead = true; a.rad = false; CL.splice(j, 1); break; } if (!b.rad && b.u.length === 1){ a.u.push(0); CL.splice(j, 1); break; } }
      else { const ea = ends(a), eb = ends(b); if (ea[1] !== eb[0]){ a.u = a.u.concat(b.u); CL.splice(j, 1); waters.push({ x:tail[0], y:tail[1], life:2 }); break; } if (ea[1] !== eb[1]){ a.u = a.u.concat(b.u.slice().reverse()); CL.splice(j, 1); waters.push({ x:tail[0], y:tail[1], life:2 }); break; } } }
    waters.forEach(w => { w.y -= 20*dt; w.life -= dt; }); waters = waters.filter(w => w.life > 0);
    if (mode === 'add' && t > 3 && CL.filter(c => c.rad && !c.dead).length < 3 && Math.random() < dt*0.6){ const m = CL.find(c => !c.rad && c.u.length === 1); if (m) m.rad = true; } }
  function draw(){ const { ctx, W, H } = prep(cv); readColors(); const col = mode === 'add' ? [C.rod] : [C.crank, C.rod];
    CL.forEach(c => { const pts = c.u.map((_, i) => beadPos(c, i)); if (pts.length > 1){ ctx.strokeStyle = alpha(C.ink, 0.5); ctx.lineWidth = 2; ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); }
      pts.forEach(([x, y], i) => { ctx.fillStyle = col[c.u[i]] || col[0]; ctx.beginPath(); ctx.arc(x, y, c.u.length === 1 ? 5 : 4.5, 0, 7); ctx.fill(); });
      if (mode === 'add' && c.rad && !c.dead){ const [x, y] = pts[pts.length - 1]; ctx.fillStyle = '#e0b000'; ctx.beginPath(); ctx.arc(x, y, 6, 0, 7); ctx.fill(); ctx.fillStyle = C.ink; ctx.font = `700 10px ${C.mono}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('•', x, y); } });
    waters.forEach(w => { ctx.fillStyle = alpha('#5b9be0', clamp(w.life/2, 0, 1)); ctx.beginPath(); ctx.arc(w.x, w.y, 4, 0, 7); ctx.fill(); ctx.font = `10px ${C.mono}`; ctx.fillText('H₂O', w.x + 6, w.y); });
    const mono = CL.filter(c => c.u.length === 1 && !c.rad).length, tot = CL.reduce((a, c) => a + c.u.length, 0), chains = CL.filter(c => c.u.length > 1), avg = CL.length ? tot/CL.length : 0, longest = Math.max(...CL.map(c => c.u.length));
    ctx.fillStyle = C.muted; ctx.font = `12px ${C.mono}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(`free monomers ${mono}, chains ${chains.length}, longest chain ${longest} units, average size ${fmt(avg, 1)}`, 12, H - 12);
    const p = mode === 'con' ? 1 - CL.length/tot : 0;
    $('pz_t').textContent = mode === 'add' ? 'Polymerisation: addition (chain growth)' : 'Polymerisation: condensation (step growth)';
    $('pz_sub').textContent = mode === 'add' ? 'yellow dots are radical chain ends' : `extent of reaction p = ${fmt(p, 2)}, Carothers DP = 1/(1 − p) = ${fmt(1/Math.max(1e-3, 1 - p), 1)}`;
    $('pz_cap').innerHTML = mode === 'add' ? 'A few radicals start chains, and each chain grows rapidly by adding monomers one at a time to its radical end. Long chains exist almost from the start while most of the monomer is still unreacted. A chain stops when two radical ends meet (termination by combination).' : 'Any acid end (orange) can react with any amine end (blue), so monomers first pair up, then pairs join into fours, and so on, each join releasing a water molecule. The average chain stays short until nearly all the end groups have reacted: to reach DP = 100 the reaction must be 99 % complete. That is why condensation monomers must be very pure and exactly balanced.'; }
  const an = animate(cv, dt => { step(Math.min(dt, 0.05)); draw(); }); playButton($('pz_play'), an);
  segGroup(document.querySelector('#s2 .seg'), m => { mode = m; reset(); draw(); });
  $('pz_reset').addEventListener('click', () => { reset(); draw(); });
  watchSize(cv, draw); onRedraw(draw); reset(); draw(); }

/* ================= 8.3 polymer chains in 3D ================= */
const POL = [ // key, name, oligomer SMILES, monomer reaction (ce), density, Tg, Tm, strength, uses, note
  ['PE', 'polyethylene', 'CCCCCCCCCCCCCCCC', 'n CH2=CH2 -> [-CH2-CH2-]_n', '0.92 to 0.96', '−110', '110 to 135', '10 to 30', 'fuel tanks, pipes, film, cable insulation', 'The simplest polymer: a zigzag of sp³ carbons. Its smooth chains pack into crystals, more so in HDPE than in the branched LDPE.'],
  ['PP', 'polypropylene', 'CC(C)CC(C)CC(C)CC(C)CC(C)C', 'n CH2=CH(CH3) -> [-CH2-CH(CH3)-]_n', '0.90', '−10', '165', '35', 'bumpers, battery cases, hoses, hinges', 'A methyl group on every second carbon. In isotactic PP (Ziegler–Natta catalyst) all methyls are on the same side, so the chains coil into helices that crystallise; random (atactic) PP is a soft, sticky solid.'],
  ['PVC', 'polyvinyl chloride', 'CC(Cl)CC(Cl)CC(Cl)CC(Cl)CC(Cl)C', 'n CH2=CHCl -> [-CH2-CHCl-]_n', '1.38 to 1.45', '80', 'amorphous', '50', 'pipes, profiles, cable sheathing', 'Polar C–Cl bonds pull the chains together, so rigid PVC is hard; plasticisers push them apart to make flexible PVC. The chlorine makes it self-extinguishing.'],
  ['PS', 'polystyrene', 'CC(c1ccccc1)CC(c1ccccc1)CC(c1ccccc1)C', 'n CH2=CH(C6H5) -> [-CH2-CH(C6H5)-]_n', '1.05', '100', 'amorphous', '45', 'instrument panels, trims, insulation foam (EPS)', 'Bulky benzene rings hang off the chain, so it cannot crystallise: a clear, rigid, rather brittle glass at room temperature.'],
  ['PTFE', 'polytetrafluoroethylene', 'FC(F)(F)C(F)(F)C(F)(F)C(F)(F)C(F)(F)C(F)(F)C(F)(F)F', 'n CF2=CF2 -> [-CF2-CF2-]_n', '2.20', '115', '327', '25', 'bearings, seals, non-stick coatings, insulation', 'Fluorine atoms sheath the carbon backbone. The very strong C–F bonds give outstanding chemical resistance and the lowest friction of any solid.'],
  ['PMMA', 'polymethyl methacrylate', 'CC(C)(C(=O)OC)CC(C)(C(=O)OC)CC(C)(C(=O)OC)C', 'n CH2=C(CH3)COOCH3 -> [-CH2-C(CH3)(COOCH3)-]_n', '1.18', '105', 'amorphous', '70', 'lamp covers, glazing, light guides', 'Two side groups on every second carbon prevent crystallisation, so the polymer is a clear glass with 92 % light transmission.'],
  ['PA66', 'nylon 6,6 (polyamide)', 'CC(=O)CCCCC(=O)NCCCCCCNC(=O)C', 'n HOOC(CH2)4COOH + n H2N(CH2)6NH2 -> [-OC(CH2)4CONH(CH2)6NH-]_n + 2n H2O', '1.14', '78', '269', '80', 'gears, bearings, cable ties, fibres', 'A condensation polymer. The amide groups –CO–NH– hydrogen bond to neighbouring chains, which makes nylon strong, tough and high-melting.'],
  ['PET', 'polyethylene terephthalate', 'CC(=O)c1ccc(cc1)C(=O)OCCOC(=O)C', 'n HOOC-C6H4-COOH + n HOCH2CH2OH -> [-OC-C6H4-COO-CH2CH2-O-]_n + 2n H2O', '1.38', '75', '260', '55', 'bottles, fibres (polyester), film', 'A polyester: rigid benzene rings linked by ester groups. Chemolysis can split it back into its monomers for recycling.']];
{ let cur = 0, grp = null; const chips = $('pc_chips');
  chips.innerHTML = POL.map((p, i) => `<button type="button" data-i="${i}" aria-pressed="${i === cur}">${p[0]}</button>`).join('');
  const v = niceGL(view3d($('pc'), { cam:[0, 1.5, 12], fov:34, build(v){ v.root.add(grp = new THREE.Group()); }, update(dt, v){ v.root.rotation.y += dt*0.15; } }));
  function show(){ const p = POL[cur];
    if (grp){ clearMesh(grp); const sub = new THREE.Group(); drawMolecule(sub, molecule(p[2]), { style:'ball' }); const box = new THREE.Box3().setFromObject(sub), c = box.getCenter(new THREE.Vector3()), s = box.getSize(new THREE.Vector3()); sub.position.sub(c); const w = new THREE.Group(); w.add(sub); w.scale.setScalar(Math.min(1.3, 9/Math.max(s.x, s.y, s.z))); grp.add(w); v.render(); }
    $('pc_t').textContent = `Polymer chains in 3D: ${p[1]} (${p[0]})`; $('pc_sub').textContent = `density ${p[4]} g/cm³`;
    $('pc_eq').innerHTML = ce(p[3]);
    $('pc_st').innerHTML = statsHTML([['Glass transition Tg', `${p[5]} °C`], ['Melting point Tm', p[6] === 'amorphous' ? 'none (amorphous)' : `${p[6]} °C`], ['Tensile strength', `${p[7]} MPa`], ['Uses', p[8]]]);
    $('pc_cap').innerHTML = p[9]; }
  chips.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; cur = +b.dataset.i; chips.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b)); show(); });
  show();
  const extra = [['ABS', 'acrylonitrile butadiene styrene', '1.05', '105', 'amorphous', '45', 'dashboards, grilles, housings'], ['PC', 'polycarbonate', '1.20', '150', 'amorphous', '65', 'headlamp lenses, glazing, helmets'], ['PUR', 'polyurethane (solid)', '1.1 to 1.25', 'varies', 'thermoset', '25 to 50', 'seals, rollers, foam seats']];
  $('tab81').innerHTML = POL.map(p => [p[0] + ', ' + p[1], p[4], p[5], p[6], p[7], p[8]]).concat(extra.map(e => [e[0] + ', ' + e[1], e[2], e[3], e[4], e[5], e[6]])).map(r => `<tr><td>${r[0]}</td><td class="num">${r[1]}</td><td class="num">${r[2]}</td><td class="num">${r[3]}</td><td class="num">${r[4]}</td><td>${r[5]}</td></tr>`).join(''); }

example($('ex2'), { title:'Example 8.2: how long is a polyethylene chain?', src:'degree of polymerisation',
  q:'A grade of HDPE has {m:\\bar M_n} = 200 000 g/mol. Find its degree of polymerisation and the length of a fully stretched chain (each C–C bond adds 0.126 nm along the zigzag).',
  inputs:[['Mn', 'Number-average molar mass', 200000, 'g/mol'], ['M0', 'Repeat unit C₂H₄', 28.05, 'g/mol'], ['b', 'Length per C–C bond along the chain', 0.126, 'nm']],
  solve:v => { const dp = v.Mn/v.M0, L = 2*dp*v.b;
    return [['DP = M̄n / M₀ =', fmt(dp, 0), true], ['Carbon atoms per chain = 2 × DP =', fmt(2*dp, 0)], ['Stretched length = 2 DP × ' + v.b + ' nm =', `${fmt(L, 0)} nm = ${fmt(L/1000, 2)} μm`, true],
      ['The chain is about 0.5 nm thick, so it is like a rope thousands of times longer than its diameter. Such chains tangle, which is what gives a polymer melt its viscosity and the solid its toughness.', '']]; } });

/* ================= 8.4 recycling chart ================= */
{ const cv = $('rc');
  function draw(){ const { ctx, W, H } = prep(cv); readColors(); const parts = [['still in use', 2500, C.muted], ['recycled', 600, C.ok], ['incinerated', 800, C.mass], ['landfill or environment', 4900, C.crank]], tot = 8800, x0 = 20, w = W - 40, y = H*0.35, h = 40;
    let x = x0; ctx.font = `12px ${C.mono}`; ctx.textBaseline = 'middle';
    parts.forEach(([n, v, c], i) => { const ww = v/tot*w; ctx.fillStyle = alpha(c, 0.75); ctx.fillRect(x, y, ww - 2, h); ctx.fillStyle = C.ink; ctx.textAlign = 'center'; if (ww > 60) ctx.fillText(`${v} Mt`, x + ww/2, y + h/2);
      ctx.fillStyle = C.text; ctx.fillText(n, x + ww/2, y + h + 18 + (i % 2)*16); x += ww; }); }
  watchSize(cv, draw); onRedraw(draw); draw(); }

/* ================= quiz ================= */
quiz($('qz'), [
  { q:'For any polymer sample with chains of different lengths', o:['M̄n > M̄w', 'M̄w > M̄n', 'M̄w = M̄n', 'M̄w = 2M̄n always'], a:1, why:'The weight average gives extra weight to heavy chains, so it exceeds the number average unless all chains are equal.' },
  { q:'Which monomer can undergo addition polymerisation?', o:['ethane', 'ethene', 'ethanol', 'ethanoic acid'], a:1, why:'Addition polymerisation needs a C=C double bond to open.' },
  { q:'In condensation polymerisation', o:['nothing is given off', 'a small molecule such as water is given off', 'only one monomer is used', 'chains grow only by radicals'], a:1, why:'Each join between the two kinds of reactive group releases a small molecule.' },
  { q:'Nylon 6,6 is made from', o:['ethene', 'a diamine and a dicarboxylic acid', 'vinyl chloride', 'styrene and butadiene'], a:1, why:'Hexamethylenediamine and adipic acid (six carbons each) condense to form amide links.' },
  { q:'Why is polystyrene clear and amorphous?', o:['Its chains are very short', 'The bulky benzene side groups stop the chains packing into crystals', 'It contains chlorine', 'It is cross-linked'], a:1, why:'Irregular bulky side groups prevent crystallisation, so the polymer is a glass.' },
  { q:'Which plastic has the lowest density of the major plastics?', o:['PVC', 'PET', 'PP', 'PTFE'], a:2, why:'Polypropylene, about 0.90 g/cm³, floats on water.' },
  { q:'Adding a plasticiser to PVC', o:['makes it harder', 'makes it softer and flexible', 'cross-links it', 'raises its melting point'], a:1, why:'Plasticiser molecules separate the chains and weaken the forces between them.' },
  { q:'Breaking PET back into its monomers with water or alcohols is', o:['mechanical recycling', 'chemolysis (tertiary recycling)', 'pyrolysis', 'energy recovery'], a:1, why:'Chemolysis reverses the condensation reaction; it works best for condensation polymers.' }]);
})();
