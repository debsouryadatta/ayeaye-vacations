import {
  AlertCircle,
  Search,
  UserSearch,
  UserCheck,
  Wrench,
  CheckCircle2,
  ShieldCheck,
  Archive,
  ArrowDown,
  Equal,
  ArrowUp,
  Flame,
  Droplets,
  Zap,
  Wind,
  Refrigerator,
  Sparkles,
  Home,
  HardHat,
  Users,
  Paintbrush,
  type LucideIcon,
} from "lucide-react";
import type {
  IssueCategory,
  IssueStatus,
  Priority,
  PropertyType,
  VendorType,
} from "./types";

/* -------------------------------------------------------------------------- */
/*  Status                                                                     */
/* -------------------------------------------------------------------------- */

export interface StatusMeta {
  label: IssueStatus;
  /** Soft badge style — literal classes so Tailwind keeps them at build time. */
  badge: string;
  dot: string;
  icon: LucideIcon;
  description: string;
}

/** Canonical lifecycle order. */
export const STATUS_ORDER: IssueStatus[] = [
  "Reported",
  "Diagnosing",
  "Vendor Needed",
  "Vendor Assigned",
  "In Progress",
  "Resolved",
  "Verified",
  "Closed",
];

export const STATUS_META: Record<IssueStatus, StatusMeta> = {
  Reported: {
    label: "Reported",
    badge: "bg-slate-50 text-slate-700 border-slate-200",
    dot: "bg-slate-400",
    icon: AlertCircle,
    description: "Issue has been logged and awaits triage.",
  },
  Diagnosing: {
    label: "Diagnosing",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
    icon: Search,
    description: "Host is investigating the root cause.",
  },
  "Vendor Needed": {
    label: "Vendor Needed",
    badge: "bg-orange-50 text-orange-700 border-orange-200",
    dot: "bg-orange-500",
    icon: UserSearch,
    description: "A vendor must be sourced for this job.",
  },
  "Vendor Assigned": {
    label: "Vendor Assigned",
    badge: "bg-indigo-50 text-indigo-700 border-indigo-200",
    dot: "bg-indigo-500",
    icon: UserCheck,
    description: "A vendor has accepted and is scheduled.",
  },
  "In Progress": {
    label: "In Progress",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
    icon: Wrench,
    description: "Work is actively underway.",
  },
  Resolved: {
    label: "Resolved",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    icon: CheckCircle2,
    description: "Vendor reports the work complete — awaiting host verification.",
  },
  Verified: {
    label: "Verified",
    badge: "bg-teal-50 text-teal-700 border-teal-200",
    dot: "bg-teal-500",
    icon: ShieldCheck,
    description: "Host has confirmed the fix holds.",
  },
  Closed: {
    label: "Closed",
    badge: "bg-zinc-100 text-zinc-600 border-zinc-200",
    dot: "bg-zinc-400",
    icon: Archive,
    description: "Ticket archived. No further action required.",
  },
};

/** Statuses that still need operator attention (drive the "open" metrics). */
export const OPEN_STATUSES: IssueStatus[] = [
  "Reported",
  "Diagnosing",
  "Vendor Needed",
  "Vendor Assigned",
  "In Progress",
  "Resolved",
];

/** Statuses where the work item is effectively done. */
export const CLOSED_STATUSES: IssueStatus[] = ["Verified", "Closed"];

/** Statuses where the host still needs to find/assign a vendor. */
export const NEEDS_VENDOR_STATUSES: IssueStatus[] = ["Vendor Needed"];

export const isOpenStatus = (status: IssueStatus): boolean =>
  OPEN_STATUSES.includes(status);

/* -------------------------------------------------------------------------- */
/*  Priority                                                                   */
/* -------------------------------------------------------------------------- */

export interface PriorityMeta {
  label: Priority;
  badge: string;
  dot: string;
  icon: LucideIcon;
  /** Higher rank = more urgent. Used for sorting. */
  rank: number;
}

export const PRIORITY_ORDER: Priority[] = ["Urgent", "High", "Medium", "Low"];

export const PRIORITY_META: Record<Priority, PriorityMeta> = {
  Low: {
    label: "Low",
    badge: "bg-slate-50 text-slate-600 border-slate-200",
    dot: "bg-slate-400",
    icon: ArrowDown,
    rank: 0,
  },
  Medium: {
    label: "Medium",
    badge: "bg-sky-50 text-sky-700 border-sky-200",
    dot: "bg-sky-500",
    icon: Equal,
    rank: 1,
  },
  High: {
    label: "High",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
    icon: ArrowUp,
    rank: 2,
  },
  Urgent: {
    label: "Urgent",
    badge: "bg-red-50 text-red-700 border-red-200",
    dot: "bg-red-500",
    icon: Flame,
    rank: 3,
  },
};

