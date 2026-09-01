import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { CalendarDays, Video } from "lucide-react";
import { toast } from "sonner";
import { EmptyState, PageHeader } from "@/components/dashboard/ui-kit";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useDashboard } from "@/context/DashboardContext";
import { DAYS, localTimezone, openMeeting, slotLocalLabel, slotWindow } from "@/lib/time";

export const Route = createFileRoute("/teacher/schedule")({
  head: () => ({
    meta: [
      { title: "Class Schedule — Quran Academy Portal" },
      {
        name: "description",
        content: "Weekly teaching timetable in your local timezone with join links per class.",
      },
      { property: "og:title", content: "Class Schedule — Quran Academy Portal" },
      { property: "og:description", content: "Your weekly class slots, students and meeting rooms." },
    ],
  }),
  component: TeacherSchedule,
});

function TeacherSchedule() {
  const { user } = useAuth();
  const { slots, students, courses } = useDashboard();
  const teacherId = user?.id ?? "";

  const byDay = useMemo(() => {
    const grid: Record<number, typeof slots> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
    slots
      .filter((s) => s.teacherId === teacherId)
      .forEach((s) => {
        const { dayIndex } = slotLocalLabel(s);
        grid[dayIndex].push(s);
      });
    Object.values(grid).forEach((list) =>
      list.sort((a, b) => slotLocalLabel(a).time.localeCompare(slotLocalLabel(b).time)),
    );
    return grid;
  }, [slots, teacherId]);

  const total = Object.values(byDay).reduce((n, l) => n + l.length, 0);

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Class Schedule"
        description={`Weekly timetable shown in your local timezone (${localTimezone()}).`}
      />

      {total === 0 ? (
        <div className="app-card">
          <EmptyState
            icon={CalendarDays}
            title="No classes assigned"
            description="Once the admin assigns students to you, their weekly slots appear here."
          />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {DAYS.map((day, index) => (
            <section key={day} className="app-card overflow-hidden">
              <header className="flex items-center justify-between border-b border-border px-4 py-3">
                <h2 className="text-sm font-semibold">{day}</h2>
                <Badge variant="secondary">{byDay[index].length}</Badge>
              </header>
              {byDay[index].length === 0 ? (
                <p className="px-4 py-6 text-center text-xs text-muted-foreground">No classes</p>
              ) : (
                <ul className="divide-y divide-border">
                  {byDay[index].map((slot) => {
                    const label = slotLocalLabel(slot);
                    const { isOpen, isLive } = slotWindow(slot);
                    const student = students.find((s) => s.id === slot.studentId);
                    return (
                      <li key={slot.id} className="space-y-2 px-4 py-3">
                        <p className="text-sm font-medium">
                          {label.time} – {label.endTime}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {student?.name} · {courses.find((c) => c.id === slot.courseId)?.title}
                        </p>
                        <div className="flex items-center gap-2">
                          {isLive && <Badge className="bg-destructive text-destructive-foreground">LIVE</Badge>}
                          <Button
                            size="sm"
                            variant={isOpen ? "default" : "outline"}
                            disabled={!isOpen}
                            onClick={() => {
                              openMeeting(slot.meetingUrl);
                              toast.success("Opening meeting room");
                            }}
                          >
                            <Video className="mr-1.5 size-3.5" /> Join
                          </Button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
