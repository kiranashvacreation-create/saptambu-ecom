"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Mail, Newspaper, Sparkles } from "lucide-react";
import Link from "next/link";
import type { MediaCoverageItem } from "@/lib/media-coverage";
import { site } from "@/lib/site";

const ease = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

function MediaLogo({ item, index }: { item: MediaCoverageItem; index: number }) {
  return (
    <div className="relative grid aspect-[1.08] min-h-48 place-items-center overflow-hidden rounded-[1.25rem] border border-[#ead8b8]/70 bg-[#fff7e7]/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_22%,rgba(255,241,196,0.95),transparent_34%),linear-gradient(135deg,rgba(154,47,34,0.12),rgba(28,109,98,0.12))]" />
      <motion.div
        aria-hidden="true"
        className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#c58a2b]/20 blur-2xl"
        animate={{ scale: [1, 1.14, 1], opacity: [0.42, 0.7, 0.42] }}
        transition={{ duration: 4 + index * 0.4, repeat: Infinity, ease: "easeInOut" }}
      />
      {item.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.imageUrl} alt={item.imageAlt} className="relative z-10 max-h-28 max-w-[72%] rounded-xl object-contain drop-shadow-sm" />
      ) : (
        <div className="relative z-10 grid h-24 w-24 place-items-center rounded-full border border-[#c58a2b]/30 bg-white/70 text-[#9b2f22]">
          <Newspaper size={34} strokeWidth={1.5} />
        </div>
      )}
      <span className="absolute bottom-4 left-4 rounded-full border border-[#c58a2b]/25 bg-white/65 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[#8b6534] backdrop-blur">
        {item.publishedLabel}
      </span>
    </div>
  );
}

function MediaCard({ item, index }: { item: MediaCoverageItem; index: number }) {
  const cta = (
    <span className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#1c6d62]">
      Read Full Article
      <span className="grid h-8 w-8 place-items-center rounded-full border border-[#1c6d62]/20 bg-[#1c6d62]/8 transition group-hover/card:translate-x-0.5 group-hover/card:bg-[#1c6d62] group-hover/card:text-white">
        <ArrowUpRight size={15} />
      </span>
    </span>
  );

  const content = (
    <div className="group/card relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-[#ead8b8] bg-white/76 p-3 shadow-[0_24px_70px_rgba(57,34,18,0.08)] backdrop-blur-xl transition hover:-translate-y-1.5 hover:border-[#d9bb83] hover:shadow-[0_30px_80px_rgba(57,34,18,0.13)]">
      <div className="absolute inset-0 opacity-0 transition duration-500 group-hover/card:opacity-100">
        <div className="absolute -right-24 top-10 h-52 w-52 rounded-full bg-[#c58a2b]/18 blur-3xl" />
        <div className="absolute -bottom-20 left-12 h-44 w-44 rounded-full bg-[#1c6d62]/12 blur-3xl" />
      </div>
      <MediaLogo item={item} index={index} />
      <div className="relative flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-3 text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-[#9b2f22]">
          <span>{String(index + 1).padStart(2, "0")}</span>
          <span className="h-px w-8 bg-[#c58a2b]/60" />
          <span>{item.sourceName}</span>
        </div>
        <h2 className="mt-4 text-balance text-2xl font-semibold leading-tight text-[#201712]">
          {item.headline}
        </h2>
        <p className="mt-4 line-clamp-4 text-sm leading-7 text-[#66584a]">{item.excerpt}</p>
        <div className="mt-auto">{cta}</div>
      </div>
    </div>
  );

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, ease, delay: index * 0.05 }}
      className="h-full"
    >
      {item.isExternal ? (
        <a href={item.href} target="_blank" rel="noopener noreferrer" className="block h-full">
          {content}
        </a>
      ) : (
        <Link href={item.href} className="block h-full">
          {content}
        </Link>
      )}
    </motion.div>
  );
}

