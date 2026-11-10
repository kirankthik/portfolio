// The islands view. Loaded on demand by app.js.
import * as THREE from 'three';
import { OrbitControls } from '../vendor/OrbitControls.js';
import { EffectComposer } from '../vendor/postprocessing/EffectComposer.js';
import { RenderPass } from '../vendor/postprocessing/RenderPass.js';
import { ShaderPass } from '../vendor/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from '../vendor/postprocessing/UnrealBloomPass.js';
import { OutputPass } from '../vendor/postprocessing/OutputPass.js';
import world from '../data/world.js';
import { buildIsland, buildCloud, buildPaperPlane, buildBird, GLOWS } from './islands.js';

const $ = (s) => document.querySelector(s);
const el = (tag, attrs = {}, ...kids) => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') n.className = v;
    else if (k === 'text') n.textContent = v;
    else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v);
  }
  n.append(...kids.filter(Boolean));
  return n;
};
const root = document.documentElement;
const params = new URLSearchParams(location.search);
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
const KIND_LABEL = { chapter: 'Career', force: 'Turning point', creation: 'Creation', frontier: 'Ahead', plot: 'Open plot' };
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOutBack = (t) => 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2);

$('#who-name').textContent = world.person.name;
$('#who-headline').textContent = world.person.headline;
$('#who-tagline').textContent = world.person.tagline ?? '';
for (const l of world.person.links ?? [])
  $('#who-links').append(el('a', { href: l.href, target: '_blank', rel: 'noopener', text: l.label }));

// ───────────────────────── renderer ─────────────────────────
const canvas = $('#world');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.info.autoReset = false;

const scene = new THREE.Scene();
const VIEW_H = 64;
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1200);
const ISO = new THREE.Vector3(1, 0.86, 1).normalize();
const HOME = new THREE.Vector3(-5, 5, -5);
const HOME_ERA = 0.72;
camera.position.copy(HOME).addScaledVector(ISO, 400);

const hemi = new THREE.HemisphereLight('#fff4e6', '#d9a9c9', 1.25);
const sun = new THREE.DirectionalLight('#ffe1b8', 2.3);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -80, right: 80, top: 80, bottom: -80, near: 1, far: 320 });
sun.shadow.bias = -0.0006;
sun.shadow.normalBias = 0.04;
scene.add(hemi, sun, sun.target);

const controls = new OrbitControls(camera, canvas);
controls.target.copy(HOME);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.screenSpacePanning = false;
controls.mouseButtons = { LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.ROTATE };
controls.touches = { ONE: THREE.TOUCH.PAN, TWO: THREE.TOUCH.DOLLY_ROTATE };
controls.minPolarAngle = THREE.MathUtils.degToRad(38);
controls.maxPolarAngle = THREE.MathUtils.degToRad(68);
controls.minZoom = 0.22;
controls.maxZoom = 3.6;
controls.zoomToCursor = true;
controls.panSpeed = 1.1;

// ───────────────────────── the sky keeps time ─────────────────────────
// One shader. Its hour ("era") follows where you are on the trail: 0 night, 0.72 dawn, 1 morning.
const C = (h) => new THREE.Color(h);
const SKY_KEYS = [
  { at: 0.0, top: C('#060a22'), mid: C('#131848'), hor: C('#2b2a66'), cloud: C('#2c3170'), glow: C('#cfd8ff'), glowPos: [0.8, 0.84], glowSize: 0.034, glowI: 0.8, stars: 1.0, night: 1.0, sun: C('#a9bbff'), sunI: 1.15, sunPos: [55, 85, -30], hemiSky: C('#8f9ee0'), hemiGround: C('#322c5e'), hemiI: 0.98 },
  { at: 0.36, top: C('#0d1136'), mid: C('#2a2468'), hor: C('#6d3f80'), cloud: C('#4a3f86'), glow: C('#d8d4ff'), glowPos: [0.74, 0.7], glowSize: 0.034, glowI: 0.7, stars: 0.9, night: 0.9, sun: C('#b0b6ff'), sunI: 1.1, sunPos: [45, 75, -20], hemiSky: C('#9797dc'), hemiGround: C('#3f2f62'), hemiI: 0.98 },
  { at: 0.56, top: C('#2a3884'), mid: C('#7d5ca8'), hor: C('#f39284'), cloud: C('#f0a6a8'), glow: C('#ffb08a'), glowPos: [0.16, -0.06], glowSize: 0.3, glowI: 0.55, stars: 0.3, night: 0.42, sun: C('#ffb48a'), sunI: 1.5, sunPos: [-75, 38, 30], hemiSky: C('#cdb9ea'), hemiGround: C('#7a4f7a'), hemiI: 0.98 },
  { at: 0.72, top: C('#8ea2e6'), mid: C('#e6b9d4'), hor: C('#ffe0b4'), cloud: C('#fff1e6'), glow: C('#fff3d0'), glowPos: [0.16, 0.0], glowSize: 0.4, glowI: 0.5, stars: 0.0, night: 0.0, sun: C('#ffe1b8'), sunI: 2.3, sunPos: [-68, 70, 30], hemiSky: C('#fff4e6'), hemiGround: C('#d9a9c9'), hemiI: 1.25 },
  { at: 1.0, top: C('#3f9be8'), mid: C('#96cff5'), hor: C('#f6f1dc'), cloud: C('#ffffff'), glow: C('#fffbe8'), glowPos: [0.2, 1.02], glowSize: 0.5, glowI: 0.42, stars: 0.0, night: 0.0, sun: C('#fff3da'), sunI: 2.55, sunPos: [-45, 105, 25], hemiSky: C('#ffffff'), hemiGround: C('#b9d6c0'), hemiI: 1.3 },
];
const now = { top: C(0), mid: C(0), hor: C(0), cloud: C(0), glow: C(0), sun: C(0), hemiSky: C(0), hemiGround: C(0), glowPos: [0, 0], sunPos: [0, 0, 0], glowSize: 0, glowI: 0, stars: 0, night: 0, sunI: 0, hemiI: 0 };
function sampleSky(e) {
  let i = 0;
  while (i < SKY_KEYS.length - 2 && e > SKY_KEYS[i + 1].at) i++;
  const a = SKY_KEYS[i], b = SKY_KEYS[i + 1];
  const t = smooth(a.at, b.at, e);
  for (const k of Object.keys(now)) {
    if (now[k].isColor) now[k].copy(a[k]).lerp(b[k], t);
    else if (Array.isArray(now[k])) for (let j = 0; j < now[k].length; j++) now[k][j] = a[k][j] + (b[k][j] - a[k][j]) * t;
    else now[k] = a[k] + (b[k] - a[k]) * t;
  }
}

