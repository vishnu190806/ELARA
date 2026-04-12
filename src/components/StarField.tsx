"use client";

import { useEffect, useRef, useCallback } from "react";
import * as THREE from "three";

interface ShootingStar {
  mesh: THREE.Line;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
}

export default function StarField() {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const starsRef = useRef<THREE.Points | null>(null);
  const nebulasRef = useRef<THREE.Group | null>(null);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animFrameRef = useRef<number>(0);
  const timeRef = useRef(0);
  const shootingTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const STAR_COUNT = isMobile ? 800 : 2500;

  const spawnShootingStar = useCallback((scene: THREE.Scene) => {
    const startX = (Math.random() - 0.5) * 200;
    const startY = Math.random() * 60 + 20;
    const startZ = -50;

    const points = [
      new THREE.Vector3(startX, startY, startZ),
      new THREE.Vector3(startX - 12, startY - 4, startZ),
    ];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: 0x66ccff,
      transparent: true,
      opacity: 0.8,
    });
    const line = new THREE.Line(geometry, material);
    scene.add(line);

    shootingStarsRef.current.push({
      mesh: line,
      velocity: new THREE.Vector3(-1.2 - Math.random() * 0.6, -0.4 - Math.random() * 0.3, 0),
      life: 0,
      maxLife: 50 + Math.random() * 30,
    });
  }, []);

  const scheduleShootingStar = useCallback((scene: THREE.Scene) => {
    const delay = 6000 + Math.random() * 6000;
    clearTimeout(shootingTimerRef.current);
    shootingTimerRef.current = setTimeout(() => {
      spawnShootingStar(scene);
      scheduleShootingStar(scene);
    }, delay);
    return shootingTimerRef.current;
  }, [spawnShootingStar]);

  useEffect(() => {
    if (!mountRef.current) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 60;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    const mountEl = mountRef.current;
    mountEl.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // --- NEBULAS (Volumetric-ish color clouds) ---
    const nebulaGroup = new THREE.Group();
    const nebulaColors = [0x1e3a8a, 0x4c1d95, 0x1e40af]; // Blue, Purple, Darker Blue
    for(let i=0; i<3; i++) {
        const geo = new THREE.SphereGeometry(60, 32, 32);
        const mat = new THREE.MeshBasicMaterial({
            color: nebulaColors[i],
            transparent: true,
            opacity: 0.05,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending
        });
        const nebula = new THREE.Mesh(geo, mat);
        nebula.position.set(
            (Math.random()-0.5)*150,
            (Math.random()-0.5)*100,
            -80 + i*20
        );
        nebula.scale.set(2, 1.2, 1);
        nebulaGroup.add(nebula);
    }
    scene.add(nebulaGroup);
    nebulasRef.current = nebulaGroup;

    // --- STARS ---
    const positions = new Float32Array(STAR_COUNT * 3);
    const seeds = new Float32Array(STAR_COUNT);
    const speeds = new Float32Array(STAR_COUNT);
    const sizes = new Float32Array(STAR_COUNT);
    const colors = new Float32Array(STAR_COUNT * 3);

    const starBaseColors = [
        new THREE.Color(0xffffff),
        new THREE.Color(0xaaccff),
        new THREE.Color(0xffddaa),
    ];

    for (let i = 0; i < STAR_COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 250;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 160;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 120 - 40;
      seeds[i] = Math.random() * Math.PI * 2;
      speeds[i] = 0.4 + Math.random() * 1.8;
      sizes[i] = (0.3 + Math.random() * 1.8) * (isMobile ? 1.0 : 1.4);
      
      const col = starBaseColors[Math.floor(Math.random() * starBaseColors.length)];
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    starGeometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    starGeometry.setAttribute("aSpeed", new THREE.BufferAttribute(speeds, 1));
    starGeometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    starGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const starMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
      },
      vertexShader: `
        attribute float aSeed;
        attribute float aSpeed;
        attribute float aSize;
        attribute vec3 color;
        varying float vOpacity;
        varying vec3 vColor;
        uniform float uTime;
        void main() {
          vColor = color;
          // Complex twinkle
          vOpacity = 0.3 + 0.7 * (0.5 + 0.5 * sin(uTime * aSpeed + aSeed));
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * (350.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying float vOpacity;
        varying vec3 vColor;
        void main() {
          float d = distance(gl_PointCoord, vec2(0.5));
          if (d > 0.5) discard;
          float strength = 1.0 - (d / 0.5);
          gl_FragColor = vec4(vColor, vOpacity * strength * strength); // Sharper falloff
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
    starsRef.current = stars;

    if (!prefersReduced) {
      scheduleShootingStar(scene);
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", handleMouseMove);

    const handleResize = () => {
      if (!rendererRef.current || !cameraRef.current) return;
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      timeRef.current += 0.012;
      const t = timeRef.current;

      if (!prefersReduced) {
        starMaterial.uniforms.uTime.value = t;

        if (starsRef.current) {
          starsRef.current.rotation.y += (mouseRef.current.x * 0.005 - starsRef.current.rotation.y) * 0.04;
          starsRef.current.rotation.x += (mouseRef.current.y * 0.003 - starsRef.current.rotation.x) * 0.04;
        }
        
        if (nebulasRef.current) {
           nebulasRef.current.rotation.y = t * 0.05;
           nebulasRef.current.children.forEach((n, i) => {
               n.scale.x = 2 + Math.sin(t * 0.1 + i) * 0.5;
           });
        }

        shootingStarsRef.current = shootingStarsRef.current.filter((ss) => {
          ss.life++;
          ss.mesh.position.add(ss.velocity);
          const mat = ss.mesh.material as THREE.LineBasicMaterial;
          mat.opacity = Math.max(0, 1 - ss.life / ss.maxLife);
          if (ss.life >= ss.maxLife) {
            scene.remove(ss.mesh);
            ss.mesh.geometry.dispose();
            (ss.mesh.material as THREE.Material).dispose();
            return false;
          }
          return true;
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      clearTimeout(shootingTimerRef.current);
      
      shootingStarsRef.current.forEach((ss) => {
        if(sceneRef.current) sceneRef.current.remove(ss.mesh);
        ss.mesh.geometry.dispose();
        (ss.mesh.material as THREE.Material).dispose();
      });
      shootingStarsRef.current = [];
      
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      starGeometry.dispose();
      starMaterial.dispose();
      if (mountEl && renderer.domElement.parentNode === mountEl) {
        mountEl.removeChild(renderer.domElement);
      }
    };
  }, [STAR_COUNT, scheduleShootingStar, isMobile]);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden"
      aria-hidden="true"
    />
  );
}
