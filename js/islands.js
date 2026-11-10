// Island and landmark builders. Everything is low-poly primitives, no assets.
// To give a creation its own look, add a function to LANDMARKS and name it in data/world.js.
import * as THREE from 'three';

const mat = (color, opts = {}) =>
  new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.92, metalness: 0, ...opts });
// Lamps and windows. They are registered so the scene can turn them up as night falls.
export const GLOWS = [];
const glow = (color, intensity = 1.4) => {
  const m = mat(color, { emissive: color, emissiveIntensity: intensity, roughness: 0.4 });
  GLOWS.push({ m, base: intensity });
  return m;
};

function part(geo, material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, material);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}
const box = (w, h, d, material, x, y, z) => part(new THREE.BoxGeometry(w, h, d), material, x, y, z);
const cyl = (rt, rb, h, n, material, x, y, z) =>
  part(new THREE.CylinderGeometry(rt, rb, h, n), material, x, y, z);

function hash(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}
function rng(seed) {
  let a = hash(seed);
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Push vertices around, giving coincident vertices the same push so the mesh stays closed.
function jitter(geo, amount, keepAboveY) {
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    if (y > keepAboveY) continue;
    const r = rng(`${x.toFixed(2)},${y.toFixed(2)},${z.toFixed(2)}`);
    p.setXYZ(i, x + (r() - 0.5) * amount, y + (r() - 0.5) * amount * 0.6, z + (r() - 0.5) * amount);
  }
  geo.computeVertexNormals();
  return geo;
}

function tree(x, z, s, leaf, trunk = '#8a5a44') {
  const g = new THREE.Group();
  g.add(cyl(0.12 * s, 0.16 * s, 0.7 * s, 5, mat(trunk), 0, 0.35 * s, 0));
  g.add(part(new THREE.ConeGeometry(0.62 * s, 1.1 * s, 6), mat(leaf), 0, 1.15 * s, 0));
  g.add(part(new THREE.ConeGeometry(0.46 * s, 0.9 * s, 6), mat(leaf), 0, 1.75 * s, 0));
  g.position.set(x, 0, z);
  return g;
}
function bush(x, z, s, color) {
  return part(new THREE.IcosahedronGeometry(0.42 * s, 0), mat(color), x, 0.28 * s, z);
}
function stone(x, z, s, color) {
  const m = part(new THREE.DodecahedronGeometry(0.36 * s, 0), mat(color), x, 0.16 * s, z);
  m.rotation.set(x, z, x + z);
  return m;
}
function house(x, z, s, wall, roof) {
  const g = new THREE.Group();
  g.add(box(1.5 * s, 1.1 * s, 1.3 * s, mat(wall), 0, 0.55 * s, 0));
  const r = part(new THREE.ConeGeometry(1.25 * s, 0.9 * s, 4), mat(roof), 0, 1.55 * s, 0);
  r.rotation.y = Math.PI / 4;
  g.add(r);
  g.add(box(0.32 * s, 0.6 * s, 0.05, mat('#5b4468'), 0.2 * s, 0.3 * s, 0.66 * s));
  g.add(box(0.3 * s, 0.3 * s, 0.05, glow('#ffe7a8', 0.9), -0.4 * s, 0.68 * s, 0.66 * s));
  g.position.set(x, 0, z);
  return g;
}
function signpost(x, z, color) {
  const g = new THREE.Group();
  g.add(cyl(0.06, 0.06, 1.3, 5, mat('#8a5a44'), 0, 0.65, 0));
  g.add(box(0.9, 0.32, 0.08, mat(color), 0.2, 1.1, 0));
  g.position.set(x, 0, z);
  return g;
}