const skyMat = new THREE.ShaderMaterial({
  depthTest: false,
  depthWrite: false,
  uniforms: {
    uTop: { value: now.top }, uMid: { value: now.mid }, uHor: { value: now.hor }, uCloud: { value: now.cloud }, uGlowCol: { value: now.glow },
    uGlowPos: { value: new THREE.Vector2() }, uOff: { value: new THREE.Vector2() }, uRes: { value: new THREE.Vector2(1, 1) },
    uGlowSize: { value: 0.3 }, uGlowI: { value: 0.5 }, uStars: { value: 0 }, uTime: { value: 0 },
  },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.9999, 1.0); }',
  fragmentShader: `
    uniform vec3 uTop, uMid, uHor, uCloud, uGlowCol;
    uniform vec2 uGlowPos, uOff, uRes;
    uniform float uGlowSize, uGlowI, uStars, uTime;
    varying vec2 vUv;
    float hash(vec2 p){ vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
    float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + 1.0), f.x), f.y); }
    float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ v += a * noise(p); p = p * 2.02 + vec2(17.0, 9.0); a *= 0.5; } return v; }
    void main(){
      float y = vUv.y, asp = uRes.x / uRes.y;
      vec2 p = vec2(vUv.x * asp, y);
      vec3 col = mix(uHor, uMid, smoothstep(0.0, 0.52, y));
      col = mix(col, uTop, smoothstep(0.36, 1.0, y));
      float d = distance(p, vec2(uGlowPos.x * asp, uGlowPos.y));
      col += uGlowCol * uGlowI * (exp(-d * d / (uGlowSize * uGlowSize)) + 0.4 * exp(-d / (uGlowSize * 2.4)));
      vec2 q = p * vec2(1.5, 3.4) + uOff * 0.018 + vec2(uTime * 0.006, 0.0);
      float c = fbm(q + fbm(q * 1.7 + uTime * 0.012));
      float band = smoothstep(0.44, 0.8, c) * (0.2 + 0.8 * smoothstep(1.0, 0.05, y));
      col = mix(col, uCloud, band * 0.5);
      if (uStars > 0.001) {
        vec2 g = (p + uOff * 0.0035) * 46.0;
        vec2 id = floor(g), f = fract(g) - 0.5;
        float h = hash(id);
        vec2 o = (vec2(fract(h * 91.7), fract(h * 57.3)) - 0.5) * 0.7;
        float size = 0.035 + 0.075 * fract(h * 37.1);
        float s = step(0.72, h) * smoothstep(size, 0.0, length(f - o));
        s *= 0.55 + 0.45 * sin(uTime * (0.8 + fract(h * 13.0) * 2.6) + h * 40.0);
        col += vec3(1.0, 0.96, 0.9) * s * uStars * 2.2 * (1.0 - band) * smoothstep(0.02, 0.45, y);
      }
      gl_FragColor = vec4(col, 1.0);
      #include <colorspace_fragment>
    }`,
});
const sky = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), skyMat);
sky.frustumCulled = false;
sky.renderOrder = -1000;
scene.add(sky);

// ───────────────────────── islands ─────────────────────────
const tickers = [];
const islands = new Map();
const tour = world.tour.filter((id) => world.islands.some((d) => d.id === id));
world.islands.forEach((def, i) => {
  const group = buildIsland(def, tickers);
  const [x, y, z] = def.position;
  group.position.set(x, y, z);
  group.userData.islandId = def.id;
  scene.add(group);
  const top = new THREE.Box3().setFromObject(group).max.y - y;
  const label = el('button', { class: `label kind-${def.kind}`, type: 'button', 'aria-label': `${def.title}. ${KIND_LABEL[def.kind]}`, onclick: () => select(def.id) },
    el('span', { class: 'label-kicker', text: def.kicker ?? KIND_LABEL[def.kind] }),
    el('span', { class: 'label-title', text: def.title }));
  label.style.setProperty('--accent', def.palette.accent);
  $('#labels').append(label);
  const rank = { force: 0, frontier: 1, chapter: 2, creation: 3, plot: 5 }[def.kind] - (def.radius > 6 ? 3 : 0);
  const order = tour.indexOf(def.id);
  islands.set(def.id, { def, group, label, baseY: y, phase: i * 1.37, top: Math.min(top, 9) + 1.1, rank, w: 0, h: 0, order, intro: 1, delay: (order < 0 ? tour.length : order) * 0.13 });
});

