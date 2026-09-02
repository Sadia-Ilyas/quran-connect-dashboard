import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, CheckCircle2, ExternalLink } from "lucide-react";
import { EmptyState, PageHeader } from "@/components/dashboard/ui-kit";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAuth } from "@/context/AuthContext";
import { useDashboard } from "@/context/DashboardContext";

export const Route = createFileRoute("/student/courses")({
  head: () => ({
    meta: [
      { title: "My Courses — Quran Academy Portal" },
      {
        name: "description",
        content: "Curriculum, objectives and learning resources for your enrolled Quran course.",
      },
      { property: "og:title", content: "My Courses — Quran Academy Portal" },
      { property: "og:description", content: "Explore your course curriculum and resources." },
    ],
  }),
  component: StudentCourses,
});

function StudentCourses() {
  const { user } = useAuth();
  const { students, courses } = useDashboard();
  const student = students.find((s) => s.id === user?.id);
  const enrolled = courses.find((c) => c.id === student?.courseId);
  const others = courses.filter((c) => c.visible && c.id !== enrolled?.id);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="My Courses" description="Your curriculum, objectives and resources." />

      {!enrolled ? (
        <div className="app-card">
          <EmptyState icon={BookOpen} title="No course enrolled" description="Contact the academy to enrol." />
        </div>
      ) : (
        <article className="app-card p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">{enrolled.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{enrolled.description}</p>
            </div>
            <Badge variant="secondary">{enrolled.durationWeeks} weeks</Badge>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold">Curriculum</h3>
              <ol className="mt-3 space-y-2">
                {enrolled.curriculum.map((item, i) => (
                  <li key={item} className="flex gap-3 text-sm">
                    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary-soft text-xs font-medium text-primary">
                      {i + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Learning objectives</h3>
              <ul className="mt-3 space-y-2">
                {enrolled.objectives.map((o) => (
                  <li key={o} className="flex gap-2 text-sm">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    {o}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {enrolled.resources.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold">Resources</h3>
              <ul className="mt-3 space-y-2">
                {enrolled.resources.map((r) => (
                  <li key={r.url}>
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="size-4" /> {r.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </article>
      )}

      {others.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-base font-semibold">Other courses at the academy</h2>
          <Accordion type="single" collapsible className="app-card px-5">
            {others.map((c) => (
              <AccordionItem key={c.id} value={c.id}>
                <AccordionTrigger className="text-sm">{c.title}</AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-muted-foreground">{c.description}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {c.durationWeeks} weeks · PKR {c.pricePKR.toLocaleString()} / ${c.priceUSD}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      )}
    </div>
  );
}
