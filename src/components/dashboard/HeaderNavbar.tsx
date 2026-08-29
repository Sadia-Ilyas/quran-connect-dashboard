import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Bell, Globe, LogOut, Menu, Moon, Sun, User as UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SidebarNav } from "./SidebarNav";
import { useAuth } from "@/context/AuthContext";
import { useDashboard } from "@/context/DashboardContext";
import { localTimezone } from "@/lib/time";
import type { Role } from "@/types/dashboard";

const LABELS: Record<string, string> = {
  admin: "Admin",
  teacher: "Teacher",
  student: "Student",
  dashboard: "Overview",
  "trial-requests": "Trial Requests",
  "contact-inquiries": "Contact Inquiries",
  students: "Students",
  teachers: "Teachers",
  courses: "Courses",
  content: "Content & FAQs",
  settings: "Settings",
  schedule: "Schedule",
  logs: "Class Logs",
  profile: "Profile",
  teacher_: "My Teacher",
};

function useClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

export function HeaderNavbar({ role }: { role: Role }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, logout } = useAuth();
  const { trialRequests, inquiries } = useDashboard();
  const navigate = useNavigate();
  const now = useClock();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(true);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("qa.theme", next ? "dark" : "light");
  };

  const crumbs = pathname.split("/").filter(Boolean);
  const tz = now ? localTimezone() : "";
  const notifications =
    role === "admin"
      ? trialRequests.filter((t) => t.status === "New").length +
        inquiries.filter((i) => i.status === "Pending").length
      : 2;

  const initials = (user?.name ?? "U")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-md lg:px-6">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarNav role={role} onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
        <ol className="flex items-center gap-1.5 text-sm">
          {crumbs.map((c, i) => (
            <li key={c + i} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-muted-foreground">/</span>}
              <span
                className={
                  i === crumbs.length - 1
                    ? "truncate font-semibold text-foreground"
                    : "truncate text-muted-foreground"
                }
              >
                {LABELS[c] ?? c.replace(/-/g, " ")}
              </span>
            </li>
          ))}
        </ol>
      </nav>

      <div className="hidden items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground md:flex">
        <Globe className="size-3.5 text-primary" />
        <span className="font-medium text-foreground">{tz || "—"}</span>
        <span className="tabular-nums">
          {now ? now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }) : "--:--"}
        </span>
      </div>

      <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
        {dark ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
      </Button>

      <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
        <Bell className="size-4.5" />
        {notifications > 0 && (
          <Badge className="absolute -right-0.5 -top-0.5 size-4.5 justify-center rounded-full p-0 text-[10px]">
            {notifications}
          </Badge>
        )}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-lg px-1.5 py-1 transition-colors hover:bg-secondary">
            <Avatar className="size-8">
              <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden text-left sm:block">
              <p className="max-w-32 truncate text-sm font-medium leading-tight">{user?.name}</p>
              <p className="text-xs capitalize leading-tight text-muted-foreground">{role}</p>
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="truncate text-xs font-normal text-muted-foreground">{user?.email}</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to={role === "admin" ? "/admin/settings" : `/${role}/profile`}>
              <UserIcon className="mr-2 size-4" /> Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              logout();
              navigate({ to: "/login" });
            }}
          >
            <LogOut className="mr-2 size-4" /> Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
