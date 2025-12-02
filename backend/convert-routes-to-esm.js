import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const routesDir = join(__dirname, 'src/routes');

// Función para convertir un archivo de CommonJS a ESM
function convertToESM(content, filename) {
  let converted = content;

  // Convertir requires de express
  converted = converted.replace(/const\s+express\s*=\s*require\(['"]express['"]\);?/g, 
    'import express from \'express\';');
  
  converted = converted.replace(/const\s+router\s*=\s*express\.Router\(\);?/g, 
    'const router = express.Router();');

  // Convertir requires de middlewares
  converted = converted.replace(/const\s+{([^}]+)}\s*=\s*require\(['"]\.\.\/middlewares\/auth\.middleware['"]\);?/g, 
    'import { $1 } from \'../middlewares/auth.middleware.js\';');
  
  converted = converted.replace(/const\s+{([^}]+)}\s*=\s*require\(['"]\.\.\/middlewares\/role\.middleware['"]\);?/g, 
    'import { $1 } from \'../middlewares/role.middleware.js\';');
  
  converted = converted.replace(/const\s+upload\s*=\s*require\(['"]\.\.\/middlewares\/upload\.middleware['"]\);?/g, 
    'import upload from \'../middlewares/upload.middleware.js\';');

  // Convertir requires de controladores
  const controllerMatches = content.matchAll(/const\s+(\w+)\s*=\s*require\(['"]\.\.\/controllers\/(\w+)['"]\);?/g);
  for (const match of controllerMatches) {
    const varName = match[1];
    const controllerName = match[2];
    converted = converted.replace(match[0], `import * as ${varName} from '../controllers/${controllerName}.js';`);
  }

  // Convertir module.exports
  converted = converted.replace(/module\.exports\s*=\s*router;?/g, 'export default router;');

  return converted;
}

// Leer todos los archivos del directorio de rutas
const files = readdirSync(routesDir).filter(f => f.endsWith('.js'));

console.log(`Encontrados ${files.length} archivos de rutas para convertir...`);

files.forEach(file => {
  const filePath = join(routesDir, file);
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

console.log('\n✅ Conversión de rutas completada!');
