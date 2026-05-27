"use client";

import Link from "next/link";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import * as THREE from "three";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { deliveryAssets, localMediaFallbacks } from "@/lib/cloudinary-assets";
import { createGltfLoader } from "@/lib/gltf-loader";

type ChapterLayout = "left" | "right" | "split";
type BottleSide = "left" | "right" | "center";

type Grade = {
  brightness: string;
  contrast: string;
  hue: string;
  overlay: string;
  overlayOpacity: string;
  saturation: string;
};

type LightProfile = {
  ambient: string;
  ambientIntensity: number;
  exposure: number;
  fill: string;
  fillIntensity: number;
  key: string;
  keyIntensity: number;
  rim: string;
  rimIntensity: number;
};

type StepBeat = {
  body: string;
  bottleSide: BottleSide;
  eyebrow: string;
  filmTime: number;
  grade: Grade;
  layout: ChapterLayout;
  light: LightProfile;
  phase: string;
  title: string;
};

type BottlePose = {
  opacity: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  scale: number;
  x: number;
  y: number;
  z: number;
};

const homeFilm = deliveryAssets.videos.homeFilm;
const homeFilmFallback = localMediaFallbacks.videos.homeFilm;

const grades = {
  amberGreen: {
    brightness: "0.9",
    contrast: "1.04",
    hue: "3deg",
    overlay: "rgba(145, 105, 34, 0.12)",
    overlayOpacity: "0.34",
    saturation: "1.08",
  },
  coolOrigin: {
    brightness: "0.88",
    contrast: "1.04",
    hue: "-4deg",
    overlay: "rgba(54, 100, 145, 0.12)",
    overlayOpacity: "0.32",
    saturation: "1.02",
  },
  deepGold: {
    brightness: "0.86",
    contrast: "1.07",
    hue: "4deg",
    overlay: "rgba(150, 79, 23, 0.16)",
    overlayOpacity: "0.4",
    saturation: "1.12",
  },
  templeGold: {
    brightness: "0.9",
    contrast: "1.05",
    hue: "2deg",
    overlay: "rgba(204, 137, 46, 0.12)",
    overlayOpacity: "0.34",
    saturation: "1.08",
  },
  underwater: {
    brightness: "0.84",
    contrast: "1.08",
    hue: "-8deg",
    overlay: "rgba(25, 103, 142, 0.14)",
    overlayOpacity: "0.36",
    saturation: "1.04",
  },
} satisfies Record<string, Grade>;

const lights = {
  amberGreen: {
    ambient: "#fff0d8",
    ambientIntensity: 0.76,
    exposure: 1.18,
    fill: "#c7dfad",
    fillIntensity: 0.86,
    key: "#ffd18a",
    keyIntensity: 3.25,
    rim: "#ed8f45",
    rimIntensity: 1.8,
  },
  coolOrigin: {
    ambient: "#e8f2ff",
    ambientIntensity: 0.76,
    exposure: 1.13,
    fill: "#b8dcff",
    fillIntensity: 0.95,
    key: "#fff1d2",
    keyIntensity: 3.1,
    rim: "#75a7dc",
    rimIntensity: 1.7,
  },
  deepGold: {
    ambient: "#f5e0c2",
    ambientIntensity: 0.76,
    exposure: 1.18,
    fill: "#ffc26f",
    fillIntensity: 0.98,
    key: "#ffd18b",
    keyIntensity: 3.55,
    rim: "#f06f31",
    rimIntensity: 2.05,
  },
  templeGold: {
    ambient: "#fff0d2",
    ambientIntensity: 0.78,
    exposure: 1.2,
    fill: "#ffc77d",
    fillIntensity: 1.02,
    key: "#ffe0a4",
    keyIntensity: 3.42,
    rim: "#d89951",
    rimIntensity: 1.88,
  },
  underwater: {
    ambient: "#d8f4ff",
    ambientIntensity: 0.72,
    exposure: 1.08,
    fill: "#77cbe1",
    fillIntensity: 0.88,
    key: "#dffcff",
    keyIntensity: 2.82,
    rim: "#3ca0c7",
    rimIntensity: 1.95,
  },
} satisfies Record<string, LightProfile>;

const stepTimeline: StepBeat[] = [
  {
    body: "Where Himalayan ice becomes the first sacred current.",
    bottleSide: "right",
    eyebrow: "01",
    filmTime: 0.1,
    grade: grades.coolOrigin,
    layout: "left",
    light: lights.coolOrigin,
    phase: "Origin",
    title: "The Origin",
  },
  {
    body: "Golden ghats, prayer, and a river held as mother.",
    bottleSide: "left",
    eyebrow: "02",
    filmTime: 2.8,
    grade: grades.templeGold,
    layout: "right",
    light: lights.templeGold,
    phase: "First Four Rivers",
    title: "Ganga",
  },
  {
    body: "Mist, reflection, and heritage moving softly at dawn.",
    bottleSide: "left",
    eyebrow: "03",
    filmTime: 5.6,
    grade: grades.templeGold,
    layout: "right",
    light: lights.templeGold,
    phase: "First Four Rivers",
    title: "Yamuna",
  },
  {
    body: "The hidden river, remembered beneath stone and water.",
    bottleSide: "left",
    eyebrow: "04",
    filmTime: 7.3,
    grade: grades.underwater,
    layout: "right",
    light: lights.underwater,
    phase: "First Four Rivers",
    title: "Saraswati",
  },
  {
    body: "A canyon river shaped by rock, fall, and sunset mist.",
    bottleSide: "left",
    eyebrow: "05",
    filmTime: 9.9,
    grade: grades.templeGold,
    layout: "right",
    light: lights.templeGold,
    phase: "First Four Rivers",
    title: "Narmada",
  },
  {
    body: "A life-giving southern current across fertile sacred land.",
    bottleSide: "right",
    eyebrow: "06",
    filmTime: 12.6,
    grade: grades.templeGold,
    layout: "left",
    light: lights.templeGold,
    phase: "Next Three Rivers",
    title: "Godavari",
  },
  {
    body: "Temple light and wide water under a burning sky.",
    bottleSide: "right",
    eyebrow: "07",
    filmTime: 14.5,
    grade: grades.amberGreen,
    layout: "left",
    light: lights.amberGreen,
    phase: "Next Three Rivers",
    title: "Krishna",
  },
  {
    body: "Islands, bridges, and green river devotion in quiet flow.",
    bottleSide: "right",
    eyebrow: "08",
    filmTime: 17.2,
    grade: grades.amberGreen,
    layout: "left",
    light: lights.amberGreen,
    phase: "Next Three Rivers",
    title: "Kaveri",
  },
  {
    body: "Many currents becoming one vast sacred meeting.",
    bottleSide: "left",
    eyebrow: "09",
    filmTime: 20.4,
    grade: grades.deepGold,
    layout: "right",
    light: lights.deepGold,
    phase: "Confluence And Essence",
    title: "The Confluence",
  },
  {
    body: "A river crossing mountains, plains, memory, and time.",
    bottleSide: "right",
    eyebrow: "10",
    filmTime: 22.8,
    grade: grades.deepGold,
    layout: "left",
    light: lights.deepGold,
    phase: "Confluence And Essence",
    title: "The Journey",
  },
  {
    body: "The offering distilled into Saptambu.",
    bottleSide: "center",
    eyebrow: "11",
    filmTime: 28.75,
    grade: grades.deepGold,
    layout: "split",
    light: lights.deepGold,
    phase: "Confluence And Essence",
    title: "The Essence",
  },
];

