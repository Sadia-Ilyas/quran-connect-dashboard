import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { BookOpen, CalendarDays, Percent, Sparkles } from "lucide-react";
import { LiveClassCard } from "@/components/dashboard/LiveClassCard";
import { EmptyState, PageHeader, StarRating, StatCard } from "@/components/dashboard/ui-kit";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/AuthContext";
import { useDashboard } from "@/context/DashboardContext";
import { formatLocalDateTime, nextOccurrence, slotLocalLabel } from "@/lib/time";
import type { Student } from "@/types/dashboard";

export const Route = createFileRoute("/student/dashboard")({
  head: () => ({
    meta: [
      { title: "Student Dashboard — Quran Academy Portal" },
      {
        name: "description",
        content: "Live class countdown, attendance, progress and announcements for your Quran journey.",
      },
      { property: "og:title", content: "Student Dashboard — Quran Academy Portal" },
      { property: "og:description", content: "Track your Quran learning progress and next class." },
    ],
  }),
  component: StudentDashboard,
});

function StudentDashboard() {
  const { user } = useAuth();
  const { students, slots, courses, teachers, logs, announcements } = useDashboard();
  const student = students.find((s) => s.id === user?.id) as Student | undefined;

  const mySlots = useMemo(
    () => slots.filter((s) => s.studentId === student?.id),
    [slots, student?.id],
  );
  const upcoming = useMemo(
    () => [...mySlots].sort((a, b) => nextOccurrence(a).getTime() - nextOccurrence(b).getTime()),
    [mySlots],
  );
  const next = upcoming[0] ?? null;
  const course = courses.find((c) => c.id === student?.courseId);
  const teacher = teachers.find((t) => t.id === student?.teacherId);
  const myLogs = useMemo(
    () => logs.filter((l) => l.studentId === student?.id).slice(0, 5),
    [logs, student?.id],
  );

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title={`Assalamu Alaikum, ${user?.name.split(" ")[0] ?? "Student"}`}
        description="Your Quran learning at a glance."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Attendance" value={`${student?.attendancePercent ?? 0}%`} icon={Percent} />
        <StatCard label="Weekly classes" value={mySlots.length} icon={CalendarDays} tone="info" />
        <StatCard
          label="Current level"
          value={student?.level ?? "—"}
          icon={Sparkles}
          tone="gold"
          hint={student?.ageGroup}
        />
        <StatCard label="Course" value={course?.title ?? "—"} icon={BookOpen} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <LiveClassCard
            slot={next}
            title="Next class"
            subtitle={teacher ? `With ${teacher.name} · ${course?.title ?? ""}` : undefined}
          />

          <section className="app-card p-6">
            <h2 className="text-base font-semibold">Progress</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase text-muted-foreground">Current Surah</p>
                <p className="text-lg font-medium">{student?.currentSurah ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">Current Para</p>
                <p className="text-lg font-medium">{student?.currentPara ?? "—"}</p>
              </div>
            </div>
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Attendance rate</span>
                <span className="font-medium">{student?.attendancePercent ?? 0}%</span>
              </div>
              <Progress value={student?.attendancePercent ?? 0} className="h-2" />
            </div>
          </section>

          <section className="app-card">
            <header className="border-b border-border px-5 py-4">
              <h2 className="text-base font-semibold">Upcoming classes</h2>
            </header>
            {upcoming.length === 0 ? (
              <EmptyState title="No classes scheduled" description="Your timetable will appear here." />
            ) : (
              <ul className="divide-y divide-border">
                {upcoming.slice(0, 5).map((slot) => {
                  const l = slotLocalLabel(slot);
                  return (
                    <li key={slot.id} className="flex items-center justify-between gap-3 px-5 py-3">
                      <div>
                        <p className="text-sm font-medium">
                          {l.day} · {l.time} – {l.endTime}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {courses.find((c) => c.id === slot.courseId)?.title}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatLocalDateTime(nextOccurrence(slot))}
                      </p>
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
              <h2 className="text-base font-semibold">Recent feedback</h2>
            </header>
            {myLogs.length === 0 ? (
              <EmptyState title="No feedback yet" description="Your teacher's notes will appear here." />
            ) : (
              <ul className="divide-y divide-border">
                {myLogs.map((log) => (
                  <li key={log.id} className="space-y-1 px-5 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium">{log.surahOrPara}</p>
                      <Badge variant={log.attendance === "Present" ? "default" : "secondary"}>
                        {log.attendance}
                      </Badge>
                    </div>
                    <StarRating value={log.tajweedRating} />
                    <p className="text-xs text-muted-foreground">
                      {log.date} · {log.remarks || "No remarks"}
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
