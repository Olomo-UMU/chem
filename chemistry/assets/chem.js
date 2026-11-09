/* Chemistry for mechanical engineers: interactive figures */
(() => {
'use strict';
const R = 8.314;

/* ---------- small maths ---------- */
function erf(x){ const s = Math.sign(x); x = Math.abs(x); const t = 1/(1 + 0.3275911*x), y = 1 - (((((1.061405429*t - 1.453152027)*t) + 1.421413741)*t - 0.284496736)*t + 0.254829592)*t*Math.exp(-x*x); return s*y; }
function erfinv(v){ let a = 0, b = 6; for (let k = 0; k < 80; k++){ const m = (a + b)/2; if (erf(m) < v) a = m; else b = m; } return (a + b)/2; }
let seed = 11; const rnd = () => { seed = (seed*16807) % 2147483647; return (seed - 1)/2147483646; };
const gauss = () => { const u = Math.max(rnd(), 1e-12), v = rnd(); return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v); };
const fx = (v, d = 1) => n2(v, d);

/* =================== 2. combustion =================== */
const FUELS = { CH4:{ x:1, y:4, z:0, LHV:50.0, name:'methane', f:'CH_4' }, C3H8:{ x:3, y:8, z:0, LHV:46.35, name:'propane', f:'C_3H_8' }, C8H18:{ x:8, y:18, z:0, LHV:44.43, name:'octane (petrol)', f:'C_8H_18' },
  C12H23:{ x:12, y:23, z:0, LHV:42.8, name:'diesel (C₁₂H₂₃ average)', f:'C_12H_23' }, C2H6O:{ x:2, y:6, z:1, LHV:26.8, name:'ethanol', f:'C_2H_6O' }, H2:{ x:0, y:2, z:0, LHV:120.0, name:'hydrogen', f:'H_2' } };
// sensible enthalpy h(T) − h(298 K), kJ/kmol, from ideal-gas tables (Çengel & Boles, 2015)
const TT = [298, 600, 1000, 1500, 2000, 2500, 3000, 3500];
const DH = { N2:[0, 8894, 21460, 38404, 56141, 74312, 92738, 111400], O2:[0, 9247, 22707, 40610, 59199, 78375, 98098, 118300],
  CO2:[0, 12916, 33405, 61714, 91440, 121926, 152862, 184100], H2O:[0, 10498, 25978, 48095, 72689, 98964, 126360, 154500] };
const dh = (sp, T) => { const a = DH[sp]; if (T <= TT[0]) return 0; for (let i = 1; i < TT.length; i++) if (T <= TT[i]){ const u = (T - TT[i - 1])/(TT[i] - TT[i - 1]); return a[i - 1] + u*(a[i] - a[i - 1]); } const n = TT.length - 1; return a[n] + (T - TT[n])*(a[n] - a[n - 1])/(TT[n] - TT[n - 1]); };
function comb(F, e, Tair){ const ast = F.x + F.y/4 - F.z/2, M = 12.011*F.x + 1.008*F.y + 15.999*F.z, o2 = (1 + e)*ast, n2 = 3.76*o2;
  const P = { CO2:F.x, H2O:F.y/2, O2:e*ast, N2:n2 }, tot = P.CO2 + P.H2O + P.O2 + P.N2, dry = tot - P.H2O;
  const Hin = F.LHV*1000*M + o2*dh('O2', Tair) + n2*dh('N2', Tair), Hp = T => P.CO2*dh('CO2', T) + P.H2O*dh('H2O', T) + P.O2*dh('O2', T) + P.N2*dh('N2', T);
  let a = 298, b = 4000; for (let k = 0; k < 60; k++){ const m = (a + b)/2; if (Hp(m) < Hin) a = m; else b = m; }
  const pw = P.H2O/tot*101.325*10, g = Math.log(pw/6.112), Tdp = pw > 0 ? 243.12*g/(17.62 - g) : NaN;
  return { ast, M, P, tot, AFRst:4.76*ast*28.97/M, AFR:4.76*o2*28.97/M, O2d:P.O2/dry*100, CO2d:P.CO2/dry*100, Tad:(a + b)/2, Tdp, co2kg:P.CO2*44.01/M }; }
{ const P = {}; let fuel = 'CH4';
  controls($('cb_c'), [['ea', 'Excess air', 0, 200, 1, 15, '%'], ['Ta', 'Air inlet temperature', 0, 500, 5, 25, '°C']], P, () => draw());
  function draw(){ const F = FUELS[fuel], Ta = P.Ta + 273.15, r = comb(F, P.ea/100, Ta), es = [], ts = [], o2 = [], co2 = [];
    for (let e = 0; e <= 200; e += 2){ const q = comb(F, e/100, Ta); es.push(e); ts.push(q.Tad - 273.15); o2.push(q.O2d); co2.push(q.CO2d); }
    chart($('cb'), { x:es, series:[{ y:ts, color:C.acc, label:'adiabatic flame temperature [°C]' }], markers:[{ x:P.ea, y:r.Tad - 273.15, color:C.ink, label:`${fx(r.Tad - 273.15, 0)} °C` }], ylab:'T_ad [°C]', xlab:'excess air [%]' });
    chart($('cb_g'), { x:es, series:[{ y:o2, color:C.vel, label:'O_2 (dry) [%]' }, { y:co2, color:C.crank, label:'CO_2 (dry) [%]' }], vlines:[{ v:P.ea, color:C.muted, label:'now' }], ylab:'% by volume, dry', xlab:'excess air [%]' });
    const pct = k => fx(r.P[k]/r.tot*100, 1);
    $('cb_st').innerHTML = statsHTML([['Balanced equation', `${F.f.replace(/_(\d+)/g, '<sub>$1</sub>')} + ${fx((1 + P.ea/100)*r.ast, 3)}(O<sub>2</sub> + 3.76N<sub>2</sub>)`], ['Stoichiometric AFR', `${fx(r.AFRst, 2)} kg air/kg fuel`], ['Actual AFR, λ', `${fx(r.AFR, 2)}, ${fx(1 + P.ea/100, 2)}`], ['Wet products CO₂ / H₂O / O₂ / N₂', `${pct('CO2')} / ${pct('H2O')} / ${pct('O2')} / ${pct('N2')} %`], ['Adiabatic flame temperature', `${fx(r.Tad, 0)} K (${fx(r.Tad - 273.15, 0)} °C)`], ['Dew point of flue gas', isFinite(r.Tdp) ? `${fx(r.Tdp, 1)} °C` : '–'], ['CO₂ emitted', `${fx(r.co2kg, 2)} kg/kg fuel = ${fx(r.co2kg/F.LHV*3600, 0)} g/kWh of heat`]]);
    $('cb_sub').textContent = `${F.name}, LHV ${F.LHV} MJ/kg, complete combustion`; }
  segGroup($('cb_seg'), v => { fuel = v; draw(); }); ['cb', 'cb_g'].forEach(id => watchSize($(id), draw)); onRedraw(draw); draw();
  example($('ex1'), { title:'Worked example: burning octane with 20% excess air', src:'method as in Çengel and Boles (2015)', q:'Octane (C<sub>8</sub>H<sub>18</sub>) burns completely with 20% excess air. Find the air–fuel ratio, the composition of the products, and the dew point of the flue gas at 1 atm.',
    inputs:[['x', 'Carbon atoms x', 8, ''], ['y', 'Hydrogen atoms y', 18, ''], ['z', 'Oxygen atoms z', 0, ''], ['e', 'Excess air', 20, '%']],
    solve:o => { const F = { x:o.x, y:o.y, z:o.z, LHV:44 }, r = comb(F, o.e/100, 298); const o2 = (1 + o.e/100)*r.ast;
      return [['Stoichiometric oxygen a_st = x + y/4 − z/2', fx(r.ast, 3) + ' kmol'], ['Oxygen supplied (1 + e)a_st, nitrogen 3.76 times that', `${fx(o2, 3)} kmol O₂, ${fx(3.76*o2, 2)} kmol N₂`],
        ['Products: CO₂ = x, H₂O = y/2, O₂ = e a_st, N₂', `${fx(r.P.CO2, 2)}, ${fx(r.P.H2O, 2)}, ${fx(r.P.O2, 3)}, ${fx(r.P.N2, 2)} kmol (total ${fx(r.tot, 2)})`],
        ['Air mass 4.76 × ' + fx(o2, 3) + ' × 28.97; fuel mass M', `${fx(4.76*o2*28.97, 1)} kg; ${fx(r.M, 2)} kg`], ['Air–fuel ratio', `${fx(r.AFR, 2)} kg air/kg fuel`, true],
        ['Partial pressure of water vapour (y/2)/total × 101.325 kPa', `${fx(r.P.H2O/r.tot*101.325, 2)} kPa`], ['Dew point (saturation temperature at that pressure)', `${fx(r.Tdp, 1)} °C`, true]]; } }); }

/* =================== 3. galvanic corrosion =================== */
// approximate corrosion potentials in flowing seawater, V vs saturated calomel electrode (after LaQue, in Jones 1996)
const MET = [['Magnesium', -1.60, 12.15, 1.74], ['Zinc', -1.03, 32.69, 7.13], ['Aluminium alloy', -0.87, 8.99, 2.70], ['Mild steel', -0.65, 27.92, 7.87], ['Cast iron', -0.63, 27.92, 7.2], ['Stainless 304 (active)', -0.52, 25.5, 7.9], ['Naval brass', -0.40, 32.0, 8.4], ['Copper', -0.34, 31.77, 8.96], ['Lead', -0.22, 103.6, 11.34], ['70/30 copper–nickel', -0.20, 31.3, 8.94], ['Nickel', -0.15, 29.35, 8.9], ['Stainless 316 (passive)', -0.05, 25.5, 8.0], ['Titanium', 0.00, 23.95, 4.51], ['Graphite', 0.25, null, null]];
{ const P = {}, sa = $('gc_a'), sb = $('gc_b');
  MET.forEach((m, i) => { sa.add(new Option(m[0], i)); sb.add(new Option(m[0], i)); }); sa.value = 3; sb.value = 7;
  controls($('gc_c'), [['lr', 'Area of B ÷ area of A (log scale)', -2, 2, 0.1, 1, '', v => `B is ${fx(10**v, v < 0 ? 2 : 1)} × A`], ['il', 'Oxygen-limited cathodic current density', 5, 100, 1, 20, 'μA/cm²']], P, () => draw());
  function draw(){ const A = MET[+sa.value], B = MET[+sb.value], aIsAn = A[1] < B[1], an = aIsAn ? A : B, ca = aIsAn ? B : A, ratio = aIsAn ? 10**P.lr : 10**(-P.lr), dE = Math.abs(A[1] - B[1]);
    const rateOf = rr => an[2] ? 3.27e-3*P.il*rr*an[2]/an[3] : NaN, active = dE >= 0.05;
    // galvanic series line
    const V = fitXY($('gc'), { xl:-1.75, xr:0.4, yb:-1.1, yt:1.1 }, 26), { ctx, PX, PY, W } = V;
    ctx.strokeStyle = C.muted; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(PX(-1.7), PY(0)); ctx.lineTo(PX(0.35), PY(0)); ctx.stroke();
    for (let v = -1.6; v <= 0.3001; v += 0.2){ ctx.beginPath(); ctx.moveTo(PX(v), PY(0) - 4); ctx.lineTo(PX(v), PY(0) + 4); ctx.stroke(); label(ctx, fx(v, 1), PX(v), PY(0) + 14, C.muted, 'center', 10, false); }
    label(ctx, 'potential, V vs SCE, in seawater', PX(-0.7), PY(-1.02), C.muted, 'center', 10.5, false); label(ctx, '⟵ anodic (corrodes)', PX(-1.7), PY(1.02), C.bad, 'left', 11, false); label(ctx, 'cathodic (protected) ⟶', PX(0.35), PY(1.02), C.vel, 'right', 11, false);
    MET.forEach((m, i) => { const sel = m === an ? C.bad : m === ca ? C.vel : C.muted, up = i % 2 === 0, lev = Math.floor(i/2) % 4, y = up ? 0.2 + 0.2*lev : -0.2 - 0.2*lev;
      ctx.strokeStyle = alpha(sel.startsWith('#') ? sel : '#888888', 0.6); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(PX(m[1]), PY(0)); ctx.lineTo(PX(m[1]), PY(y)); ctx.stroke(); dotAt(ctx, PX(m[1]), PY(0), sel, m === an || m === ca ? 6 : 3.5);
      label(ctx, m[0], PX(m[1]), PY(y) + (up ? -6 : 6), sel, 'center', m === an || m === ca ? 11.5 : 10); });
    const xs = [], ys = []; for (let l = -2; l <= 2.0001; l += 0.05){ xs.push(l); ys.push(active ? rateOf(10**l) : 0); }
    chart($('gc_r'), { x:xs, series:[{ y:ys, color:C.bad, label:`extra corrosion of ${an[0].toLowerCase()} [mm/year]` }], markers:[{ x:Math.log10(ratio), y:active ? rateOf(ratio) : 0, color:C.ink, label:`${fx(active ? rateOf(ratio) : 0, 2)} mm/y` }], ylab:'mm/year', xlab:'log₁₀(cathode area / anode area)' });
    $('gc_st').innerHTML = statsHTML([['Anode (corrodes)', an[0], 'bad'], ['Cathode (protected)', ca[0]], ['Potential difference', `${fx(dE*1000, 0)} mV`], ['Cathode : anode area', `${fx(ratio, ratio < 1 ? 2 : 1)} : 1`], ['Galvanic current density on the anode', active ? `${fx(P.il*ratio, 1)} μA/cm²` : 'negligible'], ['Extra corrosion rate of the anode', an[2] ? (active ? `${fx(rateOf(ratio), 3)} mm/year` : 'negligible') : '–', active && rateOf(ratio) > 0.5 ? 'bad' : '']]);
    $('gc_sub').textContent = A === B ? 'same metal: no galvanic cell' : !active ? 'potentials within 50 mV: little galvanic effect' : ratio > 10 ? 'small anode, large cathode: the worst arrangement' : ratio < 0.1 ? 'large anode, small cathode: attack spread thinly' : 'the anode carries all the cathode\'s current'; }
  sa.addEventListener('change', draw); sb.addEventListener('change', draw); ['gc', 'gc_r'].forEach(id => watchSize($(id), draw)); onRedraw(draw); draw();
  example($('ex2'), { title:'Worked example: sizing sacrificial zinc anodes', src:'illustrative numbers', q:'The wetted steel hull of a small vessel has an area of 200 m². The design protection current density for painted steel in seawater is 20 mA/m². How much zinc is needed for a 2-year docking interval if the practical capacity of zinc is 780 A⋅h/kg and 85% of the anode can be used? Check the theoretical capacity from Faraday\'s law.',
    inputs:[['A', 'Wetted area', 200, 'm²'], ['i', 'Current density', 20, 'mA/m²'], ['y', 'Design life', 2, 'years'], ['c', 'Practical capacity', 780, 'A⋅h/kg'], ['u', 'Utilisation factor', 0.85, '']],
    solve:o => { const I = o.A*o.i/1000, Q = I*o.y*8760; return [['Theoretical capacity of zinc, nF/M = 2 × 96,485 / 65.38 g', `${fx(2*96485/65.38, 0)} C/g = ${fx(2*96485/65.38/3.6, 0)} A⋅h/kg`], ['Protection current I = A × i', `${fx(I, 2)} A`], ['Charge over the life Q = I × hours', `${fx(Q, 0)} A⋅h`], ['Zinc mass m = Q / (capacity × utilisation)', `${fx(Q/(o.c*o.u), 1)} kg`, true], ['Corrosion rate of the hull if unprotected at 20 μA/cm² (for comparison)', `${fx(3.27e-3*20*27.92/7.87, 2)} mm/year`]]; } }); }

/* =================== 4. carburising =================== */
{ const P = {}; const D0 = 2.3e-5, Q = 148000;
  controls($('cz_c'), [['T', 'Temperature', 850, 1050, 5, 927, '°C'], ['t', 'Time', 0.5, 24, 0.5, 8, 'h'], ['Cs', 'Surface carbon C_s', 0.6, 1.3, 0.01, 1.0, 'wt%'], ['C0', 'Carbon in the steel C_0', 0.1, 0.4, 0.01, 0.2, 'wt%'], ['Cc', 'Case defined at', 0.3, 0.8, 0.01, 0.4, 'wt%']], P, () => draw());
  const depth = (D, t) => P.Cc <= P.C0 || P.Cc >= P.Cs ? NaN : 2*Math.sqrt(D*t)*erfinv(1 - (P.Cc - P.C0)/(P.Cs - P.C0));
  function draw(){ const Dof = Tc => D0*Math.exp(-Q/(R*(Tc + 273.15))), D = Dof(P.T), t = P.t*3600, xs = [], cs = [];
    for (let x = 0; x <= 3; x += 0.01){ xs.push(x); cs.push(P.C0 + (P.Cs - P.C0)*(1 - erf(x/1000/(2*Math.sqrt(D*t))))); }
    const cd = depth(D, t)*1000;
    chart($('cz'), { x:xs, series:[{ y:cs, color:C.crank, label:'carbon content [wt%]' }], hlines:[{ v:P.Cc, color:C.bad, label:'case boundary', right:true }], markers:isFinite(cd) ? [{ x:cd, y:P.Cc, color:C.ink, label:`${fx(cd, 2)} mm` }] : [], ylab:'C [wt%]', xlab:'depth below surface [mm]' });
    const ts = [], temps = [875, 925, 975, 1025], ser = temps.map(() => []); for (let h = 0; h <= 24; h += 0.25){ ts.push(h); temps.forEach((T, k) => ser[k].push(depth(Dof(T), h*3600)*1000)); }
    const cols = [C.vel, C.crank, C.acc, C.force];
    chart($('cz_t'), { x:ts, series:temps.map((T, k) => ({ y:ser[k], color:cols[k], label:`${T} °C` })), markers:isFinite(cd) ? [{ x:P.t, y:cd, color:C.ink }] : [], ylab:'case depth [mm]', xlab:'time [h]' });
    $('cz_st').innerHTML = statsHTML([['Diffusion coefficient D', `${D.toExponential(2)} m²/s`], ['Diffusion length √(Dt)', `${fx(Math.sqrt(D*t)*1000, 3)} mm`], ['Case depth', isFinite(cd) ? `${fx(cd, 2)} mm` : 'not defined for these values'], ['Time for twice this depth', `${fx(P.t*4, 1)} h`], ['D at 50 °C hotter', `× ${fx(Dof(P.T + 50)/D, 2)}`]]);
    $('cz_sub').textContent = 'semi-infinite solid, constant surface carbon, D independent of carbon content'; }
  ['cz', 'cz_t'].forEach(id => watchSize($(id), draw)); onRedraw(draw); draw();
  example($('ex3'), { title:'Worked example: time to carburise a gear', src:'after Callister and Rethwisch (2018)', q:'A steel containing 0.25 wt% C is carburised at 950 °C with the surface held at 1.20 wt% C. The diffusion coefficient of carbon at this temperature is 1.6 × 10<sup>−11</sup> m²/s. How long does it take for the carbon content to reach 0.80 wt% at 0.5 mm below the surface?',
    inputs:[['C0', 'C_0', 0.25, 'wt%'], ['Cs', 'C_s', 1.2, 'wt%'], ['Cx', 'C_x', 0.8, 'wt%'], ['x', 'Depth x', 0.5, 'mm'], ['D', 'D', 1.6, '×10⁻¹¹ m²/s']],
    solve:o => { const r = (o.Cx - o.C0)/(o.Cs - o.C0), z = erfinv(1 - r), D = o.D*1e-11, x = o.x/1000, t = x*x/(4*D*z*z); return [['(C_x − C_0)/(C_s − C_0) = 1 − erf(z)', fx(r, 4)], ['erf(z) =', fx(1 - r, 4)], ['z = x / 2√(Dt) (inverse error function)', fx(z, 4)], ['t = x² / (4 D z²)', `${fx(t, 0)} s`], ['Time', `${fx(t/3600, 2)} h`, true]]; } }); }

/* =================== 5. calibration =================== */
{ const P = {}; const STD = [0, 2, 4, 6, 8, 10]; let noise = [];
  const reroll = () => { noise = Array.from({ length:STD.length + 3 }, gauss); };
  reroll();
  controls($('cl_c'), [['m', 'Sensitivity ε b', 0.02, 0.15, 0.005, 0.08, 'per mg/L'], ['s', 'Reading noise σ', 0.001, 0.03, 0.001, 0.006, 'absorbance'], ['sl', 'Stray light', 0, 5, 0.1, 0.5, '%'], ['Au', 'Unknown sample absorbance (true)', 0.05, 1.2, 0.01, 0.45, '']], P, () => draw());
  const obs = (A, s) => -Math.log10((10**(-A) + s)/(1 + s));
  function draw(){ const s = P.sl/100, ys = STD.map((c, i) => obs(P.m*c, s) + P.s*noise[i]), n = STD.length, xb = STD.reduce((a, b) => a + b)/n, yb = ys.reduce((a, b) => a + b)/n;
    const Sxx = STD.reduce((a, c) => a + (c - xb)**2, 0), m = STD.reduce((a, c, i) => a + (c - xb)*(ys[i] - yb), 0)/Sxx, b = yb - m*xb, res = ys.map((y, i) => y - (m*STD[i] + b)), syx = Math.sqrt(res.reduce((a, r) => a + r*r, 0)/(n - 2));
    const Syy = ys.reduce((a, y) => a + (y - yb)**2, 0), R2 = 1 - res.reduce((a, r) => a + r*r, 0)/Syy;
    const reps = [0, 1, 2].map(k => obs(P.Au, s) + P.s*noise[n + k]), y0 = reps.reduce((a, c) => a + c)/3, c0 = (y0 - b)/m, cTrue = P.Au/P.m;
    const sc = syx/m*Math.sqrt(1/3 + 1/n + (y0 - yb)**2/(m*m*Sxx)), ci = 2.776*sc;
    const top = Math.max(12, c0*1.1, cTrue*1.1), xs = [], fit = [], truth = []; for (let c = 0; c <= top; c += top/200){ xs.push(c); fit.push(m*c + b); truth.push(obs(P.m*c, s)); }
    chart($('cl'), { x:xs, series:[{ y:fit, color:C.crank, label:'least-squares line' }, { y:truth, color:C.muted, dash:[4, 3], label:'instrument response' }], markers:[...STD.map((c, i) => ({ x:c, y:ys[i], color:C.ink })), { x:c0, y:y0, color:C.bad, label:`unknown: ${fx(c0, 2)} mg/L` }], ylab:'absorbance', xlab:'concentration [mg/L]' });
    chart($('cl_r'), { x:STD, xmin:-0.5, xmax:10.5, series:[{ y:STD.map(() => 0), color:C.muted, w:1 }, { y:res, color:'rgba(0,0,0,0)' }], markers:STD.map((c, i) => ({ x:c, y:res[i], color:C.acc })), hlines:[{ v:syx, color:C.muted, dash:[2, 3], label:'+s' }, { v:-syx, color:C.muted, dash:[2, 3], label:'−s' }], ylab:'residual [absorbance]', xlab:'standard concentration [mg/L]' });
    const outside = c0 > 10 || c0 < 0;
    $('cl_st').innerHTML = statsHTML([['Fit', `A = ${fx(m, 4)} c ${b < 0 ? "−" : "+"} ${fx(Math.abs(b), 4)}`], ['R²', fx(R2, 5)], ['Residual standard deviation s', fx(syx, 4)], ['LOD = 3.3 s/m, LOQ = 10 s/m', `${fx(3.3*syx/m, 3)}, ${fx(10*syx/m, 3)} mg/L`], ['Unknown (mean of 3 readings), 95% interval', `${fx(c0, 3)} ± ${fx(ci, 3)} mg/L`, outside ? 'bad' : ''], ['True concentration', `${fx(cTrue, 3)} mg/L (error ${fx(c0 - cTrue, 3)})`]]);
    $('cl_sub').textContent = outside ? 'the unknown lies outside the standards: dilute it and measure again' : P.sl > 2 ? 'stray light bends the curve: a high R² can still hide a biased fit; look at the residuals' : 'six standards, three readings of the unknown'; }
  $('cl_new').addEventListener('click', () => { seed = Math.floor(Math.random()*1e6) + 1; reroll(); draw(); });
  ['cl', 'cl_r'].forEach(id => watchSize($(id), draw)); onRedraw(draw); draw(); }

/* =================== 6. pH meter =================== */
{ const P = {}; const S = Tc => 2.302585*R*(Tc + 273.15)/96485*1000;
  controls($('ph_c'), [['pH', 'True pH of the sample', 1, 13, 0.01, 9.5, ''], ['k', 'Electrode slope efficiency', 85, 102, 0.5, 97, '%'], ['off', 'Electrode offset at pH 7', -40, 40, 1, 8, 'mV'], ['Tc', 'Temperature during calibration', 5, 50, 1, 25, '°C'], ['Ts', 'Sample temperature', 5, 80, 1, 50, '°C']], P, () => draw());
  function draw(){ const E = (pH, T) => P.off - P.k/100*S(T)*(pH - 7), E7 = E(7, P.Tc), E4 = E(4.01, P.Tc), slope = (E4 - E7)/(7 - 4.01), atc = $('ph_atc').checked;
    const used = atc ? slope*(P.Ts + 273.15)/(P.Tc + 273.15) : slope, Es = E(P.pH, P.Ts), read = 7 - (Es - E7)/used, err = read - P.pH;
    const xs = [], real = [], met = []; for (let p = 0; p <= 14; p += 0.1){ xs.push(p); real.push(E(p, P.Ts)); met.push(E7 - used*(p - 7)); }
    chart($('ph'), { x:xs, series:[{ y:real, color:C.crank, label:`electrode at ${P.Ts} °C` }, { y:met, color:C.acc, dash:[5, 4], label:"meter's calibration line" }], markers:[{ x:4.01, y:E4, color:C.muted, label:'buffer 4.01' }, { x:7, y:E7, color:C.muted, label:'buffer 7.00' }, { x:P.pH, y:Es, color:C.ink, label:`${fx(Es, 1)} mV` }], ylab:'E [mV]', xlab:'pH' });
    const eff = slope/S(P.Tc)*100, bad = Math.abs(err) > 0.05;
    $('ph_st').innerHTML = statsHTML([['Ideal slope at calibration temperature', `${fx(S(P.Tc), 2)} mV/pH`], ['Measured slope, efficiency', `${fx(slope, 2)} mV/pH, ${fx(eff, 1)}%`, eff < 95 ? 'bad' : ''], ['Offset', `${fx(E7, 1)} mV`, Math.abs(E7) > 30 ? 'bad' : ''], ['Sample voltage', `${fx(Es, 1)} mV`], ['Meter reads', `pH ${fx(read, 2)}`], ['Error', `${err >= 0 ? '+' : ''}${fx(err, 3)} pH`, bad ? 'bad' : '']]);
    $('ph_sub').textContent = !atc && P.Ts !== P.Tc ? 'no temperature compensation: the meter uses the slope it measured at the calibration temperature' : eff < 95 ? 'slope below 95%: clean or replace the electrode' : 'two-point calibration corrects offset and slope'; }
  $('ph_atc').addEventListener('change', draw); watchSize($('ph'), draw); onRedraw(draw); draw(); }

/* =================== 7. bomb calorimeter example and flue gas analyser =================== */
example($('ex4'), { title:'Worked example: heating value of diesel in a bomb calorimeter', src:'illustrative readings', q:'Burning 1.0012 g of benzoic acid raises the calorimeter temperature by 2.615 K. A 0.8256 g diesel sample then raises it by 3.700 K. The ignition wire releases 50 J in each run and the acid correction for the diesel run is 40 J. Diesel contains 13.5% hydrogen by mass. Find the energy equivalent, the gross and the net heating values.',
  inputs:[['mb', 'Benzoic acid mass', 1.0012, 'g'], ['dTb', 'ΔT calibration', 2.615, 'K'], ['mf', 'Fuel mass', 0.8256, 'g'], ['dTf', 'ΔT fuel', 3.700, 'K'], ['w', 'Wire correction', 50, 'J'], ['a', 'Acid correction', 40, 'J'], ['h', 'Hydrogen in fuel', 13.5, '%']],
  solve:o => { const Cc = (o.mb*26454 + o.w)/o.dTb, Qf = Cc*o.dTf - o.w - o.a, HHV = Qf/o.mf/1000, LHV = HHV - 2.442*9*o.h/100;
    return [['Energy equivalent C = (m_BA × 26,454 J/g + e_wire)/ΔT', `${fx(Cc, 0)} J/K`], ['Heat from the fuel C ΔT − e_wire − e_acid', `${fx(Qf, 0)} J`], ['Gross heating value Q/m', `${fx(HHV, 2)} MJ/kg`, true], ['Water formed 9 w_H', `${fx(9*o.h/100, 3)} kg per kg fuel`], ['Net heating value HHV − 2.442 × 9 w_H', `${fx(LHV, 2)} MJ/kg`, true]]; } });
{ const P = {}; let fu = 'ng'; const FG = { ng:{ A2:0.66, B:0.009, co2:11.7, name:'natural gas' }, oil:{ A2:0.68, B:0.007, co2:15.4, name:'light fuel oil' }, lpg:{ A2:0.63, B:0.008, co2:13.7, name:'LPG' } };
  controls($('fg_c'), [['O2', 'Measured O₂ (dry)', 1, 15, 0.1, 4, '%'], ['Tf', 'Flue gas temperature', 60, 350, 1, 180, '°C'], ['Ta', 'Combustion air temperature', 0, 40, 1, 20, '°C'], ['CO', 'Measured CO', 0, 1000, 5, 40, 'ppm']], P, () => draw());
  function draw(){ const f = FG[fu], q = (o2, Tf) => (Tf - P.Ta)*(f.A2/(21 - o2) + f.B), lam = 21/(21 - P.O2), co2 = f.co2*(1 - P.O2/21), qa = q(P.O2, P.Tf), coaf = P.CO*lam;
    const xs = [], s1 = [], s2 = [], s3 = []; for (let o = 0.5; o <= 15; o += 0.1){ xs.push(o); s1.push(q(o, P.Tf)); s2.push(q(o, 120)); s3.push(q(o, 260)); }
    chart($('fg'), { x:xs, series:[{ y:s1, color:C.bad, label:`flue at ${P.Tf} °C` }, { y:s2, color:C.vel, dash:[4, 3], label:'120 °C' }, { y:s3, color:C.force, dash:[4, 3], label:'260 °C' }], markers:[{ x:P.O2, y:qa, color:C.ink, label:`${fx(qa, 1)}%` }], ylab:'flue gas loss q_A [%]', xlab:'O_2 in dry flue gas [%]' });
    const cv = $('fg_g'), { ctx, W, H } = prep(cv), bw = Math.min(W - 40, 300), bh = Math.min(H - 30, 250), x0 = (W - bw)/2, y0 = (H - bh)/2;
    ctx.fillStyle = C.chip; ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x0, y0, bw, bh, 10) : ctx.rect(x0, y0, bw, bh); ctx.fill(); ctx.stroke();
    const rows = [['O₂', fx(P.O2, 1), '%'], ['CO₂', fx(co2, 1), '%'], ['CO', fx(P.CO, 0), 'ppm'], ['T flue', fx(P.Tf, 0), '°C'], ['λ', fx(lam, 2), ''], ['qA', fx(qa, 1), '%'], ['Eff (net)', fx(100 - qa, 1), '%']];
    rows.forEach(([k, v, u], i) => { const y = y0 + 22 + i*(bh - 30)/rows.length; ctx.font = `500 13px ${C.mono}`; ctx.fillStyle = C.muted; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(k, x0 + 16, y); ctx.fillStyle = C.ink; ctx.font = `700 17px ${C.mono}`; ctx.textAlign = 'right'; ctx.fillText(v, x0 + bw - 56, y); ctx.font = `13px ${C.mono}`; ctx.fillStyle = C.muted; ctx.textAlign = 'left'; ctx.fillText(u, x0 + bw - 48, y); });
    $('fg_st').innerHTML = statsHTML([['Air ratio λ, excess air', `${fx(lam, 2)}, ${fx((lam - 1)*100, 0)}%`], ['CO₂ (dry, calculated)', `${fx(co2, 1)}%`], ['Flue gas loss q_A', `${fx(qa, 1)}%`], ['Combustion efficiency (net basis)', `${fx(100 - qa, 1)}%`], ['Air-free CO = CO × λ', `${fx(coaf, 0)} ppm`, coaf > 200 ? 'bad' : '']]);
    $('fg_sub').textContent = coaf > 200 ? 'high air-free CO: incomplete combustion; check the burner before trimming air' : P.O2 > 6 ? 'too much excess air: heat is carried up the flue; trim the air' : `${f.name}: Siegert constants A₂ = ${f.A2}, B = ${f.B}`; }
  segGroup($('fg_seg'), v => { fu = v; draw(); }); ['fg', 'fg_g'].forEach(id => watchSize($(id), draw)); onRedraw(draw); draw(); }

