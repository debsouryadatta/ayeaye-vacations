import { UserX } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VENDOR_TYPE_META } from "@/lib/constants";
import type { Vendor, VendorType } from "@/lib/types";
import { cn } from "@/lib/utils";

const NONE = "__none__";

interface VendorAssignSelectProps {
  value: string | null;
  vendors: Vendor[];
  /** When set, vendors of this type are surfaced in a "Suggested" group first. */
  suggestedType?: VendorType | null;
  onAssign: (vendorId: string) => void;
  onUnassign: () => void;
  size?: "sm" | "default";
  className?: string;
  placeholder?: string;
  id?: string;
  "aria-label"?: string;
}

function VendorOption({ vendor }: { vendor: Vendor }) {
  const meta = VENDOR_TYPE_META[vendor.type];
  const Icon = meta.icon;
  return (
    <span className="flex items-center gap-2">
      <span
        className={cn(
          "flex size-5 items-center justify-center rounded-full",
          meta.avatar,
        )}
      >
        <Icon className="size-3" />
      </span>
      <span className="font-medium">{vendor.name}</span>
      <span className="text-muted-foreground">· {vendor.type}</span>
    </span>
  );
}

/** Assign a vendor to an issue, sourced from the configured vendor directory. */
export function VendorAssignSelect({
  value,
  vendors,
  suggestedType,
  onAssign,
  onUnassign,
  size = "default",
  className,
  placeholder = "Assign a vendor…",
  id,
  "aria-label": ariaLabel,
}: VendorAssignSelectProps) {
  const suggested = suggestedType
    ? vendors.filter((v) => v.type === suggestedType)
    : [];
  const suggestedIds = new Set(suggested.map((v) => v.id));
  const others = vendors.filter((v) => !suggestedIds.has(v.id));

  return (
    <Select
      value={value ?? NONE}
      onValueChange={(v) => (v === NONE ? onUnassign() : onAssign(v))}
    >
      <SelectTrigger
        id={id}
        aria-label={ariaLabel}
        size={size}
        className={cn("w-full", className)}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE}>
          <span className="flex items-center gap-2 text-muted-foreground">
            <span className="flex size-5 items-center justify-center rounded-full bg-muted">
              <UserX className="size-3" />
            </span>
            Unassigned
          </span>
        </SelectItem>

        {suggested.length > 0 && (
          <>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel>Suggested · {suggestedType}</SelectLabel>
              {suggested.map((vendor) => (
                <SelectItem key={vendor.id} value={vendor.id}>
                  <VendorOption vendor={vendor} />
                </SelectItem>
              ))}
            </SelectGroup>
          </>
        )}

        {others.length > 0 && (
          <>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel>
                {suggested.length > 0 ? "Other vendors" : "All vendors"}
              </SelectLabel>
              {others.map((vendor) => (
                <SelectItem key={vendor.id} value={vendor.id}>
                  <VendorOption vendor={vendor} />
                </SelectItem>
              ))}
            </SelectGroup>
          </>
        )}
      </SelectContent>
    </Select>
  );
}
