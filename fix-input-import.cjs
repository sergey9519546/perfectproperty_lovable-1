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
  if (content.includes('import { Input } from "@/components/ui/input";')) {
     let newContent = content.replace('import { Input } from "@/components/ui/input";\n', '');
     newContent = newContent.replace('import { Input } from "@/components/ui/input";', '');
     newContent = 'import { Input } from "@/components/ui/input";\n' + newContent;
     fs.writeFileSync(file, newContent);
     console.log(`Fixed ${file}`);
  }
});