quiz($('qz'), [
  { q:'For methane, the stoichiometric oxygen requirement a_st is', o:['1', '2', '3', '4'], a:1, why:'a_st = x + y/4 = 1 + 1 = 2 kmol O₂ per kmol CH₄.' },
  { q:'Adding more excess air beyond what complete combustion needs', o:['raises flame temperature', 'lowers flame temperature and raises flue gas loss', 'has no effect', 'increases CO'], a:1, why:'Extra air is heated but does nothing useful, and leaves through the flue.' },
  { q:'A steel bolt in a large copper plate in seawater', o:['is protected', 'corrodes rapidly, because a small anode carries all the current from a large cathode', 'does not corrode', 'makes the copper corrode'], a:1, why:'Steel is anodic to copper, and the area ratio concentrates the attack.' },
  { q:'Doubling the case depth in carburising at the same temperature takes', o:['twice as long', 'four times as long', 'half as long', 'the same time'], a:1, why:'Depth grows with √(Dt).' },
  { q:'A calibration with R² = 0.999 ', o:['proves the method is accurate', 'can still hide curvature and bias; check the residuals', 'means no uncertainty', 'gives the LOD directly'], a:1, why:'R² measures fit to a straight line, not correctness; patterned residuals reveal non-linearity.' },
  { q:'The ideal pH electrode slope at 25 °C is', o:['1 mV/pH', '59.16 mV/pH', '100 mV/pH', '0.059 mV/pH'], a:1, why:'2.303RT/F = 59.16 mV per pH unit at 298.15 K.' },
  { q:'A bomb calorimeter measures', o:['the net heating value', 'the gross heating value at constant volume', 'flame temperature', 'viscosity'], a:1, why:'The products cool and water condenses inside the bomb.' },
  { q:'Air-free CO is calculated because', o:['CO is measured wet', 'excess air dilutes the reading and could hide poor combustion', 'it is required for CO₂', 'it removes sensor drift'], a:1, why:'Multiplying by λ removes the effect of dilution.' } ]);
})();
