import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";

/** Generate a prefixed, collision-resistant id, e.g. "iss_a1b2c3". */
export function newId(prefix: string): string {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 10)
      : Math.random().toString(36).slice(2, 12);
  return `${prefix}_${rand}`;
}

/** Current time as an ISO string — single source of truth for timestamps. */
export const nowIso = (): string => new Date().toISOString();

/** "2 hours ago", "3 days ago" — for last-updated / activity stamps. */
export function relativeTime(iso: string): string {
  return formatDistanceToNow(new Date(iso), { addSuffix: true });
}

/** "Jun 12, 2026" */
export function formatDate(iso: string): string {
  return format(new Date(iso), "MMM d, yyyy");
}

/** "Jun 12, 2026 · 3:42 PM" */
export function formatDateTime(iso: string): string {
  return format(new Date(iso), "MMM d, yyyy · h:mm a");
}

/** Friendly, context-aware stamp used in comments + timeline. */
export function smartDateTime(iso: string): string {
  const d = new Date(iso);
  if (isToday(d)) return `Today at ${format(d, "h:mm a")}`;
  if (isYesterday(d)) return `Yesterday at ${format(d, "h:mm a")}`;
  return format(d, "MMM d, yyyy · h:mm a");
}

/** Up-to-two-letter initials for avatars, e.g. "Mike Johnson" -> "MJ". */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Format a property's bed/bath into a compact label, e.g. "3 BR · 2 BA". */
export function bedBath(bedrooms: number, bathrooms: number): string {
  return `${bedrooms} BR · ${bathrooms} BA`;
}
