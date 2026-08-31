import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2, Users } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDashboard } from "@/context/DashboardContext";
import { DAYS, hasScheduleConflict, localSlotToUtc, slotLocalLabel } from "@/lib/time";
import type { AgeGroup, Student } from "@/types/dashboard";

export const Route = createFileRoute("/admin/students")({
  head: () => ({
    meta: [
      { title: "Students — Quran Academy Portal" },
      { name: "description", content: "Enrol, edit and schedule students across courses and teachers." },
      { property: "og:title", content: "Students — Quran Academy Portal" },
      { property: "og:description", content: "Manage student enrolment and weekly class slots." },
    ],
  }),
  component: AdminStudents,
});

const AGE_GROUPS: AgeGroup[] = ["Kids (5-12)", "Teens (13-17)", "Adults (18+)"];

interface FormState {
  name: string;
  email: string;
  password: string;
  guardianName: string;
  whatsapp: string;
  country: string;
  courseId: string;
  teacherId: string;
  ageGroup: AgeGroup;
  level: string;
  timezone: string;
  day: number;
  time: string;
  duration: number;
}

function AdminStudents() {
  const {
    students,
    teachers,
    courses,
    slots,
    addStudent,
    updateStudent,
    removeStudent,
    addSlot,
  } = useDashboard();

  const [query, setQuery] = useState("");
  const [teacherFilter, setTeacherFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<FormState>(blank(courses[0]?.id ?? "", teachers[0]?.id ?? ""));

  const filtered = useMemo(
    () =>
      students.filter((s) => {
        const q = query.trim().toLowerCase();
        const match = !q || s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
        return match && (teacherFilter === "all" || s.teacherId === teacherFilter);
      }),
    [students, query, teacherFilter],
  );
  const { page, pageCount, slice, setPage, total } = usePagination(filtered);

  const openCreate = () => {
    setEditing(null);
    setErrors({});
    setForm(blank(courses[0]?.id ?? "", teachers[0]?.id ?? ""));
    setOpen(true);
  };

  const openEdit = (s: Student) => {
    setEditing(s);
    setErrors({});
    setForm({
      name: s.name,
      email: s.email,
      password: s.password,
      guardianName: s.guardianName ?? "",
      whatsapp: s.whatsapp ?? "",
      country: s.country ?? "",
      courseId: s.courseId,
      teacherId: s.teacherId,
      ageGroup: s.ageGroup,
      level: s.level,
      timezone: s.timezone,
      day: 1,
      time: "17:00",
      duration: 45,
    });
    setOpen(true);
  };

  const submit = () => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Name is required";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Valid email required";
    if (!editing && form.password.length < 6) next.password = "Minimum 6 characters";
    if (!form.courseId) next.courseId = "Select a course";
    if (!form.teacherId) next.teacherId = "Select a teacher";
    setErrors(next);
    if (Object.keys(next).length) return;

    if (editing) {
      updateStudent(editing.id, {
        name: form.name,
        email: form.email,
        guardianName: form.guardianName,
        whatsapp: form.whatsapp,
        country: form.country,
        courseId: form.courseId,
        teacherId: form.teacherId,
        ageGroup: form.ageGroup,
        level: form.level,
        timezone: form.timezone,
      });
      toast.success("Student updated");
      setOpen(false);
      return;
    }

    const utc = localSlotToUtc(form.day, form.time);
    const conflict = hasScheduleConflict(slots, {
      teacherId: form.teacherId,
      dayOfWeek: utc.dayOfWeek,
      startUtc: utc.startUtc,
      durationMinutes: form.duration,
    });
    if (conflict) {
      toast.error("That teacher already has a class in this time slot");
      return;
    }

    const teacher = teachers.find((t) => t.id === form.teacherId);
    addStudent(
      {
        name: form.name,
        email: form.email,
        password: form.password,
        guardianName: form.guardianName,
        whatsapp: form.whatsapp,
        country: form.country,
        timezone: form.timezone,
        courseId: form.courseId,
        teacherId: form.teacherId,
        ageGroup: form.ageGroup,
        level: form.level,
        attendancePercent: 100,
        currentSurah: "Al-Fatihah",
        currentPara: "Para 1",
        joinedAt: new Date().toISOString().slice(0, 10),
      },
      [
        {
          teacherId: form.teacherId,
          courseId: form.courseId,
          dayOfWeek: utc.dayOfWeek,
          startUtc: utc.startUtc,
          durationMinutes: form.duration,
          meetingUrl: teacher?.defaultMeetingUrl ?? "https://meet.google.com/quran-academy",
        },
      ],
    );
    toast.success("Student enrolled");
    setOpen(false);
  };

  return (
    <div>
      <PageHeader
        title="Students"
        description="Enrolment records, assigned teachers and weekly slots."
        action={
          <Button onClick={openCreate}>
            <Plus className="mr-2 size-4" /> Add student
          </Button>
        }
      />

      <div className="app-card">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row">
          <Input
            placeholder="Search by name or email"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="sm:max-w-xs"
          />
          <Select value={teacherFilter} onValueChange={setTeacherFilter}>
            <SelectTrigger className="sm:w-56">
              <SelectValue placeholder="All teachers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All teachers</SelectItem>
              {teachers.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {slice.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No students found"
            description="Try a different search, or enrol a new student."
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Attendance</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {slice.map((s) => {
                  const mySlots = slots.filter((sl) => sl.studentId === s.id);
                  return (
                    <TableRow key={s.id}>
                      <TableCell>
                        <p className="font-medium">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.email}</p>
                      </TableCell>
                      <TableCell className="text-sm">
                        {courses.find((c) => c.id === s.courseId)?.title ?? "—"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {teachers.find((t) => t.id === s.teacherId)?.name ?? "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {mySlots.length === 0
                          ? "No slots"
                          : mySlots
                              .map((sl) => {
                                const l = slotLocalLabel(sl);
                                return `${l.day.slice(0, 3)} ${l.time}`;
                              })
                              .join(", ")}
                      </TableCell>
                      <TableCell>
                        <Badge variant={s.attendancePercent >= 80 ? "secondary" : "destructive"}>
                          {s.attendancePercent}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(s)}>
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            removeStudent(s.id);
                            toast.success("Student removed");
                          }}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
        <PaginationBar page={page} pageCount={pageCount} total={total} onChange={setPage} />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit student" : "Enrol new student"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "Update profile and assignment details."
                : "Create login credentials and assign the first weekly slot."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <FieldError message={errors.name} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <FieldError message={errors.email} />
            </div>
            {!editing && (
              <div>
                <Label htmlFor="password">Temporary password</Label>
                <Input
                  id="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <FieldError message={errors.password} />
              </div>
            )}
            <div>
              <Label htmlFor="guardian">Guardian name</Label>
              <Input
                id="guardian"
                value={form.guardianName}
                onChange={(e) => setForm({ ...form, guardianName: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
              />
            </div>
            <div>
              <Label>Course</Label>
              <Select value={form.courseId} onValueChange={(v) => setForm({ ...form, courseId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError message={errors.courseId} />
            </div>
            <div>
              <Label>Teacher</Label>
              <Select value={form.teacherId} onValueChange={(v) => setForm({ ...form, teacherId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError message={errors.teacherId} />
            </div>
            <div>
              <Label>Age group</Label>
              <Select
                value={form.ageGroup}
                onValueChange={(v) => setForm({ ...form, ageGroup: v as AgeGroup })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AGE_GROUPS.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="level">Level</Label>
              <Input id="level" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} />
            </div>

            {!editing && (
              <>
                <div>
                  <Label>Class day (your local time)</Label>
                  <Select
                    value={String(form.day)}
                    onValueChange={(v) => setForm({ ...form, day: Number(v) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS.map((d, i) => (
                        <SelectItem key={d} value={String(i)}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="time">Start time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit}>{editing ? "Save changes" : "Enrol student"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function blank(courseId: string, teacherId: string): FormState {
  return {
    name: "",
    email: "",
    password: "",
    guardianName: "",
    whatsapp: "",
    country: "",
    courseId,
    teacherId,
    ageGroup: "Kids (5-12)",
    level: "Beginner",
    timezone: "Asia/Karachi",
    day: 1,
    time: "17:00",
    duration: 45,
  };
}
