// The clay stage: one Three.js scene behind the page. Each section (an element with data-chapter)
// gets its own clay object; scrolling moves the plinth between sides and swaps the objects.
// createClayScene(canvas) starts it and returns a function that stops it and frees the GPU memory.
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
  function bounce(x) {
    const n = 7.5625, d = 2.75;
    if (x < 1 / d) return n * x * x;
    if (x < 2 / d) return n * (x -= 1.5 / d) * x + 0.75;
    if (x < 2.5 / d) return n * (x -= 2.25 / d) * x + 0.9375;
    return n * (x -= 2.625 / d) * x + 0.984375;
  }

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
  const floor = new THREE.Mesh(new THREE.CircleGeometry(6.6, 72), new THREE.ShadowMaterial({ color: 0x0d1a45, opacity: 0.22 }));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const small = Math.min(window.innerWidth, window.innerHeight) < 600;
  const KEY = new THREE.Vector3(-6, 9, 5);
  const key = new THREE.DirectionalLight(0xffffff, 2.6);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024); // the shadows are very soft, so a small map is enough and keeps laptops cool
  Object.assign(key.shadow.camera, { left: -7.5, right: 7.5, top: 7.5, bottom: -7.5, near: 0.5, far: 40 });
  key.shadow.radius = 9;
  key.shadow.blurSamples = small ? 8 : 12;
  key.shadow.bias = -0.0004;
  scene.add(key, key.target);

  /* ---------- clay ---------- */
  const TOP = 0.34; // plinth height; everything stands on it and can sink into it
  const clipTop = new THREE.Plane(new THREE.Vector3(0, 1, 0), -TOP);
  const clay = (color, roughness = 0.88) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness: 0, clippingPlanes: [clipTop], clipShadows: true });
  const M = {
    plinth: new THREE.MeshStandardMaterial({ color: '#b8c7e8', roughness: 0.88, metalness: 0 }),
    white: clay('#eef2fb'),
    blue: clay('#2f55c4', 0.62),
    pale: clay('#dbe4f7'),
    tint: clay('#a6b8e2'),
    navy: clay('#22346f', 0.7),
  };
  const own = (base) => { const m = base.clone(); m.clippingPlanes = [clipTop]; return m; };
  const C = { white: new THREE.Color('#eef2fb'), blue: new THREE.Color('#2f55c4'), tint: new THREE.Color('#a6b8e2') };

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
    D: extrude(shapeD(), 0.46, 0.1, 72),
    I: extrude(poly([[0, 0], [0.44, 0], [0.44, 2], [0, 2]]), 0.46),
    V: extrude(poly([[0, 2], [0.47, 2], [0.75, 0.923], [1.03, 2], [1.5, 2], [0.98, 0], [0.52, 0]]), 0.46),
    Y: extrude(poly([[0, 2], [0.47, 2], [0.75, 1.44], [1.03, 2], [1.5, 2], [0.97, 0.94], [0.97, 0], [0.53, 0], [0.53, 0.94]]), 0.46),
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
    grd.addColorStop(0, 'rgba(13,26,69,1)');
    grd.addColorStop(0.45, 'rgba(13,26,69,0.45)');
    grd.addColorStop(1, 'rgba(13,26,69,0)');
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
  let introT = reduce ? 12 : -0.35;
  let flightOverride = null;

  // Hero: the cursor clicks the clay D and drags it left; I, V, Y rise out of the stage as the cursor sweeps past.
  const DRAG = [1.3, 2.0], SWEEP = [2.0, 2.75];
  function makeHero() {
    const group = new THREE.Group();
    const letters = [['D', -2.53], ['I', -0.96], ['V', 0.55], ['Y', 2.59]].map(([k, x]) => {
      const pivot = new THREE.Group();
      const m = mesh(GEO[k], M.white);
      pivot.add(m);
      group.add(pivot);
      return { pivot, mesh: m, x, hoverAt: -9, riseAt: 0 };
    });
    const pointer = mesh(GEO.pointer, M.blue);
    pointer.rotation.set(-Math.PI / 2, 0, 0.55);
    group.add(pointer);
    // Tip positions are chosen so the cursor's body always stays on the stand.
    const START = new THREE.Vector3(0.35, 0, 0.43), REST = new THREE.Vector3(1.0, 0, 0.55);
    const GRAB_END = new THREE.Vector3(-2.53 + 0.42, 0, 0.5);
    const VISIT = [3, 2, 1, 0]; // after the intro the cursor taps Y, V, I, D once, then rests
    const IDLE0 = 3.3, CYCLE = 1.5;
    const tip = new THREE.Vector3(), from = new THREE.Vector3(), to = new THREE.Vector3(), grab = new THREE.Vector3();
    const visit = (k, out) => out.set(letters[k].x - 0.3, 0, 0.55);
    // Each letter starts rising just before the sweeping cursor reaches it.
    letters.forEach((L) => {
      let lo = 0, hi = 1;
      const goal = range(L.x - 0.5, GRAB_END.x, REST.x);
      for (let i = 0; i < 24; i++) { const mid = (lo + hi) / 2; if (easeInOut(mid) < goal) lo = mid; else hi = mid; }
      L.riseAt = lerp(SWEEP[0], SWEEP[1], lo);
    });
    return {
      group, letters, enter: 0.9, exit: 0.6,
      update(p, local, t) {
        const ti = introT;
        const m = easeInOut(range(ti, DRAG[0], DRAG[1]));
        const dX = lerp(-0.12, -2.53, m), dZ = lerp(-0.1, 0, m), dR = lerp(-0.32, 0, m);
        grab.set(dX + 0.42, 0, dZ + 0.5);
        let lift = 0, idleTarget = -1, idleTau = -1;
        if (ti < SWEEP[0]) {
          tip.lerpVectors(START, grab, easeInOut(range(ti, 0.45, 1.0)));
          lift = Math.sin(Math.PI * range(ti, 1.0, 1.3)) * 0.16;
        } else if (ti < IDLE0) {
          const g = easeInOut(range(ti, SWEEP[0], SWEEP[1]));
          tip.lerpVectors(GRAB_END, REST, g);
          lift = Math.sin(Math.PI * g) * 0.1;
        } else {
          // One round only: tap each letter once, go back to rest and stay there.
          const c = (ti - IDLE0) / CYCLE, n = Math.floor(c), ph = c - n, last = VISIT.length;
          if (n > last) tip.copy(REST);
          else {
            if (n === 0) from.copy(REST); else visit(VISIT[n - 1], from);
            if (n === last) to.copy(REST); else visit(VISIT[n], to);
            const mv = easeInOut(range(ph, 0, n === last ? 0.6 : 0.32));
            tip.lerpVectors(from, to, mv);
            lift = Math.sin(Math.PI * mv) * 0.14;
            if (n < last) {
              lift += Math.sin(Math.PI * range(ph, 0.34, 0.46)) * 0.1;
              idleTarget = VISIT[n];
              idleTau = (ph - 0.4) * CYCLE;
            }
          }
        }
        const sinkP = (1 - easeInOut(range(p, 0, 0.5))) * 0.5;
        pointer.position.set(tip.x, TOP + 0.11 + lift - sinkP, tip.z);

        letters.forEach((L, k) => {
          let x = L.x, z = 0, ry = 0, y = TOP, sq = 0;
          if (k === 0) {
            x = dX; z = dZ; ry = dR;
            sq += wobble(ti - 1.12, 17, 6) * 0.12 + wobble(ti - DRAG[1], 15, 6) * 0.07;
          } else {
            const st = L.riseAt;
            y += (backOut(range(ti, st, st + 0.6), 1.9) - 1) * 2.45;
            sq += wobble(ti - (st + 0.6), 17, 7) * 0.09;
          }
          const h1 = idleTarget === k ? hop(idleTau) : ZERO;
          const h2 = hop(t - L.hoverAt);
          y += Math.max(h1.y, h2.y);
          sq += h1.sq + h2.sq;
          y -= (1 - easeInOut(range(p, k * 0.1, k * 0.1 + 0.7))) * 2.5;
          L.pivot.position.set(x, y, z);
          L.pivot.rotation.y = ry;
          L.pivot.scale.set(1 + sq * 0.5, 1 - sq, 1 + sq * 0.5);
          L.pivot.visible = y > TOP - 2.4;
        });
      },
    };
  }

  // About: a map pin drops on Mehsana and pings.
  function makeAbout() {
    const group = new THREE.Group();
    const holder = new THREE.Group();
    group.add(holder);
    const pin = mesh(GEO.pin, M.blue);
    pin.position.y = -0.1;
    holder.add(pin);
    const ringGeo = new THREE.TorusGeometry(1, 0.02, 8, 96);
    const rings = [0, 0.5].map((off) => {
      const mat = new THREE.MeshBasicMaterial({ color: '#2f55c4', transparent: true, opacity: 0, depthWrite: false });
      const r = new THREE.Mesh(ringGeo, mat);
      r.rotation.x = Math.PI / 2;
      r.position.y = TOP + 0.012;
      group.add(r);
      return { r, mat, off };
    });
    const dotGeo = new THREE.SphereGeometry(0.075, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2);
    const dots = [[-0.92, 0.3], [0.78, -0.5], [-0.3, -0.88], [0.95, 0.42], [-0.98, -0.42]].map(([x, z]) => {
      const d = mesh(dotGeo, M.tint, false);
      d.position.set(x, TOP, z);
      group.add(d);
      return d;
    });
    return {
      group, enter: 1.3, exit: 0.45,
      update(p, local, t) {
        const f = range(p, 0.28, 0.9);
        const sq = wobble((f - 1 / 2.75) * 0.8, 20, 6) * 0.14;
        holder.visible = f > 0;
        holder.position.set(0, TOP + (1 - bounce(f)) * 3.4, 0);
        holder.scale.set(1 + sq * 0.5, 1 - sq, 1 + sq * 0.5);
        holder.rotation.y = 0.35 + (local - 0.5) * 1.3;
        // One ping as the pin lands, not a loop.
        rings.forEach(({ r, mat, off }) => {
          const k = range(p, 0.52 + off * 0.24, 0.9 + off * 0.2);
          r.scale.setScalar(lerp(0.25, 1.3, easeOut(k)));
          mat.opacity = k > 0 && k < 1 ? (1 - k) * 0.5 : 0;
          r.visible = mat.opacity > 0.001;
        });
        dots.forEach((d, j) => d.scale.setScalar(backOut(range(p, 0.6 + j * 0.05, 0.8 + j * 0.05), 2.4)));
      },
    };
  }

  // Skills: code brackets spin open and the slash drops between them.
  function makeSkills() {
    const group = new THREE.Group();
    const holder = (geo, mat) => { const g = new THREE.Group(); g.add(mesh(geo, mat)); group.add(g); return g; };
    const A = holder(GEO.lt, M.white), B = holder(GEO.slash, M.blue), Cc = holder(GEO.gt, M.white);
    return {
      group, enter: 1.2, exit: 0.45,
      update(p, local, t) {
        const a = range(p, 0.25, 0.8);
        const spread = backOut(a, 1.5) * 1.55;
        const s = backOut(range(p, 0.25, 0.6), 2.2);
        A.position.set(-spread, TOP, 0);
        Cc.position.set(spread, TOP, 0);
        A.scale.setScalar(s);
        Cc.scale.setScalar(s);
        A.rotation.y = (1 - easeOut(a)) * 2.4;
        Cc.rotation.y = -(1 - easeOut(a)) * 2.4;
        const b = range(p, 0.5, 1);
        B.visible = b > 0;
        B.position.set(0, TOP + (1 - bounce(b)) * 3.0, 0);
        B.rotation.set(0, (1 - easeOut(b)) * Math.PI * 2, 0);
        group.rotation.y = (local - 0.5) * 0.9;
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
      const head = mesh(rbox(0.98, 0.13, 0.05, 0.03), j === 3 ? M.blue : M.tint, false);
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
      const dot = mesh(dotGeo, j % 2 ? M.tint : M.blue, false); dot.position.set(-0.3, 0, 0.06); c.add(dot);
      const b1 = mesh(barGeo, M.tint, false); b1.position.set(0.05, 0.06, 0.055); c.add(b1);
      const b2 = mesh(barGeo2, M.tint, false); b2.position.set(-0.02, -0.06, 0.055); c.add(b2);
      const badge = mesh(badgeGeo, M.blue, false); badge.rotation.x = Math.PI / 2; badge.position.set(0.31, 0, 0.065); c.add(badge);
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
      group, enter: 1.3, exit: 0.45,
      update(p, local) {
        const e = range(p, 0.2, 0.75);
        stand.rotation.x = -(1 - backOut(e, 1.3)) * Math.PI / 2;
        stand.scale.setScalar(range(p, 0, 0.2));
        feet.forEach((f) => f.scale.setScalar(backOut(range(p, 0.1, 0.35), 2)));
        const T = range(local, 0.2, 0.85) * 3;
        const k = Math.min(2, Math.floor(T)), u = easeInOut(T - k);
        cards.forEach(({ c, badge }, j) => {
          const [l0, r0] = KF[k][j], [l1, r1] = KF[k + 1][j];
          const [x0, y0] = slot(l0, r0), [x1, y1] = slot(l1, r1);
          const moving = l0 !== l1 ? Math.sin(Math.PI * u) : 0;
          c.position.set(lerp(x0, x1, u), lerp(y0, y1, u) + moving * 0.12, 0.17 + moving * 0.32);
          c.rotation.z = -moving * 0.1;
          c.scale.setScalar(backOut(range(p, 0.5 + j * 0.05, 0.72 + j * 0.05), 2));
          badge.scale.setScalar(backOut(range(lerp(l0, l1, u), 2.6, 3), 2.5));
        });
      },
    };
  }

  // CRM dashboards: bars grow, a magnifier searches across them, and scrolling sorts them.
  function makeCRM() {
    const group = new THREE.Group();
    const H = [1.3, 0.7, 2.0, 1.0, 1.6], SX = [-1.44, -0.72, 0, 0.72, 1.44];
    const goal = [];
    H.map((h, i) => i).sort((a, b) => H[a] - H[b]).forEach((bar, slotIndex) => (goal[bar] = slotIndex));
    const bars = H.map((h) => {
      const geo = rbox(0.52, h, 0.52, 0.08, 4);
      geo.translate(0, h / 2, 0);
      const mat = own(M.white);
      const m = mesh(geo, mat);
      group.add(m);
      return { m, mat };
    });
    const mag = new THREE.Group();
    group.add(mag);
    mag.add(mesh(new THREE.TorusGeometry(0.34, 0.075, 18, 56), M.blue));
    mag.add(new THREE.Mesh(new THREE.CircleGeometry(0.34, 40), new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.15, transparent: true, opacity: 0.3, clippingPlanes: [clipTop] })));
    const handle = mesh(rbox(0.13, 0.62, 0.13, 0.06), M.blue);
    handle.position.set(0.42, -0.5, 0);
    handle.rotation.z = 0.7;
    mag.add(handle);
    return {
      group, enter: 1.2, exit: 0.45,
      update(p, local, t) {
        const q = easeInOut(range(local, 0.3, 0.72));
        const mx = lerp(-1.6, 1.6, range(local, 0.08, 0.92));
        bars.forEach(({ m, mat }, j) => {
          m.scale.set(1, Math.max(0.001, backOut(range(p, 0.25 + j * 0.06, 0.6 + j * 0.06), 1.6)), 1);
          const x = lerp(SX[j], SX[goal[j]], q);
          m.position.set(x, TOP, Math.sin(Math.PI * q) * 0.55 * Math.sign(goal[j] - j));
          const near = 1 - range(Math.abs(x - mx), 0.12, 0.5);
          mat.color.copy(C.white).lerp(C.blue, smooth(near) * range(p, 0.6, 1));
        });
        const mi = range(p, 0.55, 0.95);
        mag.position.set(mx + (1 - easeOut(mi)) * 2.5, TOP + 2.75, 0.32);
        mag.rotation.set(-0.1, -0.2, 0.05);
        mag.scale.setScalar(backOut(mi, 1.6));
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
      return add(g, M.blue, -1.24, y, 0.115);
    });
    const button = add(rbox(0.86, 0.3, 0.1, 0.08), M.blue, 0.87, 0.27, 0.1, true);
    const feet = [-1.15, 1.15].map((x) => { const f = mesh(rbox(0.6, 0.12, 0.7, 0.05), M.white); f.position.set(x, TOP + 0.06, 0); group.add(f); return f; });
    const piece = mesh(GEO.puzzle, M.blue);
    group.add(piece);
    const pointer = mesh(GEO.pointer, M.blue);
    group.add(pointer);
    const badge = new THREE.Group();
    group.add(badge);
    const disc = mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.12, 40), M.blue);
    disc.rotation.x = Math.PI / 2;
    badge.add(disc);
    const tick = mesh(GEO.check, M.white, false);
    tick.scale.setScalar(0.42);
    tick.position.set(0, -0.19, 0.07);
    badge.add(tick);
    const SLOT = new THREE.Vector3(1.5, TOP + 0.12 + 2.14 - 0.2, 0.17), PSTART = new THREE.Vector3(3.2, TOP + 3.6, 1.6);
    const TIPA = new THREE.Vector3(2.7, TOP + 1.0, 1.5), TIPB = new THREE.Vector3(0.98, TOP + 0.38, 0.24);
    return {
      group, enter: 1.25, exit: 0.45,
      update(p, local) {
        const e = range(p, 0.25, 0.85);
        win.visible = e > 0;
        win.scale.set(lerp(0.25, 1, easeOut(e)), Math.max(0.001, backOut(e, 2.2)), 1);
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
    put(rbox(1.36, 2.72, 0.16, 0.2, 5), M.navy, 0, 1.36, 0, ph, true);
    put(rbox(1.2, 2.54, 0.04, 0.13), M.white, 0, 1.36, 0.075);
    put(rbox(0.32, 0.07, 0.02, 0.03), M.navy, 0, 2.5, 0.1);
    put(rbox(1.0, 0.16, 0.03, 0.05), M.blue, 0, 2.24, 0.1);
    put(rbox(0.9, 0.2, 0.03, 0.08), M.blue, 0, 0.3, 0.1);
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
      group, enter: 1.25, exit: 0.45,
      update(p, local, t) {
        const e = range(p, 0.25, 0.9);
        ph.position.set(0, TOP - (1 - backOut(range(p, 0.25, 0.65), 1.4)) * 2.9, 0);
        ph.rotation.y = lerp(-Math.PI * 1.25, 0.22, easeOut(e));
        rows.forEach(({ r, pillMat, knob }, k) => {
          r.scale.x = Math.max(0.001, backOut(range(local, 0.12 + k * 0.08, 0.26 + k * 0.08), 1.4));
          const on = smooth(range(local, 0.46 + k * 0.08, 0.54 + k * 0.08));
          knob.position.x = lerp(0.765, 0.875, on);
          pillMat.color.copy(C.tint).lerp(C.blue, on);
        });
      },
    };
  }

  // Inventory: boxes drop and stack as you scroll.
  function makeBoxes() {
    const group = new THREE.Group();
    const S = 0.8;
    const geo = rbox(S, S, S, 0.07, 4);
    const tapeTop = rbox(0.2, 0.02, S + 0.012, 0.008), tapeFront = rbox(0.2, 0.3, 0.02, 0.008);
    const SPOTS = [[-0.86, 0, 0.12, 0.06], [0, 0, -0.06, -0.09], [0.86, 0, 0.08, 0.1], [-0.43, 1, 0.02, -0.05], [0.43, 1, 0, 0.07], [0, 2, 0.02, 0.04]];
    const boxes = SPOTS.map(([x, lvl, z, ry]) => {
      const b = new THREE.Group();
      group.add(b);
      const cube = mesh(geo, M.white);
      cube.position.y = S / 2;
      b.add(cube);
      const t1 = mesh(tapeTop, M.blue, false); t1.position.set(0, S + 0.005, 0); b.add(t1);
      const t2 = mesh(tapeFront, M.blue, false); t2.position.set(0, S - 0.15, S / 2 + 0.006); b.add(t2);
      return { b, x, y: TOP + lvl * S, z, ry };
    });
    return {
      group, enter: 1.0, exit: 0.45,
      update(p, local) {
        const show = range(p, 0.3, 0.7);
        boxes.forEach(({ b, x, y, z, ry }, k) => {
          const land = 0.1 + k * 0.1;
          const d = range(local, land - 0.11, land);
          b.visible = d > 0 && show > 0;
          b.position.set(x, y + (1 - bounce(d)) * 3.4, z);
          b.rotation.y = ry + (1 - d) * 0.6;
          b.scale.setScalar(backOut(show, 2));
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
    [0.3, 0.15, 0, -0.15].forEach((y, i) => { const l = mesh(rbox(i === 3 ? 0.7 : 1.2, 0.045, 0.01, 0.004), M.tint, false); l.position.set(i === 3 ? -0.25 : 0, y, 0.025); letter.add(l); });
    const paper = new THREE.MeshStandardMaterial({ color: '#f4f7fd', roughness: 0.78, side: THREE.DoubleSide, flatShading: true, clippingPlanes: [clipTop], clipShadows: true });
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
      group, enter: 1.2, exit: 0.45,
      update(p, local, t) {
        const d = range(p, 0.25, 0.85);
        env.visible = d > 0;
        env.position.set(0, TOP + (1 - bounce(d)) * 2.8, 0);
        env.rotation.set(0, -0.1, wobble((d - 1 / 2.75) * 0.7, 11, 4) * 0.1);
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
  const FACTORY = { hero: makeHero, about: makeAbout, skills: makeSkills, experience: makeKanban, crm: makeCRM, jd: makeJD, texport: makeTexPort, inventory: makeBoxes, contact: makeContact };
  const EX = NAMES.map((name) => FACTORY[name]());
  EX.forEach((ex) => stage.add(ex.group));
  const HERO = EX[NAMES.indexOf('hero')];

  // Plinth length L and radius R, camera angle, the height it looks at, and the half-size of what must stay in frame.
  const CFG = {
    heroStart: { L: 0, R: 1.7, yaw: 0.46, cy: 1.15, hw: 1.85, hd: 1.75, hh: 1.2 },
    hero: { L: 5.4, R: 1.45, yaw: 0.3, cy: 1.05, hw: 4.4, hd: 1.5, hh: 1.3 },
    about: { L: 0, R: 1.45, yaw: 0.46, cy: 1.25, hw: 1.6, hd: 1.5, hh: 1.4 },
    skills: { L: 2.0, R: 1.45, yaw: 0.46, cy: 1.15, hw: 2.65, hd: 1.45, hh: 1.25 },
    experience: { L: 2.6, R: 1.45, yaw: 0.46, cy: 1.55, hw: 2.9, hd: 1.45, hh: 1.65 },
    crm: { L: 1.9, R: 1.4, yaw: 0.46, cy: 1.45, hw: 2.45, hd: 1.4, hh: 1.6 },
    jd: { L: 1.9, R: 1.35, yaw: 0.46, cy: 1.6, hw: 2.5, hd: 1.4, hh: 1.8 },
    texport: { L: 0, R: 1.3, yaw: 0.46, cy: 1.5, hw: 1.5, hd: 1.3, hh: 1.65 },
    inventory: { L: 0.7, R: 1.5, yaw: 0.46, cy: 1.3, hw: 1.95, hd: 1.5, hh: 1.45 },
    contact: { L: 0.8, R: 1.4, yaw: 0.46, cy: 1.6, hw: 2.45, hd: 1.6, hh: 1.75 },
  };
  function cfgAt(i) {
    let o = CFG[NAMES[i]];
    if (NAMES[i] === 'hero') {
      const m = easeInOut(range(introT, DRAG[0], DRAG[1])), a = CFG.heroStart, b = CFG.hero;
      o = {};
      for (const k in b) o[k] = lerp(a[k], b[k], m);
    }
    return { ...o, side: SIDES[i] === 'right' ? 1 : -1 };
  }

  let phone = false, CW = 1, CH = 1, headerB = 0, cols = { l0: 0, l1: 0, r0: 0, r1: 0 };
  let anchors = new Array(N + 1).fill(0); // one per chapter, plus the end of the page
  function areaAt(i) {
    if (phone) {
      const top = headerB + 4, bottom = CH - 10;
      return { cx: CW / 2, cy: (top + bottom) / 2, w: CW - 28, h: bottom - top };
    }
    const right = SIDES[i] === 'right';
    const x0 = right ? cols.r0 + 8 : Math.max(0, cols.l0 - 56);
    const x1 = right ? Math.min(CW, cols.r1 + 56) : cols.l1 - 8;
    const y0 = NAMES[i] === 'hero' ? headerB + 24 : CH * 0.13;
    const y1 = NAMES[i] === 'hero' ? CH - 96 : CH * 0.87;
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
    // The header is fixed on phones and scrolls with the page on desktop; measure it as it sits at the top of the page.
    const hb = document.querySelector('.top').getBoundingClientRect().bottom;
    headerB = phone ? hb - r.top : hb + window.scrollY;
    const maxY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    anchors = chapters.map((el, i) => {
      if (i === 0) return 0;
      const top = el.getBoundingClientRect().top + window.scrollY;
      return clamp(phone ? top - CH : top + el.offsetHeight / 2 - window.innerHeight / 2, 0, maxY);
    });
    anchors.push(maxY);
    for (let i = 1; i <= N; i++) anchors[i] = Math.max(anchors[i], anchors[i - 1] + 1);
    const grid = chapters[0].querySelector('.chapter__grid');
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
  const mouse = new THREE.Vector2(-9, -9);
  const raycaster = new THREE.Raycaster();
  const letterMeshes = HERO.letters.map((l) => l.mesh);
  const elev = 0.36;

  function step(dt) {
    const th = phone ? 0.86 : 0.5;
    active = clamp(Math.floor(sS + 1 - th), 0, N - 1);
    const i0 = clamp(Math.floor(sS), 0, N - 1), i1 = Math.min(N - 1, i0 + 1);
    const f = smooth(range(sS - i0, phone ? 0.6 : 0.2, phone ? 0.98 : 0.8));
    const c0 = cfgAt(i0), c1 = cfgAt(i1), cfg = {};
    for (const k in c0) cfg[k] = lerp(c0[k], c1[k], f);
    const yaw = lerp(c0.yaw * c0.side, c1.yaw * c1.side, f) * (phone ? 0.72 : 1);
    const a0 = areaAt(i0), a1 = areaAt(i1);
    const area = { cx: lerp(a0.cx, a1.cx, f), cy: lerp(a0.cy, a1.cy, f), w: lerp(a0.w, a1.w, f), h: lerp(a0.h, a1.h, f) };

    const travel = !phone && SIDES[i0] !== SIDES[i1] ? Math.sin(Math.PI * f) : 0;
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

    for (let i = 0; i < N; i++) {
      const ex = EX[i];
      if (!paused) {
        const target = i === active ? 1 : 0;
        P[i] = reduce ? target : clamp(P[i] + (target > P[i] ? dt / ex.enter : -dt / ex.exit));
      }
      ex.group.visible = P[i] > 0.001;
      if (ex.group.visible) {
        const local = phone ? range(sS, i - 0.12, i + 0.75) : range(sS, i - 0.42, i + 0.3);
        ex.update(P[i], local, t);
      }
    }
  }

  function hover() {
    if (!hasMouse || phone || paused || introT < 3.3 || !HERO.group.visible) return;
    raycaster.setFromCamera(mouse, camera);
    const hit = raycaster.intersectObjects(letterMeshes, false)[0];
    if (!hit) return;
    const L = HERO.letters[letterMeshes.indexOf(hit.object)];
    if (t - L.hoverAt > 0.85) L.hoverAt = t;
  }

  let last = performance.now();
  let raf = 0;
  let disposed = false;
  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (paused) return;
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;
    if (!reduce) {
      t += dt;
      introT += dt;
    }
    const s = sFromScroll(window.scrollY);
    sS = reduce ? s : sS + (s - sS) * (1 - Math.exp(-dt * 8));
    if (Math.abs(s - sS) < 1e-4) sS = s;
    step(dt);
    renderer.render(scene, camera);
    hover();
  }

  const onPointerMove = (e) => {
    if (e.pointerType !== 'mouse') return;
    hasMouse = true;
    const r = canvas.getBoundingClientRect();
    mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  };
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('resize', layout);
  const resizeObserver = new ResizeObserver(() => layout());
  resizeObserver.observe(document.body);
  if (document.fonts) {
    document.fonts.ready.then(() => {
      if (!disposed) layout();
    });
  }

  layout();
  sS = sFromScroll(window.scrollY);
  if (sS > 0.5) {
    introT = 12;
    P[0] = 0;
  }
  step(0);
  renderer.render(scene, camera);
  document.documentElement.classList.add('is-live');
  raf = requestAnimationFrame((now) => {
    last = now;
    frame(now);
  });

  // Test hook for visual checks: open the page with ?debug to pose the scene at any scroll position.
  if (debug) {
    window.__clay = {
      anchors: () => anchors.slice(),
      pose({ s = 0, time = 6, intro = 10, p = null, flight = null } = {}) {
        paused = true;
        layout();
        window.scrollTo({ top: yFromS(s), behavior: 'instant' });
        sS = s;
        t = time;
        introT = intro;
        flightOverride = flight;
        active = clamp(Math.floor(s + 1 - (phone ? 0.86 : 0.5)), 0, N - 1);
        for (let i = 0; i < N; i++) P[i] = p ? (p[i] ?? 0) : i === active ? 1 : 0;
        step(0);
        renderer.render(scene, camera);
        return { active, y: window.scrollY, anchors: anchors.slice() };
      },
    };
    window.__clayReady = true;
  }

  return function dispose() {
    disposed = true;
    cancelAnimationFrame(raf);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('resize', layout);
    resizeObserver.disconnect();
    document.documentElement.classList.remove('is-live');
    scene.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (!obj.material) return;
      const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
      materials.forEach((m) => {
        if (m.map) m.map.dispose();
        m.dispose();
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
