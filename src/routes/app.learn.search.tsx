import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Panel } from "@/components/dashboard/Panel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search as SearchIcon, X } from "lucide-react";
import { CATEGORY_LABEL, searchArticles } from "@/lib/learn";

export const Route = createFileRoute("/app/learn/search")({
  head: () => ({
    meta: [
      { title: "Search Learn · Genesyx" },
      { name: "description", content: "Search Genesyx articles by title, excerpt or tag." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LearnSearch,
});

function LearnSearch() {
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const results = useMemo(() => searchArticles(q), [q]);
  const trimmed = q.trim();

  return (
    <div className="flex min-h-svh flex-col">
      <DashboardHeader
        title="Search Learn"
        subtitle="Title, excerpt and tags"
        actions={
          <Button size="sm" variant="outline" asChild>
            <Link to="/app/learn">
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
          </Button>
        }
      />

      <main className="flex-1 px-4 py-5 lg:px-6">
        <div className="mx-auto w-full max-w-[900px] space-y-5">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search articles…"
              className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-10 text-[14px] outline-none ring-0 focus:border-foreground/40"
              aria-label="Search articles"
            />
            {q && (
              <button
                type="button"
                onClick={() => {
                  setQ("");
                  inputRef.current?.focus();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-muted"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {!trimmed && (
            <p className="text-[13px] text-muted-foreground">
              Try a word from the title, the excerpt or a tag — for example, "hydration",
              "streak" or "supplements".
            </p>
          )}

          {trimmed && results.length === 0 && (
            <Panel title="No matches">
              <p className="text-[13px] text-muted-foreground">
                Nothing matches "{trimmed}" yet. Try a shorter or simpler word.
              </p>
            </Panel>
          )}

          {results.length > 0 && (
            <Panel
              title={`${results.length} result${results.length === 1 ? "" : "s"}`}
              bodyClassName="p-0"
            >
              <ul className="divide-y divide-border">
                {results.map((a) => (
                  <li key={a.id}>
                    <Link
                      to="/app/learn/$slug"
                      params={{ slug: a.slug }}
                      className="block px-5 py-4 transition-colors hover:bg-muted/50"
                    >
                      <div className="mb-1 flex items-center gap-2 text-[12px] text-muted-foreground">
                        <Badge variant="outline" className="text-[11px]">
                          {CATEGORY_LABEL[a.category]}
                        </Badge>
                        <span>·</span>
                        <span>{a.readingTime}</span>
                      </div>
                      <p className="font-display text-[15px] font-semibold leading-snug">
                        {a.title}
                      </p>
                      <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
                        {a.excerpt}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </div>
      </main>
    </div>
  );
}
