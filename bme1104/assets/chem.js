/* BME 1104 interactive notes: chemistry helpers shared by all chapters.
   Element data, electron configurations, chemical formula typesetting, a small SMILES reader with a
   3D embedder for molecules, VSEPR shapes, crystal unit cells, orbital surfaces and a nicer 3D look. */
'use strict';
if (typeof THREE !== 'undefined' && THREE.ColorManagement) THREE.ColorManagement.legacyMode = false;

/* ---------- typesetting ---------- */
const CE = {};
function ce(s, disp){ const k = s + (disp ? '|d' : ''); if (CE[k]) return CE[k];
  try { return (CE[k] = katex.renderToString('\\ce{' + s + '}', { displayMode:!!disp, throwOnError:false, output:'html' })); } catch (e) { return s; } }
function tx(s, disp){ try { return katex.renderToString(s, { displayMode:!!disp, throwOnError:false, output:'html', strict:'ignore' }); } catch (e) { return s; } }
/* replace {ce:...} and {m:...} inside a string of HTML */
function chemHTML(h){ return String(h).replace(/\{ce:((?:[^{}]|\{[^{}]*\})*)\}/g, (_, s) => ce(s)).replace(/\{m:((?:[^{}]|\{[^{}]*\})*)\}/g, (_, s) => tx(s)); }
const sci = (v, d = 2) => { if (!isFinite(v)) return 'n/a'; if (v === 0) return '0'; const e = Math.floor(Math.log10(Math.abs(v))); if (e >= -2 && e < 4) return fmt(v, Math.max(0, d - Math.max(0, e))); let m = v/Math.pow(10, e); if (Math.abs(+m.toFixed(d)) >= 10){ m /= 10; return `${m.toFixed(d)} × 10<sup>${e + 1}</sup>`; } return `${m.toFixed(d)} × 10<sup>${e}</sup>`; };
const sciTex = (v, d = 2) => { if (!isFinite(v)) return '\\text{n/a}'; if (v === 0) return '0'; const e = Math.floor(Math.log10(Math.abs(v))); if (e >= -2 && e < 4) return String(+v.toPrecision(d + 1)); let m = v/Math.pow(10, e); if (Math.abs(+m.toFixed(d)) >= 10){ m /= 10; return `${m.toFixed(d)}\\times10^{${e + 1}}`; } return `${m.toFixed(d)}\\times10^{${e}}`; };
const N_A = 6.022e23, F_C = 96485, R_G = 8.314, K_C = 8.988e9, Q_E = 1.602e-19, H_P = 6.626e-34;

/* ---------- elements ---------- */
const EL_SYM = 'H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og'.split(' ');
const EL_NAME = 'Hydrogen Helium Lithium Beryllium Boron Carbon Nitrogen Oxygen Fluorine Neon Sodium Magnesium Aluminium Silicon Phosphorus Sulfur Chlorine Argon Potassium Calcium Scandium Titanium Vanadium Chromium Manganese Iron Cobalt Nickel Copper Zinc Gallium Germanium Arsenic Selenium Bromine Krypton Rubidium Strontium Yttrium Zirconium Niobium Molybdenum Technetium Ruthenium Rhodium Palladium Silver Cadmium Indium Tin Antimony Tellurium Iodine Xenon Caesium Barium Lanthanum Cerium Praseodymium Neodymium Promethium Samarium Europium Gadolinium Terbium Dysprosium Holmium Erbium Thulium Ytterbium Lutetium Hafnium Tantalum Tungsten Rhenium Osmium Iridium Platinum Gold Mercury Thallium Lead Bismuth Polonium Astatine Radon Francium Radium Actinium Thorium Protactinium Uranium Neptunium Plutonium Americium Curium Berkelium Californium Einsteinium Fermium Mendelevium Nobelium Lawrencium Rutherfordium Dubnium Seaborgium Bohrium Hassium Meitnerium Darmstadtium Roentgenium Copernicium Nihonium Flerovium Moscovium Livermorium Tennessine Oganesson'.split(' ');
const EL_MASS = [1.008,4.003,6.94,9.012,10.81,12.011,14.007,15.999,18.998,20.180,22.990,24.305,26.982,28.085,30.974,32.06,35.45,39.95,39.098,40.078,44.956,47.867,50.942,51.996,54.938,55.845,58.933,58.693,63.546,65.38,69.723,72.630,74.922,78.971,79.904,83.798,85.468,87.62,88.906,91.224,92.906,95.95,98,101.07,102.91,106.42,107.87,112.41,114.82,118.71,121.76,127.60,126.90,131.29,132.91,137.33,138.91,140.12,140.91,144.24,145,150.36,151.96,157.25,158.93,162.50,164.93,167.26,168.93,173.05,174.97,178.49,180.95,183.84,186.21,190.23,192.22,195.08,196.97,200.59,204.38,207.2,208.98,209,210,222,223,226,227,232.04,231.04,238.03,237,244,243,247,247,251,252,257,258,259,266,267,268,269,270,277,278,281,282,285,286,289,290,293,294,294];
/* Pauling electronegativity, first ionisation energy (kJ/mol) and covalent radius (pm, Cordero et al., 2008) for Z = 1 to 86 (0 = not defined) */
const EL_EN = [2.20,0,0.98,1.57,2.04,2.55,3.04,3.44,3.98,0,0.93,1.31,1.61,1.90,2.19,2.58,3.16,0,0.82,1.00,1.36,1.54,1.63,1.66,1.55,1.83,1.88,1.91,1.90,1.65,1.81,2.01,2.18,2.55,2.96,3.00,0.82,0.95,1.22,1.33,1.6,2.16,1.9,2.2,2.28,2.20,1.93,1.69,1.78,1.96,2.05,2.1,2.66,2.6,0.79,0.89,1.10,1.12,1.13,1.14,0,1.17,0,1.20,0,1.22,1.23,1.24,1.25,0,1.27,1.3,1.5,2.36,1.9,2.2,2.20,2.28,2.54,2.00,1.62,2.33,2.02,2.0,2.2,0];
const EL_IE = [1312,2372,520,900,801,1086,1402,1314,1681,2081,496,738,578,787,1012,1000,1251,1521,419,590,633,659,651,653,717,763,760,737,746,906,579,762,947,941,1140,1351,403,550,600,640,652,684,702,710,720,804,731,868,558,709,834,869,1008,1170,376,503,538,534,527,533,540,545,547,593,566,573,581,589,597,603,524,659,761,770,760,840,880,870,890,1007,589,716,703,812,899,1037];
const EL_RAD = [31,28,128,96,84,76,71,66,57,58,166,141,121,111,107,105,102,106,203,176,170,160,153,139,139,132,126,124,132,122,122,120,119,120,120,116,220,195,190,175,164,154,147,146,142,139,145,144,142,139,139,138,139,140,244,215,207,204,203,201,199,198,198,196,194,192,192,189,190,187,187,175,170,162,151,144,141,136,136,132,145,146,148,140,150,150];
function elCategory(z){
  if ([3,11,19,37,55,87].includes(z)) return 'alkali'; if ([4,12,20,38,56,88].includes(z)) return 'alkaline';
  if ([2,10,18,36,54,86,118].includes(z)) return 'noble'; if ([9,17,35,53,85,117].includes(z)) return 'halogen';
  if (z >= 57 && z <= 71) return 'lanthanide'; if (z >= 89 && z <= 103) return 'actinide';
  if ([5,14,32,33,51,52].includes(z)) return 'metalloid'; if ([1,6,7,8,15,16,34].includes(z)) return 'nonmetal';
  if ([13,31,49,50,81,82,83,84,113,114,115,116].includes(z)) return 'post'; return 'transition'; }
