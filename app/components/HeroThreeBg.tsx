"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";

const TEAMS = [
  { name: "Borussia Dortmund",  hue: 0.14, logo: "https://crests.football-data.org/4.png" },
  { name: "Bayern Munich",      hue: 0.0,  logo: "https://crests.football-data.org/5.png" },
  { name: "Bayer Leverkusen",   hue: 0.98, logo: "https://crests.football-data.org/3.png" },
  { name: "Manchester City",    hue: 0.57, logo: "https://crests.football-data.org/65.png" },
  { name: "Chelsea",            hue: 0.63, logo: "https://crests.football-data.org/61.png" },
  { name: "Arsenal",            hue: 0.02, logo: "https://crests.football-data.org/57.png" },
  { name: "Liverpool",          hue: 0.99, logo: "https://crests.football-data.org/64.png" },
  { name: "Aston Villa",        hue: 0.93, logo: "https://crests.football-data.org/58.png" },
  { name: "Atlético Madrid",    hue: 0.96, logo: "https://crests.football-data.org/78.png" },
  { name: "Real Madrid",        hue: 0.12, logo: "https://crests.football-data.org/86.png" },
  { name: "Barcelona",          hue: 0.65, logo: "https://crests.football-data.org/81.png" },
  { name: "PSG",                hue: 0.61, logo: "https://crests.football-data.org/524.png" },
  { name: "Inter Milan",        hue: 0.60, logo: "https://crests.football-data.org/108.png" },
  { name: "AC Milan",           hue: 0.01, logo: "https://crests.football-data.org/98.png" },
  { name: "Juventus",           hue: 0.60, logo: "https://crests.football-data.org/109.png" },
  { name: "Atalanta",           hue: 0.62, logo: "https://crests.football-data.org/102.png" },
  { name: "RB Leipzig",         hue: 0.97, logo: "https://crests.football-data.org/721.png" },
  { name: "Benfica",            hue: 0.0,  logo: "https://crests.football-data.org/294.png" },
  { name: "Sporting CP",        hue: 0.35, logo: "https://crests.football-data.org/498.png" },
  { name: "Feyenoord",          hue: 0.0,  logo: "https://crests.football-data.org/675.png" },
  { name: "Club Brugge",        hue: 0.55, logo: "https://crests.football-data.org/851.png" },
  { name: "Monaco",             hue: 0.98, logo: "https://crests.football-data.org/548.png" },
];

const VERTEX = `
  varying vec2 vUv;
  varying vec3 v_color;
  varying vec3 v_normal;

  uniform float u_time;
  uniform float u_progress;
  uniform float u_hue;

  vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
  }

  vec4 permute(vec4 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + 1.0 * C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
    i = mod(i, 289.0);
    vec4 p = permute(permute(permute(
          i.z + vec4(0.0, i1.z, i2.z, 1.0))
        + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 1.0 / 7.0;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    vUv = uv;
    float noise = snoise(position * u_progress + u_time / 10.0);
    vec3 newPos = position * (noise + 0.7);
    v_color = hsv2rgb(vec3(noise * 0.08 + u_hue, 0.85, 0.85));
    v_normal = normal;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
  }
`;

const FRAGMENT = `
  varying vec2 vUv;
  varying vec3 v_color;
  varying vec3 v_normal;

  void main() {
    vec3 skyColor = vec3(1.0, 1.0, 0.85);
    vec3 groundColor = vec3(0.2, 0.1, 0.05);
    vec3 lightDirection = normalize(vec3(0.0, -1.0, -1.0));
    vec3 light = mix(skyColor, groundColor, dot(lightDirection, v_normal));
    gl_FragColor = vec4(light * v_color, 1.0);
  }
`;

const PARTICLE_VERTEX = `
  uniform float u_time;
  void main() {
    vec3 p = position;
    p.y += 0.25 * (sin(p.y * 5.0 + u_time) * 0.5 + 0.5);
    p.z += 0.05 * (sin(p.y * 10.0 + u_time) * 0.5 + 0.5);
    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = 10.0 * (1.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const PARTICLE_FRAGMENT = `
  uniform float u_progress;
  void main() {
    gl_FragColor = vec4(0.4, 0.4, 0.4, u_progress);
  }
`;

const BG_VERTEX = `
  varying vec2 vUv;
  uniform float u_time;
  void main() {
    vec3 p = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    vUv = uv;
  }
