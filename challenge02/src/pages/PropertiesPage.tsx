import { useMemo } from "react";
import { Plus, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, EmptyState } from "@/components/shared";
import { PropertyCard } from "@/components/properties/PropertyCard";
import { PropertyFormDialog } from "@/components/properties/PropertyFormDialog";
import { isOpenStatus } from "@/lib/constants";
import { useIssues, useProperties } from "@/store/useStore";

export function PropertiesPage() {
  const properties = useProperties();
  const issues = useIssues();

  const counts = useMemo(() => {
    const total = new Map<string, number>();
    const open = new Map<string, number>();
    for (const issue of issues) {
      total.set(issue.propertyId, (total.get(issue.propertyId) ?? 0) + 1);
      if (isOpenStatus(issue.status)) {
        open.set(issue.propertyId, (open.get(issue.propertyId) ?? 0) + 1);
      }
    }
    return { total, open };
  }, [issues]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Properties"
        description="Your managed portfolio. Add or edit the homes REMI keeps an eye on."
        actions={
          <PropertyFormDialog
            trigger={
              <Button>
                <Plus className="size-4" />
                Add Property
              </Button>
            }
          />
        }
      />

      {properties.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No properties yet"
          description="Add your first property to start tracking its maintenance."
          action={
            <PropertyFormDialog
              trigger={
                <Button>
                  <Plus className="size-4" />
                  Add Property
                </Button>
              }
            />
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              issueCount={counts.total.get(property.id) ?? 0}
              openIssueCount={counts.open.get(property.id) ?? 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
