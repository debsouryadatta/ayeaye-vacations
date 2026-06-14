import { PRIORITY_META } from "@/lib/constants";
import type { Priority } from "@/lib/types";
import { cn } from "@/lib/utils";

interface PriorityBadgeProps {
  priority: Priority;
  showIcon?: boolean;
  size?: "sm" | "md";
  className?: string;
}

/** Color-coded urgency pill. */
export function PriorityBadge({
  priority,
  showIcon = true,
  size = "md",
  className,
}: PriorityBadgeProps) {
  const meta = PRIORITY_META[priority];
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
