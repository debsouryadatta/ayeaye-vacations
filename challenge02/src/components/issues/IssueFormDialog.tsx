import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VendorAssignSelect } from "@/components/shared";
import {
  CATEGORY_ORDER,
  CATEGORY_TO_VENDOR_TYPE,
  PRIORITY_ORDER,
} from "@/lib/constants";
import type { IssueCategory, Priority, ReportedVia } from "@/lib/types";
import { useStore, useProperties, useVendors } from "@/store/useStore";

const REPORTED_VIA: ReportedVia[] = ["Manual", "SMS", "WhatsApp", "Email"];

interface FormState {
  title: string;
  description: string;
  propertyId: string;
  category: IssueCategory;
  priority: Priority;
  reportedBy: string;
  reportedVia: ReportedVia;
  vendorId: string | null;
}

function initialState(propertyId: string): FormState {
  return {
    title: "",
    description: "",
    propertyId,
    category: "General",
    priority: "Medium",
    reportedBy: "You (Host)",
    reportedVia: "Manual",
    vendorId: null,
  };
}

export function IssueFormDialog({ trigger }: { trigger: ReactNode }) {
  const properties = useProperties();
  const vendors = useVendors();
  const addIssue = useStore((s) => s.addIssue);
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(() =>
    initialState(properties[0]?.id ?? ""),
  );

  // Reset the form to a clean slate each time the dialog opens.
  const handleOpenChange = (next: boolean) => {
    if (next) setForm(initialState(properties[0]?.id ?? ""));
    setOpen(next);
  };

  const patch = (p: Partial<FormState>) => setForm((f) => ({ ...f, ...p }));

  const canSubmit = form.title.trim() !== "" && form.propertyId !== "";

  const handleSubmit = () => {
    if (!canSubmit) return;
    const issue = addIssue({
      title: form.title.trim(),
      description: form.description.trim(),
      propertyId: form.propertyId,
      category: form.category,
      priority: form.priority,
      reportedBy: form.reportedBy.trim() || "You (Host)",
      reportedVia: form.reportedVia,
      vendorId: form.vendorId,
    });
    setOpen(false);
    toast.success("Issue created", { description: issue.title });
    navigate(`/issues/${issue.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New maintenance issue</DialogTitle>
          <DialogDescription>
            Log a work item. REMI will start its activity timeline automatically.
          </DialogDescription>
        </DialogHeader>

        {properties.length === 0 ? (
          <p className="py-6 text-sm text-muted-foreground">
            You need at least one property before you can log an issue. Add one
            from the Properties page first.
          </p>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="issue-title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="issue-title"
                value={form.title}
                onChange={(e) => patch({ title: e.target.value })}
                placeholder="e.g. Kitchen sink leaking under the cabinet"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="issue-desc">Description</Label>
              <Textarea
                id="issue-desc"
                value={form.description}
                onChange={(e) => patch({ description: e.target.value })}
                placeholder="What's happening, what the guest reported, any troubleshooting done…"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="new-issue-property">
                  Property <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={form.propertyId}
                  onValueChange={(v) => patch({ propertyId: v })}
                >
                  <SelectTrigger id="new-issue-property" className="w-full">
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-issue-category">Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) =>
                    patch({ category: v as IssueCategory, vendorId: null })
                  }
                >
                  <SelectTrigger id="new-issue-category" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_ORDER.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-issue-priority">Priority</Label>
                <Select
                  value={form.priority}
                  onValueChange={(v) => patch({ priority: v as Priority })}
                >
                  <SelectTrigger id="new-issue-priority" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_ORDER.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-issue-via">Reported via</Label>
                <Select
                  value={form.reportedVia}
                  onValueChange={(v) => patch({ reportedVia: v as ReportedVia })}
                >
                  <SelectTrigger id="new-issue-via" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REPORTED_VIA.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="issue-reporter">Reported by</Label>
              <Input
                id="issue-reporter"
                value={form.reportedBy}
                onChange={(e) => patch({ reportedBy: e.target.value })}
                placeholder="e.g. Laura M. (Guest)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-issue-vendor">Assign vendor (optional)</Label>
              <VendorAssignSelect
                id="new-issue-vendor"
                value={form.vendorId}
                vendors={vendors}
                suggestedType={CATEGORY_TO_VENDOR_TYPE[form.category]}
                onAssign={(vendorId) => patch({ vendorId })}
                onUnassign={() => patch({ vendorId: null })}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            Create issue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