// ───────────────────────── landmarks ─────────────────────────
// Each takes (group, palette, tickers). Push a function (t) => {} to `tickers` to animate.
export const LANDMARKS = {
  seed(g, p) {
    g.add(house(-1.2, -0.6, 0.9, '#fff3df', p.accent));
    // a sapling, staked
    g.add(cyl(0.05, 0.07, 1.1, 5, mat('#8a5a44'), 1.5, 0.55, 0.8));
    g.add(part(new THREE.IcosahedronGeometry(0.42, 0), mat('#7cc98a'), 1.5, 1.3, 0.8));
    g.add(cyl(0.03, 0.03, 0.9, 4, mat('#d9c7a3'), 1.8, 0.45, 0.8));
    g.add(tree(-2.6, 1.6, 0.9, '#6dbb86'));
    g.add(bush(0.4, 2.4, 1, '#8ed09a'));
    g.add(stone(2.6, -1.6, 1.2, '#cdbfd6'));
  },

  pencil(g, p, tickers) {
    g.add(house(-2.6, 0.6, 1.15, '#fff3df', '#7c9be8'));
    // the giant pencil
    const pencil = new THREE.Group();
    pencil.add(part(new THREE.ConeGeometry(0.1, 0.25, 6), mat('#3a3148'), 0, 0.12, 0).rotateX(Math.PI));
    pencil.add(part(new THREE.ConeGeometry(0.5, 0.9, 6), mat('#f1cfa4'), 0, 0.68, 0).rotateX(Math.PI));
    pencil.add(cyl(0.5, 0.5, 3.6, 6, mat('#ffc94d'), 0, 2.93, 0));
    pencil.add(cyl(0.52, 0.52, 0.3, 6, mat('#c9c9d6'), 0, 4.88, 0));
    pencil.add(cyl(0.5, 0.46, 0.5, 6, mat('#ff9aa8'), 0, 5.28, 0));
    pencil.position.set(1.6, 0, -0.8);
    pencil.rotation.z = -0.16;
    g.add(pencil);
    // loose pages drifting up
    const pages = [];
    for (let i = 0; i < 4; i++) {
      const pg = box(0.7, 0.03, 0.95, mat('#ffffff'), 3 + (i % 2) * 0.8, 1.6 + i * 0.75, 1.6 - i * 0.5);
      pages.push(pg);
      g.add(pg);
    }
    tickers.push((t) =>
      pages.forEach((pg, i) => {
        pg.position.y = 1.6 + i * 0.75 + Math.sin(t * 0.8 + i * 1.7) * 0.22;
        pg.rotation.set(Math.sin(t * 0.5 + i) * 0.25, t * 0.3 + i, Math.cos(t * 0.6 + i) * 0.2);
      })
    );
    g.add(tree(-0.4, 3.6, 1.1, '#63b384'), tree(-4.4, -1.8, 0.9, '#74c08f'), tree(3.8, -3.2, 1, '#63b384'));
    g.add(bush(0.8, 2.2, 1, '#8ed09a'), stone(-1.4, -3.6, 1.3, '#cdbfd6'));
  },

  // ── the trail before Zoho ──
  gear(g, p, tickers) {
    const steel = mat('#c9ccd9', { roughness: 0.5, metalness: 0.3 });
    const mk = (r, teeth, color) => {
      const w = new THREE.Group();
      w.add(cyl(r, r, 0.3, 16, mat(color, { roughness: 0.5, metalness: 0.3 })).rotateX(Math.PI / 2));
      w.add(cyl(r * 0.3, r * 0.3, 0.42, 8, mat('#5b4468')).rotateX(Math.PI / 2));
      for (let i = 0; i < teeth; i++) {
        const a = (i / teeth) * Math.PI * 2;
        const t = box(r * 0.34, r * 0.34, 0.3, mat(color, { roughness: 0.5, metalness: 0.3 }), Math.cos(a) * r * 1.08, Math.sin(a) * r * 1.08, 0);
        t.rotation.z = a;
        w.add(t);
      }
      return w;
    };
    const a = mk(1.25, 10, p.accent), b = mk(0.8, 7, '#ffc94d');
    a.position.set(-0.5, 1.75, 0); b.position.set(1.6, 2.75, 0);
    g.add(a, b, box(0.3, 1.8, 0.3, steel, -0.5, 0.9, -0.35), box(0.25, 2.8, 0.25, steel, 1.6, 1.4, -0.35));
    tickers.push((t) => { a.rotation.z = t * 0.5; b.rotation.z = -t * 0.5 * (10 / 7) + 0.2; });
    g.add(tree(-2.8, 1.6, 0.9, '#6dbb86'), tree(2.6, -2, 0.8, '#74c08f'), bush(0.6, 2.6, 1, '#8ed09a'), stone(-2.2, -2.2, 1.1, '#cdbfd6'));
  },

  office(g, p) {
    const wall = mat('#eef1fb'), win = glow('#ffe7a8', 0.7);
    const tower = (x, z, w, h) => {
      g.add(box(w, h, w, wall, x, h / 2, z));
      g.add(box(w + 0.2, 0.14, w + 0.2, mat(p.accent), x, h + 0.07, z));
      for (let y = 0.6; y < h - 0.3; y += 0.7)
        for (let i = -1; i <= 1; i += 2) {
          g.add(box(0.34, 0.34, 0.04, win, x + i * w * 0.24, y, z + w / 2 + 0.02));
          g.add(box(0.04, 0.34, 0.34, win, x + w / 2 + 0.02, y, z + i * w * 0.24));
        }
    };
    tower(-1.2, -0.6, 1.9, 4.2); tower(1.3, 0.4, 1.6, 2.9);
    g.add(tree(-3.2, 2, 0.9, '#63b384'), tree(3, -2.6, 0.9, '#74c08f'), bush(0.2, 3, 1, '#8ed09a'), stone(3.2, 2.2, 1.1, '#cdbfd6'));
  },

  home(g, p) {
    g.add(house(-0.5, -0.3, 1.1, '#fff3df', p.accent), signpost(1.6, 1.1, '#fff7ea'));
    g.add(tree(-1.9, 1.3, 0.8, '#6dbb86'), bush(1.2, -1.5, 0.9, '#8ed09a'));
  },

  kibbutz(g, p, tickers) {
    const palm = (x, z, h) => {
      const t = new THREE.Group();
      t.add(cyl(0.1, 0.16, h, 5, mat('#a8794f'), 0, h / 2, 0));
      for (let i = 0; i < 6; i++) {
        const l = box(1.2, 0.05, 0.34, mat('#5fae6e'), 0.55, 0, 0);
        const arm = new THREE.Group();
        arm.add(l); arm.position.y = h; arm.rotation.set(0, (i / 6) * Math.PI * 2, -0.35);
        t.add(arm);
      }
      t.position.set(x, 0, z);
      return t;
    };
    const cow = (x, z, ry) => {
      const c = new THREE.Group(), white = mat('#fffaf2'), black = mat('#3a3148');
      c.add(box(1.3, 0.7, 0.62, white, 0, 0.75, 0), box(0.5, 0.42, 0.64, black, -0.25, 0.86, 0));
      c.add(box(0.46, 0.46, 0.44, white, 0.82, 0.98, 0), box(0.2, 0.2, 0.46, mat('#f4b6b6'), 1.04, 0.86, 0));
      for (const [lx, lz] of [[-0.45, -0.2], [-0.45, 0.2], [0.45, -0.2], [0.45, 0.2]]) c.add(box(0.16, 0.45, 0.16, white, lx, 0.22, lz));
      c.position.set(x, 0, z); c.rotation.y = ry;
      return c;
    };
    const c1 = cow(0.6, 1.2, 0.5), c2 = cow(-1.8, -0.4, -2.2);
    g.add(c1, c2, palm(2.6, -1.6, 2.6), palm(-2.8, 1.8, 2.1), palm(1.4, -2.9, 1.8));
    // shed
    g.add(box(2.2, 1.1, 1.5, mat('#fff3df'), -0.6, 0.55, -2.4), box(2.5, 0.14, 1.9, mat(p.accent), -0.6, 1.2, -2.4));
    g.add(stone(3, 1.6, 1.2, '#e2cfa6'), stone(-3.2, -1.2, 1, '#e2cfa6'));
    tickers.push((t) => { c1.children[2].rotation.z = Math.sin(t * 0.9) * 0.12; });
  },

  // hungry, between two equally good piles of hay
  donkey(g, p, tickers) {
    const hay = (x, z) => {
      const h = new THREE.Group();
      h.add(cyl(0.7, 0.8, 0.7, 7, mat('#f2cf63'), 0, 0.35, 0), cyl(0.45, 0.7, 0.45, 7, mat('#f7dc82'), 0, 0.9, 0));
      h.position.set(x, 0, z);
      return h;
    };
    g.add(hay(-2.4, 0.8), hay(2.4, -0.8));
    const d = new THREE.Group(), grey = mat('#9a93a8'), dark = mat('#5b4468');
    d.add(box(1.2, 0.62, 0.52, grey, 0, 0.8, 0));
    for (const [lx, lz] of [[-0.42, -0.17], [-0.42, 0.17], [0.42, -0.17], [0.42, 0.17]]) d.add(box(0.14, 0.52, 0.14, dark, lx, 0.26, lz));
    const head = new THREE.Group();
    head.add(box(0.36, 0.5, 0.36, grey, 0, 0.3, 0), box(0.3, 0.26, 0.5, mat('#e9e3ee'), 0, 0.16, 0.24));
    head.add(box(0.09, 0.5, 0.12, grey, -0.12, 0.76, -0.04), box(0.09, 0.5, 0.12, grey, 0.12, 0.76, -0.04));
    head.position.set(0, 1.0, 0.36);
    d.add(head, box(0.08, 0.4, 0.08, dark, 0, 0.72, -0.34));
    d.rotation.y = 0.3;
    g.add(d);
    tickers.push((t) => { head.rotation.y = Math.sin(t * 0.7) * 1.1; });
    g.add(house(-0.4, -2.6, 0.9, '#fff3df', p.accent), tree(2.4, 2.2, 0.9, '#6dbb86'), bush(-2.6, -1.8, 0.9, '#8ed09a'));
  },

  campus(g, p) {
    g.add(box(4.2, 0.3, 2.6, mat('#e9e3ee'), 0, 0.15, -0.6));
    g.add(box(3.6, 1.6, 1.6, mat('#fff3df'), 0, 1.1, -0.9));
    for (let i = -2; i <= 2; i++) g.add(cyl(0.14, 0.14, 1.6, 6, mat('#ffffff'), i * 0.8, 1.1, 0.2));
    g.add(box(4.0, 0.25, 2.5, mat('#e9e3ee'), 0, 2.02, -0.5));
    const roof = part(new THREE.CylinderGeometry(0.02, 1.45, 0.9, 3), mat(p.accent), 0, 2.6, -0.5);
    roof.rotation.set(0, Math.PI / 6, 0); roof.scale.set(1.5, 1, 1.0);
    g.add(roof);
    // a stack of books
    [['#e8590c', 0], ['#2f6fed', 0.24], ['#ffc94d', 0.48]].forEach(([c, y], i) => {
      const b = box(1.1, 0.22, 0.8, mat(c), 2.9, 0.11 + y, 1.9); b.rotation.y = i * 0.3; g.add(b);
    });
    g.add(tree(-3.4, 1.8, 1, '#57a97c'), tree(3.4, -2.4, 0.9, '#63b384'), bush(-1.2, 2.8, 1, '#8ed09a'));
  },

  school(g, p) {
    g.add(house(-1, -0.8, 1.15, '#fff3df', p.accent));
    g.add(box(0.1, 1.2, 0.1, mat('#8a5a44'), 0.9, 0.6, 1.1), box(0.1, 1.2, 0.1, mat('#8a5a44'), 2.3, 0.6, 1.1));
    g.add(box(1.7, 1.0, 0.1, mat('#2f5d50'), 1.6, 1.25, 1.1));
    g.add(box(0.8, 0.05, 0.02, mat('#ffffff'), 1.45, 1.45, 1.16), box(1.1, 0.05, 0.02, mat('#ffffff'), 1.6, 1.25, 1.16), box(0.6, 0.05, 0.02, mat('#ffffff'), 1.35, 1.05, 1.16));
    g.add(tree(-2.4, 1.6, 0.85, '#6dbb86'), bush(2.2, -1.6, 0.9, '#8ed09a'));
  },

  crossroads(g, p) {
    g.add(cyl(0.08, 0.1, 2.6, 5, mat('#8a5a44'), 0, 1.3, 0));
    [['#fff7ea', 2.3, 0.4], [p.accent, 1.85, 2.3], ['#ffc94d', 1.4, 4.1], ['#ff9aa8', 0.95, 5.6]].forEach(([c, y, ry]) => {
      const arm = new THREE.Group();
      arm.add(box(1.1, 0.3, 0.08, mat(c), 0.6, 0, 0));
      arm.position.y = y; arm.rotation.y = ry;
      g.add(arm);
    });
    g.add(part(new THREE.IcosahedronGeometry(0.3, 0), glow(p.accent, 1.2), 1.7, 0.55, 1.2));
    g.add(tree(-2, -1.4, 0.85, '#6dbb86'), stone(-1.6, 1.8, 1.1, '#cdbfd6'), bush(2, -1.6, 0.9, '#8ed09a'));
  },

  // a page that is no longer there
  ghost(g, p, tickers) {
    const m = new THREE.MeshStandardMaterial({ color: '#ffffff', transparent: true, opacity: 0.45, flatShading: true, emissive: '#ffffff', emissiveIntensity: 0.25, depthWrite: false });
    const page = new THREE.Group();
    page.add(new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.0, 0.06), m));
    for (let i = 0; i < 5; i++) page.add(box(i === 4 ? 0.6 : 1.1, 0.07, 0.02, mat(p.accent), i === 4 ? -0.25 : 0, 0.6 - i * 0.3, 0.05));
    page.position.set(0, 1.8, 0);
    g.add(page);
    tickers.push((t) => { page.position.y = 1.8 + Math.sin(t * 0.8) * 0.18; page.rotation.y = Math.sin(t * 0.4) * 0.5; m.opacity = 0.38 + Math.sin(t * 0.8) * 0.1; });
    g.add(stone(-1.3, 0.9, 1, '#b8afc9'), stone(1.2, -1, 0.8, '#b8afc9'));
  },

  // ── things made at work ──
  handoff(g, p, tickers) {
    const doc = (x, color) => {
      const d = new THREE.Group();
      d.add(box(1.3, 1.8, 0.14, mat('#ffffff'), 0, 0, 0), box(1.3, 0.3, 0.16, mat(color), 0, 0.75, 0));
      for (let i = 0; i < 3; i++) d.add(box(0.9, 0.08, 0.02, mat('#c9c6d6'), -0.05, 0.25 - i * 0.3, 0.08));
      d.position.set(x, 1.2, 0); d.rotation.x = -0.12;
      return d;
    };
    g.add(doc(-1.5, '#2f6fed'), doc(1.5, '#2fb67a'));
    const bits = [];
    for (let i = 0; i < 5; i++) { const b = part(new THREE.OctahedronGeometry(0.14, 0), glow(p.accent, 1.3), 0, 1.3, 0.2); bits.push(b); g.add(b); }
    tickers.push((t) => bits.forEach((b, i) => {
      const k = (t * 0.45 + i / 5) % 1;
      b.position.set(-0.8 + k * 1.6, 1.3 + Math.sin(k * Math.PI) * 0.7, 0.2);
    }));
    g.add(stone(-2.2, 1.6, 1, '#e2c9a0'), bush(2.2, -1.6, 0.8, '#d7c26e'));
  },

  dashboard(g, p, tickers) {
    g.add(box(4.2, 0.14, 2.2, mat('#ffffff'), 0, 0.07, 0));
    const hs = [1.2, 2.3, 1.7, 3.0, 2.1], bars = [];
    hs.forEach((h, i) => {
      const b = box(0.55, 1, 0.55, mat(i === 3 ? p.accent : '#9db8f5'), (i - 2) * 0.78, 0.5, 0);
      b.userData.h = h; bars.push(b); g.add(b);
    });
    tickers.push((t) => bars.forEach((b, i) => {
      const h = b.userData.h * (0.85 + 0.15 * Math.sin(t * 0.9 + i));
      b.scale.y = h; b.position.y = 0.14 + h / 2;
    }));
    const lens = new THREE.Group();
    lens.add(part(new THREE.TorusGeometry(0.42, 0.08, 6, 14), mat('#3a3148')), cyl(0.07, 0.07, 0.7, 5, mat('#3a3148'), 0.5, -0.6, 0).rotateZ(0.7));
    lens.position.set(2.5, 1.5, 1.5);
    g.add(lens);
  },

  swarm(g, p, tickers) {
    g.add(box(1.6, 0.3, 1.2, mat('#ffffff'), 0, 0.5, 0), box(1.7, 0.12, 1.3, mat(p.accent), 0, 0.3, 0), cyl(0.5, 0.6, 0.24, 6, mat('#e9e3ee'), 0, 0.12, 0));
    const bots = [];
    for (let i = 0; i < 6; i++) {
      const b = new THREE.Group();
      b.add(box(0.34, 0.3, 0.34, mat(['#7c6cf0', '#2fb67a', '#ffc94d', '#2f6fed', '#e8590c', '#d6336c'][i])));
      b.add(box(0.2, 0.08, 0.04, glow('#ffffff', 1), 0, 0.03, 0.18));
      bots.push(b); g.add(b);
    }
    tickers.push((t) => bots.forEach((b, i) => {
      const a = t * (0.5 + (i % 3) * 0.18) * (i % 2 ? 1 : -1) + i * 1.05, r = 1.5 + (i % 3) * 0.35;
      b.position.set(Math.cos(a) * r, 1.3 + (i % 3) * 0.45 + Math.sin(t * 1.6 + i) * 0.15, Math.sin(a) * r);
      b.rotation.y = -a;
    }));
  },

  lighthouse(g, p, tickers) {
    const white = mat('#fff7ea');
    g.add(cyl(1.5, 1.8, 0.5, 8, mat('#cdbfd6'), 0.6, 0.25, -0.6));
    g.add(cyl(0.95, 1.3, 2.2, 8, white, 0.6, 1.6, -0.6));
    g.add(cyl(0.8, 0.95, 1.2, 8, mat(p.accent), 0.6, 3.3, -0.6));
    g.add(cyl(0.66, 0.8, 1.6, 8, white, 0.6, 4.7, -0.6));
    g.add(cyl(1.0, 1.0, 0.16, 8, mat('#5b4468'), 0.6, 5.58, -0.6));
    const lamp = cyl(0.5, 0.5, 0.8, 8, glow('#ffe7a8', 2.2), 0.6, 6.06, -0.6);
    lamp.castShadow = false;
    g.add(lamp);
    g.add(part(new THREE.ConeGeometry(0.85, 0.8, 8), mat(p.accent), 0.6, 6.86, -0.6));
    // sweeping beam
    const beam = new THREE.Mesh(
      new THREE.ConeGeometry(1.6, 9, 12, 1, true),
      new THREE.MeshBasicMaterial({ color: '#fff3c4', transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false })
    );
    beam.geometry.translate(0, -4.5, 0);
    beam.rotation.z = Math.PI / 2;
    const pivot = new THREE.Group();
    pivot.position.set(0.6, 6.06, -0.6);
    pivot.add(beam);
    g.add(pivot);
    tickers.push((t) => { pivot.rotation.y = t * 0.35; });
    g.add(house(-3.4, 1.4, 1.05, '#fff3df', '#7c9be8'), house(-1.6, 3.6, 0.8, '#fff3df', '#f2a65a'));
    // flag
    g.add(cyl(0.05, 0.05, 2.4, 5, mat('#5b4468'), 3.9, 1.2, 2.2));
    g.add(box(0.9, 0.5, 0.04, mat(p.accent), 4.38, 2.1, 2.2));
    g.add(tree(4.4, -2.6, 1.15, '#57a97c'), tree(-4.8, -2.4, 1, '#63b384'), tree(2.2, 4.6, 0.9, '#74c08f'));
    g.add(bush(-0.4, 5.2, 1, '#8ed09a'), stone(5.4, 0.4, 1.3, '#cdbfd6'));
  },

  telescope(g, p) {
    const legs = mat('#8a5a44');
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      const leg = cyl(0.05, 0.05, 1.5, 4, legs, Math.cos(a) * 0.35, 0.7, Math.sin(a) * 0.35);
      leg.rotation.set(Math.sin(a) * 0.45, 0, -Math.cos(a) * 0.45);
      g.add(leg);
    }
    const tube = new THREE.Group();
    tube.add(cyl(0.26, 0.18, 1.9, 8, mat(p.accent), 0, 0, 0));
    tube.add(cyl(0.3, 0.3, 0.14, 8, mat('#fff7ea'), 0, 0.95, 0));
    tube.position.set(0, 1.55, 0);
    tube.rotation.set(0, 0, -0.95);
    g.add(tube);
    g.add(signpost(-2.2, 1.4, '#fff7ea'));
    g.add(stone(2.2, 1.8, 1.4, '#d9cbe0'), stone(-1.6, -2.4, 1, '#d9cbe0'), bush(2.4, -1.8, 0.9, '#b9d9a0'));
  },

  windmill(g, p, tickers) {
    g.add(cyl(0.7, 1.25, 4.2, 8, mat('#fff7ea'), 0, 2.1, -0.4));
    g.add(part(new THREE.ConeGeometry(0.95, 1.0, 8), mat(p.accent), 0, 4.7, -0.4));
    g.add(box(0.4, 0.7, 0.06, mat('#5b4468'), 0, 0.35, 0.83));
    const rotor = new THREE.Group();
    rotor.add(cyl(0.16, 0.16, 0.5, 6, mat('#5b4468'), 0, 0, 0).rotateX(Math.PI / 2));
    for (let i = 0; i < 4; i++) {
      const arm = new THREE.Group();
      arm.add(box(0.1, 2.7, 0.06, mat('#8a5a44'), 0, 1.35, 0));
      arm.add(box(0.75, 2.0, 0.04, mat('#ffffff'), 0.42, 1.7, 0));
      arm.rotation.z = (i / 4) * Math.PI * 2;
      rotor.add(arm);
    }
    rotor.position.set(0, 3.9, 0.55);
    g.add(rotor);
    // a small spark of something new, hovering
    const orb = part(new THREE.IcosahedronGeometry(0.5, 0), glow(p.accent, 1.6), 3.2, 2.6, 1.6);
    orb.castShadow = false;
    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(0.85, 0.035, 6, 28),
      new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.85 })
    );
    orb.add(halo);
    g.add(orb);
    tickers.push((t) => {
      rotor.rotation.z = -t * 0.9;
      orb.position.y = 2.6 + Math.sin(t * 1.1) * 0.3;
      orb.rotation.y = t * 0.6;
      halo.rotation.x = Math.PI / 2 + Math.sin(t * 0.7) * 0.5;
    });
    g.add(tree(-3.6, 1.4, 1, '#5fb596'), tree(-2.4, -3.4, 0.9, '#6cc0a2'), tree(3.6, -2.8, 1.05, '#5fb596'));
    g.add(bush(-1.6, 3.6, 1, '#93d6bf'), stone(1.4, 4.2, 1.2, '#c9c6e6'));
  },

  // four levels × four functions: the grid behind the needs map
  lattice(g, p, tickers) {
    const levels = ['#ff9a76', '#ffd166', '#6ee7d8', '#b79cff'];
    const cubes = [];
    for (let y = 0; y < 4; y++)
      for (let x = 0; x < 4; x++) {
        const c = box(0.82, 0.82, 0.82, mat(levels[y], { emissive: levels[y], emissiveIntensity: 0.55, roughness: 0.4 }), (x - 1.5) * 1.02, 0.6 + y * 1.02, 0);
        c.userData.phase = x * 0.7 + y * 0.45;
        cubes.push(c);
        g.add(c);
      }
    tickers.push((t) =>
      cubes.forEach((c) => {
        c.position.z = Math.sin(t * 0.9 + c.userData.phase) * 0.28;
        c.material.emissiveIntensity = 0.9 + 0.6 * Math.sin(t * 1.3 + c.userData.phase);
      })
    );
    g.add(box(4.6, 0.16, 1.6, mat('#3d4a78'), 0, 0.08, 0));
    for (const [x, z] of [[-3.4, 2.2], [3.3, 2.4], [3.6, -2.2], [-3.2, -2.6]])
      g.add(part(new THREE.OctahedronGeometry(0.34, 0), glow(p.accent, 0.9), x, 0.5, z));
  },

  // the key, and the door left open
  key(g, p, tickers) {
    const wood = mat('#6b5846'), gold = mat(p.accent, { roughness: 0.45, metalness: 0.35 });
    g.add(box(0.22, 3.0, 0.22, wood, -2.1, 1.5, -0.6), box(0.22, 3.0, 0.22, wood, -0.5, 1.5, -0.6));
    g.add(box(1.82, 0.22, 0.22, wood, -1.3, 3.1, -0.6));
    const door = new THREE.Group();
    door.add(box(1.36, 2.86, 0.1, mat('#b8482e'), 0.68, 1.45, 0));
    door.add(part(new THREE.SphereGeometry(0.09, 6, 5), gold, 1.14, 1.4, 0.1));
    door.position.set(-1.98, 0, -0.6);
    door.rotation.y = 0.9;
    g.add(door);
    const key = new THREE.Group();
    key.add(part(new THREE.TorusGeometry(0.5, 0.15, 6, 10), gold, 0, 2.5, 0));
    key.add(cyl(0.11, 0.11, 1.9, 6, gold, 0, 1.05, 0));
    key.add(box(0.5, 0.16, 0.14, gold, 0.28, 0.5, 0), box(0.36, 0.16, 0.14, gold, 0.22, 0.2, 0));
    key.position.set(1.8, 0.5, 0.8);
    g.add(key);
    tickers.push((t) => {
      key.rotation.y = t * 0.5;
      key.position.y = 0.55 + Math.sin(t) * 0.18;
    });
    g.add(tree(2.6, -2.4, 0.9, '#c9a24a', '#6b5846'), stone(-2.8, 2.2, 1.2, '#cdbfa8'), bush(0.2, 3, 0.9, '#d8c389'));
  },

  // the map within the map
  blueprint(g, p, tickers) {
    const leg = mat('#e8eefc');
    for (const [x, z] of [[-1.4, -0.9], [1.4, -0.9], [-1.4, 0.9], [1.4, 0.9]])
      g.add(cyl(0.07, 0.07, 1.1, 5, leg, x, 0.55, z));
    const top = box(3.4, 0.14, 2.4, mat('#1d47a8'), 0, 1.2, 0);
    g.add(top);
    for (let i = -2; i <= 2; i++) {
      g.add(box(3.3, 0.02, 0.03, glow('#9fc0ff', 0.8), 0, 1.285, i * 0.5));
      g.add(box(0.03, 0.02, 2.3, glow('#9fc0ff', 0.8), i * 0.72, 1.285, 0));
    }
    const minis = [];
    [[-0.9, 0.3, '#a9dba8'], [0.2, -0.4, '#ffc94d'], [1.0, 0.5, '#ff8a6b']].forEach(([x, z, c], i) => {
      const m = new THREE.Group();
      m.add(cyl(0.36, 0.34, 0.12, 6, mat(c), 0, 0, 0));
      m.add(part(new THREE.ConeGeometry(0.3, 0.42, 6), mat('#e8eefc'), 0, -0.27, 0).rotateX(Math.PI));
      m.position.set(x, 2.1, z);
      minis.push(m);
      g.add(m);
      tickers.push((t) => { m.position.y = 2.1 + i * 0.25 + Math.sin(t * 1.2 + i * 2) * 0.14; });
    });
    g.add(part(new THREE.OctahedronGeometry(0.3, 0), glow('#ffffff', 0.7), -3, 0.5, 1.8));
    g.add(part(new THREE.OctahedronGeometry(0.24, 0), glow('#9fc0ff', 0.9), 2.9, 0.4, -1.9));
  },

  // an empty plot waiting for the next creation
  plot(g, p, tickers) {
    const n = 14, r = 1.9;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const d = box(0.5, 0.06, 0.12, mat('#ffffff'), Math.cos(a) * r, 0.04, Math.sin(a) * r);
      d.rotation.y = -a + Math.PI / 2;
      g.add(d);
    }
    const sprout = new THREE.Group();
    sprout.add(cyl(0.04, 0.05, 0.5, 5, mat('#6dbb86'), 0, 0.25, 0));
    const l1 = part(new THREE.SphereGeometry(0.2, 5, 4), mat('#7cc98a'), 0.17, 0.52, 0);
    const l2 = part(new THREE.SphereGeometry(0.2, 5, 4), mat('#7cc98a'), -0.17, 0.52, 0);
    l1.scale.set(1, 0.45, 0.7); l2.scale.set(1, 0.45, 0.7);
    l1.rotation.z = 0.5; l2.rotation.z = -0.5;
    sprout.add(l1, l2);
    g.add(sprout);
    const plus = new THREE.Group();
    plus.add(box(0.7, 0.18, 0.18, glow(p.accent, 0.8)), box(0.18, 0.7, 0.18, glow(p.accent, 0.8)));
    plus.position.set(0, 2, 0);
    g.add(plus);
    tickers.push((t) => {
      plus.rotation.y = t * 0.8;
      plus.position.y = 2 + Math.sin(t * 1.4) * 0.15;
    });
  },
};