const CAT_NAME = { alkali:'Alkali metal', alkaline:'Alkaline earth metal', transition:'Transition metal', post:'Post-transition metal', metalloid:'Metalloid', nonmetal:'Other nonmetal', halogen:'Halogen', noble:'Noble gas', lanthanide:'Lanthanide', actinide:'Actinide' };
/* place in the 18-column table: [row, col]; rows 9 and 10 hold the f-block */
function elPos(z){
  const P = [[1,1],[1,18]]; if (z <= 2) return P[z - 1];
  const starts = [[3,2],[11,3],[19,4],[37,5],[55,6],[87,7]];
  let per = 2; for (const [s, p] of starts) if (z >= s) per = p;
  const s0 = starts.find(x => x[1] === per)[0], k = z - s0;
  if (per <= 3){ return [per, k < 2 ? k + 1 : k + 11]; }
  if (per <= 5) return [per, k + 1];
  if (k < 2) return [per, k + 1];
  if (k >= 2 && k <= 16) return [per + 3, k + 2];          // La..Lu / Ac..Lr in the f rows (cols 3 to 17)
  return [per, k - 13]; }
function elGroup(z){ const [r, c] = elPos(z); return r >= 9 ? null : c; }
function elPeriod(z){ const [r] = elPos(z); return r >= 9 ? r - 3 : r; }
function elBlock(z){ const c = elPos(z); if (c[0] >= 9) return 'f'; if (z === 2) return 's'; if (c[1] <= 2) return 's'; if (c[1] >= 13) return 'p'; return 'd'; }

/* electron configuration by the n + l rule, with the common exceptions */
const SUB_ORDER = (() => { const L = []; for (let n = 1; n <= 8; n++) for (let l = 0; l < n && l <= 3; l++) L.push([n, l]); return L.sort((a, b) => (a[0] + a[1]) - (b[0] + b[1]) || a[0] - b[0]); })();
const LL = 'spdf';
const EXC = { 24:{ '4s':1, '3d':5 }, 29:{ '4s':1, '3d':10 }, 41:{ '5s':1, '4d':4 }, 42:{ '5s':1, '4d':5 }, 44:{ '5s':1, '4d':7 }, 45:{ '5s':1, '4d':8 }, 46:{ '5s':0, '4d':10 }, 47:{ '5s':1, '4d':10 },
  57:{ '4f':0, '5d':1 }, 58:{ '4f':1, '5d':1 }, 64:{ '4f':7, '5d':1 }, 78:{ '6s':1, '5d':9 }, 79:{ '6s':1, '5d':10 }, 89:{ '5f':0, '6d':1 }, 90:{ '5f':0, '6d':2 }, 91:{ '5f':2, '6d':1 }, 92:{ '5f':3, '6d':1 }, 93:{ '5f':4, '6d':1 }, 96:{ '5f':7, '6d':1 } };
function econfig(z){ let left = z; const out = [];
  for (const [n, l] of SUB_ORDER){ if (left <= 0) break; const cap = 2*(2*l + 1), k = Math.min(cap, left); out.push({ n, l, e:k, key:n + LL[l] }); left -= k; }
  const ex = EXC[z]; if (ex) for (const [key, e] of Object.entries(ex)){ let s = out.find(o => o.key === key); if (!s){ s = { n:+key[0], l:LL.indexOf(key[1]), e:0, key }; out.push(s); } s.e = e; }
  const tot = out.reduce((a, o) => a + o.e, 0); if (ex && tot !== z){ const last = out.filter(o => !(o.key in ex)).pop(); if (last) last.e += z - tot; }
  return out.filter(o => o.e > 0); }
