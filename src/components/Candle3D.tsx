"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";

// Shader de flamme
const flameVertexShader = `
  uniform float time;
  varying vec2 vUv;
  varying float hValue;

  float random (in vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }

  float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    vec2 u = f*f*(3.0-2.0*f);
    return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  void main() {
    vUv = uv;
    vec3 pos = position;
    pos *= vec3(0.8, 2, 0.725);
    hValue = position.y;
    float posXZlen = length(position.xz);
    
    // Animation plus dynamique
    float timeScale = time * 2.0;
    float noiseScale = 0.5;
    float movementScale = 0.1;
    
    // Variation de hauteur avec bruit
    pos.y *= 1. + (
      cos((posXZlen + timeScale) * 3.1415926) * 0.25 + 
      noise(vec2(0, timeScale)) * 0.125 + 
      noise(vec2(position.x + timeScale, position.z + timeScale)) * noiseScale
    ) * position.y;
    
    // Mouvement ondulant
    pos.x += noise(vec2(timeScale * 2., (position.y - timeScale) * 4.0)) * hValue * movementScale;
    pos.z += noise(vec2((position.y - timeScale) * 4.0, timeScale * 2.)) * hValue * movementScale;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos,1.0);
  }
`;

const flameFragmentShader = `
  varying float hValue;
  varying vec2 vUv;
  uniform float time;

  vec3 heatmapGradient(float t) {
    return clamp((pow(t, 1.5) * 0.8 + 0.2) * vec3(smoothstep(0.0, 0.35, t) + t * 0.5, smoothstep(0.5, 1.0, t), max(1.0 - t * 1.7, t * 7.0 - 6.0)), 0.0, 1.0);
  }

  void main() {
    float v = abs(smoothstep(0.0, 0.4, hValue) - 1.);
    float alpha = (1. - v) * 0.99;
    alpha -= 1. - smoothstep(1.0, 0.97, hValue);
    
    // Animation des couleurs
    float colorTime = time * 0.5;
    vec3 baseColor = heatmapGradient(smoothstep(0.0, 0.3, hValue)) * vec3(0.95,0.95,0.4);
    baseColor = mix(vec3(0,0,1), baseColor, smoothstep(0.0, 0.3, hValue));
    baseColor += vec3(1, 0.9, 0.5) * (1.25 - vUv.y);
    baseColor = mix(baseColor, vec3(0.66, 0.32, 0.03), smoothstep(0.95, 1., hValue));
    
    // Variation de luminosité
    float flicker = 1.0 + sin(time * 10.0) * 0.1;
    gl_FragColor = vec4(baseColor * flicker, alpha);
  }
`;

export function Candle3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const candleRef = useRef<THREE.Object3D | null>(null);
  const flameRef = useRef<THREE.PointLight | null>(null);
  const clockRef = useRef<THREE.Clock | null>(null);
  const timeRef = useRef<number>(0);

  // Variables globales pour l'animation
  const GVARS = {
    CheraghPosition: { x: 0, y: -0.5, z: 0 },
    FlamePositionOffset: { x: 0, y: 0.2, z: 0 },
    CheraghLightBaseIntensity: 1,
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Création de la scène
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Initialisation de l'horloge
    const clock = new THREE.Clock();
    clockRef.current = clock;

    // Création de la caméra
    const camera = new THREE.PerspectiveCamera(15, 1, 0.3, 1000);
    camera.position.set(3, 0, 0);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Création du renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    renderer.setSize(450, 450);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Ajout de l'éclairage
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
    scene.add(ambientLight);

    // Lumière directionnelle pour un éclairage général
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(2, 2, 2);
    scene.add(directionalLight);

    // Chargement du modèle 3D
    const loader = new FBXLoader();
    loader.load(
      "https://oa5vracaap84kwhj.public.blob.vercel-storage.com/models3d/CANDEL-NI1PUaNuMTobHngVJTjNhmIleKyRqN.fbx",
      (object: THREE.Object3D) => {
        const candle = object;
        scene.add(candle);
        candleRef.current = candle;

        // Ajustement de la position et de la rotation
        candle.position.set(0, -0.1, 0);
        candle.rotation.set(-Math.PI / 2, 0, 0);
        candle.scale.set(0.2, 0.2, 0.2);

        // Activation des ombres pour la bougie
        candle.traverse((child: THREE.Object3D) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
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

    // Création de la flamme avec shader
    const flameGeometry = new THREE.SphereGeometry(0.5, 10, 10);
    flameGeometry.translate(0, 0.2, 0);
    const flameMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0.0 },
      },
      vertexShader: flameVertexShader,
      fragmentShader: flameFragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
    });
    const flame = new THREE.Mesh(flameGeometry, flameMaterial);
    flame.position.set(0, 0.1, 0);
    flame.scale.set(0.1, 0.1, 0.1);
    scene.add(flame);

    // Lumière de la flamme avec animation
    const flameLight = new THREE.PointLight(0xff6600, 1, 1);
    flameLight.position.set(0, 0.15, 0);
    scene.add(flameLight);
    flameRef.current = flameLight;

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);

      //------ timing --------
      const delta = clock.getDelta();
      timeRef.current += delta;

      // Animation de la flamme
      if (flameRef.current) {
        // Animation de la position de la flamme
        flameRef.current.position.x =
          Math.sin(timeRef.current * Math.PI * 0.3) * 0.002 +
          GVARS.CheraghPosition.x +
          GVARS.FlamePositionOffset.x;
        flameRef.current.position.y =
          Math.cos(timeRef.current * Math.PI * 0.3 + Math.random() * 0.1) *
            0.002 +
          GVARS.CheraghPosition.y +
          GVARS.FlamePositionOffset.y;
        flameRef.current.position.z =
          Math.cos(timeRef.current * Math.PI * 0.3) * 0.002 +
          GVARS.CheraghPosition.z +
          GVARS.FlamePositionOffset.z;

        // Animation de l'intensité
        flameRef.current.intensity =
          (1.2 +
            Math.sin(timeRef.current * Math.PI * 2) *
              Math.cos(timeRef.current * Math.PI * 1.5)) *
            0.005 +
          GVARS.CheraghLightBaseIntensity;

        // Animation de la couleur
        flameRef.current.color.setHSL(
          0.1 + Math.sin(timeRef.current) * 0.005,
          0.8,
          0.4
        );
      }

      // Mise à jour du shader de la flamme
      flameMaterial.uniforms.time.value = timeRef.current;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (container && rendererRef.current) {
        container.removeChild(rendererRef.current.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center"
    />
  );
}
