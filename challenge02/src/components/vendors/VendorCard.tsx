import { Phone, Mail, MapPin, Pencil, Trash2, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  ConfirmDialog,
  VendorAvatar,
  VendorTypeBadge,
} from "@/components/shared";
import { VendorFormDialog } from "./VendorFormDialog";
import type { Vendor } from "@/lib/types";
import { useStore } from "@/store/useStore";

interface VendorCardProps {
  vendor: Vendor;
  assignedCount: number;
}

export function VendorCard({ vendor, assignedCount }: VendorCardProps) {
  const deleteVendor = useStore((s) => s.deleteVendor);

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-4 shadow-xs transition-shadow hover:shadow-md">
      <div className="flex items-start gap-3">
        <VendorAvatar vendor={vendor} size="lg" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold tracking-tight text-foreground">
            {vendor.name}
          </h3>
          <VendorTypeBadge type={vendor.type} className="mt-1.5" />
        </div>
        <div className="flex items-center gap-1">
          <VendorFormDialog
            vendor={vendor}
            trigger={
              <Button variant="ghost" size="icon-sm" aria-label="Edit vendor">
                <Pencil className="size-4" />
              </Button>
            }
          />
          <ConfirmDialog
            trigger={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Delete vendor"
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </Button>
            }
            title={`Delete ${vendor.name}?`}
            description={
              assignedCount > 0
                ? `This vendor is currently assigned to ${assignedCount} ${
                    assignedCount === 1 ? "issue" : "issues"
                  }. Deleting them will unassign those issues and revert any that were "Vendor Assigned" back to "Vendor Needed".`
                : "This permanently removes the vendor from your directory. This can't be undone."
            }
            confirmText="Delete"
            destructive
            onConfirm={() => {
              deleteVendor(vendor.id);
              toast.success("Vendor deleted");
            }}
          />
        </div>
      </div>

      <div className="mt-4 space-y-2 text-sm text-muted-foreground">
        {vendor.phone && (
          <a
            href={`tel:${vendor.phone}`}
            className="flex items-center gap-2 transition-colors hover:text-foreground"
          >
            <Phone className="size-4 shrink-0" />
            {vendor.phone}
          </a>
        )}
        {vendor.email && (
          <a
            href={`mailto:${vendor.email}`}
            className="flex items-center gap-2 transition-colors hover:text-foreground"
          >
            <Mail className="size-4 shrink-0" />
            <span className="truncate">{vendor.email}</span>
          </a>
        )}
        {vendor.serviceArea && (
          <div className="flex items-center gap-2">
            <MapPin className="size-4 shrink-0" />
            <span className="truncate">{vendor.serviceArea}</span>
          </div>
        )}
      </div>

      {vendor.notes && (
        <p className="mt-3 line-clamp-2 rounded-lg bg-muted/50 p-2.5 text-xs leading-relaxed text-muted-foreground">
          {vendor.notes}
        </p>
      )}

      <div className="mt-4 flex items-center gap-1.5 border-t border-border pt-3 text-xs text-muted-foreground">
        <ClipboardList className="size-3.5" />
        {assignedCount > 0
          ? `Assigned to ${assignedCount} active ${
              assignedCount === 1 ? "issue" : "issues"
            }`
          : "No active assignments"}
      </div>
    </div>
  );
}
