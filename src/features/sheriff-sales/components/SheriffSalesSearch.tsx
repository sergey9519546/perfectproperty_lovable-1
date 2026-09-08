import React from 'react';
import { Search as SearchIcon, X, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface SheriffSalesSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  totalMatches?: number;
  totalCount?: number;
  className?: string;
  onClear?: () => void;
  suggestions?: string[];
  onSelectSuggestion?: (address: string) => void;
}

export function SheriffSalesSearch({
  value,
  onChange,
  placeholder = 'Search by property address, municipality, or street...',
  totalMatches,
  totalCount,
  className = '',
  onClear,
  suggestions = [],
  onSelectSuggestion,
}: SheriffSalesSearchProps) {
  const handleClear = () => {
    onChange('');
    if (onClear) onClear();
  };

  return (
    <div className={`w-full space-y-2 ${className}`} id="sheriff-sales-address-search-container">
      <div className="relative flex items-center">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground flex items-center">
          <SearchIcon className="h-4 w-4" />
        </div>

        <Input
          id="sheriff-sales-address-search-input"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pl-9 pr-24 h-10 text-xs sm:text-sm font-sans placeholder:text-muted-foreground bg-background shadow-xs border-input focus-visible:ring-primary/40 transition-all rounded-lg"
          aria-label="Filter sheriff sales by address"
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              id="sheriff-sales-address-search-clear-btn"
              onClick={handleClear}
              className="h-6 w-6 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              title="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}

          {typeof totalMatches === 'number' && typeof totalCount === 'number' && (
            <Badge
              variant="secondary"
              className="text-[10px] font-mono px-2 py-0.5 font-medium border border-border/60 bg-muted/60 text-muted-foreground shrink-0 hidden sm:inline-flex"
            >
              {totalMatches}/{totalCount}
            </Badge>
          )}
        </div>
      </div>

      {/* Quick address suggestion chips when user hasn't typed anything yet */}
      {suggestions.length > 0 && !value && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
          <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1 shrink-0">
            <MapPin className="h-3 w-3 text-primary/70" />
            Recent:
          </span>
          {suggestions.slice(0, 4).map((addr) => (
            <Button
              key={addr}
              type="button"
              onClick={() => {
                if (onSelectSuggestion) onSelectSuggestion(addr);
                else onChange(addr);
              }}
              className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-secondary/80 hover:bg-secondary text-secondary-foreground hover:text-foreground border border-border/50 truncate max-w-[200px] transition-colors cursor-pointer shrink-0"
              title={`Filter by ${addr}`}
            >
              {addr}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

export default SheriffSalesSearch;
