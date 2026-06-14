import { VENDOR_TYPE_META } from "@/lib/constants";
import type { VendorType } from "@/lib/types";
import { cn } from "@/lib/utils";

interface VendorTypeBadgeProps {
  type: VendorType;
  showIcon?: boolean;
  className?: string;
}

/** Category chip for a vendor / operational contact. */
export function VendorTypeBadge({
  type,
  showIcon = true,
  className,
}: VendorTypeBadgeProps) {
  const meta = VENDOR_TYPE_META[type];
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
