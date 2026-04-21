import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcKeysDir = path.resolve(__dirname, '../src/app/utility/keys');
const distKeysDir = path.resolve(__dirname, '../dist/app/utility/keys');

// Create dist keys directory if it doesn't exist
if (!fs.existsSync(distKeysDir)) {
  fs.mkdirSync(distKeysDir, { recursive: true });
}

// Copy all files from src to dist
const files = fs.readdirSync(srcKeysDir);
files.forEach((file) => {
  const srcFile = path.join(srcKeysDir, file);
  const distFile = path.join(distKeysDir, file);
  fs.copyFileSync(srcFile, distFile);
  console.log(`Copied ${file} to dist`);
});