function econfigTex(z, short){ let cfg = econfig(z), pre = '';
  if (short){ const ng = [2,10,18,36,54,86].filter(g => g < z).pop(); if (ng){ const core = econfig(ng).map(o => o.key); cfg = cfg.filter(o => !core.includes(o.key) || econfig(ng).find(c => c.key === o.key).e !== o.e); pre = `[\\mathrm{${EL_SYM[ng - 1]}}]\\,`; } }
  cfg = cfg.slice().sort((a, b) => a.n - b.n || a.l - b.l);
  return pre + cfg.map(o => `${o.n}\\mathrm{${LL[o.l]}}^{${o.e}}`).join('\\,'); }
function valence(z){ const c = econfig(z), nmax = Math.max(...c.map(o => o.n)); return c.filter(o => o.n === nmax).reduce((a, o) => a + o.e, 0); }

/* ---------- 3D look: soft sky reflections, filmic tone, glossy model-kit materials ---------- */
function niceGL(v, o = {}){ if (!v) return v; const R = v.R; R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = o.exposure || 0.8;
  if (!R.__env){ const c = document.createElement('canvas'); c.width = 512; c.height = 256; const g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, 256);
    [[0, '#7fa3d6'], [0.42, '#e6eef6'], [0.5, '#ffffff'], [0.56, '#b9b4ab'], [1, '#5d5a54']].forEach(([p, col]) => gr.addColorStop(p, col)); g.fillStyle = gr; g.fillRect(0, 0, 512, 256);
    g.filter = 'blur(6px)'; g.fillStyle = 'rgba(255,255,255,.95)'; [[60, 60, 90, 34], [300, 50, 120, 40], [430, 90, 60, 26]].forEach(([x, y, w, h]) => g.fillRect(x, y, w, h)); g.filter = 'none';
    const t = new THREE.CanvasTexture(c); t.mapping = THREE.EquirectangularReflectionMapping; t.encoding = THREE.sRGBEncoding;
    const pm = new THREE.PMREMGenerator(R); R.__env = pm.fromEquirectangular(t).texture; pm.dispose(); }
  v.scene.environment = R.__env; if (!v.__lit){ v.__lit = true; v.scene.children.forEach(o => { if (o.isLight) o.intensity *= 0.55; }); } return v; }
function gloss(color, o = {}){ return new THREE.MeshPhysicalMaterial(Object.assign({ color, roughness:0.32, metalness:0.0, clearcoat:0.6, clearcoatRoughness:0.25 }, o)); }
function metal(color, o = {}){ return new THREE.MeshStandardMaterial(Object.assign({ color, roughness:0.35, metalness:1 }, o)); }
function clearMesh(group){ while (group.children.length){ const c = group.children.pop(); c.traverse && c.traverse(o => { if (o.geometry) o.geometry.dispose(); }); } }
function textSprite(txt, o = {}){ const s = o.size || 64, c = document.createElement('canvas'); const g = c.getContext('2d'); g.font = `${o.weight || 600} ${s}px Roboto, Arial, sans-serif`;
  const w = Math.ceil(g.measureText(txt).width) + s*0.5; c.width = w; c.height = s*1.35; g.font = `${o.weight || 600} ${s}px Roboto, Arial, sans-serif`;
  if (o.bg){ g.fillStyle = o.bg; g.beginPath(); g.roundRect ? g.roundRect(0, 0, w, c.height, s*0.3) : g.rect(0, 0, w, c.height); g.fill(); }
  g.fillStyle = o.color || '#15212c'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, w/2, c.height*0.53);
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; const m = new THREE.SpriteMaterial({ map:t, depthTest:o.depth !== false, transparent:true });
  const sp = new THREE.Sprite(m); const h = o.h || 0.35; sp.scale.set(h*w/c.height, h, 1); return sp; }
function arrow3(from, to, color, r = 0.04){ const g = new THREE.Group(), d = new THREE.Vector3().subVectors(to, from), L = d.length(); if (L < 1e-6) return g;
  const m = gloss(color), hl = Math.min(L*0.35, r*7), sh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, L - hl, 16), m), hd = new THREE.Mesh(new THREE.ConeGeometry(r*2.6, hl, 20), m);
  sh.position.y = (L - hl)/2; hd.position.y = L - hl/2; g.add(sh, hd); g.position.copy(from); g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize()); return g; }
function cylBetween(a, b, r, mat, seg = 18){ const d = new THREE.Vector3().subVectors(b, a), L = d.length(), m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, L, seg), mat);
  m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return m; }

/* ---------- atoms: CPK colours and sizes ---------- */
const CPK = { H:0xf4f4f4, C:0x3b3f45, N:0x2f5fd0, O:0xd8302c, F:0x8fd14f, Cl:0x2fa84a, Br:0x8a2a1f, I:0x6a2c91, S:0xe6c22a, P:0xf08a1c, B:0xf2a58c, Si:0xc9b28a,
  Na:0x8b5bd6, K:0x7a46c8, Mg:0x2e9e57, Ca:0x3d9a6a, Al:0xb8bcc4, Fe:0xc0612b, Cu:0xc87533, Zn:0x8a8fb5, Li:0xc27be0, Cs:0x5a2a91, Be:0x9fd16b, Xe:0x429eb0, Pb:0x575961, Ti:0xbfc2c7, Cr:0x8a99c7, Ni:0x50d050, Ag:0xc0c0c0, Au:0xd4af37, Ne:0x9be0f0, Ar:0x80d1e3, He:0xd9ffff };
const VDW = { H:1.10, C:1.70, N:1.55, O:1.52, F:1.47, Cl:1.75, Br:1.85, I:1.98, S:1.80, P:1.80, B:1.92, Si:2.10, Xe:2.16, Na:2.27, K:2.75, Mg:1.73, Ca:2.31, Be:1.53 };
const COV = sym => { const z = EL_SYM.indexOf(sym) + 1; return z ? EL_RAD[z - 1]/100 : 0.8; };
const atomColor = s => CPK[s] != null ? CPK[s] : 0xb06aa8;

