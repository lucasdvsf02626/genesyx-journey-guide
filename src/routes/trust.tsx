import { createFileRoute, Link } from "@tanstack/react-router";
import { BrandLogo } from "@/components/genesyx/BrandLogo";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  Lock,
  Database,
  KeyRound,
  Trash2,
  UserCog,
  Stethoscope,
  Mail,
  ChevronRight,
  Sparkles,
  EyeOff,
} from "lucide-react";

export const Route = createFileRoute("/trust")({
  head: () => ({
    meta: [
      { title: "Trust & privacy — Genesyx" },
      {
        name: "description",
        content:
          "How Genesyx handles your data: encryption in transit and at rest, what we collect, the controls you have in your profile, and our health-scope disclaimer.",
      },
      { property: "og:title", content: "Trust & privacy — Genesyx" },
      {
        property: "og:description",
        content:
          "Encryption, privacy, account controls, and health-scope — in plain English.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TrustPage,
});

function TrustPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Hero */}
      <section className="mx-auto w-full max-w-[1200px] px-8 pt-16 pb-12">
        <p className="font-display text-[12px] font-semibold uppercase tracking-[0.24em] text-primary">
          Trust
        </p>
        <h1 className="mt-4 max-w-[24ch] font-display text-[48px] font-semibold leading-[1.05] tracking-tight md:text-[60px]">
          Your journey is personal. So is your data.
        </h1>
        <p className="mt-6 max-w-[62ch] text-[17px] leading-relaxed text-muted-foreground">
          This page is maintained by the Genesyx team to answer common
          questions about how we handle your information. It reflects the
          controls the app enforces today and the platform capabilities
          available on our hosting stack. It is not an independent
          certification.
        </p>
        <div className="mt-3 rounded-xl border border-border bg-muted/40 p-4 text-[13px] text-muted-foreground">
          Shared responsibility: Genesyx configures the app-level controls
          described here. The underlying platform (Lovable Cloud) provides
          hosting, database, and authentication infrastructure. You control
          the data you enter and the account settings on your profile.
        </div>
      </section>

      {/* Quick facts */}
      <section className="mx-auto w-full max-w-[1200px] px-8 pb-14">
        <h2 className="sr-only">Quick facts</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

          {QUICK.map(({ Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-[17px] font-semibold">
                {title}
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Security */}
      <Panel
        id="security"
        eyebrow="Security"
        title="Encryption in transit and at rest"
        Icon={Lock}
      >
        <p>
          All connections between your browser and Genesyx use HTTPS with
          modern TLS. Data written to the database is encrypted at rest by
          our hosting platform's managed storage.
        </p>
        <ul className="mt-4 space-y-2 text-[14px] text-muted-foreground">
          <li className="flex gap-2">
            <Dot /> Sessions are stored as HTTP-only, first-party auth tokens
            issued by the platform's auth service.
          </li>
          <li className="flex gap-2">
            <Dot /> Row-level security policies enforce that you can only
            read and write your own records.
          </li>
          <li className="flex gap-2">
            <Dot /> Passwords are never stored in the app database; they are
            hashed and managed by the platform's auth service.
          </li>
        </ul>
      </Panel>

      {/* Privacy */}
      <Panel
        id="privacy"
        eyebrow="Privacy"
        title="What we collect — and what we don't"
        Icon={EyeOff}
      >
        <p>
          We collect only what the app needs to give you personalised
          guidance. Every field you see in the app corresponds to something
          you chose to enter.
        </p>
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-background/60 p-4">
            <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-primary">
              We do collect
            </p>
            <ul className="mt-3 space-y-2 text-[14px] text-muted-foreground">
              <li className="flex gap-2"><Dot /> Account: email and display name.</li>
              <li className="flex gap-2"><Dot /> Quiz answers you submit.</li>
              <li className="flex gap-2"><Dot /> Daily log entries: cycle, pH, hydration, mood.</li>
              <li className="flex gap-2"><Dot /> Partner invites you send from your profile.</li>
            </ul>
          </div>
          <div className="rounded-xl border border-border bg-background/60 p-4">
            <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-primary">
              We don't
            </p>
            <ul className="mt-3 space-y-2 text-[14px] text-muted-foreground">
              <li className="flex gap-2"><Dot /> Sell your data. Ever.</li>
              <li className="flex gap-2"><Dot /> Share your logs with your partner unless you invite them.</li>
              <li className="flex gap-2"><Dot /> Use your health data to train third-party models.</li>
              <li className="flex gap-2"><Dot /> Show ads inside the app.</li>
            </ul>
          </div>
        </div>
        <p className="mt-5">
          The full{" "}
          <Link to="/privacy" className="font-medium text-primary hover:underline">
            Privacy Policy
          </Link>{" "}
          covers the details.
        </p>
      </Panel>

      {/* Account controls */}
      <Panel
        id="controls"
        eyebrow="Your controls"
        title="You're in charge of your account"
        Icon={UserCog}
      >
        <p>
          Every control below is available from your Profile page once you're
          signed in.
        </p>
        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
          {CONTROLS.map(({ Icon, title, desc }) => (
            <div
              key={title}
              className="flex gap-3 rounded-xl border border-border bg-background/60 p-4"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="font-display text-[15px] font-semibold">{title}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* Health scope */}
      <Panel
        id="health"
        eyebrow="Health scope"
        title="Educational — not medical advice"
        Icon={Stethoscope}
      >
        <p>
          Genesyx is a wellness and education tool. It does not diagnose,
          treat, cure, or prevent any medical condition. Insights are
          observational and intended to help you have better-informed
          conversations with a qualified healthcare professional.
        </p>
        <ul className="mt-4 space-y-2 text-[14px] text-muted-foreground">
          <li className="flex gap-2"><Dot /> Always consult a clinician for medical decisions.</li>
          <li className="flex gap-2"><Dot /> Stop use and seek care if you notice unusual symptoms.</li>
          <li className="flex gap-2"><Dot /> Our{" "}
            <Link to="/health-disclaimer" className="font-medium text-primary hover:underline">
              Health Disclaimer
            </Link>{" "}
            has the full text.
          </li>
        </ul>
      </Panel>

      {/* Contact */}
      <section className="mx-auto w-full max-w-[1200px] px-8 pb-24">
        <div className="rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-[52ch]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Mail className="h-5 w-5" />
              </div>
              <h2 className="mt-5 font-display text-[24px] font-semibold">
                Questions about your data?
              </h2>

              <p className="mt-2 text-[15px] text-muted-foreground">
                Reach the Genesyx team via our support page and we'll get back
                to you.
              </p>
            </div>
            <Link to="/support">
              <Button className="h-11 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                Contact support
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

const QUICK = [
  {
    Icon: ShieldCheck,
    title: "HTTPS everywhere",
    desc: "Modern TLS on every request between your device and Genesyx.",
  },
  {
    Icon: Database,
    title: "Encrypted at rest",
    desc: "Managed database storage encrypts your data on disk.",
  },
  {
    Icon: KeyRound,
    title: "Row-level access",
    desc: "Database policies ensure only you can read your own records.",
  },
] as const;

const CONTROLS = [
  {
    Icon: KeyRound,
    title: "Change your password",
    desc: "Update credentials any time from Profile → Account.",
  },
  {
    Icon: UserCog,
    title: "Edit your profile",
    desc: "Change your display name and preferences whenever you like.",
  },
  {
    Icon: Trash2,
    title: "Delete your account",
    desc: "Request account and data deletion from support — we honour it.",
  },
  {
    Icon: EyeOff,
    title: "Control partner sharing",
    desc: "Nothing is shared until you invite a partner from your profile.",
  },
] as const;

function Panel({
  id,
  eyebrow,
  title,
  Icon,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  Icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="border-t border-border/60">
      <div className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-10 px-8 py-14 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
        <div>
          <p className="font-display text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
            {eyebrow}
          </p>
          <h2 className="mt-3 flex items-center gap-3 font-display text-[26px] font-semibold leading-tight tracking-tight md:text-[30px]">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </span>
            {title}
          </h2>
        </div>
        <div className="text-[15px] leading-relaxed text-muted-foreground">
          {children}
        </div>
      </div>
    </section>
  );
}

function Dot() {
  return <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />;
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-8 py-4">
        <Link to="/" className="flex items-center">
          <BrandLogo size={30} />
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <Link
            to="/approach"
            className="hover:text-foreground"
            activeProps={{ className: "text-foreground font-medium" }}
          >
            Approach
          </Link>
          <Link
            to="/trust"
            className="hover:text-foreground"
            activeProps={{ className: "text-foreground font-medium" }}
          >
            Trust
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/auth"
            className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-muted hover:text-foreground"
          >
            Sign in
          </Link>
          <Link to="/">
            <Button className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
              <Sparkles className="mr-1 h-4 w-4" />
              Start free
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card/30">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col items-start justify-between gap-6 px-8 py-10 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <BrandLogo size={22} />
          <span className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Genesyx. Educational — not medical advice.
          </span>
        </div>
        <nav className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
          <Link to="/approach" className="hover:text-foreground">Approach</Link>
          <Link to="/trust" className="hover:text-foreground">Trust</Link>
          <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
          <Link to="/terms" className="hover:text-foreground">Terms</Link>
          <Link to="/health-disclaimer" className="hover:text-foreground">Health disclaimer</Link>
          <Link to="/support" className="hover:text-foreground">Support</Link>
        </nav>
      </div>
    </footer>
  );
}
