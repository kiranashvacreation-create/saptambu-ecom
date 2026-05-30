import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import { StaticBottleStage } from "@/components/static-bottle-stage";
import { VideoSequenceHome } from "@/components/video-sequence-home";
import { deliveryAssets } from "@/lib/cloudinary-assets";

const homeCaptures = {
  altarLeft: "/home-captures/altar-left.webp",
  altarRight: "/home-captures/altar-right.webp",
  dailyPuja: "/home-captures/daily-puja.webp",
  founderPortrait: "/home-captures/founder-portrait-clean.webp",
  grihaPravesh: "/home-captures/griha-pravesh.webp",
  weddingRitual: "/home-captures/wedding-ritual.webp",
} as const;

const ritualUses = [
  {
    image: homeCaptures.dailyPuja,
    title: "Daily Puja",
    text: "Sanctify your prayers with sacred river water.",
  },
  {
    image: homeCaptures.grihaPravesh,
    title: "Griha Pravesh",
    text: "Bless your new home with divine energy.",
  },
  {
    image: homeCaptures.weddingRitual,
    title: "Wedding & Ritual",
    text: "Elevate ceremonies with India's holiest waters.",
  },
];

const founderParagraphs = [
  "Dr. Ashwini Shastri is a distinguished scholar of Hindi-Sanskrit and Ayurved, an accomplished author, and a seasoned media professional with decades of experience in journalism and public discourse.",
  "He served for 18 years with Navbharat Times, a leading national daily of the Times of India group, contributing significantly to narratives on society, culture, religion and governance.",
  "Earlier in his career, Dr. Shastri also served for over a decade as a Sanskrit News Reader-cum-Editor with All India Radio (AIR) and Doordarshan, where he played an important role in presenting and preserving Sanskrit in mainstream media.",
  "For more than 8 years, he has been writing a widely appreciated weekly spiritual column in a prominent publication of the Times of India group, offering insightful yet accessible perspectives on spirituality, traditions, and life philosophy.",
  "An author of several books in Hindi, Sanskrit, and English, Dr. Shastri possesses extensive knowledge of ancient Indian culture, Vedic philosophy, and the rich intellectual heritage of India.",
  "He has also mentored and trained numerous purohitas and students in Sanskrit grammar and Karmakand, actively contributing to the preservation and transmission of traditional knowledge systems.",
  "Dr. Shastri belongs to one of India's most eminent Sanskrit grammarian families, carrying forward a legacy of scholarly excellence and cultural depth.",
  "Deeply rooted in India's spiritual ethos, he has dedicated his life to bridging the gap between timeless traditions and contemporary living.",
  "Through Kiranashva Creation, he envisions presenting spirituality in a form that is refined, accessible, and relevant to modern lifestyles.",
  "The creation of Saptambu reflects this vision, an initiative to bring the sacred essence of India's seven revered rivers into every home, nurturing a deeper connection with faith, purity, and heritage.",
  "With a rare blend of intellectual depth, cultural sensitivity, and visionary leadership, Dr. Shastri continues to inspire meaningful initiatives that harmoniously connect tradition with modern life.",
];

