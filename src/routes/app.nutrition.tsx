import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { NutritionScreen } from "@/components/genesyx/screens/Nutrition";

export const Route = createFileRoute("/app/nutrition")({
  head: () => ({
    meta: [
      { title: "Nutrition · Genesyx" },
      { name: "description", content: "Phase-aware food and hydration guidance." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: NutritionPage,
});

function NutritionPage() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-svh flex-col">
      <DashboardHeader title="Nutrition" subtitle="Phase-aware foods and hydration" />
      <main className="flex-1 px-4 py-5 lg:px-6">
        <div className="mx-auto w-full max-w-[1100px]">
          <NutritionScreen onRequireAuth={() => navigate({ to: "/auth" })} />
        </div>
      </main>
    </div>
  );
}
