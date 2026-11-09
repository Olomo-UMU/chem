/* BME 1104 interactive notes, Chapter 9: fuels and combustion */
(() => {
'use strict';
const PI = Math.PI;

/* ================= 9.2 bomb calorimeter ================= */
{ const FU = [['benzoic acid', 6325, 4.9, 'the standard used to find the water equivalent'], ['bituminous coal', 8000, 4.5, ''], ['wood (dry)', 4500, 6, ''], ['diesel', 10900, 13, 'liquids are weighed into a gelatine capsule'], ['naphthalene', 9688, 6.3, 'a second calibration standard']];
  let cur = 0, fired = false, tf = 0, therm = null, col = null, flash = null, stir = null, readout = null, rtx = null, v = null; const P = {}, cg = $('bcg'), chips = $('bc_chips');
  chips.innerHTML = FU.map((f, i) => `<button type="button" data-i="${i}" aria-pressed="${i === cur}">${f[0]}</button>`).join('');
  controls($('bc_c'), [['m', 'Mass of fuel m', 0.3, 1.5, 0.01, 0.83, 'g'], ['W', 'Mass of water W', 2000, 4000, 10, 3500, 'g'], ['w', 'Water equivalent w', 200, 800, 5, 385, 'g'], ['t1', 'Initial temperature t₁', 15, 30, 0.1, 26.5, '°C']], P, () => { fired = false; tf = 0; upd(); });
  const dT = () => P.m*FU[cur][1]/(P.W + P.w), Tat = s => { if (!fired || s < 0) return P.t1; const r = 1 - Math.exp(-s/0.9); return P.t1 + dT()*r - 0.004*Math.max(0, s - 3); };
  const glass = () => new THREE.MeshPhysicalMaterial({ color:0xffffff, roughness:0.05, transparent:true, opacity:0.2, clearcoat:1, side:THREE.DoubleSide, depthWrite:false });
  v = niceGL(view3d($('bc3'), { cam:[2.6, 3.2, 5.6], target:[0, 1.2, 0], fov:36,
    build(v){ const R = v.root, cut = [PI*0.15, PI*1.7], ds = THREE.DoubleSide;
      const jk = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 2.3, 64, 1, true, ...cut), gloss(0xdfe3e8, { side:ds, roughness:0.5 })); jk.position.y = 1.15; R.add(jk);
      const jki = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 1.45, 2.3, 64, 1, true, ...cut), gloss(0xc9ced5, { side:ds })); jki.position.y = 1.15; R.add(jki);
      const jw = new THREE.Mesh(new THREE.CylinderGeometry(1.58, 1.58, 2.0, 64, 1, true, ...cut), new THREE.MeshPhysicalMaterial({ color:0x8fb8da, transparent:true, opacity:0.35, side:ds, depthWrite:false })); jw.position.y = 1.05; R.add(jw);
      const base = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.1, 64), gloss(0x9aa3ad)); base.position.y = 0.05; R.add(base);
      const cu = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.0, 1.8, 64, 1, true, ...cut), metal(0xc8743f, { side:ds, roughness:0.35 })); cu.position.y = 1.1; R.add(cu);
      const cub = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.04, 64), metal(0xc8743f)); cub.position.y = 0.22; R.add(cub);
      const wat = new THREE.Mesh(new THREE.CylinderGeometry(0.99, 0.99, 1.45, 64, 1, false, ...cut), new THREE.MeshPhysicalMaterial({ color:0x7fb2dc, transparent:true, opacity:0.32, roughness:0.1, depthWrite:false })); wat.position.y = 0.97; R.add(wat);
      // the bomb, cut away
      const st = metal(0xb8bec6, { roughness:0.25, side:ds });
      const bb = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 1.0, 48, 1, true, ...cut), st); bb.position.y = 0.85; R.add(bb);
      const bbb = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.05, 48), st); bbb.position.y = 0.36; R.add(bbb);
      const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.22, 48), metal(0x9aa3ad, { roughness:0.35 })); lid.position.y = 1.45; R.add(lid);
      for (let i = 0; i < 4; i++){ const k = new THREE.Mesh(new THREE.TorusGeometry(0.405, 0.012, 6, 48), metal(0x7d858f)); k.rotation.x = PI/2; k.position.y = 1.37 + i*0.05; R.add(k); }
      const valve = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.25, 16), metal(0x8a6a3a)); valve.position.set(0.15, 1.68, 0); R.add(valve);
      [-0.12, 0.12].forEach((x, i) => { const e = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.7, 10), metal(0x8a6a3a)); e.position.set(x, 1.0, 0.05); R.add(e);
        const tp = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.12, 12), gloss(i ? 0xc0392b : 0x22272d)); tp.position.set(x - 0.05, 1.62, -0.1); R.add(tp);
        R.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(x - 0.05, 1.68, -0.1), new THREE.Vector3(x*4 - 0.3, 2.6, -0.4), new THREE.Vector3(-1.9 + i*0.1, 2.5, -1.0)]), 30, 0.012, 6), gloss(i ? 0xc0392b : 0x22272d))); });
      const cr = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.08, 0.08, 24, 1, true), metal(0xb3ad98, { side:ds })); cr.position.set(0, 0.66, 0.05); R.add(cr);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.008, 6, 24), metal(0x8a6a3a)); ring.rotation.x = PI/2; ring.position.set(0, 0.7, 0.05); R.add(ring);
      const pel = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 20), gloss(0x2b2b2b)); pel.position.set(0, 0.67, 0.05); R.add(pel); v.pel = pel;
      R.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(-0.12, 0.72, 0.05), new THREE.Vector3(0, 0.71, 0.05), new THREE.Vector3(0.12, 0.72, 0.05)]), 12, 0.004, 5), metal(0xd0d0cb)));
      flash = new THREE.PointLight(0xffa040, 0, 2.5); flash.position.set(0, 0.8, 0.05); R.add(flash);
      const fl = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 12), new THREE.MeshBasicMaterial({ color:0xffb040, transparent:true, opacity:0 })); fl.position.set(0, 0.76, 0.05); R.add(fl); v.fl = fl;
      // stirrer and thermometer
      stir = new THREE.Group(); stir.position.set(-0.68, 0, 0.1); const sr = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 2.2, 10), metal(0x9aa3ad)); sr.position.y = 1.4; stir.add(sr);
      [0, PI/2].forEach(a => { const bl = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.08, 0.01), metal(0x9aa3ad)); bl.position.y = 0.45; bl.rotation.y = a; stir.add(bl); }); R.add(stir);
      const mot = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.25, 24), gloss(0x2f6fd8)); mot.position.set(-0.68, 2.6, 0.1); R.add(mot);
      therm = new THREE.Group(); therm.position.set(0.62, 0, 0.3); const tg = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 2.4, 16), glass()); tg.position.y = 1.5; therm.add(tg);
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 12), metal(0xb8bec6)); bulb.position.y = 0.32; therm.add(bulb);
      col = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1, 8), metal(0xb8bec6)); therm.add(col); R.add(therm);
      const c = document.createElement('canvas'); c.width = 256; c.height = 96; rtx = new THREE.CanvasTexture(c); rtx.encoding = THREE.sRGBEncoding;
      readout = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.26), new THREE.MeshBasicMaterial({ map:rtx, toneMapped:false })); readout.position.set(0.95, 2.85, 0.3); R.add(readout); },
    update(dt, v){ stir.rotation.y += dt*8; if (fired){ tf += dt; } const fa = fired ? Math.max(0, 1 - tf/0.6) : 0; flash.intensity = 6*fa; v.fl.material.opacity = fa; v.pel.visible = !fired || tf < 0.4; setT(); if (fired) drawG(); } }));
  function setT(){ const T = Tat(tf); if (col){ const h = 0.35 + clamp((T - P.t1 + 0.5)/(dT() + 1.5), 0, 1)*2.0; col.scale.y = h; col.position.y = 0.35 + h/2; }
    if (rtx){ const g = rtx.image.getContext('2d'); g.fillStyle = '#1d2618'; g.fillRect(0, 0, 256, 96); g.fillStyle = '#9fe870'; g.font = '700 54px Roboto, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(`${T.toFixed(2)} °C`, 128, 50); rtx.needsUpdate = true; } }
  function drawG(){ readColors(); const xs = [], ys = []; for (let s = -2; s <= 10; s += 0.05){ xs.push(s); ys.push(Tat(s)); } const cut = fired ? tf : -2, T = Tat(tf);
    plot(cg, { xmin:-2, xmax:10, ymin:P.t1 - 0.3, ymax:P.t1 + dT()*1.15 + 0.3, xlab:'time after firing [min]', ylab:'water temperature [°C]', pl:52, yfmt:v => fmt(v, 1),
      series:[{ x:xs, y:ys, color:alpha(C.muted, 0.4), dash:[4, 3] }, { x:xs.filter(s => s <= cut), y:ys.filter((_, i) => xs[i] <= cut), color:C.crank, w:2.4 }],
      points:[{ x:Math.min(tf, 10), y:T, color:C.crank, r:5 }], hl:[{ v:P.t1, color:C.rod, label:'t₁' }, { v:P.t1 + dT(), color:C.crank, label:'t₂' }] }); }
  function upd(){ const f = FU[cur], d = dT(), gcv = (P.W + P.w)*d/P.m;
    $('bc_t').textContent = `Bomb calorimeter: ${f[0]}`;
    $('bc_sub').textContent = `GCV = (W + w)(t₂ − t₁)/m`;
    $('bc_st').innerHTML = statsHTML([['Temperature rise', `${fmt(d, 2)} °C`], ['Heat released', `${fmt(P.m*f[1]/1000, 2)} kcal`], ['GCV from the reading', `${fmt(gcv, 0)} cal/g`], ['In kJ/kg', fmt(gcv*4.187, 0)], ['NCV (H = ' + f[2] + ' %)', `${fmt(gcv - 0.09*f[2]*587, 0)} kcal/kg`]]);
    $('bc_cap').innerHTML = `${fired ? `Burning ${P.m} g of ${f[0]} releases ${fmt(P.m*f[1], 0)} cal, which warms ${P.W} g of water plus the calorimeter (water equivalent ${P.w} g) by ${fmt(d, 2)} °C.` : 'Press <b>Fire the bomb</b> to ignite the pellet.'} ${f[3] ? f[0][0].toUpperCase() + f[0].slice(1) + ' is ' + f[3] + '.' : ''} After the peak the water slowly cools to the room; the cooling correction allows for this.`;
    setT(); drawG(); if (v && !v.anim.playing) v.render(); }
  chips.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; cur = +b.dataset.i; chips.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b)); fired = false; tf = 0; upd(); });
  $('bc_fire').addEventListener('click', () => { fired = true; tf = 0; upd(); if (!v){ tf = 10; drawG(); } else if (!v.anim.playing) v.anim.playing = true; });
  watchSize(cg, drawG); onRedraw(drawG); upd(); }

