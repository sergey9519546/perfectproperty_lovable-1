const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src');

const replacements = [
  { regex: /bg-\[#FAFAFC\]/g, replacement: 'bg-background' },
  { regex: /text-\[#0F172A\]/g, replacement: 'text-foreground' },
  { regex: /text-\[#475569\]/g, replacement: 'text-slate-600' },
  { regex: /text-\[#64748B\]/g, replacement: 'text-muted-foreground' },
  { regex: /bg-\[#F1F5F9\]/g, replacement: 'bg-muted' },
  { regex: /bg-\[#F8FAFC\]/g, replacement: 'bg-slate-50' },
  { regex: /border-\[#E2E8F0\]/g, replacement: 'border-border' },
  { regex: /border-\[#CBD5E1\]/g, replacement: 'border-border-strong' },
  { regex: /bg-\[#0F172A\]/g, replacement: 'bg-foreground' },
  { regex: /bg-\[#1E293B\]/g, replacement: 'bg-slate-800' },
  { regex: /bg-\[#2F5FFF\]/g, replacement: 'bg-primary' },
  { regex: /bg-\[#2555FF\]/g, replacement: 'bg-blue-600' },
  { regex: /text-\[#2F5FFF\]/g, replacement: 'text-primary' },
  { regex: /border-\[#2F5FFF\]/g, replacement: 'border-primary' },
  { regex: /ring-\[#2F5FFF\]/g, replacement: 'ring-primary' },
  { regex: /text-\[#10B981\]/g, replacement: 'text-emerald-500' },
  { regex: /bg-\[#10B981\]/g, replacement: 'bg-emerald-500' },
  { regex: /text-\[#059669\]/g, replacement: 'text-emerald-600' },
  { regex: /text-\[#EF4444\]/g, replacement: 'text-destructive' },
  { regex: /bg-\[#EF4444\]/g, replacement: 'bg-destructive' },
  { regex: /border-\[#EF4444\]/g, replacement: 'border-destructive' },
  { regex: /text-\[#E11D48\]/g, replacement: 'text-rose-600' },
  { regex: /bg-\[#E11D48\]/g, replacement: 'bg-rose-600' }
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  replacements.forEach(({ regex, replacement }) => {
    content = content.replace(regex, replacement);
  });
  
  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
