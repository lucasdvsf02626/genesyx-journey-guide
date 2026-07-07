import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/genesyx/AppShell";
import { SplashScreen, OnboardingIntro } from "@/components/genesyx/screens/Onboarding";
import { QuizFlow } from "@/components/genesyx/screens/Quiz";
import { QuizResults, WaitlistScreen, type QuizAnswers } from "@/components/genesyx/screens/Conversion";
import { useAuth } from "@/hooks/use-auth";
import { rememberAppEntry } from "@/lib/authPrompt";

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

  // If the user is signed in, or has already entered the app before, send them
  // straight to the desktop dashboard. Onboarding/splash/quiz stays here at "/".
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

  return (
    <AppShell>
      {flow === "splash" && (
        <SplashScreen onStart={() => setFlow("intro")} onSignIn={openAuth} />
      )}
      {flow === "intro" && (
        <OnboardingIntro onContinue={() => setFlow("quiz")} onBack={() => setFlow("splash")} />
      )}
      {flow === "quiz" && (
        <QuizFlow
          onComplete={(a) => { setQuizAnswers(a); setFlow("results"); }}
          onBack={() => setFlow("intro")}
        />
      )}
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
