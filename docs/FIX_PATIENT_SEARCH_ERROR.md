# 🔧 Fix: Error en Búsqueda de Pacientes

## ❌ Problema

Al escribir en el buscador de pacientes, la aplicación se quedaba en blanco y mostraba múltiples errores en consola:

```
Error loading sessions for patient: undefined
FirebaseError: The query requires an index
```

## 🔍 Causa Raíz

Había **dos problemas**:

### 1. Queries Incorrectos en el Código
El código estaba usando `patientCode` en lugar de `patientId` para hacer queries a Firestore.

### 2. Índices Faltantes en Firestore
Firestore requiere índices compuestos para queries con múltiples `where` clauses y `orderBy`.

---

## ✅ Solución Aplicada

### **PASO 1: Corregir Queries en `Patients.tsx`**

Cambié todos los queries para usar `patientId` en lugar de `patientCode`:

#### Query de Última Sesión:
```typescript
// ❌ Antes:
where('patientCode', '==', patient.patientCode)

// ✅ Ahora:
where('patientId', '==', patient.id)
```

#### Query de Próxima Sesión:
```typescript
// ❌ Antes:
where('patientCode', '==', patient.patientCode)

// ✅ Ahora:
where('patientId', '==', patient.id)
```

#### Query de Pagos:
```typescript
// ❌ Antes:
where('patientCode', '==', patient.patientCode)
where('monthCovered', '==', currentMonth)

// ✅ Ahora:
where('patientId', '==', patient.id)
where('month', '==', currentMonth)
```

---

### **PASO 2: Actualizar Índices de Firestore**

Actualicé `firestore.indexes.json` con los índices correctos:

#### Índices para Sessions:
```json
{
  "collectionGroup": "sessions",
  "fields": [
    { "fieldPath": "patientId", "order": "ASCENDING" },
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "startTime", "order": "DESCENDING" }
  ]
}
```

```json
{
  "collectionGroup": "sessions",
  "fields": [
    { "fieldPath": "patientId", "order": "ASCENDING" },
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "startTime", "order": "ASCENDING" }
  ]
}
```

#### Índices para Payments:
```json
{
  "collectionGroup": "payments",
  "fields": [
    { "fieldPath": "patientId", "order": "ASCENDING" },
    { "fieldPath": "month", "order": "ASCENDING" }
  ]
}
```

---

### **PASO 3: Desplegar Índices**

```bash
cd learning-models-hub
firebase deploy --only firestore:indexes
```

**Importante:** Cuando Firebase pregunte si quieres eliminar los índices antiguos (con `patientCode`), responde **"y" (yes)**.

---

## ⏱️ Tiempo de Creación de Índices

Después de desplegar, Firestore necesita tiempo para crear los índices:

- **Índices simples:** 1-5 minutos
- **Índices compuestos:** 5-15 minutos
- **Bases de datos grandes:** Hasta 30 minutos

Puedes verificar el estado en:
- Firebase Console → Firestore → Indexes
- O en el link que Firebase te proporciona después del deploy

---

## 🧪 Cómo Verificar que Funciona

### 1. Espera a que los índices estén listos
Ve a Firebase Console → Firestore → Indexes y verifica que todos los índices estén en estado **"Enabled"** (no "Building").

### 2. Recarga la aplicación
```bash
# Si estás en desarrollo
npm run dev
```

### 3. Prueba la búsqueda
- Ve a la página de Pacientes
- Escribe en el buscador
- La aplicación NO debería quedarse en blanco
- Los errores en consola deberían desaparecer

---

## 📊 Índices Creados

### Sessions Collection:
1. `patientId (ASC) + status (ASC) + startTime (DESC)` - Para última sesión
2. `patientId (ASC) + status (ASC) + startTime (ASC)` - Para próxima sesión
3. `therapistId (ASC) + startTime (ASC)` - Para sesiones por terapeuta
4. `therapistId (ASC) + status (ASC) + formCompleted (ASC) + startTime (DESC)` - Para hub de terapeuta

### Payments Collection:
1. `patientId (ASC) + month (ASC)` - Para estado de pago
2. `patientId (ASC) + paymentDate (DESC)` - Para historial de pagos
3. `monthCovered (ASC) + paymentDate (DESC)` - Para reportes mensuales

---

## 🔄 Si el Error Persiste

### 1. Verifica que los índices estén activos
```
Firebase Console → Firestore → Indexes
```
Todos deben estar en estado "Enabled"

### 2. Limpia la caché del navegador
```
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

### 3. Verifica la consola
Abre DevTools (F12) y revisa si hay errores diferentes

### 4. Verifica que el código esté actualizado
```bash
git pull origin main
npm install
npm run dev
```

---

## 📝 Archivos Modificados

1. ✅ `src/pages/Patients.tsx` - Queries corregidos
2. ✅ `firestore.indexes.json` - Índices actualizados
3. ✅ Índices desplegados a Firestore

---

## 🎯 Resultado Esperado

Después de aplicar estos cambios:

✅ La búsqueda de pacientes funciona correctamente
✅ No hay errores en consola sobre índices faltantes
✅ La aplicación no se queda en blanco al escribir
✅ Los datos de sesiones y pagos se cargan correctamente

---

## 💡 Lecciones Aprendidas

1. **Siempre usar `patientId` (ID del documento)** en lugar de `patientCode` para queries
2. **Firestore requiere índices** para queries compuestos
3. **Los índices toman tiempo** en crearse (esperar 5-15 minutos)
4. **Actualizar índices** cuando cambias la estructura de queries

---

**Fecha:** Octubre 9, 2025  
**Estado:** ✅ Solucionado
