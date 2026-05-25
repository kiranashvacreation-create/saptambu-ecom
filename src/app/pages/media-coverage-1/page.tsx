import type { Metadata } from "next";
import { MediaCoverageShowcase } from "@/components/media-coverage-showcase";
import { fallbackMediaCoverageItems, mapMediaArticleToCoverageItem } from "@/lib/media-coverage";
import { listPublishedMediaArticles } from "@/lib/media";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Media Coverage | Saptambu in the News",
  description:
    "Explore press features and media stories about Saptambu, Kiranashva Creation, and India's sacred blend of seven holy rivers.",
  alternates: {
    canonical: "/pages/media-coverage-1",
  },
  openGraph: {
    title: "Media Coverage | Saptambu in the News",
    description:
      "Press features and media stories about Saptambu, Kiranashva Creation, and India's sacred blend of seven holy rivers.",
    siteName: site.name,
    type: "website",
    url: "/pages/media-coverage-1",
  },
};

export default async function MediaCoveragePage() {
  const publishedArticles = await listPublishedMediaArticles();
  const dbItems = publishedArticles.map(mapMediaArticleToCoverageItem);
  const dbHrefs = new Set(dbItems.map((item) => item.href));
  const items = [...dbItems, ...fallbackMediaCoverageItems.filter((item) => !dbHrefs.has(item.href))];

  return <MediaCoverageShowcase items={items} />;
}