/* ---------- a small SMILES reader (organic subset, Kekulé rings, bracket atoms with H and charge) ---------- */
const VAL = { C:4, N:3, O:2, S:2, P:3, B:3, F:1, Cl:1, Br:1, I:1, Si:4, H:1 };
const VE = { H:1, B:3, C:4, N:5, O:6, F:7, Si:4, P:5, S:6, Cl:7, Br:7, I:7, Be:2, Xe:8, Na:1, K:1, Mg:2, Ca:2, Al:3 };
function parseSMILES(sm){
  const atoms = [], bonds = [], stack = [], ring = {}; let prev = -1, order = 1, i = 0;
  const addAtom = (el, h, ch, explicitH) => { atoms.push({ el, h:h, ch:ch || 0, explicitH:!!explicitH }); const k = atoms.length - 1; if (prev >= 0) bonds.push([prev, k, order]); order = 1; prev = k; return k; };
  while (i < sm.length){ const c = sm[i];
    if (c === '('){ stack.push(prev); i++; continue; } if (c === ')'){ prev = stack.pop(); i++; continue; }
    if (c === '/' || c === '\\'){ i++; continue; }
    if (c === '-'){ order = 1; i++; continue; } if (c === '='){ order = 2; i++; continue; } if (c === '#'){ order = 3; i++; continue; }
    if (/[0-9]/.test(c)){ const d = c; if (ring[d] != null){ bonds.push([ring[d][0], prev, order !== 1 ? order : ring[d][1]]); delete ring[d]; } else ring[d] = [prev, order]; order = 1; i++; continue; }
    if (c === '['){ const j = sm.indexOf(']', i), t = sm.slice(i + 1, j), m = t.match(/^([A-Z][a-z]?)(H(\d*))?([+-]+\d*)?$/); if (!m) throw new Error('bad atom ' + t);
      let ch = 0; if (m[4]){ const sg = m[4][0] === '+' ? 1 : -1, n = m[4].slice(1); ch = sg*(n && /\d/.test(n) ? +n.replace(/[+-]/g, '') : m[4].length); }
      addAtom(m[1], m[2] ? (m[3] ? +m[3] : 1) : 0, ch, true); i = j + 1; continue; }
    const two = sm.slice(i, i + 2); if (two === 'Cl' || two === 'Br' || two === 'Si'){ addAtom(two, null, 0); i += 2; continue; }
    if (/[BCNOPSFIH]/.test(c)){ addAtom(c, null, 0); i++; continue; }
    if (/[cno]/.test(c)){ const k = addAtom(c.toUpperCase(), null, 0); atoms[k].ar = true; i++; continue; }
    if (c === '.'){ prev = -1; i++; continue; }
    throw new Error('cannot read ' + c); }
  bonds.forEach(b => { if (atoms[b[0]].ar && atoms[b[1]].ar && b[2] === 1) b[2] = 1.5; });
  // implicit hydrogens
  const n0 = atoms.length;
  for (let k = 0; k < n0; k++){ const a = atoms[k]; const used = bonds.filter(b => b[0] === k || b[1] === k).reduce((s, b) => s + b[2], 0);
    const nh = a.explicitH ? a.h : Math.max(0, Math.round((VAL[a.el] || 0) - used));
    for (let j = 0; j < nh; j++){ atoms.push({ el:'H', ch:0 }); bonds.push([k, atoms.length - 1, 1]); } }
  return { atoms, bonds }; }