const VIDEO_START_TIME = 0.001;
const SEEK_EPSILON_SECONDS = 1 / 30;
const HOME_FILM_DURATION_SECONDS = 29.29;
const HOME_FILM_END_TIME = 29.2;
const LABEL_FRONT_Y = 0;
const MIN_SAME_VIDEO_TRANSITION_SECONDS = 0.85;
const MAX_SAME_VIDEO_TRANSITION_SECONDS = 1.45;
const BOTTLE_MODEL_SRC = deliveryAssets.models.originalBottle;
const BOTTLE_MODEL_FALLBACK_SRC = localMediaFallbacks.models.originalBottle;
const BOTTLE_LOAD_TIMEOUT_MS = 60_000;
const SCROLL_DISTANCE_PER_STEP_SVH = 220;
const SCROLL_STAGE_HEIGHT_SVH = 100 + (stepTimeline.length - 1) * SCROLL_DISTANCE_PER_STEP_SVH;

const rootStyle = {
  "--left-gradient-opacity": "1",
  "--right-gradient-opacity": "0.18",
  "--scene-overlay-color": stepTimeline[0].grade.overlay,
  "--scene-overlay-opacity": stepTimeline[0].grade.overlayOpacity,
  "--video-brightness": stepTimeline[0].grade.brightness,
  "--video-contrast": stepTimeline[0].grade.contrast,
  "--video-hue": stepTimeline[0].grade.hue,
  "--video-saturation": stepTimeline[0].grade.saturation,
} as CSSProperties;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getSafeVideoTime(video: HTMLVideoElement, filmTime: number) {
  if (!video.duration || Number.isNaN(video.duration)) return Math.max(filmTime, VIDEO_START_TIME);
  const end = Math.max(video.duration - 0.045, VIDEO_START_TIME);
  return clamp(filmTime <= 0 ? VIDEO_START_TIME : filmTime, VIDEO_START_TIME, end);
}

function setVideoTime(video: HTMLVideoElement, filmTime: number, force = false) {
  const nextTime = getSafeVideoTime(video, filmTime);
  if (force || Math.abs(video.currentTime - nextTime) >= SEEK_EPSILON_SECONDS) {
    try {
      video.currentTime = nextTime;
    } catch {
      // Some mobile browsers reject seeks until metadata is ready; the next scroll tick retries.
    }
  }
}

function getTextPanelClass(layout: ChapterLayout) {
  const base =
    "pointer-events-none absolute z-40 min-w-0 overflow-hidden break-words will-change-[transform,opacity,filter]";

  if (layout === "right") {
    return `${base} right-[clamp(1rem,4.6vw,7rem)] top-1/2 w-[min(17rem,44vw)] text-right sm:right-[clamp(1.4rem,7vw,7rem)] sm:w-[min(33rem,calc(100vw-2.8rem))] md:w-[min(33rem,38vw)]`;
  }

  if (layout === "split") {
    return `${base} inset-x-[clamp(1rem,5vw,6rem)] top-[24vh] grid gap-3 text-center sm:gap-6 md:top-1/2 md:grid-cols-[minmax(0,0.84fr)_minmax(0,0.68fr)] md:items-center md:text-left`;
  }

  return `${base} left-[clamp(1rem,4.6vw,7rem)] top-1/2 w-[min(17rem,44vw)] text-left sm:left-[clamp(1.4rem,7vw,7rem)] sm:w-[min(33rem,calc(100vw-2.8rem))] md:w-[min(33rem,38vw)]`;
}

function getBottlePoseForStep(step: StepBeat): BottlePose {
  const mobile = typeof window !== "undefined" && window.innerWidth < 768;
  const sideX = step.bottleSide === "left" ? -0.92 : step.bottleSide === "center" ? 0 : 0.92;
  const mobileX = step.bottleSide === "left" ? -0.24 : step.bottleSide === "center" ? 0 : 0.24;

  if (step.eyebrow === "01") {
    return {
      opacity: 0.9,
      rotationX: mobile ? 0.01 : -0.01,
      rotationY: LABEL_FRONT_Y + (mobile ? 0.01 : 0.028),
      rotationZ: -0.045,
      scale: mobile ? 0.52 : 0.62,
      x: mobile ? mobileX : sideX,
      y: mobile ? -0.1 : -0.08,
      z: mobile ? -0.5 : -0.34,
    };
  }

  if (step.eyebrow === "11") {
    return {
      opacity: 1,
      rotationX: mobile ? 0.01 : -0.015,
      rotationY: LABEL_FRONT_Y - 0.015,
      rotationZ: -0.08,
      scale: mobile ? 0.68 : 0.95,
      x: 0,
      y: mobile ? -0.06 : -0.04,
      z: mobile ? -0.44 : 0.08,
    };
  }

  return {
    opacity: step.eyebrow === "09" ? 0.94 : 0.88,
    rotationX: mobile ? 0.005 : -0.012,
    rotationY: LABEL_FRONT_Y + (step.bottleSide === "left" ? -0.04 : 0.04),
    rotationZ: step.bottleSide === "left" ? 0.04 : -0.05,
    scale: mobile ? 0.5 : step.eyebrow === "09" ? 0.72 : 0.68,
    x: mobile ? mobileX : sideX,
    y: mobile ? -0.1 : -0.12,
    z: mobile ? -0.48 : -0.12,
  };
}

function progressForStep(stepIndex: number) {
  return stepIndex / (stepTimeline.length - 1);
}

