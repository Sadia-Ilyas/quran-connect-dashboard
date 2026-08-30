import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, GraduationCap, UserCheck, Users } from "lucide-react";
import { PageHeader, StatCard, EmptyState } from "@/components/dashboard/ui-kit";
import { Badge } from "@/components/ui/badge";
import { useDashboard } from "@/context/DashboardContext";
import { slotLocalLabel } from "@/lib/time";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({
    meta: [
      { title: "Admin Overview — Quran Academy Portal" },
      { name: "description", content: "Academy-wide metrics, trial pipeline and upcoming classes." },
      { property: "og:title", content: "Admin Overview — Quran Academy Portal" },
      { property: "og:description", content: "Academy-wide metrics and trial pipeline." },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const { students, teachers, courses, trialRequests, inquiries, slots } = useDashboard();
  const newTrials = trialRequests.filter((t) => t.status === "New");
  const pending = inquiries.filter((i) => i.status === "Pending");

  return (
    <div>
      <PageHeader title="Academy overview" description="Live snapshot of enrolment, staff and demand." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active students" value={students.length} icon={Users} />
        <StatCard label="Teachers" value={teachers.length} icon={GraduationCap} tone="info" />
        <StatCard label="Courses" value={courses.length} icon={BookOpen} tone="gold" />
        <StatCard
          label="New trial requests"
          value={newTrials.length}
          icon={UserCheck}
          tone="destructive"
          hint={`${pending.length} inquiries pending`}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="app-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-semibold">Latest trial requests</h2>
            <Link to="/admin/trial-requests" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>
          {trialRequests.length === 0 ? (
            <EmptyState title="No trial requests yet" />
          ) : (
            <ul className="divide-y divide-border">
              {trialRequests.slice(0, 5).map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{t.studentName}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {t.course} · {t.country}
                    </p>
                  </div>
                  <Badge variant="secondary">{t.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="app-card">
          <div className="border-b border-border px-5 py-4">
            <h2 className="font-semibold">Upcoming classes</h2>
          </div>
          <ul className="divide-y divide-border">
            {slots.slice(0, 5).map((s) => {
              const label = slotLocalLabel(s);
              const student = students.find((x) => x.id === s.studentId);
              const teacher = teachers.find((x) => x.id === s.teacherId);
              return (
                <li key={s.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{student?.name ?? "Unassigned"}</p>
                    <p className="truncate text-xs text-muted-foreground">with {teacher?.name}</p>
                  </div>
                  <p className="shrink-0 text-xs tabular-nums text-muted-foreground">
                    {label.day} · {label.time}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}
