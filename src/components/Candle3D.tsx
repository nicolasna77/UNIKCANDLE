"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

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
    
    float timeScale = time * 2.0;
    float noiseScale = 0.5;
    float movementScale = 0.1;
    
    pos.y *= 1. + (
      cos((posXZlen + timeScale) * 3.1415926) * 0.25 + 
      noise(vec2(0, timeScale)) * 0.125 + 
      noise(vec2(position.x + timeScale, position.z + timeScale)) * noiseScale
    ) * position.y;
    
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
    
    float colorTime = time * 0.5;
    vec3 baseColor = heatmapGradient(smoothstep(0.0, 0.3, hValue)) * vec3(0.95,0.95,0.4);
    baseColor = mix(vec3(0,0,1), baseColor, smoothstep(0.0, 0.3, hValue));
    baseColor += vec3(1, 0.9, 0.5) * (1.25 - vUv.y);
    baseColor = mix(baseColor, vec3(0.66, 0.32, 0.03), smoothstep(0.95, 1., hValue));
    
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
  const clockRef = useRef<THREE.Clock | null>(null);
  const flameShaderRef = useRef<THREE.ShaderMaterial | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scène
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Horloge
    const clock = new THREE.Clock();
    clockRef.current = clock;

    // Caméra
    const camera = new THREE.PerspectiveCamera(60, 1, 0.4, 1000);
    camera.position.set(3, 3, 3);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    renderer.setSize(450, 450);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Éclairage
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(1, 2, 1);
    scene.add(directionalLight);

    // Chargement de la bougie
    const loader = new GLTFLoader();
    loader.load(
      "/models/candleGlass.glb",
      (gltf) => {
        const candle = gltf.scene;

        // Positionner la bougie plus bas
        candle.position.set(0, -0.5, 0);

        // Debug des textures et matériaux
        console.log("=== BOUGIE CHARGÉE ===");
        console.log("Matériaux trouvés:");
        candle.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            console.log("- Mesh:", child.name);
            console.log("  Matériau:", child.material);
            if (child.material.map) {
              console.log("  Texture:", child.material.map);
            }
            // Activer les ombres
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        scene.add(candle);
        candleRef.current = candle;
      },
      undefined,
      (error) => {
        console.error("Erreur chargement bougie:", error);
      }
    );

    // Flamme animée
    const flameGeometry = new THREE.ConeGeometry(0.03, 0.14, 8);
    const flameShaderMaterial = new THREE.ShaderMaterial({
      vertexShader: flameVertexShader,
      fragmentShader: flameFragmentShader,
      uniforms: {
        time: { value: 0 },
      },
      transparent: true,
      side: THREE.DoubleSide,
    });
    flameShaderRef.current = flameShaderMaterial;

    const flame = new THREE.Mesh(flameGeometry, flameShaderMaterial);
    flame.position.set(0, 0.22, 0); // Ajustée pour suivre la bougie descendue
    scene.add(flame);

    // Animation
    const animate = () => {
      if (!clockRef.current || !flameShaderRef.current) return;

      const time = clockRef.current.getElapsedTime();
      flameShaderRef.current.uniforms.time.value = time;

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }

      requestAnimationFrame(animate);
    };

    animate();

    // Nettoyage
    return () => {
      if (
        rendererRef.current &&
        container.contains(rendererRef.current.domElement)
      ) {
        container.removeChild(rendererRef.current.domElement);
      }
      rendererRef.current?.dispose();
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
}
