/* BME 1104 Chapter 10A: interactive applications */
(() => {
'use strict';
const fx = (v, d = 1) => n2(v, d), F = 96485;
const tickText = v => Math.abs(v) >= 1000 ? (v/1000) + 'k' : String(+v.toPrecision(3));
function axes(cv, o){ const pl = 70, pr = 16, pt = 30, pb = 40, { ctx, W, H } = prep(cv), w = W - pl - pr, h = H - pt - pb;
  const X = v => pl + (v - o.xl)/(o.xr - o.xl)*w, Y = v => pt + (o.yt - v)/(o.yt - o.yb)*h;
  ctx.font = `15.4px ${C.mono}`; ctx.textBaseline = 'middle'; ctx.lineWidth = 1;
  for (const v of o.yticks){ ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(pl, Y(v)); ctx.lineTo(pl + w, Y(v)); ctx.stroke(); ctx.fillStyle = C.muted; ctx.textAlign = 'right'; ctx.fillText(tickText(v), pl - 6, Y(v)); }
  for (const v of (o.xticks || [])){ ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(X(v), pt); ctx.lineTo(X(v), pt + h); ctx.stroke(); ctx.fillStyle = C.muted; ctx.textAlign = 'center'; ctx.fillText(tickText(v), X(v), pt + h + 14); }
  ctx.textAlign = 'right'; ctx.fillStyle = C.muted; ctx.fillText(o.xlab || '', pl + w, pt + h + 32);
  ctx.save(); ctx.translate(12, pt + h/2); ctx.rotate(-Math.PI/2); ctx.textAlign = 'center'; rich(ctx, o.ylab || '', 0, 0); ctx.restore();
  return { ctx, W, H, X, Y, pl, pt, w, h }; }

/* ---------- 10.2 density example ---------- */
example($('ex1'), { title:'Worked example: density of iron from its crystal structure', src:'Chapter 6 applied', q:'Iron at room temperature is body-centred cubic (2 atoms per unit cell) with lattice parameter a = 0.2866 nm. Its atomic mass is 55.85 g/mol. Calculate its density. Change the inputs to aluminium (FCC, n = 4, a = 0.4049 nm, A = 26.98) or copper (FCC, a = 0.3615 nm, A = 63.55) and compare with handbook values of 7.87, 2.70 and 8.96 g/cm³.',
  inputs:[['n', 'Atoms per unit cell n', 2, ''], ['a', 'Lattice parameter a', 0.2866, 'nm'], ['A', 'Atomic mass A', 55.85, 'g/mol']],
  solve:o => { const a = o.a*1e-7, V = a**3, m = o.n*o.A/6.022e23; return [['Unit-cell volume V_c = a³ (a in cm)', `${V.toExponential(4)} cm³`], ['Mass of atoms in the cell n A / N_A', `${m.toExponential(4)} g`], ['Density ρ = n A / (V_c N_A)', `${fx(m/V, 3)} g/cm³ = ${fx(m/V*1000, 0)} kg/m³`, true], ['Why it matters', 'density sets the mass of every component; X-ray diffraction measures a, so density checks alloy identity']]; } });

/* ---------- 10.3 Langelier index and scale ---------- */
{ const P = {};
  controls($('ls_c'), [['pH', 'Water pH', 6, 9.5, 0.05, 7.9, ''], ['Ca', 'Calcium hardness (as CaCO₃)', 10, 600, 5, 180, 'mg/L'], ['Alk', 'Total alkalinity (as CaCO₃)', 10, 600, 5, 200, 'mg/L'], ['TDS', 'Total dissolved solids', 50, 3000, 10, 450, 'mg/L'], ['T', 'Water temperature', 10, 95, 1, 25, '°C'], ['d', 'Scale thickness on a boiler tube', 0, 3, 0.05, 0.5, 'mm'], ['k', 'Scale thermal conductivity', 0.5, 3, 0.1, 1.2, 'W/(m K)'], ['q', 'Heat flux through the tube', 20, 300, 5, 100, 'kW/m²']], P, () => draw());
  const lsi = (pH, T) => { const A = (Math.log10(P.TDS) - 1)/10, B = -13.12*Math.log10(T + 273) + 34.55, Cc = Math.log10(P.Ca) - 0.4, D = Math.log10(P.Alk); return pH - ((9.3 + A + B) - (Cc + D)); };
  function draw(){ const ts = [], ls = []; for (let T = 10; T <= 95; T++){ ts.push(T); ls.push(lsi(P.pH, T)); } const L = lsi(P.pH, P.T);
    chart($('ls'), { x:ts, series:[{ y:ls, color:C.crank, label:'Langelier index' }], hlines:[{ v:0, color:C.muted, label:'balanced' }], shade:[], markers:[{ x:P.T, y:L, color:L > 0 ? C.bad : C.vel, label:`LSI ${L >= 0 ? '+' : ''}${fx(L, 2)}` }], ylab:'LSI', xlab:'water temperature [°C]', zero:false });
    const Tw = 185, wall = 4e-3, ks = 45, q = P.q*1000, Tm = d => Tw + q/20000 + q*d/1000/P.k + q*wall/2/ks, ds = [], tm = []; for (let d = 0; d <= 3.0001; d += 0.05){ ds.push(d); tm.push(Tm(d)); }
    chart($('ls_t'), { x:ds, series:[{ y:tm, color:C.acc, label:'tube metal temperature (mid-wall) [°C]' }], hlines:[{ v:450, color:C.bad, label:'about 450 °C: carbon steel creeps and bulges' }], markers:[{ x:P.d, y:Tm(P.d), color:C.ink, label:`${fx(Tm(P.d), 0)} °C` }], ylab:'T metal [°C]', xlab:'scale thickness [mm]', zero:false });
    const verdict = L > 0.5 ? 'strongly scale-forming' : L > 0 ? 'mildly scale-forming' : L > -0.5 ? 'balanced to mildly corrosive' : 'corrosive (dissolves carbonate, attacks steel)';
    $('ls_st').innerHTML = statsHTML([['Saturation pH, pH_s', fx(P.pH - L, 2)], ['Langelier index', `${L >= 0 ? '+' : ''}${fx(L, 2)}`, Math.abs(L) > 0.5 ? 'bad' : ''], ['Water tendency', verdict], ['Ryznar index 2pH_s − pH', fx(2*(P.pH - L) - P.pH, 2)], ['Extra metal temperature caused by the scale', `${fx(P.q*1000*P.d/1000/P.k, 0)} K`, Tm(P.d) > 450 ? 'bad' : ''], ['Tube metal temperature', `${fx(Tm(P.d), 0)} °C (water at ${Tw} °C, about 11 bar)`, Tm(P.d) > 450 ? 'bad' : '']]);
    $('ls_sub').textContent = L > 0 && P.T < 60 ? 'heating this water raises the LSI: scale will form on hot surfaces first' : 'soft, low-alkalinity water tends to be corrosive instead'; }
  ['ls', 'ls_t'].forEach(id => watchSize($(id), draw)); onRedraw(draw); draw(); }

/* ---------- 10.4 galvanic cell builder ---------- */
const MET = [['Magnesium', 'Mg', 2, -2.37], ['Aluminium', 'Al', 3, -1.66], ['Zinc', 'Zn', 2, -0.76], ['Chromium', 'Cr', 3, -0.74], ['Iron', 'Fe', 2, -0.44], ['Nickel', 'Ni', 2, -0.25], ['Tin', 'Sn', 2, -0.14], ['Lead', 'Pb', 2, -0.13], ['Copper', 'Cu', 2, 0.34], ['Silver', 'Ag', 1, 0.80]];
const gcd = (a, b) => b ? gcd(b, a % b) : a, sup = z => ({ 1:'⁺', 2:'²⁺', 3:'³⁺' })[z];
{ const P = {}, sa = $('gv_a'), sb = $('gv_b'); MET.forEach((m, i) => { sa.add(new Option(`${m[0]} (${m[1]}${sup(m[2])}/${m[1]}, ${m[3] > 0 ? '+' : ''}${m[3].toFixed(2)} V)`, i)); sb.add(new Option(`${m[0]} (${m[1]}${sup(m[2])}/${m[1]}, ${m[3] > 0 ? '+' : ''}${m[3].toFixed(2)} V)`, i)); }); sa.value = 2; sb.value = 4;
  controls($('gv_c'), [['la', 'Concentration of the anode metal ion (log scale)', -6, 0, 0.1, -2, '', v => `${(10**v).toExponential(1)} mol/L`], ['lc', 'Concentration of the cathode metal ion (log scale)', -6, 0, 0.1, 0, '', v => `${(10**v).toExponential(1)} mol/L`]], P, () => draw());
  function draw(){ let A = MET[+sa.value], B = MET[+sb.value]; const same = A === B; if (A[3] > B[3]) [A, B] = [B, A];
    const za = A[2], zc = B[2], g = gcd(za, zc), n = za*zc/g, E0 = B[3] - A[3], Ecell = c => E0 - 0.05916/n*((zc/g)*c - (za/g)*P.lc), E = Ecell(P.la);
    // cell diagram
    const cv = $('gv'), { ctx, W, H } = prep(cv), bw = Math.min(150, W*0.3), y0 = H*0.42, bh = H*0.42, xa = W*0.27, xc = W*0.73;
    [[xa, A, C.bad, 'ANODE (−): oxidation'], [xc, B, C.vel, 'CATHODE (+): reduction']].forEach(([x, m, col, t]) => { ctx.fillStyle = alpha(C.vel, 0.12); ctx.fillRect(x - bw/2, y0, bw, bh); ctx.strokeStyle = C.ink; ctx.lineWidth = 1.6; ctx.strokeRect(x - bw/2, y0, bw, bh);
      ctx.fillStyle = col; ctx.fillRect(x - 9, y0 - 30, 18, bh*0.75 + 30); label(ctx, m[1], x, y0 - 40, col, 'center', 13); label(ctx, t.replace('ANODE', 'Anode').replace('CATHODE', 'Cathode'), x, y0 + bh + 14, col, 'center', 11);
      label(ctx, `${m[1]}${sup(m[2])}(aq)`, x, y0 + bh*0.88, C.text, 'center', 11); });
    ctx.strokeStyle = C.muted; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(xa + bw/4, y0 + bh*0.5); ctx.lineTo(xa + bw/4, y0 - 6); ctx.lineTo(xc - bw/4, y0 - 6); ctx.lineTo(xc - bw/4, y0 + bh*0.5); ctx.stroke(); label(ctx, 'salt bridge', W/2, y0 - 16, C.muted, 'center', 10.5);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(xa, y0 - 30); ctx.lineTo(xa, 22); ctx.lineTo(xc, 22); ctx.lineTo(xc, y0 - 30); ctx.stroke(); arrow(ctx, W/2 - 30, 22, W/2 + 30, 22, C.acc, 2.4); label(ctx, `e⁻ flow, E = ${fx(E, 3)} V`, W/2, 36, C.acc, 'center', 12);
    const xs = [], ys = []; for (let c = -6; c <= 0.0001; c += 0.1){ xs.push(c); ys.push(Ecell(c)); }
    chart($('gv_n'), { x:xs, series:[{ y:ys, color:C.crank, label:'E_cell from the Nernst equation [V]' }], markers:[{ x:P.la, y:E, color:C.ink, label:`${fx(E, 3)} V` }], hlines:[{ v:E0, color:C.muted, label:`E° = ${fx(E0, 2)} V`, right:true }], ylab:'E_cell [V]', xlab:'log₁₀[anode metal ion] (mol/L)', zero:false });
    $('gv_st').innerHTML = same ? statsHTML([['Result', 'same metal on both sides: no cell potential', 'bad']]) : statsHTML([['Anode (corrodes)', `${A[0]}: ${A[1]} ⟶ ${A[1]}${sup(za)} + ${za}e⁻`, 'bad'], ['Cathode (protected)', `${B[0]}: ${B[1]}${sup(zc)} + ${zc}e⁻ ⟶ ${B[1]}`], ['E°_cell = E°_cathode − E°_anode', `${fx(E0, 2)} V`], ['Electrons transferred n', String(n)], ['E_cell (Nernst, 25 °C)', `${fx(E, 3)} V`], ['ΔG = −nFE', `${fx(-n*F*E/1000, 0)} kJ per mol of reaction`]]);
    $('gv_sub').textContent = same ? '' : E0 > 0.25 ? `${A[0].toLowerCase()} in contact with ${B[0].toLowerCase()} will corrode: insulate them or protect ${A[0].toLowerCase()}` : 'small potential difference: weak galvanic effect'; }
  sa.addEventListener('change', draw); sb.addEventListener('change', draw); ['gv', 'gv_n'].forEach(id => watchSize($(id), draw)); onRedraw(draw); draw(); }
example($('ex2'), { title:'Worked example: how long does a sacrificial zinc anode last?', src:'Faraday\'s law, Section 5.5', q:'A zinc anode bolted to a steel water tank delivers an average protection current of 0.50 A. How much zinc is consumed in one year? If the anode weighs 6 kg and only 85% of it can be used before it falls apart, how long will it last?',
  inputs:[['I', 'Current', 0.5, 'A'], ['m0', 'Anode mass', 6, 'kg'], ['u', 'Utilisation factor', 0.85, '']],
  solve:o => { const t = 365*24*3600, m = o.I*t*65.38/(2*F)/1000; return [['Charge in one year Q = I t', `${fx(o.I*t/1e6, 2)} × 10⁶ C`], ['Moles of Zn = Q/(nF), n = 2', `${fx(o.I*t/(2*F), 0)} mol`], ['Mass of zinc per year = moles × 65.38 g/mol', `${fx(m, 2)} kg`, true], ['Anode life = usable mass / mass per year', `${fx(o.m0*o.u/m, 2)} years`, true]]; } });

/* ---------- 10.5 plating calculator ---------- */
{ const MD = { Zn:{ n:'zinc', M:65.38, z:2, rho:7.14, eff:95, i:3, use:'corrosion protection of bolts, brackets, sheet' }, Ni:{ n:'nickel', M:58.69, z:2, rho:8.90, eff:95, i:4, use:'wear and corrosion resistance, base for chromium' }, Cr:{ n:'hard chromium', M:52.00, z:6, rho:7.19, eff:15, i:40, use:'hydraulic rods, rolls, moulds' }, Cu:{ n:'copper', M:63.55, z:2, rho:8.96, eff:98, i:3, use:'printed circuit boards, undercoat' }, Ag:{ n:'silver', M:107.87, z:1, rho:10.49, eff:99, i:1, use:'electrical contacts and busbars' } };
  const P = {}; let mt = 'Zn';
  const H = controls($('pl_c'), [['i', 'Current density', 0.5, 60, 0.5, 3, 'A/dm²'], ['t', 'Plating time', 1, 240, 1, 30, 'min'], ['eff', 'Current efficiency', 5, 100, 1, 95, '%'], ['A', 'Area being plated', 0.1, 50, 0.1, 2, 'dm²']], P, () => draw());
  function draw(){ const m = MD[mt], rate = P.eff/100*(P.i/100)*m.M/(m.z*F*m.rho)*1e4*60; // μm per minute (i in A/cm²)
    const ts = [], th = []; for (let t = 0; t <= 240; t += 2){ ts.push(t); th.push(rate*t); }
    chart($('pl'), { x:ts, series:[{ y:th, color:C.crank, label:`${m.n} thickness [μm]` }], markers:[{ x:P.t, y:rate*P.t, color:C.ink, label:`${fx(rate*P.t, 1)} μm` }], vlines:[{ v:P.t, color:C.muted }], ylab:'thickness [μm]', xlab:'time [min]' });
    const I = P.i*P.A, mass = P.eff/100*I*P.t*60*m.M/(m.z*F);
    $('pl_st').innerHTML = statsHTML([['Current I = i × A', `${fx(I, 1)} A`], ['Deposition rate', `${fx(rate, 3)} μm/min`], ['Thickness after ' + P.t + ' min', `${fx(rate*P.t, 2)} μm`], ['Metal deposited', `${fx(mass, 2)} g`], ['Charge wasted on hydrogen', `${fx(100 - P.eff, 0)}% of ${fx(I*P.t*60/3600, 2)} A h`]]);
    $('pl_sub').textContent = `${m.n}: typical ${m.i} A/dm² at about ${m.eff}% efficiency; used for ${m.use}`; }
  segGroup($('pl_seg'), v => { mt = v; H.i.set(MD[v].i); H.eff.set(MD[v].eff); draw(); }); watchSize($('pl'), draw); onRedraw(draw); draw(); }

/* ---------- 10.6 lead-acid hydrometer ---------- */
{ const P = {};
  controls($('pb_c'), [['sg', 'Hydrometer reading (specific gravity)', 1.100, 1.300, 0.001, 1.205, ''], ['T', 'Electrolyte temperature', 10, 50, 1, 32, '°C']], P, () => draw());
  function draw(){ const sgc = P.sg + 0.0007*(P.T - 26.7), soc = clamp((sgc - 1.120)/(1.265 - 1.120)*100, 0, 100), ocv = 6*(sgc + 0.84), xs = [], sgv = [], v = [];
    for (let s = 0; s <= 100; s += 1){ xs.push(s); const g = 1.120 + 0.145*s/100; sgv.push(g); v.push(6*(g + 0.84)); }
    chart($('pb'), { x:xs, series:[{ y:sgv, color:C.crank, label:'specific gravity of the acid (at 26.7 °C)' }], markers:[{ x:soc, y:clamp(sgc, 1.12, 1.265), color:C.ink, label:`${fx(soc, 0)}% charged` }], ylab:'specific gravity', xlab:'state of charge [%]', zero:false });
    chart($('pb_f'), { x:xs, series:[{ y:v, color:C.acc, label:'rested open-circuit voltage of a 12 V battery [V]' }], markers:[{ x:soc, y:ocv, color:C.ink, label:`${fx(ocv, 2)} V` }], hlines:[{ v:12.4, color:C.bad, dash:[3, 3], label:'below about 12.4 V: recharge promptly' }], ylab:'V', xlab:'state of charge [%]', zero:false });
    $('pb_st').innerHTML = statsHTML([['Temperature-corrected SG', fx(sgc, 3)], ['State of charge', `${fx(soc, 0)}%`, soc < 75 ? 'bad' : ''], ['Expected open-circuit voltage (6 × (SG + 0.84))', `${fx(ocv, 2)} V`], ['Sulfuric acid in electrolyte (approx.)', `${fx((sgc - 1)*133, 0)}% by mass`], ['Advice', soc < 50 ? 'recharge now: lead sulfate crystals harden (sulfation) if left' : soc < 75 ? 'recharge soon' : 'good charge']]);
    $('pb_sub').textContent = 'discharge turns both plates to PbSO₄ and uses up H₂SO₄, so acid density tracks the charge'; }
  ['pb', 'pb_f'].forEach(id => watchSize($(id), draw)); onRedraw(draw); draw(); }

/* ---------- 10.7 calorific value ---------- */
const FU = { coal:['Bituminous coal', 75, 5, 8, 1.5, 1.5, 9, 8], bagasse:['Bagasse', 47, 6, 44, 0.3, 0.1, 2.6, 50], wood:['Wood', 50, 6, 43, 0.2, 0, 0.8, 15], maize:['Maize cobs', 46.6, 5.9, 45.5, 0.5, 0.1, 1.4, 12], charcoal:['Charcoal', 84, 3, 9, 0.5, 0, 3.5, 5], diesel:['Diesel', 86.5, 13.3, 0.1, 0, 0.05, 0.05, 0] };
const cp = f => 0.3491*f[1] + 1.1783*f[2] + 0.1005*f[5] - 0.1034*f[3] - 0.0151*f[4] - 0.0211*f[6];
const dul = f => (8080*f[1] + 34500*(f[2] - f[3]/8) + 2240*f[5])/100;
{ const P = {}; let fu = 'coal';
  const H = controls($('cv_c'), [['M', 'Moisture as received', 0, 60, 1, 8, '%']], P, () => draw());
  function draw(){ const keys = Object.keys(FU), f = FU[fu], hcp = cp(f), hd = dul(f)*4.1868/1000, lcvD = (dul(f) - 0.09*f[2]*587)*4.1868/1000, m = P.M/100, lar = hcp*(1 - m) - 2.442*(9*f[2]/100*(1 - m) + m);
    const a = axes($('cv'), { xl:0, xr:keys.length, yb:0, yt:50, yticks:[0, 10, 20, 30, 40, 50], ylab:'MJ/kg', xlab:'' }), q = a.ctx;
    keys.forEach((k, i) => { const g = FU[k], v1 = cp(g), v2 = dul(g)*4.1868/1000, bw = a.w/keys.length*0.32, x = a.X(i + 0.5); q.fillStyle = k === fu ? C.crank : alpha(C.crank, 0.35); q.fillRect(x - bw, a.Y(v1), bw, a.Y(0) - a.Y(v1)); q.fillStyle = k === fu ? C.acc : alpha(C.acc, 0.35); q.fillRect(x, a.Y(v2), bw, a.Y(0) - a.Y(v2)); label(q, g[0], x, a.Y(0) + 11, k === fu ? C.ink : C.muted, 'center', 10.5, false); });
    [['Channiwala–Parikh HHV (dry)', C.crank], ['Dulong HCV (dry)', C.acc]].forEach(([t, col], i) => { q.fillStyle = col; q.fillRect(a.pl + 6 + i*210, 6, 12, 10); label(q, t, a.pl + 22 + i*210, 11, C.muted, 'left', 11, false); });
    $('cv_st').innerHTML = statsHTML([['Ultimate analysis (dry): C / H / O / N / S / ash', `${f.slice(1, 7).join(' / ')} %`], ['HHV, Channiwala–Parikh', `${fx(hcp, 2)} MJ/kg = ${fx(hcp/4.1868*1000, 0)} kcal/kg`], ['HCV, Dulong', `${fx(dul(f), 0)} kcal/kg = ${fx(hd, 2)} MJ/kg`], ['LCV, Dulong (notes formula)', `${fx(lcvD, 2)} MJ/kg`], [`Net value as received at ${P.M}% moisture`, `${fx(lar, 2)} MJ/kg`, P.M > 40 ? 'bad' : ''], ['Energy in one tonne as received', `${fx(lar*1000/3600, 1)} MWh (heat)`]]);
    $('cv_sub').textContent = P.M > 40 ? 'wet fuel: much of the heat goes into evaporating water; drying bagasse pays' : `${f[0]}: typical composition from the literature`; }
  segGroup($('cv_seg'), v => { fu = v; H.M.set(FU[v][7]); draw(); }); watchSize($('cv'), draw); onRedraw(draw); draw(); }

/* ---------- 10.7 air for fuel gas ---------- */
{ const P = {};
  controls($('ga_c'), [['CO', 'Carbon monoxide CO', 0, 60, 0.5, 46, '%'], ['H2', 'Hydrogen H₂', 0, 60, 0.5, 40, '%'], ['CH4', 'Methane CH₄', 0, 100, 0.5, 10, '%'], ['C2H2', 'Acetylene C₂H₂', 0, 10, 0.5, 2, '%'], ['O2', 'Oxygen in the fuel gas', 0, 5, 0.1, 0, '%'], ['ea', 'Excess air', 0, 100, 1, 0, '%']], P, () => draw());
  function draw(){ const parts = [['CO', 0.5*P.CO/100, 'CO + ½O₂ ⟶ CO₂'], ['H₂', 0.5*P.H2/100, 'H₂ + ½O₂ ⟶ H₂O'], ['CH₄', 2*P.CH4/100, 'CH₄ + 2O₂ ⟶ CO₂ + 2H₂O'], ['C₂H₂', 2.5*P.C2H2/100, 'C₂H₂ + 2½O₂ ⟶ 2CO₂ + H₂O'], ['O₂ in fuel', -P.O2/100, 'subtract']];
    const o2 = parts.reduce((s, p) => s + p[1], 0), air = o2/0.21, act = air*(1 + P.ea/100), inert = 100 - P.CO - P.H2 - P.CH4 - P.C2H2 - P.O2;
    const a = axes($('ga'), { xl:0, xr:parts.length, yb:Math.min(0, -P.O2/100) - 0.02, yt:Math.max(0.4, ...parts.map(p => p[1])) * 1.15, yticks:[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.8, 1, 1.5, 2].filter(v => v <= Math.max(0.4, ...parts.map(p => p[1]))*1.15), ylab:'m³ O₂ per m³ of fuel gas', xlab:'' }), q = a.ctx;
    parts.forEach(([n, v, eq], i) => { const x0 = a.X(i + 0.2), x1 = a.X(i + 0.8); q.fillStyle = v < 0 ? C.bad : C.crank; q.fillRect(x0, Math.min(a.Y(v), a.Y(0)), x1 - x0, Math.abs(a.Y(0) - a.Y(v))); label(q, n, (x0 + x1)/2, a.Y(0) + 11, C.text, 'center', 11, false); label(q, fx(v, 3), (x0 + x1)/2, a.Y(Math.max(v, 0)) - 9, C.text, 'center', 10.5, false); });
    $('ga_st').innerHTML = statsHTML([['Inert gas (N₂ + CO₂) by difference', `${fx(inert, 1)}%`, inert < 0 ? 'bad' : ''], ['Oxygen needed', `${fx(o2, 3)} m³ per m³ of gas`], ['Theoretical air (÷ 0.21)', `${fx(air, 3)} m³ per m³ of gas`], [`Actual air at ${P.ea}% excess`, `${fx(act, 3)} m³ per m³ of gas`]]);
    $('ga_sub').textContent = inert < 0 ? 'the percentages add up to more than 100: reduce one component' : 'defaults are Example 3 of Chapter 9: answer 3.24 m³ of air per m³'; }
  watchSize($('ga'), draw); onRedraw(draw); draw(); }

/* ---------- 10.7 ethanol blends ---------- */
{ const P = {};
  controls($('eb_c'), [['E', 'Ethanol in the blend', 0, 100, 1, 5, '% by volume'], ['ron', 'Octane number of the base petrol (RON)', 85, 98, 0.5, 91, '']], P, () => draw());
  const blend = (e, ron) => { const ve = e/100, me = ve*0.789, mp = (1 - ve)*0.745, y = me/(me + mp), xe = (me/46.07)/(me/46.07 + mp/100); return { y, afr:y*9.0 + (1 - y)*14.7, lhv:y*26.8 + (1 - y)*43.4, lhvL:me*26.8 + mp*43.4, ox:y*34.7, ron:xe*108.6 + (1 - xe)*ron }; };
  function draw(){ const b0 = blend(0, P.ron), xs = [], s1 = [], s2 = [], s3 = []; for (let e = 0; e <= 100; e++){ const b = blend(e, P.ron); xs.push(e); s1.push(b.afr/b0.afr*100); s2.push(b.lhvL/b0.lhvL*100); s3.push(b.ron/b0.ron*100); }
    const b = blend(P.E, P.ron);
    chart($('eb'), { x:xs, series:[{ y:s1, color:C.crank, label:'stoichiometric air–fuel ratio' }, { y:s2, color:C.acc, label:'energy per litre' }, { y:s3, color:C.vel, label:'octane number' }], vlines:[{ v:P.E, color:C.muted, label:`E${P.E}` }], ylab:'% of pure petrol value', xlab:'ethanol in blend [% by volume]', zero:false });
    $('eb_st').innerHTML = statsHTML([['Ethanol by mass', `${fx(b.y*100, 1)}%`], ['Oxygen in the fuel', `${fx(b.ox, 2)}% by mass`], ['Stoichiometric AFR', `${fx(b.afr, 2)} kg air/kg fuel`], ['Lower heating value', `${fx(b.lhv, 2)} MJ/kg, ${fx(b.lhvL, 2)} MJ/L`], ['Extra fuel volume for the same energy', `${fx((b0.lhvL/b.lhvL - 1)*100, 1)}%`], ['Estimated RON', fx(b.ron, 1)]]);
    $('eb_sub').textContent = 'property estimates: AFR and heating value by mass fraction, octane approximately linear in mole fraction'; }
  watchSize($('eb'), draw); onRedraw(draw); draw(); }

/* ---------- 10.9 seal selector ---------- */
const FLUIDS = ['Mineral oil, hydraulic oil', 'Petrol (up to E10)', 'Ethanol (E85 to E100)', 'Diesel', 'Biodiesel (B100)', 'Water up to 80 °C', 'Steam', 'Brake fluid (glycol)', 'Outdoors (ozone, sunlight)'];
const ELA = [['NBR (nitrile)', -30, 100, [2, 1, 1, 2, 1, 2, 0, 0, 0]], ['HNBR', -30, 150, [2, 1, 1, 2, 1, 2, 1, 0, 1]], ['FKM (Viton type)', -20, 200, [2, 2, 1, 2, 2, 1, 0, 0, 2]], ['EPDM', -45, 150, [0, 0, 2, 0, 0, 2, 2, 2, 2]], ['Silicone (VMQ)', -60, 200, [1, 0, 1, 0, 0, 1, 0, 1, 2]], ['Neoprene (CR)', -40, 100, [1, 0, 1, 1, 0, 1, 0, 0, 2]], ['PTFE (not elastic)', -200, 260, [2, 2, 2, 2, 2, 2, 2, 2, 2]]];
{ const P = {}, sf = $('sl_f'); FLUIDS.forEach((f, i) => sf.add(new Option(f, i)));
  controls($('sl_c'), [['T', 'Operating temperature', -50, 250, 1, 90, '°C']], P, () => draw());
  function draw(){ const fi = +sf.value, a = axes($('sl'), { xl:-80, xr:280, yb:0, yt:ELA.length, xticks:[-50, 0, 50, 100, 150, 200, 250], yticks:[], xlab:'temperature [°C]', ylab:'' }), q = a.ctx, good = [];
    const col = r => r === 2 ? C.ok : r === 1 ? '#d99a00' : C.bad;
    ELA.forEach(([n, lo, hi, r], i) => { const y = a.Y(ELA.length - i - 0.5), c = col(r[fi]); q.fillStyle = alpha(c, 0.55); q.fillRect(a.X(Math.max(lo, -80)), y - 9, a.X(hi) - a.X(Math.max(lo, -80)), 18); label(q, n, a.X(Math.max(lo, -80)) + 4, y, C.ink, 'left', 11, false);
      if (r[fi] === 2 && P.T >= lo && P.T <= hi) good.push(n); });
    q.strokeStyle = C.ink; q.lineWidth = 2; q.setLineDash([5, 4]); q.beginPath(); q.moveTo(a.X(P.T), a.pt); q.lineTo(a.X(P.T), a.pt + a.h); q.stroke(); q.setLineDash([]); label(q, `${P.T} °C`, a.X(P.T) + 4, a.pt + 8, C.ink, 'left', 11);
    [['good', C.ok], ['fair, test first', '#d99a00'], ['poor: swells or degrades', C.bad]].forEach(([t, c], i) => { q.fillStyle = alpha(c, 0.55); q.fillRect(a.pl + 4 + i*150, 4, 12, 10); label(q, t, a.pl + 20 + i*150, 9, C.muted, 'left', 10.5, false); });
    $('sl_st').innerHTML = statsHTML([['Fluid', FLUIDS[fi]], ['Suitable at this temperature', good.length ? good.join(', ') : 'none of these: consult the supplier', good.length ? '' : 'bad']]);
    $('sl_sub').textContent = 'general guidance after common seal compatibility guides; always confirm for the exact compound'; }
  sf.addEventListener('change', draw); watchSize($('sl'), draw); onRedraw(draw); draw(); }

/* ---------- tutorials ---------- */
example($('ex3'), { title:'Tutorial 1 (Chapter 9, Example 1): hydrogen content and GCV of a coal', src:'Dulong\'s formula', q:'A coal contains C = 90%, O = 3%, S = 0.5%, N = 0.5% and ash = 2.5% by mass. Its net calorific value was found to be 8,490.5 kcal/kg. Calculate the percentage of hydrogen and the gross calorific value.',
  inputs:[['C', 'Carbon', 90, '%'], ['O', 'Oxygen', 3, '%'], ['S', 'Sulfur', 0.5, '%'], ['N', 'Net calorific value', 8490.5, 'kcal/kg']],
  solve:o => { const k = (8080*o.C - 34500*o.O/8 + 2240*o.S)/100, H = (o.N - k)/(345 - 0.09*587), G = k + 345*H;
    return [['Dulong: GCV = (1/100)[8080C + 34500(H − O/8) + 2240S] = constant + 345H', `constant = ${fx(k, 1)} kcal/kg`], ['NCV = GCV − 0.09 × H × 587 = constant + (345 − 52.83)H', `${fx(k, 1)} + 292.17 H`], ['Solve for H', `H = ${fx(H, 2)}%`, true], ['GCV = constant + 345H', `${fx(G, 1)} kcal/kg = ${fx(G*4.1868/1000, 2)} MJ/kg`, true], ['Check: C + H + O + S + N + ash', `${fx(o.C + H + o.O + o.S + 0.5 + 2.5, 1)}% (the question's data do not quite close to 100%)`]]; } });
example($('ex4'), { title:'Tutorial 2: how long to nickel-plate a part?', src:'Faraday\'s law, Section 5.5', q:'A steel part with a surface area of 2 dm² needs a 25 μm nickel coating. The bath runs at 4 A/dm² with 95% current efficiency. Nickel: M = 58.69 g/mol, n = 2, ρ = 8.90 g/cm³. How long must it be plated, and how much nickel is used?',
  inputs:[['d', 'Thickness', 25, 'μm'], ['A', 'Area', 2, 'dm²'], ['i', 'Current density', 4, 'A/dm²'], ['e', 'Efficiency', 95, '%']],
  solve:o => { const m = o.d*1e-4*o.A*100*8.90, I = o.i*o.A, t = m*2*F/(o.e/100*I*58.69); return [['Mass of nickel m = δ A ρ (δ in cm, A in cm²)', `${fx(m, 3)} g`], ['Current I = i A', `${fx(I, 1)} A`], ['Time t = m n F / (ε I M)', `${fx(t, 0)} s`], ['Plating time', `${fx(t/60, 1)} min`, true]]; } });
example($('ex5'), { title:'Tutorial 3: is this cooling water scale-forming?', src:'Langelier (1936)', q:'Cooling tower water has pH 7.8 at 35 °C, total dissolved solids 500 mg/L, calcium hardness 200 mg/L and alkalinity 150 mg/L (both as CaCO₃). Calculate the Langelier saturation index and say whether the water will scale.',
  inputs:[['pH', 'pH', 7.8, ''], ['T', 'Temperature', 35, '°C'], ['TDS', 'TDS', 500, 'mg/L'], ['Ca', 'Ca hardness', 200, 'mg/L'], ['Alk', 'Alkalinity', 150, 'mg/L']],
  solve:o => { const A = (Math.log10(o.TDS) - 1)/10, B = -13.12*Math.log10(o.T + 273) + 34.55, Cc = Math.log10(o.Ca) - 0.4, D = Math.log10(o.Alk), pHs = 9.3 + A + B - Cc - D, L = o.pH - pHs;
    return [['A = (log TDS − 1)/10', fx(A, 3)], ['B = −13.12 log(T + 273) + 34.55', fx(B, 3)], ['C = log(Ca) − 0.4; D = log(alkalinity)', `${fx(Cc, 3)}; ${fx(D, 3)}`], ['pH_s = (9.3 + A + B) − (C + D)', fx(pHs, 2)], ['LSI = pH − pH_s', `${L >= 0 ? '+' : ''}${fx(L, 2)}`, true], ['Conclusion', L > 0 ? 'positive: the water is supersaturated with CaCO₃ and will deposit scale; dose an inhibitor or lower pH or alkalinity' : 'negative: the water will not scale but tends to be corrosive', true]]; } });

[
  { q:'Why can a steel shaft be bent but a ceramic seal ring shatters?', o:['Steel is denser', 'Metallic bonding lets atoms slide without breaking bonds; ionic/covalent bonds are directional and break', 'Ceramics are always porous', 'Steel contains carbon'], a:1, why:'Delocalised electrons in metals allow slip; fixed bonds in ceramics do not.' },
  { q:'Why does calcium carbonate scale form fastest on the hottest surfaces?', o:['Heat drives off CO₂ and CaCO₃ is less soluble when hot, so equilibrium shifts to the solid', 'Hot water contains more calcium', 'Steel catalyses it', 'It does not depend on temperature'], a:0, why:'Le Chatelier and the inverse solubility of CaCO₃ (Chapter 4).' },
  { q:'A brass valve is fitted directly to a galvanised (zinc-coated) steel pipe in a water line. What happens?', o:['The brass corrodes', 'The zinc coating near the joint corrodes faster', 'Nothing', 'The water becomes acidic'], a:1, why:'Zinc (−0.76 V) is anodic to copper alloys; use a dielectric union.' },
  { q:'Why is hard chromium plating slow?', o:['chromium is heavy', 'its current efficiency is only about 10 to 25% and n = 6', 'it needs alternating current', 'the bath is cold'], a:1, why:'Most of the current makes hydrogen, and six electrons are needed per atom.' },
  { q:'A lead–acid battery reads SG 1.150. What is its state of charge?', o:['fully charged', '20 to 25% charged and should be recharged at once', '75% charged', 'overcharged'], a:1, why:'SG falls from about 1.265 (full) to 1.120 (flat) as acid is consumed.' },
  { q:'Why does Dulong\'s formula under-predict the heating value of wood?', o:['Wood has no carbon', 'It assumes all oxygen is already bound to hydrogen, which overstates the loss for oxygen-rich fuels', 'Wood contains sulfur', 'It ignores ash'], a:1, why:'Biomass is about 40 to 45% oxygen.' },
  { q:'What does adding 10% ethanol to petrol do?', o:['raises octane and lowers the stoichiometric air–fuel ratio', 'lowers octane', 'raises the heating value', 'has no chemical effect'], a:0, why:'Ethanol has RON about 108 and needs 9 kg of air per kg against 14.7 for petrol.' },
  { q:'Which seal suits a steam valve?', o:['NBR', 'EPDM', 'Silicone', 'Neoprene'], a:1, why:'EPDM resists water and steam but must never see mineral oil.' } ].forEach((q, i) => quiz($('qz' + (i + 1)), [q]));
})();
