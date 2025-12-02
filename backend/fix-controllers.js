import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const controllersDir = join(__dirname, 'src/controllers');

// Leer todos los archivos
const files = readdirSync(controllersDir).filter(f => f.endsWith('.js'));

console.log(`Corrigiendo ${files.length} controladores...\n`);

files.forEach(file => {
  const filePath = join(controllersDir, file);
  console.log(`Procesando ${file}...`);
  
  try {
    let content = readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Verificar si tiene algún require
    if (content.includes('require(')) {
      // Reemplazar todos los tipos de require
      content = content.replace(/const\s+({[^}]+})\s*=\s*require\(['"]\.\.\/config\/firebase['"]\);?/g, 
        'import $1 from \'../config/firebase.js\';');
      
      content = content.replace(/const\s+({[^}]+})\s*=\s*require\(['"]\.\.\/utils\/bcrypt['"]\);?/g, 
        'import $1 from \'../utils/bcrypt.js\';');
      
      content = content.replace(/const\s+({[^}]+})\s*=\s*require\(['"]\.\.\/utils\/jwt['"]\);?/g, 
        'import $1 from \'../utils/jwt.js\';');
      
      content = content.replace(/const\s+({[^}]+})\s*=\s*require\(['"]\.\.\/utils\/pagination['"]\);?/g, 
        'import $1 from \'../utils/pagination.js\';');
      
      content = content.replace(/const\s+(\w+)\s*=\s*require\(['"]\.\.\/utils\/bcrypt['"]\);?/g, 
        'import * as $1 from \'../utils/bcrypt.js\';');
      
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
