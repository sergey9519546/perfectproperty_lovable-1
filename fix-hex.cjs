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
  { regex: /\[#94A3B8\]/g, replacement: 'muted-foreground' },
  { regex: /\[#334155\]/g, replacement: 'foreground' },
  { regex: /\[#E2E8F0\]/g, replacement: 'border' },
  { regex: /\[#01070c\]/g, replacement: 'background' },
  { regex: /\[#0F0F0F\]/g, replacement: 'background' },
  { regex: /\[#0B0F17\]/g, replacement: 'background' },
  { regex: /\[#4B5563\]/g, replacement: 'muted-foreground' },
  { regex: /\[#FAFAFA\]/g, replacement: 'card' },
  { regex: /\[#F0F2F5\]/g, replacement: 'border' },
  { regex: /\[#F3F4F6\]/g, replacement: 'accent' },
  { regex: /\[#E5E7EB\]/g, replacement: 'border' },
  { regex: /\[#6B7280\]/g, replacement: 'muted-foreground' },
  { regex: /\[#111827\]/g, replacement: 'foreground' },
  { regex: /\[#F1F5F9\]/g, replacement: 'muted' },
  { regex: /\[#2F5FFF\]/g, replacement: 'primary' },
  { regex: /\[#1E40AF\]/g, replacement: 'primary/20' }
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
