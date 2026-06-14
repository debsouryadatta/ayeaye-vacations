/**
 * REMI domain model.
 *
 * Three core entities power the operator portal:
 *  - Property: a unit the host manages.
 *  - Vendor:   an operational contact who can be assigned to fix issues.
 *  - Issue:    a maintenance work item, owning its own comments + timeline.
 *
 * Issues reference Properties and Vendors by id so the relationships stay
 * normalised and survive edits to the referenced records.
 */

export type PropertyType =
  | "Cabin"
  | "Apartment"
  | "House"
  | "Villa"
  | "Condo"
  | "Cottage"
  | "Loft"
  | "Townhouse";

export interface Property {
  id: string;
  name: string;
  address: string;
  type: PropertyType;
  bedrooms: number;
  bathrooms: number;
  /** Optional cover image used to make the portfolio scannable. */
  imageUrl?: string;
  createdAt: string;
}

export type VendorType =
  | "Cleaner"
  | "Plumber"
  | "Electrician"
  | "Handyman"
  | "General Contractor"
  | "Co-Host";

export interface Vendor {
  id: string;
  name: string;
  type: VendorType;
  phone: string;
  email: string;
  serviceArea: string;
  notes: string;
  createdAt: string;
}

/**
 * The eight lifecycle states a maintenance issue moves through, in order.
 * Kept as a string-literal union so the compiler enforces valid transitions.
 */
export type IssueStatus =
  | "Reported"
  | "Diagnosing"
  | "Vendor Needed"
  | "Vendor Assigned"
  | "In Progress"
  | "Resolved"
  | "Verified"
  | "Closed";

export type Priority = "Low" | "Medium" | "High" | "Urgent";

/** How REMI received the report — surfaced to mirror the real intake channels. */
export type ReportedVia = "SMS" | "WhatsApp" | "Email" | "Manual";

/** Coarse issue category, used for filtering and smart vendor suggestions. */
export type IssueCategory =
  | "Plumbing"
  | "Electrical"
  | "HVAC"
  | "Appliance"
  | "Cleaning"
  | "Structural"
  | "General";

export interface Comment {
  id: string;
  author: string;
  body: string;
  createdAt: string;
}

export type TimelineEventType =
  | "created"
  | "status_changed"
  | "priority_changed"
  | "vendor_assigned"
  | "vendor_unassigned"
  | "comment_added";

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  /** Human-readable summary, e.g. "Status changed from Reported to Diagnosing". */
  message: string;
  /** Who performed the action (host, co-host, or REMI for automated events). */
  actor: string;
  createdAt: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  propertyId: string;
  status: IssueStatus;
  priority: Priority;
  category: IssueCategory;
  /** null until a vendor is assigned. */
  vendorId: string | null;
  reportedBy: string;
  reportedVia: ReportedVia;
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
  timeline: TimelineEvent[];
}
