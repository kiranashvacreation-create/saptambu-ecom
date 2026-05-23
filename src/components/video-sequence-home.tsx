"use client";

import Link from "next/link";
import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

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
  anchor: number;
  body: string;
  bottleSide: BottleSide;
  eyebrow: string;
  grade: Grade;
  layout: ChapterLayout;
  light: LightProfile;
  phase: string;
  title: string;
  videoIndex: number;
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

const videos = [
  {
    label: "Origin, Ganga, Yamuna",
    src: "/videos/home-sequence/upscaled/saptambhu-scene-02.mp4",
  },
  {
    label: "Saraswati, Narmada, Godavari",
    src: "/videos/home-sequence/upscaled/saptambhu-scene-01.mp4",
  },
  {
    label: "Krishna, Kaveri, Confluence",
    src: "/videos/home-sequence/upscaled/saptambhu-scene-04.mp4",
  },
  {
    label: "Journey, Essence",
    src: "/videos/home-sequence/upscaled/saptambhu-scene-03.mp4",
  },
];

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
    anchor: 0,
    body: "Where Himalayan ice becomes the first sacred current.",
    bottleSide: "right",
    eyebrow: "01",
    grade: grades.coolOrigin,
    layout: "left",
    light: lights.coolOrigin,
    phase: "Origin",
    title: "The Origin",
    videoIndex: 0,
  },
  {
    anchor: 2.66,
    body: "Golden ghats, prayer, and a river held as mother.",
    bottleSide: "left",
    eyebrow: "02",
    grade: grades.templeGold,
    layout: "right",
    light: lights.templeGold,
    phase: "First Four Rivers",
    title: "Ganga",
    videoIndex: 0,
  },
  {
    anchor: 5.33,
    body: "Mist, reflection, and heritage moving softly at dawn.",
    bottleSide: "left",
    eyebrow: "03",
    grade: grades.templeGold,
    layout: "right",
    light: lights.templeGold,
    phase: "First Four Rivers",
    title: "Yamuna",
    videoIndex: 0,
  },
  {
    anchor: 0,
    body: "The hidden river, remembered beneath stone and water.",
    bottleSide: "left",
    eyebrow: "04",
    grade: grades.underwater,
    layout: "right",
    light: lights.underwater,
    phase: "First Four Rivers",
    title: "Saraswati",
    videoIndex: 1,
  },
  {
    anchor: 2.66,
    body: "A canyon river shaped by rock, fall, and sunset mist.",
    bottleSide: "left",
    eyebrow: "05",
    grade: grades.templeGold,
    layout: "right",
    light: lights.templeGold,
    phase: "First Four Rivers",
    title: "Narmada",
    videoIndex: 1,
  },
  {
    anchor: 5.33,
    body: "A life-giving southern current across fertile sacred land.",
    bottleSide: "right",
    eyebrow: "06",
    grade: grades.templeGold,
    layout: "left",
    light: lights.templeGold,
    phase: "Next Three Rivers",
    title: "Godavari",
    videoIndex: 1,
  },
  {
    anchor: 0,
    body: "Temple light and wide water under a burning sky.",
    bottleSide: "right",
    eyebrow: "07",
    grade: grades.amberGreen,
    layout: "left",
    light: lights.amberGreen,
    phase: "Next Three Rivers",
    title: "Krishna",
    videoIndex: 2,
  },
  {
    anchor: 2.66,
    body: "Islands, bridges, and green river devotion in quiet flow.",
    bottleSide: "right",
    eyebrow: "08",
    grade: grades.amberGreen,
    layout: "left",
    light: lights.amberGreen,
    phase: "Next Three Rivers",
    title: "Kaveri",
    videoIndex: 2,
  },
  {
    anchor: 7.9,
    body: "Many currents becoming one vast sacred meeting.",
    bottleSide: "left",
    eyebrow: "09",
    grade: grades.deepGold,
    layout: "right",
    light: lights.deepGold,
    phase: "Confluence And Essence",
    title: "The Confluence",
    videoIndex: 2,
  },
  {
    anchor: 0,
    body: "A river crossing mountains, plains, memory, and time.",
    bottleSide: "right",
    eyebrow: "10",
    grade: grades.deepGold,
    layout: "left",
    light: lights.deepGold,
    phase: "Confluence And Essence",
    title: "The Journey",
    videoIndex: 3,
  },
  {
    anchor: 7.9,
    body: "The offering distilled into Saptambu.",
    bottleSide: "center",
    eyebrow: "11",
    grade: grades.deepGold,
    layout: "split",
    light: lights.deepGold,
    phase: "Confluence And Essence",
    title: "The Essence",
    videoIndex: 3,
  },
];

