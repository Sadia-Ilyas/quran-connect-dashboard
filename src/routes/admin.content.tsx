import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MessageSquareQuote, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { EmptyState, FieldError, PageHeader, StarRating } from "@/components/dashboard/ui-kit";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { uid, useDashboard } from "@/context/DashboardContext";
import type { Faq, FaqCategory, Testimonial } from "@/types/dashboard";

export const Route = createFileRoute("/admin/content")({
  head: () => ({
    meta: [
      { title: "Content & FAQs — Quran Academy Portal" },
      { name: "description", content: "Curate testimonials and frequently asked questions." },
      { property: "og:title", content: "Content & FAQs — Quran Academy Portal" },
      { property: "og:description", content: "Curate testimonials and FAQs for the public site." },
    ],
  }),
  component: AdminContent,
});

const CATEGORIES: FaqCategory[] = ["Courses", "Pricing", "Timings", "General"];

function AdminContent() {
  const { testimonials, faqs, saveTestimonial, removeTestimonial, saveFaq, removeFaq } = useDashboard();
  const [tDraft, setTDraft] = useState<Testimonial | null>(null);
  const [fDraft, setFDraft] = useState<Faq | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submitTestimonial = () => {
    if (!tDraft) return;
    const next: Record<string, string> = {};
    if (!tDraft.name.trim()) next.name = "Name is required";
    if (tDraft.review.trim().length < 10) next.review = "Review is too short";
    setErrors(next);
    if (Object.keys(next).length) return;
    saveTestimonial(tDraft);
    toast.success("Testimonial saved");
    setTDraft(null);
  };

  const submitFaq = () => {
    if (!fDraft) return;
    const next: Record<string, string> = {};
    if (!fDraft.question.trim()) next.question = "Question is required";
    if (!fDraft.answer.trim()) next.answer = "Answer is required";
    setErrors(next);
    if (Object.keys(next).length) return;
    saveFaq(fDraft);
    toast.success("FAQ saved");
    setFDraft(null);
  };

  return (
    <div>
      <PageHeader title="Content & FAQs" description="Everything shown on the public marketing pages." />

      <Tabs defaultValue="testimonials">
        <TabsList>
          <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
          <TabsTrigger value="faqs">FAQs</TabsTrigger>
        </TabsList>

        <TabsContent value="testimonials" className="mt-4">
          <div className="mb-4 flex justify-end">
            <Button
              onClick={() => {
                setErrors({});
                setTDraft({ id: uid("tm"), name: "", country: "", rating: 5, review: "", published: false });
              }}
            >
              <Plus className="mr-2 size-4" /> Add testimonial
            </Button>
          </div>

          {testimonials.length === 0 ? (
            <div className="app-card">
              <EmptyState icon={MessageSquareQuote} title="No testimonials yet" />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {testimonials.map((t) => (
                <article key={t.id} className="app-card flex flex-col p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.country}</p>
                    </div>
                    <Badge variant={t.published ? "secondary" : "outline"}>
                      {t.published ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  <div className="mt-2">
                    <StarRating value={t.rating} />
                  </div>
                  <p className="mt-3 flex-1 text-sm text-muted-foreground">{t.review}</p>
                  <div className="mt-4 flex items-center gap-3 border-t border-border pt-4">
                    <Switch
                      checked={t.published}
                      onCheckedChange={(v) => saveTestimonial({ ...t, published: v })}
                    />
                    <span className="text-xs text-muted-foreground">Publish</span>
                    <Button variant="outline" size="sm" className="ml-auto" onClick={() => setTDraft(t)}>
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        removeTestimonial(t.id);
                        toast.success("Testimonial deleted");
                      }}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="faqs" className="mt-4">
          <div className="mb-4 flex justify-end">
            <Button
              onClick={() => {
                setErrors({});
                setFDraft({ id: uid("faq"), category: "General", question: "", answer: "" });
              }}
            >
              <Plus className="mr-2 size-4" /> Add FAQ
            </Button>
          </div>

          <div className="app-card divide-y divide-border">
            {faqs.length === 0 ? (
              <EmptyState title="No FAQs yet" />
            ) : (
              faqs.map((f) => (
                <div key={f.id} className="flex flex-col gap-2 p-5 sm:flex-row sm:items-start">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{f.category}</Badge>
                      <p className="font-medium">{f.question}</p>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{f.answer}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setFDraft(f)}>
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        removeFaq(f.id);
                        toast.success("FAQ deleted");
                      }}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!tDraft} onOpenChange={(o) => !o && setTDraft(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Testimonial</DialogTitle>
          </DialogHeader>
          {tDraft && (
            <div className="grid gap-4">
              <div>
                <Label htmlFor="tm-name">Name</Label>
                <Input
                  id="tm-name"
                  value={tDraft.name}
                  onChange={(e) => setTDraft({ ...tDraft, name: e.target.value })}
                />
                <FieldError message={errors.name} />
              </div>
              <div>
                <Label htmlFor="tm-country">Country</Label>
                <Input
                  id="tm-country"
                  value={tDraft.country}
                  onChange={(e) => setTDraft({ ...tDraft, country: e.target.value })}
                />
              </div>
              <div>
                <Label>Rating</Label>
                <div className="mt-2">
                  <StarRating value={tDraft.rating} onChange={(v) => setTDraft({ ...tDraft, rating: v })} size={5} />
                </div>
              </div>
              <div>
                <Label htmlFor="tm-review">Review</Label>
                <Textarea
                  id="tm-review"
                  rows={4}
                  value={tDraft.review}
                  onChange={(e) => setTDraft({ ...tDraft, review: e.target.value })}
                />
                <FieldError message={errors.review} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setTDraft(null)}>
              Cancel
            </Button>
            <Button onClick={submitTestimonial}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!fDraft} onOpenChange={(o) => !o && setFDraft(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>FAQ</DialogTitle>
          </DialogHeader>
          {fDraft && (
            <div className="grid gap-4">
              <div>
                <Label>Category</Label>
                <Select
                  value={fDraft.category}
                  onValueChange={(v) => setFDraft({ ...fDraft, category: v as FaqCategory })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="faq-q">Question</Label>
                <Input
                  id="faq-q"
                  value={fDraft.question}
                  onChange={(e) => setFDraft({ ...fDraft, question: e.target.value })}
                />
                <FieldError message={errors.question} />
              </div>
              <div>
                <Label htmlFor="faq-a">Answer</Label>
                <Textarea
                  id="faq-a"
                  rows={4}
                  value={fDraft.answer}
                  onChange={(e) => setFDraft({ ...fDraft, answer: e.target.value })}
                />
                <FieldError message={errors.answer} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setFDraft(null)}>
              Cancel
            </Button>
            <Button onClick={submitFaq}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
