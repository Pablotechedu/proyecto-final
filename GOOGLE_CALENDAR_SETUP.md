# 🔧 Configuración de Google Calendar API - Guía Completa

## 📋 Requisitos Previos

- Acceso a Google Cloud Console
- Permisos de Super Admin en Google Workspace
- Proyecto Firebase: `learning-models-hub`

---

## 🚀 PASO 1: Habilitar Google Calendar API

### 1.1 Ir a Google Cloud Console

```
https://console.cloud.google.com/
```

### 1.2 Seleccionar Proyecto

- Proyecto: `learning-models-hub`

### 1.3 Habilitar API

1. Ve a: **APIs & Services** → **Library**
2. Busca: "Google Calendar API"
3. Click en **Enable**

---

## 🔑 PASO 2: Crear Service Account

### 2.1 Crear la Cuenta

1. Ve a: **IAM & Admin** → **Service Accounts**
2. Click: **+ CREATE SERVICE ACCOUNT**
3. Configurar:
   - **Service account name:** `calendar-sync-service`
   - **Service account ID:** `calendar-sync-service@learning-models-hub.iam.gserviceaccount.com`
   - **Description:** "Service account para sincronizar eventos de Google Calendar"
4. Click: **CREATE AND CONTINUE**

### 2.2 Asignar Roles (Opcional)

- No es necesario asignar roles de IAM para este caso
- Click: **CONTINUE**
- Click: **DONE**

### 2.3 Crear Llave JSON

1. En la lista de Service Accounts, encuentra: `calendar-sync-service`
2. Click en los 3 puntos (⋮) → **Manage keys**
3. Click: **ADD KEY** → **Create new key**
4. Tipo: **JSON**
5. Click: **CREATE**
6. Se descargará un archivo JSON (ej: `learning-models-hub-xxxxx.json`)

### 2.4 Guardar Credenciales

```bash
# Mover el archivo descargado a la carpeta del proyecto
mv ~/Downloads/learning-models-hub-xxxxx.json learning-models-hub/functions/serviceAccountKey.json

# IMPORTANTE: Este archivo NO debe subirse a GitHub
# Ya está en .gitignore
```

---

## 🔐 PASO 3: Configurar Domain-Wide Delegation

### 3.1 Habilitar Domain-Wide Delegation

1. Ve a: **IAM & Admin** → **Service Accounts**
2. Click en: `calendar-sync-service@learning-models-hub.iam.gserviceaccount.com`
3. En la pestaña **DETAILS**, busca: **Advanced settings**
4. Click: **SHOW DOMAIN-WIDE DELEGATION**
5. Check: **Enable Google Workspace Domain-wide Delegation**
6. Click: **SAVE**

### 3.2 Copiar Client ID

- Copia el **Client ID** (número largo)
- Ejemplo: `123456789012345678901`

---

## 👥 PASO 4: Autorizar en Google Workspace Admin

### 4.1 Ir a Admin Console

```
https://admin.google.com/
```

**IMPORTANTE:** Debes iniciar sesión con una cuenta de Super Admin (Mónica)

### 4.2 Configurar API Controls

1. Ve a: **Security** → **Access and data control** → **API controls**
2. Scroll hasta: **Domain-wide delegation**
3. Click: **MANAGE DOMAIN-WIDE DELEGATION**

### 4.3 Agregar Service Account

1. Click: **Add new**
2. Configurar:
   - **Client ID:** `[El Client ID copiado en 3.2]`
   - **OAuth scopes:** 
     ```
     https://www.googleapis.com/auth/calendar.readonly
     ```
3. Click: **AUTHORIZE**

---

## 🔧 PASO 5: Configurar Variables de Entorno

### 5.1 Para Desarrollo Local

Crear archivo `.env` en la carpeta `functions/`:

```bash
# functions/.env
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
```

### 5.2 Para Cloud Functions (Producción)

```bash
# Desde la carpeta del proyecto
cd learning-models-hub

# Configurar variable de entorno en Firebase
firebase functions:config:set google.credentials="$(cat functions/serviceAccountKey.json)"
```

---

## 📝 PASO 6: Actualizar IDs de Terapeutas

### 6.1 Obtener IDs de Firestore

1. Ve a Firebase Console → Firestore
2. Colección: `users`
3. Copia los IDs de cada terapeuta

### 6.2 Actualizar syncCalendar.js

Edita `functions/syncCalendar.js` y actualiza el mapeo:

```javascript
const CALENDAR_THERAPIST_MAP = {
  'monica@learningmodels.com.gt': 'gENhg7u2GJdQnnRuge6ZRleu1ih1',
  'ximena@learningmodels.com.gt': '[ID_DE_XIMENA]',
  'miranda@learningmodels.com.gt': '[ID_DE_MIRANDA]',
  'fernanda@learningmodels.com.gt': '[ID_DE_FERNANDA]',
  'mariajimena@learningmodels.com.gt': '[ID_DE_JIMENA]'
};
```

---

## 🧪 PASO 7: Probar Localmente

### 7.1 Instalar Dependencias

```bash
cd functions
npm install
```

### 7.2 Ejecutar Script de Prueba

```bash
# Asegúrate de estar en la carpeta functions/
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json node syncCalendar.js
```

### 7.3 Verificar Resultados

- Revisa los logs en la consola
- Verifica en Firestore que se crearon las sesiones
- Colección: `sessions`
- Busca documentos con ID: `gcal_[eventId]`

---

## 🚀 PASO 8: Desplegar a Cloud Functions

### 8.1 Desplegar

```bash
# Desde la raíz del proyecto
cd learning-models-hub

# Desplegar solo las funciones
firebase deploy --only functions
```

### 8.2 Verificar Deployment

```bash
# Ver logs
firebase functions:log
```

### 8.3 Probar Función HTTP

```bash
# Obtener URL de la función
firebase functions:list

# Probar manualmente
curl "https://us-central1-learning-models-hub.cloudfunctions.net/syncCalendarEvents"
```

---

## ⏰ PASO 9: Verificar Programación Automática

### 9.1 Ver Funciones Programadas

1. Ve a: Firebase Console → Functions
2. Deberías ver:
   - `syncCalendarNoon` - Ejecuta a las 12:30 PM L-V
   - `syncCalendarEvening` - Ejecuta a las 9:00 PM L-V

### 9.2 Monitorear Ejecuciones

```bash
# Ver logs en tiempo real
firebase functions:log --only syncCalendarNoon,syncCalendarEvening
```

---

## 🔍 PASO 10: Agregar patientCode a Pacientes

### 10.1 Actualizar Pacientes Existentes

Necesitas agregar el campo `patientCode` a cada paciente en Firestore:

**Opción A: Manual (Firebase Console)**
1. Ve a Firestore → `patients`
2. Para cada paciente, agrega campo:
   - Campo: `patientCode`
   - Valor: `Nombre_Apellido##` (ej: `Alexia_Urcuyo01`)

**Opción B: Script de Migración**
Crear script para actualizar todos los pacientes automáticamente.

---

## ✅ Checklist de Verificación

- [ ] Google Calendar API habilitada
- [ ] Service Account creado
- [ ] Llave JSON descargada y guardada
- [ ] Domain-Wide Delegation configurado
- [ ] Scopes autorizados en Admin Console
- [ ] IDs de terapeutas actualizados
- [ ] Campo `patientCode` agregado a pacientes
- [ ] Prueba local exitosa
- [ ] Functions desplegadas
- [ ] Programación automática verificada

---

## 🆘 Troubleshooting

### Error: "Insufficient permissions"

**Solución:**
- Verifica que el Service Account tenga Domain-Wide Delegation
- Confirma que los scopes estén autorizados en Admin Console
- Asegúrate de usar la cuenta de Super Admin

### Error: "Patient not found"

**Solución:**
- Verifica que el campo `patientCode` exista en Firestore
- Confirma que el código en Calendar coincida exactamente
- Revisa los logs para ver qué código se está buscando

### Error: "Calendar not found"

**Solución:**
- Verifica que los emails de los calendarios sean correctos
- Confirma que el Service Account tenga acceso
- Prueba con un solo calendario primero

---

## 📚 Referencias

- [Google Calendar API Docs](https://developers.google.com/calendar/api/guides/overview)
- [Service Account Auth](https://cloud.google.com/iam/docs/service-accounts)
- [Domain-Wide Delegation](https://developers.google.com/identity/protocols/oauth2/service-account#delegatingauthority)
- [Firebase Functions](https://firebase.google.com/docs/functions)

---

## 🎯 Próximos Pasos

Una vez completada la configuración:

1. ✅ Sincronización automática funcionando
2. ✅ Sesiones creadas desde Calendar
3. ✅ Horas calculadas automáticamente
4. ✅ Dashboard financiero actualizado
5. ✅ Sin registro manual necesario

---

**¿Necesitas ayuda?** Revisa los logs con:
```bash
firebase functions:log