// ───────────────────────── island base ─────────────────────────
export function buildIsland(def, tickers) {
  const g = new THREE.Group();
  const r = def.radius ?? 6;
  const n = 6;
  const p = def.palette;

  g.add(cyl(r, r * 0.97, 0.5, n, mat(p.top), 0, -0.25, 0));
  g.add(cyl(r * 0.97, r * 0.8, 1.0, n, mat(p.earth), 0, -1.0, 0));
  const h = r * 0.95;
  const rock = new THREE.CylinderGeometry(r * 0.8, r * 0.1, h, n, 3);
  jitter(rock, r * 0.16, h / 2 - 0.01);
  g.add(part(rock, mat(p.rock), 0, -1.5 - h / 2, 0));

  // a couple of loose rocks drifting underneath
  const rand = rng(def.id);
  for (let i = 0; i < 3; i++) {
    const a = rand() * Math.PI * 2, d = r * (0.35 + rand() * 0.5);
    const s = part(new THREE.DodecahedronGeometry(r * (0.05 + rand() * 0.05), 0), mat(p.rock),
      Math.cos(a) * d, -h * (0.75 + rand() * 0.5) - 1.5, Math.sin(a) * d);
    const ph = rand() * 6;
    tickers.push((t) => { s.position.y += Math.sin(t * 0.7 + ph) * 0.0025; s.rotation.y = t * 0.2 + ph; });
    g.add(s);
  }

  const build = LANDMARKS[def.landmark];
  if (build) build(g, p, tickers);
  g.rotation.y = Math.PI / 6; // a flat edge faces the viewer: reads more like a diagram
  return g;
}

