/* BME 1104 slide deck: 16:9 slides, keyboard navigation, step reveal, full screen, export to PDF via print */
(() => {
'use strict';
const deck = document.querySelector('.deck'), slides = [...deck.querySelectorAll('.slide')], foot = deck.dataset.footer || '';
let cur = 0;
slides.forEach((s, i) => { if (!s.classList.contains('title')){ const f = document.createElement('div'); f.className = 'foot'; f.innerHTML = `<span>${foot}</span><span>${i + 1}</span>`; s.appendChild(f); } });
// toolbar
const bar = document.createElement('div'); bar.className = 'bar';
bar.innerHTML = `<a href="index.html" title="Chapter 10 contents">BME 1104</a><span class="t">${document.title}</span><span class="sp"></span>
  <select aria-label="Go to slide"></select><span class="n" aria-live="polite"></span>
  <button type="button" class="prev" aria-label="Previous slide">Back</button><button type="button" class="next primary" aria-label="Next slide">Next</button>
  <button type="button" class="fs">Full screen</button><button type="button" class="pdf" title="Opens the print dialog: choose Save as PDF">Export PDF</button>`;
document.body.appendChild(bar);
const sel = bar.querySelector('select'), cnt = bar.querySelector('.n');
sel.innerHTML = slides.map((s, i) => { const h = s.querySelector('h1,h2'); return `<option value="${i}">${i + 1}. ${h ? h.textContent.trim().slice(0, 60) : ''}</option>`; }).join('');
const steps = s => [...s.querySelectorAll('.step')];
function show(i, fromBack){ cur = Math.max(0, Math.min(slides.length - 1, i)); slides.forEach((s, k) => s.classList.toggle('on', k === cur));
  steps(slides[cur]).forEach(e => e.classList.toggle('hide', !fromBack)); sel.value = cur; cnt.textContent = `${cur + 1} / ${slides.length}`; history.replaceState(null, '', '#' + (cur + 1)); }
function next(){ const hidden = steps(slides[cur]).filter(e => e.classList.contains('hide')); if (hidden.length){ hidden[0].classList.remove('hide'); return; } show(cur + 1); }
function prev(){ const shown = steps(slides[cur]).filter(e => !e.classList.contains('hide')); if (shown.length && steps(slides[cur]).length){ shown[shown.length - 1].classList.add('hide'); if (shown.length > 1 || !slides[cur - 1]) return; } show(cur - 1, true); }
bar.querySelector('.next').onclick = next; bar.querySelector('.prev').onclick = prev; sel.onchange = () => show(+sel.value, true);
bar.querySelector('.fs').onclick = () => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
bar.querySelector('.pdf').onclick = () => window.print();
document.addEventListener('keydown', e => { if (e.target.closest('input,select,textarea')) return;
  if (['ArrowRight', 'PageDown', ' '].includes(e.key)){ e.preventDefault(); next(); } else if (['ArrowLeft', 'PageUp'].includes(e.key)){ e.preventDefault(); prev(); }
  else if (e.key === 'Home') show(0); else if (e.key === 'End') show(slides.length - 1, true); else if (e.key === 'f' || e.key === 'F') bar.querySelector('.fs').click(); });
// fit the 1280 x 720 slide to the window
let rt = null; function fit(){ const vp = document.querySelector('.viewport'), w = vp.clientWidth, h = vp.clientHeight, s = Math.min(w/1280, h/720)*0.98; deck.style.transform = `scale(${s})`; window.DECK_SCALE = Math.max(1, s); clearTimeout(rt); rt = setTimeout(() => { if (typeof redrawAll === 'function') redrawAll(); }, 120); }
window.addEventListener('resize', fit); document.addEventListener('fullscreenchange', () => setTimeout(fit, 50));
fit(); const start = parseInt(location.hash.slice(1)) - 1; show(isFinite(start) ? start : 0, true);
window.addEventListener('beforeprint', () => { slides.forEach(s => steps(s).forEach(e => e.classList.remove('hide'))); window.DECK_SCALE = 2.5; if (typeof redrawAll === 'function') redrawAll(); });
window.addEventListener('afterprint', fit);
window.addEventListener('hashchange', () => { const k = parseInt(location.hash.slice(1)) - 1; if (isFinite(k) && k !== cur) show(k, true); });
})();
