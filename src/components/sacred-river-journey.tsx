"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Droplets, Sparkles } from "lucide-react";

const chapters = [
  {
    image: "/sacred-rivers/01.jpeg",
    label: "Origin",
    title: "Mountain water, held in silence",
    text: "A cinematic expression of sacred source, cold mist, and first light.",
  },
  {
    image: "/sacred-rivers/02.jpeg",
    label: "Ghats",
    title: "Prayer beside the water",
    text: "Temple steps, lamp glow, and ritual presence inform the devotional tone.",
  },
  {
    image: "/sacred-rivers/04.jpeg",
    label: "Within",
    title: "An inner river world",
    text: "Underwater architecture inspires the bottle's inside-water scroll moment.",
  },
  {
    image: "/sacred-rivers/05.jpeg",
    label: "Force",
    title: "Falls, mist, and renewal",
    text: "Foam and motion become the luminous stream language inside Saptambu.",
  },
  {
    image: "/sacred-rivers/08.jpeg",
    label: "Temple Island",
    title: "Sacred land surrounded by flow",
    text: "A giftable ritual object should feel placed, blessed, and deliberate.",
  },
  {
    image: "/sacred-rivers/09.jpeg",
    label: "Confluence",
    title: "Seven streams, one essence",
    text: "The product story resolves into a unified devotional water presentation.",
  },
  {
    image: "/sacred-rivers/11.jpeg",
    label: "Offering",
    title: "Luxury with reverence",
    text: "Gold, water, temple geometry, and restraint create the premium mood.",
  },
];