/* ---------- embed a molecule in 3D by relaxing ideal bond lengths, angles, planarity and anti chains ---------- */
function embed(mol, seed = 1){
  const { atoms, bonds } = mol, n = atoms.length; let s = seed*9301 + 49297; const rnd = () => (s = (s*9301 + 49297) % 233280)/233280;
  const nb = Array.from({ length:n }, () => []); bonds.forEach(([a, b, o]) => { nb[a].push([b, o]); nb[b].push([a, o]); });
  const BL = (a, b, o) => { const r = COV(atoms[a].el) + COV(atoms[b].el); return r*(o === 2 ? 0.87 : o === 3 ? 0.78 : o === 1.5 ? 0.92 : 1) + (atoms[a].el === 'H' || atoms[b].el === 'H' ? 0.02 : 0); };
  const lp = k => { const a = atoms[k]; const used = Math.round(nb[k].reduce((t, x) => t + x[1], 0)); const v = VE[a.el]; if (v == null || a.el === 'H') return 0; return Math.max(0, Math.round((v - used - a.ch)/2)); };
  const sigma = k => nb[k].length, pis = k => nb[k].reduce((t, x) => t + x[1] - 1, 0);
  const angle = k => { const sn = sigma(k) + lp(k), L = lp(k); if (sn <= 2) return 180; if (sn === 3) return L ? 117 : 120; if (sn === 4) return L === 0 ? 109.47 : L === 1 ? 107 : 104.5; return 109.47; };
  const D = []; // [i, j, d, w]
  bonds.forEach(([a, b, o]) => D.push([a, b, BL(a, b, o), 1]));
  const near = new Set(); bonds.forEach(([a, b]) => { near.add(a*n + b); near.add(b*n + a); });
  for (let k = 0; k < n; k++){ const L = nb[k]; const th = angle(k)*Math.PI/180;
    for (let p = 0; p < L.length; p++) for (let q = p + 1; q < L.length; q++){ const i = L[p][0], j = L[q][0];
      const a = BL(k, i, L[p][1]), b = BL(k, j, L[q][1]); D.push([i, j, Math.sqrt(a*a + b*b - 2*a*b*Math.cos(th)), 0.6]); near.add(i*n + j); near.add(j*n + i); } }
  // anti preference along sp3 heavy chains, and planarity across double bonds
  const PL = [];
  bonds.forEach(([a, b, o]) => { if (atoms[a].el === 'H' || atoms[b].el === 'H') return;
    const sa = nb[a].filter(x => x[0] !== b), sb = nb[b].filter(x => x[0] !== a);
    if (o === 2){ sa.forEach(x => sb.forEach(y => PL.push([x[0], a, b, y[0]]))); }
    if (o === 1 && sigma(a) + lp(a) === 4 && sigma(b) + lp(b) === 4){ const ha = sa.filter(x => atoms[x[0]].el !== 'H'), hb = sb.filter(x => atoms[x[0]].el !== 'H');
      if (ha.length === 1 && hb.length === 1) D.push([ha[0][0], hb[0][0], 3.85*(COV(atoms[a].el) + COV(atoms[b].el))/1.52, 0.08]); } });
  // ring planarity for rings with double bonds (benzene)
  const P = []; let hk = 0; atoms.forEach((a, k) => { if (a.el !== 'H'){ P[k] = [hk*1.27 + (rnd() - 0.5)*0.4, (hk % 2)*0.85 + (rnd() - 0.5)*0.4, (rnd() - 0.5)*0.6]; hk++; } });
  atoms.forEach((a, k) => { if (a.el === 'H'){ const par = nb[k][0] ? nb[k][0][0] : null, b = par != null && P[par] ? P[par] : [0, 0, 0]; P[k] = [b[0] + (rnd() - 0.5)*1.6, b[1] + (rnd() - 0.5)*1.6, b[2] + (rnd() - 0.5)*1.6]; } });
  const G = Array.from({ length:n }, () => [0, 0, 0]);
  const vol = (p, a, b, q) => { const u = [P[a][0] - P[p][0], P[a][1] - P[p][1], P[a][2] - P[p][2]], v = [P[b][0] - P[a][0], P[b][1] - P[a][1], P[b][2] - P[a][2]], w = [P[q][0] - P[b][0], P[q][1] - P[b][1], P[q][2] - P[b][2]];
    return (u[1]*v[2] - u[2]*v[1])*w[0] + (u[2]*v[0] - u[0]*v[2])*w[1] + (u[0]*v[1] - u[1]*v[0])*w[2]; };
  for (let it = 0; it < 2600; it++){ const step = it < 400 ? 0.12 : it < 1600 ? 0.06 : 0.02; for (const g of G) g[0] = g[1] = g[2] = 0;
    for (const [i, j, d0, w] of D){ const dx = P[i][0] - P[j][0], dy = P[i][1] - P[j][1], dz = P[i][2] - P[j][2], d = Math.hypot(dx, dy, dz) || 1e-6, f = w*(d - d0)/d;
      G[i][0] += f*dx; G[i][1] += f*dy; G[i][2] += f*dz; G[j][0] -= f*dx; G[j][1] -= f*dy; G[j][2] -= f*dz; }
    if (it > 60) for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++){ if (near.has(i*n + j)) continue; const dx = P[i][0] - P[j][0], dy = P[i][1] - P[j][1], dz = P[i][2] - P[j][2], d = Math.hypot(dx, dy, dz) || 1e-6;
      const lim = atoms[i].el === 'H' || atoms[j].el === 'H' ? 2.3 : 2.9; if (d < lim){ const f = 0.25*(d - lim)/d; G[i][0] += f*dx; G[i][1] += f*dy; G[i][2] += f*dz; G[j][0] -= f*dx; G[j][1] -= f*dy; G[j][2] -= f*dz; } }
    if (it > 300) for (const t of PL){ const v0 = vol(...t); if (Math.abs(v0) < 1e-4) continue; for (const k of t) for (let c = 0; c < 3; c++){ const h = 1e-4; P[k][c] += h; const v1 = vol(...t); P[k][c] -= h; G[k][c] += 0.5*v0*(v1 - v0)/h; } }
    for (let i = 0; i < n; i++) for (let c = 0; c < 3; c++){ const g = Math.max(-0.5, Math.min(0.5, G[i][c])); P[i][c] -= step*g*2; } }
  // centre and orient along the principal axis (longest dimension along x)
  const cen = [0, 0, 0]; P.forEach(p => { cen[0] += p[0]/n; cen[1] += p[1]/n; cen[2] += p[2]/n; }); P.forEach(p => { p[0] -= cen[0]; p[1] -= cen[1]; p[2] -= cen[2]; });
  let best = [1, 0, 0], bl = -1; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++){ const d = Math.hypot(P[i][0] - P[j][0], P[i][1] - P[j][1], P[i][2] - P[j][2]); if (d > bl){ bl = d; best = [P[i][0] - P[j][0], P[i][1] - P[j][1], P[i][2] - P[j][2]]; } }
  if (typeof THREE !== 'undefined'){ const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(...best).normalize(), new THREE.Vector3(1, 0, 0)); P.forEach(p => { const v = new THREE.Vector3(...p).applyQuaternion(q); p[0] = v.x; p[1] = v.y; p[2] = v.z; }); }
  mol.pos = P; return mol; }
const MOLCACHE = {};
function molecule(smiles){ if (MOLCACHE[smiles]) return MOLCACHE[smiles]; const m = embed(parseSMILES(smiles)); MOLCACHE[smiles] = m; return m; }

