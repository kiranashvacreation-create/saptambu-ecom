import { EmptyState } from "@/components/empty-state";

export default function NewsPage() {
  return (
    <section className="container-page py-12">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9b2f22]">News</p>
      <h1 className="mt-2 text-4xl font-semibold">News</h1>
      <div className="mt-8">
        <EmptyState
          title="No posts published yet"
          message="The route is preserved for SEO. News and article publishing can be expanded after the commerce v1 is live."
        />
      </div>
    </section>
  );
}
