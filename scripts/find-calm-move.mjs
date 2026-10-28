import fs from 'fs';
import path from 'path';

const searchTerms = ['calm', 'Calm', 'move', 'Move', 'الهدوء', 'الحركة'];

function searchDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['node_modules', '.git', '.output', 'dist', 'android', 'releases'].includes(entry.name)) {
        searchDir(full);
      }
    } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts') || entry.name.endsWith('.json'))) {
      const content = fs.readFileSync(full, 'utf8');
      for (const term of searchTerms) {
        if (content.includes(term)) {
          const lines = content.split('\n');
          lines.forEach((line, idx) => {
            if (line.includes(term)) {
              console.log(`${full}:${idx + 1}: ${line.trim()}`);
            }
          });
        }
      }
    }
  }
}

searchDir('src');