/* draw a molecule: style 'ball' (ball and stick), 'space' (space filling) or 'stick' */
function drawMolecule(group, mol, o = {}){ const style = o.style || 'ball', P = mol.pos, M = {};
  const mat = el => M[el] || (M[el] = gloss(atomColor(el), el === 'C' ? { roughness:0.4 } : {}));
  const sc = o.scale || 1;
  mol.atoms.forEach((a, i) => { const r = style === 'space' ? (VDW[a.el] || 1.6)*0.95 : style === 'stick' ? 0.12 : (a.el === 'H' ? 0.24 : Math.max(0.3, COV(a.el)*0.5));
    const m = new THREE.Mesh(new THREE.SphereGeometry(r*sc, 36, 24), mat(a.el)); m.position.set(P[i][0]*sc, P[i][1]*sc, P[i][2]*sc); m.userData.atom = i; group.add(m);
    if (o.labels && a.el !== 'H'){ const t = textSprite(a.el + (a.ch ? (Math.abs(a.ch) > 1 ? Math.abs(a.ch) : '') + (a.ch > 0 ? '+' : '−') : ''), { color:'#fff', h:0.32*sc, depth:false }); t.position.copy(m.position); group.add(t); } });
  if (style !== 'space'){ const bm = gloss(0xd7dbe0, { roughness:0.45 }), rr = (style === 'stick' ? 0.12 : 0.085)*sc;
    mol.bonds.forEach(([i, j, ord]) => { const a = new THREE.Vector3(...P[i]).multiplyScalar(sc), b = new THREE.Vector3(...P[j]).multiplyScalar(sc);
      if (ord === 1.5){ group.add(cylBetween(a, b, rr, bm)); if (style === 'stick') return; const ctr = new THREE.Vector3(); let cnt = 0;
        mol.bonds.forEach(([x, y, oo]) => { if (oo !== 1.5) return; [x, y].forEach(k => { ctr.add(new THREE.Vector3(...P[k]).multiplyScalar(sc)); cnt++; }); });
        ctr.multiplyScalar(1/cnt); const mid = a.clone().lerp(b, 0.5), toC = ctr.clone().sub(mid).normalize().multiplyScalar(rr*3.2);
        group.add(cylBetween(a.clone().lerp(b, 0.2).add(toC), a.clone().lerp(b, 0.8).add(toC), rr*0.55, bm)); return; }
      if (ord === 1 || style === 'stick' && ord === 1){ if (style === 'stick'){ const mid = a.clone().lerp(b, 0.5); group.add(cylBetween(a, mid, rr, mat(mol.atoms[i].el)), cylBetween(mid, b, rr, mat(mol.atoms[j].el))); } else group.add(cylBetween(a, b, rr, bm)); return; }
      // multiple bonds: offset perpendicular to the bond, in the plane of a neighbour where possible
      const d = new THREE.Vector3().subVectors(b, a).normalize(); let ref = null;
      for (const [x, y] of mol.bonds){ const k = x === i && y !== j ? y : y === i && x !== j ? x : null; if (k != null){ ref = new THREE.Vector3(...P[k]).multiplyScalar(sc).sub(a); break; } }
      if (!ref) ref = Math.abs(d.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
      const pp = ref.clone().sub(d.clone().multiplyScalar(ref.dot(d))).normalize().multiplyScalar(rr*1.9);
      const offs = ord === 2 ? [-0.5, 0.5] : [-1, 0, 1]; offs.forEach(f => group.add(cylBetween(a.clone().addScaledVector(pp, f), b.clone().addScaledVector(pp, f), rr*0.72, bm))); }); }
  return group; }

/* ---------- VSEPR shapes ---------- */
function unitDirs(sn, nl){ // returns [bondDirs, lpDirs]
  const V = (x, y, z) => new THREE.Vector3(x, y, z).normalize(); let all;
  if (sn === 2) all = [V(1, 0, 0), V(-1, 0, 0)];
  else if (sn === 3) all = [0, 1, 2].map(k => V(Math.cos(k*2*Math.PI/3 + Math.PI/2), Math.sin(k*2*Math.PI/3 + Math.PI/2), 0));
  else if (sn === 4) all = [V(0, 1, 0), ...[0, 1, 2].map(k => V(Math.cos(k*2*Math.PI/3)*0.9428, -1/3, Math.sin(k*2*Math.PI/3)*0.9428))];
  else if (sn === 5) all = [...[0, 1, 2].map(k => V(Math.cos(k*2*Math.PI/3), 0, Math.sin(k*2*Math.PI/3))), V(0, 1, 0), V(0, -1, 0)];
  else all = [V(1, 0, 0), V(-1, 0, 0), V(0, 0, 1), V(0, 0, -1), V(0, 1, 0), V(0, -1, 0)];
  let lpI = [];
  if (sn === 5) lpI = [0, 1, 2].slice(0, nl); else if (sn === 6) lpI = nl === 1 ? [4] : nl === 2 ? [4, 5] : []; else if (sn === 4) lpI = [0, 1].slice(0, nl); else if (sn === 3) lpI = [0].slice(0, nl); else lpI = [];
  if (sn === 2 && nl) lpI = [];
  const bonds = all.filter((_, k) => !lpI.includes(k)), lps = all.filter((_, k) => lpI.includes(k));
  // lone pairs squeeze the bond angles a little (tetrahedral family)
  if (sn === 4 && nl === 1){ const ax = lps[0]; bonds.forEach(b => { b.addScaledVector(ax, -0.045).normalize(); }); }
  if (sn === 4 && nl === 2){ const ax = lps[0].clone().add(lps[1]).normalize(); bonds.forEach(b => { b.addScaledVector(ax, -0.085).normalize(); }); }
  if (sn === 3 && nl === 1){ const ax = lps[0]; bonds.forEach(b => { b.addScaledVector(ax, -0.02).normalize(); }); }
  return [bonds, lps]; }
/* AX2E3: lone pairs equatorial, bonds axial; handled by sn 5 with nl 3 */
const SHAPES = {
  2:{ 0:'Linear' }, 3:{ 0:'Trigonal planar', 1:'Bent' }, 4:{ 0:'Tetrahedral', 1:'Trigonal pyramidal', 2:'Bent' },
  5:{ 0:'Trigonal bipyramidal', 1:'Seesaw', 2:'T-shaped', 3:'Linear' }, 6:{ 0:'Octahedral', 1:'Square pyramidal', 2:'Square planar' } };
const EGEOM = { 2:'Linear', 3:'Trigonal planar', 4:'Tetrahedral', 5:'Trigonal bipyramidal', 6:'Octahedral' };
function lobe(dir, len, mat){ const g = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 20), mat); g.scale.set(0.32*len, 0.6*len, 0.32*len); g.position.copy(dir.clone().multiplyScalar(0.62*len)); g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize()); return g; }

