"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { deliveryAssets } from "@/lib/cloudinary-assets";
import { createGltfLoader } from "@/lib/gltf-loader";

type StaticBottleStageProps = {
  className?: string;
  variant: "hero" | "spotlight";
};

const BOTTLE_MODEL = deliveryAssets.models.originalBottle;
const BOTTLE_MODEL_FALLBACK = deliveryAssets.models.webBottleFallback;

let cachedBottleModel: Promise<THREE.Group> | null = null;

function loadGltf(src: string) {
  const { dracoLoader, loader } = createGltfLoader();

  return new Promise<GLTF>((resolve, reject) => {
    loader.load(src, resolve, undefined, reject);
  }).finally(() => {
    dracoLoader.dispose();
  });
}

function normalizeModel(model: THREE.Group) {
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const scale = 4.15 / Math.max(size.x, size.y, size.z, 0.001);

  model.position.sub(center);
  model.scale.setScalar(scale);
  model.position.y = 0.08;
  model.traverse((entry) => {
    if (!(entry instanceof THREE.Mesh)) return;
    entry.frustumCulled = false;
  });

  return model;
}

function getBottleModel() {
  if (!cachedBottleModel) {
    cachedBottleModel = loadGltf(BOTTLE_MODEL)
      .catch(() => loadGltf(BOTTLE_MODEL_FALLBACK))
      .then((gltf) => normalizeModel(gltf.scene))
      .catch((error) => {
        cachedBottleModel = null;
        throw error;
      });
  }

  return cachedBottleModel;
}

function cloneBottleModel(source: THREE.Group) {
  const clone = source.clone(true);

  clone.traverse((entry) => {
    if (!(entry instanceof THREE.Mesh)) return;

    entry.geometry = entry.geometry.clone();
    const materials = Array.isArray(entry.material) ? entry.material : [entry.material];
    const clonedMaterials = materials.map((material) => {
      const cloned = material.clone();
      cloned.side = THREE.DoubleSide;
      if ("roughness" in cloned && typeof cloned.roughness === "number") cloned.roughness = Math.min(cloned.roughness, 0.26);
      if ("metalness" in cloned && typeof cloned.metalness === "number") cloned.metalness = 0;
      cloned.needsUpdate = true;
      return cloned;
    });

    entry.material = Array.isArray(entry.material) ? clonedMaterials : clonedMaterials[0];
  });

  return clone;
}

function disposeObject(object: THREE.Object3D) {
  object.traverse((entry) => {
    if (!(entry instanceof THREE.Mesh)) return;
    entry.geometry.dispose();
    const materials = Array.isArray(entry.material) ? entry.material : [entry.material];
    materials.forEach((material) => material.dispose());
  });
}