export function MediaCoverageShowcase({ items }: { items: MediaCoverageItem[] }) {
  const reduceMotion = useReducedMotion();
  const featured = items[0];

  return (
    <div className="relative isolate overflow-hidden bg-[#fbfaf6] text-[#1f1812]">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_10%,rgba(197,138,43,0.22),transparent_30%),radial-gradient(circle_at_88%_6%,rgba(28,109,98,0.16),transparent_28%),linear-gradient(180deg,#fffaf0_0%,#fbfaf6_42%,#f2eadb_100%)]" />
      <motion.div
        aria-hidden="true"
        className="absolute left-[8%] top-32 -z-10 h-80 w-80 rounded-full bg-[#9b2f22]/10 blur-3xl"
        animate={reduceMotion ? undefined : { y: [0, 28, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden="true"
        className="absolute right-[6%] top-[42rem] -z-10 h-96 w-96 rounded-full bg-[#1c6d62]/10 blur-3xl"
        animate={reduceMotion ? undefined : { y: [0, -34, 0], scale: [1, 1.12, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <section className="container-page relative grid min-h-[72vh] items-center gap-12 py-20 sm:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:py-28">
        <motion.div initial="hidden" animate="visible" variants={stagger}>
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.7, ease }}
            className="inline-flex items-center gap-2 rounded-full border border-[#c58a2b]/30 bg-white/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#8b6534] shadow-sm backdrop-blur"
          >
            <Sparkles size={14} />
            Press archive
          </motion.div>
          <motion.h1
            variants={fadeUp}
            transition={{ duration: 0.8, ease }}
            className="mt-7 max-w-4xl text-balance text-5xl font-semibold leading-[0.95] tracking-[-0.04em] text-[#1c1510] sm:text-6xl lg:text-7xl"
          >
            Media Coverage for <span className="text-[#9b2f22]">Saptambu</span>
          </motion.h1>
          <motion.p variants={fadeUp} transition={{ duration: 0.8, ease }} className="mt-7 max-w-2xl text-lg leading-8 text-[#5f5144]">
            A curated press room for stories on Saptambu, India&apos;s sacred blend of seven holy rivers, and the devotional
            vision behind Kiranashva Creation.
          </motion.p>
          <motion.div variants={fadeUp} transition={{ duration: 0.8, ease }} className="mt-8 flex flex-wrap gap-3">
            <a
              href="#coverage"
              onClick={(event) => {
                event.preventDefault();
                document.getElementById("coverage")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="focus-ring rounded-full bg-[#1f1812] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(31,24,18,0.16)] hover:-translate-y-0.5"
            >
              Explore Features
            </a>
            <a
              href={`mailto:${site.email}`}
              className="focus-ring rounded-full border border-[#d9c8aa] bg-white/70 px-5 py-3 text-sm font-semibold text-[#1f1812] backdrop-blur hover:-translate-y-0.5"
            >
              Contact Press
            </a>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 36, rotate: -1.5 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: 0.9, ease, delay: 0.2 }}
          className="relative mx-auto w-full max-w-md"
        >
          <div className="absolute -inset-6 rounded-[2.25rem] bg-[#c58a2b]/20 blur-3xl" />
          <div className="relative overflow-hidden rounded-[2rem] border border-[#ead8b8] bg-white/68 p-4 shadow-[0_30px_90px_rgba(77,47,24,0.14)] backdrop-blur-xl">
            {featured ? <MediaLogo item={featured} index={0} /> : null}
            <div className="mt-4 rounded-[1.25rem] border border-white/70 bg-[#17110e] p-6 text-[#fff8e7]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#dfb45f]">Featured in</p>
              <p className="mt-3 text-3xl font-semibold">{items.length}+ media stories</p>
              <p className="mt-3 text-sm leading-6 text-[#dfd1bd]">
                Recognition across national, digital, and devotional news platforms.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      <section id="coverage" className="container-page pb-20 sm:pb-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="mb-10 grid gap-5 lg:grid-cols-[0.72fr_1fr]"
        >
          <motion.p variants={fadeUp} transition={{ duration: 0.7, ease }} className="text-xs font-semibold uppercase tracking-[0.28em] text-[#9b2f22]">
            Sacred waters in the news
          </motion.p>
          <motion.p variants={fadeUp} transition={{ duration: 0.7, ease }} className="max-w-3xl text-balance text-2xl font-semibold leading-tight text-[#241a14] sm:text-3xl">
            Press features, founder stories, and cultural coverage presented as a polished archive rather than a basic list.
          </motion.p>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item, index) => (
            <MediaCard key={item.id} item={item} index={index} />
          ))}
        </div>
      </section>

      <section className="container-page pb-20 sm:pb-28">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-90px" }}
          transition={{ duration: 0.8, ease }}
          className="relative overflow-hidden rounded-[2rem] border border-[#2a211b] bg-[#17110e] p-7 text-[#fff8e7] shadow-[0_30px_90px_rgba(31,24,18,0.18)] sm:p-9 lg:grid lg:grid-cols-[1fr_auto] lg:items-center lg:gap-10"
        >
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#c58a2b]/20 blur-3xl" />
          <div className="absolute -bottom-24 left-24 h-56 w-56 rounded-full bg-[#1c6d62]/20 blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.26em] text-[#dfb45f]">
              <Mail size={15} />
              Press desk
            </div>
            <h2 className="mt-5 max-w-2xl text-balance text-3xl font-semibold leading-tight sm:text-4xl">
              Receive updates, press notes, and media assets from Kiranashva Creation.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#decfbb]">
              For interviews, product photography, founder notes, and collaboration requests, write directly to our team.
            </p>
          </div>
          <form
            action={`mailto:${site.email}`}
            className="relative mt-8 rounded-2xl border border-white/10 bg-white/8 p-3 backdrop-blur lg:mt-0 lg:min-w-96"
            encType="text/plain"
            method="post"
          >
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                required
                name="email"
                type="email"
                placeholder="your@email.com"
                className="h-12 flex-1 rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-[#fff8e7] outline-none"
                aria-label="Email address for media updates"
              />
              <button className="focus-ring inline-flex h-12 items-center justify-center rounded-xl bg-[#dfb45f] px-5 text-sm font-semibold text-[#17110e] hover:-translate-y-0.5 hover:bg-[#f0c979]">
                Request Updates
              </button>
            </div>
            <p className="mt-3 text-xs leading-5 text-[#cdbca4]">
              Prefer direct email? Write to <span className="font-semibold text-[#f0c979]">{site.email}</span>.
            </p>
          </form>
        </motion.div>
      </section>
    </div>
  );
}
