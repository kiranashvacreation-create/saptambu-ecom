"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

type LuxuryProductStageProps = {
  title: string;
  eyebrow: string;
};

const BOTTLE_MODEL = "/models/saptambu-bottle-web.glb";
const MINIMUM_STAGE_LOAD_MS = 1200;
const DROPLET_COUNT = 12;

type DropletState = {
  angle: number;
  mesh: THREE.Mesh;
  phase: number;
  size: number;
  speed: number;
  velocity: number;
  y: number;
};

function makeGlassSheenMaterial() {
  return new THREE.ShaderMaterial({
    depthWrite: false,
    fragmentShader: `
      varying vec4 vColor;
      varying vec3 vLocalPosition;
      varying vec3 vNormalWorld;
      varying vec3 vViewDirection;

      void main() {
        bool labelBand = vLocalPosition.y > -0.68 && vLocalPosition.y < 0.22;
        if (labelBand) discard;

        vec3 normalWorld = normalize(vNormalWorld);
        vec3 viewDirection = normalize(vViewDirection);
        float fresnel = pow(1.0 - max(dot(normalWorld, viewDirection), 0.0), 2.35);
        float verticalHighlight = smoothstep(0.12, 0.72, vLocalPosition.y);
        float alpha = 0.055 + fresnel * 0.34 + verticalHighlight * 0.045;
        vec3 glassColor = mix(vColor.rgb, vec3(0.78, 0.94, 1.0), 0.38);

        gl_FragColor = vec4(glassColor + fresnel * 0.32, alpha);
      }
    `,
    side: THREE.DoubleSide,
    transparent: true,
    vertexShader: `
      varying vec4 vColor;
      varying vec3 vLocalPosition;
      varying vec3 vNormalWorld;
      varying vec3 vViewDirection;

      void main() {
        vColor = color;
        vLocalPosition = position;
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vNormalWorld = normalize(mat3(modelMatrix) * normal);
        vViewDirection = cameraPosition - worldPosition.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPosition;
      }
    `,
    vertexColors: true,
  });
}

function dropletRadiiForY(y: number) {
  const shoulder = THREE.MathUtils.smoothstep(y, 0.18, 0.52);
  return {
    x: THREE.MathUtils.lerp(0.3, 0.17, shoulder),
    z: THREE.MathUtils.lerp(0.31, 0.2, shoulder),
  };
}

function placeDroplet(drop: DropletState, elapsed = 0) {
  const wobble = Math.sin(elapsed * 1.15 + drop.phase) * 0.012;
  const angle = drop.angle + wobble;
  const { x: radiusX, z: radiusZ } = dropletRadiiForY(drop.y);
  drop.mesh.position.set(Math.sin(angle) * radiusX, drop.y, Math.cos(angle) * radiusZ - 0.012);
  drop.mesh.scale.set(drop.size * 0.72, drop.size * (1.18 + drop.velocity * 16), drop.size * 0.36);
}

function resetDroplet(drop: DropletState, spread = 1) {
  drop.angle = 3.65 + (Math.random() - 0.5) * 0.26;
  drop.y = THREE.MathUtils.lerp(0.26, 0.44, Math.random() * spread);
  drop.velocity = THREE.MathUtils.lerp(0.002, 0.006, Math.random());
  placeDroplet(drop);
}

function disposeObject(object: THREE.Object3D) {
  object.traverse((entry) => {
    if (!(entry instanceof THREE.Mesh)) return;
    entry.geometry.dispose();
    const material = entry.material;
    if (Array.isArray(material)) {
      material.forEach((item) => item.dispose());
    } else {
      material.dispose();
    }
  });
}

