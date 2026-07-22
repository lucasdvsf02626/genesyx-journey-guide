import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Panel } from "@/components/dashboard/Panel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import {
  articles,
  CATEGORY_LABEL,
  CATEGORY_ORDER,
  CATEGORY_GRADIENT,
  getArticleBySlug,
  getHeroImageUrl,
  type LearnCategory,
} from "@/lib/learn";

export const Route = createFileRoute("/app/learn/")({
  head: () => ({
    meta: [
      { title: "Learn · Genesyx" },
      {
        name: "description",
        content:
          "Short, honest guides to tracking, hydration, nutrition and reading your own patterns.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LearnLanding,
});

function LearnLanding() {
  const [category, setCategory] = useState<LearnCategory | "ALL">("ALL");

  const featured = getArticleBySlug("getting-started-first-week");

  const filtered = useMemo(() => {
    if (category === "ALL") {
      // Landing (no filter): featured hero is separate, rest as rows.
      return articles.filter((a) => a.slug !== "getting-started-first-week");
    }
    // Inside a filter, the hero becomes an ordinary row.
    return articles.filter((a) => a.category === category);
  }, [category]);

  return (
    <div className="flex min-h-svh flex-col">
      <DashboardHeader
        title="Learn"
        subtitle="Short reads to make your tracking useful"
        actions={
          <Button size="sm" variant="outline" asChild className="hidden sm:inline-flex">
            <Link to="/app/learn/search">
              <Search className="h-4 w-4" /> Search
            </Link>
          </Button>
        }
      />

      <main className="flex-1 px-4 py-5 lg:px-6">
        <div className="mx-auto w-full max-w-[1200px] space-y-5">
          {/* Category chips */}
          <div className="flex flex-wrap items-center gap-2">
            <ChipButton
              active={category === "ALL"}
              onClick={() => setCategory("ALL")}
              label="All"
            />
            {CATEGORY_ORDER.map((c) => (
              <ChipButton
                key={c}
                active={category === c}
                onClick={() => setCategory(c)}
                label={CATEGORY_LABEL[c]}
              />
            ))}
            <div className="ml-auto sm:hidden">
              <Button size="sm" variant="outline" asChild>
                <Link to="/app/learn/search">
                  <Search className="h-4 w-4" /> Search
                </Link>
              </Button>
            </div>
          </div>

          {/* Featured hero — only when no filter */}
          {category === "ALL" && featured && (
            <Link
              to="/app/learn/$slug"
              params={{ slug: featured.slug }}
              className="group block overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-foreground/20"
            >
              <div className="grid md:grid-cols-[1.1fr_1fr]">
                <div
                  className={`relative min-h-[200px] overflow-hidden bg-gradient-to-br ${CATEGORY_GRADIENT[featured.category]}`}
                >
                  {getHeroImageUrl(featured.heroImage) ? (
                    <img
                      src={getHeroImageUrl(featured.heroImage)}
                      alt=""
                      loading="eager"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center">
                      <Sparkles className="h-10 w-10 text-foreground/40" aria-hidden />
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-3 p-6">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Featured</Badge>
                    <Badge variant="outline">{CATEGORY_LABEL[featured.category]}</Badge>
                    <span className="text-[12px] text-muted-foreground">{featured.readingTime}</span>
                  </div>
                  <h2 className="font-display text-2xl font-semibold tracking-tight">
                    {featured.title}
                  </h2>
                  <p className="text-[14px] leading-relaxed text-muted-foreground">
                    {featured.excerpt}
                  </p>
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-foreground group-hover:underline">
                      Read article <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* Article rows */}
          <Panel
            title={category === "ALL" ? "All articles" : CATEGORY_LABEL[category]}
            description={`${filtered.length} article${filtered.length === 1 ? "" : "s"}`}
            bodyClassName="p-0"
          >
            <ul className="divide-y divide-border">
              {filtered.map((a) => (
                <li key={a.id}>
                  <Link
                    to="/app/learn/$slug"
                    params={{ slug: a.slug }}
                    className="grid gap-2 px-5 py-4 transition-colors hover:bg-muted/50 md:grid-cols-[1fr_auto] md:items-center"
                  >
                    <div className="min-w-0">
                      <div className="mb-1 flex items-center gap-2 text-[12px] text-muted-foreground">
                        <Badge variant="outline" className="text-[11px]">
                          {CATEGORY_LABEL[a.category]}
                        </Badge>
                        <span>·</span>
                        <span>{a.readingTime}</span>
                      </div>
                      <p className="font-display text-[15.5px] font-semibold leading-snug">
                        {a.title}
                      </p>
                      <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
                        {a.excerpt}
                      </p>
                    </div>
                    <ArrowRight className="hidden h-4 w-4 text-muted-foreground md:inline" />
                  </Link>
                </li>
              ))}
              {filtered.length === 0 && (
                <li className="px-5 py-6 text-[13px] text-muted-foreground">
                  Nothing in this category yet.
                </li>
              )}
            </ul>
          </Panel>
        </div>
      </main>
    </div>
  );
}

function ChipButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors " +
        (active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-card text-foreground hover:bg-muted")
      }
      aria-pressed={active}
    >
      {label}
    </button>
  );
}
