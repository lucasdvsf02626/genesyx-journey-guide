import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/app/track")({
  head: () => ({
    meta: [
      { title: "Trackers · Genesyx" },
      { name: "description", content: "Your cycle, hydration, vaginal pH, sleep, symptoms, and nutrition trackers." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <Outlet />,
});
