import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, 'dist');

function processFiles(dir) {
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);

    if (fs.statSync(filePath).isDirectory()) {
      processFiles(filePath);
    } else if (file.endsWith('.js')) {
      updateImportsAndExports(filePath);
    }
  });
}

function updateImportsAndExports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  content = content.replace(/(from\s+['"])(\.\/.*?)(['"])/g, (match, p1, p2, p3) => {
    return p2.endsWith('.js') || p2.endsWith('.json') ? match : `${p1}${p2}.js${p3}`;
  });

  const windowExport = `
import * as ModuleExports from './${path.basename(filePath)}';
Object.entries(ModuleExports).forEach(([key, value]) => {
  if (typeof value === 'function' || typeof value === 'object') {
    window[key] = value;
  }
});`;

  content += windowExport;

  fs.writeFileSync(filePath, content, 'utf8');
}

processFiles(distDir);
console.log('All imports have been updated.');