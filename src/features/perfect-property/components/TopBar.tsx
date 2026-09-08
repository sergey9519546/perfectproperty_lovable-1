import { Buildings, DownloadSimple, MagnifyingGlass, SignOut, ShieldCheck, ChartLineUp, Compass, BookmarkSimple } from '@phosphor-icons/react'
import { motion } from 'motion/react'
import { Brand } from './Brand'
import { useIsMac } from '@/hooks/use-is-mac'
import { coverageLabel } from '../data'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Link } from '@tanstack/react-router'

type Props = {
  onOpenPalette: () => void
  onExport: () => void
  onHome: () => void
  onAccount?: () => void
  onSignOut?: () => void
  exporting?: boolean
  organizationName: string
  userInitials: string
  userEmail?: string | null
  coverage?: string
}

export function TopBar({
  onOpenPalette,
  onExport,
  onHome,
  onAccount,
  onSignOut,
  exporting = false,
  organizationName,
  userInitials,
  userEmail,
  coverage = coverageLabel(),
}: Props) {
  const isMac = useIsMac()
  return (
    <header className="topbar flex h-16 items-center justify-between border-b border-pp-border bg-pp-surface px-6 shadow-none max-md:h-14 max-md:px-4">
      <div className="flex items-center gap-8">
        <button id="workspace-topbar-home-btn" type="button" onClick={onHome} className="flex-shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-pp-text rounded-sm" aria-label="Return to homepage">
          <Brand id="workspace-topbar-brand" />
        </button>
        <div className="flex items-center gap-2 max-md:hidden text-sm text-pp-text">
          <Buildings size={16} weight="duotone" className="text-pp-muted" />
          <span className="font-semibold tracking-tight">{organizationName}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4 flex-1 justify-end max-w-2xl">
        <button className="group flex h-9 w-full max-w-[320px] items-center gap-2 rounded-full border border-pp-border bg-pp-surface-soft px-3.5 text-sm text-pp-faint transition-all hover:bg-pp-surface hover:border-pp-border-strong hover:shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-pp-text max-md:hidden" onClick={onOpenPalette} type="button">
          <MagnifyingGlass size={16} className="text-pp-muted group-hover:text-pp-text transition-colors" />
          <span className="truncate">Search records…</span>
          <kbd className="ml-auto rounded border border-pp-border bg-pp-surface px-1.5 py-0.5 font-mono text-[10px] font-medium text-pp-muted shadow-none">
            {isMac ? '⌘K' : 'Ctrl K'}
          </kbd>
        </button>
        
        <div className="hidden items-center gap-2 text-[11px] font-bold tracking-widest uppercase text-pp-muted xl:flex">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-pp-live" />
          {coverage}
        </div>
        
        <div className="h-5 w-px bg-pp-border hidden md:block" />

        <motion.button
          whileTap={exporting ? undefined : { y: 1, scale: 0.98 }}
          className="flex h-9 items-center justify-center gap-2 rounded-full bg-pp-text px-4 text-xs font-semibold text-white shadow-none transition-colors hover:bg-black disabled:cursor-wait disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-pp-text focus-visible:ring-offset-2"
          onClick={onExport}
          type="button"
          aria-label="Export brief"
          disabled={exporting}
        >
          <DownloadSimple size={15} weight="bold" />
          <span className="max-sm:hidden">{exporting ? 'Exporting…' : 'Export Brief'}</span>
        </motion.button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              id="workspace-topbar-account-btn"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-pp-border bg-pp-surface-soft text-[11px] font-bold text-pp-text hover:bg-pp-surface hover:border-pp-text transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-pp-text focus-visible:ring-offset-2"
              type="button"
              aria-label="Account menu"
              onClick={onAccount}
            >
              {userInitials}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60 bg-pp-page border-pp-border text-pp-text shadow-xl">
            <DropdownMenuLabel className="font-normal pb-2">
              <div className="flex flex-col space-y-1">
                <p className="text-xs font-semibold leading-none text-pp-text">{organizationName}</p>
                {userEmail && (
                  <p className="text-[11px] leading-none text-pp-muted truncate pt-0.5">{userEmail}</p>
                )}
                <div className="flex items-center gap-1.5 pt-1 text-[10px] text-emerald-400 font-mono">
                  <ShieldCheck size={13} weight="fill" />
                  <span>Institutional Active</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-pp-border" />
            <DropdownMenuItem asChild>
              <Link to="/deals" className="cursor-pointer flex items-center gap-2 py-1.5 text-xs">
                <BookmarkSimple size={14} className="text-pp-muted" />
                <span>Saved Deals & Portfolio</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/shadow" className="cursor-pointer flex items-center gap-2 py-1.5 text-xs">
                <Compass size={14} className="text-pp-muted" />
                <span>Off-Market Shadow Radar</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/prophecy" className="cursor-pointer flex items-center gap-2 py-1.5 text-xs">
                <ChartLineUp size={14} className="text-pp-muted" />
                <span>Predicted Acquisitions</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/monitoring" className="cursor-pointer flex items-center gap-2 py-1.5 text-xs">
                <ShieldCheck size={14} className="text-pp-muted" />
                <span>Portfolio Health & Risk</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/notices" className="cursor-pointer flex items-center gap-2 py-1.5 text-xs">
                <Compass size={14} className="text-pp-muted" />
                <span>Read a Sale Notice</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/sources" className="cursor-pointer flex items-center gap-2 py-1.5 text-xs">
                <BookmarkSimple size={14} className="text-pp-muted" />
                <span>Where Data Comes From</span>
              </Link>
            </DropdownMenuItem>
            {onSignOut && (
              <>
                <DropdownMenuSeparator className="bg-pp-border" />
                <DropdownMenuItem
                  onClick={onSignOut}
                  className="cursor-pointer text-rose-400 focus:text-rose-400 focus:bg-rose-500/10 flex items-center gap-2 py-1.5 text-xs font-medium"
                >
                  <SignOut size={14} />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}