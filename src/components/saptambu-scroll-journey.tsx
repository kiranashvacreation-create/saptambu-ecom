"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Droplets, Sparkles } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { deliveryAssets, localMediaFallbacks } from "@/lib/cloudinary-assets";
import { createGltfLoader } from "@/lib/gltf-loader";

type BottlePose = {
  x: number;
  y: number;
  z: number;
  rx: number;
  ry: number;
  rz: number;
  scale: number;
};

const sacredWaters = [
  {
    name: "Ganga",
    origin: "Himalayan descent",
    copy: "A luminous beginning, held as the first note in the Saptambu blend.",
  },
  {
    name: "Yamuna",
    origin: "Devotion and grace",
    copy: "Soft, reflective, and ceremonial, bringing calm to the ritual object.",
  },
  {
    name: "Saraswati",
    origin: "The unseen river",
    copy: "A symbolic current of knowledge, memory, and sacred continuity.",
  },
  {
    name: "Narmada",
    origin: "Ancient stone",
    copy: "Deep, grounding, and mineral in feeling, like water passing through time.",
  },
  {
    name: "Godavari",
    origin: "Southern abundance",
    copy: "Generous and expansive, carrying the warmth of temple offerings.",
  },
  {
    name: "Sindhu",
    origin: "Civilization's river",
    copy: "A historic current, broad and enduring, giving the blend its scale.",
  },
  {
    name: "Kaveri",
    origin: "Sacred islands",
    copy: "The closing stream: fertile, devotional, and gift-worthy.",
  },
];

const DESKTOP_POSES: BottlePose[] = [
  { x: 1.18, y: -0.03, z: 0, rx: 0.018, ry: -0.055, rz: -0.09, scale: 2.5 },
  { x: 1.06, y: -0.04, z: 0, rx: 0.018, ry: 0.02, rz: -0.085, scale: 2.18 },
  { x: 1.15, y: -0.03, z: 0, rx: 0.01, ry: 0.01, rz: -0.075, scale: 2.3 },
  { x: -1.05, y: -0.06, z: 0, rx: 0.018, ry: -0.07, rz: -0.08, scale: 2.05 },
];

const MOBILE_POSES: BottlePose[] = [
  { x: 0.24, y: 0.53, z: 0, rx: 0.018, ry: -0.045, rz: -0.085, scale: 1.15 },
  { x: 0.28, y: 0.47, z: 0, rx: 0.018, ry: 0.018, rz: -0.08, scale: 1.08 },
  { x: 0.24, y: 0.42, z: 0, rx: 0.01, ry: 0.012, rz: -0.075, scale: 1.12 },
  { x: -0.12, y: 0.3, z: 0, rx: 0.018, ry: -0.06, rz: -0.08, scale: 1.1 },
];

const LABEL_FRONT_Y = Math.PI * 2;
const SCROLL_DISTANCE = "+=950%";
const VIDEO_START_TIME = 0.001;
const VIDEO_END_MARGIN = 0.05;
const VIDEO_SEEK_EPSILON = 1 / 24;

function disposeObject(object: THREE.Object3D) {
  object.traverse((entry) => {
    if (!(entry instanceof THREE.Mesh)) return;
    entry.geometry.dispose();
    const materials = Array.isArray(entry.material) ? entry.material : [entry.material];
    materials.forEach((material) => {
      Object.values(material).forEach((value) => {
        if (value instanceof THREE.Texture) value.dispose();
      });
      material.dispose();
    });
  });
}

function enhanceBottleMaterials(object: THREE.Object3D) {
  object.traverse((entry) => {
    if (!(entry instanceof THREE.Mesh)) return;
    const materials = Array.isArray(entry.material) ? entry.material : [entry.material];
    const enhanced = materials.map((material) => {
      const next = material.clone();
      if ("vertexColors" in next) {
        next.vertexColors = Boolean(entry.geometry.getAttribute("color"));
      }
      if (next instanceof THREE.MeshStandardMaterial || next instanceof THREE.MeshPhysicalMaterial) {
        next.roughness = Math.min(Math.max(next.roughness, 0.28), 0.54);
        next.metalness = 0;
        next.envMapIntensity = 1.35;
        next.needsUpdate = true;
      }
      return next;
    });
    entry.material = Array.isArray(entry.material) ? enhanced : enhanced[0];
  });
}

