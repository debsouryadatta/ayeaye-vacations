import type { Issue, IssueStatus, Priority } from "./types";
import { PRIORITY_META } from "./constants";

export type IssueSort = "recent" | "priority" | "created";

export interface IssueFilterState {
  search: string;
  status: IssueStatus | "all";
  priority: Priority | "all";
  propertyId: string | "all";
  sort: IssueSort;
}

export const DEFAULT_FILTERS: IssueFilterState = {
  search: "",
  status: "all",
  priority: "all",
  propertyId: "all",
  sort: "recent",
};

/** Whether any narrowing filter (not just sort) is active. */
export function isFilterActive(f: IssueFilterState): boolean {
  return (
    f.search.trim() !== "" ||
    f.status !== "all" ||
    f.priority !== "all" ||
    f.propertyId !== "all"
  );
}

/** Pure: apply the filter state to a list of issues and return a new sorted list. */
export function filterAndSortIssues(
  issues: Issue[],
  filters: IssueFilterState,
): Issue[] {
  const q = filters.search.trim().toLowerCase();

  const list = issues.filter((i) => {
    if (filters.status !== "all" && i.status !== filters.status) return false;
    if (filters.priority !== "all" && i.priority !== filters.priority)
      return false;
    if (filters.propertyId !== "all" && i.propertyId !== filters.propertyId)
      return false;
    if (
      q &&
      !i.title.toLowerCase().includes(q) &&
      !i.description.toLowerCase().includes(q)
    )
      return false;
    return true;
  });

  const sorted = [...list];
  if (filters.sort === "recent") {
    sorted.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  } else if (filters.sort === "created") {
    sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } else {
    sorted.sort((a, b) => {
      const diff =
        PRIORITY_META[b.priority].rank - PRIORITY_META[a.priority].rank;
      return diff !== 0 ? diff : b.updatedAt.localeCompare(a.updatedAt);
    });
  }
  return sorted;
}
