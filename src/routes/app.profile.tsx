import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ProfileScreen } from "@/components/genesyx/screens/Profile";

export const Route = createFileRoute("/app/profile")({
  head: () => ({
    meta: [
      { title: "Profile · Genesyx" },
      { name: "description", content: "Account, preferences, and partner." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-svh flex-col">
      <DashboardHeader title="Profile" subtitle="Account, preferences, and partner" />
      <main className="flex-1 px-4 py-5 lg:px-6">
        <div className="mx-auto w-full max-w-[900px]">
          <ProfileScreen onSignIn={() => navigate({ to: "/auth" })} />
        </div>
      </main>
    </div>
  );
}
