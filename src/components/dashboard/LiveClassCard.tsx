import { CalendarClock, Radio, Video } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { countdown, formatLocalDateTime, localTimezone, openMeeting, slotWindow } from "@/lib/time";
import type { ClassSlot } from "@/types/dashboard";

interface Props {
  slot: ClassSlot | null;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  compact?: boolean;
}

export function LiveClassCard({
  slot,
  title,
  subtitle,
  actionLabel = "Join Live Class",
  compact,
}: Props) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!slot) {
    return (
      <div className="app-card p-6">
        <p className="text-sm font-medium">No upcoming class scheduled</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Once a weekly slot is assigned it will appear here with a live countdown.
        </p>
      </div>
    );
  }

  if (!now) {
    return <div className="app-card h-40 animate-pulse" />;
  }

  const { start, isOpen, isLive } = slotWindow(slot, now);

  return (
    <div className="app-card hero-gradient overflow-hidden p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">{title}</h2>
            {isLive ? (
              <Badge className="gap-1 bg-destructive text-destructive-foreground">
                <Radio className="size-3" /> LIVE
              </Badge>
            ) : isOpen ? (
              <Badge className="bg-primary text-primary-foreground">Starting soon</Badge>
            ) : (
              <Badge variant="secondary">Scheduled</Badge>
            )}
          </div>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarClock className="size-4 text-primary" />
            {formatLocalDateTime(start)} · {slot.durationMinutes} min
            <span className="hidden sm:inline">· {localTimezone()}</span>
          </p>
        </div>

        {!compact && (
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {isLive ? "In progress" : "Starts in"}
            </p>
            <p className="text-gradient text-3xl font-bold tabular-nums">
              {isLive ? "Now" : countdown(start, now)}
            </p>
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button
          size="lg"
          disabled={!isOpen}
          onClick={() => {
            openMeeting(slot.meetingUrl);
            toast.success("Opening meeting room in a new tab");
          }}
        >
          <Video className="mr-2 size-4" />
          {actionLabel}
        </Button>
        <p className="text-xs text-muted-foreground">
          {isOpen
            ? "Room is open — link closes 15 minutes after the class ends."
            : "The join button unlocks 10 minutes before start time."}
        </p>
      </div>
    </div>
  );
}
