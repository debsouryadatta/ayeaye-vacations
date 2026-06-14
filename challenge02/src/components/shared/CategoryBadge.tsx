import { CATEGORY_META } from "@/lib/constants";
import type { IssueCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CategoryBadgeProps {
  category: IssueCategory;
  showIcon?: boolean;
  className?: string;
}

/** Subtle chip for an issue's category (Plumbing, Electrical, …). */
export function CategoryBadge({
  category,
  showIcon = true,
  className,
}: CategoryBadgeProps) {
  const meta = CATEGORY_META[category];
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        meta.badge,
        className,
      )}
    >
      {showIcon && <Icon className="size-3.5" />}
      {meta.label}
    </span>
  );
}
