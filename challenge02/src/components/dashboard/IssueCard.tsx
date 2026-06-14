import { Link } from "react-router-dom";
import { Building2, Clock, UserPlus } from "lucide-react";
import type { Issue, Vendor } from "@/lib/types";
import { relativeTime } from "@/lib/format";
import {
  CategoryBadge,
  PriorityBadge,
  StatusBadge,
  VendorAvatar,
} from "@/components/shared";

interface IssueCardProps {
  issue: Issue;
  propertyName: string;
  vendor?: Vendor;
}

/** A single maintenance issue, surfaced as a scannable, clickable card. */
export function IssueCard({ issue, propertyName, vendor }: IssueCardProps) {
  return (
    <Link
      to={`/issues/${issue.id}`}
      className="group flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-xs transition-all hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <div className="flex items-center justify-between gap-2">
        <StatusBadge status={issue.status} size="sm" />
        <PriorityBadge priority={issue.priority} size="sm" />
      </div>

      <div className="flex-1 space-y-1.5">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground group-hover:text-primary">
          {issue.title}
        </h3>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Building2 className="size-3.5 shrink-0" />
          <span className="truncate">{propertyName}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <CategoryBadge category={issue.category} />
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
        {vendor ? (
          <div className="flex min-w-0 items-center gap-2">
            <VendorAvatar vendor={vendor} size="sm" />
            <div className="min-w-0 leading-tight">
              <div className="truncate text-xs font-medium text-foreground">
                {vendor.name}
              </div>
              <div className="truncate text-[11px] text-muted-foreground">
                {vendor.type}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="flex size-7 items-center justify-center rounded-full border border-dashed border-border">
              <UserPlus className="size-3.5" />
            </span>
            Unassigned
          </div>
        )}

        <div className="flex shrink-0 items-center gap-1 text-[11px] text-muted-foreground">
          <Clock className="size-3" />
          {relativeTime(issue.updatedAt)}
        </div>
      </div>
    </Link>
  );
}
