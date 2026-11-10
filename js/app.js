// Entry point. Renders the professional résumé and switches to the islands map on demand.
import resume from '../data/resume.js';
import world from '../data/world.js';

const root = document.documentElement;
const $ = (s) => document.querySelector(s);
const NS = 'http://www.w3.org/2000/svg';
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
const el = (tag, attrs = {}, ...kids) => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) k === 'text' ? (n.textContent = v) : n.setAttribute(k, v);
  n.append(...kids.filter(Boolean));
  return n;
};
const svg = (tag, attrs = {}, ...kids) => {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) k === 'text' ? (n.textContent = v) : n.setAttribute(k, v);
  n.append(...kids.filter(Boolean));
  return n;
};

const ICONS = {
  mail: 'M3 6h18v12H3z M3 7l9 6 9-6',
  linkedin: 'M4 9v11 M4 4.5v.5 M9 20V9 M9 13a4 4 0 0 1 8 0v7',
  github: 'M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22',
  work: 'M4 8h16v11H4z M9 8V5h6v3 M4 13h16',
  pen: 'M4 20l1-4L16 5l3 3L8 19z M14 7l3 3',
  spark: 'M12 3v5 M12 16v5 M3 12h5 M16 12h5 M6 6l2.5 2.5 M15.5 15.5L18 18 M18 6l-2.5 2.5 M8.5 15.5L6 18',
  cap: 'M2 9l10-5 10 5-10 5z M6 11.5V16c2 2 10 2 12 0v-4.5 M22 9v5',
  arrow: 'M7 17L17 7 M9 7h8v8',
  down: 'M12 4v11 M7 11l5 5 5-5 M5 20h14',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 7v5l3 2',
};
function icon(name, size = 18) {
  const s = svg('svg', { viewBox: '0 0 24 24', width: size, height: size, 'aria-hidden': 'true', class: 'ico' });
  s.append(svg('path', { d: ICONS[name] }));
  return s;
}
const ext = (href) => (/^(https?:|mailto:)/.test(href) ? { target: '_blank', rel: 'noopener' } : {});

