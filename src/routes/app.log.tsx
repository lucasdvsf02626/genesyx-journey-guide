import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { LogScreen } from "@/components/genesyx/screens/Log";

export const Route = createFileRoute("/app/log")({
  head: () => ({
    meta: [
      { title: "Daily log · Genesyx" },
      { name: "description", content: "Log today's mood, energy, hydration, and symptoms." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LogPage,
});

function LogPage() {
  const navigate = useNavigate();
  const close = () => navigate({ to: "/app" });
  return (
    <div className="flex min-h-svh flex-col">
      <DashboardHeader title="Daily log" subtitle="Today's mood, hydration, symptoms" />
      <main className="flex-1 px-4 py-5 lg:px-6">
        <div className="mx-auto w-full max-w-[900px]">
          <LogScreen onClose={close} onRequireAuth={() => navigate({ to: "/auth" })} />
        </div>
      </main>
    </div>
  );
}