example($('ex2'), { title:'Example 9.2: calorific value from a bomb calorimeter', src:'Example 2 in the notes',
  q:'Burning 0.83 g of a solid fuel in a bomb calorimeter raised the temperature of 3500 g of water from 26.5 °C to 29.2 °C. The water equivalent of the calorimeter is 385 g and the latent heat of steam 587 cal/g. The fuel contains 0.7 % H. Find the HCV and NCV.',
  inputs:[['m', 'Mass of fuel m', 0.83, 'g'], ['W', 'Mass of water W', 3500, 'g'], ['w', 'Water equivalent w', 385, 'g'], ['t1', 't₁', 26.5, '°C'], ['t2', 't₂', 29.2, '°C'], ['H', 'Hydrogen', 0.7, '%']],
  solve:v => { const hcv = (v.W + v.w)*(v.t2 - v.t1)/v.m, ncv = hcv - 0.09*v.H*587;
    return [[`HCV = (${v.W} + ${v.w})(${v.t2} − ${v.t1}) / ${v.m} =`, `${fmt(hcv, 0)} cal/g`, true], [`NCV = HCV − 0.09 × H × 587 = ${fmt(hcv, 0)} − 0.09 × ${v.H} × 587 =`, `${fmt(ncv, 0)} cal/g`, true], ['In kJ/kg: HCV × 4.187 =', fmt(hcv*4.187, 0)],
      ['The notes print the temperature difference as 29.2 − 26.3 and the factor as 0.9; the working uses 26.5 °C and 0.09, which give these answers.', '']]; } });

