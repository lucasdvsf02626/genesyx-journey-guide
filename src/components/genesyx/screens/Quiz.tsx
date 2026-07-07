import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Check, ChevronLeft, Sparkles } from "lucide-react";
import { quizQuestions } from "../mockData";
import { cn } from "@/lib/utils";
import { BrandOrb } from "../BrandLogo";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function QuizFlow({
  onComplete,
  onBack,
}: {
  onComplete: (answers: Record<string, string>) => void;
  onBack: () => void;
}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [factOpen, setFactOpen] = useState(false);

  const total = quizQuestions.length;
  const q = quizQuestions[step];
  const selected = answers[q.id];
  const fact = "fact" in q ? (q as { fact?: { title: string; body: string } }).fact : undefined;

  const advance = () => {
    if (step + 1 < total) {
      setStep(step + 1);
    } else {
      setLoading(true);
      setTimeout(() => onComplete(answers), 1600);
    }
  };

  const next = () => {
    if (fact) {
      setFactOpen(true);
    } else {
      advance();
    }
  };

  const closeFact = () => {
    setFactOpen(false);
    advance();
  };

  const back = () => {
    if (step === 0) onBack();
    else setStep(step - 1);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background px-8 text-center">
        <div className="relative">
          <BrandOrb className="h-32 w-32" />
        </div>
        <p className="mt-10 font-display text-xl font-semibold">Preparing your personalised summary…</p>
        <p className="mt-2 text-sm text-muted-foreground">Reviewing your answers with care.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background">
      {/* Top progress bar */}
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1200px] items-center gap-4 px-8 py-4">
          <button
            onClick={back}
            className="flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          <div className="flex-1">
            <Progress value={((step + 1) / total) * 100} className="h-1.5 bg-muted [&>div]:bg-primary" />
          </div>
          <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Step {step + 1} / {total}
          </span>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-14 px-8 py-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {/* Left column — question */}
        <section className="flex flex-col">
          <p className="font-display text-[12px] font-semibold uppercase tracking-[0.24em] text-primary">
            Personalisation quiz
          </p>
          <h2 className="mt-4 font-display text-[36px] font-semibold leading-[1.1] tracking-tight md:text-[44px]">
            {q.question}
          </h2>
          <p className="mt-4 max-w-[46ch] text-[15px] leading-relaxed text-muted-foreground">
            {q.helper}
          </p>

          <div className="mt-10 hidden rounded-2xl border border-border bg-card p-5 lg:block">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="font-display text-[14px] font-semibold text-foreground">
                  Private &amp; personalised
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                  Your answers shape your dashboard, tracking cadence and nutrition focus. There are no wrong answers.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Right column — options */}
        <section className="flex flex-col">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {q.options.map((opt) => {
              const isSel = selected === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setAnswers({ ...answers, [q.id]: opt.id })}
                  className={cn(
                    "group flex w-full items-center justify-between rounded-2xl border bg-card px-5 py-5 text-left transition-all",
                    isSel
                      ? "border-primary bg-primary/5 shadow-[0_10px_30px_-16px_rgba(13,148,136,0.45)]"
                      : "border-border hover:border-foreground/25 hover:bg-muted/40"
                  )}
                >
                  <span className={cn("text-[15px] font-semibold", isSel ? "text-primary" : "text-foreground")}>
                    {opt.label}
                  </span>
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors",
                      isSel ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background"
                    )}
                  >
                    {isSel && <Check className="h-3.5 w-3.5" />}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
            <span className="text-[13px] text-muted-foreground">
              {selected ? "Great — you can continue." : "Pick an option to continue."}
            </span>
            <Button
              disabled={!selected}
              size="lg"
              onClick={next}
              className="h-12 rounded-xl bg-primary px-8 text-[15px] font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
            >
              {step + 1 === total ? "See my summary" : "Continue"}
            </Button>
          </div>
        </section>
      </main>

      <Dialog open={factOpen} onOpenChange={(o) => !o && closeFact()}>
        <DialogContent className="max-w-[440px] rounded-3xl border-0 bg-card p-7 gx-card-shadow">
          <DialogHeader className="space-y-3 text-left">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[color-mix(in_oklab,var(--electric-lavender)_14%,white)]">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle className="font-display text-[20px] font-semibold tracking-tight">
              {fact?.title ?? "Did you know?"}
            </DialogTitle>
            <DialogDescription className="text-[14px] leading-relaxed text-foreground/75">
              {fact?.body}
            </DialogDescription>
          </DialogHeader>
          <Button
            onClick={closeFact}
            className="mt-2 h-12 w-full rounded-2xl bg-primary text-[15px] font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Continue
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
