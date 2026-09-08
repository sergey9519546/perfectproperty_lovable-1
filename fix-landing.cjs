const fs = require('fs');

let content = fs.readFileSync('src/features/perfect-property/components/landing/LandingPage.tsx', 'utf8');

// Remove Header import
content = content.replace(/import \{ Header \} from '\.\/Header'\n/, '');

// Remove <Header ... /> usage
content = content.replace(/<Header[\s\S]*?\/>\n/, '');

fs.writeFileSync('src/features/perfect-property/components/landing/LandingPage.tsx', content);