// ───────── the blueprint: the same map, drawn as a line diagram from the same data ─────────
function blueprint() {
  const K = 4;
  const items = world.islands.map((d, i) => {
    const [x, h, z] = d.position;
    const u = (x - z) / Math.SQRT2, w = (x + z) / Math.SQRT2;
    return { d, i, w, cx: u * K, cy: w * K * 0.5 - h * K * 0.55, r: d.radius * K * 1.22 };
  });
  const by = Object.fromEntries(items.map((it) => [it.d.id, it]));
  const xs = items.flatMap((it) => [it.cx - it.r, it.cx + it.r]);
  const ys = items.flatMap((it) => [it.cy - it.r * 1.5, it.cy + it.r * 1.75]);
  const x0 = Math.min(...xs) - 8, y0 = Math.min(...ys) - 8;
  const s = svg('svg', { viewBox: `${x0} ${y0} ${Math.max(...xs) - x0 + 8} ${Math.max(...ys) - y0 + 8}`, class: 'bp', role: 'img', 'aria-label': 'A line drawing of the islands map. Each island opens in the map.' });
  const trails = svg('g', { class: 'bp-trails' });
  for (const p of world.paths) {
    const a = by[p.from], b = by[p.to];
    if (a && b) trails.append(svg('path', { class: p.style === 'light' ? 'bp-light' : 'bp-stones', d: `M${a.cx} ${a.cy} Q${(a.cx + b.cx) / 2} ${(a.cy + b.cy) / 2 - (p.style === 'light' ? 26 : 5)} ${b.cx} ${b.cy}` }));
  }
  s.append(trails);
  const f = (n) => n.toFixed(1);
  for (const it of [...items].sort((a, b) => a.w - b.w)) {
    const { cx, cy, r, d } = it;
    const P = [0, 60, 120, 180, 240, 300].map((a) => [cx + r * Math.cos((a * Math.PI) / 180), cy + r * 0.5 * Math.sin((a * Math.PI) / 180)]);
    const t = r * 0.2;
    const top = `M${P.map((p) => `${f(p[0])} ${f(p[1])}`).join('L')}Z`;
    const side = `M${f(P[3][0])} ${f(P[3][1])}v${f(t)}L${f(P[2][0])} ${f(P[2][1] + t)}L${f(P[1][0])} ${f(P[1][1] + t)}L${f(P[0][0])} ${f(P[0][1] + t)}V${f(P[0][1])}`;
    const tip = [cx + r * 0.06, cy + t + r * 1.15];
    const rock = `M${f(P[3][0] + r * 0.14)} ${f(P[3][1] + t)}L${f(tip[0])} ${f(tip[1])}L${f(P[0][0] - r * 0.14)} ${f(P[0][1] + t)}M${f(P[2][0])} ${f(P[2][1] + t)}L${f(tip[0])} ${f(tip[1])}`;
    const pin = d.kind === 'creation' || d.kind === 'plot'
      ? svg('path', { class: 'bp-pin', d: `M${f(cx)} ${f(cy - r * 0.62)}l${f(r * 0.2)} ${f(r * 0.2)}l${f(-r * 0.2)} ${f(r * 0.2)}l${f(-r * 0.2)} ${f(-r * 0.2)}Z` })
      : svg('path', { class: 'bp-pin', d: `M${f(cx)} ${f(cy)}V${f(cy - r * 0.8)}m${f(-r * 0.13)} 0a${f(r * 0.13)} ${f(r * 0.13)} 0 1 0 ${f(r * 0.26)} 0a${f(r * 0.13)} ${f(r * 0.13)} 0 1 0 ${f(-r * 0.26)} 0` });
    const g = svg('g', { class: 'bp-float', style: `animation-delay:${-(it.i * 0.83) % 7}s` },
      svg('path', { class: 'bp-rock', d: rock }), svg('path', { class: 'bp-side', d: side }), svg('path', { class: 'bp-top', d: top }), pin);
    const a = svg('a', { href: `?v=map#${d.id}`, class: `bp-isle kind-${d.kind}${d.id === 'senior-technical-writer' ? ' is-now' : ''}`, 'data-island': d.id, 'data-title': d.title, 'aria-label': d.title }, g);
    s.append(a);
  }
  return s;
}

// ───────── the band: sixteen years in one line ─────────
function band() {
  const segs = resume.band;
  const y0 = segs[0].span[0], y1 = segs[segs.length - 1].span[1];
  const bar = el('div', { class: 'band-bar', role: 'img', 'aria-label': segs.map((s) => `${s.title}, ${Math.floor(s.span[0])} to ${Math.floor(s.span[1])}`).join('. ') },
    ...segs.map((s) => el('div', { class: `seg ${s.kind}${s.now ? ' now' : ''}`, style: `flex:${(s.span[1] - s.span[0]).toFixed(2)}`, title: s.title }, s.label ? el('span', { text: s.label }) : null)));
  const years = el('div', { class: 'band-years', 'aria-hidden': 'true' },
    ...[2011, 2014, 2017, 2020, 2023, 2026].map((y) => el('span', { style: `left:${(((y - y0) / (y1 - y0)) * 100).toFixed(2)}%`, text: String(y) })));
  const legend = el('ul', { class: 'band-legend' }, ...[['work', 'Work'], ['study', 'Study'], ['volunteer', 'Volunteering'], ['break', 'Career break']].map(([k, t]) => el('li', {}, el('i', { class: `seg ${k}` }), el('span', { text: t }))));
  return el('section', { class: 'band reveal', 'aria-label': 'Career at a glance' }, bar, years, legend);
}

function section(id, iconName, title, ...kids) {
  return el('section', { class: 'sec reveal', id, 'aria-labelledby': `${id}-h` },
    el('h2', { id: `${id}-h` }, icon(iconName, 16), el('span', { text: title })),
    el('div', { class: 'sec-body' }, ...kids));
}

