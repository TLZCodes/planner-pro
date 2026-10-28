import fs from 'fs';
const content = fs.readFileSync('.output/public/assets/index-DNmZ1UTx.js', 'utf8');
console.log('Length of index js:', content.length);
console.log('Snippet of index js:', content.slice(0, 300));