const stones = [];
const sparks = [];
for (const path of world.paths) {
  const a = islands.get(path.from), b = islands.get(path.to);
  if (!a || !b) continue;
  const pa = a.group.position, pb = b.group.position;
  const dir = new THREE.Vector3(pb.x - pa.x, 0, pb.z - pa.z).normalize();
  const start = pa.clone().addScaledVector(dir, a.def.radius * 0.9);
  const end = pb.clone().addScaledVector(dir, -b.def.radius * 0.9);
  const mid = start.clone().lerp(end, 0.5);
  const len = start.distanceTo(end);
  if (path.style === 'stones') {
    mid.y += 0.6;
    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    const n = Math.max(2, Math.round(len / 1.7));
    for (let i = 1; i <= n; i++) {
      const t = i / (n + 1);
      const p = curve.getPoint(t);
      p.y -= 0.15;
      stones.push({ p, t, a, b });
    }
  } else {
    mid.y += 3 + len * 0.12;
    start.y += 2.4;
    const curve = new THREE.QuadraticBezierCurve3(start, mid, end.setY(end.y + 0.6));
    const n = Math.round(len / 1.5);
    const color = new THREE.Color(b.def.palette.accent).multiplyScalar(1.5);
    for (let i = 0; i < n; i++) sparks.push({ curve, offset: i / n, b, color });
  }
}
// one draw call each for all the stepping stones and all the sparks
const stoneMat = new THREE.MeshStandardMaterial({ color: '#fff3df', flatShading: true, roughness: 0.9, emissive: '#ffd9a0', emissiveIntensity: 0 });
const stoneMesh = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.5, 0.42, 0.2, 6), stoneMat, stones.length);
stoneMesh.castShadow = stoneMesh.receiveShadow = true;
stoneMesh.frustumCulled = false;
const sparkMesh = new THREE.InstancedMesh(new THREE.OctahedronGeometry(0.2, 0), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.9 }), sparks.length);
sparkMesh.frustumCulled = false;
sparks.forEach((sp, i) => sparkMesh.setColorAt(i, sp.color));
scene.add(stoneMesh, sparkMesh);
const M = new THREE.Matrix4(), Qn = new THREE.Quaternion(), S = new THREE.Vector3(), P = new THREE.Vector3(), UP = new THREE.Vector3(0, 1, 0);

// ───────────────────────── sky furniture ─────────────────────────
const clouds = [];
for (let i = 0; i < 16; i++) {
  const c = buildCloud(i);
  const below = i % 3 !== 0;
  c.position.set(-90 + ((i * 53) % 180), below ? -12 - (i % 5) * 3 : 16 + (i % 4) * 2, -70 + ((i * 37) % 150));
  c.scale.setScalar(below ? 0.9 + (i % 3) * 0.3 : 0.6);
  c.userData.speed = 0.5 + (i % 4) * 0.22;
  scene.add(c);
  clouds.push(c);
}
const cloudMats = new Set();
clouds.forEach((c) => c.traverse((o) => o.material && cloudMats.add(o.material)));

// one plane travels with you; the others just wander
const traveller = buildPaperPlane('#ffffff');
traveller.scale.setScalar(1.25);
traveller.position.set(-30, 14, -20);
scene.add(traveller);
const wanderers = [
  { m: buildPaperPlane('#fff0c9'), c: [18, 15, 22], rx: 22, rz: 30, sp: -0.12, ph: 2 },
  { m: buildPaperPlane('#ffd9d0'), c: [4, 10, -6], rx: 44, rz: 14, sp: 0.1, ph: 4 },
];
wanderers.forEach((p) => scene.add(p.m));

const birds = [];
for (let i = 0; i < 9; i++) {
  const b = buildBird();
  const row = Math.ceil(i / 2), side = i % 2 ? 1 : -1;
  b.userData.off = new THREE.Vector3(i ? side * row * 1.5 : 0, Math.sin(i * 2.1) * 0.5, -row * 1.7);
  scene.add(b);
  birds.push(b);
}

// fireflies come out at night
const FLY_N = 320;
const flyPos = new Float32Array(FLY_N * 3), flySeed = new Float32Array(FLY_N);
const isl = [...islands.values()];
for (let i = 0; i < FLY_N; i++) {
  const it = isl[i % isl.length], a = Math.random() * Math.PI * 2, r = it.def.radius * (0.2 + Math.random() * 1.15);
  flyPos.set([it.group.position.x + Math.cos(a) * r, it.baseY + 0.4 + Math.random() * 4.5, it.group.position.z + Math.sin(a) * r], i * 3);
  flySeed[i] = Math.random() * 100;
}
const flyGeo = new THREE.BufferGeometry();
flyGeo.setAttribute('position', new THREE.BufferAttribute(flyPos, 3));
flyGeo.setAttribute('seed', new THREE.BufferAttribute(flySeed, 1));
const flyMat = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  uniforms: { uTime: { value: 0 }, uNight: { value: 0 }, uSize: { value: 6 } },
  vertexShader: `attribute float seed; uniform float uTime, uSize; varying float vA;
    void main(){ vec3 p = position; p.x += sin(uTime * 0.5 + seed) * 0.6; p.y += sin(uTime * 0.7 + seed * 1.7) * 0.5; p.z += cos(uTime * 0.4 + seed * 2.3) * 0.6;
      vA = 0.35 + 0.65 * (0.5 + 0.5 * sin(uTime * (1.0 + fract(seed) * 2.0) + seed * 6.0));
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); gl_PointSize = uSize * (0.6 + 0.8 * fract(seed * 7.3)); }`,
  fragmentShader: `uniform float uNight; varying float vA;
    void main(){ float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.0, d); gl_FragColor = vec4(vec3(1.9, 1.6, 0.8) * a * a * vA * uNight, 1.0); }`,
});
const fireflies = new THREE.Points(flyGeo, flyMat);
fireflies.frustumCulled = false;
scene.add(fireflies);

