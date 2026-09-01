import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { CalendarDays, GraduationCap, NotebookPen, Users } from "lucide-react";
import { LiveClassCard } from "@/components/dashboard/LiveClassCard";
import { EmptyState, PageHeader, StatCard } from "@/components/dashboard/ui-kit";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { useDashboard } from "@/context/DashboardContext";
import { nextOccurrence, formatLocalDateTime, slotLocalLabel } from "@/lib/time";

export const Route = createFileRoute("/teacher/dashboard")({
  head: () => ({
    meta: [
      { title: "Teacher Overview — Quran Academy Portal" },
      {
        name: "description",
        content: "Your next live class, assigned students and weekly teaching load at a glance.",
      },
      { property: "og:title", content: "Teacher Overview — Quran Academy Portal" },
      {
        property: "og:description",
        content: "Live class countdown, student roster and recent lesson logs for teachers.",
      },
    ],
  }),
  component: TeacherDashboard,
});

function TeacherDashboard() {
  const { user } = useAuth();
  const { students, slots, logs, courses, announcements } = useDashboard();
  const teacherId = user?.id ?? "";

  const mySlots = useMemo(() => slots.filter((s) => s.teacherId === teacherId), [slots, teacherId]);
  const myStudents = useMemo(
    () => students.filter((s) => s.teacherId === teacherId),
    [students, teacherId],
  );
  const myLogs = useMemo(
    () => logs.filter((l) => l.teacherId === teacherId).slice(0, 5),
    [logs, teacherId],
  );

  const upcoming = useMemo(
    () => [...mySlots].sort((a, b) => nextOccurrence(a).getTime() - nextOccurrence(b).getTime()),
    [mySlots],
  );
  const next = upcoming[0] ?? null;
  const nextStudent = students.find((s) => s.id === next?.studentId);
  const weeklyMinutes = mySlots.reduce((sum, s) => sum + s.durationMinutes, 0);

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title={`Assalamu Alaikum, ${user?.name.split(" ")[0] ?? "Teacher"}`}
        description="Here is your teaching day at a glance."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="My students" value={myStudents.length} icon={Users} />
        <StatCard label="Weekly classes" value={mySlots.length} icon={CalendarDays} tone="info" />
        <StatCard
          label="Weekly minutes"
          value={weeklyMinutes}
          icon={GraduationCap}
          tone="gold"
          hint={`${Math.round(weeklyMinutes / 60)} hours of teaching`}
        />
        <StatCard label="Lesson logs" value={logs.filter((l) => l.teacherId === teacherId).length} icon={NotebookPen} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <LiveClassCard
            slot={next}
            title="Next class"
            subtitle={
              nextStudent
                ? `${nextStudent.name} · ${courses.find((c) => c.id === next?.courseId)?.title ?? ""}`
                : undefined
            }
            actionLabel="Start Class"
          />

          <section className="app-card">
            <header className="border-b border-border px-5 py-4">
              <h2 className="text-base font-semibold">Upcoming this week</h2>
            </header>
            {upcoming.length === 0 ? (
              <EmptyState title="No classes scheduled" description="Assigned slots will appear here." />
            ) : (
              <ul className="divide-y divide-border">
                {upcoming.slice(0, 6).map((slot) => {
                  const student = students.find((s) => s.id === slot.studentId);
                  const label = slotLocalLabel(slot);
                  return (
                    <li key={slot.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{student?.name ?? "Student"}</p>
                        <p className="text-xs text-muted-foreground">
                          {courses.find((c) => c.id === slot.courseId)?.title}
                        </p>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        <p className="font-medium text-foreground">
                          {label.day} · {label.time}
                        </p>
                        <p>{formatLocalDateTime(nextOccurrence(slot))}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section className="app-card">
            <header className="border-b border-border px-5 py-4">
              <h2 className="text-base font-semibold">Recent lesson logs</h2>
            </header>
            {myLogs.length === 0 ? (
              <EmptyState title="No logs yet" description="Submit a class log after each lesson." />
            ) : (
              <ul className="divide-y divide-border">
                {myLogs.map((log) => (
                  <li key={log.id} className="px-5 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium">
                        {students.find((s) => s.id === log.studentId)?.name ?? "Student"}
                      </p>
                      <Badge variant={log.attendance === "Present" ? "default" : "secondary"}>
                        {log.attendance}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {log.date} · {log.surahOrPara} · {log.versesCompleted} verses
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="app-card">
            <header className="border-b border-border px-5 py-4">
              <h2 className="text-base font-semibold">Announcements</h2>
            </header>
            <ul className="divide-y divide-border">
              {announcements.map((a) => (
                <li key={a.id} className="px-5 py-3">
                  <p className="text-sm font-medium">{a.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{a.body}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
