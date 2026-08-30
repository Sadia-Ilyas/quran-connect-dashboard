import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader, EmptyState, usePagination, PaginationBar } from "@/components/dashboard/ui-kit";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDashboard } from "@/context/DashboardContext";
import type { InquiryStatus } from "@/types/dashboard";

export const Route = createFileRoute("/admin/contact-inquiries")({
  head: () => ({
    meta: [
      { title: "Contact Inquiries — Quran Academy Admin" },
      { name: "description", content: "Review and resolve messages sent through the contact form." },
      { property: "og:title", content: "Contact Inquiries — Quran Academy Admin" },
      { property: "og:description", content: "Review and resolve contact form messages." },
    ],
  }),
  component: Inquiries,
});

function Inquiries() {
  const { inquiries, updateInquiry } = useDashboard();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return inquiries.filter(
      (i) =>
        !q ||
        i.name.toLowerCase().includes(q) ||
        i.email.toLowerCase().includes(q) ||
        i.subject.toLowerCase().includes(q),
    );
  }, [inquiries, query]);
  const { slice, page, pageCount, total, setPage } = usePagination(filtered);

  const setStatus = (id: string, status: InquiryStatus) => {
    updateInquiry(id, { status });
    toast.success(`Marked as ${status}`);
  };

  return (
    <div>
      <PageHeader title="Contact inquiries" description="Messages received from the public website." />
      <div className="app-card">
        <div className="border-b border-border p-4">
          <Input
            placeholder="Search inquiries"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="sm:max-w-xs"
          />
        </div>
        {total === 0 ? (
          <EmptyState title="No inquiries found" />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>From</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {slice.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell>
                      <p className="font-medium">{i.name}</p>
                      <p className="text-xs text-muted-foreground">{i.email}</p>
                    </TableCell>
                    <TableCell className="max-w-md">
                      <p className="text-sm font-medium">{i.subject}</p>
                      <p className="text-xs text-muted-foreground">{i.message}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={i.status === "Resolved" ? "default" : "secondary"}>
                        {i.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="space-x-2 text-right">
                      <Button size="sm" variant="outline" onClick={() => setStatus(i.id, "Resolved")}>
                        Resolve
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setStatus(i.id, "Spam")}>
                        Spam
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
    </div>
  );
}
