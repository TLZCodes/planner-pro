import fs from 'fs';
import path from 'path';

const publicDir = '.output/public';
if (fs.existsSync(publicDir)) {
  console.log('Files in .output/public:');
  console.log(fs.readdirSync(publicDir));
  const assetsDir = path.join(publicDir, 'assets');
  if (fs.existsSync(assetsDir)) {
    console.log('\nFiles in .output/public/assets:');
    console.log(fs.readdirSync(assetsDir));
  }
}