// ───────────────────────── lens: bloom + tilt-shift, with a fallback ─────────────────────────
const TiltShift = {
  uniforms: { tDiffuse: { value: null }, uDir: { value: new THREE.Vector2() }, uRadius: { value: 1 }, uFocus: { value: 0.3 }, uFinish: { value: 0 }, uTime: { value: 0 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: `uniform sampler2D tDiffuse; uniform vec2 uDir; uniform float uRadius, uFocus, uFinish, uTime; varying vec2 vUv;
    float hash(vec2 p){ vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
    void main(){
      // 13 taps, never more than ~2 px apart, so points of light blur into discs and not into a grid
      float a = smoothstep(uFocus, 1.0, abs(vUv.y - 0.5) * 2.0);
      vec2 s = uDir * uRadius * a;
      vec4 c = vec4(0.0);
      float ws = 0.0;
      for (int i = -6; i <= 6; i++) {
        float w = exp(-float(i * i) / 16.0);
        c += texture2D(tDiffuse, vUv + s * float(i)) * w;
        ws += w;
      }
      c /= ws;
      if (uFinish > 0.5) {
        vec2 v = (vUv - 0.5) * vec2(1.05, 1.0);
        c.rgb *= 1.0 - 0.34 * pow(length(v) * 1.35, 3.0);
        c.rgb += (hash(gl_FragCoord.xy + fract(uTime) * 61.0) - 0.5) * 0.012;
      }
      gl_FragColor = c;
    }`,
};
let composer = null, bloom = null, tiltH = null, tiltV = null;
function buildComposer() {
  const rt = new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType, samples: 4 });
  composer = new EffectComposer(renderer, rt);
  composer.addPass(new RenderPass(scene, camera));
  bloom = new UnrealBloomPass(new THREE.Vector2(4, 4), 0.4, 0.75, 1.3);
  tiltH = new ShaderPass(TiltShift);
  tiltV = new ShaderPass(TiltShift);
  tiltV.uniforms.uFinish.value = 1;
  composer.addPass(bloom);
  composer.addPass(tiltH);
  composer.addPass(tiltV);
  composer.addPass(new OutputPass());
}
// quality: 2 = lens effects + shadows, 1 = shadows only, 0 = neither. It steps down by itself if frames run slow.
const pinned = params.has('q');
let quality = pinned ? +params.get('q') : (innerWidth < 760 && (navigator.hardwareConcurrency ?? 8) <= 4 ? 1 : 2);
let slowFor = 0;
function applyQuality() {
  if (quality >= 2 && !composer) { try { buildComposer(); } catch (e) { console.warn(e); quality = 1; } }
  renderer.shadowMap.enabled = quality >= 1;
  sun.castShadow = quality >= 1;
  scene.traverse((o) => { if (o.material) o.material.needsUpdate = true; });
  resize();
}

// ───────────────────────── camera moves ─────────────────────────
let flight = null;
function flyTo(target, zoom, ms = 1200) {
  const offset = camera.position.clone().sub(controls.target);
  if (calm) ms = 0;
  flight = { from: controls.target.clone(), to: target.clone(), z0: camera.zoom, z1: zoom, offset, t0: performance.now(), ms };
}
function stepFlight(t) {
  if (!flight) return;
  const k = flight.ms ? Math.min(1, (t - flight.t0) / flight.ms) : 1;
  const e = easeInOut(k);
  controls.target.lerpVectors(flight.from, flight.to, e);
  camera.position.copy(controls.target).add(flight.offset);
  // dip out a little mid-flight so long hops read as travel
  const dip = 1 - 0.22 * Math.sin(Math.PI * k) * Math.min(1, flight.from.distanceTo(flight.to) / 40);
  camera.zoom = (flight.z0 + (flight.z1 - flight.z0) * e) * dip;
  camera.updateProjectionMatrix();
  if (k >= 1) flight = null;
}
const userTook = () => { flight = null; stopTour(); finishIntro(); };
canvas.addEventListener('pointerdown', userTook, true);
canvas.addEventListener('wheel', userTook, { capture: true, passive: true });

const isNarrow = () => innerWidth < 760;
function homeZoom() {
  const viewW = (VIEW_H * innerWidth) / innerHeight;
  return THREE.MathUtils.clamp(viewW / 116, 0.5, 1.0);
}
function goHome() {
  stopTour();
  closePanel();
  flyTo(HOME, homeZoom(), 1500);
}

