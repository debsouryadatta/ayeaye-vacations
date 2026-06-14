import { STATUS_META } from "@/lib/constants";
import type { IssueStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: IssueStatus;
  /** Hide the leading icon for tighter rows. */
  showIcon?: boolean;
  size?: "sm" | "md";
  className?: string;
}

/** Soft, color-coded pill for an issue's lifecycle state. */
export function StatusBadge({
  status,
  showIcon = true,
  size = "md",
  className,
}: StatusBadgeProps) {
  const meta = STATUS_META[status];
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium whitespace-nowrap",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        meta.badge,
        className,
      )}
    >
      {showIcon && <Icon className={size === "sm" ? "size-3" : "size-3.5"} />}
      {meta.label}
    </span>
  );
}
