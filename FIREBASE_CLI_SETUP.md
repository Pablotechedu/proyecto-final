# 🔐 Configuración de Firebase CLI - Cambiar de Cuenta

## 🔄 Cambiar de Cuenta en Firebase CLI

### Paso 1: Cerrar Sesión Actual

```bash
firebase logout
```

Esto cerrará la sesión de la cuenta actual.

### Paso 2: Iniciar Sesión con Nueva Cuenta

```bash
firebase login
```

Esto abrirá tu navegador para que inicies sesión con la cuenta correcta.

### Paso 3: Verificar la Cuenta Actual

```bash
firebase login:list
```

Esto mostrará todas las cuentas autenticadas y cuál está activa.

## 🎯 Proceso Completo de Setup

### 1. Logout y Login

```bash
# Cerrar sesión
firebase logout

# Iniciar sesión con la cuenta correcta
firebase login

# Verificar que estás logueado con la cuenta correcta
firebase login:list
```

### 2. Inicializar Proyecto (Solo Primera Vez)

```bash
# Desde la raíz del proyecto
cd /Users/pabloaguilar/Documents/LM/LM\ HUB/learning-models-hub

# Inicializar Firebase
firebase init
```

Cuando te pregunte:
- **¿Qué features quieres configurar?** 
  - Selecciona: `Firestore` y `Hosting`
- **¿Usar proyecto existente?** 
  - Selecciona: `Use an existing project`
- **¿Qué proyecto?** 
  - Selecciona: `learning-models-hub`
- **¿Archivo de reglas de Firestore?** 
  - Usa: `data-migration/firestore.rules`
- **¿Archivo de índices de Firestore?** 
  - Presiona Enter (usa el default)
- **¿Directorio público para hosting?** 
  - Usa: `dist`
- **¿Configurar como SPA?** 
  - Selecciona: `Yes`
- **¿Sobrescribir index.html?** 
  - Selecciona: `No`

### 3. Generar Archivo de Reglas

```bash
cd data-migration
node deploy-security-rules.js
```

### 4. Desplegar Reglas

```bash
# Desde la raíz del proyecto
cd /Users/pabloaguilar/Documents/LM/LM\ HUB/learning-models-hub

# Desplegar solo las reglas de Firestore
firebase deploy --only firestore:rules
```

## 🔍 Comandos Útiles

### Ver Proyectos Disponibles

```bash
firebase projects:list
```

### Cambiar de Proyecto

```bash
firebase use learning-models-hub
```

### Ver Proyecto Actual

```bash
firebase use
```

### Desplegar Todo

```bash
# Desplegar reglas y hosting
firebase deploy
```

### Desplegar Solo Reglas

```bash
firebase deploy --only firestore:rules
```

### Desplegar Solo Hosting

```bash
firebase deploy --only hosting
```

## 🆘 Solución de Problemas

### Error: "No project active"

```bash
firebase use learning-models-hub
```

### Error: "Not logged in"

```bash
firebase login
```

### Error: "Permission denied"

Verifica que la cuenta con la que iniciaste sesión tenga permisos de Owner o Editor en el proyecto Firebase.

### Ver Logs de Deployment

```bash
firebase deploy --only firestore:rules --debug
```

## 📋 Checklist de Setup

- [ ] Cerrar sesión de cuenta anterior: `firebase logout`
- [ ] Iniciar sesión con cuenta correcta: `firebase login`
- [ ] Verificar cuenta activa: `firebase login:list`
- [ ] Inicializar proyecto: `firebase init` (solo primera vez)
- [ ] Generar reglas: `node data-migration/deploy-security-rules.js`
- [ ] Desplegar reglas: `firebase deploy --only firestore:rules`
- [ ] Verificar en Firebase Console que las reglas se aplicaron
- [ ] Recargar aplicación y verificar que no hay errores de permisos

## 🎯 Comando Rápido (Todo en Uno)

```bash
# Desde la raíz del proyecto
firebase logout && \
firebase login && \
cd data-migration && \
node deploy-security-rules.js && \
cd .. && \
firebase deploy --only firestore:rules
```

Este comando:
1. Cierra sesión
2. Abre el navegador para login
3. Genera el archivo de reglas
4. Despliega las reglas a Firebase

## 💡 Nota Importante

Asegúrate de que la cuenta con la que inicias sesión:
- ✅ Tenga acceso al proyecto `learning-models-hub`
- ✅ Tenga rol de Owner o Editor
- ✅ Sea la cuenta correcta de Learning Models

¿Listo para ejecutar los comandos?
