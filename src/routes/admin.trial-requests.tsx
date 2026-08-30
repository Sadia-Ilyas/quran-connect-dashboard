import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader, EmptyState, usePagination, PaginationBar } from "@/components/dashboard/ui-kit";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDashboard } from "@/context/DashboardContext";
import type { TrialRequest, TrialStatus } from "@/types/dashboard";

const STATUSES: TrialStatus[] = [
  "New",
  "Contacted",
  "Trial Scheduled",
  "Trial Completed",
  "Converted",
  "Not Interested",
  "Spam",
];

export const Route = createFileRoute("/admin/trial-requests")({
  head: () => ({
    meta: [
      { title: "Trial Requests — Quran Academy Admin" },
      { name: "description", content: "Track and convert incoming free trial class requests." },
      { property: "og:title", content: "Trial Requests — Quran Academy Admin" },
      { property: "og:description", content: "Track and convert free trial requests." },
    ],
  }),
  component: TrialRequests,
});

function TrialRequests() {
  const { trialRequests, updateTrialRequest, addTrialNote } = useDashboard();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [active, setActive] = useState<TrialRequest | null>(null);
  const [note, setNote] = useState("");

  const filtered = useMemo(
    () =>
      trialRequests.filter((t) => {
        const q = query.trim().toLowerCase();
        const matches =
          !q ||
          t.studentName.toLowerCase().includes(q) ||
          t.email.toLowerCase().includes(q) ||
          t.country.toLowerCase().includes(q);
        return matches && (status === "all" || t.status === status);
      }),
    [trialRequests, query, status],
  );
  const { slice, page, pageCount, total, setPage } = usePagination(filtered);
  const current = active ? trialRequests.find((t) => t.id === active.id) ?? active : null;

  return (
    <div>
      <PageHeader title="Trial requests" description="Every free-trial enquiry with its pipeline status." />

      <div className="app-card">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row">
          <Input
            placeholder="Search name, email or country"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="sm:max-w-xs"
          />
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="sm:w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {total === 0 ? (
          <EmptyState title="No trial requests match" description="Try clearing the filters." />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead className="hidden md:table-cell">Preferred</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {slice.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>
                      <p className="font-medium">{t.studentName}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.email} · {t.country}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm">{t.course}</TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                      {t.preferredDays.join(", ")} · {t.preferredTime} ({t.timezone})
                    </TableCell>
                    <TableCell>
                      <Badge variant={t.status === "Converted" ? "default" : "secondary"}>
                        {t.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => setActive(t)}>
                        Manage
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        <PaginationBar page={page} pageCount={pageCount} total={total} onChange={setPage} />
      </div>

      <Dialog open={!!current} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{current?.studentName}</DialogTitle>
          </DialogHeader>
          {current && (
            <div className="space-y-4">
              <div className="grid gap-1 text-sm">
                <p className="text-muted-foreground">{current.email} · {current.whatsapp}</p>
                <p className="text-muted-foreground">
                  {current.course} · {current.ageGroup}
                </p>
              </div>

              <div>
                <p className="mb-1.5 text-sm font-medium">Status</p>
                <Select
                  value={current.status}
                  onValueChange={(v) => {
                    updateTrialRequest(current.id, { status: v as TrialStatus });
                    toast.success(`Marked as ${v}`);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <p className="mb-1.5 text-sm font-medium">Notes</p>
                <ul className="mb-2 space-y-1 text-sm text-muted-foreground">
                  {current.notes.length === 0 && <li>No notes yet.</li>}
                  {current.notes.map((n, i) => (
                    <li key={i} className="rounded-md bg-secondary px-3 py-2">
                      {n}
                    </li>
                  ))}
                </ul>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a follow-up note"
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setActive(null)}>
              Close
            </Button>
            <Button
              disabled={!note.trim()}
              onClick={() => {
                if (current) addTrialNote(current.id, note.trim());
                setNote("");
                toast.success("Note added");
              }}
            >
              Add note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
