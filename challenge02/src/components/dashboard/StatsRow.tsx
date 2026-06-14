import { Inbox, Flame, UserSearch, Wrench, type LucideIcon } from "lucide-react";
import type { Issue } from "@/lib/types";
import { isOpenStatus } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface Stat {
  label: string;
  value: number;
  hint: string;
  icon: LucideIcon;
  iconWrap: string;
}

function StatCard({ stat }: { stat: Stat }) {
  const Icon = stat.icon;
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-xs">
      <div
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-lg",
          stat.iconWrap,
        )}
      >
        <Icon className="size-5" />
      </div>
      <div className="min-w-0">
        <div className="text-2xl font-semibold leading-none tracking-tight">
          {stat.value}
        </div>
        <div className="mt-1 text-sm font-medium text-foreground">
          {stat.label}
        </div>
        <div className="text-xs text-muted-foreground">{stat.hint}</div>
      </div>
    </div>
  );
}

/** Top-of-dashboard summary metrics — the "what needs attention" glance. */
export function StatsRow({ issues }: { issues: Issue[] }) {
  const open = issues.filter((i) => isOpenStatus(i.status));
  const urgent = open.filter((i) => i.priority === "Urgent");
  const needsVendor = issues.filter((i) => i.status === "Vendor Needed");
  const inProgress = issues.filter((i) => i.status === "In Progress");

  const stats: Stat[] = [
    {
      label: "Open Issues",
      value: open.length,
      hint: "Currently need action",
      icon: Inbox,
      iconWrap: "bg-indigo-100 text-indigo-700",
    },
    {
      label: "Urgent",
      value: urgent.length,
      hint: "Open & time-critical",
      icon: Flame,
      iconWrap: "bg-red-100 text-red-700",
    },
    {
      label: "Awaiting Vendor",
      value: needsVendor.length,
      hint: "Need a vendor sourced",
      icon: UserSearch,
      iconWrap: "bg-orange-100 text-orange-700",
    },
    {
      label: "In Progress",
      value: inProgress.length,
      hint: "Work underway",
      icon: Wrench,
      iconWrap: "bg-blue-100 text-blue-700",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.label} stat={stat} />
      ))}
    </div>
  );
}