function normalizeModel(object: THREE.Object3D) {
  const bounds = new THREE.Box3().setFromObject(object);
  const center = bounds.getCenter(new THREE.Vector3());
  const size = bounds.getSize(new THREE.Vector3());
  const maxDimension = Math.max(size.x, size.y, size.z) || 1;
  object.position.sub(center);
  object.scale.setScalar(1 / maxDimension);
}

function smoothRange(progress: number, start: number, end: number) {
  return THREE.MathUtils.smoothstep(THREE.MathUtils.clamp((progress - start) / (end - start), 0, 1), 0, 1);
}

function mixPose(a: BottlePose, b: BottlePose, amount: number): BottlePose {
  const t = THREE.MathUtils.clamp(amount, 0, 1);
  return {
    x: THREE.MathUtils.lerp(a.x, b.x, t),
    y: THREE.MathUtils.lerp(a.y, b.y, t),
    z: THREE.MathUtils.lerp(a.z, b.z, t),
    rx: THREE.MathUtils.lerp(a.rx, b.rx, t),
    ry: THREE.MathUtils.lerp(a.ry, b.ry, t),
    rz: THREE.MathUtils.lerp(a.rz, b.rz, t),
    scale: THREE.MathUtils.lerp(a.scale, b.scale, t),
  };
}

function dampPose(current: BottlePose, target: BottlePose, amount: number) {
  current.x = THREE.MathUtils.lerp(current.x, target.x, amount);
  current.y = THREE.MathUtils.lerp(current.y, target.y, amount);
  current.z = THREE.MathUtils.lerp(current.z, target.z, amount);
  current.rx = THREE.MathUtils.lerp(current.rx, target.rx, amount);
  current.ry = THREE.MathUtils.lerp(current.ry, target.ry, amount);
  current.rz = THREE.MathUtils.lerp(current.rz, target.rz, amount);
  current.scale = THREE.MathUtils.lerp(current.scale, target.scale, amount);
}

function getBottlePose(progress: number, isCompact: boolean) {
  const poses = isCompact ? MOBILE_POSES : DESKTOP_POSES;
  let pose = poses[0];
  pose = mixPose(pose, poses[1], smoothRange(progress, 0.12, 0.38));
  pose = mixPose(pose, poses[2], smoothRange(progress, 0.6, 0.78));
  pose = mixPose(pose, poses[3], smoothRange(progress, 0.84, 1));
  return pose;
}

function setPanel(node: HTMLElement | null, opacity: number, y: number) {
  if (!node) return;
  const nextOpacity = THREE.MathUtils.clamp(opacity, 0, 1);
  node.style.opacity = String(nextOpacity);
  node.style.transform = `translate3d(0, ${y}px, 0)`;
  node.style.pointerEvents = nextOpacity > 0.22 ? "auto" : "none";
}

function updatePanels(progress: number, refs: Array<HTMLElement | null>) {
  const [hero, stack, cinema, final] = refs;
  const heroOut = smoothRange(progress, 0.1, 0.22);
  const stackIn = smoothRange(progress, 0.14, 0.26);
  const stackOut = smoothRange(progress, 0.62, 0.73);
  const cinemaIn = smoothRange(progress, 0.66, 0.76);
  const cinemaOut = smoothRange(progress, 0.82, 0.9);
  const finalIn = smoothRange(progress, 0.86, 0.96);

  setPanel(hero, 1 - heroOut, -34 * heroOut);
  setPanel(stack, stackIn * (1 - stackOut), 34 * (1 - stackIn) - 36 * stackOut);
  setPanel(cinema, cinemaIn * (1 - cinemaOut), 30 * (1 - cinemaIn) - 34 * cinemaOut);
  setPanel(final, finalIn, 34 * (1 - finalIn));
}

