import { Link, useParams } from "react-router-dom";
import type { ReactNode } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  MapPin,
  User,
  CalendarPlus,
  Clock,
  Radio,
  SlidersHorizontal,
  Contact,
  FileText,
  PackageOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PageHeader,
  EmptyState,
  StatusBadge,
  PriorityBadge,
  CategoryBadge,
  StatusSelect,
  PrioritySelect,
  VendorAssignSelect,
  VendorTypeBadge,
  VendorAvatar,
} from "@/components/shared";
import { CommentsSection } from "@/components/issues/CommentsSection";
import { TimelineSection } from "@/components/issues/TimelineSection";
import { CATEGORY_TO_VENDOR_TYPE } from "@/lib/constants";
import { bedBath, formatDate, relativeTime, smartDateTime } from "@/lib/format";
import {
  useIssue,
  useProperty,
  useVendor,
  useVendors,
  useStore,
} from "@/store/useStore";

function SidebarCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Building2;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card shadow-xs">
      <header className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Icon className="size-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold">{title}</h2>
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}

function DetailRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Building2;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-2">
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="size-4" />
        {label}
      </span>
      <span className="min-w-0 text-right text-sm font-medium text-foreground">
        {children}
      </span>
    </div>
  );
}

export function IssueDetailPage() {
  const { issueId } = useParams();
  const issue = useIssue(issueId);
  const property = useProperty(issue?.propertyId);
  const vendor = useVendor(issue?.vendorId);
  const vendors = useVendors();

  const setStatus = useStore((s) => s.setStatus);
  const setPriority = useStore((s) => s.setPriority);
  const assignVendor = useStore((s) => s.assignVendor);
  const unassignVendor = useStore((s) => s.unassignVendor);

  if (!issue) {
    return (
      <EmptyState
        icon={PackageOpen}
        title="Issue not found"
        description="This issue may have been removed, or the link is incorrect."
        action={
          <Button asChild>
            <Link to="/">Back to dashboard</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to dashboard
          </Link>
        }
        title={issue.title}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={issue.status} />
            <PriorityBadge priority={issue.priority} />
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-xl border border-border bg-card p-5 shadow-xs">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <CategoryBadge category={issue.category} />
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                <Building2 className="size-3.5" />
                {property?.name ?? "Unknown property"}
              </span>
            </div>
            <h2 className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-foreground">
              <FileText className="size-4 text-muted-foreground" />
              Description
            </h2>
            <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
              {issue.description || "No description provided."}
            </p>
          </section>

          <CommentsSection issueId={issue.id} comments={issue.comments} />
          <TimelineSection timeline={issue.timeline} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <SidebarCard title="Manage" icon={SlidersHorizontal}>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="issue-status"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Status
                </label>
                <StatusSelect
                  id="issue-status"
                  value={issue.status}
                  onChange={(status) => {
                    setStatus(issue.id, status);
                    toast.success(`Status updated to ${status}`);
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="issue-priority"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Priority
                </label>
                <PrioritySelect
                  id="issue-priority"
                  value={issue.priority}
                  onChange={(priority) => {
                    setPriority(issue.id, priority);
                    toast.success(`Priority set to ${priority}`);
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="issue-vendor"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Assigned vendor
                </label>
                <VendorAssignSelect
                  id="issue-vendor"
                  value={issue.vendorId}
                  vendors={vendors}
                  suggestedType={CATEGORY_TO_VENDOR_TYPE[issue.category]}
                  onAssign={(vendorId) => {
                    assignVendor(issue.id, vendorId);
                    const v = vendors.find((x) => x.id === vendorId);
                    toast.success(`Assigned ${v?.name ?? "vendor"}`);
                  }}
                  onUnassign={() => {
                    unassignVendor(issue.id);
                    toast.success("Vendor unassigned");
                  }}
                />
              </div>
            </div>
          </SidebarCard>

          {vendor && (
            <SidebarCard title="Vendor Contact" icon={Contact}>
              <div className="flex items-center gap-3">
                <VendorAvatar vendor={vendor} size="lg" />
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-foreground">
                    {vendor.name}
                  </div>
                  <VendorTypeBadge type={vendor.type} className="mt-1" />
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <a
                  href={`tel:${vendor.phone}`}
                  className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Phone className="size-4" />
                  {vendor.phone}
                </a>
                <a
                  href={`mailto:${vendor.email}`}
                  className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Mail className="size-4" />
                  <span className="truncate">{vendor.email}</span>
                </a>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="size-4" />
                  {vendor.serviceArea}
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <a href={`tel:${vendor.phone}`}>
                    <Phone className="size-3.5" />
                    Call
                  </a>
                </Button>
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <a href={`mailto:${vendor.email}`}>
                    <Mail className="size-3.5" />
                    Email
                  </a>
                </Button>
              </div>
            </SidebarCard>
          )}

          <SidebarCard title="Details" icon={FileText}>
            <div className="divide-y divide-border">
              <DetailRow icon={Building2} label="Property">
                {property?.name ?? "—"}
              </DetailRow>
              {property && (
                <DetailRow icon={MapPin} label="Type">
                  {property.type} · {bedBath(property.bedrooms, property.bathrooms)}
                </DetailRow>
              )}
              <DetailRow icon={User} label="Reported by">
                {issue.reportedBy}
              </DetailRow>
              <DetailRow icon={Radio} label="Reported via">
                {issue.reportedVia}
              </DetailRow>
              <DetailRow icon={CalendarPlus} label="Created">
                {formatDate(issue.createdAt)}
              </DetailRow>
              <DetailRow icon={Clock} label="Last updated">
                <span title={smartDateTime(issue.updatedAt)}>
                  {relativeTime(issue.updatedAt)}
                </span>
              </DetailRow>
            </div>
          </SidebarCard>
        </div>
      </div>
    </div>
  );
}
