# 📋 Próximos Pasos - Integración Google Calendar

## ✅ Lo que ya está hecho:

1. ✅ Script de sincronización creado (`functions/syncCalendar.js`)
2. ✅ Cloud Functions configuradas (HTTP + Programadas)
3. ✅ Script para agregar `patientCode` a pacientes
4. ✅ Guía completa de configuración

---

## 🚀 Pasos para Completar la Integración:

### **PASO 1: Configurar Service Account** ⏱️ 15 min

Sigue la guía: `GOOGLE_CALENDAR_SETUP.md`

**Resumen:**
1. Habilitar Google Calendar API en Google Cloud
2. Crear Service Account
3. Descargar credenciales JSON → `functions/serviceAccountKey.json`
4. Configurar Domain-Wide Delegation
5. Autorizar en Google Workspace Admin Console

**Importante:** Necesitas acceso de Super Admin (Mónica)

---

### **PASO 2: Agregar Códigos a Pacientes** ⏱️ 10 min

```bash
# Opción A: Script automático (genera códigos basados en nombre)
cd learning-models-hub/data-migration
node add-patient-codes.js

# Opción B: Manual en Firebase Console
# Ve a Firestore → patients → Agregar campo "patientCode"
```

**Formato del código:** `Nombre_Apellido01`

**Ejemplos:**
- Alexia Urcuyo → `Alexia_Urcuyo01`
- Juan Diego Aldana → `Juandi_Aldana01`
- Leonardo Rodas → `Leonardo_Rodas01`

**⚠️ IMPORTANTE:** Los códigos deben coincidir EXACTAMENTE con los que usas en Google Calendar (campo Description).

---

### **PASO 3: Actualizar IDs de Terapeutas** ⏱️ 5 min

1. Ve a Firebase Console → Firestore → Colección `users`
2. Copia los IDs de cada terapeuta
3. Actualiza `functions/syncCalendar.js`:

```javascript
const CALENDAR_THERAPIST_MAP = {
  'monica@learningmodels.com.gt': 'gENhg7u2GJdQnnRuge6ZRleu1ih1',
  'ximena@learningmodels.com.gt': '[COPIAR_ID_AQUI]',
  'miranda@learningmodels.com.gt': '[COPIAR_ID_AQUI]',
  'fernanda@learningmodels.com.gt': '[COPIAR_ID_AQUI]',
  'mariajimena@learningmodels.com.gt': '[COPIAR_ID_AQUI]'
};
```

---

### **PASO 4: Instalar Dependencias** ⏱️ 2 min

```bash
cd learning-models-hub/functions
npm install
```

---

### **PASO 5: Probar Localmente** ⏱️ 5 min

```bash
# Asegúrate de tener el archivo serviceAccountKey.json
cd learning-models-hub/functions

# Ejecutar sincronización de prueba
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json node syncCalendar.js
```

**Verificar:**
- ✅ Logs muestran eventos encontrados
- ✅ Sesiones creadas en Firestore (colección `sessions`)
- ✅ IDs de sesiones: `gcal_[eventId]`

---

### **PASO 6: Desplegar a Cloud Functions** ⏱️ 5 min

```bash
cd learning-models-hub

# Desplegar funciones
firebase deploy --only functions
```

**Funciones desplegadas:**
1. `syncCalendarEvents` - HTTP (manual)
2. `syncCalendarNoon` - Programada 12:30 PM L-V
3. `syncCalendarEvening` - Programada 9:00 PM L-V

---

### **PASO 7: Verificar Funcionamiento** ⏱️ 5 min

```bash
# Ver logs
firebase functions:log

# Probar función HTTP manualmente
curl "https://us-central1-learning-models-hub.cloudfunctions.net/syncCalendarEvents"
```

---

## 🎯 Resultado Final:

Una vez completado:

✅ **Sincronización automática** 2 veces al día (12:30 PM y 9:00 PM)
✅ **Sesiones creadas automáticamente** desde Google Calendar
✅ **Horas calculadas** para cada sesión
✅ **Dashboard financiero** actualizado con horas reales
✅ **Sin registro manual** de sesiones

---

## 📊 Estructura de Datos:

### Sesión creada desde Calendar:

```javascript
{
  sessionId: "gcal_abc123xyz",
  patientId: "patient_id_from_code",
  therapistId: "therapist_id_from_calendar",
  startTime: Timestamp,
  endTime: Timestamp,
  duration: 1.5, // horas
  title: "Terapia - Alexia Urcuyo",
  location: "Presencial",
  source: "google_calendar",
  calendarId: "monica@learningmodels.com.gt",
  googleEventId: "abc123xyz",
  status: "Scheduled",
  formCompleted: false,
  updatedAt: Timestamp
}
```

---

## 🔍 Troubleshooting:

### Problema: "Patient not found"

**Causa:** El código en Calendar no coincide con Firestore

**Solución:**
1. Verifica el código en Google Calendar (campo Description)
2. Verifica el código en Firestore (campo `patientCode`)
3. Deben ser EXACTAMENTE iguales

### Problema: "Insufficient permissions"

**Causa:** Service Account no tiene permisos

**Solución:**
1. Verifica Domain-Wide Delegation en Google Cloud
2. Verifica autorización en Google Workspace Admin
3. Scope correcto: `https://www.googleapis.com/auth/calendar.readonly`

### Problema: "Calendar not found"

**Causa:** Email del calendario incorrecto

**Solución:**
1. Verifica emails en `CALENDAR_THERAPIST_MAP`
2. Confirma que los calendarios existen
3. Prueba con un solo calendario primero

---

## 📞 Soporte:

Si encuentras problemas:

1. Revisa los logs: `firebase functions:log`
2. Verifica la guía completa: `GOOGLE_CALENDAR_SETUP.md`
3. Consulta la documentación de Google Calendar API

---

## ⏱️ Tiempo Total Estimado: ~45 minutos

- Configuración Service Account: 15 min
- Agregar códigos pacientes: 10 min
- Actualizar IDs terapeutas: 5 min
- Instalar dependencias: 2 min
- Prueba local: 5 min
- Deploy: 5 min
- Verificación: 5 min

---

**¡Listo para empezar!** 🚀

Comienza con el PASO 1 y sigue la guía `GOOGLE_CALENDAR_SETUP.md`
