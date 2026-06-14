import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PRIORITY_ORDER, STATUS_ORDER } from "@/lib/constants";
import type { Property } from "@/lib/types";
import {
  isFilterActive,
  type IssueFilterState,
  type IssueSort,
} from "@/lib/issue-filtering";

interface IssueFiltersProps {
  value: IssueFilterState;
  properties: Property[];
  onChange: (patch: Partial<IssueFilterState>) => void;
  onClear: () => void;
}

export function IssueFilters({
  value,
  properties,
  onChange,
  onClear,
}: IssueFiltersProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={value.search}
          onChange={(e) => onChange({ search: e.target.value })}
          placeholder="Search issues by title or description…"
          aria-label="Search issues"
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={value.status}
          onValueChange={(v) =>
            onChange({ status: v as IssueFilterState["status"] })
          }
        >
          <SelectTrigger className="w-[150px]" size="sm" aria-label="Filter by status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUS_ORDER.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={value.priority}
          onValueChange={(v) =>
            onChange({ priority: v as IssueFilterState["priority"] })
          }
        >
          <SelectTrigger className="w-[140px]" size="sm" aria-label="Filter by priority">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            {PRIORITY_ORDER.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={value.propertyId}
          onValueChange={(v) => onChange({ propertyId: v })}
        >
          <SelectTrigger className="w-[160px]" size="sm" aria-label="Filter by property">
            <SelectValue placeholder="Property" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All properties</SelectItem>
            {properties.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={value.sort}
          onValueChange={(v) => onChange({ sort: v as IssueSort })}
        >
          <SelectTrigger className="w-[150px]" size="sm" aria-label="Sort issues">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Recently updated</SelectItem>
            <SelectItem value="priority">Priority</SelectItem>
            <SelectItem value="created">Newest first</SelectItem>
          </SelectContent>
        </Select>

        {isFilterActive(value) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-muted-foreground"
          >
            <X className="size-4" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