/* ---------- orbital surfaces from real spherical harmonics ---------- */
const YLM = {
  s:() => 1, px:(x) => x, py:(x, y) => y, pz:(x, y, z) => z,
  dxy:(x, y) => x*y*2, dxz:(x, y, z) => x*z*2, dyz:(x, y, z) => y*z*2, 'dx2-y2':(x, y) => (x*x - y*y), dz2:(x, y, z) => (3*z*z - 1)/1.7,
  fz3:(x, y, z) => z*(5*z*z - 3)/2.2, fxyz:(x, y, z) => x*y*z*5.2 };
function orbitalMesh(kind, size, colA = 0x2f6fd8, colB = 0xe07b24){
  const geo = new THREE.SphereGeometry(1, 120, 80), p = geo.attributes.position, cols = new Float32Array(p.count*3), f = YLM[kind], cA = new THREE.Color(colA), cB = new THREE.Color(colB);
  for (let i = 0; i < p.count; i++){ const x = p.getX(i), y = p.getY(i), z = p.getZ(i), v = f(x, z, y); const r = kind === 's' ? 1 : v*v; // y up in three.js, so map (x, z, y)
    p.setXYZ(i, x*r*size, y*r*size, z*r*size); const c = v >= 0 ? cA : cB; cols[3*i] = c.r; cols[3*i + 1] = c.g; cols[3*i + 2] = c.b; }
  geo.setAttribute('color', new THREE.BufferAttribute(cols, 3)); geo.computeVertexNormals();
  return new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({ vertexColors:true, roughness:0.3, clearcoat:0.5, transparent:true, opacity:0.9, side:THREE.DoubleSide })); }

/* ---------- crystal unit cells (positions in units of the cell edge a) ---------- */
function cellSites(type){ const S = [], add = (x, y, z, k = 0) => S.push([x, y, z, k]);
  const corners = k => { for (const x of [0, 1]) for (const y of [0, 1]) for (const z of [0, 1]) add(x, y, z, k); };
  const faces = k => { [[0.5, 0.5, 0], [0.5, 0.5, 1], [0.5, 0, 0.5], [0.5, 1, 0.5], [0, 0.5, 0.5], [1, 0.5, 0.5]].forEach(p => add(...p, k)); };
  if (type === 'sc') corners(0);
  if (type === 'bcc'){ corners(0); add(0.5, 0.5, 0.5, 0); }
  if (type === 'fcc'){ corners(0); faces(0); }
  if (type === 'nacl'){ corners(1); faces(1); [[0.5, 0, 0], [0.5, 1, 0], [0.5, 0, 1], [0.5, 1, 1], [0, 0.5, 0], [1, 0.5, 0], [0, 0.5, 1], [1, 0.5, 1], [0, 0, 0.5], [1, 0, 0.5], [0, 1, 0.5], [1, 1, 0.5], [0.5, 0.5, 0.5]].forEach(p => add(...p, 0)); }
  if (type === 'cscl'){ corners(1); add(0.5, 0.5, 0.5, 0); }
  if (type === 'diamond'){ corners(0); faces(0); [[0.25, 0.25, 0.25], [0.75, 0.75, 0.25], [0.75, 0.25, 0.75], [0.25, 0.75, 0.75]].forEach(p => add(...p, 0)); }
  return S; }
/* the share of a site that lies inside one cell */
const share = p => p.slice(0, 3).reduce((s, v) => s*((v === 0 || v === 1) ? 0.5 : 1), 1);

/* ---------- {ce:..} and {m:..} placeholders inside worked examples and questions ---------- */
(() => { const base = window.mathifyHTML;
  window.mathifyHTML = h => { const parts = []; h = String(h).replace(/\{(ce|m):((?:[^{}]|\{[^{}]*\})*)\}/g, (_, k, s) => { parts.push(k === 'ce' ? ce(s) : tx(s)); return `\u0001${parts.length - 1}\u0001`; });
    if (base) h = base(h); return h.replace(/\u0001(\d+)\u0001/g, (_, i) => parts[+i]); };
  const ex0 = example; example = (el, o) => { o.q = window.mathifyHTML(o.q); return ex0(el, o); }; })();

