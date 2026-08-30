import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpenText, GraduationCap, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/context/DashboardContext";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Quran Academy — Online Tajweed, Hifz & Qaida Classes" },
      {
        name: "description",
        content:
          "One-to-one online Quran classes with certified teachers. Admin, teacher and student portals in a single academy dashboard.",
      },
      { property: "og:title", content: "Quran Academy — Online Quran Classes" },
      {
        property: "og:description",
        content: "Certified teachers, flexible timings and a full academy management portal.",
      },
    ],
  }),
  component: Landing,
});

const HIGHLIGHTS = [
  { icon: ShieldCheck, title: "Admin portal", body: "Manage trials, students, teachers, courses and academy content." },
  { icon: GraduationCap, title: "Teacher portal", body: "Weekly schedule, student progress and lesson logging in one place." },
  { icon: Users, title: "Student portal", body: "Live class countdown, timetable, courses and progress tracking." },
];

function Landing() {
  const { settings, courses } = useDashboard();

  return (
    <div className="hero-gradient min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="brand-gradient flex size-10 items-center justify-center rounded-xl">
            <BookOpenText className="size-5 text-primary-foreground" />
          </div>
          <span className="font-semibold">{settings.name}</span>
        </div>
        <Button asChild size="sm">
          <Link to="/login">Sign in</Link>
        </Button>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-20">
        <section className="py-16 text-center">
          <h1 className="mx-auto max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Learn the Quran with certified teachers, from anywhere
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">{settings.tagline}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/login">Enter your portal</Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          {HIGHLIGHTS.map((h) => (
            <div key={h.title} className="app-card p-6">
              <span className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary">
                <h.icon className="size-5" />
              </span>
              <h2 className="mt-4 text-base font-semibold">{h.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{h.body}</p>
            </div>
          ))}
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-semibold">Popular courses</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses
              .filter((c) => c.visible)
              .map((c) => (
                <article key={c.id} className="app-card p-5">
                  <h3 className="font-medium">{c.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
                  <p className="mt-3 text-sm font-medium text-primary">
                    ${c.priceUSD}/mo · {c.durationWeeks} weeks
                  </p>
                </article>
              ))}
          </div>
        </section>
      </main>
    </div>
  );
}