/* ================= 9.2 Dulong ================= */
{ const cv = $('du'), P = {};
  controls($('du_c'), [['C', 'Carbon C', 40, 95, 0.5, 90, '%'], ['H', 'Hydrogen H', 0, 15, 0.1, 4.6, '%'], ['O', 'Oxygen O', 0, 45, 0.5, 3, '%'], ['S', 'Sulfur S', 0, 5, 0.1, 0.5, '%']], P, draw);
  function draw(){ const { ctx, W, H } = prep(cv); readColors(); const c = 80.8*P.C, h = 345*Math.max(0, P.H - P.O/8), s = 22.4*P.S, g = c + h + s, n = g - 0.09*P.H*587, x0 = 110, w = W - 140, X = v => x0 + v/12000*w;
    const bars = [['carbon', c, C.muted], ['available H', h, C.rod], ['sulfur', s, C.mass]]; let x = x0; const y = 26, hh = 34;
    bars.forEach(([n, v, col]) => { ctx.fillStyle = alpha(col, 0.75); ctx.fillRect(x, y, X(v) - x0, hh); if (X(v) - x0 > 60){ ctx.fillStyle = C.ink; ctx.font = `12px ${C.mono}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(`${n} ${fmt(v, 0)}`, x + (X(v) - x0)/2, y + hh/2); } x += X(v) - x0; });
    ctx.fillStyle = alpha(C.crank, 0.6); ctx.fillRect(x0, y + hh + 16, X(n) - x0, hh);
    ctx.fillStyle = C.ink; ctx.font = `12px ${C.mono}`; ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillText('GCV', x0 - 8, y + hh/2); ctx.fillText('NCV', x0 - 8, y + hh*1.5 + 16);
    ctx.textAlign = 'left'; ctx.fillText(`${fmt(g, 0)} kcal/kg`, X(g) + 6, y + hh/2); ctx.fillText(`${fmt(n, 0)} kcal/kg`, X(n) + 6, y + hh*1.5 + 16);
    for (let k = 0; k <= 12000; k += 2000){ ctx.fillStyle = C.muted; ctx.textAlign = 'center'; ctx.fillText(String(k), X(k), H - 12); }
    $('du_sub').textContent = `GCV ${fmt(g, 0)} kcal/kg = ${fmt(g*4.187/1000, 1)} MJ/kg`;
    $('du_cap').innerHTML = `Hydrogen is worth over four times as much as carbon per kilogram, but oxygen in the fuel "uses up" one eighth of its mass of hydrogen (here ${fmt(P.O/8, 2)} %), which is why oxygen-rich fuels such as wood and lignite have low calorific values. ${P.H - P.O/8 < 0 ? 'Here all the hydrogen is already fixed by oxygen.' : ''} The water from the hydrogen costs ${fmt(0.09*P.H*587, 0)} kcal/kg as latent heat.`; }
  watchSize(cv, draw); onRedraw(draw); draw(); }

example($('ex1'), { title:'Example 9.1: hydrogen content and GCV of a coal', src:'Example 1 in the notes',
  q:'A coal contains by mass C 90 %, O 3 %, S 0.5 %, N 0.5 % and ash 2.5 %. Its net calorific value is 8490.5 kcal/kg. Find the percentage of hydrogen and the GCV.',
  inputs:[['C', 'Carbon', 90, '%'], ['O', 'Oxygen', 3, '%'], ['S', 'Sulfur', 0.5, '%'], ['N', 'NCV', 8490.5, 'kcal/kg']],
  solve:v => { const k = (8080*v.C - 34500*v.O/8 + 2240*v.S)/100, a = 0.09*587, H = (v.N - k)/(345 - a), G = v.N + a*H;
    return [['GCV = NCV + 0.09 H × 587 = ' + v.N + ' + ' + fmt(a, 2) + ' H', ''], [`Dulong: GCV = [8080 × ${v.C} + 34 500 (H − ${v.O}/8) + 2240 × ${v.S}]/100 = ${fmt(k, 1)} + 345 H`, ''],
      [`Equate: ${fmt(k, 1)} + 345 H = ${v.N} + ${fmt(a, 2)} H, so ${fmt(345 - a, 2)} H = ${fmt(v.N - k, 1)}`, ''], ['H =', `${fmt(H, 3)} %`, true], ['GCV =', `${fmt(G, 1)} kcal/kg`, true],
      ['The notes print the constant as 7754.8; it is 7153.8, and the notes\' own next line (292.2 H = 1335) follows from 7153.8.', '']]; } });

/* ================= 9.2 air for a gaseous fuel ================= */
{ const cv = $('ga'), P = {};
  const H = controls($('ga_c'), [['co', 'Carbon monoxide CO', 0, 60, 0.5, 46, '%'], ['ch4', 'Methane CH₄', 0, 95, 0.5, 10, '%'], ['h2', 'Hydrogen H₂', 0, 60, 0.5, 40, '%'], ['c2h2', 'Ethyne C₂H₂', 0, 10, 0.5, 2, '%'], ['n2', 'Nitrogen N₂', 0, 60, 0.5, 1, '%'], ['ex', 'Excess air', 0, 100, 1, 0, '%']], P, draw);
  function draw(){ const { ctx, W, H: Hh } = prep(cv); readColors(); const sum = P.co + P.ch4 + P.h2 + P.c2h2 + P.n2, co2 = Math.max(0, 100 - sum);
    const O = [['CO', P.co*0.5], ['CH₄', P.ch4*2], ['H₂', P.h2*0.5], ['C₂H₂', P.c2h2*2.5]], o2 = O.reduce((a, x) => a + x[1], 0)/100, air = o2/0.21*(1 + P.ex/100);
    const pCO2 = (P.co + P.ch4 + 2*P.c2h2 + co2)/100, pH2O = (2*P.ch4 + P.h2 + P.c2h2)/100, pN2 = P.n2/100 + air*0.79, pO2 = o2*P.ex/100;
    const x0 = 120, w = W - 170, X = v => x0 + v/Math.max(0.8, o2*1.15)*w; ctx.font = `12px ${C.mono}`; ctx.textBaseline = 'middle';
    O.forEach(([n, v], i) => { const y = 18 + i*28, val = v/100; ctx.fillStyle = alpha(C.rod, 0.7); ctx.fillRect(x0, y - 9, X(val) - x0, 18); ctx.fillStyle = C.ink; ctx.textAlign = 'right'; ctx.fillText(n, x0 - 8, y); ctx.textAlign = 'left'; ctx.fillText(`${fmt(val, 3)} m³ O₂`, X(val) + 6, y); });
    const y = 18 + 4*28; ctx.fillStyle = alpha(C.crank, 0.75); ctx.fillRect(x0, y - 9, X(o2) - x0, 18); ctx.fillStyle = C.ink; ctx.textAlign = 'right'; ctx.fillText('total', x0 - 8, y); ctx.textAlign = 'left'; ctx.fillText(`${fmt(o2, 3)} m³ O₂`, X(o2) + 6, y);
    $('ga_sub').textContent = `CO₂ in the fuel ${fmt(co2, 1)} % (the remainder)`;
    $('ga_st').innerHTML = statsHTML([['Oxygen needed', `${fmt(o2, 3)} m³`], ['Air needed', `${fmt(air, 3)} m³`, sum > 100 ? 'bad' : ''], ['Flue CO₂', `${fmt(pCO2, 3)} m³`], ['Flue H₂O', `${fmt(pH2O, 3)} m³`], ['Flue N₂', `${fmt(pN2, 3)} m³`], ['Flue O₂', `${fmt(pO2, 3)} m³`]]);
    $('ga_cap').innerHTML = sum > 100 ? 'The components add up to more than 100 %: reduce one of them.' : `Per m³ of fuel: CO + ½O₂ gives CO₂; CH₄ + 2O₂ gives CO₂ + 2H₂O; H₂ + ½O₂ gives H₂O; C₂H₂ + 2½O₂ gives 2CO₂ + H₂O. Nitrogen and CO₂ in the fuel pass through unchanged. Air = O₂ × 100/21${P.ex ? ` × ${fmt(1 + P.ex/100, 2)} for ${P.ex} % excess` : ''} = ${fmt(air, 3)} m³.`; }
  watchSize(cv, draw); onRedraw(draw); draw(); }

example($('ex3'), { title:'Example 9.3: air for a gaseous fuel', src:'Example 3 in the notes',
  q:'Find the volume of air needed for complete combustion of 1 m³ of a gaseous fuel of composition CO 46 %, {ce:CH4} 10 %, {ce:H2} 40 %, {ce:C2H2} 2 %, {ce:N2} 1 %, the rest {ce:CO2}.',
  inputs:[['co', 'CO', 46, '%'], ['ch4', 'CH₄', 10, '%'], ['h2', 'H₂', 40, '%'], ['c2h2', 'C₂H₂', 2, '%']],
  solve:v => { const a = v.co/100*0.5, b = v.ch4/100*2, c = v.h2/100*0.5, d = v.c2h2/100*2.5, o = a + b + c + d;
    return [['{ce:CO + 1/2O2 -> CO2}: O₂ = ' + fmt(v.co/100, 2) + ' × ½ =', `${fmt(a, 3)} m³`], ['{ce:CH4 + 2O2 -> CO2 + 2H2O}: O₂ = ' + fmt(v.ch4/100, 2) + ' × 2 =', `${fmt(b, 3)} m³`], ['{ce:H2 + 1/2O2 -> H2O}: O₂ = ' + fmt(v.h2/100, 2) + ' × ½ =', `${fmt(c, 3)} m³`],
      ['{ce:C2H2 + 5/2O2 -> 2CO2 + H2O}: O₂ = ' + fmt(v.c2h2/100, 2) + ' × 5/2 =', `${fmt(d, 3)} m³`], ['Total oxygen =', `${fmt(o, 3)} m³`], ['Air = O₂ × 100/21 =', `${fmt(o/0.21, 3)} m³`, true]]; } });

/* ================= 9.3 coal ranks ================= */
{ const cv = $('cr'); let mode = 'comp';
  const R = [['wood', 50, 15, 75, 4500, 'Air-dried wood: high oxygen, burns with a long flame, mostly a domestic fuel.'], ['peat', 57, 85, 65, 5400, 'The first stage of coalification. Freshly cut it holds 80 to 90 % water, so it must be dried. Easy to light, burns with a long flame; also used as a fertiliser.'],
    ['lignite', 67, 40, 50, 6750, 'Brown coal: soft, 20 to 60 % moisture, burns with a smoky flame. Usually dried and pressed into briquettes, or burnt in power stations next to the mine.'], ['sub-bituminous', 74, 15, 42, 7200, 'C 70 to 78 %, ignites easily. Used for steam raising and, if low in sulfur, for making fuel gas.'],
    ['bituminous', 84, 5, 30, 8250, 'C 78 to 90 %, black and banded. The main coal for boilers, furnaces, locomotives and power stations, and for making coke, coal gas and coal tar.'], ['semi-anthracite', 90, 2, 12, 8650, 'Between bituminous and anthracite; ignites more easily than anthracite.'],
    ['anthracite', 95, 2, 5, 8500, 'The highest rank: C 92 to 98 %, very little volatile matter. Hard to light but burns hot without smoke; no coking power. For boilers, domestic stoves and metallurgical furnaces.']];
  function draw(){ readColors(); const xs = R.map((_, i) => i + 1), lab = v => (Number.isInteger(v) && R[v - 1]) ? R[v - 1][0] : '';
    if (mode === 'comp') plot(cv, { xmin:0.5, xmax:7.5, ymin:0, ymax:100, xlab:'rank (increasing coalification)', ylab:'percent', xfmt:lab,
      series:[{ x:xs, y:R.map(r => r[1]), color:C.ink, w:2.4 }, { x:xs, y:R.map(r => r[2]), color:C.rod, w:2 }, { x:xs, y:R.map(r => r[3]), color:C.crank, w:2 }],
      points:R.map((r, i) => ({ x:i + 1, y:r[1], color:C.ink, r:4, i })), legend:[{ color:C.ink, label:'carbon (dry, ash-free)' }, { color:C.rod, label:'moisture as found' }, { color:C.crank, label:'volatile matter (dry, ash-free)' }] });
    else plot(cv, { xmin:0.5, xmax:7.5, ymin:0, ymax:10000, xlab:'rank (increasing coalification)', ylab:'gross calorific value [kcal/kg]', xfmt:lab, series:[{ x:xs, y:R.map(r => r[4]), color:C.crank, w:2.4 }], points:R.map((r, i) => ({ x:i + 1, y:r[4], color:C.crank, r:5, i })) });
    $('cr_t').textContent = mode === 'comp' ? 'The ranks of coal: composition' : 'The ranks of coal: calorific value'; }
  hoverPoints(cv, p => { if (!p) return; const r = R[p.i]; $('cr_cap').innerHTML = `<b>${r[0][0].toUpperCase() + r[0].slice(1)}</b>: carbon about ${r[1]} %, moisture ${r[2]} %, volatile matter ${r[3]} %, GCV about ${r[4]} kcal/kg (${fmt(r[4]*4.187/1000, 1)} MJ/kg). ${r[5]}`; });
  segGroup(document.querySelector('#s3 .seg'), m => { mode = m; draw(); });
  watchSize(cv, draw); onRedraw(draw); draw(); }

example($('ex4'), { title:'Example 9.4: proximate analysis of a coal', src:'proximate analysis',
  q:'1.000 g of air-dried coal lost 0.052 g on heating at 110 °C for an hour. The residue lost a further 0.285 g when heated in a covered crucible at 950 °C, and 0.087 g of ash remained after burning. Find the moisture, volatile matter, ash and fixed carbon.',
  inputs:[['m', 'Mass of coal', 1.000, 'g'], ['a', 'Loss at 110 °C', 0.052, 'g'], ['b', 'Loss at 950 °C (covered)', 0.285, 'g'], ['c', 'Ash left', 0.087, 'g']],
  solve:v => { const M = 100*v.a/v.m, V = 100*v.b/v.m, A = 100*v.c/v.m;
    return [[`Moisture = ${v.a}/${v.m} × 100 =`, `${fmt(M, 1)} %`, true], [`Volatile matter = ${v.b}/${v.m} × 100 =`, `${fmt(V, 1)} %`, true], [`Ash = ${v.c}/${v.m} × 100 =`, `${fmt(A, 1)} %`, true],
      [`Fixed carbon = 100 − ${fmt(M, 1)} − ${fmt(V, 1)} − ${fmt(A, 1)} =`, `${fmt(100 - M - V - A, 1)} %`, true], [V < 35 && 100 - M - V - A > 50 ? 'Low moisture and moderate volatile matter: a good bituminous steam coal.' : 'Compare with the ranks above to judge the coal.', '']]; } });
example($('ex5'), { title:'Example 9.5: ultimate analysis for carbon and hydrogen', src:'ultimate analysis',
  q:'1.50 g of coal was burnt in oxygen. The KOH tube gained 4.62 g and the {ce:CaCl2} tube 0.54 g. Find the percentages of carbon and hydrogen.',
  inputs:[['m', 'Mass of coal', 1.50, 'g'], ['k', 'Gain of KOH tube (CO₂)', 4.62, 'g'], ['c', 'Gain of CaCl₂ tube (H₂O)', 0.54, 'g']],
  solve:v => [[`% C = ${v.k} × 12 × 100 / (${v.m} × 44) =`, `${fmt(v.k*1200/(v.m*44), 1)} %`, true], [`% H = ${v.c} × 2 × 100 / (${v.m} × 18) =`, `${fmt(v.c*200/(v.m*18), 2)} %`, true],
    ['With these, Dulong\'s formula (above) gives the calorific value without burning a sample in the bomb.', '']] });

/* ================= quiz ================= */
quiz($('qz'), [
  { q:'The net calorific value is lower than the gross value because', o:['some fuel does not burn', 'the water formed leaves as vapour, carrying its latent heat', 'ash takes up heat', 'oxygen is used up'], a:1, why:'NCV assumes the combustion water stays as steam, so its latent heat (587 kcal/kg) is not recovered.' },
  { q:'A fuel has 5 % hydrogen and a GCV of 8000 kcal/kg. Its NCV is about', o:['7736 kcal/kg', '7971 kcal/kg', '5065 kcal/kg', '8264 kcal/kg'], a:0, why:'NCV = 8000 − 0.09 × 5 × 587 = 8000 − 264 = 7736 kcal/kg.' },
  { q:'In a bomb calorimeter the water equivalent of the calorimeter is found by', o:['weighing the bomb', 'burning a standard such as benzoic acid', 'measuring the oxygen pressure', 'Dulong\'s formula'], a:1, why:'A fuel of accurately known calorific value is burnt and the equation is solved for w.' },
  { q:'In Dulong\'s formula, oxygen in the fuel', o:['adds to the calorific value', 'is assumed already combined with hydrogen as water', 'is ignored', 'reacts with sulfur'], a:1, why:'One eighth of the oxygen mass is subtracted from the hydrogen, as fixed hydrogen.' },
  { q:'Burning 1 m³ of hydrogen needs how much air?', o:['0.5 m³', '2.38 m³', '4.76 m³', '1 m³'], a:1, why:'H₂ + ½O₂ gives H₂O, so 0.5 m³ of O₂, which is 0.5 × 100/21 = 2.38 m³ of air.' },
  { q:'Going from peat to anthracite', o:['moisture and volatile matter rise', 'carbon content and calorific value rise', 'oxygen content rises', 'coal becomes softer'], a:1, why:'Coalification drives off water, oxygen and volatiles, concentrating the carbon.' },
  { q:'In proximate analysis, fixed carbon is', o:['measured by burning in oxygen', '100 minus the moisture, volatile matter and ash', 'the carbon in CO₂', 'the same as total carbon'], a:1, why:'It is found by difference after the other three are measured.' },
  { q:'In ultimate analysis, the carbon is found from', o:['the gain in mass of a KOH tube', 'the ash left', 'the loss at 110 °C', 'the CaCl₂ tube'], a:0, why:'KOH absorbs the CO₂; 44 g of CO₂ contain 12 g of carbon.' }]);
})();