export function SacredRiverJourney() {
  const rootRef = useRef<HTMLElement | null>(null);
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoaded(true), 850);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const revealItems = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("opacity-100", "translate-y-0");
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.16 },
    );
    revealItems.forEach((item) => observer.observe(item));

    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;
    let frame = 0;

    const updatePointer = (event: PointerEvent) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      const nx = event.clientX / Math.max(window.innerWidth, 1) - 0.5;
      const ny = event.clientY / Math.max(window.innerHeight, 1) - 0.5;
      root.style.setProperty("--mx", String(nx));
      root.style.setProperty("--my", String(ny));
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      }
    };

    const animate = () => {
      frame = window.requestAnimationFrame(animate);
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      }

      const rect = root.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, -rect.top / Math.max(rect.height - window.innerHeight, 1)));
      root.style.setProperty("--scroll", String(progress));
    };

    window.addEventListener("pointermove", updatePointer);
    frame = window.requestAnimationFrame(animate);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", updatePointer);
    };
  }, []);

  return (
    <section
      ref={rootRef}
      className="sacred-cinema relative isolate cursor-none overflow-hidden bg-[#04060e] text-[#f0e8d8] [--mx:0] [--my:0] [--scroll:0]"
    >
      <div
        className={[
          "pointer-events-none fixed inset-0 z-[80] grid place-items-center bg-[#04060e] transition duration-700",
          loaded ? "invisible opacity-0" : "visible opacity-100",
        ].join(" ")}
        aria-hidden="true"
      >
        <div className="text-center">
          <div className="font-serif text-sm uppercase tracking-[0.55em] text-[#c8a057]">Saptambu</div>
          <div className="mt-5 h-px w-56 overflow-hidden bg-[#c8a057]/20">
            <div
              className="h-full w-1/2 bg-[linear-gradient(90deg,transparent,#c8a057,transparent)]"
              style={{ animation: "saptambu-loader 1.2s ease-in-out infinite" }}
            />
          </div>
          <div className="mt-4 text-[10px] uppercase tracking-[0.4em] text-white/35">Seven sacred waters</div>
        </div>
      </div>

      <div
        ref={cursorRef}
        className="pointer-events-none fixed left-0 top-0 z-[90] hidden h-3 w-3 rounded-full bg-[#c8a057] mix-blend-screen md:block"
        aria-hidden="true"
      />
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[89] hidden h-11 w-11 rounded-full border border-[#c8a057]/45 md:block"
        aria-hidden="true"
      />

      <div
        className="pointer-events-none fixed inset-0 z-[1] opacity-[0.035] mix-blend-screen"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="absolute inset-x-0 top-0 z-0 h-72 bg-[linear-gradient(180deg,#070505,rgba(4,6,14,0))]" />
      <div className="pointer-events-none absolute left-[-6vw] top-20 z-0 font-serif text-[22vw] leading-none text-[#c8a057]/[0.035]">
        VII
      </div>
      <div className="pointer-events-none absolute bottom-[18%] right-[-7vw] z-0 font-serif text-[20vw] leading-none text-white/[0.025]">
        जल
      </div>

      <div className="relative z-10 border-y border-[#c8a057]/10 px-4 py-20 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[0.85fr_1.15fr] md:items-center">
          <div
            data-reveal
            className="translate-y-10 opacity-0 transition duration-1000 ease-out"
            style={{ transitionDelay: "80ms" }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.45em] text-[#c8a057]">The origin story</p>
            <h2 className="mt-5 max-w-xl font-serif text-5xl font-light leading-[0.95] text-[#fff8e8] md:text-7xl">
              Seven sacred waters, composed into one ritual object.
            </h2>
            <p className="mt-7 max-w-lg text-lg leading-8 text-[#d8ccb8]/70">
              Saptambu is presented like an exclusive devotional water: cinematic, giftable, and reverent, with motion
              inspired by rivers, mist, temple light, and confluence.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/collections/all"
                className="inline-flex h-12 items-center gap-2 rounded-md bg-[#c8a057] px-5 text-sm font-semibold text-[#080807] shadow-[0_18px_55px_rgba(200,160,87,0.24)]"
              >
                Shop Saptambu <ArrowRight size={17} />
              </Link>
              <Link
                href="/pages/contact"
                className="inline-flex h-12 items-center rounded-md border border-white/15 bg-white/5 px-5 text-sm font-semibold text-white backdrop-blur"
              >
                Gift enquiry
              </Link>
            </div>
          </div>

          <div
            data-reveal
            className="relative min-h-[420px] translate-y-10 opacity-0 transition duration-1000 ease-out md:min-h-[560px]"
            style={{ transitionDelay: "180ms" }}
          >
            {["/sacred-rivers/01.jpeg", "/sacred-rivers/02.jpeg", "/sacred-rivers/04.jpeg"].map((image, index) => (
              <div
                key={image}
                className="absolute overflow-hidden rounded-md border border-[#c8a057]/15 shadow-[0_28px_90px_rgba(0,0,0,0.45)]"
                style={{
                  inset:
                    index === 0
                      ? "0 8% 14% 0"
                      : index === 1
                        ? "22% 0 0 24%"
                        : "46% 34% 2% 5%",
                  transform: `translate3d(calc(var(--mx) * ${-18 * (index + 1)}px), calc(var(--my) * ${
                    -12 * (index + 1)
                  }px + var(--scroll) * ${index * 22}px), 0)`,
                }}
              >
                <Image src={image} alt="" fill sizes="(min-width: 768px) 46vw, 92vw" className="object-cover" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,6,14,0.08),rgba(4,6,14,0.58))]" />
              </div>
            ))}
            <div className="absolute left-[10%] top-[10%] h-44 w-44 rounded-full bg-[#e07c20]/15 blur-3xl" />
            <div className="absolute bottom-[8%] right-[8%] flex items-center gap-3 border border-[#c8a057]/25 bg-[#04060e]/55 px-4 py-3 text-xs uppercase tracking-[0.32em] text-[#c8a057] backdrop-blur-md">
              <Droplets size={16} />
              Seven streams
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 px-4 py-20 md:px-8 md:py-28">
        <div className="mx-auto mb-14 flex max-w-6xl items-end gap-5">
          <span className="text-xs font-semibold uppercase tracking-[0.5em] text-[#c8a057]">Sacred sequence</span>
          <span className="h-px flex-1 bg-[#c8a057]/15" />
          <span className="font-serif text-sm text-white/30">01 - 07</span>
        </div>

        <div className="mx-auto grid max-w-6xl gap-4">
          {chapters.map((chapter, index) => (
            <article
              key={chapter.title}
              data-reveal
              className="group relative min-h-[260px] translate-y-10 overflow-hidden rounded-md border border-[#c8a057]/10 opacity-0 transition duration-1000 ease-out md:min-h-[300px]"
              style={{ transitionDelay: `${(index % 3) * 90}ms` }}
            >
              <Image src={chapter.image} alt="" fill sizes="100vw" className="object-cover transition duration-700 group-hover:scale-[1.035]" />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,6,14,0.9)_0%,rgba(4,6,14,0.62)_42%,rgba(4,6,14,0.12)_100%)]" />
              <div
                className="absolute inset-0 opacity-50"
                style={{
                  transform: `translate3d(calc(var(--mx) * ${-10 * ((index % 4) + 1)}px), calc(var(--my) * ${
                    -8 * ((index % 4) + 1)
                  }px), 0)`,
                  background:
                    "radial-gradient(circle at 24% 45%, rgba(200,160,87,0.22), transparent 32%), radial-gradient(circle at 80% 35%, rgba(100,210,220,0.14), transparent 28%)",
                }}
              />
              <div className="relative z-10 grid min-h-[260px] items-center gap-5 p-6 md:grid-cols-[120px_1fr_0.8fr] md:p-10">
                <div className="font-serif text-5xl font-light text-[#c8a057]/55 md:text-7xl">0{index + 1}</div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.42em] text-[#c8a057]">{chapter.label}</p>
                  <h3 className="mt-3 max-w-2xl font-serif text-4xl font-light leading-none text-[#fff8e8] md:text-6xl">
                    {chapter.title}
                  </h3>
                </div>
                <p className="max-w-md text-base leading-7 text-[#efe1cb]/65 md:justify-self-end">{chapter.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="relative z-10 h-[460px] overflow-hidden md:h-[560px]">
        <Image src="/sacred-rivers/10.jpeg" alt="" fill sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,6,14,0.15),rgba(4,6,14,0.84))]" />
        <div
          className="absolute inset-0"
          style={{
            transform: "translate3d(calc(var(--mx) * -22px), calc(var(--my) * -16px), 0) scale(1.04)",
            background:
              "radial-gradient(circle at 52% 34%, rgba(224,124,32,0.25), transparent 30%), linear-gradient(90deg, rgba(4,6,14,0.3), transparent)",
          }}
        />
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
          <Sparkles className="mb-5 text-[#c8a057]" size={26} />
          <p className="font-serif text-4xl font-light italic leading-tight text-[#fff8e8] md:text-6xl">
            Water, light, and devotion, sealed in one exclusive offering.
          </p>
          <Link
            href="/collections/all"
            className="mt-9 inline-flex h-12 items-center gap-2 rounded-md bg-[#c8a057] px-6 text-sm font-semibold text-[#080807]"
          >
            Explore products <ArrowRight size={17} />
          </Link>
        </div>
      </div>

    </section>
  );
}
