import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpenText } from "lucide-react";
import { NAVIGATION } from "@/config/navigation";
import { useDashboard } from "@/context/DashboardContext";
import type { Role } from "@/types/dashboard";
import { cn } from "@/lib/utils";

export function SidebarNav({ role, onNavigate }: { role: Role; onNavigate?: () => void }) {
  const { settings } = useDashboard();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const items = NAVIGATION[role];

  return (
    <div className="flex h-full flex-col bg-sidebar">
      <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-4">
        <div className="brand-gradient flex size-10 shrink-0 items-center justify-center rounded-xl">
          <BookOpenText className="size-5 text-primary-foreground" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-sidebar-foreground">{settings.name}</p>
          <p className="truncate text-xs capitalize text-muted-foreground">{role} portal</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {items.map((item) => {
          const active = pathname === item.to;
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
              )}
            >
              <Icon className={cn("size-4.5 shrink-0", active && "text-primary")} />
              <span className="truncate">{item.label}</span>
              {active && <span className="ml-auto size-1.5 rounded-full bg-primary" />}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4 text-xs text-muted-foreground">
        <p className="font-medium text-sidebar-foreground">{settings.tagline}</p>
        <p className="mt-1">v1.0 · mock data mode</p>
      </div>
    </div>
  );
}
