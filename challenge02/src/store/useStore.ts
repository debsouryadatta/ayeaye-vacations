import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Comment,
  Issue,
  IssueStatus,
  Priority,
  Property,
  TimelineEvent,
  TimelineEventType,
  Vendor,
} from "@/lib/types";
import { newId, nowIso } from "@/lib/format";
import { seedIssues, seedProperties, seedVendors } from "@/data/mock-data";

/* -------------------------------------------------------------------------- */
/*  Input shapes (what forms produce)                                          */
/* -------------------------------------------------------------------------- */

export type PropertyInput = Omit<Property, "id" | "createdAt">;
export type VendorInput = Omit<Vendor, "id" | "createdAt">;

export interface IssueInput {
  title: string;
  description: string;
  propertyId: string;
  priority: Priority;
  category: Issue["category"];
  reportedBy: string;
  reportedVia: Issue["reportedVia"];
  /** Optional: assign a vendor at creation time. */
  vendorId?: string | null;
}

/** The host acting in the UI. Automated events use "REMI". */
const HOST = "You";

/** Statuses early enough that assigning a vendor should advance to "Vendor Assigned". */
const PRE_ASSIGNMENT_STATUSES: IssueStatus[] = [
  "Reported",
  "Diagnosing",
  "Vendor Needed",
];

/* -------------------------------------------------------------------------- */
/*  Store contract                                                             */
/* -------------------------------------------------------------------------- */

interface StoreState {
  properties: Property[];
  vendors: Vendor[];
  issues: Issue[];

  // Properties
  addProperty: (input: PropertyInput) => Property;
  updateProperty: (id: string, patch: Partial<PropertyInput>) => void;
  deleteProperty: (id: string) => void;

  // Vendors
  addVendor: (input: VendorInput) => Vendor;
  updateVendor: (id: string, patch: Partial<VendorInput>) => void;
  deleteVendor: (id: string) => void;

  // Issues
  addIssue: (input: IssueInput) => Issue;
  setStatus: (issueId: string, status: IssueStatus, actor?: string) => void;
  setPriority: (issueId: string, priority: Priority, actor?: string) => void;
  assignVendor: (issueId: string, vendorId: string, actor?: string) => void;
  unassignVendor: (issueId: string, actor?: string) => void;
  addComment: (issueId: string, body: string, author?: string) => void;

  // Demo helper
  resetData: () => void;
}

/* -------------------------------------------------------------------------- */
/*  Pure helpers                                                               */
/* -------------------------------------------------------------------------- */

function makeEvent(
  type: TimelineEventType,
  message: string,
  actor: string,
): TimelineEvent {
  return { id: newId("tl"), type, message, actor, createdAt: nowIso() };
}

/** Immutably apply a transform to a single issue, always bumping updatedAt. */
function withIssue(
  issues: Issue[],
  issueId: string,
  transform: (issue: Issue) => Issue,
): Issue[] {
  return issues.map((issue) =>
    issue.id === issueId
      ? { ...transform(issue), updatedAt: nowIso() }
      : issue,
  );
}

