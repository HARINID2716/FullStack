import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const src = path.join(__dirname, '..', 'public', '_redirects');
const destDir = path.join(__dirname, '..', 'dist');
const dest = path.join(destDir, '_redirects');

if (!fs.existsSync(src)) {
  console.log('No public/_redirects found, skipping.');
  process.exit(0);
}

if (!fs.existsSync(destDir)) {
  console.error('dist directory not found. Run `npm run build` first.');
  process.exit(1);
}

fs.copyFileSync(src, dest);
console.log('Copied _redirects to dist');