`;

const BG_FRAGMENT = `
  // ── shared helpers ──────────────────────────────────────────────
  float hash(vec2 p) {
    return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x))));
  }
  vec3 random3(vec3 c) {
    float j = 4096.0 * sin(dot(c, vec3(17.0, 59.4, 15.0)));
    vec3 r;
    r.z = fract(512.0 * j); j *= 0.125;
    r.x = fract(512.0 * j); j *= 0.125;
    r.y = fract(512.0 * j);
    return r - 0.5;
  }
  const float F3 = 0.3333333;
  const float G3 = 0.1666667;
  float simplex3d(vec3 p) {
    vec3 s = floor(p + dot(p, vec3(F3)));
    vec3 x = p - s + dot(s, vec3(G3));
    vec3 e = step(vec3(0.0), x - x.yzx);
    vec3 i1 = e * (1.0 - e.zxy);
    vec3 i2 = 1.0 - e.zxy * (1.0 - e);
    vec3 x1 = x - i1 + G3;
    vec3 x2 = x - i2 + 2.0 * G3;
    vec3 x3 = x - 1.0 + 3.0 * G3;
    vec4 w, d;
    w.x = dot(x, x); w.y = dot(x1, x1); w.z = dot(x2, x2); w.w = dot(x3, x3);
    w = max(0.6 - w, 0.0);
    d.x = dot(random3(s), x); d.y = dot(random3(s + i1), x1);
    d.z = dot(random3(s + i2), x2); d.w = dot(random3(s + 1.0), x3);
    w *= w; w *= w; d *= w;
    return dot(d, vec4(52.0));
  }
  float hue2rgb(float f1, float f2, float hue) {
    if (hue < 0.0) hue += 1.0; else if (hue > 1.0) hue -= 1.0;
    if ((6.0 * hue) < 1.0) return f1 + (f2 - f1) * 6.0 * hue;
    if ((2.0 * hue) < 1.0) return f2;
    if ((3.0 * hue) < 2.0) return f1 + (f2 - f1) * ((2.0/3.0) - hue) * 6.0;
    return f1;
  }
  vec3 hsl2rgb(float h, float s, float l) {
    if (s == 0.0) return vec3(l);
    float f2 = l < 0.5 ? l * (1.0 + s) : l + s - s * l;
    float f1 = 2.0 * l - f2;
    return vec3(hue2rgb(f1, f2, h + 1.0/3.0), hue2rgb(f1, f2, h), hue2rgb(f1, f2, h - 1.0/3.0));
  }

  // ── theme 0: dark noise (default) ───────────────────────────────
  vec3 darkNoise(vec2 uv, float t) {
    float n = simplex3d(vec3(uv, t));
    vec3 color = hsl2rgb(n * 0.1, 0.0, 0.03);
    color += vec3(hash(uv + t) / 20.0);
    return color;
  }

  // ── theme 1: sea (Man City) ──────────────────────────────────────
  vec3 seaAnimation(vec2 uv, float t) {
    // Scrolling wave layers
    float w1 = sin(uv.x * 5.0  + t * 0.55 + uv.y * 1.8) * 0.5 + 0.5;
    float w2 = sin(uv.x * 11.0 - t * 0.38 + uv.y * 3.8 + 1.3) * 0.5 + 0.5;
    float w3 = sin(uv.y * 7.0  + t * 0.46 + uv.x * 2.1 + 2.1) * 0.5 + 0.5;
    float w4 = cos(uv.x * 3.2  + uv.y * 8.5 + t * 0.28) * 0.5 + 0.5;
    float wave = w1*0.35 + w2*0.25 + w3*0.25 + w4*0.15;
    wave = smoothstep(0.32, 0.72, wave);

    // Fine caustic shimmer
    float c1 = sin((uv.x + uv.y) * 18.0 + t * 1.6) * 0.5 + 0.5;
    float c2 = sin((uv.x - uv.y) * 14.0 - t * 1.3) * 0.5 + 0.5;
    float caustic = pow(c1 * c2, 3.0) * 0.18;

    // Horizontal scroll to suggest ocean movement
    float scroll = simplex3d(vec3(uv.x * 2.0 + t * 0.1, uv.y * 1.5, t * 0.05)) * 0.5 + 0.5;

    vec3 deepBlue  = vec3(0.008, 0.018, 0.07);
    vec3 midBlue   = vec3(0.02,  0.07,  0.22);
    vec3 seaBlue   = vec3(0.04,  0.18,  0.42);
    vec3 cyanFoam  = vec3(0.18,  0.48,  0.72);

    vec3 color = mix(deepBlue, midBlue, uv.y * 0.8 + scroll * 0.2);
    color = mix(color, seaBlue, wave * 0.75);
    color += cyanFoam * (pow(wave, 4.0) * 0.55 + caustic);

    // Grain to match the default noise feel
    color += vec3(hash(uv + t * 0.5) / 28.0);
    return color;
  }

  varying vec2 vUv;
  uniform float u_time;
  uniform float u_theme;   // 0 = dark noise, 1 = sea

  void main() {
    vec3 dark = darkNoise(vUv, u_time);
    vec3 sea  = seaAnimation(vUv, u_time);
    gl_FragColor = vec4(mix(dark, sea, u_theme), 1.0);
  }
