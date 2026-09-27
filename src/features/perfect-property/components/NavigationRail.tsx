import { Buildings, ChartLineUp, Crosshair, Gavel, MapTrifold, Rows, Scroll, Stack } from '@phosphor-icons/react'
import { motion } from 'motion/react'

const items = [
  { id: 'map', label: 'Market map', icon: MapTrifold },
  { id: 'deals', label: 'Deals', icon: Rows },
  { id: 'sheriff', label: 'Sheriff & Gov Sales', icon: Gavel },
  { id: 'notices', label: 'Legal Notice Reader', icon: Scroll },
  { id: 'assets', label: 'Assets', icon: Buildings },
  { id: 'models', label: 'Model accuracy', icon: ChartLineUp },
  { id: 'targets', label: 'Targets', icon: Crosshair },
  { id: 'sources', label: 'Data sources', icon: Stack },
]

export function NavigationRail({ active, onChange }: { active: string; onChange: (id: string) => void }) {
  return (
    <nav
      className="nav-rail flex w-[72px] flex-col items-center border-r border-border bg-card py-6 max-md:h-14 max-md:w-full max-md:flex-row max-md:justify-center max-md:border-r-0 max-md:border-b max-md:py-0 z-10 relative"
      aria-label="Product navigation"
    >
      <div className="flex flex-col gap-3 max-md:flex-row max-md:gap-2">
        {items.map(({ id, label, icon: Icon }) => (
          <motion.button
            key={id}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            onClick={() => onChange(id)}
            type="button"
            aria-label={label}
            title={label}
            className={`relative grid h-12 w-12 place-items-center rounded-xl transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              active === id
                ? 'bg-background text-foreground shadow-xs border border-border font-semibold'
                : 'bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent'
            }`}
          >
            <Icon size={22} weight={active === id ? "fill" : "regular"} />
          </motion.button>
        ))}
      </div>
    </nav>
  )
}