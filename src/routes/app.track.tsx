import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { TrackScreen } from "@/components/genesyx/screens/Track";

export const Route = createFileRoute("/app/track")({
  head: () => ({
    meta: [
      { title: "Cycle · Genesyx" },
      { name: "description", content: "Track your cycle, phases, and vaginal pH." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TrackPage,
});

function TrackPage() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-svh flex-col">
      <DashboardHeader title="Cycle" subtitle="Calendar, phases, and vaginal pH tracking" />
      <main className="flex-1 px-4 py-5 lg:px-6">
        <div className="mx-auto w-full max-w-[1100px]">
          <TrackScreen
            onLog={() => navigate({ to: "/app/log" })}
            onRequireAuth={() => navigate({ to: "/auth" })}
          />
        </div>
      </main>
    </div>
  );
}
