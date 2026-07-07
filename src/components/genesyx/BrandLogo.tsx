import { cn } from "@/lib/utils";
import logoUrl from "@/assets/genesyx-logo.svg";
import logoRaw from "@/assets/genesyx-logo.svg?raw";

type BrandLogoProps = {
  className?: string;
  /** Rendered pixel size (height). Defaults to 28. */
  size?: number;
  /**
   * - "full": brandmark icon + GENESYX wordmark (primary logo)
   * - "mark": brandmark icon only (rounded gradient tile with G)
   * - "wordmark": word "GENESYX" only
   */
  variant?: "full" | "mark" | "wordmark";
  /** Wordmark ink color. Defaults to currentColor so parent controls it. */
  inkColor?: string;
};

// The uploaded SVG has viewBox "0 0 572.82 209.59".
// The brandmark tile occupies (54.64, 54.88) → (154.46, 154.70) — a 99.82² square.
// The wordmark "ENESYX" starts at ~x=210 and runs to the right edge.
const MARK_VIEWBOX = "54.64 54.88 99.82 99.82";
const WORDMARK_VIEWBOX = "154 40 419 130";

function inline(svg: string, viewBox: string, inkColor?: string) {
  let out = svg.replace(/viewBox="[^"]*"/, `viewBox="${viewBox}"`);
  // Strip fixed width/height so the SVG scales with our wrapper
  out = out.replace(/\s(width|height)="[^"]*"/g, "");
  if (inkColor) {
    // Recolor any pure black wordmark fills to the requested ink color.
    out = out.replace(/fill="#000000"/gi, `fill="${inkColor}"`);
    out = out.replace(/fill="#000"/gi, `fill="${inkColor}"`);
  }
  return out;
}

export function BrandLogo({ className, size = 28, variant = "full", inkColor }: BrandLogoProps) {
  if (variant === "full") {
    // Use the raw <img> — it preserves the intended gradient + black wordmark.
    return (
      <img
        src={logoUrl}
        alt="Genesyx"
        style={{ height: size, width: "auto" }}
        className={cn("select-none object-contain dark:invert", className)}
        draggable={false}
      />
    );
  }
  const vb = variant === "mark" ? MARK_VIEWBOX : WORDMARK_VIEWBOX;
  const html = inline(logoRaw, vb, variant === "wordmark" ? inkColor : undefined);
  const isWord = variant === "wordmark";
  return (
    <span
      role="img"
      aria-label="Genesyx"
      className={cn(
        "inline-flex shrink-0 items-center justify-center",
        isWord && "dark:[&_svg_*]:!fill-current",
        className,
      )}
      style={
        isWord
          ? { height: size, width: "auto", color: inkColor ?? "currentColor" }
          : { height: size, width: size }
      }
      // eslint-disable-next-line react/no-danger-with-children
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function BrandOrb({ className }: { className?: string }) {
  return <div className={cn("gx-orb rounded-full", className)} aria-hidden />;
}
