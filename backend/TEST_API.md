# Pruebas del API - Hub Terapias

## 🚀 Servidor Corriendo

**URL Base:** `http://localhost:5001`

---

## 1️⃣ Health Check

```bash
curl http://localhost:5001/health
```

**Respuesta esperada:**
```json
{
  "status": "OK",
  "timestamp": "2025-10-26T...",
  "environment": "development",
  "version": "1.0.0"
}
```

---

## 2️⃣ Registrar Usuario

```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@hubterapias.com",
    "password": "admin123",
    "name": "Administrador",
    "role": "admin"
  }'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "abc123",
      "email": "admin@hubterapias.com",
      "name": "Administrador",
      "role": "admin",
      "isDirector": false
    }
  }
}
```

---

## 3️⃣ Login

```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@hubterapias.com",
    "password": "admin123"
  }'
```

**Guarda el token que te devuelve:**
```bash
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 4️⃣ Obtener Usuario Actual

```bash
curl http://localhost:5001/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

---

## 5️⃣ Listar Pacientes (Endpoint de prueba)

```bash
curl http://localhost:5001/api/patients \
  -H "Authorization: Bearer $TOKEN"
```

**Respuesta actual (placeholder):**
```json
{
  "success": true,
  "message": "Endpoint de pacientes - Por implementar",
  "data": []
}
```

---

## 6️⃣ Verificar Datos Migrados en Firestore

Los datos ya están en Firestore. Para verificar:

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona **hub-terapias**
3. Ve a **Firestore Database**
4. Deberías ver las colecciones:
   - `users` (14 documentos)
   - `patients` (109 documentos)
   - `sessions` (180 documentos)
   - `payments` (1 documento)
   - `expenses` (12 documentos)
   - `payrolls` (6 documentos)

---

## 📊 Resumen de Migración

✅ **364 documentos migrados:**
- 14 usuarios
- 109 pacientes
- 180 sesiones
- 1 pago
- 12 gastos
- 6 planillas
- 39 padres/tutores (subcolección)
- 3 profesionales relacionados (subcolección)

---

## 🔧 Troubleshooting

### Error: EADDRINUSE
El puerto está en uso. Cambia el puerto en `.env`:
```env
PORT=5001
```

### Error: Cannot find module './serviceAccountKey.json'
Copia el service account key:
```bash
cp migration-scripts/hub-terapias-key.json hub-terapias/backend/serviceAccountKey.json
```

### Error: JWT_SECRET is not defined
Verifica que el archivo `.env` existe y tiene la variable `JWT_SECRET`.

---

## ✅ Estado Actual

- [x] Backend configurado
- [x] Firebase conectado
- [x] Datos migrados (364 documentos)
- [x] Autenticación JWT funcionando
- [ ] CRUD de Pacientes (por implementar)
- [ ] CRUD de Sesiones (por implementar)
- [ ] CRUD de Pagos (por implementar)
