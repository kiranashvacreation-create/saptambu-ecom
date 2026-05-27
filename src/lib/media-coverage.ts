import type { MediaArticle } from "@/generated/prisma/client";

export type MediaCoverageItem = {
  id: string;
  sourceName: string;
  sourceUrl: string | null;
  headline: string;
  excerpt: string;
  bodyHtml?: string;
  imageUrl: string | null;
  imageAlt: string;
  publishedLabel: string;
  href: string;
  isExternal: boolean;
};

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
});

export const fallbackMediaCoverageItems: MediaCoverageItem[] = [
  {
    id: "news-today-24-7",
    sourceName: "News Today 24/7",
    sourceUrl: null,
    headline: "Saptambu: Bringing the Sacred Rivers of India into a Single Bottle",
    excerpt:
      "A feature on Saptambu as a devotional innovation uniting waters from India's seven holy rivers for modern worship and heritage-led living.",
    bodyHtml: `
      <p>Saptambu brings together a deeply Indian idea: the sacred memory of rivers, carried into a single ritual-ready bottle for homes, temples, and devotional gifting.</p>
      <p>The feature introduces the product as a blend connected to seven holy rivers, presented for people who want a daily touchpoint with heritage, prayer, and purification.</p>
      <h2>A devotional product for modern homes</h2>
      <p>Rather than treating sacred water as a distant pilgrimage-only experience, Saptambu frames it as something families can keep close during worship, auspicious beginnings, festivals, and personal rituals.</p>
      <blockquote>Saptambu is positioned as a bridge between river reverence and contemporary devotional living.</blockquote>
      <p>The story also highlights the brand's larger intent: preserving cultural emotion while presenting the product with care, clarity, and dignity.</p>
    `,
    imageUrl:
      "https://res.cloudinary.com/dmzwaaf1h/image/upload/v1779875396/saptambu/media/news-today-24-7-cover.png",
    imageAlt: "News Today 24/7 media logo",
    publishedLabel: "Featured press",
    href: "/media/news-today-24-7",
    isExternal: false,
  },
  {
    id: "forbes-news-india",
    sourceName: "Forbes News India",
    sourceUrl: null,
    headline: "Saptambu: Bringing the Sacred Rivers of India into a Single Bottle",
    excerpt:
      "A profile of the brand's spiritual roots and Dr. Ashwini Shastri's vision for making sacred river connection accessible to homes.",
    bodyHtml: `
      <p>This media story focuses on the founding vision behind Saptambu and the desire to make sacred river connection accessible within everyday devotional life.</p>
      <p>It presents the brand as a spiritual and cultural offering, shaped by reverence for India's rivers and by the need for a product that feels authentic, giftable, and practical.</p>
      <h2>The founder's vision</h2>
      <p>At the center of the story is the idea that sacred waters are not only symbolic; they carry memory, geography, ritual, and emotional continuity across generations.</p>
      <p>Saptambu uses that sentiment to create a product that can sit naturally in home temples, festival preparations, family ceremonies, and devotional gifting.</p>
      <h3>Brand story</h3>
      <p>The coverage positions Kiranashva Creation as a brand working at the meeting point of tradition, packaging, and modern worship needs.</p>
    `,
    imageUrl:
      "https://res.cloudinary.com/dmzwaaf1h/image/upload/v1779875397/saptambu/media/forbes-news-india-cover.png",
    imageAlt: "Forbes News India media logo",
    publishedLabel: "Brand story",
    href: "/media/forbes-news-india",
    isExternal: false,
  },
  {
    id: "times-news-express",
    sourceName: "Times News Express",
    sourceUrl: null,
    headline: "Saptambu: Bringing the Sacred Rivers of India into a Single Bottle",
    excerpt:
      "Coverage of the journey behind Saptambu, from reverence for holy rivers to a ritual product designed for everyday devotion.",
    bodyHtml: `
      <p>The Times News Express feature describes Saptambu as a devotional product inspired by the sacred geography of India and the emotional pull of holy rivers.</p>
      <p>The article frames the bottle as more than packaging: it is a compact ritual object meant to carry a sense of pilgrimage, blessing, and continuity into everyday spaces.</p>
      <h2>From river reverence to ritual use</h2>
      <p>The story connects the product to household worship, ceremonies, temple offerings, and spiritual gifting, emphasizing why a carefully presented sacred-water blend can resonate with modern devotees.</p>
      <p>It also underlines the importance of trust, clarity, and cultural sensitivity when building a product around sacred traditions.</p>
      <blockquote>The essence of the coverage is simple: Saptambu turns a vast sacred idea into something people can respectfully keep close.</blockquote>
    `,
    imageUrl:
      "https://res.cloudinary.com/dmzwaaf1h/image/upload/v1779875398/saptambu/media/times-news-express-cover.png",
    imageAlt: "Times News Express media logo",
    publishedLabel: "Founder vision",
    href: "/media/times-news-express",
    isExternal: false,
  },
];

export function mapMediaArticleToCoverageItem(article: MediaArticle): MediaCoverageItem {
  const sourceName = article.sourceName || "Saptambu Media";

  return {
    id: article.id,
    sourceName,
    sourceUrl: article.sourceUrl,
    headline: article.title,
    excerpt: article.excerpt,
    imageUrl: article.coverImageUrl,
    imageAlt: article.coverImageAlt || `${sourceName} coverage for ${article.title}`,
    publishedLabel: article.publishedAt ? dateFormatter.format(article.publishedAt) : "Media feature",
    href: `/media/${article.slug}`,
    isExternal: false,
  };
}

export function getFallbackMediaCoverageItem(slug: string) {
  return fallbackMediaCoverageItems.find((item) => item.id === slug) || null;
}
