import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Panel } from "@/components/dashboard/Panel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Share2, Sparkles, Check } from "lucide-react";
import {
  CATEGORY_GRADIENT,
  CATEGORY_LABEL,
  MEDICAL_DISCLAIMER,
  getArticleById,
  getArticleBySlug,
  getHeroImageUrl,
  type LearnArticle,
} from "@/lib/learn";

export const Route = createFileRoute("/app/learn/$slug")({
  head: ({ params }) => {
    const article = getArticleBySlug(params.slug);
    if (!article) {
      return {
        meta: [
          { title: "Article unavailable · Genesyx" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    return {
      meta: [
        { title: `${article.title} · Genesyx Learn` },
        { name: "description", content: article.excerpt },
        { name: "robots", content: "noindex" },
      ],
    };
  },
  component: ArticleDetail,
  notFoundComponent: ArticleUnavailable,
});

function ArticleDetail() {
  const { slug } = Route.useParams();
  const article = getArticleBySlug(slug);
  if (!article) return <ArticleUnavailable />;
  return <ArticleView article={article} />;
}

function ArticleView({ article }: { article: LearnArticle }) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const related = article.relatedArticleIds
    .map((id) => getArticleById(id))
    .filter((a): a is LearnArticle => !!a);

  async function handleShare() {
    const siteRoot =
      typeof window !== "undefined" ? `${window.location.protocol}//${window.location.host}` : "";
    const text = `${article.title}\n\n${article.excerpt}\n\n${siteRoot}`;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }
    } catch {
      // ignore — clipboard may be blocked
    }
  }

  return (
    <div className="flex min-h-svh flex-col">
      <DashboardHeader
        title={article.title}
        subtitle={`${CATEGORY_LABEL[article.category]} · ${article.readingTime}`}
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" asChild>
              <Link to="/app/learn">
                <ArrowLeft className="h-4 w-4" /> Learn
              </Link>
            </Button>
            <Button size="sm" variant="outline" onClick={handleShare}>
              {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
              {copied ? "Copied" : "Share"}
            </Button>
          </div>
        }
      />

      <main className="flex-1 px-4 py-5 lg:px-6">
        <div className="mx-auto w-full max-w-[1100px] space-y-6">
          {/* Hero */}
          <div
            className={`relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br ${CATEGORY_GRADIENT[article.category]}`}
          >
            <div className="grid min-h-[180px] place-items-center p-8">
              <Sparkles className="h-12 w-12 text-foreground/40" aria-hidden />
            </div>
            <div className="border-t border-border bg-card p-5">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge variant="outline">{CATEGORY_LABEL[article.category]}</Badge>
                <span className="text-[12px] text-muted-foreground">{article.readingTime}</span>
                {article.tags.slice(0, 3).map((t) => (
                  <Badge key={t} variant="secondary" className="text-[11px]">
                    {t}
                  </Badge>
                ))}
              </div>
              <h1 className="font-display text-3xl font-semibold tracking-tight">
                {article.title}
              </h1>
              <p className="mt-2 text-[14.5px] leading-relaxed text-muted-foreground">
                {article.excerpt}
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
            {/* Body */}
            <article className="prose-neutral max-w-[70ch] space-y-4 text-[15px] leading-[1.7] text-foreground">
              {article.body.map((block, i) => (
                <BodyBlock key={i} block={block} />
              ))}

              {article.disclaimerRequired && (
                <p className="mt-8 rounded-lg border border-border bg-muted/50 p-4 text-[12.5px] italic text-muted-foreground">
                  {MEDICAL_DISCLAIMER}
                </p>
              )}
            </article>

            {/* Sidebar: related */}
            <aside className="space-y-3">
              <Panel title="Related" bodyClassName="p-0">
                <ul className="divide-y divide-border">
                  {related.length === 0 && (
                    <li className="px-4 py-3 text-[13px] text-muted-foreground">
                      Nothing related yet.
                    </li>
                  )}
                  {related.map((r) => (
                    <li key={r.id}>
                      <button
                        type="button"
                        onClick={() =>
                          navigate({
                            to: "/app/learn/$slug",
                            params: { slug: r.slug },
                            replace: true,
                          })
                        }
                        className="block w-full px-4 py-3 text-left transition-colors hover:bg-muted/50"
                      >
                        <div className="mb-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                          <Badge variant="outline" className="text-[10.5px]">
                            {CATEGORY_LABEL[r.category]}
                          </Badge>
                          <span>{r.readingTime}</span>
                        </div>
                        <p className="text-[13.5px] font-semibold leading-snug">{r.title}</p>
                      </button>
                    </li>
                  ))}
                </ul>
              </Panel>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

function BodyBlock({ block }: { block: LearnArticle["body"][number] }) {
  switch (block.type) {
    case "paragraph":
      return <p>{block.text}</p>;
    case "heading":
      return (
        <h2 className="mt-6 font-display text-xl font-semibold tracking-tight">{block.text}</h2>
      );
    case "bulletList":
      return (
        <ul className="list-disc space-y-1.5 pl-6">
          {block.items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ul>
      );
    case "callout":
      return (
        <blockquote className="my-4 rounded-lg border-l-4 border-foreground/40 bg-muted/40 px-4 py-3 text-[14.5px] italic text-foreground">
          {block.text}
        </blockquote>
      );
    default:
      return null;
  }
}

function ArticleUnavailable() {
  return (
    <div className="flex min-h-svh flex-col">
      <DashboardHeader title="Article unavailable" subtitle="Learn" />
      <main className="flex-1 px-4 py-10 lg:px-6">
        <div className="mx-auto max-w-lg space-y-4 text-center">
          <h2 className="font-display text-2xl font-semibold">That article isn't available</h2>
          <p className="text-[14px] text-muted-foreground">
            The link may be out of date, or the article has moved. Head back to Learn and pick
            another read.
          </p>
          <Button asChild>
            <Link to="/app/learn">
              <ArrowLeft className="h-4 w-4" /> Back to Learn
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
