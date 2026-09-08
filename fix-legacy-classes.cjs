const fs = require('fs');

const css = fs.readFileSync('src/styles.css', 'utf8');

const additions = `
@layer components {
  .app-body { height: calc(100dvh - 72px); }
  @media (max-width: 1023px) { .app-body { height: auto; } }

  .primary-button {
    @apply bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm border-transparent;
  }
  .control-button {
    @apply bg-background text-foreground border border-input hover:bg-accent hover:text-accent-foreground shadow-sm;
  }
  .filter-button {
    @apply bg-background text-muted-foreground border border-input hover:bg-accent hover:text-accent-foreground text-sm rounded-md shadow-sm transition-colors;
  }
  .filter-button.active-filter {
    @apply bg-primary/10 text-primary border-primary/30;
  }
  .icon-button {
    @apply hover:bg-accent text-muted-foreground hover:text-foreground inline-flex items-center justify-center rounded-md transition-colors;
  }
  .landing-cta {
    @apply h-12 px-6 text-base font-medium;
  }
  .skeleton {
    @apply animate-pulse bg-muted rounded-md;
  }
  .map-color-wash {
    @apply mix-blend-screen opacity-50 bg-primary/5 pointer-events-none;
  }
  .maplibregl-popup-content {
    @apply bg-popover text-popover-foreground border border-border shadow-md rounded-md p-3 !important;
  }
  .market-popup strong {
    @apply block text-sm font-semibold mb-1;
  }
  .market-popup span {
    @apply block text-xs text-primary font-mono;
  }
  .maplibregl-popup-tip {
    @apply border-t-popover !important;
  }
  .landing-nav-link {
    @apply relative py-2 text-foreground/80 hover:text-foreground transition-colors;
  }
  .landing-nav-link::after {
    @apply content-[''] absolute bottom-0 left-0 h-[2px] bg-primary w-0 transition-all duration-200;
  }
  .landing-nav-link:hover::after, .landing-nav-link.active::after {
    @apply w-full;
  }
  .landing-nav-link.active {
    @apply text-foreground font-medium;
  }
}
`;

if (!css.includes('.primary-button {')) {
  fs.writeFileSync('src/styles.css', css + additions);
  console.log('Added legacy class mappings to styles.css');
} else {
  console.log('Legacy classes already present');
}
