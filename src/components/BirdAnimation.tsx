"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export function BirdAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const birdRef = useRef<THREE.Object3D | null>(null);
  const clockRef = useRef<THREE.Clock | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    // Création de la scène
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Initialisation de l'horloge
    const clock = new THREE.Clock();
    clockRef.current = clock;

    // Création de la caméra
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.set(0, 2, 5);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Création du renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Ajout de l'éclairage
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Chargement du modèle 3D de l'oiseau
    const loader = new GLTFLoader();
    loader.load(
      "/models/bird.glb",
      (gltf) => {
        const bird = gltf.scene;
        scene.add(bird);
        birdRef.current = bird;

        // Ajustement de la position et de l'échelle
        bird.position.set(0, 0, 0);
        bird.scale.set(0.5, 0.5, 0.5);
      },
      undefined,
      (error) => {
        console.error("Erreur lors du chargement du modèle:", error);
      }
    );

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Animation de l'oiseau
      if (birdRef.current) {
        // Lévitation
        birdRef.current.position.y = Math.sin(time) * 0.2;

        // Rotation douce
        birdRef.current.rotation.y += delta * 0.5;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Gestion du redimensionnement
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current)
        return;

      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (container && rendererRef.current) {
        container.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ background: "transparent" }}
    />
  );
}
