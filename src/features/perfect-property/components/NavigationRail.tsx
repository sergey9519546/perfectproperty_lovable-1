import {
  Columns,
  MapTrifold,
  Rows,
  MagnifyingGlass,
  ArrowClockwise,
  Gavel,
  Flame,
  FileText,
} from '@phosphor-icons/react';
import { motion } from 'motion/react';

export interface NavigationRailProps {
  active?: string;
  onChange?: (id: string) => void;
  layoutMode?: 'split' | 'map' | 'table';
  onLayoutChange?: (mode: 'split' | 'map' | 'table') => void;
  onOpenPalette?: () => void;
  onRefresh?: () => void;
}

export function NavigationRail({
  layoutMode = 'split',
  onLayoutChange,
  onOpenPalette,
  onRefresh,
}: NavigationRailProps) {
  return (
    <aside
      className="nav-rail flex w-14 flex-col items-center justify-between border-r border-border bg-card py-3 max-md:hidden z-10 shrink-0 select-none"
      aria-label="Workspace View Controls"
    >
      {/* Top Group: View Modes */}
      <div className="flex flex-col items-center gap-2">
        {onLayoutChange && (
          <>
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => onLayoutChange('split')}
              type="button"
              aria-label="Split View (Map and Table)"
              title="Split View (Map + Table)"
              className={`grid h-10 w-10 place-items-center rounded-xl transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                layoutMode === 'split'
                  ? 'bg-foreground text-background font-semibold shadow-xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Columns size={19} weight={layoutMode === 'split' ? 'fill' : 'regular'} />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => onLayoutChange('map')}
              type="button"
              aria-label="Focus Map (Expanded Map Canvas)"
              title="Focus Map"
              className={`grid h-10 w-10 place-items-center rounded-xl transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                layoutMode === 'map'
                  ? 'bg-foreground text-background font-semibold shadow-xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <MapTrifold size={19} weight={layoutMode === 'map' ? 'fill' : 'regular'} />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => onLayoutChange('table')}
              type="button"
              aria-label="Focus Table (Expanded Deal Grid)"
              title="Focus Table"
              className={`grid h-10 w-10 place-items-center rounded-xl transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                layoutMode === 'table'
                  ? 'bg-foreground text-background font-semibold shadow-xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Rows size={19} weight={layoutMode === 'table' ? 'fill' : 'regular'} />
            </motion.button>

            <div className="my-1.5 h-px w-6 bg-border" aria-hidden="true" />
          </>
        )}

        {/* Command Palette Trigger */}
        {onOpenPalette && (
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={onOpenPalette}
            type="button"
            aria-label="Quick Search Parcels (Command+K)"
            title="Search Parcels (⌘K)"
            className="grid h-10 w-10 place-items-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <MagnifyingGlass size={19} />
          </motion.button>
        )}
      </div>

      {/* Bottom Group: Data Refresh */}
      <div className="flex flex-col items-center gap-2">
        {onRefresh && (
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={onRefresh}
            type="button"
            aria-label="Refresh Scored Parcels"
            title="Refresh Parcels"
            className="grid h-10 w-10 place-items-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ArrowClockwise size={18} />
          </motion.button>
        )}
      </div>
    </aside>
  );
}
