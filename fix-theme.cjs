const fs = require('fs');
let styles = fs.readFileSync('src/styles.css', 'utf8');

// Replace standard colors with a deep charcoal theme
// Wait, the comment says "Deep charcoal cartographic UI. Amber = opportunity... Emerald = confirmed profit."
// Right now the primary is blue.
// Let's modify the :root to match the prompt's described theme.

const newRoot = `:root {
  --radius: 0.5rem;
  /* Deep charcoal UI theme */
  --background: #09090b;
  --foreground: #fafafa;
  
  --card: #09090b;
  --card-foreground: #fafafa;
  
  --popover: #09090b;
  --popover-foreground: #fafafa;
  
  --primary: #f59e0b; /* Amber */
  --primary-foreground: #18181b;
  
  --secondary: #27272a;
  --secondary-foreground: #fafafa;
  
  --muted: #27272a;
  --muted-foreground: #a1a1aa;
  
  --accent: #27272a;
  --accent-foreground: #fafafa;
  
  --destructive: #ef4444; /* Rose */
  --destructive-foreground: #fafafa;

  --border: #27272a;
  --border-strong: #3f3f46;
  --input: #27272a;
  --ring: #f59e0b;
  
  --opportunity: #f59e0b;
  --opportunity-strong: #b45309;
  
  --profit: #10b981; /* Emerald */
  --profit-strong: #047857;
  
  --skeptic: #e11d48; /* Rose */
  
  /* Elevation shadows */
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.4);
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.5), 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3);
  --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.5);

  --shadow-glow-gold: 0 0 15px rgba(245, 158, 11, 0.15);
  --shadow-dialog: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3);
}`;

styles = styles.replace(/:root\s*\{[\s\S]*?(?=\n\n|\n\.[a-z])/m, newRoot);
fs.writeFileSync('src/styles.css', styles);
