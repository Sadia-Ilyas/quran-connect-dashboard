import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { CalendarDays, Video } from "lucide-react";
import { toast } from "sonner";
import { EmptyState, PageHeader } from "@/components/dashboard/ui-kit";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useDashboard } from "@/context/DashboardContext";
import {
  DAYS,
  formatLocalDateTime,
  localTimezone,
  nextOccurrence,
  openMeeting,
  slotLocalLabel,
  slotWindow,
} from "@/lib/time";

export const Route = createFileRoute("/student/schedule")({
  head: () => ({
    meta: [
      { title: "My Timetable — Quran Academy Portal" },
      {
        name: "description",
        content: "Your weekly Quran class timetable converted to your local timezone.",
      },
      { property: "og:title", content: "My Timetable — Quran Academy Portal" },
      { property: "og:description", content: "See every weekly class and join when the room opens." },
    ],
  }),
  component: StudentSchedule,
});

function StudentSchedule() {
  const { user } = useAuth();
  const { slots, courses, teachers } = useDashboard();

  const mySlots = useMemo(
    () =>
      slots
        .filter((s) => s.studentId === user?.id)
        .sort((a, b) => nextOccurrence(a).getTime() - nextOccurrence(b).getTime()),
    [slots, user?.id],
  );

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="My Timetable"
        description={`All times shown in your local timezone (${localTimezone()}).`}
      />

      {mySlots.length === 0 ? (
        <div className="app-card">
          <EmptyState
            icon={CalendarDays}
            title="No classes scheduled"
            description="Contact the academy to set up your weekly class slots."
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {mySlots.map((slot) => {
            const l = slotLocalLabel(slot);
            const { isOpen, isLive } = slotWindow(slot);
            return (
              <article key={slot.id} className="app-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">{DAYS[l.dayIndex]}</p>
                    <p className="text-xl font-semibold">
                      {l.time} – {l.endTime}
                    </p>
                  </div>
                  {isLive ? (
                    <Badge className="bg-destructive text-destructive-foreground">LIVE</Badge>
                  ) : isOpen ? (
                    <Badge>Open</Badge>
                  ) : (
                    <Badge variant="secondary">Scheduled</Badge>
                  )}
                </div>
                <p className="mt-3 text-sm">
                  {courses.find((c) => c.id === slot.courseId)?.title ?? "Course"}
                </p>
                <p className="text-xs text-muted-foreground">
                  With {teachers.find((t) => t.id === slot.teacherId)?.name ?? "Teacher"}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Next: {formatLocalDateTime(nextOccurrence(slot))}
                </p>
                <Button
                  className="mt-4 w-full"
                  disabled={!isOpen}
                  onClick={() => {
                    openMeeting(slot.meetingUrl);
                    toast.success("Opening meeting room");
                  }}
                >
                  <Video className="mr-2 size-4" /> Join class
                </Button>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
