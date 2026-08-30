import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { BookOpenText, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/dashboard/ui-kit";
import { useAuth } from "@/context/AuthContext";
import { useDashboard } from "@/context/DashboardContext";
import { HOME_ROUTE } from "@/config/navigation";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Quran Academy Portal" },
      { name: "description", content: "Sign in to the admin, teacher or student Quran Academy portal." },
      { property: "og:title", content: "Sign in — Quran Academy Portal" },
      { property: "og:description", content: "Access your Quran Academy dashboard." },
    ],
  }),
  component: LoginPage,
});

const DEMO = [
  { label: "Admin", email: "admin@quranacademy.com", password: "admin123" },
  { label: "Teacher", email: "teacher@quranacademy.com", password: "teacher123" },
  { label: "Student", email: "student@quranacademy.com", password: "student123" },
];

function LoginPage() {
  const { login, user, ready } = useAuth();
  const { settings } = useDashboard();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && user) navigate({ to: HOME_ROUTE[user.role] });
  }, [ready, user, navigate]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);
    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }
    setBusy(true);
    const res = login(email, password);
    setBusy(false);
    if (!res.ok || !res.user) {
      setError(res.error);
      return;
    }
    toast.success(`Welcome back, ${res.user.name}`);
    navigate({ to: HOME_ROUTE[res.user.role] });
  };

  return (
    <div className="hero-gradient flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 flex items-center justify-center gap-3">
          <div className="brand-gradient flex size-11 items-center justify-center rounded-xl">
            <BookOpenText className="size-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold">{settings.name}</span>
        </Link>

        <div className="app-card p-6">
          <h1 className="text-xl font-semibold tracking-tight">Sign in to your portal</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your role decides which dashboard you land on.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@quranacademy.com"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1.5"
              />
            </div>
            <FieldError message={error} />
            <Button type="submit" className="w-full" disabled={busy}>
              {busy && <Loader2 className="mr-2 size-4 animate-spin" />} Sign in
            </Button>
          </form>

          <div className="mt-6 border-t border-border pt-4">
            <p className="text-xs font-medium text-muted-foreground">Demo accounts</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {DEMO.map((d) => (
                <Button
                  key={d.label}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEmail(d.email);
                    setPassword(d.password);
                  }}
                >
                  {d.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
