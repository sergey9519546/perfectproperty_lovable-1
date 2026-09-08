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
  { regex: /\bbg-white\b/g, replacement: 'bg-card' },
  { regex: /\bbg-slate-50\b/g, replacement: 'bg-muted' },
  { regex: /\bbg-slate-100\b/g, replacement: 'bg-accent' },
  { regex: /\bbg-slate-200\b/g, replacement: 'bg-accent' },
  { regex: /\btext-slate-900\b/g, replacement: 'text-foreground' },
  { regex: /\btext-slate-800\b/g, replacement: 'text-foreground' },
  { regex: /\btext-slate-700\b/g, replacement: 'text-secondary-foreground' },
  { regex: /\btext-slate-600\b/g, replacement: 'text-muted-foreground' },
  { regex: /\btext-slate-500\b/g, replacement: 'text-muted-foreground' },
  { regex: /\border-slate-200\b/g, replacement: 'border-border' },
  { regex: /\border-slate-300\b/g, replacement: 'border-border-strong' },
  { regex: /\bbg-blue-50\b/g, replacement: 'bg-primary/10' },
  { regex: /\bbg-blue-100\b/g, replacement: 'bg-primary/20' },
  { regex: /\btext-blue-600\b/g, replacement: 'text-primary' },
  { regex: /\btext-blue-700\b/g, replacement: 'text-primary' },
  { regex: /\border-blue-200\b/g, replacement: 'border-primary/20' },
  { regex: /\border-blue-500\b/g, replacement: 'border-primary' },
  { regex: /\bring-blue-500\b/g, replacement: 'ring-primary' },
  { regex: /\btext-blue-500\b/g, replacement: 'text-primary' },
  { regex: /\btext-blue-900\b/g, replacement: 'text-primary' }
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
