import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Users } from "lucide-react";
import {
  EmptyState,
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import { useDashboard } from "@/context/DashboardContext";
import { slotLocalLabel } from "@/lib/time";
import type { Student } from "@/types/dashboard";

export const Route = createFileRoute("/teacher/students")({
  head: () => ({
    meta: [
      { title: "My Students — Quran Academy Portal" },
      {
        name: "description",
        content: "Assigned student roster with progress, attendance and class timings.",
      },
      { property: "og:title", content: "My Students — Quran Academy Portal" },
      { property: "og:description", content: "Track each assigned student's Quran progress." },
    ],
  }),
  component: TeacherStudents,
});

function TeacherStudents() {
  const { user } = useAuth();
  const { students, courses, slots, logs } = useDashboard();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Student | null>(null);
  const teacherId = user?.id ?? "";

  const filtered = useMemo(
    () =>
      students
        .filter((s) => s.teacherId === teacherId)
        .filter((s) => s.name.toLowerCase().includes(query.trim().toLowerCase())),
    [students, teacherId, query],
  );
  const { page, pageCount, slice, setPage, total } = usePagination(filtered, 8);

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="My Students" description="Students currently assigned to you." />

      <div className="app-card overflow-hidden">
        <div className="border-b border-border p-4">
          <Input
            placeholder="Search students…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="max-w-xs"
          />
        </div>

        {slice.length === 0 ? (
          <EmptyState icon={Users} title="No students found" description="Try a different search." />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Attendance</TableHead>
                  <TableHead className="text-right">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {slice.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <p className="font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.ageGroup}</p>
                    </TableCell>
                    <TableCell className="text-sm">
                      {courses.find((c) => c.id === s.courseId)?.title ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{s.level}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {s.currentSurah} · {s.currentPara}
                    </TableCell>
                    <TableCell className="w-40">
                      <Progress value={s.attendancePercent} className="h-2" />
                      <span className="text-xs text-muted-foreground">{s.attendancePercent}%</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => setSelected(s)}>
                        View
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

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selected?.name}</DialogTitle>
            <DialogDescription>{selected?.email}</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <Info label="Guardian" value={selected.guardianName ?? "—"} />
                <Info label="Country" value={selected.country ?? "—"} />
                <Info label="Timezone" value={selected.timezone} />
                <Info label="Joined" value={selected.joinedAt} />
              </div>
              <div>
                <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">Weekly slots</p>
                <ul className="space-y-1">
                  {slots
                    .filter((sl) => sl.studentId === selected.id)
                    .map((sl) => {
                      const l = slotLocalLabel(sl);
                      return (
                        <li key={sl.id} className="text-muted-foreground">
                          {l.day} · {l.time} – {l.endTime}
                        </li>
                      );
                    })}
                </ul>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">Recent logs</p>
                <ul className="space-y-1">
                  {logs
                    .filter((l) => l.studentId === selected.id)
                    .slice(0, 4)
                    .map((l) => (
                      <li key={l.id} className="text-muted-foreground">
                        {l.date} · {l.surahOrPara} · {l.attendance}
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
      <p>{value}</p>
    </div>
  );
}
