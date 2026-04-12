"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import * as THREE from "three";
import { motion } from "framer-motion";
import SkyScoreRing from "./SkyScoreRing";
import { Satellite } from "lucide-react";

interface ISSPosition {
  latitude: number;
  longitude: number;
}

interface Earth3DProps {
  skyScore: {
    score: number;
  } | null;
  skyLoading: boolean;
  skyError: boolean;
  cityName: string;
  onRetry: () => void;
}

function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

export default function Earth3D({ skyScore, skyLoading, skyError, cityName, onRetry }: Earth3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number>(0);
  const [issPos, setIssPos] = useState<ISSPosition | null>(null);
  const issMeshRef = useRef<THREE.Mesh | null>(null);
  const earthRef = useRef<THREE.Mesh | null>(null);

  // Fetch ISS position every 5 seconds
  const fetchISS = useCallback(async () => {
    try {
      const res = await fetch("/api/iss");
      const data = await res.json();
      setIssPos({
        latitude: parseFloat(data.iss_position.latitude),
        longitude: parseFloat(data.iss_position.longitude),
      });
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    fetchISS();
    const interval = setInterval(fetchISS, 5000);
    return () => clearInterval(interval);
  }, [fetchISS]);

  // Update ISS position on globe
  useEffect(() => {
    if (!issMeshRef.current || !issPos) return;
    const pos = latLngToVector3(issPos.latitude, issPos.longitude, 2.1);
    issMeshRef.current.position.copy(pos);
  }, [issPos]);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x334466, 0.8);
    scene.add(ambientLight);
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
    sunLight.position.set(5, 3, 5);
    scene.add(sunLight);
    const rimLight = new THREE.DirectionalLight(0x4488ff, 0.3);
    rimLight.position.set(-5, 0, -3);
    scene.add(rimLight);

    // Earth sphere
    const earthGeometry = new THREE.SphereGeometry(2, 64, 64);

    // Procedural earth material using vertex colors for land/ocean effect
    const earthMaterial = new THREE.MeshPhongMaterial({
      color: 0x1a4080,
      emissive: 0x0a1a40,
      specular: 0x224466,
      shininess: 30,
    });

    // Create a canvas-based texture for the earth
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext("2d")!;

    // Ocean base
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, 512);
    oceanGrad.addColorStop(0, "#0a1a3a");
    oceanGrad.addColorStop(0.5, "#1a3a6a");
    oceanGrad.addColorStop(1, "#0a1a3a");
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, 1024, 512);

    // Simplified continent blobs
    ctx.fillStyle = "#1a4a2a";
    const continents = [
      // North America
      { x: 200, y: 160, rx: 90, ry: 80 },
      // South America
      { x: 270, y: 310, rx: 50, ry: 90 },
      // Europe
      { x: 510, y: 150, rx: 45, ry: 50 },
      // Africa
      { x: 510, y: 270, rx: 55, ry: 90 },
      // Asia (big)
      { x: 660, y: 170, rx: 130, ry: 80 },
      // Australia
      { x: 760, y: 350, rx: 55, ry: 40 },
      // India
      { x: 635, y: 270, rx: 25, ry: 40 },
    ];

    continents.forEach(({ x, y, rx, ry }) => {
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    // Ice caps
    ctx.fillStyle = "#cce8ff";
    ctx.fillRect(0, 0, 1024, 30);
    ctx.fillRect(0, 482, 1024, 30);

    // City lights effect
    ctx.fillStyle = "rgba(255, 200, 100, 0.15)";
    const cities = [
      [200, 160], [280, 155], [515, 150], [520, 170],
      [635, 265], [760, 200], [685, 220], [530, 270]
    ];
    cities.forEach(([cx, cy]) => {
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 25);
      g.addColorStop(0, "rgba(255,200,100,0.4)");
      g.addColorStop(1, "rgba(255,200,100,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 1024, 512);
    });

    const texture = new THREE.CanvasTexture(canvas);
    earthMaterial.map = texture;

    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);
    earthRef.current = earth;

    // Atmosphere glow
    const atmosGeometry = new THREE.SphereGeometry(2.15, 32, 32);
    const atmosMaterial = new THREE.MeshPhongMaterial({
      color: 0x4488ff,
      transparent: true,
      opacity: 0.08,
      side: THREE.FrontSide,
    });
    const atmosphere = new THREE.Mesh(atmosGeometry, atmosMaterial);
    scene.add(atmosphere);

    // Outer glow ring
    const outerGlowGeo = new THREE.SphereGeometry(2.25, 32, 32);
    const outerGlowMat = new THREE.MeshBasicMaterial({
      color: 0x2255cc,
      transparent: true,
      opacity: 0.04,
      side: THREE.BackSide,
    });
    scene.add(new THREE.Mesh(outerGlowGeo, outerGlowMat));

    // ISS dot
    const issGeometry = new THREE.SphereGeometry(0.04, 12, 12);
    const issMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 1,
    });
    const issMesh = new THREE.Mesh(issGeometry, issMaterial);
    const issGlow = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.25 })
    );
    issMesh.add(issGlow);
    if (issPos) {
      const pos = latLngToVector3(issPos.latitude, issPos.longitude, 2.1);
      issMesh.position.copy(pos);
    } else {
      issMesh.position.set(0, 2.1, 0);
    }
    scene.add(issMesh);
    issMeshRef.current = issMesh;

    // Handle resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    let time = 0;
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      time += 0.005;

      // Auto-rotate earth
      earth.rotation.y += 0.002;
      atmosphere.rotation.y += 0.0015;

      // ISS pulse
      issMaterial.opacity = 0.6 + 0.4 * Math.sin(time * 6);
      issGlow.scale.setScalar(1 + 0.4 * Math.sin(time * 4));

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", handleResize);
      if (renderer) renderer.dispose();
      if (earthGeometry) earthGeometry.dispose();
      if (earthMaterial) earthMaterial.dispose();
      if (texture) texture.dispose();
      if (atmosGeometry) atmosGeometry.dispose();
      if (atmosMaterial) atmosMaterial.dispose();
      if (outerGlowGeo) outerGlowGeo.dispose();
      if (outerGlowMat) outerGlowMat.dispose();
      if (issGeometry) issGeometry.dispose();
      if (issMaterial) issMaterial.dispose();
      if (issGlow.geometry) issGlow.geometry.dispose();
      if (issGlow.material) (issGlow.material as THREE.Material).dispose();
      if (container && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative w-full" style={{ height: "420px" }}>
      {/* 3D Globe canvas */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />

      {/* ISS indicator */}
      {issPos && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-medium"
        >
          <Satellite className="w-3 h-3" />
          <span>ISS Live</span>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
        </motion.div>
      )}

      {/* Sky Score overlay — bottom center of globe */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center pb-2">
        {skyLoading ? (
          <div className="w-[160px] h-[160px] rounded-full skeleton" />
        ) : skyError ? (
          <div className="flex flex-col items-center gap-2 text-slate-500">
            <div className="w-[160px] h-[160px] rounded-full border border-white/[0.05] flex items-center justify-center">
              <span className="text-xs text-center px-4">Score unavailable</span>
            </div>
            <button onClick={onRetry} className="text-xs text-blue-400 hover:text-blue-300">
              Retry
            </button>
          </div>
        ) : skyScore ? (
          <SkyScoreRing score={skyScore.score} size={160} />
        ) : null}
        <p className="text-slate-400 text-sm mt-2 font-medium">{cityName}</p>
      </div>
    </div>
  );
}