export function StaticBottleStage({ className = "", variant }: StaticBottleStageProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const haloRef = useRef<HTMLDivElement | null>(null);
  const holderRef = useRef<HTMLDivElement | null>(null);
  const [hasModel, setHasModel] = useState(false);
  const [hasLoadError, setHasLoadError] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const holder = holderRef.current;
    if (!canvas || !holder) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let animationFrame = 0;
    let disposed = false;
    let isVisible = false;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(31, 1, 0.1, 100);
    camera.position.set(0, 0.15, variant === "hero" ? 8.2 : 8.35);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      canvas,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0xffffff, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = variant === "hero" ? 1.22 : 1.12;

    const product = new THREE.Group();
    product.rotation.set(0.015, 0, -0.04);
    scene.add(product);

    const bottleRig = new THREE.Group();
    bottleRig.rotation.y = 0;
    product.add(bottleRig);

    scene.add(new THREE.HemisphereLight(0xfffbf0, 0xd6b789, 1.65));
    const keyLight = new THREE.DirectionalLight(0xfff1c6, variant === "hero" ? 4.2 : 3.5);
    keyLight.position.set(3.8, 4.2, 4.6);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0xd3ecff, 1.45);
    fillLight.position.set(-3.5, 2.2, 3.8);
    scene.add(fillLight);
    const rimLight = new THREE.DirectionalLight(0xffb15f, 1.6);
    rimLight.position.set(-2.6, 3.6, -2.2);
    scene.add(rimLight);

    const pointer = { targetX: 0, targetY: 0, x: 0, y: 0 };
    let baseProductX = 0;
    let baseProductY = 0;

    const resize = () => {
      const { width, height } = holder.getBoundingClientRect();
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();

      const isCompact = width < 640;
      baseProductX = variant === "hero" ? (isCompact ? 0 : 0.08) : isCompact ? 0 : -0.04;
      baseProductY = variant === "hero" ? (isCompact ? -0.12 : -0.16) : -0.2;
      product.position.set(baseProductX, baseProductY, 0);
      product.scale.setScalar(variant === "hero" ? (isCompact ? 0.94 : 1.02) : isCompact ? 0.86 : 0.92);
      renderer.render(scene, camera);
    };

    const animate = () => {
      animationFrame = 0;
      if (disposed || !isVisible) return;

      pointer.x += (pointer.targetX - pointer.x) * (prefersReducedMotion ? 1 : 0.065);
      pointer.y += (pointer.targetY - pointer.y) * (prefersReducedMotion ? 1 : 0.065);

      if (!prefersReducedMotion) {
        product.rotation.y = pointer.x * 0.055;
        product.rotation.x = 0.015 - pointer.y * 0.025;
        product.position.x = baseProductX + pointer.x * 0.035;
        product.position.y = baseProductY - pointer.y * 0.018;
      }

      const halo = haloRef.current;
      if (halo) {
        halo.style.transform = `translate3d(${pointer.x * 18}px, ${pointer.y * 14}px, 0) translate(-50%, -50%)`;
      }

      renderer.render(scene, camera);
      animationFrame = window.requestAnimationFrame(animate);
    };

    const start = () => {
      if (!animationFrame) animationFrame = window.requestAnimationFrame(animate);
    };

    const stop = () => {
      if (!animationFrame) return;
      window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = holder.getBoundingClientRect();
      pointer.targetX = ((event.clientX - rect.left) / Math.max(rect.width, 1) - 0.5) * 2;
      pointer.targetY = ((event.clientY - rect.top) / Math.max(rect.height, 1) - 0.5) * 2;
      start();
    };

    const onPointerLeave = () => {
      pointer.targetX = 0;
      pointer.targetY = 0;
      start();
    };

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry?.isIntersecting ?? false;
        if (isVisible) start();
        else stop();
      },
      { threshold: 0.08 },
    );

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(holder);
    visibilityObserver.observe(holder);
    holder.addEventListener("pointermove", onPointerMove);
    holder.addEventListener("pointerleave", onPointerLeave);

    resize();
    setHasModel(false);
    setHasLoadError(false);

    getBottleModel()
      .then((source) => {
        if (disposed) return;
        const model = cloneBottleModel(source);
        bottleRig.add(model);
        setHasModel(true);
        resize();
        start();
      })
      .catch(() => {
        if (!disposed) setHasLoadError(true);
      });

    return () => {
      disposed = true;
      stop();
      holder.removeEventListener("pointermove", onPointerMove);
      holder.removeEventListener("pointerleave", onPointerLeave);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      disposeObject(scene);
      renderer.dispose();
    };
  }, [variant]);

  return (
    <div
      ref={holderRef}
      aria-label="Interactive Saptambu bottle"
      className={`relative isolate min-h-[25rem] overflow-hidden rounded-lg border border-[#dbc6a4]/70 bg-[#f7efe1] shadow-[0_24px_70px_rgba(91,57,19,0.14)] ${className}`}
      data-static-bottle-stage={variant}
    >
      <div
        ref={haloRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[76%] w-[76%] rounded-full bg-[radial-gradient(circle,rgba(224,170,65,0.46)_0%,rgba(255,242,196,0.27)_38%,rgba(255,242,196,0)_72%)] blur-2xl transition-opacity duration-500"
        style={{ opacity: hasLoadError ? 0.28 : 1, transform: "translate3d(0, 0, 0) translate(-50%, -50%)" }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_50%_58%,rgba(255,255,255,0.78),rgba(247,239,225,0.38)_50%,rgba(203,145,57,0.1)_100%)]" />
      <canvas ref={canvasRef} className="relative z-10 h-full min-h-[25rem] w-full" />
      {!hasModel && !hasLoadError ? (
        <div className="pointer-events-none absolute inset-x-[18%] bottom-10 z-20 h-px overflow-hidden bg-[#b88424]/20">
          <div className="h-full w-1/2 animate-[static-bottle-loader_1.15s_ease-in-out_infinite] bg-[linear-gradient(90deg,transparent,#b88424,transparent)]" />
        </div>
      ) : null}
      <style jsx>{`
        @keyframes static-bottle-loader {
          from {
            transform: translateX(-110%);
          }
          to {
            transform: translateX(210%);
          }
        }
      `}</style>
    </div>
  );
}
