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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROPERTY_TYPES } from "@/lib/constants";
import type { Property, PropertyType } from "@/lib/types";
import { useStore } from "@/store/useStore";

interface FormState {
  name: string;
  address: string;
  type: PropertyType;
  bedrooms: number;
  bathrooms: number;
  imageUrl: string;
}

function toForm(property?: Property): FormState {
  return {
    name: property?.name ?? "",
    address: property?.address ?? "",
    type: property?.type ?? "House",
    bedrooms: property?.bedrooms ?? 1,
    bathrooms: property?.bathrooms ?? 1,
    imageUrl: property?.imageUrl ?? "",
  };
}

interface PropertyFormDialogProps {
  trigger: ReactNode;
  /** When provided, the dialog edits this property instead of creating one. */
  property?: Property;
}

export function PropertyFormDialog({ trigger, property }: PropertyFormDialogProps) {
  const addProperty = useStore((s) => s.addProperty);
  const updateProperty = useStore((s) => s.updateProperty);

  const isEdit = Boolean(property);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(() => toForm(property));

  // Sync the form with the latest record each time the dialog opens.
  const handleOpenChange = (next: boolean) => {
    if (next) setForm(toForm(property));
    setOpen(next);
  };

  const patch = (p: Partial<FormState>) => setForm((f) => ({ ...f, ...p }));

  const canSubmit = form.name.trim() !== "" && form.address.trim() !== "";

  const handleSubmit = () => {
    if (!canSubmit) return;
    const payload = {
      name: form.name.trim(),
      address: form.address.trim(),
      type: form.type,
      bedrooms: Math.max(0, form.bedrooms),
      bathrooms: Math.max(0, form.bathrooms),
      imageUrl: form.imageUrl.trim() || undefined,
    };
    if (isEdit && property) {
      updateProperty(property.id, payload);
      toast.success("Property updated", { description: payload.name });
    } else {
      addProperty(payload);
      toast.success("Property added", { description: payload.name });
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit property" : "Add property"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the details for this property."
              : "Add a property to your portfolio so you can track its maintenance."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="prop-name">
              Property name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="prop-name"
              value={form.name}
              onChange={(e) => patch({ name: e.target.value })}
              placeholder="e.g. Mountain Muse"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prop-address">
              Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="prop-address"
              value={form.address}
              onChange={(e) => patch({ address: e.target.value })}
              placeholder="e.g. 421 Aspen Ridge Rd, Aspen, CO 81611"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="prop-type">Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) => patch({ type: v as PropertyType })}
              >
                <SelectTrigger id="prop-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="prop-beds">Bedrooms</Label>
              <Input
                id="prop-beds"
                type="number"
                min={0}
                value={form.bedrooms}
                onChange={(e) =>
                  patch({ bedrooms: Number(e.target.value) || 0 })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prop-baths">Bathrooms</Label>
              <Input
                id="prop-baths"
                type="number"
                min={0}
                value={form.bathrooms}
                onChange={(e) =>
                  patch({ bathrooms: Number(e.target.value) || 0 })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prop-image">Cover image URL (optional)</Label>
            <Input
              id="prop-image"
              value={form.imageUrl}
              onChange={(e) => patch({ imageUrl: e.target.value })}
              placeholder="https://…"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {isEdit ? "Save changes" : "Add property"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
