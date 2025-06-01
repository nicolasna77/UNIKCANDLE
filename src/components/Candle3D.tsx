"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Scent } from "@/generated/client";

interface Candle3DProps {
  selectedScent: Scent;
}

export function Candle3D({ selectedScent }: Candle3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const candleRef = useRef<THREE.Object3D | null>(null);
  const clockRef = useRef<THREE.Clock | null>(null);
  const timeRef = useRef<number>(0);
  const controlsRef = useRef<OrbitControls | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    // Création de la scène avec un fond légèrement bleuté pour un meilleur contraste
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Initialisation de l'horloge
    const clock = new THREE.Clock();
    clockRef.current = clock;

    // Création de la caméra avec un angle optimal pour voir les couleurs
    const camera = new THREE.PerspectiveCamera(20, 1, 0.1, 1000); // Champ plus large
    camera.position.set(2.5, 1.2, 2.5);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Création du renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true,
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2; // Ajusté pour un meilleur équilibre
    renderer.outputColorSpace = THREE.SRGBColorSpace; // Rendu de couleur précis
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Ajout des contrôles de rotation
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.minPolarAngle = Math.PI / 4; // Moins de restriction verticale
    controls.maxPolarAngle = Math.PI / 1.5;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // Ajout d'un éclairage optimal pour voir les couleurs et textures
    const ambientLight = new THREE.AmbientLight(0xffffff, 1); // Réduit pour ne pas "laver" les couleurs
    scene.add(ambientLight);

    // Lumière directionnelle principale pour créer du relief
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
    mainLight.position.set(1, 1, 1);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    scene.add(mainLight);

    // Lumière d'appoint pour éclairer les zones sombres
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.8); // Plus intense
    fillLight.position.set(-1, 0.5, -1);
    scene.add(fillLight);

    // Lumière d'accent pour mettre en valeur les textures
    const accentLight = new THREE.DirectionalLight(0xffffff, 0.5);
    accentLight.position.set(0, 1, 0);
    scene.add(accentLight);

    // Chargement du modèle 3D
    const loader = new GLTFLoader();
    loader.load(
      "/models/candleGlass.glb",
      (gltf) => {
        const candle = gltf.scene;
        scene.add(candle);
        candleRef.current = candle;

        // Ajustement de la position et rotation
        candle.position.set(0, -0.3, 0);
        candle.rotation.set(0, 0, 0);
        candle.scale.set(0.2, 0.2, 0.2);

        // Application des textures et matériaux
        candle.traverse((child: THREE.Object3D) => {
          if (child instanceof THREE.Mesh) {
            // Activer les ombres
            child.castShadow = true;
            child.receiveShadow = true;

            // Supprimer le sol si présent
            if (
              child.name.toLowerCase().includes("floor") ||
              child.name.toLowerCase().includes("ground") ||
              child.name.toLowerCase().includes("sol") ||
              child.name.toLowerCase().includes("plane")
            ) {
              child.visible = false;
            }

            // Application des textures selon le nom de l'objet
            if (
              child.name.toLowerCase().includes("candle") ||
              child.name.toLowerCase().includes("bougie")
            ) {
              // Matériau principal de la bougie
              const material = new THREE.MeshPhysicalMaterial({
                color: selectedScent.color,
                roughness: 0.2,
                metalness: 0.1,
                clearcoat: 0.5,
                clearcoatRoughness: 0.1,
                transmission: 0.1,
                thickness: 0.5,
              });
              child.material = material;
            } else if (
              child.name.toLowerCase().includes("wax") ||
              child.name.toLowerCase().includes("cire")
            ) {
              // Matériau de la cire
              const material = new THREE.MeshPhysicalMaterial({
                color: selectedScent.color,
                roughness: 0.3,
                metalness: 0.05,
                transmission: 0.2,
                thickness: 0.3,
              });
              child.material = material;
            } else if (
              child.name.toLowerCase().includes("wick") ||
              child.name.toLowerCase().includes("mèche")
            ) {
              // Matériau de la mèche
              const material = new THREE.MeshStandardMaterial({
                color: "#333333",
                roughness: 0.8,
                metalness: 0.1,
              });
              child.material = material;
            }
          }
        });

        // Ajout d'un environnement lumineux pour les reflets
        const pmremGenerator = new THREE.PMREMGenerator(renderer);
        pmremGenerator.compileEquirectangularShader();

        // Environnement lumineux avec la couleur de la senteur
        const envScene = new THREE.Scene();
        const envLight = new THREE.AmbientLight(selectedScent.color, 0.5);
        envScene.add(envLight);
        scene.environment = pmremGenerator.fromScene(envScene).texture;
        scene.background = null;
      },
      (progress: ProgressEvent) => {
        console.log(
          "Chargement du modèle:",
          (progress.loaded / progress.total) * 100,
          "%"
        );
      },
      (error: unknown) => {
        console.error("Erreur lors du chargement du modèle:", error);
      }
    );

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);

      const delta = clock.getDelta();
      timeRef.current += delta;

      // Mise à jour des contrôles
      if (controlsRef.current) {
        controlsRef.current.update();
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      // Nettoyage de la scène
      if (sceneRef.current) {
        while (sceneRef.current.children.length > 0) {
          sceneRef.current.remove(sceneRef.current.children[0]);
        }
      }

      // Nettoyage du renderer
      if (container && rendererRef.current) {
        container.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }

      // Nettoyage des contrôles
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
    };
  }, [selectedScent]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center"
    />
  );
}
