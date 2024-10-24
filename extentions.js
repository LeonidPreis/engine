import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const buildDir = path.join(__dirname, 'jsm');

// Функция для преобразования первой буквы в заглавную, остальные — маленькие
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

function addJsExtensionToImports(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.lstatSync(filePath).isDirectory()) {
      addJsExtensionToImports(filePath);
    } else if (filePath.endsWith('.js')) {
      let content = fs.readFileSync(filePath, 'utf8');

      // Преобразование импортов, если у них нет расширения .js
      content = content.replace(/(from\s+['"])(\.\/.*?)(['"])/g, (match, p1, p2, p3) => {
        if (!p2.endsWith('.js') && !p2.endsWith('.json')) {
          return `${p1}${p2}.js${p3}`;
        }
        return match;
      });

      const fileNameWithoutExt = capitalizeFirstLetter(path.basename(file, '.js'));
      const windowAssignment = `\nwindow.${fileNameWithoutExt} = ${fileNameWithoutExt};\n`;
      content = content + windowAssignment;

      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Imports have been updated in the file: ${filePath}`);
    }
  });
}

addJsExtensionToImports(buildDir);
