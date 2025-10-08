# Guía de Despliegue - Learning Models HUB

## 🎯 Estado Actual vs Producción

### ✅ Lo que YA funciona (Modo Desarrollo):
- Login con usuarios demo
- Navegación completa
- Dashboard financiero con datos mock
- Hub de terapeuta
- Todas las interfaces y diseño

### 🔧 Para Producción Completa necesitas:

## 1. Firebase (Obligatorio para funcionalidad completa)

### ¿Qué hace Firebase?
- **Autenticación**: Login real con usuarios reales
- **Base de datos**: Almacenar pacientes, sesiones, pagos
- **Seguridad**: Reglas de acceso por roles
- **Tiempo real**: Actualizaciones automáticas

### Configuración Firebase:
```bash
# Costo: GRATIS hasta 50,000 lecturas/día
# Perfecto para Learning Models
```

## 2. Opciones de Hosting

### Opción A: Firebase Hosting (RECOMENDADO)
```bash
# Ventajas:
✅ Integración perfecta con Firebase
✅ HTTPS automático
✅ CDN global
✅ Dominio personalizado GRATIS
✅ Costo: $0 para tu volumen

# Tu subdominio funcionaría:
hub.learningmodels.com.gt → Firebase
```

### Opción B: Tu Hostinger Actual
```bash
# Ventajas:
✅ Usas tu hosting existente
✅ Mismo proveedor

# Desventajas:
❌ Necesitas configurar build manual
❌ No integración automática
❌ Más complejo de mantener
```

### Opción C: Vercel/Netlify (Alternativa)
```bash
# Similar a Firebase Hosting
✅ Gratis
✅ Fácil configuración
✅ Dominio personalizado
```

## 3. Plan de Implementación Recomendado

### Fase 1: Firebase + Hosting (1-2 días)
1. Crear proyecto Firebase
2. Configurar autenticación
3. Crear usuarios reales del equipo
4. Deploy en Firebase Hosting
5. Configurar dominio personalizado

### Fase 2: Datos Reales (1 semana)
1. Migrar pacientes existentes
2. Configurar estructura de sesiones
3. Importar datos de pagos históricos

### Fase 3: Integraciones (2-3 semanas)
1. Google Calendar API
2. Google Gemini AI
3. WhatsApp notifications

## 4. Costos Estimados

### Firebase (Google):
- **Gratis** hasta 50,000 operaciones/día
- Para Learning Models: **$0/mes**

### Hosting:
- **Firebase Hosting**: $0/mes
- **Tu Hostinger**: Ya lo tienes

### Dominio:
- **Subdominio**: $0 (hub.tudominio.com)

## 5. Configuración de Subdominio

### En tu proveedor de dominio:
```dns
# Tipo: CNAME
# Nombre: hub
# Valor: learning-models-hub.web.app
# Resultado: hub.learningmodels.com.gt
```

## 6. Comandos de Deploy

### Build para producción:
```bash
cd learning-models-hub
npm run build
```

### Deploy a Firebase:
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

## 7. ¿Qué necesitas hacer HOY?

### Opción Rápida (30 minutos):
1. Crear cuenta Firebase (gratis)
2. Seguir wizard de configuración
3. Actualizar `src/services/firebase.ts`
4. ¡Listo! Tendrás login real

### Opción Completa (1 día):
1. Todo lo anterior +
2. Deploy a Firebase Hosting
3. Configurar dominio personalizado
4. Crear usuarios del equipo

## 8. Respuesta a tu pregunta específica:

**¿Funcionaría con subdominio en Hostinger?**
✅ **SÍ**, pero recomiendo Firebase Hosting porque:
- Integración automática
- Actualizaciones más fáciles
- Mejor rendimiento
- Costo $0

**¿Necesitas Firebase obligatoriamente?**
✅ **SÍ**, para funcionalidad completa:
- Sin Firebase = Solo demo
- Con Firebase = Sistema real completo

## 🚀 Próximos Pasos Recomendados:

1. **Crear proyecto Firebase** (15 min)
2. **Configurar autenticación** (15 min)
3. **Probar con usuarios reales** (30 min)
4. **Deploy a producción** (30 min)

¿Te ayudo con alguno de estos pasos específicos?
