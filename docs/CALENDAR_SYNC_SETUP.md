# 🗓️ Configuración de Sincronización con Google Calendar

## ❌ Error Actual

```
unauthorized_client: Client is unauthorized to retrieve access tokens using this method
```

Este error significa que la Service Account no tiene permisos para acceder a los calendarios de los usuarios.

---

## ✅ Solución: Configurar Domain-Wide Delegation

### **Paso 1: Obtener el Client ID de la Service Account**

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Selecciona tu proyecto: **learning-models-hub**
3. Ve a **IAM & Admin** → **Service Accounts**
4. Encuentra la service account que creaste (debería terminar en `@learning-models-hub.iam.gserviceaccount.com`)
5. Haz clic en ella
6. Copia el **Client ID** (es un número largo, ej: `123456789012345678901`)

---

### **Paso 2: Habilitar Domain-Wide Delegation en Google Workspace Admin**

⚠️ **IMPORTANTE:** Necesitas ser **Super Admin** de Google Workspace para hacer esto.

1. Ve a [Google Workspace Admin Console](https://admin.google.com)
2. Inicia sesión con una cuenta de **Super Admin** (probablemente `monica@learningmodels.com.gt` o `pablo@learningmodels.com.gt`)
3. Ve a **Seguridad** → **Acceso y control de datos** → **Controles de API**
4. En la sección **Delegación en todo el dominio**, haz clic en **Administrar la delegación en todo el dominio**
5. Haz clic en **Agregar nuevo**
6. Ingresa:
   - **Client ID:** (el que copiaste en el Paso 1)
   - **Ámbitos de OAuth:**
     ```
     https://www.googleapis.com/auth/calendar.readonly
     ```
7. Haz clic en **Autorizar**

---

### **Paso 3: Verificar la Configuración**

Después de configurar la delegación, espera **5-10 minutos** para que los cambios se propaguen.

Luego ejecuta:

```bash
cd learning-models-hub/functions
node test-calendar-access.js
```

**Resultado esperado:**

```
✅ Acceso exitoso a Google Calendar
📅 Eventos encontrados: X
```

---

## 🔧 Alternativa: Verificar el Service Account Key

Si el error persiste, verifica que el archivo `serviceAccountKeyCALENDAR.json` sea correcto:

```bash
cd learning-models-hub/functions
cat serviceAccountKeyCALENDAR.json
```

Debe contener:

```json
{
  "type": "service_account",
  "project_id": "learning-models-hub",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...",
  "client_email": "...@learning-models-hub.iam.gserviceaccount.com",
  "client_id": "...",
  ...
}
```

---

## 📋 Checklist de Configuración

- [ ] Service Account creada en Google Cloud Console