// ───────────────────────── selection, panel, timeline, tour ─────────────────────────
let selected = null;
const panel = $('#panel');
function select(id, { push = true, keepTour = false } = {}) {
  const it = islands.get(id);
  if (!it) return;
  if (!keepTour) stopTour();
  finishIntro();
  selected = id;
  for (const o of islands.values()) o.label.classList.toggle('is-active', o === it);
  renderPanel(it);
  panel.hidden = false;
  root.classList.add('panel-open');
  requestAnimationFrame(() => panel.classList.add('is-open'));
  if (push) history.replaceState(null, '', `${location.pathname}?v=map#${id}`);
  markTimeline();

  const zoom = isNarrow() ? 1.15 : 1.9;
  const target = it.group.position.clone();
  target.y = it.baseY + 2;
  const unitsPerPx = VIEW_H / zoom / innerHeight;
  const right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0);
  const up = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1);
  if (isNarrow()) target.addScaledVector(up, -innerHeight * 0.2 * unitsPerPx);
  else target.addScaledVector(right, 210 * unitsPerPx);
  flyTo(target, zoom, 1500);
  dismissHint();
}
function closePanel() {
  selected = null;
  panel.classList.remove('is-open');
  root.classList.remove('panel-open');
  for (const o of islands.values()) o.label.classList.remove('is-active');
  history.replaceState(null, '', `${location.pathname}?v=map`);
  markTimeline();
  setTimeout(() => { if (!selected) panel.hidden = true; }, 350);
}
function step(dir) {
  const i = selected ? tour.indexOf(selected) : -1;
  const next = i < 0 ? (dir > 0 ? 0 : tour.length - 1) : i + dir;
  if (next < 0 || next >= tour.length) return false;
  select(tour[next], { keepTour: tourOn });
  return true;
}
function renderPanel(it) {
  const def = it.def;
  panel.style.setProperty('--accent', def.palette.accent);
  panel.style.setProperty('--tint', def.palette.top);
  const out = [];
  if (def.period) out.push(el('p', { class: 'period', text: def.period }));
  for (const p of def.body ?? []) out.push(el('p', { text: p }));
  if (def.highlights?.length) out.push(el('ul', {}, ...def.highlights.map((h) => el('li', { text: h }))));
  for (const sec of def.sections ?? []) {
    out.push(el('h3', { class: 'sec', text: sec.heading }));
    out.push(el('ul', { class: 'works' }, ...sec.items.map((w) => el('li', {},
      w.href ? el('a', { href: w.href, target: '_blank', rel: 'noopener', text: w.title }) : el('strong', { text: w.title }),
      w.note ? el('span', { text: w.note }) : null))));
  }
  if (def.tags?.length) out.push(el('div', { class: 'tags' }, ...def.tags.map((t) => el('span', { text: t }))));
  if (def.href) out.push(el('a', { class: 'cta', href: def.href, text: `${def.cta ?? 'Step inside'} →` }));
  const i = it.order;
  const nav = i < 0 ? null : el('nav', { class: 'panel-nav', 'aria-label': 'Along the trail' },
    i > 0 ? el('button', { type: 'button', class: 'prev', onclick: () => step(-1) }, el('small', { text: '← Before' }), el('span', { text: islands.get(tour[i - 1]).def.title })) : el('span'),
    i < tour.length - 1 ? el('button', { type: 'button', class: 'next', onclick: () => step(1) }, el('small', { text: 'Next →' }), el('span', { text: islands.get(tour[i + 1]).def.title })) : el('span'));
  $('#panel-body').replaceChildren(
    el('p', { class: 'kicker' }, el('span', { text: def.kicker ?? KIND_LABEL[def.kind] }), i < 0 ? null : el('span', { class: 'count', text: `${String(i + 1).padStart(2, '0')} / ${tour.length}` })),
    el('h2', { id: 'panel-title', text: def.title }),
    ...out, nav);
  panel.scrollTop = 0;
}
$('#panel-close').addEventListener('click', () => { stopTour(); closePanel(); });

// timeline
const ticks = [];
const ICON = {
  home: '<svg viewBox="0 0 24 24"><path d="M12 4l7 3.500v2L12 13 5 9.500v-2z M5 9.500l7 9 7-9"/></svg>'.replace(/\.500/g, '.5'),
  play: '<svg viewBox="0 0 24 24"><path class="i-play" d="M8 5l11 7-11 7z"/><path class="i-pause" d="M8 5v14M16 5v14"/></svg>',
  prev: '<svg viewBox="0 0 24 24"><path d="M14 6l-6 6 6 6"/></svg>',
  next: '<svg viewBox="0 0 24 24"><path d="M10 6l6 6-6 6"/></svg>',
};
const btn = (cls, label, svg, onclick) => { const b = el('button', { type: 'button', class: cls, 'aria-label': label, title: label, onclick }); b.innerHTML = svg; return b; };
const tourBtn = btn('tl-btn tl-tour', 'Fly the whole trail', ICON.play, () => (tourOn ? stopTour() : startTour()));
tourBtn.append(el('span', { class: 'tl-word', text: 'Tour' }));
{
  const track = el('ol', { class: 'tl-track' });
  let lastYear = '';
  tour.forEach((id, i) => {
    const def = islands.get(id).def;
    const b = el('button', { type: 'button', class: `tl-tick kind-${def.kind}`, 'aria-label': def.title, onclick: () => select(id) }, el('i'), el('b', { text: def.title }));
    b.style.setProperty('--accent', def.palette.accent);
    const li = el('li', {}, b);
    if (def.year && def.year !== lastYear) { li.append(el('span', { class: 'tl-year', text: def.year })); lastYear = def.year; }
    track.append(li);
    ticks.push(b);
  });
  // drag along the track to scrub through the years
  let scrubbing = false;
  const scrub = (e) => {
    const r = track.getBoundingClientRect();
    const i = Math.round(clamp01((e.clientX - r.left) / r.width) * (tour.length - 1));
    if (tour[i] !== selected) select(tour[i]);
  };
  track.addEventListener('pointerdown', (e) => { scrubbing = true; track.setPointerCapture(e.pointerId); scrub(e); });
  track.addEventListener('pointermove', (e) => scrubbing && scrub(e));
  track.addEventListener('pointerup', () => { scrubbing = false; });
  track.addEventListener('pointercancel', () => { scrubbing = false; });
  $('#timeline').append(
    btn('tl-btn', 'Whole map', ICON.home, goHome),
    btn('tl-btn tl-step', 'Previous', ICON.prev, () => step(-1)),
    track,
    btn('tl-btn tl-step', 'Next', ICON.next, () => step(1)),
    tourBtn);
}
function markTimeline() {
  const i = selected ? tour.indexOf(selected) : -1;
  ticks.forEach((b, k) => { b.classList.toggle('is-on', k === i); b.classList.toggle('is-past', i >= 0 && k < i); });
}

