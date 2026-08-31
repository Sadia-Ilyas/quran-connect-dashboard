import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { GraduationCap, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  EmptyState,
  FieldError,
  PageHeader,
  PaginationBar,
  usePagination,
} from "@/components/dashboard/ui-kit";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDashboard } from "@/context/DashboardContext";
import type { Specialization, Teacher } from "@/types/dashboard";

export const Route = createFileRoute("/admin/teachers")({
  head: () => ({
    meta: [
      { title: "Teachers — Quran Academy Portal" },
      { name: "description", content: "Manage teaching staff, specialisations and class capacity." },
      { property: "og:title", content: "Teachers — Quran Academy Portal" },
      { property: "og:description", content: "Manage teaching staff and specialisations." },
    ],
  }),
  component: AdminTeachers;
});

const SPECIALIZATIONS: Specialization[] = ["Tajweed", "Hifz", "Translation", "Qaida", "Arabic"];

interface FormState {
  name: string;
  email: string;
  password: string;
  phone: string;
  country: string;
  timezone: string;
  experienceYears: number;
  qualifications: string;
  languages: string;
  specialization: Specialization[];
  bio: string;
  defaultMeetingUrl: string;
}

const EMPTY: FormState = {
  name: "",
  email: "",
  password: "",
  phone: "",
  country: "",
  timezone: "Asia/Karachi",
  experienceYears: 1,
  qualifications: "",
  languages: "Urdu, English",
  specialization: ["Tajweed"],
  bio: "",
  defaultMeetingUrl: "https://meet.google.com/quran-academy",
};

function AdminTeachers() {
  const { teachers, students, addTeacher, updateTeacher, removeTeacher } = useDashboard();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Teacher | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return teachers.filter((t) => !q || t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q));
  }, [teachers, query]);
  const { page, pageCount, slice, setPage, total } = usePagination(filtered, 6);

  const openCreate = () => {
    setEditing(null);
    setErrors({});
    setForm(EMPTY);
    setOpen(true);
  };

  const openEdit = (t: Teacher) => {
    setEditing(t);
    setErrors({});
    setForm({
      name: t.name,
      email: t.email,
      password: t.password,
      phone: t.phone ?? "",
      country: t.country ?? "",
      timezone: t.timezone,
      experienceYears: t.experienceYears,
      qualifications: t.qualifications.join(", "),
      languages: t.languages.join(", "),
      specialization: t.specialization,
      bio: t.bio,
      defaultMeetingUrl: t.defaultMeetingUrl,
    });
    setOpen(true);
  };

  const submit = () => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Name is required";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Valid email required";
    if (!editing && form.password.length < 6) next.password = "Minimum 6 characters";
    if (form.specialization.length === 0) next.specialization = "Pick at least one specialisation";
    setErrors(next);
    if (Object.keys(next).length) return;

    const payload = {
      name: form.name,
      email: form.email,
      password: form.password,
      phone: form.phone,
      country: form.country,
      timezone: form.timezone,
      experienceYears: Number(form.experienceYears) || 0,
      qualifications: form.qualifications.split(",").map((s) => s.trim()).filter(Boolean),
      languages: form.languages.split(",").map((s) => s.trim()).filter(Boolean),
      specialization: form.specialization,
      bio: form.bio,
      defaultMeetingUrl: form.defaultMeetingUrl,
    };

    if (editing) {
      updateTeacher(editing.id, payload);
      toast.success("Teacher updated");
    } else {
      addTeacher(payload);
      toast.success("Teacher added");
    }
    setOpen(false);
  };

  const toggleSpec = (s: Specialization) =>
    setForm((f) => ({
      ...f,
      specialization: f.specialization.includes(s)
        ? f.specialization.filter((x) => x !== s)
        : [...f.specialization, s],
    }));

  return (
    <div>
      <PageHeader
        title="Teachers"
        description="Staff profiles, specialisations and assigned student load."
        action={
          <Button onClick={openCreate}>
            <Plus className="mr-2 size-4" /> Add teacher
          </Button>
        }
      />

      <div className="app-card">
        <div className="border-b border-border p-4">
          <Input
            placeholder="Search teachers"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="sm:max-w-xs"
          />
        </div>

        {slice.length === 0 ? (
          <EmptyState icon={GraduationCap} title="No teachers found" />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Specialisation</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {slice.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>
                      <p className="font-medium">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.email}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {t.specialization.map((s) => (
                          <Badge key={s} variant="secondary">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{t.experienceYears} yrs</TableCell>
                    <TableCell className="text-sm tabular-nums">
                      {students.filter((s) => s.teacherId === t.id).length}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(t)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (students.some((s) => s.teacherId === t.id)) {
                            toast.error("Reassign this teacher's students first");
                            return;
                          }
                          removeTeacher(t.id);
                          toast.success("Teacher removed");
                        }}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        <PaginationBar page={page} pageCount={pageCount} total={total} onChange={setPage} />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit teacher" : "Add teacher"}</DialogTitle>
            <DialogDescription>Profile details shown to students and admins.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="t-name">Full name</Label>
              <Input id="t-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <FieldError message={errors.name} />
            </div>
            <div>
              <Label htmlFor="t-email">Email</Label>
              <Input id="t-email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <FieldError message={errors.email} />
            </div>
            {!editing && (
              <div>
                <Label htmlFor="t-pass">Temporary password</Label>
                <Input
                  id="t-pass"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <FieldError message={errors.password} />
              </div>
            )}
            <div>
              <Label htmlFor="t-phone">Phone</Label>
              <Input id="t-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="t-exp">Experience (years)</Label>
              <Input
                id="t-exp"
                type="number"
                min={0}
                value={form.experienceYears}
                onChange={(e) => setForm({ ...form, experienceYears: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="t-lang">Languages (comma separated)</Label>
              <Input
                id="t-lang"
                value={form.languages}
                onChange={(e) => setForm({ ...form, languages: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="t-qual">Qualifications (comma separated)</Label>
              <Input
                id="t-qual"
                value={form.qualifications}
                onChange={(e) => setForm({ ...form, qualifications: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Specialisation</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {SPECIALIZATIONS.map((s) => (
                  <Button
                    key={s}
                    type="button"
                    size="sm"
                    variant={form.specialization.includes(s) ? "default" : "outline"}
                    onClick={() => toggleSpec(s)}
                  >
                    {s}
                  </Button>
                ))}
              </div>
              <FieldError message={errors.specialization} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="t-url">Default meeting link</Label>
              <Input
                id="t-url"
                value={form.defaultMeetingUrl}
                onChange={(e) => setForm({ ...form, defaultMeetingUrl: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="t-bio">Bio</Label>
              <Textarea
                id="t-bio"
                rows={3}
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit}>{editing ? "Save changes" : "Add teacher"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