export default function HomePage() {
  return (
    <div className="overflow-x-clip bg-[#fbf6ec] text-[#272017]">
      <link rel="preload" href={deliveryAssets.models.originalBottle} as="fetch" crossOrigin="anonymous" />

      <section className="relative isolate overflow-hidden bg-[#fbf6ec] pt-28">
        <div className="pointer-events-none absolute inset-x-0 top-16 h-px bg-[#e1d3bd]" />
        <Image
          src={homeCaptures.altarLeft}
          alt=""
          width={760}
          height={1261}
          fetchPriority="high"
          loading="eager"
          className="pointer-events-none absolute bottom-0 left-0 -z-10 hidden h-[78%] w-[22rem] object-cover opacity-18 mix-blend-multiply md:block"
        />
        <Image
          src={homeCaptures.altarRight}
          alt=""
          width={900}
          height={1177}
          fetchPriority="high"
          loading="eager"
          className="pointer-events-none absolute right-0 top-20 -z-10 h-[34rem] w-[21rem] object-cover opacity-20 mix-blend-multiply"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-36 bg-gradient-to-t from-[#fbf6ec] to-transparent" />

        <div className="container-page grid min-h-[calc(100svh-7rem)] items-center gap-10 pb-16 lg:grid-cols-[minmax(0,0.86fr)_minmax(20rem,0.74fr)] lg:pb-20">
          <div className="max-w-3xl">
            <p className="font-mono text-xs font-semibold uppercase text-[#b88424]">Kiranashva Creation</p>
            <h1 className="mt-5 max-w-[10ch] font-serif text-6xl font-light leading-[0.9] text-[#2d251c] sm:text-7xl lg:text-8xl">
              Saptambu
            </h1>
            <p className="mt-7 max-w-2xl font-serif text-2xl leading-snug text-[#5b4b3a] sm:text-3xl">
              Sacred waters of India&apos;s seven revered rivers, prepared for rituals, worship, ceremonies, and meaningful gifting.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/collections/all"
                className="focus-ring inline-flex min-h-12 items-center gap-2 rounded-full bg-[#c99324] px-6 py-3 text-sm font-semibold text-[#211408] shadow-[0_14px_34px_rgba(136,87,21,0.24)] hover:bg-[#d8a63a]"
              >
                Shop Now
                <ArrowRight size={17} />
              </Link>
              <Link
                href="#saptambu-film"
                className="focus-ring inline-flex min-h-12 items-center gap-2 rounded-full border border-[#bda98c] bg-[#fffaf0]/70 px-6 py-3 text-sm font-semibold text-[#3b2e20] backdrop-blur hover:border-[#c99324]"
              >
                River Journey
                <ArrowDown size={17} />
              </Link>
            </div>
            <div className="mt-12 grid max-w-xl grid-cols-3 divide-x divide-[#d8c5a8] border-y border-[#d8c5a8] py-5 text-center">
              <div className="px-3">
                <p className="font-serif text-2xl text-[#2d251c]">7</p>
                <p className="mt-1 text-xs font-medium uppercase text-[#7c6a56]">Rivers</p>
              </div>
              <div className="px-3">
                <p className="font-serif text-2xl text-[#2d251c]">1L</p>
                <p className="mt-1 text-xs font-medium uppercase text-[#7c6a56]">Bottle</p>
              </div>
              <div className="px-3">
                <p className="font-serif text-2xl text-[#2d251c]">Pure</p>
                <p className="mt-1 text-xs font-medium uppercase text-[#7c6a56]">Sacred</p>
              </div>
            </div>
          </div>

          <div className="relative pb-6">
            <div className="absolute -right-5 top-8 h-40 w-36 overflow-hidden rounded-lg border border-[#dbc6a4] bg-[#fff8eb] shadow-[0_18px_38px_rgba(73,47,21,0.12)] sm:h-52 sm:w-44">
              <Image src={homeCaptures.altarRight} alt="" fill sizes="176px" className="object-cover" />
            </div>
            <StaticBottleStage variant="hero" className="relative min-h-[31rem] bg-[#f9efe0]/92 sm:min-h-[37rem]" />
          </div>
        </div>
      </section>

      <section className="bg-[#fbf6ec] py-16 sm:py-20">
        <div className="container-page">
          <div className="flex flex-col justify-between gap-5 border-t border-[#ddcfb8] pt-10 sm:flex-row sm:items-end">
            <div>
              <p className="font-mono text-xs font-semibold uppercase text-[#9b2f22]">Sacred Uses</p>
              <h2 className="mt-3 font-serif text-4xl font-light leading-tight text-[#2d251c] sm:text-5xl">
                For every sacred moment
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-[#74624d]">
              Designed for daily worship, home blessings, auspicious ceremonies, and rituals that call for purity.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {ritualUses.map((item) => (
              <article key={item.title} className="overflow-hidden rounded-lg border border-[#e0d3be] bg-[#fffaf0]">
                <div className="relative aspect-[4/5]">
                  <Image src={item.image} alt={item.title} fill sizes="(min-width: 768px) 31vw, 92vw" className="object-cover" />
                </div>
                <div className="px-5 py-5 text-center">
                  <h3 className="font-serif text-2xl font-light text-[#2d251c]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#75644f]">{item.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <div id="saptambu-film">
        <VideoSequenceHome />
      </div>

      <section className="relative isolate overflow-hidden bg-[#f8f0e4] py-20 sm:py-28">
        <Image
          src={homeCaptures.altarLeft}
          alt=""
          width={760}
          height={1261}
          loading="eager"
          className="pointer-events-none absolute left-0 top-0 -z-10 hidden h-full w-[24rem] object-cover opacity-12 mix-blend-multiply lg:block"
        />
        <div className="container-page grid items-center gap-12 lg:grid-cols-[minmax(18rem,0.72fr)_minmax(0,0.88fr)]">
          <StaticBottleStage variant="spotlight" className="min-h-[27rem] bg-[#fff7e8] sm:min-h-[34rem]" />

          <div className="max-w-2xl">
            <p className="font-mono text-xs font-semibold uppercase text-[#b88424]">Pure. Sacred. Powerful.</p>
            <h2 className="mt-4 font-serif text-5xl font-light leading-tight text-[#2d251c] sm:text-6xl">
              Saptambu 1000ml
            </h2>
            <p className="mt-6 text-lg leading-8 text-[#62513e]">
              Our 1000ml bottle of Saptambu is a sacred blend of waters from seven holy rivers of India, created for
              extended rituals, legacy ceremonies, and meaningful spiritual gifting.
            </p>
            <div className="mt-8 grid gap-4 border-y border-[#dccbb0] py-6 text-sm leading-6 text-[#75644f] sm:grid-cols-3">
              <p>Prepared for worship and auspicious rites.</p>
              <p>Inspired by the memory of pilgrimage.</p>
              <p>Presented for refined devotional living.</p>
            </div>
            <Link
              href="/collections/all"
              className="focus-ring mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#c99324] px-6 py-3 text-sm font-semibold text-[#211408] hover:bg-[#d8a63a]"
            >
              Shop Now
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#fbf6ec] py-20 sm:py-28">
        <div className="container-page grid gap-12 lg:grid-cols-[minmax(16rem,0.44fr)_minmax(0,0.9fr)] lg:items-start">
          <div className="lg:sticky lg:top-24">
            <p className="font-mono text-xs font-semibold uppercase text-[#9b2f22]">Founder&apos;s Vision</p>
            <h2 className="mt-4 max-w-[10ch] font-serif text-5xl font-light leading-[0.96] text-[#2d251c] sm:text-6xl">
              A Vision Rooted in Faith
            </h2>
            <div className="mt-8 overflow-hidden rounded-lg border border-[#e0d3be] bg-[#fffaf0]">
              <Image
                src={homeCaptures.founderPortrait}
                alt="Dr. Ashwini Shastri"
                width={640}
                height={640}
                sizes="(min-width: 1024px) 31vw, 92vw"
                className="aspect-square w-full object-cover object-center"
              />
            </div>
          </div>

          <div className="max-w-4xl justify-self-end">
            <p className="font-serif text-3xl leading-snug text-[#2d251c]">Dr. Ashwini Shastri</p>
            <p className="mt-2 font-mono text-xs font-semibold uppercase text-[#1c6d62]">
              Founder &amp; CEO, Kiranashva Creation
            </p>
            <div className="mt-8 columns-1 gap-10 text-[1rem] leading-8 text-[#5f5142] md:columns-2">
              {founderParagraphs.map((paragraph) => (
                <p key={paragraph} className="mb-5 break-inside-avoid">
                  {paragraph}
                </p>
              ))}
            </div>
            <Link
              href="/collections/all"
              className="focus-ring mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#9b2f22] px-6 py-3 text-sm font-semibold text-white hover:bg-[#7f251b]"
            >
              Shop Now
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
