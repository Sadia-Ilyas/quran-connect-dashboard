import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { FieldError, PageHeader } from "@/components/dashboard/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { useDashboard } from "@/context/DashboardContext";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({
    meta: [
      { title: "Academy Settings — Quran Academy Portal" },
      { name: "description", content: "Update academy contact details, branding and admin credentials." },
      { property: "og:title", content: "Academy Settings — Quran Academy Portal" },
      { property: "og:description", content: "Contact details, branding and admin account security." },
    ],
  }),
  component: AdminSettings,
});

function AdminSettings() {
  const { settings, updateSettings } = useDashboard();
  const { user, changePassword } = useAuth();
  const [form, setForm] = useState(settings);
  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const save = () => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Academy name is required";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Valid email required";
    setErrors(next);
    if (Object.keys(next).length) return;
    updateSettings(form);
    toast.success("Academy settings saved");
  };

  const savePassword = () => {
    if (pwd.next.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (pwd.next !== pwd.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    const res = changePassword(pwd.current, pwd.next);
    if (!res.ok) {
      toast.error(res.error ?? "Could not update password");
      return;
    }
    setPwd({ current: "", next: "", confirm: "" });
    toast.success("Password updated");
  };

  return (
    <div className="max-w-4xl">
      <PageHeader title="Academy settings" description="Branding, contact channels and account security." />

      <section className="app-card p-6">
        <h2 className="font-semibold">Academy profile</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="a-name">Academy name</Label>
            <Input id="a-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <FieldError message={errors.name} />
          </div>
          <div>
            <Label htmlFor="a-tag">Tagline</Label>
            <Input id="a-tag" value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="a-email">Email</Label>
            <Input id="a-email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <FieldError message={errors.email} />
          </div>
          <div>
            <Label htmlFor="a-wa">WhatsApp</Label>
            <Input id="a-wa" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="a-phone">Phone</Label>
            <Input id="a-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="a-logo">Logo URL</Label>
            <Input id="a-logo" value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="a-addr">Address</Label>
            <Textarea
              id="a-addr"
              rows={2}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="a-fb">Facebook</Label>
            <Input id="a-fb" value={form.facebook} onChange={(e) => setForm({ ...form, facebook: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="a-ig">Instagram</Label>
            <Input id="a-ig" value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="a-yt">YouTube</Label>
            <Input id="a-yt" value={form.youtube} onChange={(e) => setForm({ ...form, youtube: e.target.value })} />
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <Button onClick={save}>Save settings</Button>
          <Button variant="outline" onClick={() => setForm(settings)}>
            Reset
          </Button>
        </div>
      </section>

      <section className="app-card mt-6 p-6">
        <h2 className="font-semibold">Admin account</h2>
        <p className="mt-1 text-sm text-muted-foreground">Signed in as {user?.email}</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="p-cur">Current password</Label>
            <Input
              id="p-cur"
              type="password"
              value={pwd.current}
              onChange={(e) => setPwd({ ...pwd, current: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="p-new">New password</Label>
            <Input
              id="p-new"
              type="password"
              value={pwd.next}
              onChange={(e) => setPwd({ ...pwd, next: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="p-conf">Confirm password</Label>
            <Input
              id="p-conf"
              type="password"
              value={pwd.confirm}
              onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
            />
          </div>
        </div>
        <Button className="mt-6" onClick={savePassword}>
          Update password
        </Button>
      </section>
    </div>
  );
}
