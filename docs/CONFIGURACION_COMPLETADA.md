# ✅ Configuración Completada - Google Calendar API

## 📁 Archivos Configurados

### 1. Service Account Key
- ✅ **Archivo renombrado**: `functions/serviceAccountKey.json`
- ✅ **Protegido en .gitignore**: No se subirá a GitHub

### 2. Variables de Entorno - Desarrollo Local
- ✅ **Archivo creado**: `functions/.env`
- ✅ **Contenido**:
  ```bash
  GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
  ```
- ✅ **Protegido en .gitignore**: No se subirá a GitHub

---

## 🚀 Próximos Pasos

### PASO 5.2: Configurar Variables para Producción (Firebase)

Cuando estés listo para desplegar a producción, ejecuta este comando:

```bash
# Desde la raíz del proyecto (learning-models-hub/)
cd learning-models-hub

# Subir credenciales a Firebase
firebase functions:config:set google.credentials="$(cat functions/serviceAccountKey.json)"
```

**¿Qué hace este comando?**
- Lee el contenido de `serviceAccountKey.json`
- Lo sube a Firebase como variable de entorno encriptada
- Las Cloud Functions podrán acceder a estas credenciales en producción

### Verificar la configuración:
```bash
# Ver las variables configuradas
firebase functions:config:get
```

---

## 🧪 PASO 7: Probar Localmente (Antes de Desplegar)

### 7.1 Instalar Dependencias
```bash
cd functions
npm install
```

### 7.2 Ejecutar Script de Prueba
```bash
# Asegúrate de estar en la carpeta functions/
node syncCalendar.js
```

**Nota**: El archivo `.env` que creamos hará que el script use las credenciales locales automáticamente.

---

## 📋 Checklist de Configuración

- [x] Google Calendar API habilitada
- [x] Service Account creado
- [x] Llave JSON descargada y renombrada
- [x] Domain-Wide Delegation configurado
- [x] Client ID copiado: `114194384269356802362`
- [ ] Scopes autorizados en Google Workspace Admin Console
- [ ] IDs de terapeutas actualizados en `syncCalendar.js`
- [ ] Campo `patientCode` agregado a pacientes
- [ ] Prueba local exitosa
- [ ] Variables de producción configuradas (`firebase functions:config:set`)
- [ ] Functions desplegadas
- [ ] Programación automática verificada

---

## 🔐 Seguridad

### Archivos Protegidos (No se suben a GitHub):
- ✅ `functions/.env`
- ✅ `functions/serviceAccountKey.json`
- ✅ Cualquier archivo `serviceAccountKey.json` en subcarpetas

### Verificar antes de hacer commit:
```bash
# Ver qué archivos se van a subir
git status

# Asegurarse que NO aparezcan:
# - functions/.env
# - functions/serviceAccountKey.json
```

---

## 📝 Notas Importantes

1. **Desarrollo Local**: Usa el archivo `.env` (ya configurado)
2. **Producción**: Usa `firebase functions:config:set` (pendiente)
3. **Nunca** subas archivos de credenciales a GitHub
4. El `.gitignore` ya está configurado correctamente

---

## 🆘 Si algo sale mal

### Error: "Cannot find module './serviceAccountKey.json'"
**Solución**: Verifica que el archivo esté en `functions/serviceAccountKey.json`

### Error: "GOOGLE_APPLICATION_CREDENTIALS not set"
**Solución**: Verifica que el archivo `functions/.env` exista y tenga el contenido correcto

### Error al desplegar a Firebase
**Solución**: Asegúrate de haber ejecutado `firebase functions:config:set` antes de desplegar

---

## 🎯 Siguiente Paso Inmediato

**PASO 4**: Ir a Google Workspace Admin Console y autorizar el Service Account

1. Ve a: https://admin.google.com/
2. Inicia sesión con cuenta de Super Admin (Mónica)
3. Ve a: **Security** → **Access and data control** → **API controls**
4. Click: **MANAGE DOMAIN-WIDE DELEGATION**
5. Click: **Add new**
6. Configurar:
   - **Client ID**: `114194384269356802362`
   - **OAuth scopes**: `https://www.googleapis.com/auth/calendar.readonly`
7. Click: **AUTHORIZE**

Una vez completado esto, podrás continuar con los pasos de prueba y despliegue.
