import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/app/profile")({
  head: () => ({
    meta: [
      { title: "Profile · Genesyx" },
      { name: "description", content: "Your account, preferences, and reminders." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <Outlet />,
});
