import { useMemo, useState } from "react";
import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, EmptyState } from "@/components/shared";
import { VendorCard } from "@/components/vendors/VendorCard";
import { VendorFormDialog } from "@/components/vendors/VendorFormDialog";
import { VENDOR_TYPES, isOpenStatus } from "@/lib/constants";
import type { VendorType } from "@/lib/types";
import { useIssues, useVendors } from "@/store/useStore";
import { cn } from "@/lib/utils";

type Filter = VendorType | "all";

export function VendorsPage() {
  const vendors = useVendors();
  const issues = useIssues();
  const [filter, setFilter] = useState<Filter>("all");

  // Active (open) assignments per vendor.
  const assignedCount = useMemo(() => {
    const map = new Map<string, number>();
    for (const issue of issues) {
      if (issue.vendorId && isOpenStatus(issue.status)) {
        map.set(issue.vendorId, (map.get(issue.vendorId) ?? 0) + 1);
      }
    }
    return map;
  }, [issues]);

  const countByType = useMemo(() => {
    const map = new Map<VendorType, number>();
    for (const v of vendors) map.set(v.type, (map.get(v.type) ?? 0) + 1);
    return map;
  }, [vendors]);

  const filtered =
    filter === "all" ? vendors : vendors.filter((v) => v.type === filter);

  const chips: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "All", count: vendors.length },
    ...VENDOR_TYPES.map((t) => ({
      key: t as Filter,
      label: t,
      count: countByType.get(t) ?? 0,
    })),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vendors & Contacts"
        description="Your operational network — cleaners, trades, and co-hosts you assign to issues."
        actions={
          <VendorFormDialog
            trigger={
              <Button>
                <Plus className="size-4" />
                Add Vendor
              </Button>
            }
          />
        }
      />

      {vendors.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No vendors yet"
          description="Add cleaners, plumbers, electricians, and co-hosts so you can assign them to issues."
          action={
            <VendorFormDialog
              trigger={
                <Button>
                  <Plus className="size-4" />
                  Add Vendor
                </Button>
              }
            />
          }
        />
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {chips.map((chip) => (
              <button
                key={chip.key}
                onClick={() => setFilter(chip.key)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                  filter === chip.key
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:bg-muted",
                )}
              >
                {chip.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 text-xs",
                    filter === chip.key
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {chip.count}
                </span>
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={Users}
              title={`No ${filter} vendors`}
              description="Add one, or pick a different category above."
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((vendor) => (
                <VendorCard
                  key={vendor.id}
                  vendor={vendor}
                  assignedCount={assignedCount.get(vendor.id) ?? 0}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
