import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  CalendarDays,
  Apple,
  LineChart,
  UserRound,
  PenSquare,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { BrandLogo } from "@/components/genesyx/BrandLogo";


type NavItem = { title: string; url: string; icon: typeof LayoutDashboard; exact?: boolean };
const nav: NavItem[] = [
  { title: "Overview", url: "/app", icon: LayoutDashboard, exact: true },
  { title: "Cycle", url: "/app/track", icon: CalendarDays },
  { title: "Nutrition", url: "/app/nutrition", icon: Apple },
  { title: "Insights", url: "/app/insights", icon: LineChart },
  { title: "Daily log", url: "/app/log", icon: PenSquare },
  { title: "Profile", url: "/app/profile", icon: UserRound },
];


export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useAuth();
  const email = user?.email ?? "Guest session";
  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ??
    (user?.user_metadata?.display_name as string | undefined) ??
    user?.email?.split("@")[0] ??
    "Guest";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/app" className="flex items-center gap-2 px-1 py-1.5">
          <BrandLogo variant="mark" size={28} className="shrink-0" />
          <span className="min-w-0 truncate font-display text-[15px] font-bold tracking-tight group-data-[collapsible=icon]:hidden">
            <BrandLogo variant="wordmark" size={16} />
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.map((item) => {
                const active = item.exact
                  ? pathname === item.url
                  : pathname === item.url || pathname.startsWith(item.url + "/");
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <div className="flex items-center gap-2.5 px-1.5 py-1.5">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-muted text-[12px] font-semibold">
            {displayName.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-[12.5px] font-medium leading-tight">{displayName}</p>
            <p className="truncate text-[11px] text-muted-foreground">{email}</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