function updateCards(progress: number, cards: Array<HTMLAnchorElement | null>) {
  const validCards = cards.filter((card): card is HTMLAnchorElement => Boolean(card));
  const active = THREE.MathUtils.clamp(((progress - 0.2) / 0.42) * (sacredWaters.length - 1), 0, sacredWaters.length - 1);

  validCards.forEach((card, index) => {
    const distance = index - active;
    const ahead = Math.max(distance, 0);
    const behind = Math.max(-distance, 0);
    const visible = distance < -0.55 ? Math.max(0, 0.55 - behind * 0.26) : Math.max(0, 1 - ahead * 0.22);
    const scale = 1.035 - ahead * 0.045 - behind * 0.035;
    const y = ahead * 19 - behind * 48;
    const blur = Math.min(2.2, ahead * 0.55 + behind * 0.9);

    card.style.opacity = String(visible);
    card.style.transform = `translate3d(0, ${y}px, 0) scale(${scale})`;
    card.style.filter = `blur(${blur}px)`;
    card.style.zIndex = String(100 - Math.round(Math.abs(distance) * 12));
    card.style.pointerEvents = Math.abs(distance) < 0.62 ? "auto" : "none";
  });
}

function seekVideo(video: HTMLVideoElement, progress: number) {
  if (!video.duration || Number.isNaN(video.duration)) return;
  const maxTime = Math.max(video.duration - VIDEO_END_MARGIN, VIDEO_START_TIME);
  const targetTime = THREE.MathUtils.clamp(progress * maxTime, VIDEO_START_TIME, maxTime);
  if (video.currentTime > 0 && Math.abs(video.currentTime - targetTime) < VIDEO_SEEK_EPSILON) return;
  try {
    video.currentTime = targetTime;
  } catch (error) {
    console.warn("Unable to scrub Saptambu background video", error);
  }
}

