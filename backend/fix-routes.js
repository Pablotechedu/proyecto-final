import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const routesDir = join(__dirname, 'src/routes');

// Leer todos los archivos del directorio de rutas
const files = readdirSync(routesDir).filter(f => f.endsWith('.js'));

console.log(`Corrigiendo ${files.length} archivos de rutas...\n`);

files.forEach(file => {
  const filePath = join(routesDir, file);
  console.log(`Procesando ${file}...`);
  
  try {
    let content = readFileSync(filePath, 'utf8');
    
    // Buscar patrones de require que quedaron
    const requirePattern = /const\s+{([^}]+)}\s*=\s*require\(['"]\.\.\/controllers\/(\w+)['"]\);?/g;
    
    if (requirePattern.test(content)) {
      // Resetear el regex
      requirePattern.lastIndex = 0;
      
      const match = requirePattern.exec(content);
      if (match) {
        const controllerName = match[2];
        const functions = match[1];
        
        // Reemplazar con import
        content = content.replace(
          requirePattern,
          `import * as ${controllerName} from '../controllers/${controllerName}.js';\n\nconst {${functions}} = ${controllerName};`
        );
        
        writeFileSync(filePath, content, 'utf8');
        console.log(`✅ ${file} corregido`);
      }
    } else {
      console.log(`✓ ${file} ya está correcto`);
    }
  } catch (error) {
    console.error(`❌ Error en ${file}:`, error.message);
  }
});

console.log('\n✅ Corrección completada!');