/* -------------------------------------------------------------------------- */
/*  Vendor types                                                               */
/* -------------------------------------------------------------------------- */

export interface VendorTypeMeta {
  label: VendorType;
  icon: LucideIcon;
  /** Soft chip style for the vendor category. */
  badge: string;
  /** Solid avatar tint. */
  avatar: string;
}

export const VENDOR_TYPES: VendorType[] = [
  "Cleaner",
  "Plumber",
  "Electrician",
  "Handyman",
  "General Contractor",
  "Co-Host",
];

export const VENDOR_TYPE_META: Record<VendorType, VendorTypeMeta> = {
  Cleaner: {
    label: "Cleaner",
    icon: Sparkles,
    badge: "bg-pink-50 text-pink-700 border-pink-200",
    avatar: "bg-pink-100 text-pink-700",
  },
  Plumber: {
    label: "Plumber",
    icon: Droplets,
    badge: "bg-sky-50 text-sky-700 border-sky-200",
    avatar: "bg-sky-100 text-sky-700",
  },
  Electrician: {
    label: "Electrician",
    icon: Zap,
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    avatar: "bg-amber-100 text-amber-700",
  },
  Handyman: {
    label: "Handyman",
    icon: Wrench,
    badge: "bg-violet-50 text-violet-700 border-violet-200",
    avatar: "bg-violet-100 text-violet-700",
  },
  "General Contractor": {
    label: "General Contractor",
    icon: HardHat,
    badge: "bg-orange-50 text-orange-700 border-orange-200",
    avatar: "bg-orange-100 text-orange-700",
  },
  "Co-Host": {
    label: "Co-Host",
    icon: Users,
    badge: "bg-indigo-50 text-indigo-700 border-indigo-200",
    avatar: "bg-indigo-100 text-indigo-700",
  },
};

/* -------------------------------------------------------------------------- */
/*  Issue categories                                                           */
/* -------------------------------------------------------------------------- */

export interface CategoryMeta {
  label: IssueCategory;
  icon: LucideIcon;
  badge: string;
}

export const CATEGORY_ORDER: IssueCategory[] = [
  "Plumbing",
  "Electrical",
  "HVAC",
  "Appliance",
  "Cleaning",
  "Structural",
  "General",
];

export const CATEGORY_META: Record<IssueCategory, CategoryMeta> = {
  Plumbing: { label: "Plumbing", icon: Droplets, badge: "bg-sky-50 text-sky-700 border-sky-200" },
  Electrical: { label: "Electrical", icon: Zap, badge: "bg-amber-50 text-amber-700 border-amber-200" },
  HVAC: { label: "HVAC", icon: Wind, badge: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  Appliance: { label: "Appliance", icon: Refrigerator, badge: "bg-violet-50 text-violet-700 border-violet-200" },
  Cleaning: { label: "Cleaning", icon: Sparkles, badge: "bg-pink-50 text-pink-700 border-pink-200" },
  Structural: { label: "Structural", icon: HardHat, badge: "bg-orange-50 text-orange-700 border-orange-200" },
  General: { label: "General", icon: Paintbrush, badge: "bg-slate-50 text-slate-700 border-slate-200" },
};

/**
 * Maps an issue category to the vendor type most likely to handle it.
 * Powers the "suggested vendors" hint in the assignment UI.
 */
export const CATEGORY_TO_VENDOR_TYPE: Record<IssueCategory, VendorType | null> = {
  Plumbing: "Plumber",
  Electrical: "Electrician",
  HVAC: "Handyman",
  Appliance: "Handyman",
  Cleaning: "Cleaner",
  Structural: "General Contractor",
  General: "Handyman",
};

/* -------------------------------------------------------------------------- */
/*  Property types                                                             */
/* -------------------------------------------------------------------------- */

export const PROPERTY_TYPES: PropertyType[] = [
  "Cabin",
  "Apartment",
  "House",
  "Villa",
  "Condo",
  "Cottage",
  "Loft",
  "Townhouse",
];

export const PROPERTY_TYPE_ICON: Record<PropertyType, LucideIcon> = {
  Cabin: Home,
  Apartment: Home,
  House: Home,
  Villa: Home,
  Condo: Home,
  Cottage: Home,
  Loft: Home,
  Townhouse: Home,
};
