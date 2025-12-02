import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const controllersDir = join(__dirname, 'src/controllers');

// Función para convertir un archivo de CommonJS a ESM
function convertToESM(content, filename) {
  let converted = content;

  // Convertir requires
  converted = converted.replace(/const\s+{([^}]+)}\s*=\s*require\(['"]\.\.\/config\/firebase['"]\);?/g, 
    'import { $1 } from \'../config/firebase.js\';');
  
  converted = converted.replace(/const\s+{([^}]+)}\s*=\s*require\(['"]\.\.\/utils\/bcrypt['"]\);?/g, 
    'import { $1 } from \'../utils/bcrypt.js\';');
  
  converted = converted.replace(/const\s+{([^}]+)}\s*=\s*require\(['"]\.\.\/utils\/jwt['"]\);?/g, 
    'import { $1 } from \'../utils/jwt.js\';');
  
  converted = converted.replace(/const\s+{([^}]+)}\s*=\s*require\(['"]\.\.\/utils\/pagination['"]\);?/g, 
    'import { $1 } from \'../utils/pagination.js\';');

  // Convertir exports.functionName a export const functionName
  converted = converted.replace(/^exports\.(\w+)\s*=\s*async\s*\(/gm, 'export const $1 = async (');
  converted = converted.replace(/^exports\.(\w+)\s*=\s*\(/gm, 'export const $1 = (');
  converted = converted.replace(/^exports\.(\w+)\s*=\s*/gm, 'export const $1 = ');

  return converted;
}

// Leer todos los archivos del directorio de controladores
const files = readdirSync(controllersDir).filter(f => f.endsWith('.js'));

console.log(`Encontrados ${files.length} controladores para convertir...`);

files.forEach(file => {
  const filePath = join(controllersDir, file);
  console.log(`\nConvirtiendo ${file}...`);
  
  try {
    const content = readFileSync(filePath, 'utf8');
    const converted = convertToESM(content, file);
    writeFileSync(filePath, converted, 'utf8');
    console.log(`✅ ${file} convertido exitosamente`);
  } catch (error) {
    console.error(`❌ Error convirtiendo ${file}:`, error.message);
  }
});

console.log('\n✅ Conversión de controladores completada!');