/* -------------------------------------------------------------------------- */
/*  Store                                                                      */
/* -------------------------------------------------------------------------- */

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      properties: seedProperties,
      vendors: seedVendors,
      issues: seedIssues,

      /* ----------------------------- Properties ----------------------------- */
      addProperty: (input) => {
        const property: Property = {
          ...input,
          id: newId("prop"),
          createdAt: nowIso(),
        };
        set((s) => ({ properties: [property, ...s.properties] }));
        return property;
      },

      updateProperty: (id, patch) =>
        set((s) => ({
          properties: s.properties.map((p) =>
            p.id === id ? { ...p, ...patch } : p,
          ),
        })),

      deleteProperty: (id) =>
        set((s) => ({
          properties: s.properties.filter((p) => p.id !== id),
        })),

      /* ------------------------------ Vendors ------------------------------- */
      addVendor: (input) => {
        const vendor: Vendor = {
          ...input,
          id: newId("ven"),
          createdAt: nowIso(),
        };
        set((s) => ({ vendors: [vendor, ...s.vendors] }));
        return vendor;
      },

      updateVendor: (id, patch) =>
        set((s) => ({
          vendors: s.vendors.map((v) => (v.id === id ? { ...v, ...patch } : v)),
        })),

      deleteVendor: (id) =>
        set((s) => {
          const vendor = s.vendors.find((v) => v.id === id);
          const vendorName = vendor?.name ?? "Vendor";
          // Gracefully detach the vendor from any issues it was assigned to,
          // reverting "Vendor Assigned" issues back to "Vendor Needed".
          const issues = s.issues.map((issue) => {
            if (issue.vendorId !== id) return issue;
            const timeline = [
              ...issue.timeline,
              makeEvent(
                "vendor_unassigned",
                `${vendorName} removed (vendor deleted from directory)`,
                HOST,
              ),
            ];
            const status: IssueStatus =
              issue.status === "Vendor Assigned" ? "Vendor Needed" : issue.status;
            return {
              ...issue,
              vendorId: null,
              status,
              timeline,
              updatedAt: nowIso(),
            };
          });
          return {
            vendors: s.vendors.filter((v) => v.id !== id),
            issues,
          };
        }),

      /* ------------------------------ Issues -------------------------------- */
      addIssue: (input) => {
        const id = newId("iss");
        const now = nowIso();
        const viaLabel =
          input.reportedVia === "Manual"
            ? "manually"
            : `via ${input.reportedVia}`;
        const timeline: TimelineEvent[] = [
          {
            id: newId("tl"),
            type: "created",
            message: `Issue reported ${viaLabel} by ${input.reportedBy}`,
            actor: input.reportedVia === "Manual" ? HOST : "REMI",
            createdAt: now,
          },
        ];

        let status: IssueStatus = "Reported";
        const vendorId: string | null = input.vendorId ?? null;

        if (vendorId) {
          const vendor = get().vendors.find((v) => v.id === vendorId);
          status = "Vendor Assigned";
          timeline.push(
            makeEvent(
              "vendor_assigned",
              `${vendor?.name ?? "Vendor"} assigned as vendor`,
              HOST,
            ),
          );
        }

        const issue: Issue = {
          id,
          title: input.title,
          description: input.description,
          propertyId: input.propertyId,
          status,
          priority: input.priority,
          category: input.category,
          vendorId,
          reportedBy: input.reportedBy,
          reportedVia: input.reportedVia,
          createdAt: now,
          updatedAt: now,
          comments: [],
          timeline,
        };

        set((s) => ({ issues: [issue, ...s.issues] }));
        return issue;
      },

      setStatus: (issueId, status, actor = HOST) =>
        set((s) => ({
          issues: withIssue(s.issues, issueId, (issue) => {
            if (issue.status === status) return issue;
            return {
              ...issue,
              status,
              timeline: [
                ...issue.timeline,
                makeEvent(
                  "status_changed",
                  `Status changed from ${issue.status} to ${status}`,
                  actor,
                ),
              ],
            };
          }),
        })),

      setPriority: (issueId, priority, actor = HOST) =>
        set((s) => ({
          issues: withIssue(s.issues, issueId, (issue) => {
            if (issue.priority === priority) return issue;
            return {
              ...issue,
              priority,
              timeline: [
                ...issue.timeline,
                makeEvent(
                  "priority_changed",
                  `Priority changed from ${issue.priority} to ${priority}`,
                  actor,
                ),
              ],
            };
          }),
        })),

      assignVendor: (issueId, vendorId, actor = HOST) =>
        set((s) => {
          const vendor = s.vendors.find((v) => v.id === vendorId);
          return {
            issues: withIssue(s.issues, issueId, (issue) => {
              if (issue.vendorId === vendorId) return issue;
              const timeline = [
                ...issue.timeline,
                makeEvent(
                  "vendor_assigned",
                  `${vendor?.name ?? "Vendor"} assigned as vendor`,
                  actor,
                ),
              ];
              // Advance the lifecycle if the issue hadn't reached assignment yet.
              let status = issue.status;
              if (PRE_ASSIGNMENT_STATUSES.includes(issue.status)) {
                status = "Vendor Assigned";
                timeline.push(
                  makeEvent(
                    "status_changed",
                    `Status changed from ${issue.status} to Vendor Assigned`,
                    actor,
                  ),
                );
              }
              return { ...issue, vendorId, status, timeline };
            }),
          };
        }),

      unassignVendor: (issueId, actor = HOST) =>
        set((s) => {
          return {
            issues: withIssue(s.issues, issueId, (issue) => {
              if (!issue.vendorId) return issue;
              const vendor = s.vendors.find((v) => v.id === issue.vendorId);
              const timeline = [
                ...issue.timeline,
                makeEvent(
                  "vendor_unassigned",
                  `${vendor?.name ?? "Vendor"} unassigned`,
                  actor,
                ),
              ];
              // Keep the lifecycle consistent: an issue can't be "Vendor
              // Assigned" with no vendor, so revert it to "Vendor Needed".
              let status = issue.status;
              if (issue.status === "Vendor Assigned") {
                status = "Vendor Needed";
                timeline.push(
                  makeEvent(
                    "status_changed",
                    "Status changed from Vendor Assigned to Vendor Needed",
                    actor,
                  ),
                );
              }
              return { ...issue, vendorId: null, status, timeline };
            }),
          };
        }),

      addComment: (issueId, body, author = HOST) =>
        set((s) => ({
          issues: withIssue(s.issues, issueId, (issue) => {
            const comment: Comment = {
              id: newId("cm"),
              author,
              body,
              createdAt: nowIso(),
            };
            return {
              ...issue,
              comments: [...issue.comments, comment],
              timeline: [
                ...issue.timeline,
                makeEvent("comment_added", "Comment added", author),
              ],
            };
          }),
        })),

      /* ------------------------------- Demo --------------------------------- */
      resetData: () =>
        set({
          properties: seedProperties,
          vendors: seedVendors,
          issues: seedIssues,
        }),
    }),
    {
      name: "remi-portal-v1",
      version: 1,
    },
  ),
);

/* -------------------------------------------------------------------------- */
/*  Selector hooks (stable, reusable)                                          */
/* -------------------------------------------------------------------------- */

export const useProperties = () => useStore((s) => s.properties);
export const useVendors = () => useStore((s) => s.vendors);
export const useIssues = () => useStore((s) => s.issues);

export const useProperty = (id: string | undefined) =>
  useStore((s) => s.properties.find((p) => p.id === id));

export const useVendor = (id: string | null | undefined) =>
  useStore((s) => (id ? s.vendors.find((v) => v.id === id) : undefined));

export const useIssue = (id: string | undefined) =>
  useStore((s) => s.issues.find((i) => i.id === id));
