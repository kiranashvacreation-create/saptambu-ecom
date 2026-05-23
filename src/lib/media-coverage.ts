import type { MediaArticle } from "@/generated/prisma/client";

export type MediaCoverageItem = {
  id: string;
  sourceName: string;
  sourceUrl: string | null;
  headline: string;
  excerpt: string;
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
    sourceUrl: "https://www.newstoday24x7.co.in/2026/04/saptambu-bringing-sacred-rivers-of.html",
    headline: "Saptambu: Bringing the Sacred Rivers of India into a Single Bottle",
    excerpt:
      "A feature on Saptambu as a devotional innovation uniting waters from India's seven holy rivers for modern worship and heritage-led living.",
    imageUrl:
      "https://cdn.shopify.com/s/files/1/0640/8526/2421/files/image_8fe8ce16-50b9-4c0b-a80d-8967a487f03d.png?v=1777213254",
    imageAlt: "News Today 24/7 media logo",
    publishedLabel: "Featured press",
    href: "https://www.newstoday24x7.co.in/2026/04/saptambu-bringing-sacred-rivers-of.html",
    isExternal: true,
  },
  {
    id: "forbes-news-india",
    sourceName: "Forbes News India",
    sourceUrl: "https://www.theindiaforbesnews.co.in/2026/04/saptambu-bringing-sacred-rivers-of.html?m=1",
    headline: "Saptambu: Bringing the Sacred Rivers of India into a Single Bottle",
    excerpt:
      "A profile of the brand's spiritual roots and Dr. Ashwini Shastri's vision for making sacred river connection accessible to homes.",
    imageUrl:
      "https://cdn.shopify.com/s/files/1/0640/8526/2421/files/image_9d6966f3-b710-4a08-80d1-ee3bbf5f8057.png?v=1777213271",
    imageAlt: "Forbes News India media logo",
    publishedLabel: "Brand story",
    href: "https://www.theindiaforbesnews.co.in/2026/04/saptambu-bringing-sacred-rivers-of.html?m=1",
    isExternal: true,
  },
  {
    id: "times-news-express",
    sourceName: "Times News Express",
    sourceUrl: "http://www.timesnewsexpress.co.in/2026/04/saptambu-bringing-sacred-rivers-of.html",
    headline: "Saptambu: Bringing the Sacred Rivers of India into a Single Bottle",
    excerpt:
      "Coverage of the journey behind Saptambu, from reverence for holy rivers to a ritual product designed for everyday devotion.",
    imageUrl:
      "https://cdn.shopify.com/s/files/1/0640/8526/2421/files/image_417b1d9c-1411-4986-9919-25d3e6073a40.png?v=1777213279",
    imageAlt: "Times News Express media logo",
    publishedLabel: "Founder vision",
    href: "http://www.timesnewsexpress.co.in/2026/04/saptambu-bringing-sacred-rivers-of.html",
    isExternal: true,
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
