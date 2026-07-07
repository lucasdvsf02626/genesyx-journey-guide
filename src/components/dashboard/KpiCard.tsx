import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function KpiCard({
  label,
  value,
  unit,
  hint,
  icon: Icon,
  accent,
  className,
}: {
  label: string;
  value: React.ReactNode;
  unit?: string;
  hint?: string;
  icon?: LucideIcon;
  accent?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("dash-panel p-4", className)}>
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </p>
        {Icon && (
          <span
            className={cn(
              "grid h-7 w-7 place-items-center rounded-md",
              accent ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="tabular text-2xl font-semibold leading-none">{value}</span>
        {unit && <span className="text-[12.5px] text-muted-foreground">{unit}</span>}
      </div>
      {hint && <p className="mt-1.5 text-[12px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
