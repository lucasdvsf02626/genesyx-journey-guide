import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { PhTrackerCard } from "@/components/genesyx/PhTrackerCard";

export const Route = createFileRoute("/app/track/ph")({
  head: () => ({
    meta: [
      { title: "Vaginal pH · Genesyx" },
      { name: "description", content: "Log and review vaginal pH readings — trend awareness, not diagnosis." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PhDetail,
});

function PhDetail() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-svh flex-col">
      <DashboardHeader title="Vaginal pH" subtitle="Trend awareness — not diagnosis" />
      <main className="flex-1 px-4 py-5 lg:px-6">
        <div className="mx-auto w-full max-w-[1000px] space-y-3">
          <PhTrackerCard onRequireAuth={() => navigate({ to: "/auth" })} />
          <p className="px-1 text-[12px] leading-relaxed text-muted-foreground">
            Vaginal pH entries sync to your Genesyx account · Values 3.5–7.0 accepted; anything outside is rejected ·
            Optimal 3.5–4.5, Elevated 4.6–5.5, High 5.6–6.0, above 6.0 prompts a retest. Genesyx tracks trends and
            does not diagnose.
          </p>

        </div>
      </main>
    </div>
  );
}
