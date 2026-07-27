import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/genesyx/AppShell";
import { LegalLayout } from "./privacy";

const FAQ = [
  {
    q: "I didn't get my confirmation email.",
    a: "Check your spam folder, then use the \"Resend\" link on the sign-in screen.",
  },
  {
    q: "I forgot my password.",
    a: "On the sign-in screen tap \"Forgot password?\" — we'll email you a reset link. The reset link opens in your browser.",
  },
  {
    q: "How do I delete my account?",
    a: "Open Profile → Delete account. This permanently removes your data.",
  },
];

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: "Support — Genesyx" },
      { name: "description", content: "Get help with your Genesyx account or report an issue." },
      { property: "og:title", content: "Genesyx Support — get help with your account" },
      {
        property: "og:description",
        content: "Answers to common Genesyx questions about confirmation emails, password resets and deleting your account.",
      },
      { property: "og:url", content: "https://dashboard.genesyx.co.uk/support" },
    ],
    links: [{ rel: "canonical", href: "https://dashboard.genesyx.co.uk/support" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ.map(({ q, a }) => ({
            "@type": "Question",
            name: q,
            acceptedAnswer: { "@type": "Answer", text: a },
          })),
        }),
      },
    ],
  }),
  component: SupportPage,
});


function SupportPage() {
  return (
    <AppShell>
      <LegalLayout title="Support" updated="June 2026">
        <p>We're a small team and we read every message. Here's how to get help.</p>
        <h2>Contact us</h2>
        <p>
          Email{" "}
          <a href="mailto:support@genesyx.app">support@genesyx.app</a> and tell us:
        </p>
        <ul>
          <li>The email address tied to your Genesyx account.</li>
          <li>What you were trying to do.</li>
          <li>What happened instead.</li>
          <li>A screenshot if you can.</li>
        </ul>
        <h2>Common questions</h2>
        <p>
          <strong>I didn't get my confirmation email.</strong> Check your spam folder, then use the "Resend"
          link on the sign-in screen.
        </p>
        <p>
          <strong>I forgot my password.</strong> On the sign-in screen tap "Forgot password?" — we'll email
          you a reset link. The reset link opens in your browser.
        </p>
        <p>
          <strong>How do I delete my account?</strong> Open Profile → Delete account. This permanently removes
          your data.
        </p>
        <h2>Privacy and terms</h2>
        <p>
          <Link to="/privacy">Privacy policy</Link> · <Link to="/terms">Terms of service</Link> ·{" "}
          <Link to="/health-disclaimer">Health disclaimer</Link>
        </p>
      </LegalLayout>
    </AppShell>
  );
}
