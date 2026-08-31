import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BookOpen, Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { EmptyState, FieldError, PageHeader } from "@/components/dashboard/ui-kit";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { uid, useDashboard } from "@/context/DashboardContext";
import type { Course } from "@/types/dashboard";

export const Route = createFileRoute("/admin/courses")({
  head: () => ({
    meta: [
      { title: "Courses — Quran Academy Portal" },
      { name: "description", content: "Create and publish Quran courses with curriculum and pricing." },
      { property: "og:title", content: "Courses — Quran Academy Portal" },
      { property: "og:description", content: "Curriculum, pricing and visibility for every course." },
    ],
  }),
  component: AdminCourses,
});

const EMPTY: Course = {
  id: "",
  title: "",
  description: "",
  durationWeeks: 12,
  pricePKR: 5000,
  priceUSD: 30,
  curriculum: [],
  objectives: [],
  resources: [],
  visible: true,
};

function AdminCourses() {
  const { courses, students, saveCourse, removeCourse } = useDashboard();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Course>(EMPTY);
  const [curriculum, setCurriculum] = useState("");
  const [objectives, setObjectives] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const openEditor = (c?: Course) => {
    const base = c ?? { ...EMPTY, id: uid("c") };
    setDraft(base);
    setCurriculum(base.curriculum.join("\n"));
    setObjectives(base.objectives.join("\n"));
    setErrors({});
    setOpen(true);
  };

  const submit = () => {
    const next: Record<string, string> = {};
    if (!draft.title.trim()) next.title = "Title is required";
    if (!draft.description.trim()) next.description = "Description is required";
    if (draft.durationWeeks <= 0) next.durationWeeks = "Must be at least 1 week";
    setErrors(next);
    if (Object.keys(next).length) return;

    saveCourse({
      ...draft,
      curriculum: curriculum.split("\n").map((s) => s.trim()).filter(Boolean),
      objectives: objectives.split("\n").map((s) => s.trim()).filter(Boolean),
    });
    toast.success("Course saved");
    setOpen(false);
  };

  return (
    <div>
      <PageHeader
        title="Courses"
        description="Curriculum, pricing and public visibility."
        action={
          <Button onClick={() => openEditor()}>
            <Plus className="mr-2 size-4" /> New course
          </Button>
        }
      />

      {courses.length === 0 ? (
        <div className="app-card">
          <EmptyState icon={BookOpen} title="No courses yet" description="Create your first course." />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((c) => (
            <article key={c.id} className="app-card flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-semibold">{c.title}</h2>
                <Badge variant={c.visible ? "secondary" : "outline"}>
                  {c.visible ? "Published" : "Hidden"}
                </Badge>
              </div>
              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{c.description}</p>
              <dl className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-lg bg-muted p-2">
                  <dt className="text-muted-foreground">Weeks</dt>
                  <dd className="font-semibold tabular-nums">{c.durationWeeks}</dd>
                </div>
                <div className="rounded-lg bg-muted p-2">
                  <dt className="text-muted-foreground">PKR</dt>
                  <dd className="font-semibold tabular-nums">{c.pricePKR.toLocaleString()}</dd>
                </div>
                <div className="rounded-lg bg-muted p-2">
                  <dt className="text-muted-foreground">USD</dt>
                  <dd className="font-semibold tabular-nums">${c.priceUSD}</dd>
                </div>
              </dl>
              <p className="mt-3 text-xs text-muted-foreground">
                {students.filter((s) => s.courseId === c.id).length} enrolled ·{" "}
                {c.curriculum.length} modules
              </p>
              <div className="mt-4 flex gap-2 border-t border-border pt-4">
                <Button variant="outline" size="sm" onClick={() => openEditor(c)}>
                  <Pencil className="mr-2 size-4" /> Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    saveCourse({ ...c, visible: !c.visible });
                    toast.success(c.visible ? "Course hidden" : "Course published");
                  }}
                >
                  {c.visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto"
                  onClick={() => {
                    if (students.some((s) => s.courseId === c.id)) {
                      toast.error("Students are enrolled in this course");
                      return;
                    }
                    removeCourse(c.id);
                    toast.success("Course deleted");
                  }}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{courses.some((c) => c.id === draft.id) ? "Edit course" : "New course"}</DialogTitle>
            <DialogDescription>Content shown on the public site and student portal.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="c-title">Title</Label>
              <Input id="c-title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
              <FieldError message={errors.title} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="c-desc">Description</Label>
              <Textarea
                id="c-desc"
                rows={3}
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              />
              <FieldError message={errors.description} />
            </div>
            <div>
              <Label htmlFor="c-weeks">Duration (weeks)</Label>
              <Input
                id="c-weeks"
                type="number"
                min={1}
                value={draft.durationWeeks}
                onChange={(e) => setDraft({ ...draft, durationWeeks: Number(e.target.value) })}
              />
              <FieldError message={errors.durationWeeks} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="c-pkr">Price (PKR)</Label>
                <Input
                  id="c-pkr"
                  type="number"
                  value={draft.pricePKR}
                  onChange={(e) => setDraft({ ...draft, pricePKR: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="c-usd">Price (USD)</Label>
                <Input
                  id="c-usd"
                  type="number"
                  value={draft.priceUSD}
                  onChange={(e) => setDraft({ ...draft, priceUSD: Number(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="c-curr">Curriculum (one per line)</Label>
              <Textarea id="c-curr" rows={5} value={curriculum} onChange={(e) => setCurriculum(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="c-obj">Objectives (one per line)</Label>
              <Textarea id="c-obj" rows={5} value={objectives} onChange={(e) => setObjectives(e.target.value)} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3 sm:col-span-2">
              <div>
                <p className="text-sm font-medium">Visible publicly</p>
                <p className="text-xs text-muted-foreground">Show this course on the landing page.</p>
              </div>
              <Switch
                checked={draft.visible}
                onCheckedChange={(v) => setDraft({ ...draft, visible: v })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit}>Save course</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
