import { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, BedDouble, Bath, Pencil, Trash2, Home } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ConfirmDialog } from "@/components/shared";
import { PropertyFormDialog } from "./PropertyFormDialog";
import type { Property } from "@/lib/types";
import { useStore } from "@/store/useStore";

interface PropertyCardProps {
  property: Property;
  issueCount: number;
  openIssueCount: number;
}

export function PropertyCard({
  property,
  issueCount,
  openIssueCount,
}: PropertyCardProps) {
  const deleteProperty = useStore((s) => s.deleteProperty);
  const [imgError, setImgError] = useState(false);
  const showImage = property.imageUrl && !imgError;

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xs transition-shadow hover:shadow-md">
      <div className="relative h-32 w-full overflow-hidden bg-gradient-to-br from-indigo-500 to-violet-600">
        {showImage ? (
          <img
            src={property.imageUrl}
            alt={property.name}
            loading="lazy"
            onError={() => setImgError(true)}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <Home className="size-10 text-white/80" />
          </div>
        )}
        <span className="absolute right-2 top-2 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-foreground shadow-sm backdrop-blur">
          {property.type}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-base font-semibold tracking-tight text-foreground">
          {property.name}
        </h3>
        <p className="mt-1 flex items-start gap-1.5 text-sm text-muted-foreground">
          <MapPin className="mt-0.5 size-3.5 shrink-0" />
          <span>{property.address}</span>
        </p>

        <div className="mt-3 flex items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <BedDouble className="size-4" />
            {property.bedrooms} bd
          </span>
          <span className="flex items-center gap-1.5">
            <Bath className="size-4" />
            {property.bathrooms} ba
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
          {openIssueCount > 0 ? (
            <Link
              to={`/?property=${property.id}`}
              className="text-sm font-medium text-primary hover:underline"
            >
              {openIssueCount} open {openIssueCount === 1 ? "issue" : "issues"}
            </Link>
          ) : (
            <span className="text-sm text-muted-foreground">No open issues</span>
          )}

          <div className="flex items-center gap-1">
            <PropertyFormDialog
              property={property}
              trigger={
                <Button variant="ghost" size="icon-sm" aria-label="Edit property">
                  <Pencil className="size-4" />
                </Button>
              }
            />
            {issueCount > 0 ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0}>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      disabled
                      aria-label="Delete property"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  Reassign or close its {issueCount}{" "}
                  {issueCount === 1 ? "issue" : "issues"} first
                </TooltipContent>
              </Tooltip>
            ) : (
              <ConfirmDialog
                trigger={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Delete property"
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                }
                title={`Delete ${property.name}?`}
                description="This permanently removes the property from your portfolio. This can't be undone."
                confirmText="Delete"
                destructive
                onConfirm={() => {
                  deleteProperty(property.id);
                  toast.success("Property deleted");
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
