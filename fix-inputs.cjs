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
      if (file !== 'src/components/ui/input.tsx') {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  if (content.includes('<input') && !content.includes('import { Input }') && file.endsWith('.tsx')) {
     const importStmt = `import { Input } from "@/components/ui/input";\n`;
     
     const importMatches = [...content.matchAll(/^import /gm)];
     if (importMatches.length > 0) {
       const lastImportMatch = importMatches[importMatches.length - 1];
       const insertIdx = content.indexOf('\n', lastImportMatch.index) + 1;
       content = content.slice(0, insertIdx) + importStmt + content.slice(insertIdx);
     } else {
       content = importStmt + content;
     }
  }

  content = content.replace(/<input(\s+[^>]*)>/g, '<Input$1>');
  content = content.replace(/<\/input>/g, '</Input>');
  
  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
