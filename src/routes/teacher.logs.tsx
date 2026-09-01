import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { NotebookPen, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  EmptyState,
  FieldError,
  PageHeader,
  PaginationBar,
  StarRating,
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
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import { useDashboard } from "@/context/DashboardContext";
import type { AttendanceStatus } from "@/types/dashboard";

export const Route = createFileRoute("/teacher/logs")({
  head: () => ({
    meta: [
      { title: "Class Logs — Quran Academy Portal" },
      {
        name: "description",
        content: "Record lesson progress, tajweed ratings and attendance after every class.",
      },
      { property: "og:title", content: "Class Logs — Quran Academy Portal" },
      { property: "og:description", content: "Submit and review daily Quran lesson logs." },
    ],
  }),
  component: TeacherLogs,
});

const ATTENDANCE: AttendanceStatus[] = ["Present", "Absent", "Cancelled"];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function TeacherLogs() {
  const { user } = useAuth();
  const { students, logs, addLog } = useDashboard();
  const teacherId = user?.id ?? "";
  const myStudents = useMemo(
    () => students.filter((s) => s.teacherId === teacherId),
    [students, teacherId],
  );

  const [open, setOpen] = useState(false);
  const [studentFilter, setStudentFilter] = useState("all");
  const [form, setForm] = useState({
    studentId: "",
    date: todayIso(),
    surahOrPara: "",
    versesCompleted: "0",
    tajweedRating: 4,
    attendance: "Present" as AttendanceStatus,
    remarks: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const myLogs = useMemo(
    () =>
      logs
        .filter((l) => l.teacherId === teacherId)
        .filter((l) => studentFilter === "all" || l.studentId === studentFilter),
    [logs, teacherId, studentFilter],
  );
  const { page, pageCount, slice, setPage, total } = usePagination(myLogs, 8);

  const submit = () => {
    const next: Record<string, string> = {};
    if (!form.studentId) next.studentId = "Select a student.";
    if (!form.surahOrPara.trim()) next.surahOrPara = "Enter the Surah or Para covered.";
    if (Number.isNaN(Number(form.versesCompleted)) || Number(form.versesCompleted) < 0)
      next.versesCompleted = "Enter a valid number of verses.";
    setErrors(next);
    if (Object.keys(next).length) return;

    addLog({
      studentId: form.studentId,
      teacherId,
      date: form.date,
      surahOrPara: form.surahOrPara.trim(),
      versesCompleted: Number(form.versesCompleted),
      tajweedRating: form.tajweedRating,
      attendance: form.attendance,
      remarks: form.remarks.trim(),
    });
    toast.success("Class log saved");
    setOpen(false);
    setForm({
      studentId: "",
      date: todayIso(),
      surahOrPara: "",
      versesCompleted: "0",
      tajweedRating: 4,
      attendance: "Present",
      remarks: "",
    });
  };

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Class Logs"
        description="Daily record of lesson progress and attendance."
        action={
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 size-4" /> New log
          </Button>
        }
      />

      <div className="app-card overflow-hidden">
        <div className="border-b border-border p-4">
          <Select value={studentFilter} onValueChange={setStudentFilter}>
            <SelectTrigger className="max-w-xs">
              <SelectValue placeholder="All students" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All students</SelectItem>
              {myStudents.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {slice.length === 0 ? (
          <EmptyState
            icon={NotebookPen}
            title="No class logs yet"
            description="Log a lesson right after class to track student progress."
            action={
              <Button className="mt-2" onClick={() => setOpen(true)}>
                Add first log
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Covered</TableHead>
                  <TableHead>Verses</TableHead>
                  <TableHead>Tajweed</TableHead>
                  <TableHead>Attendance</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {slice.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap text-sm">{log.date}</TableCell>
                    <TableCell className="text-sm font-medium">
                      {students.find((s) => s.id === log.studentId)?.name ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm">{log.surahOrPara}</TableCell>
                    <TableCell className="tabular-nums">{log.versesCompleted}</TableCell>
                    <TableCell>
                      <StarRating value={log.tajweedRating} />
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          log.attendance === "Present"
                            ? "default"
                            : log.attendance === "Absent"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {log.attendance}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[16rem] truncate text-sm text-muted-foreground">
                      {log.remarks || "—"}
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New class log</DialogTitle>
            <DialogDescription>Record what was covered in this lesson.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Student</Label>
              <Select
                value={form.studentId}
                onValueChange={(v) => setForm((f) => ({ ...f, studentId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {myStudents.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError message={errors.studentId} />
            </div>

            <div>
              <Label htmlFor="log-date">Date</Label>
              <Input
                id="log-date"
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="log-surah">Surah / Para</Label>
              <Input
                id="log-surah"
                value={form.surahOrPara}
                onChange={(e) => setForm((f) => ({ ...f, surahOrPara: e.target.value }))}
                placeholder="Surah Al-Baqarah"
              />
              <FieldError message={errors.surahOrPara} />
            </div>

            <div>
              <Label htmlFor="log-verses">Verses completed</Label>
              <Input
                id="log-verses"
                type="number"
                min={0}
                value={form.versesCompleted}
                onChange={(e) => setForm((f) => ({ ...f, versesCompleted: e.target.value }))}
              />
              <FieldError message={errors.versesCompleted} />
            </div>

            <div>
              <Label>Attendance</Label>
              <Select
                value={form.attendance}
                onValueChange={(v) => setForm((f) => ({ ...f, attendance: v as AttendanceStatus }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ATTENDANCE.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="sm:col-span-2">
              <Label>Tajweed rating</Label>
              <div className="mt-2">
                <StarRating
                  value={form.tajweedRating}
                  size={6}
                  onChange={(v) => setForm((f) => ({ ...f, tajweedRating: v }))}
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="log-remarks">Remarks</Label>
              <Textarea
                id="log-remarks"
                rows={3}
                value={form.remarks}
                onChange={(e) => setForm((f) => ({ ...f, remarks: e.target.value }))}
                placeholder="Homework, pronunciation notes, next lesson plan…"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit}>Save log</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
