# 🔥 Guía de Índices de Firestore

## 📋 Índices Configurados

Los índices de Firestore permiten consultas complejas con `where()` y `orderBy()` de forma eficiente.

### Índices Creados:

1. **Pagos por Mes** (`payments`)
   - `monthCovered` (ASC) + `paymentDate` (DESC)
   - Permite: Obtener pagos de un mes específico ordenados por fecha

2. **Pagos por Paciente** (`payments`)
   - `patientCode` (ASC) + `paymentDate` (DESC)
   - Permite: Historial de pagos de un paciente

3. **Sesiones Completadas por Paciente** (`sessions`)
   - `patientCode` (ASC) + `status` (ASC) + `startTime` (DESC)
   - Permite: Última sesión completada de un paciente

4. **Próximas Sesiones por Paciente** (`sessions`)
   - `patientCode` (ASC) + `status` (ASC) + `startTime` (ASC)
   - Permite: Próxima sesión programada de un paciente

5. **Sesiones por Terapeuta** (`sessions`)
   - `therapistId` (ASC) + `startTime` (ASC)
   - Permite: Agenda del día de un terapeuta

6. **Gastos Ordenados** (`expenses`)
   - `date` (DESC)
   - Permite: Últimos gastos registrados

---

## 🚀 Cómo Desplegar los Índices

### Opción 1: Usando el Script (Recomendado)

```bash
# Dar permisos de ejecución al script
chmod +x deploy-indexes.sh

# Ejecutar el script
./deploy-indexes.sh
```

### Opción 2: Comando Directo

```bash
# Desde la raíz del proyecto
firebase deploy --only firestore:indexes
```

### Opción 3: Desplegar Todo (Reglas + Índices)

```bash
firebase deploy --only firestore
```

---

## ⏱️ Tiempo de Creación

- **Índices pequeños** (< 100 documentos): 1-2 minutos
- **Índices medianos** (100-1000 documentos): 5-10 minutos
- **Índices grandes** (> 1000 documentos): 15-30 minutos

Los índices se crean en segundo plano. Puedes usar la aplicación mientras se crean.

---

## 🔍 Verificar Estado de los Índices

### En Firebase Console:

1. Ve a: https://console.firebase.google.com/project/learning-models-hub/firestore/indexes
2. Verás el estado de cada índice:
   - 🟢 **Enabled**: Listo para usar
   - 🟡 **Building**: En construcción
   - 🔴 **Error**: Hubo un problema

### Desde la Terminal:

```bash
firebase firestore:indexes
```

---

## 📊 Beneficios de los Índices

### Antes (Sin Índices):
```typescript
// ❌ Error: Requiere índice
const q = query(
  paymentsRef,
  where('monthCovered', '==', 'octubre 2025'),
  orderBy('paymentDate', 'desc')
);
```

### Después (Con Índices):
```typescript
// ✅ Funciona perfectamente
const q = query(
  paymentsRef,
  where('monthCovered', '==', 'octubre 2025'),
  orderBy('paymentDate', 'desc')
);
```

### Ventajas:
- ✅ **Consultas más rápidas** (milisegundos vs segundos)
- ✅ **Menos uso de memoria** (no carga todos los documentos)
- ✅ **Escalabilidad** (funciona con miles de documentos)
- ✅ **Paginación eficiente** (con `limit` y `startAfter`)

---

## 🔧 Consultas Optimizadas Disponibles

### 1. Dashboard Financiero

```typescript
// Pagos del mes actual
const payments = await getCurrentMonthPayments();
// Usa índice: monthCovered + paymentDate

// Últimos 5 pagos
const recent = await getRecentPayments(5);
// Usa índice: paymentDate
```

### 2. Historial de Paciente

```typescript
// Pagos de un paciente
const payments = await getPatientPayments('AARRIO01', 10);
// Usa índice: patientCode + paymentDate

// Última sesión completada
const sessions = await getPatientSessions('AARRIO01', 'Completed', 1);
// Usa índice: patientCode + status + startTime
```

### 3. Hub de Terapeuta

```typescript
// Sesiones del día
const sessions = await getTherapistSessions('therapist-id', today);
// Usa índice: therapistId + startTime
```

---

## 🆘 Solución de Problemas

### Error: "Index already exists"
- **Causa**: El índice ya fue creado anteriormente
- **Solución**: No hacer nada, el índice ya está disponible

### Error: "Permission denied"
- **Causa**: No tienes permisos de Owner/Editor en Firebase
- **Solución**: Pide a un administrador que despliegue los índices

### Error: "Index creation failed"
- **Causa**: Puede haber datos incompatibles
- **Solución**: Revisa los datos en Firestore y asegúrate que los campos existan

### Los índices tardan mucho
- **Normal**: Para colecciones grandes puede tomar 30+ minutos
- **Solución**: Espera pacientemente, se crean en segundo plano

---

## 📈 Monitoreo de Rendimiento

### Ver Uso de Índices:

1. Ve a Firebase Console → Firestore → Usage
2. Revisa:
   - Lecturas de documentos
   - Uso de índices
   - Consultas lentas

### Optimizar Consultas:

```typescript
// ✅ Bueno: Usa índice + limit
const q = query(
  collection(db, 'payments'),
  where('monthCovered', '==', month),
  orderBy('paymentDate', 'desc'),
  limit(10)  // Solo trae 10 documentos
);

// ❌ Malo: Trae todo y filtra en memoria
const all = await getDocs(collection(db, 'payments'));
const filtered = all.docs.filter(/* ... */);
```

---

## 🎯 Próximos Pasos

1. **Desplegar índices**: `./deploy-indexes.sh`
2. **Esperar creación**: 5-10 minutos
3. **Verificar estado**: Firebase Console
4. **Probar dashboard**: Debería cargar sin errores
5. **Monitorear rendimiento**: Revisar métricas

---

## 📚 Recursos Adicionales

- [Documentación de Índices de Firestore](https://firebase.google.com/docs/firestore/query-data/indexing)
- [Mejores Prácticas de Consultas](https://firebase.google.com/docs/firestore/best-practices)
- [Límites y Cuotas](https://firebase.google.com/docs/firestore/quotas)

---

¿Listo para desplegar? Ejecuta:

```bash
./deploy-indexes.sh
