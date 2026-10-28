import fs from 'fs';
import path from 'path';

function searchTermsInFiles(dir, terms) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['node_modules', '.git', '.output', 'dist', 'android', 'releases'].includes(entry.name)) {
        searchTermsInFiles(full, terms);
      }
    } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
      const content = fs.readFileSync(full, 'utf8');
      terms.forEach(term => {
        const regex = new RegExp(`["'\`\\s]${term}["'\`\\s]`, 'gi');
        if (regex.test(content)) {
          console.log(`Matched '${term}' in ${full}`);
          const lines = content.split('\n');
          lines.forEach((l, i) => {
            if (regex.test(l)) {
              console.log(`  L${i+1}: ${l.trim()}`);
            }
          });
        }
      });
    }
  }
}

searchTermsInFiles('src', ['calm', 'move']);