// ───────────────────────── sky furniture ─────────────────────────
export function buildCloud(seed) {
  const rand = rng('cloud' + seed);
  const g = new THREE.Group();
  const m = new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#fff1ec', emissiveIntensity: 0.62, flatShading: true, roughness: 1, transparent: true, opacity: 0.8 });
  const n = 3 + Math.floor(rand() * 3);
  for (let i = 0; i < n; i++) {
    const s = 1.2 + rand() * 1.6;
    const puff = new THREE.Mesh(new THREE.IcosahedronGeometry(s, 0), m);
    puff.position.set((i - n / 2) * 1.9 + rand(), rand() * 0.5, rand() * 1.6 - 0.8);
    puff.scale.y = 0.6;
    puff.rotation.set(rand() * 3, rand() * 3, 0);
    g.add(puff);
  }
  return g;
}

export function buildPaperPlane(color = '#ffffff') {
  const geo = new THREE.BufferGeometry();
  // nose at +z; two wings and a keel
  const v = [
    0, 0, 1.2, -0.9, 0.12, -0.9, 0, 0, -0.7,
    0, 0, 1.2, 0, 0, -0.7, 0.9, 0.12, -0.9,
    0, 0, 1.2, 0, 0, -0.7, 0, -0.38, -0.8,
  ];
  geo.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, flatShading: true, side: THREE.DoubleSide, roughness: 0.8 }));
  m.castShadow = true;
  return m;
}

export function buildBird() {
  const g = new THREE.Group();
  const m = new THREE.MeshBasicMaterial({ color: '#3a3148', side: THREE.DoubleSide, transparent: true });
  const wing = (sx) => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0.18, 0, 0, -0.18, sx * 0.7, 0, -0.1], 3));
    const w = new THREE.Mesh(geo, m);
    g.add(w);
    return w;
  };
  g.userData.wings = [wing(1), wing(-1)];
  g.userData.mat = m;
  return g;
}