function renderPro() {
  const r = resume;
  const cap = el('span', { class: 'bp-cap', text: 'The same career, as a map' });
  const art = el('div', { class: 'hero-art reveal' }, blueprint(), el('button', { class: 'bp-go', type: 'button', 'data-go': 'map' }, cap, icon('arrow', 13)));
  art.addEventListener('pointerover', (e) => { const a = e.target.closest('.bp-isle'); if (a) cap.textContent = a.dataset.title; });
  art.addEventListener('pointerleave', () => { cap.textContent = 'The same career, as a map'; });
  art.addEventListener('focusin', (e) => { const a = e.target.closest('.bp-isle'); if (a) cap.textContent = a.dataset.title; });
  art.addEventListener('click', (e) => {
    const a = e.target.closest('.bp-isle');
    if (!a) return;
    e.preventDefault();
    go('map', a.dataset.island);
  });

  const hero = el('section', { class: 'hero' },
    el('div', { class: 'hero-text' },
      el('p', { class: 'eyebrow reveal', text: `${r.role} · ${r.where}` }),
      el('h1', { class: 'reveal', text: r.statement }),
      el('p', { class: 'lede reveal', text: r.summary }),
      el('ul', { class: 'contact-row reveal' },
        ...r.contact.map((c) => el('li', {}, el('a', { href: c.href, ...ext(c.href) }, icon(c.icon, 16), el('span', { text: c.label })))),
        el('li', {}, el('button', { type: 'button', class: 'pdf', id: 'save-pdf' }, icon('down', 16), el('span', { text: 'PDF' }))))),
    art);

  const experience = section('experience', 'work', 'Experience', ...r.experience.map((x) =>
    el('article', { class: 'row' },
      el('p', { class: 'when' }, el('span', { text: x.period }), el('span', { text: x.place })),
      el('div', {},
        el('h3', {}, el('span', { text: x.title }), el('span', { class: 'org', text: x.org })),
        el('ul', {}, ...x.points.map((p) => el('li', { text: p })))))));

  const work = section('work', 'pen', 'Selected writing',
    el('ul', { class: 'links' }, ...r.work.map((w) =>
      el('li', {}, el('a', { href: w.href, ...ext(w.href) },
        el('span', { class: 'kind', text: w.kind }),
        el('span', { class: 'ttl' }, el('span', { text: w.title }), icon('arrow', 14)),
        el('span', { class: 'note', text: w.note }))))));

  const projects = section('projects', 'spark', 'Built with AI',
    el('div', { class: 'cards' }, ...r.projects.map((p) => {
      const inner = [el('span', { class: 'kind', text: p.tag }),
        el('span', { class: 'ttl' }, el('span', { text: p.title }), p.href ? icon('arrow', 14) : null),
        el('span', { class: 'note', text: p.note })];
      return p.href ? el('a', { class: 'card', href: p.href }, ...inner) : el('div', { class: 'card' }, ...inner);
    })));

  const education = section('education', 'cap', 'Education', ...r.education.map((e) =>
    el('article', { class: 'row' },
      el('p', { class: 'when' }, el('span', { text: e.period })),
      el('div', {}, el('h3', {}, el('span', { text: e.title }), el('span', { class: 'org', text: e.org })), el('p', { class: 'note', text: e.note })))));

  const foot = el('footer', { class: 'foot reveal' },
    el('p', { text: 'There is a less formal version of all this, with weather.' }),
    el('button', { type: 'button', class: 'foot-go', 'data-go': 'map' }, el('span', { text: 'Explore the islands' }), icon('arrow', 14)));

  $('#pro').replaceChildren(hero, band(), experience, work, projects, education, foot);
  $('#save-pdf').addEventListener('click', () => print());

  if (calm || !('IntersectionObserver' in window)) return;
  root.classList.add('can-reveal');
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }, { rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('.reveal').forEach((n, i) => { n.style.setProperty('--d', `${Math.min(i, 5) * 80}ms`); io.observe(n); });
}