/* ---------- a plot with optional logarithmic axes ---------- */
function plot(cv, o){ const { ctx, W, H } = prep(cv); readColors();
  const pl = o.pl || 62, pr = 16, pt = o.pt || 24, pb = 38, w = W - pl - pr, h = H - pt - pb;
  const tf = (v, lg) => lg ? Math.log10(v) : v;
  const [x0, x1] = [tf(o.xmin, o.xlog), tf(o.xmax, o.xlog)], [y0, y1] = [tf(o.ymin, o.ylog), tf(o.ymax, o.ylog)];
  const X = v => pl + (tf(v, o.xlog) - x0)/(x1 - x0)*w, Y = v => pt + h - (tf(v, o.ylog) - y0)/(y1 - y0)*h;
  ctx.font = `11px ${C.mono}`; ctx.textBaseline = 'middle'; ctx.lineWidth = 1;
  const ticks = (a, b, lg, n) => { const T = []; if (lg){ for (let e = Math.ceil(a); e <= Math.floor(b) + 1e-9; e++) T.push([Math.pow(10, e), e]); return T; }
    const st = niceStep(b - a, n); for (let v = Math.ceil(a/st)*st; v <= b + 1e-9; v += st) T.push([v, null, st]); return T; };
  const lab = (v, e, st) => e != null ? (Math.abs(e) <= 3 ? String(Math.pow(10, e) >= 1 ? Math.pow(10, e) : +Math.pow(10, e).toPrecision(1)) : `1e${e}`) : fmtTick(v, st);
  for (const [v, e, st] of ticks(x0, x1, o.xlog, Math.max(3, Math.floor(w/80)))){ const xx = X(v); ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(xx, pt); ctx.lineTo(xx, pt + h); ctx.stroke(); ctx.fillStyle = C.muted; ctx.textAlign = 'center'; ctx.fillText(o.xfmt ? o.xfmt(v) : lab(v, e, st), xx, pt + h + 12); }
  for (const [v, e, st] of ticks(y0, y1, o.ylog, 5)){ const yy = Y(v); ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(pl, yy); ctx.lineTo(pl + w, yy); ctx.stroke(); ctx.fillStyle = C.muted; ctx.textAlign = 'right'; ctx.fillText(o.yfmt ? o.yfmt(v) : lab(v, e, st), pl - 6, yy); }
  ctx.strokeStyle = C.muted; ctx.strokeRect(pl, pt, w, h);
  ctx.fillStyle = C.muted; ctx.textAlign = 'right'; ctx.fillText(o.xlab || '', pl + w, pt + h + 28);
  ctx.save(); ctx.translate(13, pt + h/2); ctx.rotate(-Math.PI/2); ctx.textAlign = 'center'; ctx.fillText(o.ylab || '', 0, 0); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.rect(pl, pt, w, h); ctx.clip();
  for (const sh of (o.bands || [])){ ctx.fillStyle = alpha(sh.color, sh.a || 0.1); if (sh.y) ctx.fillRect(pl, Y(sh.y[1]), w, Y(sh.y[0]) - Y(sh.y[1])); else ctx.fillRect(X(sh.x[0]), pt, X(sh.x[1]) - X(sh.x[0]), h);
    if (sh.label){ ctx.fillStyle = sh.color; ctx.textAlign = 'left'; ctx.font = `11px ${C.mono}`; ctx.fillText(sh.label, sh.y ? pl + 6 : X(sh.x[0]) + 4, sh.y ? Y(sh.y[1]) + 10 : pt + 10); } }
  for (const s of (o.series || [])){ ctx.strokeStyle = s.color; ctx.lineWidth = s.w || 2; ctx.setLineDash(s.dash || []); ctx.beginPath(); let on = false;
    for (let j = 0; j < s.x.length; j++){ const a = s.x[j], b = s.y[j]; if (!isFinite(a) || !isFinite(b) || (o.xlog && a <= 0) || (o.ylog && b <= 0)){ on = false; continue; } if (on) ctx.lineTo(X(a), Y(b)); else { ctx.moveTo(X(a), Y(b)); on = true; } }
    ctx.stroke(); ctx.setLineDash([]); if (s.fill){ ctx.fillStyle = alpha(s.color, 0.15); ctx.lineTo(X(s.x[s.x.length - 1]), Y(o.ylog ? o.ymin : Math.max(o.ymin, 0))); ctx.lineTo(X(s.x[0]), Y(o.ylog ? o.ymin : Math.max(o.ymin, 0))); ctx.closePath(); ctx.fill(); } }
  for (const l of (o.hl || [])){ ctx.strokeStyle = l.color; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(pl, Y(l.v)); ctx.lineTo(pl + w, Y(l.v)); ctx.stroke(); ctx.setLineDash([]); if (l.label){ ctx.fillStyle = l.color; ctx.textAlign = 'right'; ctx.fillText(l.label, pl + w - 4, Y(l.v) - 8); } }
  for (const l of (o.vl || [])){ ctx.strokeStyle = l.color; ctx.setLineDash([4, 3]); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(X(l.v), pt); ctx.lineTo(X(l.v), pt + h); ctx.stroke(); ctx.setLineDash([]); if (l.label){ ctx.fillStyle = l.color; ctx.textAlign = X(l.v) > pl + w*0.7 ? 'right' : 'left'; ctx.fillText(l.label, X(l.v) + (ctx.textAlign === 'left' ? 4 : -4), pt + 10 + (l.dy || 0)); } }
  const hits = [];
  for (const p of (o.points || [])){ const xx = X(p.x), yy = Y(p.y); if (!isFinite(xx) || !isFinite(yy)) continue; ctx.fillStyle = p.color; ctx.strokeStyle = p.ring || C.sheet; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(xx, yy, p.r || 5, 0, 7); ctx.fill(); ctx.stroke();
    if (p.label){ ctx.fillStyle = C.text; ctx.textAlign = xx > pl + w*0.8 ? 'right' : 'left'; ctx.font = `${p.bold ? 600 : 400} 11.5px ${C.mono}`; ctx.fillText(p.label, xx + (ctx.textAlign === 'left' ? 8 : -8), yy - 1); ctx.font = `11px ${C.mono}`; }
    hits.push([xx, yy, p]); }
  ctx.restore();
  if (o.legend){ let lx = pl + 4; ctx.textAlign = 'left'; for (const s of o.legend){ ctx.fillStyle = s.color; ctx.fillRect(lx, 8, 14, 4); ctx.fillStyle = C.muted; ctx.fillText(s.label, lx + 18, 10); lx += 30 + ctx.measureText(s.label).width; } }
  cv._hits = hits; return { X, Y, pl, pt, w, h }; }
function hoverPoints(cv, cb){ const f = ev => { const r = cv.getBoundingClientRect(), x = ev.clientX - r.left, y = ev.clientY - r.top; let best = null, bd = 400;
    for (const [px, py, p] of (cv._hits || [])){ const d = (px - x)**2 + (py - y)**2; if (d < bd){ bd = d; best = p; } } cb(best); };
  cv.addEventListener('pointermove', f); cv.addEventListener('pointerdown', f); }
