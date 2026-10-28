import fs from 'fs';
import path from 'path';

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (
      line.includes('setInterval') ||
      line.includes('setTimeout') ||
      line.includes('requestAnimationFrame') ||
      line.includes('addEventListener') ||
      line.includes('Notification') ||
      line.includes('while') ||
      line.includes('loop')
    ) {
      console.log(`${filePath}:${idx + 1}: ${line.trim()}`);
    }
  });
}

function traverse(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['node_modules', '.git', '.output', 'dist', 'android', 'releases'].includes(entry.name)) {
        traverse(full);
      }
    } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
      scanFile(full);
    }
  }
}

traverse('src');
