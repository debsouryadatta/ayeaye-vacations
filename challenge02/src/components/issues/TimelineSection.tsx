import {
  Plus,
  ArrowRight,
  Flag,
  UserCheck,
  UserX,
  MessageSquare,
  History,
  type LucideIcon,
} from "lucide-react";
import type { TimelineEvent, TimelineEventType } from "@/lib/types";
import { smartDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

const EVENT_STYLE: Record<
  TimelineEventType,
  { icon: LucideIcon; wrap: string }
> = {
  created: { icon: Plus, wrap: "bg-indigo-100 text-indigo-700" },
  status_changed: { icon: ArrowRight, wrap: "bg-blue-100 text-blue-700" },
  priority_changed: { icon: Flag, wrap: "bg-amber-100 text-amber-700" },
  vendor_assigned: { icon: UserCheck, wrap: "bg-emerald-100 text-emerald-700" },
  vendor_unassigned: { icon: UserX, wrap: "bg-slate-100 text-slate-600" },
  comment_added: { icon: MessageSquare, wrap: "bg-violet-100 text-violet-700" },
};

export function TimelineSection({ timeline }: { timeline: TimelineEvent[] }) {
  // Most recent activity first.
  const events = [...timeline].reverse();

  return (
    <section className="rounded-xl border border-border bg-card shadow-xs">
      <header className="flex items-center gap-2 border-b border-border px-5 py-3.5">
        <History className="size-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold">Activity Timeline</h2>
      </header>

      <ol className="px-5 py-4">
        {events.map((event, idx) => {
          const style = EVENT_STYLE[event.type];
          const Icon = style.icon;
          const isLast = idx === events.length - 1;
          return (
            <li key={event.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full",
                    style.wrap,
                  )}
                >
                  <Icon className="size-3.5" />
                </span>
                {!isLast && <span className="w-px flex-1 bg-border" />}
              </div>
              <div className={cn("min-w-0", isLast ? "pb-0" : "pb-5")}>
                <p className="text-sm leading-snug text-foreground">
                  {event.message}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {event.actor} · {smartDateTime(event.createdAt)}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
