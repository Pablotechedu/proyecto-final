# Guía de Migración de Pacientes

## Resumen

Esta guía documenta cómo agregar los nuevos campos necesarios al CSV de pacientes para la migración a Firestore.

## Nuevos Campos Agregados

### 1. `hourlyRate` (Cobro por hora)
- **Tipo**: Número
- **Descripción**: Tarifa por hora que se cobra por cada paciente
- **Ejemplo**: `150`, `175`, `200`
- **Nota**: El script de importación convertirá automáticamente este valor a número

### 2. `paymentFrequency` (Frecuencia de pago)
- **Tipo**: String
- **Valores permitidos**: `"weekly"`, `"monthly"`, `"semanal"`, o `"mensual"`
- **Descripción**: Indica si el pago es semanal o mensual
- **Ejemplo**: `monthly`, `weekly`

### 3. `assignedTherapist` (Terapeuta(s) asignado(s))
- **Tipo**: String
- **Descripción**: Email(s) del/los terapeuta(s) asignado(s) al paciente
- **Formato para un terapeuta**: `ximena@learningmodels.com.gt`
- **Formato para múltiples terapeutas**: `ximena@learningmodels.com.gt,miranda@learningmodels.com.gt`
- **Nota**: Si hay múltiples terapeutas, separarlos con comas. El script limpiará automáticamente los espacios extras.

## Estructura del CSV

### Columnas completas:
```csv
firstName,lastName,patientCode,birthDate,school,grade,startDate,status,diagnosis,hourlyRate,paymentFrequency,assignedTherapist
```

### Ejemplo de datos:
```csv
firstName,lastName,patientCode,birthDate,school,grade,startDate,status,diagnosis,hourlyRate,paymentFrequency,assignedTherapist
Andrés,Arriola,AARRIO01,2016-05-12,Interamericano,4to Primaria,2023-02-01,active,Dislexia,150,monthly,"ximena@learningmodels.com.gt,miranda@learningmodels.com.gt"
Sofía,Castillo,SCASTI02,2017-11-20,Montessori,3ro Primaria,2023-05-10,active,TDAH,175,weekly,laura@learningmodels.com.gt
Mateo,Vargas,MVARGA03,2015-01-30,Julio Verne,5to Primaria,2022-09-01,inactive,Discalculia,150,monthly,
```

**Notas importantes:**
- Si un campo contiene comas (como múltiples terapeutas), enciérralo entre comillas dobles
- Si un paciente no tiene terapeuta asignado, deja el campo vacío
- Los campos `hourlyRate`, `paymentFrequency` y `assignedTherapist` son opcionales

## Cambios Realizados en el Código

### 1. Interfaz TypeScript (`src/types/index.ts`)

Se agregaron los siguientes campos a la interfaz `Patient`:

```typescript
export interface Patient {
  // ... campos existentes ...
  assignedTherapist?: string
  hourlyRate?: number
  paymentFrequency?: 'weekly' | 'monthly' | 'semanal' | 'mensual'
}
```

### 2. Script de Importación (`data-migration/import.js`)

Se agregó lógica de transformación de datos específica para la colección `patients`:

- **Conversión de tipos**: `hourlyRate`, `age`, y `currentRate` se convierten automáticamente a números
- **Limpieza de emails**: Si `assignedTherapist` contiene múltiples emails separados por comas, se eliminan los espacios extras alrededor de cada email

## Cómo Usar los Terapeutas Asignados en el Código

Cuando necesites trabajar con los terapeutas en tu aplicación:

```typescript
// Obtener array de terapeutas desde el string
const therapists = patient.assignedTherapist?.split(',').map(t => t.trim()) || [];

// Iterar sobre los terapeutas
therapists.forEach(therapistEmail => {
  console.log(therapistEmail);
});

// Verificar si un terapeuta específico está asignado
const isAssigned = therapists.includes('ximena@learningmodels.com.gt');

// Obtener el número de terapeutas asignados
const therapistCount = therapists.length;
```

## Proceso de Migración

1. **Preparar el CSV**: Agrega las columnas `hourlyRate`, `paymentFrequency`, y `assignedTherapist` con los datos correspondientes
2. **Guardar el archivo**: Asegúrate de que el archivo se llame `patients.csv` y esté en la carpeta `data-migration`
3. **Ejecutar la migración**:
   ```bash
   cd learning-models-hub/data-migration
   node import.js
   ```
4. **Verificar**: El script mostrará un resumen de la importación con el número de registros procesados

## Solución de Problemas

### Error: "hourlyRate is not a number"
- Asegúrate de que el valor en el CSV sea un número válido (sin símbolos de moneda ni espacios)

### Error: "Invalid paymentFrequency"
- Verifica que uses uno de los valores permitidos: `weekly`, `monthly`, `semanal`, o `mensual`

### Múltiples terapeutas no se guardan correctamente
- Asegúrate de encerrar el valor entre comillas dobles si contiene comas
- Ejemplo correcto: `"email1@domain.com,email2@domain.com"`

## Ejemplo Completo de CSV

```csv
firstName,lastName,patientCode,birthDate,school,grade,startDate,status,diagnosis,hourlyRate,paymentFrequency,assignedTherapist
Andrés,Arriola,AARRIO01,2016-05-12,Interamericano,4to Primaria,2023-02-01,active,Dislexia,150,monthly,"ximena@learningmodels.com.gt,miranda@learningmodels.com.gt"
Sofía,Castillo,SCASTI02,2017-11-20,Montessori,3ro Primaria,2023-05-10,active,TDAH,175,weekly,laura@learningmodels.com.gt
Mateo,Vargas,MVARGA03,2015-01-30,Julio Verne,5to Primaria,2022-09-01,inactive,Discalculia,150,monthly,monica@learningmodels.com.gt
