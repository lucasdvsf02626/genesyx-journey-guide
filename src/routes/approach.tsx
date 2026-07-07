import { createFileRoute, Link } from "@tanstack/react-router";
import { BrandLogo } from "@/components/genesyx/BrandLogo";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  HeartHandshake,
  Leaf,
  BarChart3,
  ClipboardList,
  Users,
  BookOpenCheck,
  ChevronRight,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/approach")({
  head: () => ({
    meta: [
      { title: "Our approach — Genesyx" },
      {
        name: "description",
        content:
          "How Genesyx guides your fertility preparation: a personalised quiz, cycle-aware insights, daily tracking, evidence-informed nutrition, and a partner-inclusive journey.",
      },
      { property: "og:title", content: "Our approach — Genesyx" },
      {
        property: "og:description",
        content:
          "A calm, evidence-informed method for fertility preparation — designed for both partners.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ApproachPage,
});

function ApproachPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Hero */}
      <section className="mx-auto w-full max-w-[1200px] px-8 pt-16 pb-14">
        <p className="font-display text-[12px] font-semibold uppercase tracking-[0.24em] text-primary">
          Our approach
        </p>
        <h1 className="mt-4 max-w-[22ch] font-display text-[48px] font-semibold leading-[1.05] tracking-tight md:text-[60px]">
          A gentler, better-informed way to prepare for conception.
        </h1>
        <p className="mt-6 max-w-[62ch] text-[17px] leading-relaxed text-muted-foreground">
          Genesyx blends cycle awareness, daily tracking, and evidence-informed
          nutrition into one calm workspace. No noise, no judgement — just a
          clear method you and your partner can follow together.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link to="/">
            <Button
              size="lg"
              className="h-12 rounded-xl bg-primary px-6 text-base font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Start the quiz
              <ChevronRight className="ml-1 h-5 w-5" />
            </Button>
          </Link>
          <Link
            to="/trust"
            className="h-12 inline-flex items-center rounded-xl border border-border bg-card px-5 text-base font-medium hover:bg-muted"
          >
            How we handle your data
          </Link>
        </div>
      </section>

      {/* Method — 4 pillars */}
      <section className="mx-auto w-full max-w-[1200px] px-8 pb-16">
        <SectionHeading
          eyebrow="Our method"
          title="Four pillars, working together"
          lead="Each pillar answers a specific question. Together, they give you a picture of your fertility that's actually useful."
        />
        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
          {METHOD.map(({ Icon, step, title, desc }) => (
            <article
              key={title}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Step {step}
                </span>
              </div>
              <h3 className="mt-5 font-display text-[20px] font-semibold">
                {title}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                {desc}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Journey timeline */}
      <section className="border-y border-border bg-muted/40">
        <div className="mx-auto w-full max-w-[1200px] px-8 py-16">
          <SectionHeading
            eyebrow="Your journey"
            title="What the first weeks look like"
            lead="A calm, week-by-week rhythm. You can go faster or slower — the app adapts."
          />
          <ol className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-4">
            {JOURNEY.map((j, i) => (
              <li
                key={j.title}
                className="relative rounded-2xl border border-border bg-card p-6"
              >
                <span className="font-display text-[13px] font-semibold text-primary">
                  {j.when}
                </span>
                <h4 className="mt-2 font-display text-[17px] font-semibold">
                  {j.title}
                </h4>
                <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
                  {j.desc}
                </p>
                {i < JOURNEY.length - 1 && (
                  <ArrowRight
                    aria-hidden
                    className="absolute -right-3 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-muted-foreground/40 md:block"
                  />
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Science & partner */}
      <section className="mx-auto w-full max-w-[1200px] px-8 py-16">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-border bg-card p-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BookOpenCheck className="h-5 w-5" />
            </div>
            <h3 className="mt-5 font-display text-[22px] font-semibold">
              Evidence-informed, not evangelical
            </h3>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              Our guidance draws on peer-reviewed research in reproductive
              health, nutrition, and cycle science. We surface patterns and
              gentle observations — never diagnoses.
            </p>
            <ul className="mt-5 space-y-2 text-[14px] text-muted-foreground">
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                Cervical mucus pH ranges based on published fertility windows.
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                Cycle phases mapped to nutrition and hydration targets.
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                Clear health disclaimer — Genesyx is educational, not medical
                advice.
              </li>
            </ul>
            <Link
              to="/health-disclaimer"
              className="mt-6 inline-flex items-center text-sm font-semibold text-primary hover:underline"
            >
              Read the health disclaimer
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          <div className="rounded-3xl border border-border bg-card p-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="mt-5 font-display text-[22px] font-semibold">
              Built for both partners
            </h3>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              Conception is rarely a solo project. Genesyx makes it easy to
              invite a partner, share the parts that matter, and stay aligned
              without turning care into homework.
            </p>
            <ul className="mt-5 space-y-2 text-[14px] text-muted-foreground">
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                Send a private invite from your profile.
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                Choose what your partner can see — nothing is shared by default.
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                Gentle, non-pressuring nudges — never streak-guilt.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-[1200px] px-8 pb-24">
        <div className="rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-10 text-center">
          <h3 className="font-display text-[28px] font-semibold">
            Ready to see what your journey looks like?
          </h3>
          <p className="mx-auto mt-3 max-w-[52ch] text-[15px] text-muted-foreground">
            The personalised quiz takes under 3 minutes and shapes your first
            week of guidance.
          </p>
          <Link to="/" className="mt-6 inline-flex">
            <Button
              size="lg"
              className="h-12 rounded-xl bg-primary px-6 text-base font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Start your personalised quiz
              <ChevronRight className="ml-1 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

const METHOD = [
  {
    Icon: ClipboardList,
    step: "01",
    title: "A quiz that actually listens",
    desc: "Two minutes of thoughtful questions about your cycle, history, and goals. No dropdowns of dread — just the essentials to tailor your first week.",
  },
  {
    Icon: BarChart3,
    step: "02",
    title: "Insights that read your patterns",
    desc: "As you log, Genesyx surfaces phase-aware observations: hydration windows, pH trends, and small changes that add up to real signal.",
  },
  {
    Icon: HeartHandshake,
    step: "03",
    title: "Tracking that stays out of the way",
    desc: "Daily log is 30 seconds. Cycle, pH, hydration, mood — captured in one calm surface with sensible defaults you can override any time.",
  },
  {
    Icon: Leaf,
    step: "04",
    title: "Nutrition that follows your cycle",
    desc: "Cycle-aware focus foods and supplement reminders, framed as gentle guidance — not a rigid plan you have to be perfect at.",
  },
] as const;

const JOURNEY = [
  {
    when: "Day 1",
    title: "Personalised quiz",
    desc: "Answer a short intake so your first insights fit your cycle and history.",
  },
  {
    when: "Week 1",
    title: "Baseline & rhythm",
    desc: "Establish daily log habits and see your first phase-aware insights.",
  },
  {
    when: "Week 2–3",
    title: "Trends emerge",
    desc: "pH, hydration and cycle patterns start telling a story you can act on.",
  },
  {
    when: "Ongoing",
    title: "Adapt with you",
    desc: "Nutrition and focus areas evolve with each phase and each new signal.",
  },
] as const;

function SectionHeading({
  eyebrow,
  title,
  lead,
}: {
  eyebrow: string;
  title: string;
  lead: string;
}) {
  return (
    <div className="max-w-[62ch]">
      <p className="font-display text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
        {eyebrow}
      </p>
      <h2 className="mt-3 font-display text-[34px] font-semibold leading-tight tracking-tight md:text-[40px]">
        {title}
      </h2>
      <p className="mt-3 text-[16px] leading-relaxed text-muted-foreground">
        {lead}
      </p>
    </div>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-8 py-4">
        <Link to="/" className="flex items-center">
          <BrandLogo size={30} />
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>
          <Link
            to="/approach"
            className="hover:text-foreground"
            activeProps={{ className: "text-foreground font-medium" }}
          >
            Approach
          </Link>
          <Link
            to="/trust"
            className="hover:text-foreground"
            activeProps={{ className: "text-foreground font-medium" }}
          >
            Trust
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/auth"
            className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-muted hover:text-foreground"
          >
            Sign in
          </Link>
          <Link to="/">
            <Button className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
              <Sparkles className="mr-1 h-4 w-4" />
              Start free
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card/30">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col items-start justify-between gap-6 px-8 py-10 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <BrandLogo size={22} />
          <span className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Genesyx. Educational — not medical advice.
          </span>
        </div>
        <nav className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
          <Link to="/approach" className="hover:text-foreground">Approach</Link>
          <Link to="/trust" className="hover:text-foreground">Trust</Link>
          <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
          <Link to="/terms" className="hover:text-foreground">Terms</Link>
          <Link to="/health-disclaimer" className="hover:text-foreground">Health disclaimer</Link>
          <Link to="/support" className="hover:text-foreground">Support</Link>
        </nav>
      </div>
    </footer>
  );
}