// tour: flies the trail by itself until you touch anything
let tourOn = false, tourClock = 0;
const TOUR_STOP = 7.5;
function startTour() {
  tourOn = true;
  tourClock = 0;
  tourBtn.classList.add('is-playing');
  if (!selected || tour.indexOf(selected) === tour.length - 1) select(tour[0], { keepTour: true });
}
function stopTour() {
  if (!tourOn) return;
  tourOn = false;
  tourBtn.classList.remove('is-playing');
  tourBtn.style.setProperty('--p', 0);
}
addEventListener('keydown', (e) => {
  if (!root.classList.contains('view-map') || e.target.closest('input, textarea')) return;
  if (e.key === 'Escape') { if ($('#colophon') && !$('#colophon').hidden) return; stopTour(); closePanel(); }
  else if (e.key === 'ArrowRight') { stopTour(); step(1); }
  else if (e.key === 'ArrowLeft') { stopTour(); step(-1); }
});

// ───────────────────────── picking ─────────────────────────
const raycaster = new THREE.Raycaster();
const ndc = new THREE.Vector2();
const groups = isl.map((o) => o.group);
function pick(ev) {
  const r = canvas.getBoundingClientRect();
  ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
  raycaster.setFromCamera(ndc, camera);
  let o = raycaster.intersectObjects(groups, true)[0]?.object;
  while (o && !o.userData.islandId) o = o.parent;
  return o?.userData.islandId ?? null;
}
let down = null, hovered = null;
canvas.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY, t: performance.now() }; });
canvas.addEventListener('pointerup', (e) => {
  if (!down) return;
  const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
  const quick = performance.now() - down.t < 600;
  down = null;
  if (moved > 6 || !quick || e.button !== 0) return;
  const id = pick(e);
  if (id) select(id);
  else if (selected) closePanel();
});
canvas.addEventListener('pointermove', (e) => {
  if (e.pointerType !== 'mouse' || e.buttons) return;
  hovered = pick(e);
  canvas.style.cursor = hovered ? 'pointer' : 'grab';
});
canvas.addEventListener('contextmenu', (e) => e.preventDefault());

const hint = $('#hint');
let hintGone = false;
function dismissHint() { if (!hintGone) { hintGone = true; hint.classList.add('is-gone'); } }
controls.addEventListener('start', () => setTimeout(dismissHint, 1200));

// ───────────────────────── frame ─────────────────────────
let pr = 1;
function resize() {
  const w = innerWidth, h = innerHeight, a = w / h;
  camera.left = (-VIEW_H * a) / 2;
  camera.right = (VIEW_H * a) / 2;
  camera.top = VIEW_H / 2;
  camera.bottom = -VIEW_H / 2;
  camera.updateProjectionMatrix();
  pr = Math.min(devicePixelRatio, quality >= 2 ? 2 : quality === 1 ? 1.5 : 1);
  renderer.setPixelRatio(pr);
  renderer.setSize(w, h, false);
  if (composer) { composer.setPixelRatio(pr); composer.setSize(w, h); }
  skyMat.uniforms.uRes.value.set(w, h);
  flyMat.uniforms.uSize.value = 7 * pr;
}
addEventListener('resize', resize);

// the opening: night, then the islands rise in the order they were lived while the sun comes up
const INTRO_LEN = 5.2;
const yearEl = $('#intro-year');
let yearShown = '';
let intro = null;
function finishIntro() {
  if (!intro) return;
  intro = null;
  for (const it of isl) it.intro = 1;
  root.classList.add('intro-done');
}

const v = new THREE.Vector3(), v2 = new THREE.Vector3();
const ranked = [...isl].sort((a, b) => a.rank - b.rank);
const placed = [];
let wasSmall = null;
let era = HOME_ERA, eraShown = -1;
let ema = 1 / 60, fps = 60;
const clock = new THREE.Clock();
let now_t = 0;
const travel = { vel: new THREE.Vector3(0, 0, 1), roam: 0 };
const stats = { calls: 0, tris: 0 };

