import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PRIORITY_META, PRIORITY_ORDER } from "@/lib/constants";
import type { Priority } from "@/lib/types";
import { cn } from "@/lib/utils";

interface PrioritySelectProps {
  value: Priority;
  onChange: (priority: Priority) => void;
  size?: "sm" | "default";
  className?: string;
  id?: string;
  "aria-label"?: string;
}

/** Dropdown to change an issue's priority. */
export function PrioritySelect({
  value,
  onChange,
  size = "default",
  className,
  id,
  "aria-label": ariaLabel,
}: PrioritySelectProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as Priority)}>
      <SelectTrigger
        id={id}
        aria-label={ariaLabel}
        size={size}
        className={cn("w-full", className)}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {PRIORITY_ORDER.map((priority) => {
          const meta = PRIORITY_META[priority];
          return (
            <SelectItem key={priority} value={priority}>
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
