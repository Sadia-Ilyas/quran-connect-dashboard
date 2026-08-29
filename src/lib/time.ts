import type { ClassSlot } from "@/types/dashboard";

export const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const SHORT_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const GRACE_BEFORE_MIN = 10;
export const GRACE_AFTER_MIN = 15;

export function localTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
}

/** Next occurrence (or the currently running one) of a weekly slot, as a Date. */
export function nextOccurrence(slot: ClassSlot, from: Date = new Date()): Date {
  const [h, m] = slot.startUtc.split(":").map(Number);
  const base = new Date(
    Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate(), h, m, 0, 0),
  );
  const delta = (slot.dayOfWeek - base.getUTCDay() + 7) % 7;
  base.setUTCDate(base.getUTCDate() + delta);
  const endMs = base.getTime() + (slot.durationMinutes + GRACE_AFTER_MIN) * 60_000;
  if (endMs < from.getTime()) base.setUTCDate(base.getUTCDate() + 7);
  return base;
}

export function slotWindow(slot: ClassSlot, now: Date = new Date()) {
  const start = nextOccurrence(slot, now);
  const end = new Date(start.getTime() + slot.durationMinutes * 60_000);
  const opensAt = new Date(start.getTime() - GRACE_BEFORE_MIN * 60_000);
  const closesAt = new Date(end.getTime() + GRACE_AFTER_MIN * 60_000);
  const isOpen = now >= opensAt && now <= closesAt;
  const isLive = now >= start && now <= end;
  return { start, end, opensAt, closesAt, isOpen, isLive };
}

export function formatLocalTime(date: Date, tz?: string): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: tz,
  }).format(date);
}

export function formatLocalDateTime(date: Date, tz?: string): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: tz,
  }).format(date);
}

/** Local weekday + time label for a weekly slot (timezone-shifted). */
export function slotLocalLabel(slot: ClassSlot) {
  const d = nextOccurrence(slot);
  return {
    day: DAYS[d.getDay()],
    dayIndex: d.getDay(),
    time: formatLocalTime(d),
    endTime: formatLocalTime(new Date(d.getTime() + slot.durationMinutes * 60_000)),
  };
}

export function countdown(target: Date, now: Date = new Date()): string {
  let diff = Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000));
  const d = Math.floor(diff / 86400);
  diff -= d * 86400;
  const h = Math.floor(diff / 3600);
  diff -= h * 3600;
  const m = Math.floor(diff / 60);
  const s = diff - m * 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return d > 0 ? `${d}d ${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/** Schedule conflict guard: overlapping weekly slots for the same teacher. */
export function hasScheduleConflict(
  slots: ClassSlot[],
  candidate: Pick<ClassSlot, "teacherId" | "dayOfWeek" | "startUtc" | "durationMinutes">,
  ignoreId?: string,
): ClassSlot | null {
  const start = toMinutes(candidate.startUtc);
  const end = start + candidate.durationMinutes;
  return (
    slots.find((s) => {
      if (s.id === ignoreId) return false;
      if (s.teacherId !== candidate.teacherId) return false;
      if (s.dayOfWeek !== candidate.dayOfWeek) return false;
      const sStart = toMinutes(s.startUtc);
      return start < sStart + s.durationMinutes && sStart < end;
    }) ?? null
  );
}

/** Convert a local "HH:mm" on a given local weekday to UTC day + "HH:mm". */
export function localSlotToUtc(dayOfWeek: number, localTime: string) {
  const [h, m] = localTime.split(":").map(Number);
  const now = new Date();
  const d = new Date(now);
  d.setDate(now.getDate() + ((dayOfWeek - now.getDay() + 7) % 7));
  d.setHours(h, m, 0, 0);
  return {
    dayOfWeek: d.getUTCDay(),
    startUtc: `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`,
  };
}

export function openMeeting(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}