function frame(t) {
  requestAnimationFrame(frame);
  if (!root.classList.contains('view-map')) { clock.getDelta(); return; }
  const dt = Math.min(clock.getDelta(), 0.1);
  if (!calm) now_t += dt;
  const time = now_t;

  // intro progress
  let introK = 1;
  if (intro) {
    const s = time - intro.t0;
    introK = clamp01(s / INTRO_LEN);
    for (const it of isl) it.intro = clamp01((s - 0.5 - it.delay) / 1.1);
    let y = '';
    for (const id of tour) { const it = islands.get(id); if (it.intro > 0.02 && /^\d+$/.test(it.def.year ?? '')) y = it.def.year; }
    if (y !== yearShown) { yearShown = y; yearEl.textContent = y; yearEl.classList.remove('tick'); void yearEl.offsetWidth; yearEl.classList.add('tick'); }
    if (introK >= 1) finishIntro();
  }

  // islands, stones, sparks
  for (const it of isl) {
    const lift = hovered === it.def.id || selected === it.def.id ? 0.35 : 0;
    const k = it.intro;
    if (k < 1) {
      it.group.position.y = it.baseY - (1 - easeOutBack(k)) * 26;
      it.group.scale.setScalar(Math.max(0.001, 0.4 + 0.6 * smooth(0, 0.7, k)));
      it.group.visible = k > 0;
    } else {
      it.group.visible = true;
      it.group.scale.setScalar(1);
      const want = it.baseY + Math.sin(time * 0.6 + it.phase) * 0.28 + lift;
      it.group.position.y += (want - it.group.position.y) * 0.12;
    }
  }
  Qn.identity();
  stones.forEach((s, i) => {
    const da = s.a.group.position.y - s.a.baseY, db = s.b.group.position.y - s.b.baseY;
    const k = intro ? clamp01((time - intro.t0 - 0.5 - Math.max(s.a.delay, s.b.delay) - 0.9 - s.t * 0.5) / 0.3) : 1;
    P.copy(s.p);
    P.y += (intro ? 0 : da + (db - da) * s.t) + Math.sin(time * 1.1 + s.t * 9) * 0.05;
    stoneMesh.setMatrixAt(i, M.compose(P, Qn, S.setScalar(Math.max(0.001, easeOutBack(k)))));
  });
  stoneMesh.instanceMatrix.needsUpdate = true;
  sparks.forEach((sp, i) => {
    const k = (sp.offset + time * 0.045) % 1;
    sp.curve.getPoint(k, P);
    Qn.setFromAxisAngle(UP, time * 2 + sp.offset * 20);
    sparkMesh.setMatrixAt(i, M.compose(P, Qn, S.setScalar(Math.max(0.001, (0.35 + Math.sin(k * Math.PI) * 0.9) * (intro ? smooth(0.9, 1, sp.b.intro) : 1)))));
  });
  sparkMesh.instanceMatrix.needsUpdate = true;
  for (const c of clouds) {
    if (!calm) c.position.x += c.userData.speed * dt;
    if (c.position.x > 95) c.position.x = -95;
  }
  for (const p of wanderers) {
    const a = time * p.sp + p.ph, s = Math.sign(p.sp);
    p.m.position.set(p.c[0] + Math.cos(a) * p.rx, p.c[1] + Math.sin(a * 2.3) * 1.6, p.c[2] + Math.sin(a) * p.rz);
    p.m.rotation.set(-Math.cos(a * 2.3) * 0.25 * s, Math.atan2(-Math.sin(a) * p.rx * s, Math.cos(a) * p.rz * s), -0.35 * s);
  }
  // the traveller: circles whatever you are looking at, otherwise roams the middle of the map
  {
    const it = selected && islands.get(selected);
    travel.roam += dt * 0.5;
    if (it) v.set(Math.cos(travel.roam * 1.6) * it.def.radius * 0.95, it.top + 1.6 + Math.sin(travel.roam * 2) * 0.4, Math.sin(travel.roam * 1.6) * it.def.radius * 0.95).add(it.group.position);
    else v.set(HOME.x + Math.cos(travel.roam * 0.35) * 34, 16 + Math.sin(travel.roam * 0.8) * 2, HOME.z + 12 + Math.sin(travel.roam * 0.35) * 22);
    v2.copy(v).sub(traveller.position);
    const dist = v2.length();
    if (dist > 0.001) {
      const speed = Math.min(dist * 2.2, 46);
      travel.vel.lerp(v2.multiplyScalar(speed / dist), 1 - Math.exp(-dt * 3.2));
      traveller.position.addScaledVector(travel.vel, calm ? 0 : dt);
      const yaw = Math.atan2(travel.vel.x, travel.vel.z);
      let dy = yaw - traveller.rotation.y;
      dy = Math.atan2(Math.sin(dy), Math.cos(dy));
      traveller.rotation.y += dy * Math.min(1, dt * 6);
      traveller.rotation.z = THREE.MathUtils.clamp(-dy * 2.2, -0.9, 0.9);
      traveller.rotation.x = THREE.MathUtils.clamp(-travel.vel.y * 0.04, -0.5, 0.5);
    }
  }
  if (!calm) for (const fn of tickers) fn(time);

  // tour clock
  if (tourOn && !flight) {
    tourClock += dt;
    tourBtn.style.setProperty('--p', clamp01(tourClock / TOUR_STOP));
    if (tourClock > TOUR_STOP) { tourClock = 0; if (!step(1)) goHome(); }
  }

  stepFlight(t);
  controls.update();

  // what hour is it here?
  let target = HOME_ERA;
  if (intro) target = 0.04 + (HOME_ERA - 0.04) * smooth(0.12, 0.96, introK);
  else {
    let sw = 0, se = 0;
    for (const it of isl) {
      const dx = it.group.position.x - controls.target.x, dz = it.group.position.z - controls.target.z;
      const w = 1 / Math.pow(dx * dx + dz * dz + 20, 3);
      sw += w; se += w * it.def.era;
    }
    const hz = homeZoom();
    const local = selected ? islands.get(selected).def.era : se / sw;
    target = HOME_ERA + (local - HOME_ERA) * (selected ? 1 : smooth(hz * 1.08, hz * 1.75, camera.zoom));
  }
  era = intro ? target : era + (target - era) * (1 - Math.exp(-dt * 1.6));
  if (Math.abs(era - eraShown) > 0.0015) {
    eraShown = era;
    sampleSky(era);
    const u = skyMat.uniforms;
    u.uGlowPos.value.set(now.glowPos[0], now.glowPos[1]);
    u.uGlowSize.value = now.glowSize; u.uGlowI.value = now.glowI; u.uStars.value = now.stars;
    sun.color.copy(now.sun); sun.intensity = now.sunI;
    hemi.color.copy(now.hemiSky); hemi.groundColor.copy(now.hemiGround); hemi.intensity = now.hemiI;
    const lamp = 1.3 + 2.1 * now.night;
    for (const g of GLOWS) g.m.emissiveIntensity = g.base * lamp;
    for (const m of cloudMats) m.emissiveIntensity = 0.5 * (1 - now.night * 0.82) * (1 - 0.6 * smooth(0.72, 1, era));
    flyMat.uniforms.uNight.value = now.night;
    for (const b of birds) { b.userData.mat.opacity = (1 - now.night) * 0.75; b.visible = now.night < 0.98; }
    stoneMat.emissiveIntensity = now.night * 0.5;
    if (bloom) bloom.strength = 0.34 + 0.5 * now.night;
    root.style.setProperty('--night', now.night.toFixed(3));
  }
  sun.position.set(controls.target.x + now.sunPos[0], now.sunPos[1], controls.target.z + now.sunPos[2]);
  sun.target.position.set(controls.target.x, 0, controls.target.z);
  const tu = (controls.target.x - controls.target.z) / Math.SQRT2, tw = (controls.target.x + controls.target.z) / Math.SQRT2;
  skyMat.uniforms.uOff.value.set(tu, -tw * 0.5);
  skyMat.uniforms.uTime.value = time;
  flyMat.uniforms.uTime.value = time;

  // birds: a V that drifts across the morning
  {
    const a = time * 0.07;
    v.set(HOME.x + Math.cos(a) * 52, 20 + Math.sin(a * 3) * 2, HOME.z + Math.sin(a) * 40);
    const yaw = Math.atan2(-Math.sin(a) * 52, Math.cos(a) * 40);
    birds.forEach((b, i) => {
      b.position.copy(b.userData.off).applyAxisAngle(THREE.Object3D.DEFAULT_UP, yaw).add(v);
      b.rotation.y = yaw;
      const f = Math.sin(time * 7 + i * 0.9) * 0.7;
      b.userData.wings[0].rotation.z = f; b.userData.wings[1].rotation.z = -f;
    });
  }

  renderer.info.reset();
  if (quality >= 2 && composer) {
    const zf = smooth(0.5, 2.2, camera.zoom);
    const rad = 1.0 + 1.25 * zf;
    tiltH.uniforms.uDir.value.set(1 / (innerWidth * pr), 0);
    tiltV.uniforms.uDir.value.set(0, 1 / (innerHeight * pr));
    tiltH.uniforms.uRadius.value = tiltV.uniforms.uRadius.value = rad;
    tiltH.uniforms.uFocus.value = tiltV.uniforms.uFocus.value = 0.42 - 0.14 * zf;
    tiltV.uniforms.uTime.value = time;
    composer.render();
  } else renderer.render(scene, camera);
  stats.calls = renderer.info.render.calls;
  stats.tris = renderer.info.render.triangles;

  // adaptive quality
  ema += (dt - ema) * 0.05;
  fps = 1 / ema;
  if (!pinned && now_t > 1.5 && quality > 0) {
    slowFor = ema > 1 / 27 ? slowFor + dt : 0;
    if (slowFor > 2.5) { quality--; slowFor = 0; ema = 1 / 60; applyQuality(); }
  }

  // labels ride on top of the canvas as real text
  const w = innerWidth, h = innerHeight;
  const small = camera.zoom < 0.55;
  for (const it of isl) {
    v.copy(it.group.position);
    v.y += it.top;
    v.project(camera);
    it.sx = (v.x * 0.5 + 0.5) * w; it.sy = (-v.y * 0.5 + 0.5) * h;
    it.label.style.transform = `translate(${it.sx.toFixed(1)}px, ${it.sy.toFixed(1)}px) translate(-50%, -100%)`;
    it.label.classList.toggle('is-small', small);
    it.label.classList.toggle('is-waiting', it.intro < 1);
  }
  if (small !== wasSmall || !ranked[0].w) { for (const it of ranked) { it.w = it.label.offsetWidth; it.h = it.label.offsetHeight; } wasSmall = small; }
  placed.length = 0;
  for (const it of selected ? [islands.get(selected), ...ranked.filter((o) => o.def.id !== selected)] : ranked) {
    const r = [it.sx - it.w / 2 - 3, it.sy - it.h - 3, it.sx + it.w / 2 + 3, it.sy + 3];
    const clash = it.def.id !== selected && placed.some((q) => r[0] < q[2] && r[2] > q[0] && r[1] < q[3] && r[3] > q[1]);
    it.label.classList.toggle('is-hidden', clash);
    if (!clash) placed.push(r);
  }
}

// ───────────────────────── start ─────────────────────────
applyQuality();
sampleSky(era);
const startId = location.hash.slice(1);
camera.zoom = homeZoom();
camera.updateProjectionMatrix();
document.body.classList.add('is-ready');
if (islands.has(startId)) { root.classList.add('intro-done'); select(startId, { push: false }); }
else if (calm || params.has('nointro')) root.classList.add('intro-done');
else {
  intro = { t0: 0 };
  for (const it of isl) it.intro = 0;
  camera.zoom = homeZoom() * 0.8;
  camera.updateProjectionMatrix();
  flyTo(HOME, homeZoom(), INTRO_LEN * 1000);
}
requestAnimationFrame(frame);
addEventListener('hashchange', () => {
  const id = location.hash.slice(1);
  if (islands.has(id) && id !== selected) select(id, { push: false });
});

// numbers for the colophon
window.__map = {
  select, goHome, startTour, stopTour, camera, controls,
  stats: () => ({ islands: isl.length, calls: stats.calls, tris: stats.tris, fps: Math.round(fps), quality, era }),
  setEra: (e) => { era = e; eraShown = -1; },
};