export function VideoSequenceHome() {
  const [isLoading, setIsLoading] = useState(true);
  const [loaderProgress, setLoaderProgress] = useState(0);
  const [bottleLoadError, setBottleLoadError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const rootRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const bottleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const cursorDotRef = useRef<HTMLDivElement | null>(null);
  const cursorRingRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current ?? root?.querySelector<HTMLDivElement>("[data-video-track]");
    const progressBar = progressRef.current ?? root?.querySelector<HTMLDivElement>("[data-sequence-progress]");
    const canvas = bottleCanvasRef.current ?? root?.querySelector<HTMLCanvasElement>("[data-bottle-canvas]");
    if (!root || !track || !progressBar || !canvas) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nav = navigator as Navigator & {
      connection?: { effectiveType?: string; saveData?: boolean };
      deviceMemory?: number;
    };
    const effectiveType = nav.connection?.effectiveType ?? "";
    const isLowEndDevice =
      prefersReducedMotion ||
      nav.connection?.saveData ||
      effectiveType.includes("2g") ||
      effectiveType.includes("3g") ||
      (nav.deviceMemory ?? 8) <= 4 ||
      navigator.hardwareConcurrency <= 4 ||
      window.innerWidth < 768;
    const pointerFine = window.matchMedia("(pointer: fine)").matches;
    const enableCustomCursor = pointerFine && window.innerWidth >= 768;
    const renderPixelRatio = () => Math.min(window.devicePixelRatio, isLowEndDevice ? 0.82 : 1.08);
    const renderFrameInterval = 1000 / (isLowEndDevice ? 24 : 42);
    const videoNodes = videoRefs.current.filter((video): video is HTMLVideoElement => Boolean(video));
    const cursorDot = cursorDotRef.current;
    const cursorRing = cursorRingRef.current;

    let activeStep = 0;
    let ambientLight: THREE.AmbientLight | null = null;
    let assetsReady = false;
    let bottleGroup: THREE.Group | null = null;
    let cursorFrame = 0;
    let disposed = false;
    let essenceBackgroundGroup: THREE.Group | null = null;
    let essenceBackgroundOpacity = 0;
    let fillLight: THREE.PointLight | null = null;
    let keyLight: THREE.DirectionalLight | null = null;
    let renderFrame = 0;
    let lastRenderAt = 0;
    let renderer: THREE.WebGLRenderer | null = null;
    let rimLight: THREE.DirectionalLight | null = null;
    let bottleTween: gsap.core.Tween | null = null;
    let scrollFrame = 0;
    let transitionTimer = 0;
    const videoTweens = new Map<HTMLVideoElement, gsap.core.Tween>();
    const readyVideoIndexes = new Set<number>();
    const videoReadyPromises = new Map<number, Promise<void>>();
    const loadingParts = {
      bottle: 0,
      setup: 0,
      video: 0,
    };

    const syncLoadProgress = () => {
      const nextProgress =
        loadingParts.setup * 18 +
        loadingParts.video * 67 +
        loadingParts.bottle * 15;
      setLoaderProgress((current) => Math.max(current, clamp(nextProgress, 0, 100)));
    };

    const setLoadPart = (part: keyof typeof loadingParts, value: number) => {
      if (disposed) return;
      loadingParts[part] = Math.max(loadingParts[part], clamp(value, 0, 1));
      syncLoadProgress();
    };

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 100);
    const targetPose = getBottlePoseForStep(stepTimeline[0]);
    const bottlePose: BottlePose = {
      opacity: 0,
      rotationX: targetPose.rotationX,
      rotationY: targetPose.rotationY,
      rotationZ: targetPose.rotationZ,
      scale: targetPose.scale,
      x: targetPose.x,
      y: targetPose.y,
      z: targetPose.z,
    };
    const mouse = { x: 0, y: 0 };
    const smoothMouse = { x: 0, y: 0 };
    const cursor = {
      dotX: window.innerWidth / 2,
      dotY: window.innerHeight / 2,
      ringX: window.innerWidth / 2,
      ringY: window.innerHeight / 2,
    };
    const materialBase = new WeakMap<THREE.Material, { opacity: number; transparent: boolean }>();
    const essenceMaterials: THREE.Material[] = [];
    const { dracoLoader, loader: gltfLoader } = createGltfLoader();

    const getTextNodes = () => Array.from(root.querySelectorAll<HTMLDivElement>("[data-step-panel]"));

    const setMaterialOpacity = (material: THREE.Material, opacity: number) => {
      if (!materialBase.has(material)) {
        materialBase.set(material, { opacity: material.opacity, transparent: material.transparent });
      }
      const base = materialBase.get(material);
      if (!base) return;
      material.opacity = base.opacity * opacity;
      material.transparent = opacity < 0.995 || base.transparent;
      material.needsUpdate = true;
    };

    const setBottleOpacity = (opacity: number) => {
      if (!bottleGroup) return;
      bottleGroup.traverse((child) => {
        const mesh = child as THREE.Mesh;
        if (!mesh.isMesh || !mesh.material) return;
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        materials.forEach((material) => setMaterialOpacity(material, opacity));
      });
    };

    const updateRootDataset = (stepIndex: number) => {
      root.dataset.activeStep = String(stepIndex + 1);
      root.dataset.activeTitle = stepTimeline[stepIndex].title;
      root.dataset.activeVideo = "1";
    };

    const updateProgressValue = (value: number, duration = prefersReducedMotion ? 0 : 0.55) => {
      gsap.to(progressBar, {
        duration,
        ease: "power2.out",
        overwrite: true,
        scaleX: clamp(value, 0, 1),
      });
    };

    const updateProgress = (stepIndex: number, duration = prefersReducedMotion ? 0 : 0.55) => {
      updateProgressValue(progressForStep(stepIndex), duration);
    };

    const applyMood = (step: StepBeat) => {
      root.style.setProperty("--video-brightness", step.grade.brightness);
      root.style.setProperty("--video-contrast", step.grade.contrast);
      root.style.setProperty("--video-hue", step.grade.hue);
      root.style.setProperty("--video-saturation", step.grade.saturation);
      root.style.setProperty("--scene-overlay-color", step.grade.overlay);
      root.style.setProperty("--scene-overlay-opacity", step.grade.overlayOpacity);

      const split = step.layout === "split";
      root.style.setProperty("--left-gradient-opacity", step.layout === "left" || split ? "1" : "0.16");
      root.style.setProperty("--right-gradient-opacity", step.layout === "right" || split ? "1" : "0.16");

      if (renderer) renderer.toneMappingExposure = step.light.exposure;

      const ambientColor = new THREE.Color(step.light.ambient);
      const keyColor = new THREE.Color(step.light.key);
      const rimColor = new THREE.Color(step.light.rim);
      const fillColor = new THREE.Color(step.light.fill);

      if (ambientLight) {
        gsap.to(ambientLight.color, { b: ambientColor.b, duration: 0.5, g: ambientColor.g, overwrite: true, r: ambientColor.r });
        gsap.to(ambientLight, { duration: 0.5, intensity: step.light.ambientIntensity, overwrite: true });
      }

      if (keyLight) {
        gsap.to(keyLight.color, { b: keyColor.b, duration: 0.5, g: keyColor.g, overwrite: true, r: keyColor.r });
        gsap.to(keyLight, { duration: 0.5, intensity: step.light.keyIntensity, overwrite: true });
        keyLight.position.x = step.bottleSide === "left" ? -4 : step.bottleSide === "center" ? 2.2 : 4;
      }

      if (rimLight) {
        gsap.to(rimLight.color, { b: rimColor.b, duration: 0.5, g: rimColor.g, overwrite: true, r: rimColor.r });
        gsap.to(rimLight, { duration: 0.5, intensity: step.light.rimIntensity, overwrite: true });
        rimLight.position.x = step.bottleSide === "left" ? 4 : -4;
      }

      if (fillLight) {
        gsap.to(fillLight.color, { b: fillColor.b, duration: 0.5, g: fillColor.g, overwrite: true, r: fillColor.r });
        gsap.to(fillLight, { duration: 0.5, intensity: step.light.fillIntensity, overwrite: true });
        fillLight.position.x = step.bottleSide === "left" ? -2.2 : step.bottleSide === "center" ? 0 : 2.2;
      }
    };

    const applyBottlePose = () => {
      if (bottleGroup) {
        bottleGroup.visible = true;
        bottleGroup.position.set(bottlePose.x, bottlePose.y, bottlePose.z);
        bottleGroup.rotation.set(
          bottlePose.rotationX - smoothMouse.y * 0.025,
          bottlePose.rotationY + smoothMouse.x * 0.035,
          bottlePose.rotationZ,
        );
        bottleGroup.scale.setScalar(bottlePose.scale);
        setBottleOpacity(clamp(bottlePose.opacity, 0, 1));
      }
      canvas.style.opacity = String(clamp(bottlePose.opacity, 0, 1));
    };

    const animateBottlePose = (step: StepBeat, duration = 0.9, immediate = false) => {
      Object.assign(targetPose, getBottlePoseForStep(step));
      bottleTween?.kill();
      bottleTween = null;

      if (prefersReducedMotion || immediate) {
        Object.assign(bottlePose, targetPose);
        applyBottlePose();
        return;
      }

      bottleTween = gsap.to(bottlePose, {
        duration,
        ease: "sine.inOut",
        opacity: targetPose.opacity,
        overwrite: true,
        rotationX: targetPose.rotationX,
        rotationY: targetPose.rotationY,
        rotationZ: targetPose.rotationZ,
        scale: targetPose.scale,
        x: targetPose.x,
        y: targetPose.y,
        z: targetPose.z,
      });
    };

    const getTextOffset = (step: StepBeat) => {
      if (step.layout === "split") return 0;
      return step.layout === "right" ? 16 : -16;
    };

    const hideTextPanel = (element: HTMLDivElement, step: StepBeat) => {
      gsap.set(element, {
        clipPath: "inset(12% 0% 12% 0%)",
        filter: "blur(10px)",
        opacity: 0,
        scale: 0.992,
        x: getTextOffset(step),
        yPercent: -50,
      });
      element.style.setProperty("display", "none", "important");
    };

    const showStepText = (stepIndex: number, immediate = false, previousStepIndex = activeStep) => {
      getTextNodes().forEach((element, index) => {
        const isActive = index === stepIndex;
        const wasActive = index === previousStepIndex;
        const step = stepTimeline[index];
        const offset = getTextOffset(step);

        gsap.killTweensOf(element);
        element.style.transition = "none";

        if (prefersReducedMotion || immediate) {
          if (isActive) {
            element.style.removeProperty("display");
            gsap.set(element, {
              clipPath: "inset(0% 0% 0% 0%)",
              filter: "blur(0px)",
              opacity: 1,
              scale: 1,
              x: 0,
              yPercent: -50,
            });
          } else {
            hideTextPanel(element, step);
          }
          return;
        }

        if (isActive) {
          element.style.removeProperty("display");
          gsap.fromTo(
            element,
            {
              clipPath: "inset(9% 0% 9% 0%)",
              filter: "blur(12px)",
              opacity: wasActive ? 1 : 0,
              scale: wasActive ? 1 : 0.986,
              x: wasActive ? 0 : offset * -0.72,
              yPercent: wasActive ? -50 : -47,
            },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              duration: 0.58,
              ease: "sine.out",
              filter: "blur(0px)",
              opacity: 1,
              overwrite: true,
              scale: 1,
              x: 0,
              yPercent: -50,
            },
          );
          return;
        }

        if (!wasActive && element.style.display === "none") {
          hideTextPanel(element, step);
          return;
        }

        element.style.removeProperty("display");
        gsap.to(element, {
          clipPath: "inset(11% 0% 11% 0%)",
          duration: 0.42,
          ease: "sine.inOut",
          filter: "blur(12px)",
          onComplete: () => {
            if (index !== stepIndex) hideTextPanel(element, step);
          },
          opacity: 0,
          overwrite: true,
          scale: 0.992,
          x: offset,
          yPercent: -53,
        });
      });
    };

    const findStepForFilmTime = (filmTime: number) => {
      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;
      stepTimeline.forEach((step, index) => {
        const distance = Math.abs(step.filmTime - filmTime);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });
      return closestIndex;
    };

    const scrubHomeFilmTo = (filmTime: number, duration = 0.18, immediate = false) => {
      const video = videoNodes[0];
      if (!video) return;
      videoTweens.get(video)?.kill();
      const nextTime = getSafeVideoTime(video, clamp(filmTime, VIDEO_START_TIME, HOME_FILM_END_TIME));

      if (prefersReducedMotion || immediate || Math.abs(video.currentTime - nextTime) > 0.16) {
        setVideoTime(video, nextTime, true);
        return;
      }

      const state = { time: video.currentTime || VIDEO_START_TIME };
      const tween = gsap.to(state, {
        duration,
        ease: "power2.out",
        onComplete: () => {
          setVideoTime(video, nextTime, true);
          videoTweens.delete(video);
        },
        onUpdate: () => setVideoTime(video, state.time),
        overwrite: true,
        time: nextTime,
      });
      videoTweens.set(video, tween);
    };

    const setStaticStep = (stepIndex: number, immediate = false) => {
      const step = stepTimeline[stepIndex];
      activeStep = stepIndex;
      updateRootDataset(stepIndex);
      updateProgress(stepIndex, immediate ? 0 : 0.55);
      applyMood(step);
      animateBottlePose(step, immediate ? 0 : 0.75, immediate);
      showStepText(stepIndex, immediate);
      scrubHomeFilmTo(step.filmTime, 0, true);
    };

    const moveCursor = (event: MouseEvent) => {
      cursor.dotX = event.clientX;
      cursor.dotY = event.clientY;
      mouse.x = (event.clientX / window.innerWidth - 0.5) * 2;
      mouse.y = (event.clientY / window.innerHeight - 0.5) * 2;
      if (cursorDot) {
        cursorDot.style.left = `${event.clientX}px`;
        cursorDot.style.top = `${event.clientY}px`;
      }
    };

    const tickCursor = () => {
      if (disposed) return;
      cursor.ringX += (cursor.dotX - cursor.ringX) * 0.1;
      cursor.ringY += (cursor.dotY - cursor.ringY) * 0.1;
      if (cursorRing) {
        cursorRing.style.left = `${cursor.ringX}px`;
        cursorRing.style.top = `${cursor.ringY}px`;
      }
      cursorFrame = window.requestAnimationFrame(tickCursor);
    };

    const goToStep = (nextStepIndex: number) => {
      if (disposed || !assetsReady) return;
      const clampedIndex = clamp(nextStepIndex, 0, stepTimeline.length - 1);
      if (clampedIndex === activeStep) return;

      const previousStepIndex = activeStep;
      const previousStep = stepTimeline[previousStepIndex];
      const nextStep = stepTimeline[clampedIndex];
      const filmTravel = Math.abs(nextStep.filmTime - previousStep.filmTime);
      const duration = clamp(filmTravel / 4.8, MIN_SAME_VIDEO_TRANSITION_SECONDS, MAX_SAME_VIDEO_TRANSITION_SECONDS);

      activeStep = clampedIndex;
      updateRootDataset(clampedIndex);
      applyMood(nextStep);
      animateBottlePose(nextStep, duration + 0.32);
      window.clearTimeout(transitionTimer);

      const textNodes = getTextNodes();
      gsap.killTweensOf(textNodes);
      showStepText(clampedIndex, false, previousStepIndex);

      transitionTimer = window.setTimeout(() => {
        showStepText(clampedIndex, true);
      }, duration * 1000 + 140);
    };

    const updateFromScroll = () => {
      scrollFrame = 0;
      if (disposed || !assetsReady) return;

      const scrollableDistance = Math.max(root.offsetHeight - window.innerHeight, 1);
      const scrollProgress = clamp(-root.getBoundingClientRect().top / scrollableDistance, 0, 1);
      const filmTime = clamp(scrollProgress * HOME_FILM_DURATION_SECONDS, VIDEO_START_TIME, HOME_FILM_END_TIME);
      const nextStepIndex = findStepForFilmTime(filmTime);

      updateProgressValue(scrollProgress, 0.12);
      scrubHomeFilmTo(filmTime, isLowEndDevice ? 0.22 : 0.16);
      goToStep(nextStepIndex);
    };

    const requestScrollUpdate = () => {
      if (scrollFrame) return;
      scrollFrame = window.requestAnimationFrame(updateFromScroll);
    };

    const onResize = () => {
      if (!renderer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(renderPixelRatio());
      animateBottlePose(stepTimeline[activeStep], 0.35);
      requestScrollUpdate();
    };

    const prepareVideo = (index: number, onProgress?: (progress: number) => void) => {
      const video = videoNodes[index];
      if (!video) return Promise.resolve();
      if (readyVideoIndexes.has(index)) return Promise.resolve();
      const existing = videoReadyPromises.get(index);
      if (existing) return existing;

      const promise = new Promise<void>((resolve) => {
        let resolved = false;
        video.preload = "auto";
        const updateProgress = () => {
          if (!onProgress || !video.duration || Number.isNaN(video.duration) || video.buffered.length === 0) return;
          const bufferedEnd = video.buffered.end(video.buffered.length - 1);
          onProgress(clamp(bufferedEnd / video.duration, 0.06, 0.96));
        };

        const cleanup = () => {
          video.removeEventListener("loadeddata", ready);
          video.removeEventListener("canplay", ready);
          video.removeEventListener("error", onError);
          video.removeEventListener("progress", updateProgress);
        };

        const ready = () => {
          if (resolved) return;
          resolved = true;
          cleanup();
          readyVideoIndexes.add(index);
          video.pause();
          video.muted = true;
          video.playsInline = true;
          setVideoTime(video, stepTimeline[0].filmTime, true);
          onProgress?.(1);
          resolve();
        };

        const onError = () => {
          ready();
        };

        if (video.readyState >= 2 && video.duration) {
          ready();
          return;
        }

        video.addEventListener("loadeddata", ready, { once: true });
        video.addEventListener("canplay", ready, { once: true });
        video.addEventListener("error", onError);
        video.addEventListener("progress", updateProgress);
        video.load();
        window.setTimeout(ready, index === 0 ? 3200 : 5200);
      });

      videoReadyPromises.set(index, promise);
      return promise;
    };

    const initBottleLayer = (onProgress?: (progress: number) => void) => {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, canvas });
      renderer.setPixelRatio(renderPixelRatio());
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = stepTimeline[0].light.exposure;

      camera.position.set(0, 0, 6.2);

      ambientLight = new THREE.AmbientLight(stepTimeline[0].light.ambient, stepTimeline[0].light.ambientIntensity);
      scene.add(ambientLight);

      keyLight = new THREE.DirectionalLight(stepTimeline[0].light.key, stepTimeline[0].light.keyIntensity);
      keyLight.position.set(4, 5, 4);
      scene.add(keyLight);

      rimLight = new THREE.DirectionalLight(stepTimeline[0].light.rim, stepTimeline[0].light.rimIntensity);
      rimLight.position.set(-4, 1.5, -4);
      scene.add(rimLight);

      fillLight = new THREE.PointLight(stepTimeline[0].light.fill, stepTimeline[0].light.fillIntensity, 14);
      fillLight.position.set(2.2, -2, 3);
      scene.add(fillLight);

      essenceBackgroundGroup = new THREE.Group();
      essenceBackgroundGroup.position.set(0, 0, -1.7);
      essenceBackgroundGroup.visible = false;
      scene.add(essenceBackgroundGroup);

      const ringSpecs = [
        { color: 0xd2a85c, inner: 1.56, outer: 1.58, opacity: 0.38, segments: 160 },
        { color: 0xf2d99b, inner: 2.02, outer: 2.035, opacity: 0.2, segments: 180 },
        { color: 0x9a6c32, inner: 2.48, outer: 2.5, opacity: 0.18, segments: 200 },
      ];
      ringSpecs.forEach((spec, index) => {
        const material = new THREE.MeshBasicMaterial({
          blending: THREE.AdditiveBlending,
          color: spec.color,
          depthWrite: false,
          opacity: 0,
          side: THREE.DoubleSide,
          transparent: true,
        });
        const ring = new THREE.Mesh(new THREE.RingGeometry(spec.inner, spec.outer, spec.segments), material);
        ring.rotation.z = index * 0.46;
        ring.userData.baseOpacity = spec.opacity;
        essenceMaterials.push(material);
        essenceBackgroundGroup?.add(ring);
      });

      const flowMaterial = new THREE.MeshBasicMaterial({
        blending: THREE.AdditiveBlending,
        color: 0xd2a85c,
        depthWrite: false,
        opacity: 0,
        side: THREE.DoubleSide,
        transparent: true,
      });
      const flowGeometry = new THREE.TorusGeometry(1.1, 0.006, 8, 180, Math.PI * 1.42);
      for (let index = 0; index < 7; index += 1) {
        const flow = new THREE.Mesh(flowGeometry, flowMaterial);
        const angle = (index / 7) * Math.PI * 2;
        flow.position.set(Math.cos(angle) * 0.86, Math.sin(angle) * 0.42, -0.02 * index);
        flow.rotation.set(0, 0, angle + Math.PI * 0.18);
        flow.scale.setScalar(1 + index * 0.045);
        essenceBackgroundGroup.add(flow);
      }
      flowMaterial.userData.baseOpacity = 0.16;
      essenceMaterials.push(flowMaterial);

      onProgress?.(0.04);

      const loadBottle = (src: string) =>
        new Promise<GLTF>((resolve, reject) => {
          let settled = false;
          const timeout = window.setTimeout(() => {
            if (settled) return;
            settled = true;
            reject(new Error(`Bottle model load timed out: ${src}`));
          }, BOTTLE_LOAD_TIMEOUT_MS);

          gltfLoader.load(
            src,
            (gltf) => {
              if (settled) return;
              settled = true;
              window.clearTimeout(timeout);
              resolve(gltf);
            },
            (event) => {
              if (!event.total) {
                onProgress?.(0.18);
                return;
              }
              onProgress?.(clamp(event.loaded / event.total, 0.04, 0.98));
            },
            (error) => {
              if (settled) return;
              settled = true;
              window.clearTimeout(timeout);
              reject(error instanceof Error ? error : new Error(String(error)));
            },
          );
        });

      const mountBottle = (gltf: GLTF) => {
        if (disposed) return;
        bottleGroup = new THREE.Group();
        const model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);

        model.position.sub(center);
        model.scale.setScalar(2.55 / maxDim);
        model.traverse((child) => {
          const mesh = child as THREE.Mesh;
          if (!mesh.isMesh) return;
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          materials.forEach((material) => {
            if (material && "envMapIntensity" in material) {
              material.envMapIntensity = 1.25;
              material.needsUpdate = true;
            }
          });
        });

        bottleGroup.add(model);
        bottleGroup.visible = true;
        scene.add(bottleGroup);
        animateBottlePose(stepTimeline[activeStep], 0, true);
        onProgress?.(1);
      };

      return loadBottle(BOTTLE_MODEL_SRC)
        .catch((error) => {
          console.warn("Cloudinary Saptambu bottle load failed; trying local fallback.", error);
          onProgress?.(0.12);
          return loadBottle(BOTTLE_MODEL_FALLBACK_SRC);
        })
        .then(mountBottle);
    };

    const renderBottleLayer = () => {
      if (disposed) return;
      const now = performance.now();
      if (now - lastRenderAt < renderFrameInterval) {
        renderFrame = window.requestAnimationFrame(renderBottleLayer);
        return;
      }
      lastRenderAt = now;
      if (!renderer) {
        renderFrame = window.requestAnimationFrame(renderBottleLayer);
        return;
      }

      smoothMouse.x += (mouse.x - smoothMouse.x) * 0.045;
      smoothMouse.y += (mouse.y - smoothMouse.y) * 0.045;

      applyBottlePose();

      const essenceTargetOpacity = activeStep === stepTimeline.length - 1 ? 1 : 0;
      essenceBackgroundOpacity += (essenceTargetOpacity - essenceBackgroundOpacity) * 0.055;
      if (essenceBackgroundGroup) {
        essenceBackgroundGroup.visible = essenceBackgroundOpacity > 0.01;
        essenceBackgroundGroup.rotation.z += 0.0018;
        essenceBackgroundGroup.rotation.y = Math.sin(performance.now() * 0.00016) * 0.08;
        essenceBackgroundGroup.children.forEach((child, index) => {
          child.rotation.z += index % 2 === 0 ? 0.0009 : -0.00055;
        });
      }
      essenceMaterials.forEach((material) => {
        material.opacity = (material.userData.baseOpacity ?? 0.18) * essenceBackgroundOpacity;
        material.needsUpdate = true;
      });

      renderer.render(scene, camera);
      renderFrame = window.requestAnimationFrame(renderBottleLayer);
    };

    const finishLoading = () => {
      if (disposed) return;
      setLoaderProgress(100);
      window.setTimeout(() => {
        assetsReady = true;
        setStaticStep(0, true);
        requestScrollUpdate();
        setIsLoading(false);
      }, 220);
    };

    updateRootDataset(0);
    setStaticStep(0, true);
    setLoadPart("setup", 1);

    const firstVideoReady = prepareVideo(0, (progress) => setLoadPart("video", progress))
      .catch((error) => {
        console.warn("Saptambu first video preload failed", error);
        setLoadPart("video", 1);
      });

    const bottleReady = initBottleLayer((progress) => setLoadPart("bottle", progress))
      .then(() => {
        setLoadPart("bottle", 1);
      })
      .catch((error) => {
        console.warn("Saptambu bottle load failed", error);
        if (!disposed) {
          setBottleLoadError("The bottle model could not load. Check your connection and retry.");
        }
        throw error;
      });

    void Promise.all([firstVideoReady, bottleReady]).then(finishLoading).catch(() => undefined);

    window.addEventListener("resize", onResize);
    if (enableCustomCursor) {
      window.addEventListener("mousemove", moveCursor);
      cursorFrame = window.requestAnimationFrame(tickCursor);
    }
    window.addEventListener("scroll", requestScrollUpdate, { passive: true });

    renderFrame = window.requestAnimationFrame(renderBottleLayer);

    return () => {
      disposed = true;
      bottleTween?.kill();
      dracoLoader.dispose();
      renderer?.dispose();
      gsap.killTweensOf([progressBar, track, canvas, ...getTextNodes()]);
      videoTweens.forEach((tween) => tween.kill());
      window.cancelAnimationFrame(cursorFrame);
      window.cancelAnimationFrame(renderFrame);
      window.cancelAnimationFrame(scrollFrame);
      window.clearTimeout(transitionTimer);
      if (enableCustomCursor) window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", requestScrollUpdate);
      videoNodes.forEach((video) => video.pause());
    };
  }, [loadAttempt]);

  return (
    <section
      ref={rootRef}
      className="relative cursor-none bg-[#050609] text-[#f4ead7]"
      data-active-step="1"
      style={{ ...rootStyle, minHeight: `${SCROLL_STAGE_HEIGHT_SVH}svh` }}
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden bg-black">
        <div ref={trackRef} className="absolute inset-0 h-full w-full" data-video-track>
          <div className="absolute inset-0 h-full w-full overflow-hidden bg-black" data-video-panel style={{ opacity: 1, zIndex: 2 }}>
            <video
              ref={(node) => {
                videoRefs.current[0] = node;
              }}
              aria-label="Saptambu sacred waters film"
              className="h-full w-full object-cover transition-[filter] duration-700 ease-out [filter:brightness(var(--video-brightness))_contrast(var(--video-contrast))_saturate(var(--video-saturation))_hue-rotate(var(--video-hue))]"
              disablePictureInPicture
              muted
              playsInline
              poster={homeFilm.poster}
              preload="auto"
            >
              <source media="(max-width: 767px)" src={homeFilm.mobile} type="video/mp4" />
              <source media="(min-width: 768px)" src={homeFilm.desktop} type="video/mp4" />
              <source media="(max-width: 767px)" src={homeFilmFallback.mobile} type="video/mp4" />
              <source src={homeFilmFallback.desktop} type="video/mp4" />
            </video>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_82%_76%_at_54%_48%,transparent_18%,rgba(5,6,9,0.68)_100%)]" />
        <div className="pointer-events-none absolute inset-0 z-10 bg-[var(--scene-overlay-color)] opacity-[var(--scene-overlay-opacity)] mix-blend-soft-light transition-[background-color,opacity] duration-700" />
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-[48vw] bg-gradient-to-r from-[#050609]/72 via-[#050609]/30 to-transparent opacity-[var(--left-gradient-opacity)] transition-opacity duration-700" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-[48vw] bg-gradient-to-l from-[#050609]/72 via-[#050609]/30 to-transparent opacity-[var(--right-gradient-opacity)] transition-opacity duration-700" />
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[20vh] bg-gradient-to-b from-[#050609]/88 via-[#050609]/24 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[24vh] bg-gradient-to-t from-[#050609]/88 via-[#050609]/28 to-transparent" />
        <div className="pointer-events-none absolute inset-0 z-10 opacity-[0.022] mix-blend-overlay [background-image:url('data:image/svg+xml,%3Csvg_xmlns=%22http://www.w3.org/2000/svg%22_width=%22300%22_height=%22300%22%3E%3Cfilter_id=%22n%22%3E%3CfeTurbulence_type=%22fractalNoise%22_baseFrequency=%220.85%22_numOctaves=%224%22_stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect_width=%22300%22_height=%22300%22_filter=%22url(%23n)%22/%3E%3C/svg%3E')] [background-size:200px_200px]" />

        <canvas ref={bottleCanvasRef} className="pointer-events-none absolute inset-0 z-20 h-full w-full opacity-0" data-bottle-canvas />

        <Link
          aria-label="Skip to Products"
          href="/collections/all"
          onClick={(event) => {
            if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
              return;
            }
            event.preventDefault();
            window.location.assign("/collections/all");
          }}
          className="focus-ring pointer-events-auto absolute right-4 top-[calc(5vh+0.8rem)] z-[75] max-w-[calc(100vw-2rem)] whitespace-normal rounded-full border border-[#d2a85c]/45 bg-black/32 px-3.5 py-2 text-center font-mono text-[0.58rem] uppercase leading-snug tracking-[0.14em] text-[#f4ead7]/86 backdrop-blur-md transition hover:border-[#d2a85c] hover:bg-[#d2a85c] hover:text-black sm:right-6 sm:tracking-[0.22em] md:right-8"
        >
          Skip to Products
        </Link>

        {stepTimeline.map((chapter, index) => (
          <div
            className={getTextPanelClass(chapter.layout)}
            data-step-panel
            data-step-title={chapter.title}
            data-step-video="1"
            key={chapter.eyebrow}
            ref={(node) => {
              textRefs.current[index] = node;
            }}
            style={{
              display: index === 0 ? undefined : "none",
              opacity: index === 0 ? 1 : 0,
              transform: `translate(0px, -50%) scale(${index === 0 ? 1 : 0.992})`,
            }}
          >
            {chapter.layout === "split" ? (
              <>
                <div>
                  <div className="max-w-full whitespace-normal break-words font-mono text-[0.55rem] uppercase leading-relaxed tracking-[0.18em] text-[#d2a85c]/78 sm:text-[0.62rem] sm:tracking-[0.46em]">
                    {chapter.phase}
                  </div>
                  <h2 className="mx-auto mt-3 max-w-[18rem] text-balance break-words font-serif text-[clamp(1.65rem,9vw,3rem)] font-light leading-[1.02] tracking-[0.012em] text-[#f4ead7] sm:mt-4 sm:max-w-[27rem] sm:text-[clamp(2.05rem,5vw,4.8rem)] sm:leading-[0.92] md:mx-0">
                    {chapter.title}
                  </h2>
                </div>
                <p className="mx-auto max-w-[18rem] self-center justify-self-center break-words text-center font-serif text-[clamp(0.82rem,3.8vw,1.05rem)] italic leading-relaxed tracking-[0.015em] text-[#f4ead7]/70 sm:max-w-[24rem] sm:text-[clamp(0.96rem,4.8vw,1.28rem)] sm:tracking-[0.075em] md:mx-0 md:justify-self-end md:text-right">
                  {chapter.body}
                </p>
              </>
            ) : (
              <>
                <div className="max-w-full whitespace-normal break-words font-mono text-[0.55rem] uppercase leading-relaxed tracking-[0.18em] text-[#d2a85c]/78 sm:text-[0.62rem] sm:tracking-[0.46em]">
                  {chapter.phase}
                </div>
                <h2 className="mt-3 max-w-[16rem] text-balance break-words font-serif text-[clamp(1.55rem,8vw,2.7rem)] font-light leading-[1.04] tracking-[0.012em] text-[#f4ead7] sm:mt-4 sm:max-w-[31rem] sm:text-[clamp(2.05rem,5.1vw,4.95rem)] sm:leading-[0.92]">
                  {chapter.title}
                </h2>
                <p className="mt-3 max-w-[16rem] break-words font-serif text-[clamp(0.82rem,3.8vw,1.04rem)] italic leading-relaxed tracking-[0.015em] text-[#f4ead7]/68 sm:mt-5 sm:max-w-[26rem] sm:text-[clamp(0.98rem,1.42vw,1.24rem)] sm:tracking-[0.075em]">
                  {chapter.body}
                </p>
              </>
            )}
          </div>
        ))}

        <Link
          href="/collections/all"
          className="essence-product-cta focus-ring pointer-events-none absolute left-1/2 top-[calc(50%+32vh)] z-[46] max-w-[calc(100vw-2rem)] -translate-x-1/2 translate-y-3 scale-95 overflow-hidden whitespace-normal rounded-full border border-[#ffe8ae]/70 bg-[linear-gradient(135deg,#fff0bf_0%,#e2b65d_42%,#a96624_100%)] px-5 py-3.5 text-center font-mono text-[0.58rem] font-bold uppercase leading-snug tracking-[0.16em] text-[#180e06] opacity-0 shadow-[0_0_24px_rgba(210,168,92,0.32),0_16px_42px_rgba(0,0,0,0.36)] backdrop-blur-md transition duration-500 hover:border-[#fff7d3] hover:shadow-[0_0_42px_rgba(240,215,156,0.52),0_18px_56px_rgba(0,0,0,0.42)] sm:px-8 sm:text-[0.64rem] sm:tracking-[0.3em] md:top-[calc(50%+34vh)]"
        >
          <span className="relative z-10 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[#fff8d2] shadow-[0_0_16px_rgba(255,248,210,0.95)]" />
            Explore Products
          </span>
        </Link>

        <div className="pointer-events-none absolute inset-x-0 top-0 z-[55] h-[5vh] bg-[#050609]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[55] h-[5vh] bg-[#050609]" />
        <div className="pointer-events-none absolute inset-x-3 bottom-[calc(5vh+0.8rem)] z-[57] h-px bg-[#d2a85c]/18">
          <div
            ref={progressRef}
            className="h-full origin-left scale-x-0 bg-[linear-gradient(90deg,#d2a85c,#f0d79c,transparent)]"
            data-sequence-progress
          />
        </div>

        <div className="pointer-events-none absolute bottom-[calc(5vh+1.45rem)] left-6 z-[57] grid h-10 w-10 place-items-center rounded-full border border-[#f4ead7]/18 bg-black/22 font-mono text-xs text-[#f4ead7]/86 shadow-[0_0_18px_rgba(0,0,0,0.45)]">
          N
        </div>

        <div
          ref={cursorDotRef}
          className="pointer-events-none fixed left-1/2 top-1/2 z-[80] hidden h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d2a85c] mix-blend-screen md:block"
        />
        <div
          ref={cursorRingRef}
          className="pointer-events-none fixed left-1/2 top-1/2 z-[79] hidden h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#d2a85c]/40 md:block"
        />

        <div
          aria-hidden={!isLoading}
          className={`absolute inset-0 z-[90] grid place-items-center bg-[#050609] transition-opacity duration-700 ${
            bottleLoadError ? "pointer-events-auto" : "pointer-events-none"
          }`}
          style={{ opacity: isLoading ? 1 : 0, visibility: isLoading ? "visible" : "hidden" }}
        >
          <div className="flex max-w-[min(28rem,calc(100vw-2rem))] flex-col items-center gap-8 text-center">
            <div className="font-serif text-2xl font-light uppercase tracking-[0.8em] text-[#d2a85c] md:text-4xl">Saptambu</div>
            <div className="h-px w-[min(320px,58vw)] overflow-hidden bg-[#d2a85c]/18">
              <div
                className="h-full origin-left bg-[linear-gradient(90deg,#d2a85c,#f0d79c)] transition-transform duration-300 ease-out"
                style={{ transform: `scaleX(${loaderProgress / 100})` }}
              />
            </div>
            {bottleLoadError ? (
              <div className="grid justify-items-center gap-4">
                <p className="max-w-xs text-sm leading-6 text-[#f4ead7]/72">{bottleLoadError}</p>
                <button
                  className="focus-ring rounded-full border border-[#d2a85c]/55 bg-[#d2a85c] px-6 py-3 font-mono text-[0.68rem] font-bold uppercase tracking-[0.28em] text-[#140d05] transition hover:bg-[#f0d79c]"
                  onClick={() => {
                    setIsLoading(true);
                    setLoaderProgress(0);
                    setBottleLoadError(null);
                    setLoadAttempt((attempt) => attempt + 1);
                  }}
                  type="button"
                >
                  Retry
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes saptambhu-loader {
          0%,
          100% {
            opacity: 0.18;
            transform: scaleX(0.45);
          }
          50% {
            opacity: 1;
            transform: scaleX(1);
          }
        }

        :global(section[data-active-step="11"] .essence-product-cta) {
          opacity: 1 !important;
          pointer-events: auto !important;
          transform: translate(-50%, 0) scale(1) !important;
          animation: saptambu-cta-breathe 3.2s ease-in-out infinite;
        }

        :global(section[data-active-step="11"] .essence-product-cta:hover) {
          transform: translate(-50%, -2px) scale(1.035) !important;
        }

        :global(.essence-product-cta::before) {
          content: "";
          position: absolute;
          inset: 1px;
          border-radius: inherit;
          background:
            linear-gradient(110deg, transparent 0%, rgba(255, 255, 255, 0) 28%, rgba(255, 255, 255, 0.46) 44%, rgba(255, 255, 255, 0) 58%, transparent 100%),
            radial-gradient(circle at 25% 18%, rgba(255, 255, 255, 0.42), transparent 30%);
          opacity: 0.78;
          transform: translateX(-115%);
        }

        :global(.essence-product-cta::after) {
          content: "";
          position: absolute;
          inset: -9px;
          z-index: -1;
          border-radius: inherit;
          background: radial-gradient(ellipse at center, rgba(240, 215, 156, 0.36), rgba(210, 168, 92, 0.1) 44%, transparent 70%);
          opacity: 0;
          transition: opacity 0.45s ease;
        }

        :global(section[data-active-step="11"] .essence-product-cta::before) {
          animation: saptambu-cta-sheen 3.85s ease-in-out infinite;
        }

        :global(section[data-active-step="11"] .essence-product-cta::after) {
          opacity: 1;
        }

        @keyframes saptambu-cta-sheen {
          0%,
          48% {
            transform: translateX(-115%);
          }
          70%,
          100% {
            transform: translateX(115%);
          }
        }

        @keyframes saptambu-cta-breathe {
          0%,
          100% {
            box-shadow:
              0 0 24px rgba(210, 168, 92, 0.32),
              0 16px 42px rgba(0, 0, 0, 0.36);
          }
          50% {
            box-shadow:
              0 0 38px rgba(240, 215, 156, 0.48),
              0 18px 54px rgba(0, 0, 0, 0.42);
          }
        }

        @media (max-width: 768px) {
          section {
            cursor: auto;
          }
        }
      `}</style>
    </section>
  );
}
