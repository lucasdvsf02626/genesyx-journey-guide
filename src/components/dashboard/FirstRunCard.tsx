import { CalendarPlus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Shown only while cycle setup is missing. Parent hides it permanently
 * once settings exist.
 */
export function FirstRunCard({ onSetup }: { onSetup: () => void }) {
  return (
    <div className="dash-panel p-5 border-primary/30 bg-primary/[0.03]">
      <div className="flex items-start gap-4">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <CalendarPlus className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-[16px] font-semibold tracking-tight">Welcome to Genesyx</p>
          <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
            Set up your cycle so your phase, fertile window (estimated) and phase-aware guidance can appear here.
          </p>
          <Button onClick={onSetup} className="mt-3">
            Set up your cycle <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
