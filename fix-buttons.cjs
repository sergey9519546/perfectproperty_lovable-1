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
      if (file !== 'src/components/ui/button.tsx' && file !== 'src/components/ui/calendar.tsx') {
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
  
  // A naive replacement of simple <button className="..."> to <Button className="...">
  // Since Button already has styles, we could drop className or change it to variant="outline" etc.
  // We won't remove className completely, but we can change the tag.
  
  if (content.includes('<button') && !content.includes('import { Button }') && file.endsWith('.tsx')) {
     const importStmt = `import { Button } from "@/components/ui/button";\n`;
     
     // Find the last import
     const importMatches = [...content.matchAll(/^import /gm)];
     if (importMatches.length > 0) {
       const lastImportMatch = importMatches[importMatches.length - 1];
       const insertIdx = content.indexOf('\n', lastImportMatch.index) + 1;
       content = content.slice(0, insertIdx) + importStmt + content.slice(insertIdx);
     } else {
       content = importStmt + content;
     }
  }

  content = content.replace(/<button(\s+[^>]*)>/g, '<Button$1>');
  content = content.replace(/<\/button>/g, '</Button>');
  
  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
