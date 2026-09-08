const fs = require('fs');

let content = fs.readFileSync('src/features/perfect-property/MarketWorkspace.tsx', 'utf8');

// Remove TopBar import
content = content.replace(/import \{ TopBar \} from "\.\/components\/TopBar";\n/, '');

// Remove <TopBar ... /> usage
content = content.replace(/<TopBar[\s\S]*?\/>/, '');

// Adjust layout height from calc(100dvh - 64px) to just 100dvh for app-shell
// But since Navigation is 64px (h-16), app-body grid should take the rest
// Navigation is applied globally, so MarketWorkspace isn't the top element anymore.
// The root route wraps everything in <div className="perfect-property-ui min-h-[100dvh]...">
// So MarketWorkspace doesn't need to be min-h-[100dvh], it can be flex-1 or just take up space.
// It has `<div className="perfect-property-ui app-shell min-h-[100dvh] bg-pp-page text-pp-text">`
content = content.replace('min-h-[100dvh]', 'h-[calc(100dvh-64px)]');

fs.writeFileSync('src/features/perfect-property/MarketWorkspace.tsx', content);
