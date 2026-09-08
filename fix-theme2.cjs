const fs = require('fs');
let styles = fs.readFileSync('src/styles.css', 'utf8');

const missingVars = `
  --surface: #09090b;
  --surface-2: #18181b;
  --surface-3: #27272a;

  --pp-page: #09090b;
  --pp-header: #09090b;
  --pp-surface: #09090b;
  --pp-surface-raised: #18181b;
  --pp-surface-soft: #27272a;
  --pp-border: #27272a;
  --pp-border-strong: #3f3f46;
  --pp-border-subtle: #27272a;
  --pp-border-default: #27272a;
  --pp-text: #fafafa;
  --pp-text-secondary: #a1a1aa;
  --pp-text-dim: #71717a;
  --pp-text-label: #71717a;
  --pp-text-active-filter: #fafafa;
  --pp-text-on-primary: #18181b;
  --pp-muted: #a1a1aa;
  --pp-faint: #3f3f46;
  --pp-gold: #f59e0b;
  --pp-gold-bright: #fbbf24;
  --pp-live: #10b981;
`;

styles = styles.replace('--background: #09090b;', '--background: #09090b;' + missingVars);
fs.writeFileSync('src/styles.css', styles);
