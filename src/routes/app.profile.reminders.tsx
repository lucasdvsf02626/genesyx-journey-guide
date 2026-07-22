import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Panel } from "@/components/dashboard/Panel";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bell, Loader2 } from "lucide-react";
import { getReminderPrefs, setReminderPrefs, type ReminderPrefsDTO } from "@/lib/reminders.functions";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/app/profile/reminders")({
  head: () => ({
    meta: [
      { title: "Reminders · Genesyx" },
      { name: "description", content: "Opt in to gentle email reminders on your terms." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RemindersPage,
});

function RemindersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const getFn = useServerFn(getReminderPrefs);
  const setFn = useServerFn(setReminderPrefs);
  const [prefs, setPrefs] = useState<ReminderPrefsDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    let cancelled = false;
    getFn().then((p) => { if (!cancelled) setPrefs(p); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user, getFn]);

  const update = <K extends keyof ReminderPrefsDTO>(k: K, v: ReminderPrefsDTO[K]) => {
    if (!prefs) return;
    setPrefs({ ...prefs, [k]: v });
  };

  const onSave = async () => {
    if (!prefs) return;
    setSaving(true);
    try {
      const next = await setFn({ data: {
        dailyLogEnabled: prefs.dailyLogEnabled,
        weeklyDigestEnabled: prefs.weeklyDigestEnabled,
        quietStart: prefs.quietStart,
        quietEnd: prefs.quietEnd,
        timezone: prefs.timezone,
      }});
      setPrefs(next);
      toast.success("Reminder preferences saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save preferences");
    } finally { setSaving(false); }
  };

  if (!user) {
    return (
      <div className="flex min-h-svh flex-col">
        <DashboardHeader title="Reminders" />
        <main className="flex-1 px-4 py-5 lg:px-6">
          <div className="mx-auto w-full max-w-[800px]">
            <Panel title="Sign in to set reminders">
              <Button onClick={() => navigate({ to: "/auth" })}>Sign in</Button>
            </Panel>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh flex-col">
      <DashboardHeader title="Reminders" subtitle="Gentle, opt-in, and revocable" />
      <main className="flex-1 px-4 py-5 lg:px-6">
        <div className="mx-auto w-full max-w-[800px] space-y-5">
          <Panel title="Email reminders" description="You choose what we send. Nothing is sent unless you opt in.">
            {loading || !prefs ? (
              <p className="text-[13px] text-muted-foreground">Loading…</p>
            ) : (
              <div className="space-y-5">
                <ToggleRow
                  title="Daily log nudge"
                  description="A short evening reminder to add today's log."
                  checked={prefs.dailyLogEnabled}
                  onChange={(v) => update("dailyLogEnabled", v)}
                />
                <ToggleRow
                  title="Weekly insights digest"
                  description="A Monday morning summary of the past week's trends."
                  checked={prefs.weeklyDigestEnabled}
                  onChange={(v) => update("weeklyDigestEnabled", v)}
                />

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="qs">Quiet hours from</Label>
                    <Input id="qs" type="time" value={prefs.quietStart} onChange={(e) => update("quietStart", e.target.value || "22:00")} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="qe">Quiet hours until</Label>
                    <Input id="qe" type="time" value={prefs.quietEnd} onChange={(e) => update("quietEnd", e.target.value || "08:00")} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="tz">Timezone</Label>
                    <Input id="tz" value={prefs.timezone} onChange={(e) => update("timezone", e.target.value)} placeholder="Europe/London" />
                  </div>
                </div>

                <div className="rounded-xl border border-dashed border-border p-3 text-[12.5px] text-muted-foreground">
                  <Bell className="mr-1 inline h-3.5 w-3.5" />
                  Turning either reminder on records your consent to receive that specific email. You can turn it off any time and we will stop.
                </div>

                <div className="flex items-center justify-between">
                  <Button variant="ghost" asChild>
                    <Link to="/app/profile">Back to profile</Link>
                  </Button>
                  <Button onClick={onSave} disabled={saving}>
                    {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save preferences
                  </Button>
                </div>

                <p className="text-[11.5px] text-muted-foreground">
                  Email delivery is not yet connected. Your preferences save now; sending is behind a
                  stubbed function until an email provider is configured. We won't claim an email was
                  sent when it wasn't.
                </p>
              </div>
            )}
          </Panel>
        </div>
      </main>
    </div>
  );
}

function ToggleRow({ title, description, checked, onChange }: {
  title: string; description: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-border p-3">
      <div className="min-w-0">
        <p className="font-display text-[14px] font-semibold">{title}</p>
        <p className="mt-0.5 text-[12.5px] text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
