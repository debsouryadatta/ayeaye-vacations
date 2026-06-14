import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATUS_META, STATUS_ORDER } from "@/lib/constants";
import type { IssueStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

interface StatusSelectProps {
  value: IssueStatus;
  onChange: (status: IssueStatus) => void;
  size?: "sm" | "default";
  className?: string;
  id?: string;
  "aria-label"?: string;
}

/** Dropdown to move an issue through its lifecycle states. */
export function StatusSelect({
  value,
  onChange,
  size = "default",
  className,
  id,
  "aria-label": ariaLabel,
}: StatusSelectProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as IssueStatus)}>
      <SelectTrigger
        id={id}
        aria-label={ariaLabel}
        size={size}
        className={cn("w-full", className)}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUS_ORDER.map((status) => {
          const meta = STATUS_META[status];
          return (
            <SelectItem key={status} value={status}>
              <span
                className={cn("size-2 rounded-full", meta.dot)}
                aria-hidden
              />
              {meta.label}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