const VIDEO_START_TIME = 0.001;
const SEEK_EPSILON_SECONDS = 1 / 30;
const LABEL_FRONT_Y = 0;
const MIN_SAME_VIDEO_TRANSITION_SECONDS = 1.7;
const MAX_SAME_VIDEO_TRANSITION_SECONDS = 3.8;
const CROSS_TRANSITION_SECONDS = 1.42;
const BOTTLE_MODEL_SRC = "/models/saptambu-bottle.glb";

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

function getSafeVideoTime(video: HTMLVideoElement, anchor: number) {
  if (!video.duration || Number.isNaN(video.duration)) return Math.max(anchor, VIDEO_START_TIME);
  const end = Math.max(video.duration - 0.045, VIDEO_START_TIME);
  return clamp(anchor <= 0 ? VIDEO_START_TIME : anchor, VIDEO_START_TIME, end);
}

function setVideoTime(video: HTMLVideoElement, anchor: number, force = false) {
  const nextTime = getSafeVideoTime(video, anchor);
  if (force || Math.abs(video.currentTime - nextTime) >= SEEK_EPSILON_SECONDS) {
    video.currentTime = nextTime;
  }
}

function getTextPanelClass(layout: ChapterLayout) {
  const base = "pointer-events-none absolute z-40 will-change-transform";

  if (layout === "right") {
    return `${base} right-[clamp(1.4rem,7vw,7rem)] top-1/2 w-[min(33rem,calc(100vw-2.8rem))] text-right md:w-[min(33rem,38vw)]`;
  }

  if (layout === "split") {
    return `${base} inset-x-[clamp(1.4rem,6vw,6rem)] top-1/2 grid gap-8 text-left md:grid-cols-[minmax(0,0.84fr)_minmax(0,0.68fr)] md:items-center`;
  }

  return `${base} left-[clamp(1.4rem,7vw,7rem)] top-1/2 w-[min(33rem,calc(100vw-2.8rem))] text-left md:w-[min(33rem,38vw)]`;
}

function getBottlePoseForStep(step: StepBeat): BottlePose {
  const mobile = typeof window !== "undefined" && window.innerWidth < 768;
  const sideX = step.bottleSide === "left" ? -0.92 : step.bottleSide === "center" ? 0 : 0.92;
  const mobileX = step.bottleSide === "left" ? -0.34 : step.bottleSide === "center" ? 0 : 0.34;

  if (step.eyebrow === "01") {
    return {
      opacity: 0.9,
      rotationX: mobile ? 0.01 : -0.01,
      rotationY: LABEL_FRONT_Y + (mobile ? 0.01 : 0.028),
      rotationZ: -0.045,
      scale: mobile ? 0.44 : 0.62,
      x: mobile ? mobileX : sideX,
      y: mobile ? -0.14 : -0.08,
      z: mobile ? -0.84 : -0.34,
    };
  }

  if (step.eyebrow === "11") {
    return {
      opacity: 1,
      rotationX: mobile ? 0.01 : -0.015,
      rotationY: LABEL_FRONT_Y - 0.015,
      rotationZ: -0.08,
      scale: mobile ? 0.58 : 0.95,
      x: 0,
      y: mobile ? -0.06 : -0.04,
      z: mobile ? -0.7 : 0.08,
    };
  }

  return {
    opacity: step.eyebrow === "09" ? 0.94 : 0.88,
    rotationX: mobile ? 0.005 : -0.012,
    rotationY: LABEL_FRONT_Y + (step.bottleSide === "left" ? -0.04 : 0.04),
    rotationZ: step.bottleSide === "left" ? 0.04 : -0.05,
    scale: mobile ? 0.43 : step.eyebrow === "09" ? 0.72 : 0.68,
    x: mobile ? mobileX : sideX,
    y: mobile ? -0.13 : -0.12,
    z: mobile ? -0.78 : -0.12,
  };
}

