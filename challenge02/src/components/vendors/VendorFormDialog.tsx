import { useState, type ReactNode } from "react";
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
import { VENDOR_TYPES } from "@/lib/constants";
import type { Vendor, VendorType } from "@/lib/types";
import { useStore } from "@/store/useStore";

interface FormState {
  name: string;
  type: VendorType;
  phone: string;
  email: string;
  serviceArea: string;
  notes: string;
}

function toForm(vendor?: Vendor): FormState {
  return {
    name: vendor?.name ?? "",
    type: vendor?.type ?? "Handyman",
    phone: vendor?.phone ?? "",
    email: vendor?.email ?? "",
    serviceArea: vendor?.serviceArea ?? "",
    notes: vendor?.notes ?? "",
  };
}

interface VendorFormDialogProps {
  trigger: ReactNode;
  /** When provided, the dialog edits this vendor instead of creating one. */
  vendor?: Vendor;
}

export function VendorFormDialog({ trigger, vendor }: VendorFormDialogProps) {
  const addVendor = useStore((s) => s.addVendor);
  const updateVendor = useStore((s) => s.updateVendor);

  const isEdit = Boolean(vendor);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(() => toForm(vendor));

  // Sync the form with the latest record each time the dialog opens.
  const handleOpenChange = (next: boolean) => {
    if (next) setForm(toForm(vendor));
    setOpen(next);
  };

  const patch = (p: Partial<FormState>) => setForm((f) => ({ ...f, ...p }));
  const canSubmit = form.name.trim() !== "";

  const handleSubmit = () => {
    if (!canSubmit) return;
    const payload = {
      name: form.name.trim(),
      type: form.type,
      phone: form.phone.trim(),
      email: form.email.trim(),
      serviceArea: form.serviceArea.trim(),
      notes: form.notes.trim(),
    };
    if (isEdit && vendor) {
      updateVendor(vendor.id, payload);
      toast.success("Vendor updated", { description: payload.name });
    } else {
      addVendor(payload);
      toast.success("Vendor added", { description: payload.name });
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit vendor" : "Add vendor"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this contact's details."
              : "Add an operational contact you can assign to maintenance issues."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="ven-name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="ven-name"
                value={form.name}
                onChange={(e) => patch({ name: e.target.value })}
                placeholder="e.g. ABC Plumbing"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ven-type">Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) => patch({ type: v as VendorType })}
              >
                <SelectTrigger id="ven-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VENDOR_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="ven-phone">Phone</Label>
              <Input
                id="ven-phone"
                value={form.phone}
                onChange={(e) => patch({ phone: e.target.value })}
                placeholder="+1 (555) 555-0123"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ven-email">Email</Label>
              <Input
                id="ven-email"
                type="email"
                value={form.email}
                onChange={(e) => patch({ email: e.target.value })}
                placeholder="name@company.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ven-area">Service area</Label>
            <Input
              id="ven-area"
              value={form.serviceArea}
              onChange={(e) => patch({ serviceArea: e.target.value })}
              placeholder="e.g. Aspen & Glenwood Springs, CO"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ven-notes">Notes</Label>
            <Textarea
              id="ven-notes"
              value={form.notes}
              onChange={(e) => patch({ notes: e.target.value })}
              placeholder="Availability, rates, reliability, payment preferences…"
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {isEdit ? "Save changes" : "Add vendor"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