export function LuxuryProductStage({ title, eyebrow }: LuxuryProductStageProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const holderRef = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [hasMounted, setHasMounted] = useState(false);

  const loadingOverlay =
    hasMounted && isLoading && typeof document !== "undefined"
      ? createPortal(
          <div className="fixed inset-0 z-[9999] grid place-items-center bg-[#f7f5f0] px-6 text-center text-[#2a2118]">
            <div className="w-full max-w-sm">
              <div className="font-serif text-3xl font-semibold tracking-[0.08em] text-[#7c5420]">{title}</div>
              <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.32em] text-[#9a6a28]">
                Loading {eyebrow} bottle
              </p>
              <div className="mt-7 h-px w-full overflow-hidden bg-[#9a6a28]/20">
                <div
                  className="h-full bg-[linear-gradient(90deg,#9a6a28,#6fbfd5)] transition-[width] duration-300"
                  style={{ width: `${Math.max(10, progress)}%` }}
                />
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  useEffect(() => {
    const canvas = canvasRef.current;
    const holder = holderRef.current;
    if (!canvas || !holder) return;

    setHasMounted(true);
    setIsLoading(true);
    setProgress(0);

    let isMounted = true;
    let animationId = 0;
    let loadingTimer = 0;
    const loadingStartedAt = performance.now();

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 0.15, 8.2);
    const clock = new THREE.Clock();
    const droplets: DropletState[] = [];

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      canvas,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0xffffff, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;

    const product = new THREE.Group();
    product.rotation.set(0.02, -0.24, -0.16);
    product.position.set(1.34, -0.18, 0);
    product.scale.setScalar(0.92);
    scene.add(product);

    const bottleRig = new THREE.Group();
    bottleRig.rotation.y = Math.PI - 0.56;
    product.add(bottleRig);

    scene.add(new THREE.HemisphereLight(0xffffff, 0xe8dcc7, 1.8));
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.8);
    keyLight.position.set(3.2, 4.4, 4.2);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0xceeaff, 2);
    rimLight.position.set(-3.5, 2.8, 3.8);
    scene.add(rimLight);
    const glassSheenMaterial = makeGlassSheenMaterial();
    const dropletMaterial = new THREE.MeshPhysicalMaterial({
      clearcoat: 1,
      clearcoatRoughness: 0,
      color: 0xcdf8ff,
      depthWrite: false,
      metalness: 0,
      opacity: 0.58,
      roughness: 0,
      transparent: true,
      transmission: 0.74,
    });
    const dropletGeometry = new THREE.SphereGeometry(1, 14, 10);

    const loader = new GLTFLoader();
    loader.load(
      BOTTLE_MODEL,
      (gltf) => {
        const model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const scale = 4.34 / Math.max(size.x, size.y, size.z, 0.001);

        model.position.sub(center);
        model.scale.setScalar(scale);
        model.position.y = 0.06;
        const overlays: THREE.Mesh[] = [];
        model.traverse((entry) => {
          if (!(entry instanceof THREE.Mesh)) return;
          entry.frustumCulled = false;
          const materials = Array.isArray(entry.material) ? entry.material : [entry.material];
          materials.forEach((material) => {
            if ("roughness" in material) material.roughness = 0.2;
            if ("metalness" in material) material.metalness = 0;
            material.side = THREE.DoubleSide;
            material.needsUpdate = true;
          });
          const overlay = new THREE.Mesh(entry.geometry.clone(), glassSheenMaterial);
          overlay.position.copy(entry.position);
          overlay.quaternion.copy(entry.quaternion);
          overlay.scale.copy(entry.scale);
          overlay.renderOrder = 2;
          overlays.push(overlay);
        });
        overlays.forEach((overlay) => model.add(overlay));

        const dropletGroup = new THREE.Group();
        for (let index = 0; index < DROPLET_COUNT; index += 1) {
          const droplet = new THREE.Mesh(dropletGeometry, dropletMaterial);
          droplet.renderOrder = 3;
          const state: DropletState = {
            angle: Math.PI,
            mesh: droplet,
            phase: Math.random() * Math.PI * 2,
            size: THREE.MathUtils.lerp(0.006, 0.012, Math.random()),
            speed: THREE.MathUtils.lerp(0.006, 0.016, Math.random()),
            velocity: 0,
            y: 0.8,
          };
          resetDroplet(state, index / DROPLET_COUNT);
          droplets.push(state);
          dropletGroup.add(droplet);
        }
        model.add(dropletGroup);

        bottleRig.add(model);

        const remaining = Math.max(0, MINIMUM_STAGE_LOAD_MS - (performance.now() - loadingStartedAt));
        setProgress(100);
        loadingTimer = window.setTimeout(() => {
          if (isMounted) setIsLoading(false);
        }, remaining);
      },
      (event) => {
        if (!isMounted) return;
        if (event.total > 0) {
          setProgress(Math.min(96, Math.round((event.loaded / event.total) * 96)));
        } else {
          setProgress((current) => Math.min(86, current + 6));
        }
      },
      () => {
        if (!isMounted) return;
        setProgress(100);
        loadingTimer = window.setTimeout(() => setIsLoading(false), 600);
      },
    );

    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const onPointerMove = (event: PointerEvent) => {
      const rect = holder.getBoundingClientRect();
      pointer.targetX = ((event.clientX - rect.left) / Math.max(rect.width, 1) - 0.5) * 2;
      pointer.targetY = ((event.clientY - rect.top) / Math.max(rect.height, 1) - 0.5) * 2;
    };
    window.addEventListener("pointermove", onPointerMove);

    const resize = () => {
      const { width, height } = holder.getBoundingClientRect();
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
      product.position.x = width < 720 ? 0.52 : 1.34;
      product.scale.setScalar(width < 720 ? 0.98 : 0.92);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(holder);
    resize();

    const animate = () => {
      const delta = Math.min(clock.getDelta(), 0.04);
      const elapsed = clock.elapsedTime;
      pointer.x += (pointer.targetX - pointer.x) * 0.045;
      pointer.y += (pointer.targetY - pointer.y) * 0.045;
      product.rotation.y = -0.24 + pointer.x * 0.12;
      product.rotation.x = 0.02 - pointer.y * 0.045;
      droplets.forEach((drop) => {
        drop.velocity += (drop.speed - drop.velocity) * 0.026;
        drop.velocity *= 1 - delta * 0.9;
        drop.y -= drop.velocity * delta * 5.2;
        if (drop.y < 0.23) resetDroplet(drop);
        placeDroplet(drop, elapsed);
      });
      renderer.render(scene, camera);
      animationId = window.requestAnimationFrame(animate);
    };
    animate();

    return () => {
      isMounted = false;
      window.clearTimeout(loadingTimer);
      window.cancelAnimationFrame(animationId);
      window.removeEventListener("pointermove", onPointerMove);
      observer.disconnect();
      disposeObject(scene);
      glassSheenMaterial.dispose();
      dropletMaterial.dispose();
      dropletGeometry.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={holderRef} className="relative h-full min-h-screen w-full" aria-label="Interactive 3D Saptambu bottle">
      <canvas ref={canvasRef} className="h-full w-full" />
      {loadingOverlay}
    </div>
  );
}
