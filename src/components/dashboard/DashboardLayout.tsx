import { Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { HeaderNavbar } from "./HeaderNavbar";
import { SidebarNav } from "./SidebarNav";
import { useAuth } from "@/context/AuthContext";
import { HOME_ROUTE } from "@/config/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import type { Role } from "@/types/dashboard";

export function DashboardLayout({ role }: { role: Role }) {
  const { user, ready } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!ready) return;
    if (!user) navigate({ to: "/login" });
    else if (user.role !== role) navigate({ to: HOME_ROUTE[user.role] });
  }, [ready, user, role, navigate]);

  if (!ready || !user || user.role !== role) {
    return (
      <div className="min-h-screen space-y-4 p-8">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-sidebar-border lg:block">
        <SidebarNav role={role} />
      </aside>
      <div className="lg:pl-64">
        <HeaderNavbar role={role} />
        <main className="hero-gradient min-h-[calc(100vh-4rem)] p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
