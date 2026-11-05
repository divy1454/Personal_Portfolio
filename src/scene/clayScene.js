// The clay stage: one Three.js scene behind the page. Each section with data-chapter gets its own clay object;
// scrolling moves the plinth between sides and swaps the objects. createClayScene(canvas) starts it and returns
// a function that stops it and frees the GPU memory.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export function createClayScene(canvas) {

  const debug = new URLSearchParams(window.location.search).has('debug');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- small math ---------- */
  const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const range = (v, a, b) => clamp((v - a) / (b - a));
  const smooth = (x) => x * x * (3 - 2 * x);
  const easeOut = (x) => 1 - (1 - x) ** 3;
  const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);
  const backOut = (x, s = 1.7) => (x <= 0 ? 0 : x >= 1 ? 1 : 1 + (s + 1) * (x - 1) ** 3 + s * (x - 1) ** 2);
  const wobble = (tau, freq = 16, damp = 7) => (tau <= 0 ? 0 : Math.exp(-damp * tau) * Math.sin(freq * tau));
  // A fall with one soft rebound: touchdown at 0.62, then a small hop that dies out.
  function bounce(x) {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    if (x < 0.62) { const u = x / 0.62; return u * u; }
    const u = (x - 0.62) / 0.38;
    return 1 - 0.14 * Math.sin(Math.PI * u) * (1 - u * 0.6);
  }
  const LAND = 0.62;
  // Exhibits pop in with a little overshoot but leave with a plain ease, so nothing jumps on the way out.
  let exiting = false, snap = false;
  const pop = (x, s = 1.7) => (exiting ? easeInOut(x) : backOut(x, s));
  const land = (x) => (exiting ? easeInOut(x) : bounce(x));

  /* ---------- renderer, light, floor ---------- */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: debug });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;
  renderer.localClippingEnabled = true;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.7;
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 200);

  // A round shadow catcher that stays inside the shadow camera, so its edge never shows.
  const floor = new THREE.Mesh(new THREE.CircleGeometry(6.6, 72), new THREE.ShadowMaterial({ color: 0x0b1f14, opacity: 0.2 }));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const small = Math.min(window.innerWidth, window.innerHeight) < 600;
  const KEY = new THREE.Vector3(-6, 9, 5);
  const key = new THREE.DirectionalLight(0xfff7ee, 2.5);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -7.5, right: 7.5, top: 7.5, bottom: -7.5, near: 0.5, far: 40 });
  key.shadow.radius = 9;
  key.shadow.blurSamples = small ? 8 : 12;
  key.shadow.bias = -0.0004;
  scene.add(key, key.target);
  const fill = new THREE.DirectionalLight(0xdff2ff, 0.5);
  fill.position.set(5, 3, -4);
  scene.add(fill);

  /* ---------- clay ---------- */
  const TOP = 0.34; // plinth height; everything stands on it and can sink into it
  const clipTop = new THREE.Plane(new THREE.Vector3(0, 1, 0), -TOP);
  const clay = (color, roughness = 0.88) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness: 0, clippingPlanes: [clipTop], clipShadows: true });
  const M = {
    plinth: new THREE.MeshStandardMaterial({ color: '#c0d5c8', roughness: 0.9, metalness: 0 }),
    white: clay('#f5f8f4'),
    accent: clay('#e95f35', 0.62),
    pale: clay('#e3ece7'),
    tint: clay('#a4c0b2'),
    ink: clay('#1f2e27', 0.72),
    leaf: clay('#6fae8e', 0.85),
  };
  const own = (base) => { const m = base.clone(); m.clippingPlanes = [clipTop]; return m; };
  const C = { white: new THREE.Color('#f5f8f4'), accent: new THREE.Color('#e95f35'), tint: new THREE.Color('#a4c0b2') };

  function mesh(geo, mat, cast = true) {
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = cast;
    m.receiveShadow = true;
    return m;
  }
  const rbox = (w, h, d, r = 0.06, seg = 4) => new RoundedBoxGeometry(w, h, d, seg, Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001));
  function poly(pts) {
    const s = new THREE.Shape();
    pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
    s.closePath();
    return s;
  }
  // Extrude a 2D shape into a clay piece standing on y = 0, centred in x and z.
  function extrude(shape, depth, bevel = 0.1, curve = 24) {
    const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: bevel * 1.2, bevelSize: bevel, bevelSegments: 10, curveSegments: curve });
    g.computeBoundingBox();
    const b = g.boundingBox;
    g.translate(-(b.min.x + b.max.x) / 2, -b.min.y, -(b.min.z + b.max.z) / 2);
    return g;
  }
  function shapeD() {
    const s = new THREE.Shape();
    s.moveTo(0, 0); s.lineTo(0.62, 0); s.absarc(0.62, 1, 1, -Math.PI / 2, Math.PI / 2, false); s.lineTo(0, 2); s.lineTo(0, 0);
    const h = new THREE.Path();
    h.moveTo(0.44, 0.44); h.lineTo(0.62, 0.44); h.absarc(0.62, 1, 0.56, -Math.PI / 2, Math.PI / 2, false); h.lineTo(0.44, 1.56); h.lineTo(0.44, 0.44);
    s.holes.push(h);
    return s;
  }
  function shapePin() {
    const a = 0.62, c = 1.55, th = Math.asin(a / c);
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.lineTo(a * Math.cos(th), c - a * Math.sin(th));
    s.absarc(0, c, a, -th, Math.PI + th, false);
    s.lineTo(0, 0);
    const h = new THREE.Path();
    h.absarc(0, c, 0.24, 0, Math.PI * 2, true);
    s.holes.push(h);
    return s;
  }
  function shapePuzzle() {
    const s = new THREE.Shape();
    s.moveTo(0, 0); s.lineTo(0.7, 0); s.lineTo(0.7, 0.252);
    s.absarc(0.8, 0.35, 0.14, -2.366, 2.366, false);
    s.lineTo(0.7, 0.7); s.lineTo(0.448, 0.7);
    s.absarc(0.35, 0.8, 0.14, -0.796, 3.937, false);
    s.lineTo(0, 0.7); s.lineTo(0, 0);
    return s;
  }
  const pointerGeo = new THREE.ExtrudeGeometry(
    poly([[0, 0], [0, -1], [0.24, -0.77], [0.4, -1.12], [0.55, -1.05], [0.39, -0.71], [0.72, -0.71]]),
    { depth: 0.12, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.045, bevelSegments: 8, curveSegments: 12 }
  );
  pointerGeo.translate(0, 0, -0.06); // origin stays at the tip
  function planeGeometry() {
    const N = [0, 0, 1.1], T = [0, 0, -0.75], L = [-0.82, 0.16, -0.75], R = [0.82, 0.16, -0.75], K = [0, -0.3, -0.62];
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute([N, L, T, N, T, R, N, T, K].flat(), 3));
    g.computeVertexNormals();
    return g;
  }
  const GEO = {
    D: extrude(shapeD(), 0.46, 0.11, 72),
    I: extrude(poly([[0, 0], [0.44, 0], [0.44, 2], [0, 2]]), 0.46, 0.11),
    V: extrude(poly([[0, 2], [0.47, 2], [0.75, 0.923], [1.03, 2], [1.5, 2], [0.98, 0], [0.52, 0]]), 0.46, 0.11),
    Y: extrude(poly([[0, 2], [0.47, 2], [0.75, 1.44], [1.03, 2], [1.5, 2], [0.97, 0.94], [0.97, 0], [0.53, 0], [0.53, 0.94]]), 0.46, 0.11),
    lt: extrude(poly([[0, 1], [1, 2], [1.32, 1.68], [0.64, 1], [1.32, 0.32], [1, 0]]), 0.46),
    gt: extrude(poly([[1.32, 1], [0.32, 2], [0, 1.68], [0.68, 1], [0, 0.32], [0.32, 0]]), 0.46),
    slash: extrude(poly([[0, 0], [0.46, 0], [1.16, 2], [0.7, 2]]), 0.46),
    pin: extrude(shapePin(), 0.34, 0.08, 48),
    puzzle: extrude(shapePuzzle(), 0.12, 0.04, 24),
    check: extrude(poly([[0.42, 0.04], [1.08, 0.7], [0.94, 0.84], [0.42, 0.32], [0.14, 0.6], [0, 0.46]]), 0.06, 0.025, 8),
    pointer: pointerGeo,
    plane: planeGeometry(),
  };

  /* ---------- plinth: two half-lathes and a stretchable middle, so it can turn from a disc into a long stage ---------- */
  const PROFILE = [[0, 0], [1.62, 0], [1.68, 0.03], [1.7, 0.08], [1.7, TOP - 0.08], [1.68, TOP - 0.03], [1.62, TOP], [0, TOP]];
  const R0 = 1.7;
  function sweepGeometry(profile) {
    const pos = [], idx = [];
    for (const sign of [1, -1]) {
      const base = pos.length / 3;
      profile.forEach(([r, y]) => pos.push(-0.5, y, sign * r, 0.5, y, sign * r));
      for (let k = 0; k < profile.length - 1; k++) {
        const a = base + k * 2, b = a + 1, c = a + 3, d = a + 2;
        if (sign > 0) idx.push(a, b, c, a, c, d); else idx.push(a, c, b, a, d, c);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }
  function makePlinth() {
    const pts = PROFILE.map(([r, y]) => new THREE.Vector2(r, y));
    const right = mesh(new THREE.LatheGeometry(pts, 40, 0, Math.PI), M.plinth);
    const left = mesh(new THREE.LatheGeometry(pts, 40, Math.PI, Math.PI), M.plinth);
    const mid = mesh(sweepGeometry(PROFILE), M.plinth);
    const group = new THREE.Group();
    group.add(left, mid, right);
    return {
      group,
      set(L, R) {
        const k = R / R0;
        left.position.x = -L / 2;
        right.position.x = L / 2;
        left.scale.set(k, 1, k);
        right.scale.set(k, 1, k);
        mid.scale.set(Math.max(L, 1e-4), 1, k);
        mid.visible = L > 0.003;
      },
    };
  }
  function makeContactShadow() {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d');
    const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0, 'rgba(11,31,20,1)');
    grd.addColorStop(0.45, 'rgba(11,31,20,0.45)');
    grd.addColorStop(1, 'rgba(11,31,20,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 128, 128);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.26, depthWrite: false });
    const part = (u0, u1) => {
      const geo = new THREE.PlaneGeometry(1, 1);
      const uv = geo.attributes.uv;
      for (let i = 0; i < uv.count; i++) uv.setX(i, lerp(u0, u1, uv.getX(i)));
      return new THREE.Mesh(geo, mat);
    };
    const left = part(0, 0.5), mid = part(0.5, 0.5), right = part(0.5, 1);
    const group = new THREE.Group();
    group.add(left, mid, right);
    group.rotation.x = -Math.PI / 2;
    group.position.y = 0.003;
    return {
      group, mat,
      set(L, R) {
        const s = R * 1.09;
        left.scale.set(s, 2 * s, 1); left.position.x = -L / 2 - s / 2;
        right.scale.set(s, 2 * s, 1); right.position.x = L / 2 + s / 2;
        mid.scale.set(Math.max(L, 1e-4), 2 * s, 1); mid.visible = L > 0.003;
      },
    };
  }

  /* ---------- exhibits: one per chapter ---------- */
  const ZERO = { y: 0, sq: 0 };
  function hop(tau) {
    if (!(tau > 0) || tau > 0.8) return ZERO;
    if (tau < 0.09) return { y: 0, sq: 0.09 * (tau / 0.09) };
    if (tau < 0.53) { const u = (tau - 0.09) / 0.44; return { y: 4 * u * (1 - u) * 0.38, sq: -0.07 * Math.sin(Math.PI * u) }; }
    const u = (tau - 0.53) / 0.27;
    return { y: 0, sq: 0.08 * Math.sin(Math.PI * u) * (1 - u) };
  }

  // Reduced motion skips the intro and the cursor's round.
  let introT = reduce ? 12 : -0.3;
  let flightOverride = null;

  // Hero: the cursor arrives and clicks the clay D. The D slides aside while the stand stretches, and I, V, Y drop onto it one after another.
  // Afterwards the cursor taps the Y once and rests. Hovering a letter makes it hop; clicking one spins it.
  const CLICK = [1.0, 1.3], SLIDE = [1.25, 1.95], DROP = [1.62, 1.86, 2.1], FALL = 0.6, TAP = 2.95;
  function makeHero() {
    const group = new THREE.Group();
    const letters = [['D', -2.53], ['I', -0.96], ['V', 0.55], ['Y', 2.59]].map(([k, x]) => {
      const pivot = new THREE.Group();
      const m = mesh(GEO[k], M.white);
      pivot.add(m);
      group.add(pivot);
      return { pivot, mesh: m, x, hoverAt: -9, spinAt: -9 };
    });
    const pointer = mesh(GEO.pointer, M.accent);
    pointer.rotation.set(-Math.PI / 2, 0, 0.55);
    group.add(pointer);
    const START = new THREE.Vector3(1.0, 0, 0.9), GRAB = new THREE.Vector3(0.3, 0, 0.5);
    const REST = new THREE.Vector3(1.72, 0, 1.0), TAPY = new THREE.Vector3(2.29, 0, 0.55);
    const tip = new THREE.Vector3();
    return {
      group, letters, enter: 0.9, exit: 0.7,
      update(p, local, t) {
        const ti = introT;
        const m = easeInOut(range(ti, SLIDE[0], SLIDE[1]));
        const dX = lerp(-0.12, -2.53, m), dZ = lerp(-0.1, 0, m), dR = lerp(-0.3, 0, m);
        let lift = 0;
        if (ti < CLICK[0]) {
          const e = easeInOut(range(ti, 0.35, CLICK[0]));
          tip.lerpVectors(START, GRAB, e);
          lift = (1 - e) * 1.5;
        } else if (ti < 1.9) {
          tip.copy(GRAB);
          lift = Math.sin(Math.PI * range(ti, CLICK[0], CLICK[1])) * 0.14;
        } else if (ti < TAP) {
          const e = easeInOut(range(ti, 1.9, 2.5));
          tip.lerpVectors(GRAB, REST, e);
          lift = Math.sin(Math.PI * e) * 0.12;
        } else {
          const a = easeInOut(range(ti, TAP, TAP + 0.45)), b = easeInOut(range(ti, TAP + 0.7, TAP + 1.25));
          tip.lerpVectors(REST, TAPY, a).lerp(REST, b);
          lift = Math.sin(Math.PI * a) * 0.12 + Math.sin(Math.PI * range(ti, TAP + 0.45, TAP + 0.68)) * 0.1 + Math.sin(Math.PI * b) * 0.1;
        }
        const sinkP = (1 - easeInOut(range(p, 0, 0.5))) * 0.5;
        pointer.position.set(tip.x, TOP + 0.11 + lift - sinkP, tip.z);

        letters.forEach((L, k) => {
          let x = L.x, z = 0, ry = 0, y = TOP, sq = 0, vis = true;
          if (k === 0) {
            x = dX; z = dZ; ry = dR;
            sq += wobble(ti - 1.1, 17, 6) * 0.12 + wobble(ti - SLIDE[1], 15, 6) * 0.06;
          } else {
            const st = DROP[k - 1], u = range(ti, st, st + FALL);
            vis = u > 0;
            y += (1 - bounce(u)) * 3.0;
            sq += wobble(ti - (st + FALL * LAND), 17, 7) * 0.1;
            ry = (1 - u) * 0.45 * (k % 2 ? 1 : -1);
          }
          const h1 = k === 3 ? hop(ti - (TAP + 0.5)) : ZERO;
          const h2 = hop(t - L.hoverAt);
          y += Math.max(h1.y, h2.y);
          sq += h1.sq + h2.sq;
          ry += easeOut(range(t - L.spinAt, 0, 0.8)) * Math.PI * 2;
          y -= (1 - easeInOut(range(p, k * 0.1, k * 0.1 + 0.7))) * 2.5;
          L.pivot.position.set(x, y, z);
          L.pivot.rotation.y = ry;
          L.pivot.scale.set(1 + sq * 0.5, 1 - sq, 1 + sq * 0.5);
          L.pivot.visible = vis && y > TOP - 2.4;
        });
      },
    };
  }

  // About: a clay laptop rises on a desk and opens as you scroll, and a small business app builds itself on the screen. A mug and a plant keep it company.
  function makeDesk(side) {
    const group = new THREE.Group();
    const desk = new THREE.Group();
    desk.position.y = TOP;
    group.add(desk);
    const put = (geo, mat, x, y, z, parent = desk, cast = true) => { const m = mesh(geo, mat, cast); m.position.set(x, y, z); parent.add(m); return m; };
    const base = new THREE.Group();
    desk.add(base);
    put(rbox(2.6, 0.14, 1.7, 0.06, 4), M.white, 0, 0.07, 0, base);
    put(rbox(2.2, 0.03, 0.8, 0.02), M.pale, 0, 0.15, -0.16, base, false);
    put(rbox(0.7, 0.03, 0.4, 0.02), M.pale, 0, 0.15, 0.52, base, false);
    // The lid stands on a hinge at the back edge; closed, it lies flat over the keys.
    const hinge = new THREE.Group();
    hinge.position.set(0, 0.14, -0.82);
    base.add(hinge);
    const lid = new THREE.Group();
    hinge.add(lid);
    put(rbox(2.6, 1.7, 0.1, 0.06, 4), M.white, 0, 0.85, 0, lid);
    put(rbox(2.4, 1.5, 0.03, 0.04), M.pale, 0, 0.85, 0.05, lid, false);
    const ui = [];
    const uiPut = (geo, mat, x, y) => { const m = put(geo, mat, x, y, 0.075, lid, false); ui.push(m); return m; };
    uiPut(rbox(0.5, 1.34, 0.03, 0.03), M.tint, -0.9, 0.85);
    uiPut(rbox(1.7, 0.16, 0.03, 0.03), M.accent, 0.25, 1.44);
    [1.12, 0.88, 0.64, 0.4].forEach((y) => uiPut(rbox(1.5, 0.12, 0.03, 0.03), M.tint, 0.25, y));
    uiPut(rbox(0.5, 0.16, 0.03, 0.05), M.accent, 0.85, 0.2);
    const mug = new THREE.Group();
    mug.position.set(1.85, 0, 0.45);
    desk.add(mug);
    put(new THREE.CylinderGeometry(0.2, 0.17, 0.42, 32), M.accent, 0, 0.21, 0, mug);
    put(new THREE.TorusGeometry(0.12, 0.04, 12, 32), M.accent, 0.22, 0.22, 0, mug);
    const pot = new THREE.Group();
    pot.position.set(-1.95, 0, -0.3);
    desk.add(pot);
    put(new THREE.CylinderGeometry(0.22, 0.16, 0.34, 32), M.tint, 0, 0.17, 0, pot);
    const leafGeo = new THREE.SphereGeometry(1, 18, 12);
    [[-0.2, 0.6, 0.04, -0.55, 0.2], [0.19, 0.66, -0.05, 0.5, -0.15], [0.02, 0.84, 0.08, 0.05, 0.55], [-0.06, 0.5, 0.18, 0.1, 1.1]].forEach(([x, y, z, rz, rx]) => {
      const l = put(leafGeo, M.leaf, x, y, z, pot);
      l.scale.set(0.13, 0.3, 0.07);
      l.rotation.set(rx, 0, rz);
    });
    return {
      group, enter: 1.4, exit: 0.7,
      update(p, local) {
        const e = pop(range(p, 0.1, 0.65), 1.2);
        desk.visible = e > 0.001;
        desk.position.y = TOP - (1 - e) * 2.2;
        mug.scale.setScalar(Math.max(0.001, pop(range(p, 0.45, 0.8), 2)));
        pot.scale.setScalar(Math.max(0.001, pop(range(p, 0.55, 0.9), 2)));
        const open = easeInOut(range(local, 0.05, 0.38));
        lid.rotation.x = lerp(Math.PI / 2 - 0.04, -0.32, open);
        ui.forEach((m, i) => { const k = pop(range(local, 0.3 + i * 0.05, 0.44 + i * 0.05), 1.6); m.scale.setScalar(Math.max(0.001, k)); });
        desk.rotation.y = 0.3 * side + (local - 0.5) * 0.25;
      },
    };
  }

  // Skills: three slabs of the stack rise as one block, then fan apart as you scroll, each showing its piece: a database, an API block, code brackets.
  function makeStack() {
    const group = new THREE.Group();
    const slabGeo = rbox(2.3, 0.22, 1.5, 0.09, 4);
    const slabs = [M.tint, M.pale, M.white].map((mat, k) => {
      const g = new THREE.Group();
      group.add(g);
      const s = mesh(slabGeo, mat);
      s.position.y = 0.11;
      g.add(s);
      const glyph = new THREE.Group();
      glyph.position.y = 0.22;
      g.add(glyph);
      if (k === 0) {
        const drum = new THREE.CylinderGeometry(0.3, 0.3, 0.16, 36);
        [[0.08, M.white], [0.3, M.white], [0.52, M.accent]].forEach(([y, m]) => { const d = mesh(drum, m); d.position.y = y; glyph.add(d); });
      } else if (k === 1) {
        const b = mesh(rbox(1.0, 0.34, 0.56, 0.08), M.white);
        b.position.y = 0.17;
        glyph.add(b);
        const dot = new THREE.SphereGeometry(0.045, 14, 10);
        [-0.34, -0.2].forEach((x) => { const d = mesh(dot, M.accent, false); d.position.set(x, 0.17, 0.29); glyph.add(d); });
        const bar = mesh(rbox(0.36, 0.05, 0.02, 0.01), M.tint, false);
        bar.position.set(0.22, 0.17, 0.29);
        glyph.add(bar);
      } else {
        [[GEO.lt, M.white, -0.66], [GEO.slash, M.accent, 0], [GEO.gt, M.white, 0.66]].forEach(([geo, m, x]) => { const b = mesh(geo, m); b.scale.setScalar(0.34); b.position.x = x; glyph.add(b); });
      }
      return { g, glyph, k };
    });
    return {
      group, enter: 1.4, exit: 0.7,
      update(p, local) {
        const e = easeInOut(range(local, 0.22, 0.72));
        const gap = lerp(0.05, 0.72, e);
        slabs.forEach(({ g, glyph, k }) => {
          const r = pop(range(p, 0.15 + k * 0.12, 0.55 + k * 0.12), 1.5);
          const y = TOP + k * (0.22 + gap) - (1 - r) * 2.2;
          g.position.set((k - 1) * 0.5 * e, y, (1 - k) * 0.3 * e);
          g.visible = y > TOP - 2.1;
          const gs = backOut(range(e, 0.3, 1), 2);
          glyph.scale.setScalar(Math.max(0.001, gs));
          glyph.visible = gs > 0.001;
        });
        group.rotation.y = (local - 0.5) * 0.5;
      },
    };
  }

  // Experience: a kanban board stands up; scrolling moves leads from Created to Converted.
  function makeKanban() {
    const group = new THREE.Group();
    const stand = new THREE.Group();
    stand.position.set(0, TOP + 0.12, 0);
    group.add(stand);
    const board = mesh(rbox(4.4, 2.6, 0.16, 0.08, 5), M.white);
    board.position.y = 1.3;
    stand.add(board);
    const feet = [-1.55, 1.55].map((x) => {
      const f = mesh(rbox(0.56, 0.14, 0.62, 0.05), M.white);
      f.position.set(x, TOP + 0.07, 0);
      group.add(f);
      return f;
    });
    const LX = [-1.59, -0.53, 0.53, 1.59];
    LX.forEach((x, j) => {
      const lane = mesh(rbox(0.98, 2.0, 0.04, 0.04), M.pale, false);
      lane.position.set(x, 1.13, 0.09);
      stand.add(lane);
      const head = mesh(rbox(0.98, 0.13, 0.05, 0.03), j === 3 ? M.accent : M.tint, false);
      head.position.set(x, 2.33, 0.09);
      stand.add(head);
    });
    const cardGeo = rbox(0.86, 0.36, 0.1, 0.05);
    const barGeo = rbox(0.36, 0.05, 0.02, 0.01), barGeo2 = rbox(0.22, 0.05, 0.02, 0.01);
    const dotGeo = new THREE.SphereGeometry(0.055, 16, 12);
    const badgeGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.03, 24);
    const cards = [0, 1, 2, 3, 4].map((j) => {
      const c = new THREE.Group();
      c.add(mesh(cardGeo, M.white));
      const dot = mesh(dotGeo, j % 2 ? M.tint : M.accent, false); dot.position.set(-0.3, 0, 0.06); c.add(dot);
      const b1 = mesh(barGeo, M.tint, false); b1.position.set(0.05, 0.06, 0.055); c.add(b1);
      const b2 = mesh(barGeo2, M.tint, false); b2.position.set(-0.02, -0.06, 0.055); c.add(b2);
      const badge = mesh(badgeGeo, M.accent, false); badge.rotation.x = Math.PI / 2; badge.position.set(0.31, 0, 0.065); c.add(badge);
      stand.add(c);
      return { c, badge };
    });
    // [lane, row] for each card at each step of the pipeline
    const KF = [
      [[0, 0], [0, 1], [0, 2], [1, 0], [2, 0]],
      [[1, 0], [0, 0], [0, 1], [2, 0], [3, 0]],
      [[2, 0], [1, 0], [0, 0], [3, 1], [3, 0]],
      [[3, 2], [2, 0], [1, 0], [3, 1], [3, 0]],
    ];
    const slot = (lane, row) => [LX[lane], 1.88 - row * 0.46];
    return {
      group, enter: 1.4, exit: 0.7,
      update(p, local) {
        const e = range(p, 0.2, 0.75);
        stand.rotation.x = -(1 - pop(e, 1.3)) * Math.PI / 2;
        stand.scale.setScalar(range(p, 0, 0.2));
        feet.forEach((f) => f.scale.setScalar(pop(range(p, 0.1, 0.35), 2)));
        const T = range(local, 0.2, 0.85) * 3;
        const k = Math.min(2, Math.floor(T)), u = easeInOut(T - k);
        cards.forEach(({ c, badge }, j) => {
          const [l0, r0] = KF[k][j], [l1, r1] = KF[k + 1][j];
          const [x0, y0] = slot(l0, r0), [x1, y1] = slot(l1, r1);
          const moving = l0 !== l1 ? Math.sin(Math.PI * u) : 0;
          c.position.set(lerp(x0, x1, u), lerp(y0, y1, u) + moving * 0.12, 0.17 + moving * 0.32);
          c.rotation.z = -moving * 0.1;
          c.scale.setScalar(pop(range(p, 0.5 + j * 0.05, 0.72 + j * 0.05), 2));
          badge.scale.setScalar(backOut(range(lerp(l0, l1, u), 2.6, 3), 2.5));
        });
      },
    };
  }

  // CRM: a monitor rises with a dashboard on it. Bars grow and a pie fills; the cursor sweeps the bars and the one under it lights up with a tooltip.
  function makeMonitor() {
    const group = new THREE.Group();
    const mon = new THREE.Group();
    mon.position.y = TOP;
    group.add(mon);
    const put = (geo, mat, x, y, z, parent = mon, cast = false) => { const m = mesh(geo, mat, cast); m.position.set(x, y, z); parent.add(m); return m; };
    put(rbox(1.5, 0.12, 0.8, 0.05), M.ink, 0, 0.06, 0.1, mon, true);
    put(rbox(0.28, 0.6, 0.2, 0.05), M.ink, 0, 0.4, 0, mon, true);
    const SC = 1.78;
    put(rbox(3.5, 2.25, 0.16, 0.1, 5), M.white, 0, SC, 0, mon, true);
    put(rbox(3.3, 2.05, 0.03, 0.05), M.pale, 0, SC, 0.085);
    put(rbox(3.3, 0.2, 0.03, 0.04), M.tint, 0, SC + 0.925, 0.1);
    const dot = new THREE.SphereGeometry(0.035, 12, 8);
    [-1.5, -1.38, -1.26].forEach((x) => put(dot, M.white, x, SC + 0.925, 0.12));
    const H = [0.55, 0.9, 0.65, 1.15, 0.85], BX = H.map((_, j) => -1.32 + j * 0.3), Y0 = SC - 0.82;
    const bars = H.map((h, j) => {
      const g = rbox(0.2, h, 0.05, 0.03);
      g.translate(0, h / 2, 0);
      const mat = own(M.tint);
      const m = mesh(g, mat, false);
      m.position.set(BX[j], Y0, 0.11);
      mon.add(m);
      return { m, mat, h };
    });
    const PC = new THREE.Vector3(0.95, SC + 0.3, 0.11);
    put(new THREE.CylinderGeometry(0.46, 0.46, 0.04, 48), M.white, PC.x, PC.y, PC.z).rotation.x = Math.PI / 2;
    const NW = 14, wedges = [];
    for (let i = 0; i < NW; i++) {
      const w = mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.06, 6, 1, false, i * 2 * Math.PI / NW, 2 * Math.PI / NW), M.accent, false);
      w.rotation.x = Math.PI / 2;
      w.position.set(PC.x, PC.y, PC.z + 0.01);
      mon.add(w);
      wedges.push(w);
    }
    put(new THREE.CylinderGeometry(0.22, 0.22, 0.08, 36), M.white, PC.x, PC.y, PC.z + 0.02).rotation.x = Math.PI / 2;
    const rows = [0, 1, 2].map((i) => {
      const g = rbox(1.2, 0.07, 0.03, 0.02);
      g.translate(0.6, 0, 0);
      const m = mesh(g, M.tint, false);
      m.position.set(0.35, SC - 0.5 - i * 0.17, 0.11);
      mon.add(m);
      return m;
    });
    const pointer = mesh(GEO.pointer, M.accent);
    pointer.rotation.set(0, -0.25, 0.12);
    pointer.scale.setScalar(0.55);
    group.add(pointer);
    const tip = new THREE.Group();
    group.add(tip);
    tip.add(mesh(rbox(0.62, 0.26, 0.06, 0.05), M.white));
    const tb = mesh(rbox(0.36, 0.05, 0.02, 0.01), M.accent, false); tb.position.set(-0.06, 0.03, 0.04); tip.add(tb);
    const tb2 = mesh(rbox(0.2, 0.04, 0.02, 0.01), M.tint, false); tb2.position.set(-0.14, -0.06, 0.04); tip.add(tb2);
    return {
      group, enter: 1.4, exit: 0.7,
      update(p, local) {
        const e = pop(range(p, 0.12, 0.6), 1.3);
        mon.visible = e > 0.001;
        mon.scale.set(lerp(0.6, 1, e), Math.max(0.001, e), 1);
        bars.forEach(({ m }, j) => { m.scale.y = Math.max(0.001, pop(range(p, 0.45 + j * 0.06, 0.8 + j * 0.06), 1.6)); });
        rows.forEach((r, i) => { r.scale.x = Math.max(0.001, easeOut(range(p, 0.6 + i * 0.08, 0.85 + i * 0.08))); });
        const n = Math.round(range(local, 0.18, 0.72) * NW);
        wedges.forEach((w, i) => { w.visible = i < n; });
        const sx = range(local, 0.18, 0.86);
        const mx = lerp(BX[0] - 0.1, BX[4] + 0.1, sx);
        let near = -1;
        bars.forEach(({ m, mat }, j) => {
          const d = 1 - range(Math.abs(BX[j] - mx), 0.06, 0.2);
          mat.color.copy(C.tint).lerp(C.accent, smooth(d));
          m.position.y = Y0 + d * 0.05;
          if (d > 0.8) near = j;
        });
        const pv = range(p, 0.75, 1);
        pointer.visible = pv > 0 && local > 0.08 && local < 0.96;
        pointer.position.set(mx + 0.05, TOP + Y0 + 0.72 + (1 - easeOut(pv)) * 1.2, 0.3);
        tip.visible = near >= 0 && pointer.visible;
        if (near >= 0) tip.position.set(BX[near] + 0.06, TOP + Y0 + bars[near].h + 0.3, 0.3);
        tip.scale.setScalar(backOut(range(local, 0.18, 0.3), 2));
      },
    };
  }

  // JDMatcher: the extension snaps into the toolbar, fields autofill, the cursor submits, an Apply badge pops.
  function makeJD() {
    const group = new THREE.Group();
    const win = new THREE.Group();
    win.position.set(0, TOP + 0.12, 0);
    group.add(win);
    const add = (geo, mat, x, y, z, cast = false) => { const m = mesh(geo, mat, cast); m.position.set(x, y, z); win.add(m); return m; };
    add(rbox(3.6, 2.4, 0.16, 0.1, 5), M.white, 0, 1.2, 0, true);
    add(rbox(3.44, 0.28, 0.03, 0.03), M.pale, 0, 2.14, 0.085);
    const dotGeo = new THREE.SphereGeometry(0.045, 14, 10);
    [-1.56, -1.42, -1.28].forEach((x) => add(dotGeo, M.tint, x, 2.14, 0.105));
    add(rbox(1.5, 0.12, 0.02, 0.05), M.white, -0.18, 2.14, 0.105);
    add(rbox(0.34, 0.2, 0.02, 0.04), M.tint, 1.5, 2.14, 0.105);
    const fills = [1.64, 1.14, 0.64].map((y) => {
      add(rbox(0.55, 0.06, 0.02, 0.02), M.tint, -1.02, y + 0.21, 0.09);
      add(rbox(2.6, 0.26, 0.04, 0.06), M.pale, 0, y, 0.09);
      const g = rbox(2.48, 0.12, 0.03, 0.05);
      g.translate(1.24, 0, 0);
      return add(g, M.accent, -1.24, y, 0.115);
    });
    const button = add(rbox(0.86, 0.3, 0.1, 0.08), M.accent, 0.87, 0.27, 0.1, true);
    const feet = [-1.15, 1.15].map((x) => { const f = mesh(rbox(0.6, 0.12, 0.7, 0.05), M.white); f.position.set(x, TOP + 0.06, 0); group.add(f); return f; });
    const piece = mesh(GEO.puzzle, M.accent);
    group.add(piece);
    const pointer = mesh(GEO.pointer, M.accent);
    group.add(pointer);
    const badge = new THREE.Group();
    group.add(badge);
    const disc = mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.12, 40), M.accent);
    disc.rotation.x = Math.PI / 2;
    badge.add(disc);
    const tick = mesh(GEO.check, M.white, false);
    tick.scale.setScalar(0.42);
    tick.position.set(0, -0.19, 0.07);
    badge.add(tick);
    const SLOT = new THREE.Vector3(1.5, TOP + 0.12 + 2.14 - 0.2, 0.17), PSTART = new THREE.Vector3(3.2, TOP + 3.6, 1.6);
    const TIPA = new THREE.Vector3(2.7, TOP + 1.0, 1.5), TIPB = new THREE.Vector3(0.98, TOP + 0.38, 0.24);
    return {
      group, enter: 1.4, exit: 0.7,
      update(p, local) {
        const e = range(p, 0.25, 0.85);
        win.visible = e > 0;
        win.scale.set(lerp(0.25, 1, easeOut(e)), Math.max(0.001, pop(e, 1.8)), 1);
        feet.forEach((f) => f.scale.setScalar(easeOut(range(p, 0.2, 0.5))));
        const q = range(local, 0.06, 0.28);
        piece.visible = q > 0;
        piece.position.lerpVectors(PSTART, SLOT, easeInOut(q));
        piece.position.y += Math.sin(Math.PI * q) * 0.6;
        piece.rotation.set(0, (1 - q) * 1.6, (1 - q) * Math.PI * 2.5);
        piece.scale.setScalar(0.42 * (1 + wobble((local - 0.28) * 4, 18, 6) * 0.15));
        fills.forEach((f, k) => { f.scale.x = Math.max(0.001, easeOut(range(local, 0.32 + k * 0.08, 0.42 + k * 0.08))); });
        const pm = easeInOut(range(local, 0.56, 0.68));
        const click = Math.sin(Math.PI * range(local, 0.68, 0.76));
        pointer.visible = local > 0.54;
        pointer.position.lerpVectors(TIPA, TIPB, pm);
        pointer.position.z -= click * 0.1;
        pointer.rotation.set(0, -0.25, 0.12);
        button.scale.set(1, 1, 1 - click * 0.45);
        const b = range(local, 0.76, 0.9);
        badge.visible = b > 0;
        badge.position.set(2.2, TOP + 2.85, 0.3);
        badge.scale.setScalar(backOut(b, 2.4));
        badge.rotation.y = (1 - easeOut(b)) * Math.PI;
      },
    };
  }

  // TexPort: a phone spins up out of the stage; rows type in and attendance toggles switch on.
  function makeTexPort() {
    const group = new THREE.Group();
    const ph = new THREE.Group();
    group.add(ph);
    const put = (geo, mat, x, y, z, parent = ph, cast = false) => { const m = mesh(geo, mat, cast); m.position.set(x, y, z); parent.add(m); return m; };
    put(rbox(1.36, 2.72, 0.16, 0.2, 5), M.ink, 0, 1.36, 0, ph, true);
    put(rbox(1.2, 2.54, 0.04, 0.13), M.white, 0, 1.36, 0.075);
    put(rbox(0.32, 0.07, 0.02, 0.03), M.ink, 0, 2.5, 0.1);
    put(rbox(1.0, 0.16, 0.03, 0.05), M.accent, 0, 2.24, 0.1);
    put(rbox(0.9, 0.2, 0.03, 0.08), M.accent, 0, 0.3, 0.1);
    const rowGeo = rbox(1.0, 0.32, 0.03, 0.06);
    rowGeo.translate(0.5, 0, 0);
    const avGeo = new THREE.CylinderGeometry(0.085, 0.085, 0.03, 24);
    const b1 = rbox(0.36, 0.05, 0.02, 0.01), b2 = rbox(0.22, 0.05, 0.02, 0.01);
    const pillGeo = rbox(0.24, 0.13, 0.03, 0.06), knobGeo = new THREE.SphereGeometry(0.05, 16, 12);
    const rows = [1.86, 1.44, 1.02, 0.6].map((y) => {
      const r = new THREE.Group();
      r.position.set(-0.5, y, 0.1);
      ph.add(r);
      put(rowGeo, M.pale, 0, 0, 0, r);
      const av = put(avGeo, M.tint, 0.15, 0, 0.025, r);
      av.rotation.x = Math.PI / 2;
      put(b1, M.tint, 0.48, 0.045, 0.025, r);
      put(b2, M.tint, 0.41, -0.05, 0.025, r);
      const pillMat = own(M.tint);
      put(pillGeo, pillMat, 0.82, 0, 0.03, r);
      const knob = put(knobGeo, M.white, 0.765, 0, 0.055, r);
      return { r, pillMat, knob };
    });
    return {
      group, enter: 1.4, exit: 0.7,
      update(p, local) {
        const e = range(p, 0.25, 0.9);
        ph.position.set(0, TOP - (1 - pop(range(p, 0.25, 0.65), 1.4)) * 2.9, 0);
        ph.rotation.y = lerp(-Math.PI * 1.25, 0.22, easeOut(e));
        rows.forEach(({ r, pillMat, knob }, k) => {
          r.scale.x = Math.max(0.001, backOut(range(local, 0.12 + k * 0.08, 0.26 + k * 0.08), 1.4));
          const on = smooth(range(local, 0.46 + k * 0.08, 0.54 + k * 0.08));
          knob.position.x = lerp(0.765, 0.875, on);
          pillMat.color.copy(C.tint).lerp(C.accent, on);
        });
      },
    };
  }

  // Inventory: a shelf rises out of the stage and boxes slide into it one by one as you scroll.
  function makeShelf() {
    const group = new THREE.Group();
    const shelf = new THREE.Group();
    group.add(shelf);
    const put = (geo, mat, x, y, z) => { const m = mesh(geo, mat); m.position.set(x, y, z); shelf.add(m); return m; };
    [-1.45, 1.45].forEach((x) => put(rbox(0.14, 2.06, 0.95, 0.05), M.tint, x, 1.03, 0));
    put(rbox(3.04, 0.1, 0.95, 0.04), M.tint, 0, 0.98, 0);
    put(rbox(3.04, 0.1, 0.95, 0.04), M.tint, 0, 2.01, 0);
    const S = 0.6, geo = rbox(S, S, S, 0.06, 4);
    const tapeTop = rbox(0.16, 0.02, S + 0.012, 0.008), tapeFront = rbox(0.16, 0.24, 0.02, 0.008);
    const SLOTS = [[-0.9, 0, 0.06], [0, 0, -0.04], [0.9, 0, 0.1], [-0.9, 1.03, -0.06], [0, 1.03, 0.08], [0.9, 1.03, 0], [-0.45, 2.06, 0.05], [0.45, 2.06, -0.05]];
    const boxes = SLOTS.map(([x, y, ry]) => {
      const b = new THREE.Group();
      group.add(b);
      const c = mesh(geo, M.white);
      c.position.y = S / 2;
      b.add(c);
      const t1 = mesh(tapeTop, M.accent, false); t1.position.y = S + 0.005; b.add(t1);
      const t2 = mesh(tapeFront, M.accent, false); t2.position.set(0, S - 0.13, S / 2 + 0.006); b.add(t2);
      return { b, x, y, ry };
    });
    return {
      group, enter: 1.4, exit: 0.7,
      update(p, local) {
        const e = pop(range(p, 0.12, 0.6), 1.3);
        shelf.position.y = TOP - (1 - e) * 2.4;
        shelf.visible = e > 0.01;
        boxes.forEach(({ b, x, y, ry }, k) => {
          const land = 0.14 + k * 0.085;
          const d = easeOut(range(local, land - 0.12, land));
          b.visible = d > 0 && p > 0.6;
          b.position.set(x, TOP + y + Math.sin(Math.PI * d) * 0.12, lerp(2.6, 0, d));
          b.rotation.y = ry + (1 - d) * 0.5;
          b.scale.setScalar(pop(range(p, 0.6, 0.9), 2));
        });
      },
    };
  }

  // Contact: an envelope lands, opens, and the letter turns into a paper plane that loops around.
  function makeContact() {
    const group = new THREE.Group();
    const env = new THREE.Group();
    group.add(env);
    const body = mesh(rbox(2.1, 1.36, 0.16, 0.08, 5), M.white);
    body.position.y = 0.68;
    env.add(body);
    const seam = rbox(1.17, 0.04, 0.02, 0.015);
    [-1, 1].forEach((sg) => { const m = mesh(seam, M.tint, false); m.position.set(sg * 0.5, 0.37, 0.085); m.rotation.z = -sg * 0.54; env.add(m); });
    const flapGeo = new THREE.ExtrudeGeometry(poly([[-1.04, 0], [1.04, 0], [0, -0.74]]), { depth: 0.035, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.02, bevelSegments: 4 });
    const hinge = new THREE.Group();
    hinge.position.set(0, 1.34, 0.085);
    env.add(hinge);
    hinge.add(mesh(flapGeo, M.pale));
    const letter = new THREE.Group();
    env.add(letter);
    letter.add(mesh(rbox(1.8, 1.1, 0.04, 0.04), M.white));
    [0.3, 0.15, 0, -0.15].forEach((y, i) => { const l = mesh(rbox(i === 3 ? 0.7 : 1.2, 0.045, 0.01, 0.004), i === 3 ? M.accent : M.tint, false); l.position.set(i === 3 ? -0.25 : 0, y, 0.025); letter.add(l); });
    const paper = new THREE.MeshStandardMaterial({ color: '#f7faf7', roughness: 0.78, side: THREE.DoubleSide, flatShading: true, clippingPlanes: [clipTop], clipShadows: true });
    const plane = mesh(GEO.plane, paper);
    group.add(plane);

    const RX = 2.1, RZ = 1.4, YB = TOP + 2.35, TH0 = Math.PI / 2, TK = 1.3;
    const loop = (th, out) => out.set(RX * Math.cos(th), YB + 0.22 * Math.sin(2 * th), RZ * Math.sin(th));
    const S0 = new THREE.Vector3(0, TOP + 1.95, 0.15);
    const E = loop(TH0, new THREE.Vector3());
    const C1 = S0.clone().add(new THREE.Vector3(0.2, 0.9, 0.5));
    const C2 = E.clone().add(new THREE.Vector3(1.0, 0, 0));
    const tmp = new THREE.Vector3(), ahead = new THREE.Vector3();
    function path(u, out) {
      if (u >= TK) return loop(TH0 + (u - TK) * 0.95, out);
      const s = u / TK, r = 1 - s;
      return out.set(0, 0, 0)
        .addScaledVector(S0, r * r * r).addScaledVector(C1, 3 * r * r * s)
        .addScaledVector(C2, 3 * r * s * s).addScaledVector(E, s * s * s);
    }
    let launch = null;
    return {
      group, enter: 1.4, exit: 0.7,
      update(p, local, t) {
        const d = range(p, 0.25, 0.85);
        env.visible = d > 0;
        env.position.set(0, TOP + (1 - land(d)) * 2.8, 0);
        env.rotation.set(0, -0.1, wobble((d - LAND) * 0.7, 11, 4) * 0.1);
        hinge.rotation.x = -easeInOut(range(local, 0.12, 0.32)) * Math.PI * 0.94;
        letter.position.set(0, 0.68 + easeOut(range(local, 0.28, 0.46)) * 0.95, 0);
        letter.scale.setScalar(reduce ? 1 : Math.max(0.001, 1 - smooth(range(local, 0.46, 0.52))));
        if (local >= 0.5 && p > 0.9 && !reduce) {
          if (flightOverride !== null) launch = t - flightOverride;
          else if (launch === null) launch = t;
        } else if (local < 0.47 || p < 0.5) launch = null;
        plane.visible = launch !== null;
        if (plane.visible) {
          const u = t - launch;
          path(u, tmp);
          plane.position.copy(tmp);
          path(u + 0.05, ahead);
          group.localToWorld(ahead);
          plane.lookAt(ahead);
          plane.rotateZ(-0.45 * smooth(range(u, 0.6, TK + 0.4)));
          plane.scale.setScalar(0.92 * Math.min(1, u * 4 + 0.2));
        }
      },
    };
  }

  /* ---------- stage, chapters, framing ---------- */
  const stage = new THREE.Group();
  scene.add(stage);
  const plinth = makePlinth();
  stage.add(plinth.group);
  const shadow = makeContactShadow();
  scene.add(shadow.group);

  const chapters = [...document.querySelectorAll('[data-chapter]')];
  const N = chapters.length;
  const NAMES = chapters.map((el) => el.dataset.chapter);
  const SIDES = chapters.map((el) => el.dataset.side);
  const sideOf = (i) => (SIDES[i] === 'left' ? -1 : 1);
  const FACTORY = { hero: makeHero, about: makeDesk, skills: makeStack, experience: makeKanban, crm: makeMonitor, jd: makeJD, texport: makeTexPort, inventory: makeShelf, contact: makeContact };
  const EX = NAMES.map((name, i) => FACTORY[name](sideOf(i)));
  EX.forEach((ex) => stage.add(ex.group));
  const HERO = EX[NAMES.indexOf('hero')];

  // Plinth length L and radius R, camera angle, the height it looks at, and the half-size of what must stay in frame.
  const CFG = {
    heroStart: { L: 0, R: 1.7, yaw: 0.4, cy: 1.15, hw: 1.9, hd: 1.75, hh: 1.25 },
    hero: { L: 5.4, R: 1.45, yaw: 0.2, cy: 1.02, hw: 4.5, hd: 1.5, hh: 1.35 },
    about: { L: 1.8, R: 1.45, yaw: 0.46, cy: 1.2, hw: 2.5, hd: 1.6, hh: 1.3 },
    skills: { L: 1.4, R: 1.45, yaw: 0.46, cy: 1.55, hw: 2.2, hd: 1.5, hh: 1.75 },
    experience: { L: 2.6, R: 1.45, yaw: 0.46, cy: 1.55, hw: 2.9, hd: 1.45, hh: 1.65 },
    crm: { L: 2.4, R: 1.4, yaw: 0.46, cy: 1.7, hw: 2.6, hd: 1.4, hh: 1.8 },
    jd: { L: 1.9, R: 1.35, yaw: 0.46, cy: 1.6, hw: 2.5, hd: 1.4, hh: 1.8 },
    texport: { L: 0, R: 1.3, yaw: 0.46, cy: 1.5, hw: 1.5, hd: 1.3, hh: 1.65 },
    inventory: { L: 1.8, R: 1.45, yaw: 0.46, cy: 1.5, hw: 2.3, hd: 1.5, hh: 1.65 },
    contact: { L: 0.8, R: 1.4, yaw: 0.46, cy: 1.6, hw: 2.45, hd: 1.6, hh: 1.75 },
  };
  function cfgAt(i) {
    let o = CFG[NAMES[i]];
    if (NAMES[i] === 'hero') {
      const m = easeInOut(range(introT, SLIDE[0], SLIDE[1])), a = CFG.heroStart, b = CFG.hero;
      o = {};
      for (const k in b) o[k] = lerp(a[k], b[k], m);
    }
    return { ...o, side: sideOf(i) };
  }

  const slotEls = chapters.map((el) => el.querySelector('.hero__stage, .slot'));
  let phone = false, CW = 1, CH = 1, cols = { l0: 0, l1: 0, r0: 0, r1: 0 };
  let slots = chapters.map(() => ({ x0: 0, x1: 1, y0: 0, y1: 1 })); // each chapter's slot, in page coordinates
  let anchors = new Array(N + 1).fill(0); // one per chapter, plus the end of the page
  // A slot belongs to the page: it scrolls away with its copy, and the stage travels to the next one.
  const slotArea = (i, inset) => { const { x0, x1, y0, y1 } = slots[i]; return { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 - window.scrollY, w: x1 - x0 - inset, h: y1 - y0 - 12 }; };
  let headerB = 0, zoneB = 0; // on phones: the pinned stage sits between the header and the top of the copy
  function areaAt(i) {
    if (phone) {
      const top = headerB + 8, bottom = zoneB - 8;
      return { cx: CW / 2, cy: (top + bottom) / 2, w: CW - 24, h: bottom - top };
    }
    if (NAMES[i] === 'hero') return slotArea(i, 24);
    const right = SIDES[i] === 'right';
    const x0 = right ? cols.r0 + 8 : Math.max(0, cols.l0 - 56);
    const x1 = right ? Math.min(CW, cols.r1 + 56) : cols.l1 - 8;
    const y0 = CH * 0.13, y1 = CH * 0.87;
    return { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, w: x1 - x0, h: y1 - y0 };
  }
  function layout() {
    phone = window.innerWidth <= 760;
    const r = canvas.getBoundingClientRect();
    CW = Math.max(1, r.width);
    CH = Math.max(1, r.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(CW, CH, false);
    camera.aspect = CW / CH;
    slots = slotEls.map((el) => { const b = el.getBoundingClientRect(); return { x0: b.left, x1: b.right, y0: b.top + window.scrollY, y1: b.bottom + window.scrollY }; });
    headerB = document.querySelector('.top').getBoundingClientRect().bottom - r.top;
    zoneB = parseFloat(getComputedStyle(document.querySelector('main')).paddingTop) || 0;
    const maxY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    anchors = chapters.map((el, i) => {
      if (i === 0) return 0;
      const top = el.getBoundingClientRect().top + window.scrollY;
      // On phones a chapter arrives when its copy reaches the stage; on desktop when it is centred.
      return clamp(phone ? top - zoneB : top + el.offsetHeight / 2 - window.innerHeight / 2, 0, maxY);
    });
    anchors.push(maxY);
    for (let i = 1; i <= N; i++) anchors[i] = Math.max(anchors[i], anchors[i - 1] + 1);
    const grid = chapters[1].querySelector('.chapter__grid');
    const gr = grid.getBoundingClientRect(), cs = getComputedStyle(grid);
    const left = gr.left + parseFloat(cs.paddingLeft), width = gr.width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const gap = parseFloat(cs.columnGap) || 0, col = (width - gap) / 2;
    cols = { l0: left, l1: left + col, r0: left + col + gap, r1: left + width };
  }
  // Scroll position to story position s: 0 at the hero, i at chapter i, up to N at the very end of the page.
  function sFromScroll(y) {
    if (y <= anchors[0]) return 0;
    for (let i = 0; i < N; i++) if (y < anchors[i + 1]) return i + (y - anchors[i]) / (anchors[i + 1] - anchors[i]);
    return N;
  }
  function yFromS(s) {
    const i = clamp(Math.floor(s), 0, N);
    return i >= N ? anchors[N] : anchors[i] + (s - i) * (anchors[i + 1] - anchors[i]);
  }

  /* ---------- loop ---------- */
  const P = new Float32Array(N);
  P[0] = 1;
  let active = 0, sS = 0, t = 0, paused = false, hasMouse = false;
  const mouse = new THREE.Vector2(-9, -9), look = new THREE.Vector2(0, 0);
  const raycaster = new THREE.Raycaster();
  const letterMeshes = HERO.letters.map((l) => l.mesh);
  const ELEV = 0.36;
  const navLinks = [...document.querySelectorAll('[data-nav]')];
  const NAV = { about: 'about', skills: 'about', experience: 'about', crm: 'work', jd: 'work', texport: 'work', inventory: 'work', contact: 'contact' };
  let navNow = '';

  function step(dt) {
    active = clamp(Math.floor(sS + 0.5), 0, N - 1);
    const i0 = clamp(Math.floor(sS), 0, N - 1), i1 = Math.min(N - 1, i0 + 1);
    // Chapters hand over mid-scroll, except the hero on desktop, whose stage leaves with the headline before the next one arrives.
    const u = sS - i0;
    const w0 = phone ? 0.7 : i0 === 0 ? 0.6 : 0.2, w1 = phone ? 0.98 : i0 === 0 ? 1 : 0.8;
    const f = smooth(range(u, w0, w1));
    const c0 = cfgAt(i0), c1 = cfgAt(i1), cfg = {};
    for (const k in c0) cfg[k] = lerp(c0[k], c1[k], f);
    // On desktop the hero stage follows the mouse a little.
    const par = !phone && hasMouse && !reduce ? P[0] * (1 - f) : 0;
    if (hasMouse) { look.x += (clamp(mouse.x, -1, 1) - look.x) * (1 - Math.exp(-dt * 5)); look.y += (clamp(mouse.y, -1, 1) - look.y) * (1 - Math.exp(-dt * 5)); }
    const yaw = lerp(c0.yaw * c0.side, c1.yaw * c1.side, f) * (phone ? 0.72 : 1) + look.x * 0.07 * par;
    const elev = ELEV - look.y * 0.04 * par;
    const a0 = areaAt(i0), a1 = areaAt(i1);
    const area = { cx: lerp(a0.cx, a1.cx, f), cy: lerp(a0.cy, a1.cy, f), w: lerp(a0.w, a1.w, f), h: lerp(a0.h, a1.h, f) };

    const travel = !phone && i0 !== i1 ? Math.sin(Math.PI * f) : 0;
    stage.position.y = travel * 0.22;
    clipTop.constant = -(TOP + stage.position.y);
    plinth.set(cfg.L, cfg.R);
    shadow.set(cfg.L, cfg.R);
    shadow.mat.opacity = 0.26 * (1 - travel * 0.6);

    const tanV = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)), tanH = tanV * CW / CH;
    const cyw = Math.cos(yaw), syw = Math.abs(Math.sin(yaw));
    const pw = cfg.hw * cyw + cfg.hd * syw;
    const ph = cfg.hh * Math.cos(elev) + (cfg.hw * syw + cfg.hd * cyw) * Math.sin(elev);
    // While the stage crosses from one side to the other it backs away a little, so it stays clear of the copy.
    const dist = 1.04 * (1 + travel * 0.4) * Math.max((pw * CW) / (tanH * area.w), (ph * CH) / (tanV * area.h));
    camera.position.set(Math.sin(yaw) * Math.cos(elev) * dist, cfg.cy + Math.sin(elev) * dist, Math.cos(yaw) * Math.cos(elev) * dist);
    camera.lookAt(0, cfg.cy, 0);
    camera.setViewOffset(CW, CH, CW / 2 - area.cx, CH / 2 - area.cy, CW, CH);
    // The key light mirrors with the side, so shadows always fall away from the copy.
    key.position.set(KEY.x * cfg.side, KEY.y, KEY.z);

    // The current exhibit sinks just before the stage sets off, and the next one rises only once the stage has arrived.
    const arrived = f >= 0.85, settled = u < w0 - 0.05;
    for (let i = 0; i < N; i++) {
      const ex = EX[i];
      const target = i0 === i1 ? (i === i0 ? 1 : 0) : (i === i0 && settled) || (i === i1 && arrived) ? 1 : 0;
      if (!paused || snap) P[i] = reduce || snap ? target : clamp(P[i] + (target > P[i] ? dt / ex.enter : -dt / ex.exit));
      ex.group.visible = P[i] > 0.001;
      if (ex.group.visible) {
        // A scene plays as its chapter scrolls past the stage.
        const local = phone ? range(sS, i - 0.12, i + 0.75) : range(sS, i - 0.42, i + 0.3);
        exiting = target === 0;
        ex.update(smooth(P[i]), local, t);
      }
    }
    const nav = NAV[NAMES[active]] || '';
    if (nav !== navNow) {
      navNow = nav;
      navLinks.forEach((a) => { if (a.dataset.nav === nav) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
    }
  }

  function pick() {
    if (phone || paused || introT < 3.3 || !HERO.group.visible) return null;
    raycaster.setFromCamera(mouse, camera);
    const hit = raycaster.intersectObjects(letterMeshes, false)[0];
    return hit ? HERO.letters[letterMeshes.indexOf(hit.object)] : null;
  }
  function hover() {
    if (!hasMouse) return;
    const L = pick();
    if (L && t - L.hoverAt > 0.85) L.hoverAt = t;
  }

  let last = window.performance.now(), raf = 0, disposed = false;
  function frame(now) {
    if (disposed) return;
    raf = window.requestAnimationFrame(frame);
    if (paused) return;
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;
    if (!reduce) {
      t += dt;
      introT += dt;
    }
    const s = sFromScroll(window.scrollY);
    sS = reduce ? s : sS + (s - sS) * (1 - Math.exp(-dt * 6));
    if (Math.abs(s - sS) < 1e-4) sS = s;
    step(dt);
    renderer.render(scene, camera);
    hover();
  }

  const setMouse = (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  };
  const onPointerMove = (e) => {
    if (e.pointerType !== 'mouse') return;
    hasMouse = true;
    setMouse(e);
  };
  const onPointerDown = (e) => {
    if (e.pointerType !== 'mouse' || e.target.closest('a, button, input, textarea, label')) return;
    setMouse(e);
    const L = pick();
    if (L && t - L.spinAt > 0.8) L.spinAt = t;
  };
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerdown', onPointerDown, { passive: true });
  window.addEventListener('resize', layout);
  const resizeObserver = new window.ResizeObserver(() => { if (!disposed) layout(); });
  resizeObserver.observe(document.body);
  document.fonts?.ready.then(() => { if (!disposed) layout(); });

  layout();
  sS = sFromScroll(window.scrollY);
  if (sS > 0.5) { introT = 12; P[0] = 0; }
  step(0);
  renderer.render(scene, camera);
  document.documentElement.classList.add('is-live');
  raf = window.requestAnimationFrame((now) => { last = now; frame(now); });

  if (debug) {
    window.__clay = {
      anchors: () => anchors.slice(),
      debugState: () => ({
        cam: camera.position.toArray().map((v) => +v.toFixed(3)),
        letters: HERO.letters.map((L) => L.pivot.position.toArray().map((v) => +v.toFixed(3)).concat(L.pivot.scale.y)),
        heroVisible: HERO.group.visible,
        P: Array.from(P).map((v) => +v.toFixed(2)),
      }),
      pose({ s = 0, time = 6, intro = 10, p = null, flight = null } = {}) {
        paused = true;
        layout();
        window.scrollTo({ top: yFromS(s), behavior: 'instant' });
        sS = s; t = time; introT = intro; flightOverride = flight;
        if (p) for (let i = 0; i < N; i++) P[i] = p[i] ?? 0;
        snap = !p;
        step(0);
        snap = false;
        renderer.render(scene, camera);
        return { active, y: window.scrollY, anchors: anchors.slice() };
      },
    };
    window.__clayReady = true;
  }

  return function dispose() {
    disposed = true;
    window.cancelAnimationFrame(raf);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerdown', onPointerDown);
    window.removeEventListener('resize', layout);
    resizeObserver.disconnect();
    document.documentElement.classList.remove('is-live');
    scene.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (!obj.material) return;
      const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
      materials.forEach((mat) => {
        if (mat.map) mat.map.dispose();
        mat.dispose();
      });
    });
    scene.environment.dispose();
    pmrem.dispose();
    renderer.dispose();
    if (debug) {
      delete window.__clay;
      delete window.__clayReady;
    }
  };

}
