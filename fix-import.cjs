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

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('import { Button } from "@/components/ui/button";')) {
     let newContent = content.replace('import { Button } from "@/components/ui/button";\n', '');
     newContent = newContent.replace('import { Button } from "@/components/ui/button";', '');
     newContent = 'import { Button } from "@/components/ui/button";\n' + newContent;
     fs.writeFileSync(file, newContent);
     console.log(`Fixed ${file}`);
  }
});
