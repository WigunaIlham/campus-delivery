import * as React from "react";
import {cn} from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  showLabel?: boolean;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({className, value = 0, max = 100, showLabel = false, ...props}, ref) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    return (
      <div className="space-y-2">
        {showLabel && (
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Progress</span>
            <span>{Math.round(percentage)}%</span>
          </div>
        )}
        <div
          ref={ref}
          className={cn(
            "relative h-2 w-full overflow-hidden rounded-full bg-secondary",
            className
          )}
          {...props}
        >
          <div
            className="h-full w-full flex-1 bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500"
            style={{transform: `translateX(-${100 - percentage}%)`}}
          />
        </div>
      </div>
    );
  }
);
Progress.displayName = "Progress";

export {Progress};