export function SaptambuScrollJourney() {
  const [isLoading, setIsLoading] = useState(true);
  const rootRef = useRef<HTMLElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const heroRef = useRef<HTMLDivElement | null>(null);
  const stackRef = useRef<HTMLDivElement | null>(null);
  const cinemaRef = useRef<HTMLDivElement | null>(null);
  const finalRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Array<HTMLAnchorElement | null>>([]);

  useEffect(() => {
    const root = rootRef.current;
    const pin = pinRef.current;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!root || !pin || !canvas || !video) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isCompact = window.innerWidth < 760;
    const initialPose = getBottlePose(0, isCompact);
    const renderPose: BottlePose = { ...initialPose };
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const progress = { target: 0, current: prefersReducedMotion ? 0.18 : 0 };

    let animationFrame = 0;
    let lenis: Lenis | null = null;
    let scrollTrigger: ScrollTrigger | null = null;
    let lenisTick: ((time: number) => void) | null = null;
    let disposed = false;
    let modelReady = false;
    let videoReady = video.readyState >= 2;
    let readyAnnounced = false;

    const markReady = () => {
      if (modelReady && videoReady && !disposed && !readyAnnounced) {
        readyAnnounced = true;
        window.setTimeout(() => setIsLoading(false), 220);
        ScrollTrigger.refresh();
      }
    };
    const loadingFallback = window.setTimeout(() => {
      videoReady = true;
      markReady();
    }, 7000);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      canvas,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(isCompact ? 38 : 34, 1, 0.1, 100);
    camera.position.set(0, 0.1, isCompact ? 6.25 : 6.9);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = environment;

    const product = new THREE.Group();
    scene.add(product);

    const keyLight = new THREE.DirectionalLight(0xfff0d1, 3.8);
    keyLight.position.set(3.8, 4.4, 4.8);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0xbfe8ff, 2.55);
    rimLight.position.set(-4.4, 2.6, 3.2);
    scene.add(rimLight);
    const amberLight = new THREE.PointLight(0xd0a052, 4.65, 8.5);
    amberLight.position.set(0.1, -0.35, 2.1);
    scene.add(amberLight);
    scene.add(new THREE.HemisphereLight(0xfff6e8, 0x130807, 1.15));

    const { dracoLoader, loader } = createGltfLoader();
    const loadBottleModel = (src: string, allowFallback: boolean) => {
      loader.load(
        src,
      (gltf) => {
        if (disposed) {
          disposeObject(gltf.scene);
          return;
        }
        const model = gltf.scene;
        normalizeModel(model);
        enhanceBottleMaterials(model);
        model.rotation.y = LABEL_FRONT_Y;
        product.add(model);
        modelReady = true;
        markReady();
      },
      undefined,
        (error) => {
        console.error("Unable to load Saptambu bottle model", error);
          if (allowFallback) {
            loadBottleModel(localMediaFallbacks.models.originalBottle, false);
            return;
          }
        modelReady = true;
        markReady();
      },
      );
    };

    loadBottleModel(deliveryAssets.models.originalBottle, true);

    const onVideoFrameReady = () => {
      videoReady = true;
      video.pause();
      seekVideo(video, prefersReducedMotion ? 0.18 : 0);
      markReady();
    };
    video.addEventListener("loadeddata", onVideoFrameReady);
    video.addEventListener("canplay", onVideoFrameReady);
    video.load();
    if (videoReady) onVideoFrameReady();

    const onPointerMove = (event: PointerEvent) => {
      const bounds = pin.getBoundingClientRect();
      pointer.tx = ((event.clientX - bounds.left) / Math.max(bounds.width, 1) - 0.5) * 2;
      pointer.ty = ((event.clientY - bounds.top) / Math.max(bounds.height, 1) - 0.5) * 2;
    };
    window.addEventListener("pointermove", onPointerMove);

    const resize = () => {
      const { width, height } = pin.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio, 1.45);
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(pin);
    window.addEventListener("resize", resize);
    resize();

    gsap.registerPlugin(ScrollTrigger);
    const panels = [heroRef.current, stackRef.current, cinemaRef.current, finalRef.current];
    updatePanels(progress.current, panels);
    updateCards(progress.current, cardRefs.current);

    if (!prefersReducedMotion) {
      lenis = new Lenis({ lerp: 0.055, smoothWheel: true, wheelMultiplier: 0.72 });
      lenis.on("scroll", ScrollTrigger.update);
      lenisTick = (time: number) => lenis?.raf(time * 1000);
      gsap.ticker.add(lenisTick);
      gsap.ticker.lagSmoothing(0);

      scrollTrigger = ScrollTrigger.create({
        end: SCROLL_DISTANCE,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          progress.target = self.progress;
        },
        pin,
        scrub: 1.65,
        start: "top top",
        trigger: root,
      });
      ScrollTrigger.refresh();
    } else {
      progress.target = 0.18;
      gsap.set(panels, { autoAlpha: 1, y: 0 });
      gsap.set(cardRefs.current.filter(Boolean), { autoAlpha: 1, filter: "blur(0px)", scale: 1, y: 0 });
    }

    const startedAt = performance.now();
    const animate = () => {
      const elapsed = (performance.now() - startedAt) / 1000;
      pointer.x += (pointer.tx - pointer.x) * 0.052;
      pointer.y += (pointer.ty - pointer.y) * 0.052;
      if (scrollTrigger && !prefersReducedMotion) {
        ScrollTrigger.update();
        progress.target = scrollTrigger.progress;
      }
      progress.current += (progress.target - progress.current) * 0.075;

      const targetPose = getBottlePose(progress.current, isCompact);
      dampPose(renderPose, targetPose, 0.085);

      product.position.set(renderPose.x, renderPose.y, renderPose.z);
      product.rotation.set(renderPose.rx + pointer.y * 0.028, renderPose.ry + pointer.x * 0.055, renderPose.rz);
      product.scale.setScalar(renderPose.scale);

      amberLight.intensity = 4.25 + Math.sin(elapsed * 0.8) * 0.25;
      keyLight.position.x = 3.8 + pointer.x * 0.32;
      rimLight.position.y = 2.6 + pointer.y * 0.24;

      if (!prefersReducedMotion) seekVideo(video, progress.current);
      updatePanels(progress.current, panels);
      updateCards(progress.current, cardRefs.current);
      renderer.render(scene, camera);
      animationFrame = window.requestAnimationFrame(animate);
    };
    animate();

    return () => {
      disposed = true;
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", resize);
      video.removeEventListener("loadeddata", onVideoFrameReady);
      video.removeEventListener("canplay", onVideoFrameReady);
      window.clearTimeout(loadingFallback);
      observer.disconnect();
      scrollTrigger?.kill();
      if (lenisTick) gsap.ticker.remove(lenisTick);
      lenis?.destroy();
      disposeObject(scene);
      dracoLoader.dispose();
      environment.dispose();
      pmrem.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <section ref={rootRef} className="relative isolate bg-[#050403] text-[#fff8e7] motion-reduce:min-h-screen">
      <div ref={pinRef} className="relative h-screen min-h-[690px] overflow-hidden motion-reduce:h-auto motion-reduce:min-h-screen">
        <video
          ref={videoRef}
          aria-hidden="true"
          className="absolute inset-0 z-0 h-full w-full object-cover"
          muted
          playsInline
          preload="auto"
        >
          <source media="(max-width: 767px)" src={deliveryAssets.videos.journey.fireflyMobile} type="video/mp4" />
          <source src={deliveryAssets.videos.journey.fireflyDesktop} type="video/mp4" />
        </video>
        <div className="absolute inset-0 z-[1] bg-[radial-gradient(circle_at_73%_42%,rgba(231,176,85,0.2),transparent_32%),linear-gradient(90deg,rgba(5,4,3,0.98)_0%,rgba(8,5,4,0.91)_34%,rgba(5,4,3,0.34)_60%,rgba(5,4,3,0.5)_100%)]" />
        <div className="absolute inset-0 z-[2] bg-[linear-gradient(to_bottom,rgba(5,4,3,0.9),transparent_24%,transparent_70%,rgba(5,4,3,0.9))]" />
        <canvas ref={canvasRef} className="absolute inset-0 z-10 h-full w-full" aria-hidden="true" />

        <div
          className={`pointer-events-none absolute inset-0 z-50 grid place-items-center bg-[#050403] transition-opacity duration-700 ${
            isLoading ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden={!isLoading}
        >
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.55em] text-[#d0a052]">Preparing Saptambu</p>
            <div className="mx-auto mt-6 h-px w-52 overflow-hidden bg-[#d0a052]/20">
              <div className="h-full w-1/2 animate-[pulse_1.4s_ease-in-out_infinite] bg-[#d0a052]" />
            </div>
          </div>
        </div>

        <div
          ref={heroRef}
          className="absolute inset-0 z-20 flex items-end px-5 pb-12 pt-28 motion-reduce:relative motion-reduce:inset-auto motion-reduce:py-16 sm:px-8 lg:items-center lg:px-14 lg:pb-0"
        >
          <div className="w-full max-w-[35rem]">
            <div className="inline-flex items-center gap-2 border border-[#d3aa65]/45 bg-black/25 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#f2d6a0] backdrop-blur">
              <Sparkles size={14} />
              Kiranashva Creation
            </div>
            <h1 className="mt-6 text-5xl font-semibold leading-[0.88] tracking-[-0.02em] sm:text-7xl lg:text-8xl xl:text-9xl">
              Saptambu
            </h1>
            <p className="mt-6 max-w-[21rem] text-lg leading-8 text-[#ead9c4] sm:max-w-xl sm:text-xl sm:leading-9">
              Exclusive devotional water, composed from seven sacred waters and presented as a luxury ritual object.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#shop"
                className="focus-ring inline-flex h-12 items-center gap-2 rounded-md bg-[#d0a052] px-5 font-semibold text-[#19120e] shadow-[0_16px_40px_rgba(208,160,82,0.28)]"
              >
                Shop products <ArrowRight size={18} />
              </a>
              <a
                href="#story"
                className="focus-ring inline-flex h-12 items-center rounded-md border border-white/20 bg-white/10 px-5 font-semibold text-white backdrop-blur"
              >
                Sacred waters
              </a>
            </div>
          </div>
        </div>

        <div
          ref={stackRef}
          className="absolute inset-0 z-20 flex items-end px-5 pb-10 pt-24 opacity-0 motion-reduce:relative motion-reduce:inset-auto motion-reduce:py-16 motion-reduce:opacity-100 sm:px-8 lg:items-center lg:px-14"
        >
          <div className="w-full max-w-[34rem]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.36em] text-[#d0a052]">Seven sacred waters</p>
            <h2 className="mt-4 text-3xl font-semibold leading-none tracking-[-0.01em] sm:text-5xl">
              A stacked ritual sequence.
            </h2>
            <div className="relative mt-6 h-[286px] sm:mt-7 sm:h-[330px]">
              {sacredWaters.map((water, index) => (
                <a
                  ref={(node) => {
                    cardRefs.current[index] = node;
                  }}
                  href="#shop"
                  key={water.name}
                  className="focus-ring absolute inset-x-0 top-0 min-h-[228px] rounded-lg border border-[#e5bf78]/24 bg-[#120b08]/78 p-5 shadow-[0_28px_80px_rgba(0,0,0,0.4)] backdrop-blur-md transition-colors hover:border-[#e5bf78]/50 sm:min-h-[260px] sm:p-6"
                >
                  <div className="flex items-start justify-between gap-5">
                    <span className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d0a052]">
                      0{index + 1}
                    </span>
                    <span className="rounded-full border border-white/15 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-[#f5dec0]">
                      Saptambu
                    </span>
                  </div>
                  <h3 className="mt-9 text-4xl font-semibold leading-none tracking-[-0.02em] sm:mt-12 sm:text-6xl">
                    {water.name}
                  </h3>
                  <p className="mt-3 text-sm font-semibold uppercase tracking-[0.24em] text-[#e3b96f]">{water.origin}</p>
                  <p className="mt-5 max-w-sm text-base leading-7 text-[#ead9c4]">{water.copy}</p>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div
          ref={cinemaRef}
          id="story"
          className="absolute inset-0 z-20 flex items-end px-5 pb-12 text-left opacity-0 motion-reduce:relative motion-reduce:inset-auto motion-reduce:py-16 motion-reduce:opacity-100 sm:px-8 lg:items-center lg:px-14 lg:pb-0"
        >
          <div className="max-w-[39rem]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.45em] text-[#d0a052]">A sacred blend</p>
            <h2 className="mt-5 text-4xl font-semibold leading-none tracking-[-0.02em] sm:text-6xl lg:text-7xl">
              Seven waters, one vessel.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#ead9c4]">
              The bottle remains the hero. The rivers move behind it like a scroll-bound film, while the product keeps
              its real Saptambu label facing the viewer.
            </p>
            <div className="mt-8 flex max-w-xl flex-wrap gap-2">
              {sacredWaters.map((water) => (
                <span
                  key={water.name}
                  className="border border-[#d0a052]/25 bg-black/25 px-3 py-2 text-xs uppercase tracking-[0.2em] text-[#f0d6a2] backdrop-blur"
                >
                  {water.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div
          ref={finalRef}
          className="absolute inset-0 z-20 flex items-end justify-end px-5 pb-10 pt-28 opacity-0 motion-reduce:relative motion-reduce:inset-auto motion-reduce:py-16 motion-reduce:opacity-100 sm:px-8 lg:px-14"
        >
          <div className="max-w-[34rem] rounded-lg border border-white/14 bg-black/45 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.42)] backdrop-blur-md">
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-[#d0a052]">
              <Droplets size={15} /> Giftable ritual water
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.01em] sm:text-4xl">
              Prepared for worship, gifting, and ceremonies.
            </h2>
            <p className="mt-4 text-[#ead9c4]">Continue into the catalog to browse ritual-ready devotional essentials.</p>
            <a
              href="#shop"
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-md bg-[#d0a052] px-4 font-semibold text-[#19120e]"
            >
              Enter shop <ArrowRight size={17} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
