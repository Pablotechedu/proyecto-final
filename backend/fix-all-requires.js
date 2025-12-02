import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const routesDir = join(__dirname, 'src/routes');

// Leer todos los archivos
const files = readdirSync(routesDir).filter(f => f.endsWith('.js'));

console.log(`Corrigiendo todos los requires en ${files.length} archivos de rutas...\n`);

files.forEach(file => {
  const filePath = join(routesDir, file);
  console.log(`Procesando ${file}...`);
  
  try {
    let content = readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Verificar si tiene algún require
    if (content.includes('require(')) {
      // Reemplazar require de firebase
      if (content.includes('require(\'../config/firebase\')')) {
        content = content.replace(/const\s+{\s*db\s*}\s*=\s*require\(['"]\.\.\/config\/firebase['"]\);?/g, 
          'import { db } from \'../config/firebase.js\';');
        modified = true;
      }
      
      // Reemplazar otros requires si existen
      content = content.replace(/const\s+({[^}]+})\s*=\s*require\(['"]\.\.\/middlewares\/auth\.middleware['"]\);?/g, 
        'import $1 from \'../middlewares/auth.middleware.js\';');
      
      content = content.replace(/const\s+({[^}]+})\s*=\s*require\(['"]\.\.\/middlewares\/role\.middleware['"]\);?/g, 
        'import $1 from \'../middlewares/role.middleware.js\';');
      
      content = content.replace(/const\s+upload\s*=\s*require\(['"]\.\.\/middlewares\/upload\.middleware['"]\);?/g, 
        'import upload from \'../middlewares/upload.middleware.js\';');
      
      modified = true;
    }
    
    if (modified) {
      writeFileSync(filePath, content, 'utf8');
      console.log(`✅ ${file} corregido`);
    } else {
      console.log(`✓ ${file} ya está correcto`);
    }
  } catch (error) {
    console.error(`❌ Error en ${file}:`, error.message);
  }
});

console.log('\n✅ Corrección completada!');
