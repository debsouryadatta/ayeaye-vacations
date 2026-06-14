import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, ClipboardList, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, EmptyState } from "@/components/shared";
import { StatsRow } from "@/components/dashboard/StatsRow";
import { IssueCard } from "@/components/dashboard/IssueCard";
import { IssueFilters } from "@/components/dashboard/IssueFilters";
import { IssueFormDialog } from "@/components/issues/IssueFormDialog";
import {
  DEFAULT_FILTERS,
  filterAndSortIssues,
  isFilterActive,
  type IssueFilterState,
} from "@/lib/issue-filtering";
import { useIssues, useProperties, useVendors } from "@/store/useStore";

export function DashboardPage() {
  const issues = useIssues();
  const properties = useProperties();
  const vendors = useVendors();

  // Allow deep-linking a property filter, e.g. /?property=prop_xxx from a card.
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState<IssueFilterState>(() => ({
    ...DEFAULT_FILTERS,
    propertyId: searchParams.get("property") ?? "all",
  }));
  const patch = (p: Partial<IssueFilterState>) =>
    setFilters((f) => ({ ...f, ...p }));

  const propertyName = useMemo(
    () => new Map(properties.map((p) => [p.id, p.name])),
    [properties],
  );
  const vendorById = useMemo(
    () => new Map(vendors.map((v) => [v.id, v])),
    [vendors],
  );

  const filtered = useMemo(
    () => filterAndSortIssues(issues, filters),
    [issues, filters],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Maintenance Dashboard"
        description="Track and triage every active maintenance issue across your portfolio."
        actions={
          <IssueFormDialog
            trigger={
              <Button>
                <Plus className="size-4" />
                New Issue
              </Button>
            }
          />
        }
      />

      <StatsRow issues={issues} />

      <div className="space-y-4">
        <IssueFilters
          value={filters}
          properties={properties}
          onChange={patch}
          onClear={() => setFilters(DEFAULT_FILTERS)}
        />

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">
              {filtered.length}
            </span>{" "}
            of {issues.length} {issues.length === 1 ? "issue" : "issues"}
          </p>
        </div>

        {filtered.length === 0 ? (
          isFilterActive(filters) ? (
            <EmptyState
              icon={SearchX}
              title="No issues match your filters"
              description="Try adjusting or clearing your search and filters."
              action={
                <Button variant="outline" onClick={() => setFilters(DEFAULT_FILTERS)}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={ClipboardList}
              title="No maintenance issues yet"
              description="When issues come in via SMS or WhatsApp — or you log one manually — they'll show up here."
              action={
                <IssueFormDialog
                  trigger={
                    <Button>
                      <Plus className="size-4" />
                      New Issue
                    </Button>
                  }
                />
              }
            />
          )
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                propertyName={propertyName.get(issue.propertyId) ?? "Unknown property"}
                vendor={issue.vendorId ? vendorById.get(issue.vendorId) : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
