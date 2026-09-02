import { createFileRoute } from "@tanstack/react-router";
import { GraduationCap, Mail, MessageCircle } from "lucide-react";
import { EmptyState, PageHeader } from "@/components/dashboard/ui-kit";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useDashboard } from "@/context/DashboardContext";
import { slotLocalLabel } from "@/lib/time";

export const Route = createFileRoute("/student/teacher")({
  head: () => ({
    meta: [
      { title: "My Teacher — Quran Academy Portal" },
      {
        name: "description",
        content: "Meet your assigned Quran teacher: qualifications, experience and class timings.",
      },
      { property: "og:title", content: "My Teacher — Quran Academy Portal" },
      { property: "og:description", content: "Your assigned teacher's profile and contact details." },
    ],
  }),
  component: StudentTeacher,
});

function StudentTeacher() {
  const { user } = useAuth();
  const { students, teachers, slots, settings } = useDashboard();
  const student = students.find((s) => s.id === user?.id);
  const teacher = teachers.find((t) => t.id === student?.teacherId);
  const mySlots = slots.filter((s) => s.studentId === student?.id);

  if (!teacher) {
    return (
      <div className="mx-auto max-w-3xl">
        <PageHeader title="My Teacher" />
        <div className="app-card">
          <EmptyState
            icon={GraduationCap}
            title="No teacher assigned yet"
            description="The academy will assign a teacher shortly."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="My Teacher" description="Your assigned instructor." />

      <article className="app-card p-6">
        <div className="flex flex-wrap items-center gap-4">
          <Avatar className="size-20">
            <AvatarImage src={teacher.avatarUrl} alt={teacher.name} />
            <AvatarFallback>{teacher.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h2 className="text-xl font-semibold">{teacher.name}</h2>
            <p className="text-sm text-muted-foreground">
              {teacher.experienceYears} years experience · {teacher.country ?? "—"}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {teacher.specialization.map((s) => (
                <Badge key={s} variant="secondary">
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-5 text-sm text-muted-foreground">{teacher.bio}</p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold">Qualifications</h3>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              {teacher.qualifications.map((q) => (
                <li key={q}>• {q}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Languages</h3>
            <p className="mt-2 text-sm text-muted-foreground">{teacher.languages.join(", ")}</p>
            <h3 className="mt-4 text-sm font-semibold">Our classes</h3>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              {mySlots.map((s) => {
                const l = slotLocalLabel(s);
                return (
                  <li key={s.id}>
                    {l.day} · {l.time} – {l.endTime}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <a href={`mailto:${teacher.email}`}>
              <Mail className="mr-2 size-4" /> Email teacher
            </a>
          </Button>
          <Button asChild variant="outline">
            <a
              href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="mr-2 size-4" /> Contact academy
            </a>
          </Button>
        </div>
      </article>
    </div>
  );
}
