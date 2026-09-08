const fs = require('fs');
const css = `
@import "@fontsource-variable/geist";
@import "@fontsource-variable/geist-mono";
@import "tailwindcss" source(none);
@source "../src";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

/* 
 * PERFECT PROPERTY ENGINE — design system
 * Homepage Light Theme as source of truth.
 */
@theme inline {
  --font-sans: "Geist Variable", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "Geist Mono Variable", "JetBrains Mono", "SFMono-Regular", ui-monospace, monospace;

  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);

  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-surface: var(--surface);
  --color-surface-2: var(--surface-2);
  --color-surface-3: var(--surface-3);
  --color-border: var(--border);
  --color-border-strong: var(--border-strong);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-input: var(--input);
  --color-ring: var(--ring);

  --color-opportunity: var(--opportunity);
  --color-opportunity-strong: var(--opportunity-strong);
  --color-profit: var(--profit);
  --color-profit-strong: var(--profit-strong);
  --color-skeptic: var(--skeptic);
  --color-prophecy: var(--prophecy);
  --color-listed: var(--listed);

  --color-tier-exceptional: var(--tier-exceptional);
  --color-tier-strong: var(--tier-strong);
  --color-tier-viable: var(--tier-viable);
  --color-tier-watch: var(--tier-watch);

  /* Elevation shadows */
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  --shadow-glow-gold: 0 0 15px rgba(47, 95, 255, 0.35);
  --shadow-dialog: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

:root {
  --radius: 0.5rem;
  
  /* Homepage Light Theme */
  --background: #FAFAFC;
  --foreground: #0F172A;
  --surface: #FFFFFF;
  --surface-2: #F8FAFC;
  --surface-3: #F1F5F9;
  --border: #E2E8F0;
  --border-strong: #CBD5E1;
  --muted: #F1F5F9;
  --muted-foreground: #64748B;
  --card: #FFFFFF;
  --card-foreground: #0F172A;
  --popover: #FFFFFF;
  --popover-foreground: #0F172A;
  --primary: #2F5FFF;
  --primary-foreground: #FFFFFF;
  --secondary: #F8FAFC;
  --secondary-foreground: #0F172A;
  --accent: #F1F5F9;
  --accent-foreground: #0F172A;
  --destructive: #EF4444;
  --destructive-foreground: #FFFFFF;
  --input: #E2E8F0;
  --ring: #2F5FFF;
  
  --opportunity: #F59E0B;
  --opportunity-strong: #D97706;
  --profit: #10B981;
  --profit-strong: #059669;
  --skeptic: #E11D48;
  --prophecy: #8B5CF6;
  --listed: #3B82F6;
  --tier-exceptional: #F59E0B;
  --tier-strong: #10B981;
  --tier-viable: #3B82F6;
  --tier-watch: #E11D48;
}

.dark {
  --background: #01070c;
  --foreground: oklch(0.96 0.005 240);
  --surface: #061018;
  --surface-2: #091721;
  --surface-3: #0c1a26;
  --border: rgba(120, 147, 165, 0.18);
  --border-strong: rgba(120, 147, 165, 0.30);
  --muted: #061018;
  --muted-foreground: oklch(0.68 0.02 250);
  --card: #061018;
  --card-foreground: oklch(0.96 0.005 240);
  --popover: #061018;
  --popover-foreground: oklch(0.96 0.005 240);
  --primary: oklch(0.78 0.16 82);
  --primary-foreground: #01070c;
  --secondary: #091721;
  --secondary-foreground: oklch(0.96 0.005 240);
  --accent: oklch(0.28 0.03 210);
  --accent-foreground: oklch(0.96 0.005 240);
  --destructive: oklch(0.62 0.22 22);
  --destructive-foreground: oklch(0.98 0.005 240);
  --input: #091721;
  --ring: oklch(0.78 0.16 82);
  
  --opportunity: oklch(0.78 0.16 82);
  --opportunity-strong: oklch(0.85 0.18 78);
  --profit: oklch(0.72 0.16 155);
  --profit-strong: oklch(0.8 0.19 152);
  --skeptic: oklch(0.68 0.19 22);
}

@layer base {
  * {
    border-color: var(--color-border);
  }
  body {
    background-color: var(--background);
    color: var(--foreground);
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
  }
}

.num { font-family: var(--font-mono); font-variant-numeric: tabular-nums; letter-spacing: -0.01em; }

@keyframes opp-pulse {
  0%, 100% { filter: drop-shadow(0 0 4px currentColor); opacity: 0.95; }
  50% { filter: drop-shadow(0 0 14px currentColor); opacity: 1; }
}
`;
fs.writeFileSync('src/styles.css', css);
