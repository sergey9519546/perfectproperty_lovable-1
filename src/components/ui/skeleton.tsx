import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "pulse" | "shimmer";
}

function Skeleton({ className, variant = "pulse", ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-xl bg-slate-200/80 dark:bg-slate-800/80",
        variant === "shimmer" ? "skeleton-shimmer" : "animate-pulse",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
