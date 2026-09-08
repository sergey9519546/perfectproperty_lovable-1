const fs = require('fs');

let content = fs.readFileSync('src/routes/__root.tsx', 'utf8');

// Replace the div
content = content.replace(
  '<div className="perfect-property-ui min-h-[100dvh] bg-background text-foreground antialiased">',
  '<div className="perfect-property-ui flex min-h-[100dvh] flex-col bg-background text-foreground antialiased">'
);

content = content.replace(
  '<Outlet />',
  '<main className="flex flex-1 flex-col overflow-hidden"><Outlet /></main>'
);

fs.writeFileSync('src/routes/__root.tsx', content);