// ───────── the badge and what is behind it ─────────
function setupBadge() {
  const badge = $('#badge'), box = $('#colophon');
  $('#badge-text').textContent = `Made by ${resume.madeBy}`;
  const live = el('p', { class: 'live', hidden: '' });
  const fact = (h, p) => el('li', {}, el('strong', { text: h }), el('span', { text: p }));
  box.append(
    el('p', { class: 'col-kicker', text: 'Colophon' }),
    el('h2', { text: `Made by ${resume.madeBy}` }),
    el('p', { class: 'col-lede', text: 'Kiran described a feeling. An AI model wrote every line, looked at its own screenshots, and kept revising until it felt right.' }),
    el('ul', {},
      fact('Nothing is loaded.', 'No images, no 3D models, no textures. Every island, cloud and cow is built from code the moment the page opens.'),
      fact('The sky keeps time.', 'It is a single shader, and its hour follows the trail: night in 2010, first light at the master’s degree, sunrise where the writing begins, morning at the frontier.'),
      fact('One career, two voices.', 'The résumé and the islands are written separately and drawn from the same map. The line drawing on the résumé is that map.'),
      fact('It looks after itself.', 'The lens blur and glow quietly switch off on slower devices so the map stays smooth.')),
    live);
  let timer = 0;
  const tick = () => {
    const s = window.__map?.stats?.();
    live.hidden = !s || !root.classList.contains('view-map');
    if (!live.hidden) live.textContent = `Right now: ${s.islands} islands · ${s.calls.toLocaleString()} draw calls · ${s.tris.toLocaleString()} triangles · ${s.fps} frames a second`;
  };
  const open = (on) => {
    box.hidden = !on;
    badge.setAttribute('aria-expanded', String(on));
    clearInterval(timer);
    if (on) { tick(); timer = setInterval(tick, 500); }
  };
  badge.addEventListener('click', (e) => { e.stopPropagation(); open(box.hidden); });
  document.addEventListener('click', (e) => { if (!box.hidden && !box.contains(e.target)) open(false); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !box.hidden) { open(false); badge.focus(); } });
}

// ───────── view switching ─────────
const toggle = $('#view-toggle');
let mapLoaded = null;
let proScroll = 0;
function setView(view) {
  const map = view === 'map';
  if (map && root.classList.contains('view-pro')) proScroll = scrollY;
  root.classList.toggle('view-map', map);
  root.classList.toggle('view-pro', !map);
  toggle.setAttribute('aria-checked', String(map));
  $('#toggle-caption').textContent = map ? 'Islands' : 'Résumé';
  document.title = map ? `${resume.name} · a career map` : `${resume.name} · ${resume.role}`;
  document.querySelector('meta[name="theme-color"]').content = map ? '#131848' : matchMedia('(prefers-color-scheme: dark)').matches ? '#121116' : '#fbfaf7';
  if (map) {
    mapLoaded ??= import('./main.js').catch((err) => {
      console.error(err);
      $('#map-error').hidden = false;
    });
    dispatchEvent(new Event('resize'));
  } else {
    window.__map?.stopTour?.();
    requestAnimationFrame(() => scrollTo(0, proScroll));
  }
}
// change view with a history entry and, where the browser can, a reveal that opens from the toggle
function go(view, island) {
  const url = new URL(location.href);
  url.hash = island ?? '';
  if (view === 'map') url.searchParams.set('v', 'map'); else url.searchParams.delete('v');
  const apply = () => {
    history.pushState(null, '', url);
    setView(view);
    if (island) window.__map?.select?.(island, { push: false });
  };
  if (!document.startViewTransition || calm) return apply();
  const r = toggle.getBoundingClientRect();
  root.style.setProperty('--vx', `${r.left + r.width / 2}px`);
  root.style.setProperty('--vy', `${r.top + r.height / 2}px`);
  document.startViewTransition(apply);
}
const viewFromUrl = () => (new URLSearchParams(location.search).get('v') === 'map' || location.hash.length > 1 ? 'map' : 'pro');

renderPro();
setupBadge();
setView(viewFromUrl());
toggle.addEventListener('click', () => go(root.classList.contains('view-map') ? 'pro' : 'map'));
document.addEventListener('click', (e) => { if (e.target.closest('[data-go="map"]')) go('map'); });
addEventListener('popstate', () => setView(viewFromUrl()));
addEventListener('beforeprint', () => document.querySelectorAll('.reveal').forEach((n) => n.classList.add('is-in')));
