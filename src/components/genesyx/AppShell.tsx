import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";

interface AppShellProps {
  children: React.ReactNode;
  showTabBar?: boolean;
  tabBar?: React.ReactNode;
  bgClassName?: string;
  showThemeToggle?: boolean;
}

/**
 * Desktop-first page shell. Full-width background with a centered content
 * column sized for readable web content — no phone frame.
 */
export function AppShell({ children, tabBar, bgClassName, showThemeToggle }: AppShellProps) {
  return (
    <div className={cn("relative min-h-screen w-full bg-background", bgClassName)}>
      {showThemeToggle && (
        <div className="absolute right-6 top-6 z-50">
          <ThemeToggle />
        </div>
      )}

      <div className="mx-auto w-full max-w-[1100px] px-6 py-10 md:px-10 md:py-14">
        {children}
      </div>

      {tabBar}
    </div>
  );
}
