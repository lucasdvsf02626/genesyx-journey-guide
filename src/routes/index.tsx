import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/genesyx/AppShell";
import { QuizFlow } from "@/components/genesyx/screens/Quiz";
import { QuizResults, WaitlistScreen, type QuizAnswers } from "@/components/genesyx/screens/Conversion";
import { useAuth } from "@/hooks/use-auth";
import { rememberAppEntry } from "@/lib/authPrompt";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/genesyx/BrandLogo";
import { Sparkles, Heart, Leaf, BarChart3, ChevronRight, ArrowLeft, ShieldCheck } from "lucide-react";
import splashBg from "@/assets/genesyx-splash-bg.jpg.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Genesyx — Fertility prep, gently guided" },
      { name: "description", content: "A premium fertility-preparation workspace: cycle awareness, nutrition guidance, and personalised insights." },
      { property: "og:title", content: "Genesyx — Fertility prep, gently guided" },
      { property: "og:description", content: "Personalised cycle, nutrition, and supplement support for your conception journey." },
    ],
  }),
  component: Index,
});

type Flow = "splash" | "intro" | "quiz" | "results" | "waitlist";

function Index() {
  const [flow, setFlow] = useState<Flow>("splash");
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswers>({});
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (typeof window === "undefined") return;
    const savedEntry = window.localStorage.getItem("genesyx:openApp");
    if (user || savedEntry === "true" || savedEntry === "1") {
      navigate({ to: "/app", replace: true });
    }
  }, [user, loading, navigate]);

  const openApp = () => {
    rememberAppEntry();
    navigate({ to: "/app" });
  };

  const openAuth = () => {
    rememberAppEntry();
    navigate({ to: "/auth" });
  };

  if (flow === "splash") {
    return <DesktopSplash onStart={() => setFlow("intro")} onSignIn={openAuth} />;
  }

  if (flow === "intro") {
    return <DesktopIntro onContinue={() => setFlow("quiz")} onBack={() => setFlow("splash")} />;
  }

  if (flow === "quiz") {
    return (
      <QuizFlow
        onComplete={(a) => { setQuizAnswers(a); setFlow("results"); }}
        onBack={() => setFlow("intro")}
      />
    );
  }

  // Results / waitlist keep the current framed layout for now.
  return (
    <AppShell>
      {flow === "results" && (
        <QuizResults
          answers={quizAnswers}
          onUnlock={() => setFlow("waitlist")}
          onContinue={openApp}
          onBack={() => setFlow("intro")}
        />
      )}
      {flow === "waitlist" && (
        <WaitlistScreen onContinue={openApp} onBack={() => setFlow("results")} />
      )}
    </AppShell>
  );
}