function progressForStep(stepIndex: number) {
  return stepIndex / (stepTimeline.length - 1);
}

export function VideoSequenceHome() {
  const [isLoading, setIsLoading] = useState(true);
  const [loaderProgress, setLoaderProgress] = useState(0);
  const rootRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);
  const transitionBarRef = useRef<HTMLDivElement | null>(null);
  const transitionVeilRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const bottleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const cursorDotRef = useRef<HTMLDivElement | null>(null);
  const cursorRingRef = useRef<HTMLDivElement | null>(null);
  const loaderMarks = useMemo(() => Array.from({ length: 7 }, (_, index) => index), []);

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    const transitionBar = transitionBarRef.current;
    const transitionVeil = transitionVeilRef.current;
    const progressBar = progressRef.current;
    const canvas = bottleCanvasRef.current;
    if (!root || !track || !transitionBar || !transitionVeil || !progressBar || !canvas) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    window.scrollTo(0, 0);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
    let inputLockUntil = 0;
    let isTransitioning = false;
    let keyLight: THREE.DirectionalLight | null = null;
    let renderFrame = 0;
    let renderer: THREE.WebGLRenderer | null = null;
    let rimLight: THREE.DirectionalLight | null = null;
    let transitionTimer = 0;
    let wipeCoverTimer = 0;
    let wipeResetTimer = 0;
    const videoTweens = new Map<HTMLVideoElement, gsap.core.Tween>();
    const readyVideoIndexes = new Set<number>();
    const videoReadyPromises = new Map<number, Promise<void>>();

    const setLoadProgress = (value: number) => {
      setLoaderProgress((current) => Math.max(current, clamp(value, 0, 100)));
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

    const getTextNodes = () => Array.from(root.querySelectorAll<HTMLDivElement>("[data-step-panel]"));
    const getVideoPanels = () => Array.from(root.querySelectorAll<HTMLDivElement>("[data-video-panel]"));

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
      root.dataset.activeVideo = String(stepTimeline[stepIndex].videoIndex + 1);
    };

    const updateProgress = (stepIndex: number, duration = prefersReducedMotion ? 0 : 0.55) => {
      gsap.to(progressBar, {
        duration,
        ease: "power2.out",
        overwrite: true,
        scaleX: progressForStep(stepIndex),
      });
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

    const setTargetPose = (step: StepBeat) => {
      Object.assign(targetPose, getBottlePoseForStep(step));
    };

    const commitBottlePose = (step: StepBeat) => {
      Object.assign(targetPose, getBottlePoseForStep(step));
      Object.assign(bottlePose, targetPose);
      if (bottleGroup) {
        bottleGroup.visible = true;
        bottleGroup.position.set(bottlePose.x, bottlePose.y, bottlePose.z);
        bottleGroup.rotation.set(bottlePose.rotationX, bottlePose.rotationY, bottlePose.rotationZ);
        bottleGroup.scale.setScalar(bottlePose.scale);
        setBottleOpacity(bottlePose.opacity);
      }
      canvas.style.opacity = String(bottlePose.opacity);
    };

    const showStepText = (stepIndex: number, immediate = false) => {
      getTextNodes().forEach((element, index) => {
        const isActive = index === stepIndex;
        const step = stepTimeline[index];
        const isRight = step.layout === "right";
        const x = isActive ? 0 : isRight ? 12 : -12;
        const y = "-50%";
        const scale = isActive ? 1 : 0.992;

        if (isActive) {
          element.style.removeProperty("display");
        } else {
          element.style.setProperty("display", "none", "important");
        }
        element.style.setProperty("opacity", isActive ? "1" : "0", "important");
        element.style.transition = immediate ? "none" : "opacity 520ms cubic-bezier(0.22,1,0.36,1), transform 520ms cubic-bezier(0.22,1,0.36,1)";
        element.style.setProperty("transform", `translate(${x}px, ${y}) scale(${scale})`, "important");
      });
    };

    const showVideoPanel = (videoIndex: number) => {
      getVideoPanels().forEach((panel, index) => {
        panel.style.opacity = index === videoIndex ? "1" : "0";
        panel.style.zIndex = index === videoIndex ? "2" : "0";
      });
    };

    const scrubVideoTo = (video: HTMLVideoElement, anchor: number, duration: number, delay = 0) => {
      videoTweens.get(video)?.kill();
      const state = { time: video.currentTime || VIDEO_START_TIME };
      const tween = gsap.to(state, {
        delay,
        duration: prefersReducedMotion ? 0 : duration,
        ease: "none",
        onComplete: () => {
          setVideoTime(video, anchor, true);
          videoTweens.delete(video);
        },
        onUpdate: () => setVideoTime(video, state.time, true),
        overwrite: true,
        time: getSafeVideoTime(video, anchor),
      });
      videoTweens.set(video, tween);
    };

    const setStaticStep = (stepIndex: number, immediate = false) => {
      const step = stepTimeline[stepIndex];
      activeStep = stepIndex;
      updateRootDataset(stepIndex);
      updateProgress(stepIndex, immediate ? 0 : 0.55);
      applyMood(step);
      setTargetPose(step);
      if (immediate) commitBottlePose(step);
      showStepText(stepIndex, immediate);
      showVideoPanel(step.videoIndex);
      videoNodes.forEach((video, index) => {
        if (index === step.videoIndex) {
          setVideoTime(video, step.anchor, true);
        } else {
          const firstStepForVideo = stepTimeline.find((item) => item.videoIndex === index);
          setVideoTime(video, firstStepForVideo?.anchor ?? 0, true);
        }
      });
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

    const animateSeparator = (onCovered?: () => void | Promise<void>) => {
      window.clearTimeout(wipeCoverTimer);
      window.clearTimeout(wipeResetTimer);
      transitionVeil.style.animation = "none";
      transitionBar.style.animation = "none";
      transitionBar.style.transition = "none";
      transitionVeil.style.transition = "none";
      transitionBar.style.width = "1px";
      transitionBar.style.opacity = "0.74";
      transitionBar.style.boxShadow = "0 0 42px rgba(210,168,92,0.42)";
      transitionVeil.style.opacity = "0";
      void transitionVeil.offsetWidth;
      transitionBar.style.transition = "opacity 520ms ease, box-shadow 520ms ease";
      transitionVeil.style.transition = "opacity 360ms cubic-bezier(0.22, 1, 0.36, 1)";
      transitionBar.style.opacity = "0.96";
      transitionBar.style.boxShadow = "0 0 58px rgba(210,168,92,0.5)";
      transitionVeil.style.opacity = "0.2";

      wipeCoverTimer = window.setTimeout(() => {
        if (disposed) return;
        Promise.resolve(onCovered?.()).finally(() => {
          if (disposed) return;
          transitionVeil.style.transition = "opacity 740ms cubic-bezier(0.22, 1, 0.36, 1)";
          transitionBar.style.transition = "opacity 740ms ease, box-shadow 740ms ease";
          transitionVeil.style.opacity = "0";
          transitionBar.style.opacity = "0.38";
          transitionBar.style.boxShadow = "0 0 42px rgba(210,168,92,0.42)";
          wipeResetTimer = window.setTimeout(() => {
            if (disposed) return;
            transitionVeil.style.transition = "none";
            transitionBar.style.transition = "none";
          }, 780);
        });
      }, 120);
    };

    const goToStep = (nextStepIndex: number) => {
      if (disposed || isTransitioning || !assetsReady) return;
      const clampedIndex = clamp(nextStepIndex, 0, stepTimeline.length - 1);
      if (clampedIndex === activeStep) return;

      const now = Date.now();
      if (now < inputLockUntil) return;

      const previousStepIndex = activeStep;
      const previousStep = stepTimeline[previousStepIndex];
      const nextStep = stepTimeline[clampedIndex];
      const sameVideo = previousStep.videoIndex === nextStep.videoIndex;
      const currentVideo = videoNodes[previousStep.videoIndex];
      const incomingVideo = videoNodes[nextStep.videoIndex];
      const videoTravel = Math.abs(nextStep.anchor - previousStep.anchor);
      const duration = sameVideo
        ? clamp(videoTravel / 1.08, MIN_SAME_VIDEO_TRANSITION_SECONDS, MAX_SAME_VIDEO_TRANSITION_SECONDS)
        : CROSS_TRANSITION_SECONDS;

      isTransitioning = true;
      inputLockUntil = now + duration * 1000 + 360;
      updateRootDataset(clampedIndex);
      updateProgress(clampedIndex, duration * 0.6);
      applyMood(nextStep);
      setTargetPose(nextStep);
      window.clearTimeout(transitionTimer);
      window.clearTimeout(wipeCoverTimer);
      window.clearTimeout(wipeResetTimer);

      const textNodes = getTextNodes();
      const videoPanels = getVideoPanels();
      gsap.killTweensOf(textNodes);

      if (sameVideo && currentVideo) {
        showStepText(clampedIndex, false);
        scrubVideoTo(currentVideo, nextStep.anchor, duration);
      } else {
        if (incomingVideo) setVideoTime(incomingVideo, nextStep.anchor, true);
        const previousPanel = videoPanels[previousStep.videoIndex];
        const nextPanel = videoPanels[nextStep.videoIndex];

        if (previousPanel) {
          gsap.killTweensOf(previousPanel);
          gsap.set(previousPanel, { opacity: 1, zIndex: 2 });
        }
        if (nextPanel) {
          gsap.killTweensOf(nextPanel);
          gsap.set(nextPanel, { opacity: 0, zIndex: 1 });
        }

        animateSeparator(async () => {
          await prepareVideo(nextStep.videoIndex);
          if (nextPanel) {
            gsap.to(nextPanel, {
              duration: prefersReducedMotion ? 0 : 0.95,
              ease: "power2.inOut",
              opacity: 1,
              overwrite: true,
              zIndex: 2,
            });
          }
          if (previousPanel) {
            gsap.to(previousPanel, {
              duration: prefersReducedMotion ? 0 : 0.95,
              ease: "power2.inOut",
              opacity: 0,
              overwrite: true,
              zIndex: 0,
            });
          }
          showStepText(clampedIndex, false);
        });
        if (prefersReducedMotion) {
          if (nextPanel) gsap.set(nextPanel, { opacity: 1, zIndex: 2 });
          if (previousPanel) gsap.set(previousPanel, { opacity: 0, zIndex: 0 });
          showStepText(clampedIndex, true);
        }
        gsap.to(track, {
          duration: 0,
          overwrite: true,
          x: 0,
        });
      }

      transitionTimer = window.setTimeout(() => {
        activeStep = clampedIndex;
        if (incomingVideo) setVideoTime(incomingVideo, nextStep.anchor, true);
        showVideoPanel(nextStep.videoIndex);
        commitBottlePose(nextStep);
        showStepText(clampedIndex, false);
        isTransitioning = false;
      }, duration * 1000 + 140);
    };

    const advance = (direction: 1 | -1) => {
      goToStep(activeStep + direction);
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      if (Math.abs(event.deltaY) < 12) return;
      advance(event.deltaY > 0 ? 1 : -1);
    };

    let touchStartY = 0;
    const onTouchStart = (event: TouchEvent) => {
      touchStartY = event.touches[0]?.clientY ?? 0;
    };

    const onTouchEnd = (event: TouchEvent) => {
      const endY = event.changedTouches[0]?.clientY ?? touchStartY;
      const delta = touchStartY - endY;
      if (Math.abs(delta) < 34) return;
      advance(delta > 0 ? 1 : -1);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const forwardKeys = ["ArrowDown", "PageDown", " "];
      const backwardKeys = ["ArrowUp", "PageUp"];
      if (forwardKeys.includes(event.key)) {
        event.preventDefault();
        advance(1);
      } else if (backwardKeys.includes(event.key)) {
        event.preventDefault();
        advance(-1);
      }
    };

    const onResize = () => {
      if (!renderer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 768 ? 1 : 1.16));
      setTargetPose(stepTimeline[activeStep]);
    };

    const prepareVideo = (index: number, progressValue?: number) => {
      const video = videoNodes[index];
      if (!video) return Promise.resolve();
      if (readyVideoIndexes.has(index)) return Promise.resolve();
      const existing = videoReadyPromises.get(index);
      if (existing) return existing;

      const promise = new Promise<void>((resolve) => {
        let resolved = false;
        const ready = () => {
          if (resolved) return;
          resolved = true;
          readyVideoIndexes.add(index);
          video.pause();
          video.muted = true;
          video.playsInline = true;
          const firstStepForVideo = stepTimeline.find((step) => step.videoIndex === index);
          setVideoTime(video, firstStepForVideo?.anchor ?? 0, true);
          if (progressValue) setLoadProgress(progressValue);
          resolve();
        };

        if (video.readyState >= 2 && video.duration) {
          ready();
          return;
        }

        video.addEventListener("loadeddata", ready, { once: true });
        video.addEventListener("canplay", ready, { once: true });
        video.load();
        window.setTimeout(ready, index === 0 ? 3200 : 5200);
      });

      videoReadyPromises.set(index, promise);
      return promise;
    };

    const initBottleLayer = async () => {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, canvas });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 768 ? 1 : 1.16));
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

      setLoadProgress(58);

      void new GLTFLoader().loadAsync(BOTTLE_MODEL_SRC).then((gltf) => {
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
        commitBottlePose(stepTimeline[activeStep]);
        setLoadProgress(82);
      }).catch((error) => {
        console.warn("Saptambu bottle failed to load; continuing with video journey.", error);
        setLoadProgress(82);
      });
    };

    const renderBottleLayer = () => {
      if (disposed) return;
      if (!renderer) {
        renderFrame = window.requestAnimationFrame(renderBottleLayer);
        return;
      }

      smoothMouse.x += (mouse.x - smoothMouse.x) * 0.045;
      smoothMouse.y += (mouse.y - smoothMouse.y) * 0.045;

      bottlePose.opacity += (targetPose.opacity - bottlePose.opacity) * 0.08;
      bottlePose.rotationX += (targetPose.rotationX - smoothMouse.y * 0.025 - bottlePose.rotationX) * 0.06;
      bottlePose.rotationY += (targetPose.rotationY + smoothMouse.x * 0.035 - bottlePose.rotationY) * 0.055;
      bottlePose.rotationZ += (targetPose.rotationZ - bottlePose.rotationZ) * 0.06;
      bottlePose.scale += (targetPose.scale - bottlePose.scale) * 0.07;
      bottlePose.x += (targetPose.x - bottlePose.x) * 0.06;
      bottlePose.y += (targetPose.y - bottlePose.y) * 0.06;
      bottlePose.z += (targetPose.z - bottlePose.z) * 0.06;

      if (bottleGroup) {
        bottleGroup.position.set(bottlePose.x, bottlePose.y, bottlePose.z);
        bottleGroup.rotation.set(bottlePose.rotationX, bottlePose.rotationY, bottlePose.rotationZ);
        bottleGroup.scale.setScalar(bottlePose.scale);
        setBottleOpacity(clamp(bottlePose.opacity, 0, 1));
      }
      canvas.style.opacity = String(clamp(bottlePose.opacity, 0, 1));

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
      window.setTimeout(() => {
        assetsReady = true;
        setStaticStep(0, true);
        setIsLoading(false);
      }, 220);
    };

    updateRootDataset(0);
    setStaticStep(0, true);
    setLoadProgress(10);
    void Promise.all([prepareVideo(0, 44), initBottleLayer().then(() => setLoadProgress(68))])
      .then(() => {
        setLoadProgress(100);
        finishLoading();
        void Promise.all(videoNodes.slice(1).map((_, index) => prepareVideo(index + 1, 86 + index * 4)));
      })
      .catch((error) => {
        console.warn("Saptambu homepage asset load failed", error);
        setLoadProgress(100);
        finishLoading();
      });

    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("keydown", onKeyDown);

    cursorFrame = window.requestAnimationFrame(tickCursor);
    renderFrame = window.requestAnimationFrame(renderBottleLayer);

    return () => {
      disposed = true;
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      renderer?.dispose();
      gsap.killTweensOf([progressBar, track, transitionBar, transitionVeil, canvas, ...getTextNodes()]);
      videoTweens.forEach((tween) => tween.kill());
      window.cancelAnimationFrame(cursorFrame);
      window.cancelAnimationFrame(renderFrame);
      window.clearTimeout(transitionTimer);
      window.clearTimeout(wipeCoverTimer);
      window.clearTimeout(wipeResetTimer);
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKeyDown);
      videoNodes.forEach((video) => video.pause());
    };
  }, []);

  return (
    <section
      ref={rootRef}
      className="relative h-screen cursor-none overflow-hidden bg-[#050609] text-[#f4ead7]"
      data-active-step="1"
      style={rootStyle}
    >
      <div className="relative h-screen overflow-hidden bg-black">
        <div ref={trackRef} className="absolute inset-0 h-full w-full">
          {videos.map((video, index) => (
            <div
              className="absolute inset-0 h-full w-full overflow-hidden bg-black"
              data-video-panel
              key={video.src}
              style={{ opacity: index === 0 ? 1 : 0, zIndex: index === 0 ? 2 : 0 }}
            >
              <video
                ref={(node) => {
                  videoRefs.current[index] = node;
                }}
                aria-label={`Saptambu sacred waters scene - ${video.label}`}
                className="h-full w-full object-cover transition-[filter] duration-700 ease-out [filter:brightness(var(--video-brightness))_contrast(var(--video-contrast))_saturate(var(--video-saturation))_hue-rotate(var(--video-hue))]"
                muted
                playsInline
                preload="auto"
                src={video.src}
              />
            </div>
          ))}
        </div>

        <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_82%_76%_at_54%_48%,transparent_18%,rgba(5,6,9,0.68)_100%)]" />
        <div className="pointer-events-none absolute inset-0 z-10 bg-[var(--scene-overlay-color)] opacity-[var(--scene-overlay-opacity)] mix-blend-soft-light transition-[background-color,opacity] duration-700" />
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-[48vw] bg-gradient-to-r from-[#050609]/72 via-[#050609]/30 to-transparent opacity-[var(--left-gradient-opacity)] transition-opacity duration-700" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-[48vw] bg-gradient-to-l from-[#050609]/72 via-[#050609]/30 to-transparent opacity-[var(--right-gradient-opacity)] transition-opacity duration-700" />
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[20vh] bg-gradient-to-b from-[#050609]/88 via-[#050609]/24 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[24vh] bg-gradient-to-t from-[#050609]/88 via-[#050609]/28 to-transparent" />
        <div className="pointer-events-none absolute inset-0 z-10 opacity-[0.022] mix-blend-overlay [background-image:url('data:image/svg+xml,%3Csvg_xmlns=%22http://www.w3.org/2000/svg%22_width=%22300%22_height=%22300%22%3E%3Cfilter_id=%22n%22%3E%3CfeTurbulence_type=%22fractalNoise%22_baseFrequency=%220.85%22_numOctaves=%224%22_stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect_width=%22300%22_height=%22300%22_filter=%22url(%23n)%22/%3E%3C/svg%3E')] [background-size:200px_200px]" />

        <canvas ref={bottleCanvasRef} className="pointer-events-none fixed inset-0 z-20 h-full w-full opacity-0" />

        <Link
          href="/collections/all"
          className="focus-ring absolute right-6 top-[calc(5vh+1rem)] z-[58] rounded-full border border-[#d2a85c]/45 bg-black/32 px-4 py-2 font-mono text-[0.62rem] uppercase tracking-[0.22em] text-[#f4ead7]/86 backdrop-blur-md transition hover:border-[#d2a85c] hover:bg-[#d2a85c] hover:text-black md:right-8"
        >
          Skip to Products
        </Link>

        {stepTimeline.map((chapter, index) => (
          <div
            className={getTextPanelClass(chapter.layout)}
            data-step-panel
            data-step-title={chapter.title}
            data-step-video={chapter.videoIndex + 1}
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
                  <div className="font-mono text-[0.58rem] uppercase tracking-[0.46em] text-[#d2a85c]/78 sm:text-[0.62rem]">
                    {chapter.eyebrow} — {chapter.phase}
                  </div>
                  <h2 className="mt-4 max-w-[27rem] text-balance font-serif text-[clamp(2.05rem,5vw,4.8rem)] font-light leading-[0.92] tracking-[0.012em] text-[#f4ead7]">
                    {chapter.title}
                  </h2>
                </div>
                <p className="max-w-[24rem] self-center justify-self-end text-right font-serif text-[clamp(1rem,1.45vw,1.28rem)] italic leading-relaxed tracking-[0.075em] text-[#f4ead7]/70">
                  {chapter.body}
                </p>
              </>
            ) : (
              <>
                <div className="font-mono text-[0.58rem] uppercase tracking-[0.46em] text-[#d2a85c]/78 sm:text-[0.62rem]">
                  {chapter.eyebrow} — {chapter.phase}
                </div>
                <h2 className="mt-4 max-w-[31rem] text-balance font-serif text-[clamp(2.05rem,5.1vw,4.95rem)] font-light leading-[0.92] tracking-[0.012em] text-[#f4ead7]">
                  {chapter.title}
                </h2>
                <p className="mt-5 max-w-[26rem] font-serif text-[clamp(0.98rem,1.42vw,1.24rem)] italic leading-relaxed tracking-[0.075em] text-[#f4ead7]/68">
                  {chapter.body}
                </p>
              </>
            )}
          </div>
        ))}

        <div
          ref={transitionVeilRef}
          className="pointer-events-none absolute inset-0 z-[49] opacity-0"
          style={{
            background:
              "radial-gradient(ellipse 72% 70% at 50% 50%, rgba(20,14,7,0.78), rgba(5,6,9,0.96) 68%, rgba(5,6,9,1)), linear-gradient(90deg, rgba(210,168,92,0.1), transparent 22%, transparent 78%, rgba(210,168,92,0.1))",
          }}
        />
        <div
          ref={transitionBarRef}
          className="pointer-events-none absolute left-1/2 top-0 z-[51] h-full w-px origin-center -translate-x-1/2 scale-x-100 bg-[#d2a85c]/78 opacity-40 shadow-[0_0_42px_rgba(210,168,92,0.42)]"
        />

        <div className="pointer-events-none absolute inset-x-0 top-0 z-[55] h-[5vh] bg-[#050609]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[55] h-[5vh] bg-[#050609]" />
        <div className="pointer-events-none absolute inset-3 z-[56] border border-[#f4ead7]/34" />
        <div className="pointer-events-none absolute inset-x-3 bottom-[calc(5vh+0.8rem)] z-[57] h-px bg-[#d2a85c]/18">
          <div ref={progressRef} className="h-full origin-left scale-x-0 bg-[linear-gradient(90deg,#d2a85c,#f0d79c,transparent)]" />
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
          className="pointer-events-none absolute inset-0 z-[90] grid place-items-center bg-[#050609] transition-opacity duration-700"
          style={{ opacity: isLoading ? 1 : 0, visibility: isLoading ? "visible" : "hidden" }}
        >
          <div className="flex flex-col items-center gap-8">
            <div className="font-serif text-2xl font-light uppercase tracking-[0.8em] text-[#d2a85c] md:text-4xl">Saptambu</div>
            <div className="flex gap-3">
              {loaderMarks.map((mark) => (
                <span
                  className="h-px w-9 animate-[saptambhu-loader_1.5s_ease-in-out_infinite] bg-[#d2a85c]/70"
                  key={mark}
                  style={{ animationDelay: `${mark * 0.09}s` }}
                />
              ))}
            </div>
            <div className="h-px w-[min(320px,58vw)] overflow-hidden bg-[#d2a85c]/18">
              <div
                className="h-full origin-left bg-[linear-gradient(90deg,#d2a85c,#f0d79c)] transition-transform duration-300 ease-out"
                style={{ transform: `scaleX(${loaderProgress / 100})` }}
              />
            </div>
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

        :global(.saptambhu-wipe-active) {
          animation: saptambhu-soft-wipe 1.28s cubic-bezier(0.22, 1, 0.36, 1) both;
          background: linear-gradient(
            90deg,
            rgba(210, 168, 92, 0.52),
            rgba(5, 6, 9, 0.98) 9%,
            rgba(5, 6, 9, 0.98) 91%,
            rgba(210, 168, 92, 0.52)
          ) !important;
          transform: translateX(-50%) !important;
        }

        :global(.saptambhu-veil-active) {
          animation: saptambhu-soft-veil 1.28s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        @keyframes saptambhu-soft-wipe {
          0% {
            opacity: 0.98;
            width: 1px;
          }
          34%,
          46% {
            opacity: 0.98;
            width: 145vw;
          }
          86% {
            opacity: 0.86;
            width: 1px;
          }
          100% {
            opacity: 0.38;
            width: 1px;
          }
        }

        @keyframes saptambhu-soft-veil {
          0% {
            opacity: 0;
          }
          34%,
          46% {
            opacity: 0.72;
          }
          86% {
            opacity: 0.12;
          }
          100% {
            opacity: 0;
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
