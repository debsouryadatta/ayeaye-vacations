import { VENDOR_TYPE_META } from "@/lib/constants";
import type { Vendor } from "@/lib/types";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

interface VendorAvatarProps {
  vendor: Pick<Vendor, "name" | "type">;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZES = {
  sm: "size-7 text-[11px]",
  md: "size-9 text-xs",
  lg: "size-11 text-sm",
} as const;

/** Initials avatar tinted by the vendor's category. */
export function VendorAvatar({ vendor, size = "md", className }: VendorAvatarProps) {
  const meta = VENDOR_TYPE_META[vendor.type];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold",
        meta.avatar,
        SIZES[size],
        className,
      )}
      title={vendor.name}
    >
      {initials(vendor.name)}
    </span>
  );
}
