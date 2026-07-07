import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { InsightsScreen } from "@/components/genesyx/screens/Insights";

export const Route = createFileRoute("/app/insights")({
  head: () => ({
    meta: [
      { title: "Insights · Genesyx" },
      { name: "description", content: "Trends across hydration, symptoms, and pH." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: InsightsPage,
});

function InsightsPage() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-svh flex-col">
      <DashboardHeader title="Insights" subtitle="Trends from your last 30 days" />
      <main className="flex-1 px-4 py-5 lg:px-6">
        <div className="mx-auto w-full max-w-[1100px]">
          <InsightsScreen onOpenTracker={() => navigate({ to: "/app/track" })} />
        </div>
      </main>
    </div>
  );
}
