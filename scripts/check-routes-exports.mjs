import fs from 'fs';
import path from 'path';

const routesDir = 'C:\\Users\\TLZCodes\\Desktop\\ProPlanner\\src\\routes';

function checkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      checkDir(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('export default')) {
        console.log('Found export default in:', fullPath);
      }
    }
  }
}

checkDir(routesDir);
console.log('Checked all route files for export default.');
