import React from 'react';
import { cn } from '@/lib/utils';

/**
 * TableSkeleton
 * Skeleton rows matching a table layout. Renders <tr> rows only, so it must be placed
 * inside the table's own <tbody>.
 */
export function TableSkeleton({
  rows = 8,
  columns = 6,
  className,
}: {
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className={cn("border-t border-border/50", className)} aria-hidden="true">
          {Array.from({ length: columns }).map((_, j) => (
            <td key={j} className="px-4 py-3.5">
              <div
                className={cn(
                  "h-4 rounded-md bg-muted/80 animate-pulse",
                  j === 0 ? "w-3/4" : j % 3 === 0 ? "w-1/2 ml-auto" : "w-2/3"
                )}
                style={{
                  animationDelay: `${i * 45 + j * 25}ms`,
                }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
