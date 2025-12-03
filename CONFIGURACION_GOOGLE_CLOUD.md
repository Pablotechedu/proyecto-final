# Configuración de Google Cloud para Firebase Admin SDK

## Problema: Error de Permisos al Crear Usuarios

Si recibes un error como:
```
Error de configuración: La cuenta de servicio no tiene permisos suficientes
Caller does not have required permission to use project...
```

Esto significa que la cuenta de servicio de Firebase Admin SDK no tiene los permisos necesarios para administrar usuarios.

## Solución: Configurar Permisos en Google Cloud Console

### Paso 1: Habilitar APIs Necesarias

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto: `hub-terapias`
3. Ve a **APIs & Services** > **Library**
4. Busca y habilita las siguientes APIs:
   - **Identity Toolkit API** (requerida para Firebase Auth)
   - **Cloud Identity** (opcional pero recomendada)

### Paso 2: Asignar Roles a la Cuenta de Servicio

1. Ve a **IAM & Admin** > **IAM**
2. Busca la cuenta de servicio que estás usando (el email está en tu archivo `serviceAccountKey.json`, campo `client_email`)
3. Haz clic en el icono de editar (lápiz) junto a la cuenta de servicio
4. Agrega los siguientes roles:
   - **Firebase Authentication Admin** (roles/firebaseauth.admin)
   - **Service Usage Consumer** (roles/serviceusage.serviceUsageConsumer)
   - **Firebase Admin** (roles/firebase.admin) - opcional pero recomendado

### Paso 3: Verificar la Configuración

Después de configurar los permisos:

1. Espera 1-2 minutos para que los cambios se propaguen
2. Reinicia tu servidor backend:
   ```bash
   cd hub-terapias/backend
   npm start
   ```
3. Intenta crear un usuario nuevamente desde la interfaz

## Alternativa: Crear Nueva Cuenta de Servicio con Permisos Completos

Si los pasos anteriores no funcionan, puedes crear una nueva cuenta de servicio:

1. Ve a **IAM & Admin** > **Service Accounts**
2. Haz clic en **Create Service Account**
3. Nombre: `firebase-admin-full`
4. Descripción: `Cuenta de servicio con permisos completos para Firebase Admin SDK`
5. Haz clic en **Create and Continue**
6. Asigna los roles:
   - Firebase Admin
   - Firebase Authentication Admin
   - Service Usage Consumer
7. Haz clic en **Continue** y luego **Done**
8. En la lista de cuentas de servicio, haz clic en la nueva cuenta
9. Ve a la pestaña **Keys**
10. Haz clic en **Add Key** > **Create New Key**
11. Selecciona **JSON** y haz clic en **Create**
12. Guarda el archivo descargado como `serviceAccountKey.json` en la carpeta `hub-terapias/backend/`
13. Reinicia el servidor backend

## Verificación de Permisos Actuales

Para ver qué permisos tiene tu cuenta de servicio actual:

1. Ve a **IAM & Admin** > **IAM**
2. Busca tu cuenta de servicio
3. Revisa la columna "Role" para ver todos los roles asignados

## Notas Importantes

- **Seguridad**: El archivo `serviceAccountKey.json` contiene credenciales sensibles. NUNCA lo subas a repositorios públicos.
- **Entorno de Producción**: Considera usar diferentes cuentas de servicio para desarrollo y producción con permisos mínimos necesarios.
- **Facturación**: Algunas APIs requieren que el proyecto tenga una cuenta de facturación activa.

## Roles Mínimos Requeridos para Diferentes Operaciones

| Operación | Rol Requerido |
|-----------|---------------|
| Crear usuarios | Firebase Authentication Admin |
| Leer/Escribir Firestore | Cloud Datastore User |
| Gestionar storage | Firebase Admin o Storage Admin |
| Usar APIs de Google Cloud | Service Usage Consumer |

## Problemas Comunes

### "API not enabled"
**Solución**: Habilita la API correspondiente en APIs & Services > Library

### "Billing account not configured"
**Solución**: Asegúrate de que tu proyecto tenga una cuenta de facturación asociada en Billing

### "Permission denied"
**Solución**: Verifica que la cuenta de servicio tenga todos los roles necesarios en IAM

## Soporte Adicional

Si después de seguir estos pasos sigues teniendo problemas:

1. Verifica que el archivo `serviceAccountKey.json` es el correcto y corresponde al proyecto `hub-terapias`
2. Revisa los logs del backend para ver el error exacto
3. Consulta la [documentación oficial de Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
