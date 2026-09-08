const fs = require('fs');

let content = fs.readFileSync('src/routes/__root.tsx', 'utf8');

// Replace TopNav usage with Navigation
content = content.replace(
  'import { Link, Outlet, createRootRoute } from "@tanstack/react-router";',
  'import { Link, Outlet, createRootRoute } from "@tanstack/react-router";\nimport { Navigation } from "@/components/Navigation";'
);

// Remove TopNav conditionally rendering
content = content.replace(
  '{pathname === "/auth" || pathname === "/" || pathname === "/workspace" ? null : <TopNav />}',
  '<Navigation />'
);

// Remove TopNav function definition
content = content.replace(/function TopNav\(\) \{[\s\S]*?\}\n/, '');

fs.writeFileSync('src/routes/__root.tsx', content);
