import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { FieldError } from "@/components/dashboard/ui-kit";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { localTimezone } from "@/lib/time";

export function ProfileForm({ extra }: { extra?: ReactNode }) {
  const { user, updateProfile, changePassword } = useAuth();
  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    country: user?.country ?? "",
    timezone: user?.timezone ?? localTimezone(),
    avatarUrl: user?.avatarUrl ?? "",
  });
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!user) return null;

  const saveProfile = () => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Name is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Enter a valid email address.";
    setErrors(next);
    if (Object.keys(next).length) return;
    updateProfile({ ...form, name: form.name.trim(), email: form.email.trim() });
    toast.success("Profile updated");
  };

  const savePassword = () => {
    if (pw.next !== pw.confirm) {
      setErrors({ confirm: "Passwords do not match." });
      return;
    }
    const res = changePassword(pw.current, pw.next);
    if (!res.ok) {
      setErrors({ current: res.error ?? "Could not change password." });
      return;
    }
    setErrors({});
    setPw({ current: "", next: "", confirm: "" });
    toast.success("Password changed");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <section className="app-card p-6 lg:col-span-2">
        <h2 className="text-base font-semibold">Personal details</h2>
        <div className="mt-5 flex items-center gap-4">
          <Avatar className="size-16">
            <AvatarImage src={form.avatarUrl} alt={form.name} />
            <AvatarFallback>{form.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Label htmlFor="avatar">Avatar URL</Label>
            <Input
              id="avatar"
              value={form.avatarUrl}
              onChange={(e) => setForm((f) => ({ ...f, avatarUrl: e.target.value }))}
              placeholder="https://…"
            />
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            <FieldError message={errors.name} />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
            <FieldError message={errors.email} />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={form.country}
              onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="tz">Timezone</Label>
            <div className="flex gap-2">
              <Input
                id="tz"
                value={form.timezone}
                onChange={(e) => setForm((f) => ({ ...f, timezone: e.target.value }))}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setForm((f) => ({ ...f, timezone: localTimezone() }))}
              >
                Detect
              </Button>
            </div>
          </div>
        </div>

        {extra}

        <div className="mt-6">
          <Button onClick={saveProfile}>Save changes</Button>
        </div>
      </section>

      <section className="app-card h-fit p-6">
        <h2 className="text-base font-semibold">Change password</h2>
        <div className="mt-5 space-y-4">
          <div>
            <Label htmlFor="cur">Current password</Label>
            <Input
              id="cur"
              type="password"
              value={pw.current}
              onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))}
            />
            <FieldError message={errors.current} />
          </div>
          <div>
            <Label htmlFor="new">New password</Label>
            <Input
              id="new"
              type="password"
              value={pw.next}
              onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="conf">Confirm new password</Label>
            <Input
              id="conf"
              type="password"
              value={pw.confirm}
              onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))}
            />
            <FieldError message={errors.confirm} />
          </div>
          <Button variant="outline" onClick={savePassword} className="w-full">
            Update password
          </Button>
        </div>
      </section>
    </div>
  );
}
