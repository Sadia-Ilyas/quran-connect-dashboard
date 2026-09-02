import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/ui-kit";
import { ProfileForm } from "@/components/dashboard/ProfileForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { useDashboard } from "@/context/DashboardContext";
import type { Teacher } from "@/types/dashboard";

export const Route = createFileRoute("/teacher/profile")({
  head: () => ({
    meta: [
      { title: "Teacher Profile — Quran Academy Portal" },
      {
        name: "description",
        content: "Update your teaching profile, bio, meeting room link and account password.",
      },
      { property: "og:title", content: "Teacher Profile — Quran Academy Portal" },
      { property: "og:description", content: "Manage your teacher account details and availability." },
    ],
  }),
  component: TeacherProfile,
});

function TeacherProfile() {
  const { user } = useAuth();
  const { teachers, updateTeacher } = useDashboard();
  const teacher = teachers.find((t) => t.id === user?.id) as Teacher | undefined;

  const [form, setForm] = useState({
    bio: teacher?.bio ?? "",
    qualifications: (teacher?.qualifications ?? []).join(", "),
    languages: (teacher?.languages ?? []).join(", "),
    experienceYears: String(teacher?.experienceYears ?? 0),
    defaultMeetingUrl: teacher?.defaultMeetingUrl ?? "",
  });

  const saveTeaching = () => {
    if (!teacher) return;
    updateTeacher(teacher.id, {
      bio: form.bio.trim(),
      qualifications: form.qualifications.split(",").map((s) => s.trim()).filter(Boolean),
      languages: form.languages.split(",").map((s) => s.trim()).filter(Boolean),
      experienceYears: Number(form.experienceYears) || 0,
      defaultMeetingUrl: form.defaultMeetingUrl.trim(),
    });
    toast.success("Teaching profile updated");
  };

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Profile" description="Your account and teaching information." />

      <ProfileForm />

      {teacher && (
        <section className="app-card mt-6 p-6">
          <h2 className="text-base font-semibold">Teaching profile</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="quals">Qualifications (comma separated)</Label>
              <Input
                id="quals"
                value={form.qualifications}
                onChange={(e) => setForm((f) => ({ ...f, qualifications: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="langs">Languages (comma separated)</Label>
              <Input
                id="langs"
                value={form.languages}
                onChange={(e) => setForm((f) => ({ ...f, languages: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="exp">Years of experience</Label>
              <Input
                id="exp"
                type="number"
                min={0}
                value={form.experienceYears}
                onChange={(e) => setForm((f) => ({ ...f, experienceYears: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="meet">Default meeting room URL</Label>
              <Input
                id="meet"
                value={form.defaultMeetingUrl}
                onChange={(e) => setForm((f) => ({ ...f, defaultMeetingUrl: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                rows={4}
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              />
            </div>
          </div>
          <Button className="mt-6" onClick={saveTeaching}>
            Save teaching profile
          </Button>
        </section>
      )}
    </div>
  );
}
