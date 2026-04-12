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
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animFrameRef = useRef<number>(0);
  const timeRef = useRef(0);
  const shootingTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const STAR_COUNT = isMobile ? 800 : 2000;

  const spawnShootingStar = useCallback((scene: THREE.Scene) => {
    const startX = (Math.random() - 0.5) * 200;
    const startY = Math.random() * 60 + 20;
    const startZ = -50;

    const points = [
      new THREE.Vector3(startX, startY, startZ),
      new THREE.Vector3(startX - 8, startY - 3, startZ),
    ];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
    });
    const line = new THREE.Line(geometry, material);
    scene.add(line);

    shootingStarsRef.current.push({
      mesh: line,
      velocity: new THREE.Vector3(-0.8 - Math.random() * 0.4, -0.3 - Math.random() * 0.2, 0),
      life: 0,
      maxLife: 60 + Math.random() * 40,
    });
  }, []);

  const scheduleShootingStar = useCallback((scene: THREE.Scene) => {
    const delay = 8000 + Math.random() * 4000;
    clearTimeout(shootingTimerRef.current);
    shootingTimerRef.current = setTimeout(() => {
      spawnShootingStar(scene);
      scheduleShootingStar(scene);
    }, delay);
    return shootingTimerRef.current;
  }, [spawnShootingStar]);

  useEffect(() => {
    if (!mountRef.current) return;

    // Check for reduced motion preference
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 50;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    const mountEl = mountRef.current;
    mountEl.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create stars
    const positions = new Float32Array(STAR_COUNT * 3);
    const opacities = new Float32Array(STAR_COUNT);
    const opacitySeeds = new Float32Array(STAR_COUNT);
    const opacitySpeeds = new Float32Array(STAR_COUNT);
    const sizes = new Float32Array(STAR_COUNT);

    for (let i = 0; i < STAR_COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 120;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100 - 20;
      opacities[i] = 0.2 + Math.random() * 0.8;
      opacitySeeds[i] = Math.random() * Math.PI * 2;
      opacitySpeeds[i] = 0.3 + Math.random() * 1.2;
      sizes[i] = 0.5 + Math.random() * 1.5;
    }

    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    starGeometry.setAttribute("aOpacity", new THREE.BufferAttribute(opacities, 1));
    starGeometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));

    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.8,
      transparent: true,
      sizeAttenuation: true,
      opacity: 0.8,
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
    starsRef.current = stars;

    // Schedule shooting stars
    if (!prefersReduced) {
      scheduleShootingStar(scene);
    }

    // Mouse parallax
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Handle resize
    const handleResize = () => {
      if (!rendererRef.current || !cameraRef.current) return;
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    // Animation loop
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      timeRef.current += 0.016;
      const t = timeRef.current;

      if (!prefersReduced) {
        // Twinkling
        const opacityAttr = starGeometry.attributes.aOpacity as THREE.BufferAttribute;
        for (let i = 0; i < STAR_COUNT; i++) {
          const seed = opacitySeeds[i];
          const speed = opacitySpeeds[i];
          opacityAttr.setX(i, (0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * speed + seed))));
        }
        opacityAttr.needsUpdate = true;
        starMaterial.opacity = 0.75 + 0.25 * Math.sin(t * 0.1);

        // Parallax
        if (starsRef.current) {
          starsRef.current.rotation.y += (mouseRef.current.x * 0.003 - starsRef.current.rotation.y) * 0.05;
          starsRef.current.rotation.x += (mouseRef.current.y * 0.002 - starsRef.current.rotation.x) * 0.05;
        }

        // Shooting stars
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
  }, [STAR_COUNT, scheduleShootingStar]);

  return (
    <div
      ref={mountRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -1,
        pointerEvents: "none",
      }}
      aria-hidden="true"
    />
  );
}