function DesktopSplash({ onStart, onSignIn }: { onStart: () => void; onSignIn: () => void }) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      {/* Ambient brand backdrop on the right */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 bg-cover bg-center opacity-90 lg:block"
        style={{ backgroundImage: `url(${splashBg.url})` }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 lg:hidden bg-cover bg-center opacity-30"
        style={{ backgroundImage: `url(${splashBg.url})` }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 hidden w-3/5 bg-gradient-to-r from-background via-background/95 to-transparent lg:block"
      />

      {/* Top bar */}
      <header className="relative z-10 mx-auto flex w-full max-w-[1400px] items-center justify-between px-8 py-6">
        <BrandLogo size={34} />
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#pillars" className="hover:text-foreground">Product</a>
          <Link to="/approach" className="hover:text-foreground">Approach</Link>
          <Link to="/trust" className="hover:text-foreground">Trust</Link>
        </nav>
        <div className="flex items-center gap-2">
          <button
            onClick={onSignIn}
            className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-muted hover:text-foreground"
          >
            Sign in
          </button>
          <Button
            onClick={onStart}
            className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Start free
          </Button>
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10 mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-16 px-8 pt-8 pb-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:pt-16">

        <div className="flex max-w-[620px] flex-col justify-center">
          <p className="font-display text-[12px] font-semibold uppercase tracking-[0.24em] text-primary">
            Step into the future of fertility
          </p>
          <h1 className="mt-5 font-display text-[52px] font-semibold leading-[1.05] tracking-tight text-foreground md:text-[64px]">
            Feel informed, supported and ready for your conception journey.
          </h1>
          <p className="mt-6 max-w-[52ch] text-[17px] leading-relaxed text-muted-foreground">
            Genesyx is a premium, gently-guided companion blending cycle awareness, nutrition and supplement support — designed for the calm clarity of a modern web workspace.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              onClick={onStart}
              className="h-12 rounded-xl bg-primary px-6 text-base font-semibold text-primary-foreground shadow-[0_10px_30px_-12px_rgba(13,148,136,0.55)] hover:bg-primary/90"
            >
              Start your personalised quiz
              <ChevronRight className="ml-1 h-5 w-5" />
            </Button>
            <button
              onClick={onSignIn}
              className="h-12 rounded-xl border border-border bg-card px-5 text-base font-medium text-foreground hover:bg-muted"
            >
              I already have an account
            </button>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-6 text-[13px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-primary" />
              Personalised in under 3 minutes
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Private by design
            </span>
          </div>
        </div>

        {/* Pillars card */}
        <div id="pillars" className="flex items-center">
          <div className="w-full rounded-3xl border border-border bg-card/90 p-8 shadow-xl backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              What you'll get
            </p>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                { Icon: Heart, title: "Cycle awareness", desc: "Clear patterns, calm guidance." },
                { Icon: Leaf, title: "Nutrition focus", desc: "Cycle-aware food & supplements." },
                { Icon: BarChart3, title: "Tailored insights", desc: "Gentle observations, weekly." },
              ].map(({ Icon, title, desc }) => (
                <div key={title} className="rounded-2xl border border-border bg-background p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-4 font-display text-[15px] font-semibold text-foreground">{title}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 flex items-center justify-between rounded-2xl bg-muted/60 p-4">
              <p className="text-sm text-muted-foreground">
                Educational fertility wellness support, tailored to you.
              </p>
              <button
                onClick={onStart}
                className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
              >
                Begin <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
}

function DesktopIntro({ onContinue, onBack }: { onContinue: () => void; onBack: () => void }) {
  const benefits = [
    { Icon: Heart, title: "Understand your cycle", desc: "Recognise patterns with calm, clear guidance across every phase." },
    { Icon: Leaf, title: "Support fertility nutrition", desc: "Cycle-aware food and supplement focus, tuned to your goals." },
    { Icon: BarChart3, title: "Receive tailored insights", desc: "Gentle weekly observations based on the tracking you actually do." },
  ] as const;

  return (
    <div className="min-h-screen w-full bg-background">
      <header className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-8 py-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <BrandLogo size={30} />
        <div className="w-16" />
      </header>

      <section className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-12 px-8 pt-8 pb-24 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="flex flex-col justify-center">
          <p className="font-display text-[12px] font-semibold uppercase tracking-[0.24em] text-primary">
            Your workspace
          </p>
          <h1 className="mt-4 font-display text-[40px] font-semibold leading-[1.08] tracking-tight md:text-[48px]">
            Your fertility preparation, gently guided.
          </h1>
          <p className="mt-5 max-w-[46ch] text-[16px] leading-relaxed text-muted-foreground">
            Genesyx blends cycle awareness, nutrition, and supportive insights into one calm desktop workspace. A short quiz tailors everything to you.
          </p>

          <div className="mt-8">
            <Button
              size="lg"
              onClick={onContinue}
              className="h-12 rounded-xl bg-primary px-6 text-base font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Continue to the quiz
              <ChevronRight className="ml-1 h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
          {benefits.map(({ Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-5 font-display text-[16px] font-semibold text-foreground">{title}</p>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