`;

export function HeroThreeBg() {
  const mountRef   = useRef<HTMLDivElement>(null);
  const [teamIndex, setTeamIndex] = useState(0);
  const [logoVisible, setLogoVisible] = useState(true);

  // Stable ref so the GSAP closure always calls the latest setter
  const onTeamChange = useRef<(i: number) => void>(() => {});
  useEffect(() => {
    onTeamChange.current = (i: number) => {
      setLogoVisible(false);
      setTimeout(() => { setTeamIndex(i); setLogoVisible(true); }, 350);
    };
  });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene    = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 10000);
    camera.position.set(0, 0, 10);

    const hueUniform = { value: TEAMS[0].hue };
    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      uniforms: { u_time: { value: 0 }, u_progress: { value: 0 }, u_hue: hueUniform },
    });
    const geometry = new THREE.SphereGeometry(1, 162, 162);
    scene.add(new THREE.Mesh(geometry, material));

    // Particles
    const N = 30000;
    const pos = new Float32Array(N * 3);
    const inc = Math.PI * (3 - Math.sqrt(5));
    const off = 2 / N;
    for (let i = 0; i < N; i++) {
      const y = i * off - 1 + off / 2;
      const r = Math.sqrt(1 - y * y);
      const phi = i * inc;
      pos[3*i]   = 2 * Math.cos(phi) * r;
      pos[3*i+1] = 2 * y;
      pos[3*i+2] = 2 * Math.sin(phi) * r;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const pointsMat = new THREE.ShaderMaterial({
      vertexShader: PARTICLE_VERTEX, fragmentShader: PARTICLE_FRAGMENT,
      transparent: true, uniforms: { u_time: { value: 0 }, u_progress: { value: 0 } },
    });
    const points = new THREE.Points(particleGeo, pointsMat);
    scene.add(points);

    // Background
    const bgGeo = new THREE.PlaneGeometry(100, 15, 16);
    const bgThemeUniform = { value: 0 };
    const bgMat = new THREE.ShaderMaterial({
      vertexShader: BG_VERTEX, fragmentShader: BG_FRAGMENT,
      uniforms: { u_time: { value: 0 }, u_progress: { value: 0 }, u_theme: bgThemeUniform },
    });
    const bgMesh = new THREE.Mesh(bgGeo, bgMat);
    bgMesh.position.z = -2;
    scene.add(bgMesh);

    const clock = new THREE.Clock();
    let rafId: number;
    const render = () => {
      const t = clock.getElapsedTime();
      material.uniforms.u_time.value    = t;
      pointsMat.uniforms.u_time.value   = t;
      bgMat.uniforms.u_time.value       = t;
      points.rotation.y += 0.005;
      camera.lookAt(scene.position);
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(render);
    };
    render();

    // Morph
    const morphTl = gsap.timeline({ repeat: -1, yoyo: true });
    morphTl
      .to(material.uniforms.u_progress, { value: 5, duration: 5, ease: "power3.inOut" })
      .to(material.uniforms.u_progress, { value: 1, duration: 5, ease: "power3.inOut" });
    gsap.to(pointsMat.uniforms.u_progress, { value: 0.4, duration: 5, ease: "power3.inOut" });

    // Colour + logo cycling — 7 s per team, 2.5 s transition
    let idx = 0;
    let hueTimeout: ReturnType<typeof setTimeout>;
    const MAN_CITY_IDX = TEAMS.findIndex(t => t.name === "Manchester City");
    const cycleTeam = () => {
      idx = (idx + 1) % TEAMS.length;
      onTeamChange.current(idx);
      // Sphere hue
      gsap.to(hueUniform, { value: TEAMS[idx].hue, duration: 2.5, ease: "power2.inOut" });
      // Background theme: sea for Man City, dark noise otherwise
      gsap.to(bgThemeUniform, {
        value: idx === MAN_CITY_IDX ? 1 : 0,
        duration: 2.5,
        ease: "power2.inOut",
        onComplete: () => { hueTimeout = setTimeout(cycleTeam, 7000); },
      });
    };
    hueTimeout = setTimeout(cycleTeam, 7000);

    const onResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(hueTimeout);
      morphTl.kill();
      gsap.killTweensOf(hueUniform);
      gsap.killTweensOf(bgThemeUniform);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, []);

  const team = TEAMS[teamIndex];

  return (
    <div className="absolute inset-0" aria-hidden="true">

      {/* WebGL canvas */}
      <div ref={mountRef} className="absolute inset-0" />

      {/* Team logo — full, centered, on top of animation */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={teamIndex}
        src={team.logo}
        alt=""
        className="absolute pointer-events-none select-none"
        style={{
          width: "58vmin",
          height: "58vmin",
          objectFit: "contain",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          opacity: logoVisible ? 1 : 0,
          transition: "opacity 0.5s ease",
        }}
      />

      {/* Team name — bottom center */}
      <div
        className="absolute bottom-24 inset-x-0 text-center pointer-events-none"
        style={{ opacity: logoVisible ? 0.4 : 0, transition: "opacity 0.5s ease" }}
      >
        <span className="text-xs tracking-[0.3em] uppercase text-[#6a90cc]">{team.name}</span>
      </div>

      {/* Bottom vignette */}
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{ height: "40%", background: "linear-gradient(to top, #04091e 0%, transparent 100%)" }}
      />

    </div>
  );
}
