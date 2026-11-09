/* BME 1104 Chapter 10B: chemical instrumentation */
(() => {
'use strict';
const fx = (v, d = 1) => n2(v, d), R = 8.314, F = 96485;
let seed = 21; const rnd = () => { seed = (seed*16807) % 2147483647; return (seed - 1)/2147483646; };
const gauss = () => { const u = Math.max(rnd(), 1e-12), v = rnd(); return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v); };
const tickText = v => Math.abs(v) >= 1000 ? (v/1000) + 'k' : String(+v.toPrecision(3));
function axes(cv, o){ const pl = 70, pr = 16, pt = 30, pb = 40, { ctx, W, H } = prep(cv), w = W - pl - pr, h = H - pt - pb;
  const X = v => pl + (v - o.xl)/(o.xr - o.xl)*w, Y = v => pt + (o.yt - v)/(o.yt - o.yb)*h;
  ctx.font = `15.4px ${C.mono}`; ctx.textBaseline = 'middle'; ctx.lineWidth = 1;
  for (const v of o.yticks){ ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(pl, Y(v)); ctx.lineTo(pl + w, Y(v)); ctx.stroke(); ctx.fillStyle = C.muted; ctx.textAlign = 'right'; ctx.fillText(tickText(v), pl - 6, Y(v)); }
  ctx.save(); ctx.translate(12, pt + h/2); ctx.rotate(-Math.PI/2); ctx.textAlign = 'center'; ctx.fillStyle = C.muted; rich(ctx, o.ylab || '', 0, 0); ctx.restore();
  return { ctx, W, H, X, Y, pl, pt, w, h }; }

/* ---------- 10.11 calibration: iron by phenanthroline ---------- */
{ const P = {}; const STD = [0, 0.5, 1, 2, 3, 4, 5]; let nz = []; const roll = () => { nz = Array.from({ length:STD.length + 3 }, gauss); }; roll();
  controls($('cl_c'), [['s', 'Reading noise σ', 0.001, 0.02, 0.001, 0.004, 'absorbance'], ['sl', 'Stray light', 0, 5, 0.1, 0.3, '%'], ['cu', 'True iron in the sample', 0.05, 7, 0.01, 1.6, 'mg/L']], P, () => draw());
  const m0 = 11100/55845, obs = (A, s) => -Math.log10((10**(-A) + s)/(1 + s));
  function draw(){ const s = P.sl/100, n = STD.length, ys = STD.map((c, i) => obs(m0*c, s) + P.s*nz[i]), xb = STD.reduce((a, b) => a + b)/n, yb = ys.reduce((a, b) => a + b)/n, Sxx = STD.reduce((a, c) => a + (c - xb)**2, 0);
    const m = STD.reduce((a, c, i) => a + (c - xb)*(ys[i] - yb), 0)/Sxx, b = yb - m*xb, res = ys.map((y, i) => y - (m*STD[i] + b)), syx = Math.sqrt(res.reduce((a, r) => a + r*r, 0)/(n - 2)), R2 = 1 - res.reduce((a, r) => a + r*r, 0)/ys.reduce((a, y) => a + (y - yb)**2, 0);
    const y0 = [0, 1, 2].map(k => obs(m0*P.cu, s) + P.s*nz[n + k]).reduce((a, c) => a + c)/3, c0 = (y0 - b)/m, sc = syx/m*Math.sqrt(1/3 + 1/n + (y0 - yb)**2/(m*m*Sxx)), ci = 2.571*sc;
    const top = Math.max(5.5, c0*1.1, P.cu*1.1), xs = [], fit = [], tru = []; for (let c = 0; c <= top; c += top/200){ xs.push(c); fit.push(m*c + b); tru.push(obs(m0*c, s)); }
    chart($('cl'), { x:xs, series:[{ y:fit, color:C.crank, label:'least-squares line' }, { y:tru, color:C.muted, dash:[4, 3], label:'instrument response' }], markers:[...STD.map((c, i) => ({ x:c, y:ys[i], color:C.ink })), { x:c0, y:y0, color:C.bad, label:`sample: ${fx(c0, 2)} mg/L` }], ylab:'absorbance at 510 nm', xlab:'iron [mg/L]' });
    chart($('cl_r'), { x:STD, xmin:-0.3, xmax:5.3, series:[{ y:STD.map(() => 0), color:C.muted, w:1 }, { y:res, color:'rgba(0,0,0,0)' }], markers:STD.map((c, i) => ({ x:c, y:res[i], color:C.acc })), ylab:'residual', xlab:'standard [mg/L]' });
    const out = c0 > 5 || c0 < 0;
    $('cl_st').innerHTML = statsHTML([['Slope (sensitivity), intercept', `${fx(m, 4)} per mg/L, ${b < 0 ? '−' : '+'}${fx(Math.abs(b), 4)}`], ['R²', fx(R2, 5)], ['Detection limit 3.3 s/m', `${fx(3.3*syx/m, 3)} mg/L`], ['Sample (mean of 3), 95% interval', `${fx(c0, 3)} ± ${fx(ci, 3)} mg/L`, out ? 'bad' : ''], ['True value', `${fx(P.cu, 3)} mg/L`]]);
    $('cl_sub').textContent = out ? 'sample outside the standards: dilute it, measure again, multiply by the dilution factor' : 'seven standards from 0 to 5 mg/L, 1 cm cuvette, ε = 11,100 L/(mol cm)'; }
  $('cl_new').addEventListener('click', () => { seed = Math.floor(Math.random()*1e6) + 1; roll(); draw(); });
  ['cl', 'cl_r'].forEach(id => watchSize($(id), draw)); onRedraw(draw); draw(); }

/* ---------- 10.12 pH meter ---------- */
{ const P = {}; const S = Tc => 2.302585*R*(Tc + 273.15)/F*1000;
  controls($('ph_c'), [['pH', 'True pH of the sample (boiler water)', 1, 13, 0.01, 10.5, ''], ['k', 'Electrode slope efficiency', 85, 102, 0.5, 97, '%'], ['off', 'Electrode offset at pH 7', -40, 40, 1, 8, 'mV'], ['Tc', 'Temperature during calibration', 5, 50, 1, 25, '°C'], ['Ts', 'Sample temperature', 5, 80, 1, 45, '°C']], P, () => draw());
  function draw(){ const E = (pH, T) => P.off - P.k/100*S(T)*(pH - 7), E7 = E(7, P.Tc), E4 = E(4.01, P.Tc), slope = (E4 - E7)/(7 - 4.01), atc = $('ph_atc').checked, used = atc ? slope*(P.Ts + 273.15)/(P.Tc + 273.15) : slope, Es = E(P.pH, P.Ts), read = 7 - (Es - E7)/used, err = read - P.pH;
    const xs = [], real = [], met = []; for (let p = 0; p <= 14; p += 0.1){ xs.push(p); real.push(E(p, P.Ts)); met.push(E7 - used*(p - 7)); }
    chart($('ph'), { x:xs, series:[{ y:real, color:C.crank, label:`electrode at ${P.Ts} °C` }, { y:met, color:C.acc, dash:[5, 4], label:"meter's calibration line" }], markers:[{ x:4.01, y:E4, color:C.muted, label:'buffer 4.01' }, { x:7, y:E7, color:C.muted, label:'buffer 7.00' }, { x:P.pH, y:Es, color:C.ink, label:`${fx(Es, 1)} mV` }], ylab:'E [mV]', xlab:'pH' });
    const eff = slope/S(P.Tc)*100;
    $('ph_st').innerHTML = statsHTML([['Ideal slope at calibration temperature', `${fx(S(P.Tc), 2)} mV/pH`], ['Measured slope, efficiency', `${fx(slope, 2)} mV/pH, ${fx(eff, 1)}%`, eff < 95 ? 'bad' : ''], ['Offset', `${fx(E7, 1)} mV`, Math.abs(E7) > 30 ? 'bad' : ''], ['Meter reads', `pH ${fx(read, 2)}`], ['Error', `${err >= 0 ? '+' : ''}${fx(err, 2)} pH`, Math.abs(err) > 0.05 ? 'bad' : '']]);
    $('ph_sub').textContent = !atc && P.Ts !== P.Tc ? 'no temperature compensation: the meter uses the slope from the calibration temperature' : eff < 95 ? 'slope below 95%: clean or replace the electrode' : 'buffers at 4.01 and 7.00 fix the offset and slope'; }
  $('ph_atc').addEventListener('change', draw); watchSize($('ph'), draw); onRedraw(draw); draw(); }
example($('ex1'), { title:'Worked example: boiler blowdown from conductivity', src:'Flynn (2009)', q:'A sugar-factory boiler produces 20 t/h of steam at 10 bar. Feedwater conductivity is 250 μS/cm and the boiler water must be kept below 3,500 μS/cm. Find the cycles of concentration, the blowdown rate, and the heat lost with the blowdown if the boiler water (saturated at 10 bar, 763 kJ/kg) is drained and replaced with feedwater at 105 °C (440 kJ/kg).',
  inputs:[['S', 'Steam rate', 20, 't/h'], ['kf', 'Feedwater conductivity', 250, 'μS/cm'], ['kb', 'Boiler water limit', 3500, 'μS/cm'], ['hb', 'Enthalpy of boiler water', 763, 'kJ/kg'], ['hf', 'Enthalpy of feedwater', 440, 'kJ/kg']],
  solve:o => { const coc = o.kb/o.kf, B = o.S/(coc - 1), Q = B*1000*(o.hb - o.hf)/3600; return [['Cycles of concentration COC = κ_boiler/κ_feed', fx(coc, 1)], ['Blowdown B = S/(COC − 1)', `${fx(B, 2)} t/h`, true], ['Feedwater needed = S + B', `${fx(o.S + B, 2)} t/h`], ['Heat lost in blowdown B (h_b − h_f)', `${fx(Q, 0)} kW`, true], ['Saving if feedwater conductivity is halved (better treatment)', `${fx(Q - o.S/(2*coc - 1)*1000*(o.hb - o.hf)/3600, 0)} kW`]]; } });

/* ---------- 10.13 titration simulator ---------- */
const IND = [['Phenolphthalein', 8.2, 10.0, 'colourless to pink'], ['Methyl orange', 3.1, 4.4, 'red to yellow'], ['Bromothymol blue', 6.0, 7.6, 'yellow to blue'], ['Methyl red', 4.4, 6.2, 'red to yellow']];
{ const P = {}; let kind = 'strong'; const si = $('tc_i'); IND.forEach((d, i) => si.add(new Option(`${d[0]} (pH ${d[1]} to ${d[2]})`, i)));
  controls($('tc_c'), [['ca', 'Acid concentration', 0.01, 0.2, 0.005, 0.1, 'mol/L'], ['va', 'Acid volume (pipette)', 10, 50, 1, 25, 'mL'], ['cb', 'NaOH concentration', 0.05, 0.2, 0.005, 0.1, 'mol/L']], P, () => draw());
  const pHat = V => { const Ka = kind === 'strong' ? 1e10 : 1.8e-5, Vt = (P.va + V)/1000, Ca = P.ca*P.va/1000/Vt, Na = P.cb*V/1000/Vt; let lo = 1e-14, hi = 1;
    for (let k = 0; k < 200; k++){ const h = Math.sqrt(lo*hi), f = h + Na - 1e-14/h - Ca*Ka/(Ka + h); if (f > 0) hi = h; else lo = h; } return -Math.log10(Math.sqrt(lo*hi)); };
  function draw(){ const Veq = P.ca*P.va/P.cb, Vmax = Veq*2, xs = [], ys = []; for (let i = 0; i <= 400; i++){ const V = Vmax*i/400; xs.push(V); ys.push(pHat(V)); }
    const d = IND[+si.value], find = target => { if (pHat(0) >= target || pHat(Vmax) < target) return NaN; let lo = 0, hi = Vmax; for (let k = 0; k < 60; k++){ const m = (lo + hi)/2; if (pHat(m) < target) lo = m; else hi = m; } return (lo + hi)/2; }, v1 = find(d[1]), v2 = find(d[2]), peq = pHat(Veq);
    chart($('tc'), { x:xs, series:[{ y:ys, color:C.crank, label:'pH' }], hlines:[{ v:d[1], color:C.acc, dash:[3, 3], label:`${d[0]} starts` }, { v:d[2], color:C.acc, dash:[3, 3], label:'finishes', right:true }], vlines:[{ v:Veq, color:C.muted, label:`equivalence ${fx(Veq, 2)} mL` }], markers:[{ x:Veq, y:peq, color:C.ink, label:`pH ${fx(peq, 2)}` }], ylab:'pH', xlab:'NaOH added [mL]' });
    const vm = find((d[1] + d[2])/2), ok = isFinite(vm) && Math.abs(vm - Veq) < 0.1;
    $('tc_st').innerHTML = statsHTML([['Equivalence volume V = c_a V_a / c_b', `${fx(Veq, 2)} mL`], ['pH at equivalence', `${fx(peq, 2)}${kind === 'weak' ? ' (the salt CH₃COO⁻ is basic)' : ''}`], ['Colour change spread over', isFinite(v1) && isFinite(v2) ? `${fx(v1, 3)} to ${fx(v2, 3)} mL (${d[3]})` : 'outside this range'], ['Indicator choice', ok ? 'suitable: changes within a fraction of a drop' : 'unsuitable: end point would be wrong or blurred', ok ? '' : 'bad']]);
    $('tc_sub').textContent = kind === 'weak' ? 'weak acid: the steep part is shorter and above pH 7, so phenolphthalein is needed' : 'strong acid with strong base: steep from about pH 4 to 10'; }
  segGroup($('tc_seg'), v => { kind = v; draw(); }); si.value = 0; si.addEventListener('change', draw); watchSize($('tc'), draw); onRedraw(draw); draw(); }
example($('ex2'), { title:'Worked example: hardness of boiler make-up water by EDTA', src:'APHA (2017), method 2340 C', q:'A 50.0 mL water sample, buffered to pH 10 with Eriochrome Black T, needs 9.60 mL of 0.0100 mol/L EDTA to turn from wine red to blue. Find the total hardness as mg/L CaCO₃. Is this water fit for a boiler without softening?',
  inputs:[['V', 'Sample volume', 50, 'mL'], ['ve', 'EDTA used', 9.6, 'mL'], ['c', 'EDTA concentration', 0.01, 'mol/L']],
  solve:o => { const mol = o.ve/1000*o.c, mg = mol*100090, H = mg/(o.V/1000); return [['Moles EDTA = moles (Ca²⁺ + Mg²⁺), 1 : 1', `${(mol*1000).toFixed(4)} mmol`], ['As CaCO₃ (100.09 g/mol)', `${fx(mg, 2)} mg`], ['Hardness = mg ÷ sample volume in L', `${fx(H, 0)} mg/L as CaCO₃`, true], ['Classification', H > 180 ? 'very hard' : H > 120 ? 'hard' : H > 60 ? 'moderately hard' : 'soft'], ['Boiler use', 'must be softened or demineralised first: boiler feedwater hardness should be close to zero', true]]; } });
example($('ex3'), { title:'Worked example: iron content by permanganate titration', src:'redox titration, Section 5.1', q:'A 0.2500 g sample of an iron ore is dissolved in acid and all the iron reduced to Fe²⁺. Titration needs 22.40 mL of 0.02000 mol/L KMnO₄. Calculate the percentage of iron. MnO₄⁻ + 5Fe²⁺ + 8H⁺ ⟶ Mn²⁺ + 5Fe³⁺ + 4H₂O.',
  inputs:[['m', 'Sample mass', 0.25, 'g'], ['v', 'KMnO₄ used', 22.4, 'mL'], ['c', 'KMnO₄ concentration', 0.02, 'mol/L']],
  solve:o => { const mn = o.v/1000*o.c, fe = 5*mn, g = fe*55.845; return [['Moles MnO₄⁻ = V c', `${(mn*1000).toFixed(4)} mmol`], ['Moles Fe²⁺ = 5 × moles MnO₄⁻', `${(fe*1000).toFixed(4)} mmol`], ['Mass of Fe = moles × 55.845', `${fx(g, 4)} g`], ['Iron in the sample', `${fx(g/o.m*100, 2)}%`, true]]; } });

/* ---------- 10.14 CP survey ---------- */
{ const P = {};
  controls($('cp_c'), [['L', 'Distance between drain points (rectifiers)', 10, 80, 1, 40, 'km'], ['dE', 'Potential shift at the drain point', 100, 1200, 10, 650, 'mV'], ['lam', 'Attenuation length (coating quality)', 3, 80, 1, 25, 'km', v => v < 10 ? 'poor coating' : v < 30 ? 'fair coating' : 'good coating']], P, () => draw());
  function draw(){ const Enat = -550, a = 1/P.lam, xs = [], es = []; for (let i = 0; i <= 200; i++){ const x = P.L*i/200, d = P.dE*Math.cosh(a*(x - P.L/2))/Math.cosh(a*P.L/2); xs.push(x); es.push(Enat - d); }
    const prot = es.filter(e => e <= -850).length/es.length*100, over = Math.min(...es) < -1200, worst = Math.max(...es);
    chart($('cp'), { x:xs, series:[{ y:es, color:C.crank, label:'instant-off pipe-to-soil potential [mV vs CSE]' }], hlines:[{ v:-850, color:C.ok, label:'−850 mV: protected below this line' }, { v:-1200, color:C.bad, label:'−1,200 mV: over-protection risk', right:true }, { v:Enat, color:C.muted, dash:[2, 3], label:'natural potential', right:true }], markers:[{ x:P.L/2, y:worst, color:C.ink, label:`mid-point ${fx(worst, 0)} mV` }], ylab:'E [mV vs CSE]', xlab:'distance along the pipeline [km]', zero:false });
    $('cp_st').innerHTML = statsHTML([['Potential at the drain point', `${fx(Enat - P.dE, 0)} mV`, over ? 'bad' : ''], ['Least protected point', `${fx(worst, 0)} mV`, worst > -850 ? 'bad' : ''], ['Length meeting −850 mV', `${fx(prot, 0)}%`, prot < 100 ? 'bad' : ''], ['Verdict', prot >= 100 && !over ? 'fully protected' : over ? 'over-protected near the drain: risk of coating disbondment' : 'under-protected mid-way: raise output, add a rectifier or repair coating']]);
    $('cp_sub').textContent = 'attenuation model with two drain points; potential shift decays faster along a poorly coated pipe'; }
  watchSize($('cp'), draw); onRedraw(draw); draw(); }

/* ---------- 10.15 calorimetry and proximate analysis ---------- */
example($('ex4'), { title:'Worked example (Chapter 9, Example 2, extended): bomb calorimeter', src:'Section 9.1.2', q:'On burning 0.83 g of a solid fuel in a bomb calorimeter, the temperature of 3,500 g of water rose from 26.5 °C to 29.2 °C. The water equivalent of the calorimeter is 385 g and the latent heat of steam 587 cal/g. The fuel contains 0.7% H. Calculate the HCV and NCV. Then add a cooling correction, fuse wire and acid corrections to see their effect.',
  inputs:[['m', 'Fuel mass m', 0.83, 'g'], ['W', 'Water mass W', 3500, 'g'], ['w', 'Water equivalent w', 385, 'g'], ['t1', 'Initial temperature t₁', 26.5, '°C'], ['t2', 'Final temperature t₂', 29.2, '°C'], ['cc', 'Cooling correction', 0, '°C'], ['fa', 'Fuse + acid corrections', 0, 'cal'], ['H', 'Hydrogen in fuel', 0.7, '%']],
  solve:o => { const q = (o.W + o.w)*(o.t2 - o.t1 + o.cc) - o.fa, hcv = q/o.m, ncv = hcv - 0.09*o.H*587; return [['Heat absorbed (W + w)(t₂ − t₁ + cooling) − corrections', `${fx(q, 1)} cal`], ['HCV = heat / m', `${fx(hcv, 1)} cal/g`, true], ['Latent heat of water formed 0.09 H × 587', `${fx(0.09*o.H*587, 2)} cal/g`], ['NCV = HCV − 0.09 H × 587', `${fx(ncv, 1)} cal/g`, true], ['In SI units', `HCV ${fx(hcv*4.1868/1000, 2)} MJ/kg, NCV ${fx(ncv*4.1868/1000, 2)} MJ/kg`], ['Sense check', hcv*4.1868/1000 > 36 ? 'higher than any common solid fuel: check the data (this textbook example is idealised)' : 'within the range of solid fuels']]; } });
example($('ex5'), { title:'Worked example: proximate analysis from your crucible weighings', src:'Section 9.2.2, ASTM D3172', q:'A practical group records these weighings for a coal sample. Calculate moisture, volatile matter, ash and fixed carbon. Replace the numbers with your own data sheet.',
  inputs:[['c', 'Empty crucible + lid', 20.0000, 'g'], ['s', 'Crucible + sample', 21.0000, 'g'], ['d', 'After drying at 105–110 °C', 20.9450, 'g'], ['v', 'After 7 min at 950 °C (lid on)', 20.6240, 'g'], ['a', 'After ashing at 750 °C (lid off)', 20.1050, 'g']],
  solve:o => { const m = o.s - o.c, M = (o.s - o.d)/m*100, V = (o.d - o.v)/m*100, A = (o.a - o.c)/m*100, FC = 100 - M - V - A; return [['Sample mass', `${fx(m, 4)} g`], ['Moisture = loss on drying / sample', `${fx(M, 2)}%`, true], ['Volatile matter = loss at 950 °C / sample', `${fx(V, 2)}%`, true], ['Ash = residue / sample', `${fx(A, 2)}%`, true], ['Fixed carbon = 100 − (M + VM + ash)', `${fx(FC, 2)}%`, true], ['Fuel ratio FC/VM', `${fx(FC/V, 2)} (about 1 to 2 is typical of bituminous coal)`]]; } });

/* ---------- 10.16 boiler efficiency ---------- */
const BF = { bagasse:['Bagasse', 47, 6, 44, 0.3, 0.1, 2.6, 50, 200], wood:['Wood chips', 50, 6, 43, 0.2, 0, 0.8, 25, 190], coal:['Bituminous coal', 75, 5, 8, 1.5, 1.5, 9, 8, 180], hfo:['Heavy fuel oil', 86, 11.5, 0.3, 0.2, 2, 0.05, 0.5, 200] };
{ const P = {}; let fu = 'bagasse';
  const Hc = controls($('be_c'), [['O2', 'O₂ in dry flue gas', 1, 14, 0.1, 6, '%'], ['Tf', 'Flue gas temperature', 120, 350, 1, 200, '°C'], ['Ta', 'Air temperature', 15, 40, 1, 25, '°C'], ['CO', 'CO in flue gas', 0, 5000, 10, 300, 'ppm'], ['M', 'Fuel moisture as fired', 0, 60, 1, 50, '%'], ['rad', 'Radiation and unaccounted losses', 0.5, 4, 0.1, 2, '%']], P, () => draw());
  function calc(o2, Tf){ const f = BF[fu], m = P.M/100, c = f[1]*(1 - m)/100, h = f[2]*(1 - m)/100, o = f[3]*(1 - m)/100, n = f[4]*(1 - m)/100, s = f[5]*(1 - m)/100;
    const hhvDry = 0.3491*f[1] + 1.1783*f[2] + 0.1005*f[5] - 0.1034*f[3] - 0.0151*f[4] - 0.0211*f[6], gcv = hhvDry*(1 - m)*1000; // kJ/kg as fired
    const nC = c/12, nS = s/32, nN = n/28, nO2st = c/12 + h/4 + s/32 - o/32, dry = lam => nC + nS + nN + 3.76*lam*nO2st + (lam - 1)*nO2st;
    let lo = 1, hi = 10; for (let k = 0; k < 60; k++){ const L = (lo + hi)/2; if ((L - 1)*nO2st/dry(L)*100 < o2) lo = L; else hi = L; } const lam = (lo + hi)/2;
    const mdfg = nC*44 + nS*64 + (nN + 3.76*lam*nO2st)*28 + (lam - 1)*nO2st*32, dT = Tf - P.Ta;
    const L1 = mdfg*1.0*dT/gcv*100, L2 = 9*h*(2442 + 1.88*dT)/gcv*100, L3 = m*(2442 + 1.88*dT)/gcv*100, co2 = nC/dry(lam)*100, coPct = P.CO/1e4, L4 = coPct/(coPct + co2)*c*23700/gcv*100;
    return { lam, L1, L2, L3, L4, L5:P.rad, eff:100 - L1 - L2 - L3 - L4 - P.rad, gcv, co2, mdfg }; }
  function draw(){ const r = calc(P.O2, P.Tf), xs = [], ys = [], ys2 = []; for (let o = 1; o <= 14; o += 0.1){ xs.push(o); ys.push(calc(o, P.Tf).eff); ys2.push(calc(o, P.Tf + 50).eff); }
    chart($('be'), { x:xs, series:[{ y:ys, color:C.crank, label:`flue at ${P.Tf} °C` }, { y:ys2, color:C.muted, dash:[4, 3], label:`flue at ${P.Tf + 50} °C` }], markers:[{ x:P.O2, y:r.eff, color:C.ink, label:`${fx(r.eff, 1)}%` }], ylab:'efficiency [% of GCV]', xlab:'O₂ in dry flue gas [%]', zero:false });
    const parts = [['Flue gas', r.L1], ['H₂ water', r.L2], ['Moisture', r.L3], ['CO', r.L4], ['Radiation', r.L5]], top = Math.max(10, ...parts.map(p => p[1]))*1.15, yt = []; for (let v = 0; v <= top; v += top > 30 ? 10 : 5) yt.push(v);
    const a = axes($('be_l'), { xl:0, xr:parts.length, yb:0, yt:top, yticks:yt, ylab:'loss [% of GCV]' }), q = a.ctx;
    parts.forEach(([n, v], i) => { const x0 = a.X(i + 0.2), x1 = a.X(i + 0.8); q.fillStyle = i === 2 && v > 10 ? C.bad : C.acc; q.fillRect(x0, a.Y(v), x1 - x0, a.Y(0) - a.Y(v)); label(q, n, (x0 + x1)/2, a.Y(0) + 11, C.text, 'center', 10.5, false); label(q, fx(v, 1), (x0 + x1)/2, a.Y(v) - 9, C.text, 'center', 10.5, false); });
    $('be_st').innerHTML = statsHTML([['GCV as fired', `${fx(r.gcv/1000, 2)} MJ/kg`], ['Excess air (from O₂ and fuel analysis)', `${fx((r.lam - 1)*100, 0)}%`], ['CO₂ in dry flue gas', `${fx(r.co2, 1)}%`], ['Dry flue gas', `${fx(r.mdfg, 2)} kg per kg fuel`], ['Boiler efficiency (indirect, GCV basis)', `${fx(r.eff, 1)}%`], ['Gain from trimming O₂ to 4%', `${fx(calc(4, P.Tf).eff - r.eff, 1)} percentage points`]]);
    $('be_sub').textContent = `${BF[fu][0]}: ultimate analysis from Chapter 10A; losses by the heat-loss method`; }
  segGroup($('be_seg'), v => { fu = v; Hc.M.set(BF[v][7]); Hc.Tf.set(BF[v][8]); draw(); }); ['be', 'be_l'].forEach(id => watchSize($(id), draw)); onRedraw(draw); draw(); }

/* ---------- 10.17 XRF alloy ID ---------- */
const AL = { 'Mild steel (S275)':{ Fe:98.3, Mn:1.2, Si:0.25, Cu:0.2 }, 'Stainless steel 304':{ Fe:70.5, Cr:18.5, Ni:8.5, Mn:1.6, Si:0.5 }, 'Stainless steel 316':{ Fe:67.6, Cr:17, Ni:11, Mo:2.2, Mn:1.6 }, 'Free-machining brass (CuZn39Pb3)':{ Cu:58, Zn:39, Pb:3 }, 'Tin bronze (CuSn12)':{ Cu:88, Sn:11.6, Pb:0.3 },
  'Aluminium 6061':{ Al:97.9, Mg:1.0, Si:0.6, Cu:0.28, Cr:0.2 }, 'Aluminium 7075':{ Al:90, Zn:5.6, Mg:2.5, Cu:1.6, Cr:0.23 }, 'Titanium Ti-6Al-4V':{ Ti:90, Al:6, V:4 }, 'Nickel alloy 625':{ Ni:61, Cr:21.5, Mo:9, Nb:3.6, Fe:4 }, 'Grey cast iron':{ Fe:93.6, Si:2.2, Mn:0.6 } };
{ const names = Object.keys(AL), sa = $('xr_a'); names.forEach(n => sa.add(new Option(n, n))); let cur = names[1], nz = {}, verdict = '';
  const scan = () => { cur = names[Math.floor(Math.random()*names.length)]; nz = {}; verdict = ''; draw(); };
  function draw(){ const comp = AL[cur], els = Object.keys(comp).filter(e => !(e === 'Mg' || e === 'Al') || !cur.startsWith('Aluminium') || true), shown = els.map(e => { if (!(e in nz)) nz[e] = 1 + 0.03*gauss(); return [e, comp[e]*nz[e]]; }).sort((a, b) => b[1] - a[1]);
    const a = axes($('xr'), { xl:0, xr:shown.length, yb:-1.3, yt:2.2, yticks:[-1, 0, 1, 2], ylab:'wt% (log scale: 0.1, 1, 10, 100)' }), q = a.ctx;
    shown.forEach(([e, v], i) => { const x0 = a.X(i + 0.2), x1 = a.X(i + 0.8), lv = Math.log10(Math.max(v, 0.06)); q.fillStyle = C.crank; q.fillRect(x0, a.Y(lv), x1 - x0, a.Y(-1.3) - a.Y(lv)); label(q, e, (x0 + x1)/2, a.Y(-1.3) + 11, C.ink, 'center', 12, false); label(q, `${fx(v, v < 1 ? 2 : 1)}%`, (x0 + x1)/2, a.Y(lv) - 9, C.text, 'center', 11, false); });
    $('xr_st').innerHTML = statsHTML([['Reading', shown.map(([e, v]) => `${e} ${fx(v, v < 1 ? 2 : 1)}`).join(', ')], ['Result', verdict || 'choose the grade that matches and press Check', verdict.startsWith('Not') ? 'bad' : '']]);
    $('xr_sub').textContent = 'handheld XRF cannot measure carbon; use LIBS or spark OES when carbon content matters'; }
  $('xr_new').addEventListener('click', scan); $('xr_chk').addEventListener('click', () => { verdict = sa.value === cur ? `Correct: ${cur}.` : `Not quite: compare the main alloying elements again.`; draw(); });
  watchSize($('xr'), draw); onRedraw(draw); draw(); }

/* ---------- 10.18 melt flow index example ---------- */
example($('ex6'), { title:'Worked example: melt flow index of a polypropylene', src:'ASTM D1238', q:'In a melt flow test at 230 °C under 2.16 kg, extrudate is cut off every 30 s. Five cut-offs weigh 0.62, 0.60, 0.63, 0.61 and 0.62 g. Calculate the melt flow index and suggest whether the grade suits injection moulding or pipe extrusion.',
  inputs:[['mm', 'Mean cut-off mass', 0.616, 'g'], ['t', 'Cut-off interval', 30, 's']],
  solve:o => { const mfi = o.mm*600/o.t; return [['MFI = mean mass × 600 / interval (s)', `${fx(mfi, 1)} g/10 min`, true], ['Interpretation', mfi > 8 ? 'high flow: an injection-moulding grade (thin walls fill easily)' : mfi > 1 ? 'medium flow: general moulding or extrusion' : 'low flow, long chains: pipe extrusion or blow moulding, tougher', true], ['Chemistry link (Chapter 8)', 'longer chains (higher molecular weight) entangle more, so the melt flows less and the MFI falls']]; } });

[
  { q:'A calibration line has a high R² but the sample reads above the top standard. What should you do?', o:['Report it as measured', 'Dilute the sample into the calibrated range and re-measure', 'Extend the line by eye', 'Ignore the highest standard'], a:1, why:'Beer–Lambert linearity is only proven inside the standards.' },
  { q:'Why does a pH meter measure temperature?', o:['To correct the electrode slope, which is proportional to absolute temperature (Nernst)', 'To protect the glass', 'Because pH is defined at 0 °C', 'It does not matter'], a:0, why:'2.303RT/F changes from 54 mV/pH at 0 °C to 64 at 50 °C.' },
  { q:'Ethanoic acid is titrated with NaOH. Which indicator?', o:['Methyl orange', 'Phenolphthalein', 'Either', 'None works'], a:1, why:'The equivalence point is near pH 8.7, inside phenolphthalein\'s range.' },
  { q:'A buried pipeline reads −700 mV against Cu/CuSO₄ (current off). Is it protected?', o:['adequately protected', 'under-protected; the criterion is −850 mV or more negative', 'over-protected', 'not measurable'], a:1, why:'NACE SP0169 −850 mV CSE criterion.' },
  { q:'In a bomb calorimeter, why must the water equivalent be found with benzoic acid?', o:['To dry the bomb', 'To account for heat absorbed by the bomb, stirrer and vessel, using a fuel of certified heat of combustion', 'To remove sulfur', 'To measure hydrogen'], a:1, why:'Calibration gives (W + w).' },
  { q:'What is usually the largest heat loss in a bagasse boiler?', o:['radiation', 'evaporating the fuel moisture', 'CO', 'ash'], a:1, why:'Bagasse is fired at about 50% moisture.' },
  { q:'A handheld XRF reads Cu 58%, Zn 39%, Pb 3%. Which alloy is it?', o:['tin bronze', 'free-machining brass', 'stainless steel', 'aluminium alloy'], a:1, why:'Lead is added to brass for machinability; it should not be used for drinking water parts.' },
  { q:'What does a higher melt flow index mean?', o:['longer polymer chains', 'shorter chains and easier flow', 'higher melting point', 'more cross-linking'], a:1, why:'Lower molecular weight gives lower melt viscosity.' } ].forEach((q, i) => quiz($('qz' + (i + 1)), [q]));
})();
