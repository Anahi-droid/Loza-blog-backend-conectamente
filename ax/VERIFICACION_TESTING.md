# 🚀 GUÍA DE VERIFICACIÓN Y TESTING - POSTMAN

---

## 📥 PASO 1: IMPORTAR COLECCIÓN EN POSTMAN

### Opción A: Importar desde archivo

1. **Abre Postman**
2. **Click en botón "Import"** (arriba a la izquierda)
3. **Selecciona "Upload Files"**
4. **Navega a:** `/home/starax/Escritorio/loza-conectamente/Loza-Conectamente-API-Collection.postman_collection.json`
5. **Click en "Import"**

### Opción B: Importar desde carpeta del proyecto

```bash
# Terminal
cd /home/starax/Escritorio/loza-conectamente/
# Abre el archivo .postman_collection.json en cualquier editor de texto
# Copia todo el contenido
# En Postman: Import → Paste Raw Text → Pega el contenido
```

---

## ⚙️ PASO 2: CONFIGURAR VARIABLES DE ENTORNO

### Crear Environment en Postman

1. **Click en "Environments"** (lado izquierdo)
2. **Click en "+"** para crear nuevo environment
3. **Nombre:** `Loza Local Dev`
4. **Agregar variables:**

```
VARIABLE NAME          | INITIAL VALUE                | CURRENT VALUE
─────────────────────────────────────────────────────────────────────
baseUrl                | http://localhost:3000        | http://localhost:3000
jwt_token              | (se actualiza tras login)    | (se actualiza tras login)
encuesta_id            | 64af5e3bcc7f1a2c3d4e5f6g   | (actualizar tras crear)
notificacion_id        | 64bf5e3bcc7f1a2c3d4e5f7h   | (actualizar tras crear)
mensaje_id             | 64cf5e3bcc7f1a2c3d4e5f8i   | (actualizar tras crear)
test_resultado_id      | 64df5e3bcc7f1a2c3d4e5f9j   | (actualizar tras crear)
```

5. **Click en "Save"**
6. **Selecciona este environment en el dropdown arriba**

---

## 🔑 PASO 3: OBTENER JWT TOKEN

### Prerequisito: Usuario en la base de datos

El usuario debe existir en PostgreSQL con rol y contraseña.

### Método 1: Desde Postman (si tienes /auth/login)

```
POST http://localhost:3000/auth/login

Body (raw JSON):
{
  "email": "paciente@test.com",
  "password": "pass123"
}

Response esperada:
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "paciente@test.com",
    "rol": "PACIENTE"
  }
}
```

### Método 2: Copiar token directamente

Si ya tienes un token JWT válido:

1. **En Postman**, click en **Environments**
2. **Selecciona tu environment**
3. **Busca `jwt_token`**
4. **Pega tu token en "CURRENT VALUE"**
5. **Save**

---

## ✅ PASO 4: VERIFICAR CONEXIÓN

### Test 1: Ping simple

```
GET http://localhost:3000/

Response esperada:
{
  "statusCode": 200,
  "message": "¡Bienvenido a Loza Conectamente API!"
}
```

### Test 2: Con autenticación (cualquier endpoint)

```
GET http://localhost:3000/encuestas

Headers:
Authorization: Bearer {{jwt_token}}

Response esperada (si token es válido):
{
  "success": true,
  "data": [
    // ... lista de encuestas
  ]
}

Response si token inválido:
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

---

## 🧪 PASO 5: PLAN DE TESTING ORDENADO

### FASE 1: ENCUESTAS (7 tests)

**Test 1: Crear encuesta**
```
POST /encuestas

Body:
{
  "titulo": "Test de Depresión v1",
  "descripcion": "Evaluación de síntomas depresivos",
  "preguntas": [
    {
      "pregunta": "¿Te sientes triste?",
      "tipo": "ESCALA",
      "opciones": ["Nunca", "A veces", "Frecuentemente", "Siempre"]
    },
    {
      "pregunta": "¿Duermes bien?",
      "tipo": "MULTIPLE",
      "opciones": ["Sí", "No", "A veces"]
    }
  ]
}

✅ Response esperada: 201 Created
{
  "_id": "...",
  "titulo": "Test de Depresión v1",
  "preguntas": [...]
}

💡 GUARDAR: Copia el _id en la variable "encuesta_id"
```

**Test 2: Obtener todas las encuestas**
```
GET /encuestas

✅ Response esperada: 200 OK
[
  { "titulo": "Test de Depresión v1", ... },
  { "titulo": "Test de Ansiedad", ... }
]
```

**Test 3: Obtener una encuesta específica**
```
GET /encuestas/{{encuesta_id}}

✅ Response esperada: 200 OK
{
  "_id": "...",
  "titulo": "Test de Depresión v1",
  "preguntas": [...]
}
```

**Test 4: Responder encuesta**
```
POST /encuestas/{{encuesta_id}}/responder

Body:
{
  "usuarioId": "550e8400-e29b-41d4-a716-446655440000",
  "respuestas": {
    "pregunta_1": "Frecuentemente",
    "pregunta_2": "A veces"
  }
}

✅ Response esperada: 201 Created
{
  "usuarioId": "...",
  "respuestas": {...},
  "fecha": "2024-06-28T..."
}
```

**Test 5: Obtener respuestas de la encuesta**
```
GET /encuestas/{{encuesta_id}}/respuestas

✅ Response esperada: 200 OK
[
  {
    "usuarioId": "550e8400-...",
    "respuestas": {...},
    "fecha": "..."
  }
]
```

**Test 6: Actualizar encuesta**
```
PUT /encuestas/{{encuesta_id}}

Body:
{
  "titulo": "Test de Depresión v2 - Actualizado"
}

✅ Response esperada: 200 OK
{
  "_id": "...",
  "titulo": "Test de Depresión v2 - Actualizado",
  "updatedAt": "..."
}
```

**Test 7: Eliminar encuesta**
```
DELETE /encuestas/{{encuesta_id}}

✅ Response esperada: 200 OK
{
  "deleted": true,
  "_id": "..."
}
```

---

### FASE 2: NOTIFICACIONES (7 tests)

**Test 1: Crear notificación**
```
POST /notificaciones

Body:
{
  "usuarioId": "550e8400-e29b-41d4-a716-446655440000",
  "titulo": "Nueva Cita",
  "mensaje": "Tu cita está confirmada para mañana",
  "tipo": "CITA"
}

✅ Response esperada: 201 Created
{
  "_id": "...",
  "usuarioId": "...",
  "titulo": "Nueva Cita",
  "leida": false
}

💡 GUARDAR: Copia el _id en "notificacion_id"
```

**Test 2: Obtener notificaciones del usuario**
```
GET /notificaciones/usuario/550e8400-e29b-41d4-a716-446655440000

✅ Response esperada: 200 OK
[
  {
    "_id": "...",
    "titulo": "Nueva Cita",
    "leida": false
  }
]
```

**Test 3: Obtener notificación específica**
```
GET /notificaciones/{{notificacion_id}}

✅ Response esperada: 200 OK
{
  "_id": "...",
  "titulo": "Nueva Cita",
  "mensaje": "Tu cita está confirmada..."
}
```

**Test 4: Marcar como leída**
```
PATCH /notificaciones/{{notificacion_id}}/leer

✅ Response esperada: 200 OK
{
  "_id": "...",
  "leida": true,
  "leidoAt": "2024-06-28T10:45:00Z"
}
```

**Test 5: Obtener todas (solo admin)**
```
GET /notificaciones

✅ Response esperada: 200 OK (si eres admin)
[
  // todas las notificaciones del sistema
]

❌ Response esperada: 403 Forbidden (si eres paciente)
```

**Test 6: Actualizar notificación**
```
PUT /notificaciones/{{notificacion_id}}

Body:
{
  "titulo": "Cita Reprogramada",
  "mensaje": "Tu cita fue movida para el próximo lunes"
}

✅ Response esperada: 200 OK
{
  "_id": "...",
  "titulo": "Cita Reprogramada"
}
```

**Test 7: Eliminar notificación**
```
DELETE /notificaciones/{{notificacion_id}}

✅ Response esperada: 200 OK
{
  "deleted": true
}
```

---

### FASE 3: CHATS (4 tests)

**Test 1: Enviar mensaje**
```
POST /chats

Body:
{
  "destinatarioId": "psicologo-uuid-001",
  "mensaje": "Hola Dr. García, tengo una pregunta"
}

✅ Response esperada: 201 Created
{
  "_id": "...",
  "de": "550e8400-...",
  "hacia": "psicologo-uuid-001",
  "mensaje": "Hola Dr. García...",
  "timestamp": "..."
}

💡 GUARDAR: Copia el _id en "mensaje_id"
```

**Test 2: Obtener historial**
```
GET /chats/psicologo-uuid-001

✅ Response esperada: 200 OK
[
  {
    "_id": "...",
    "de": "paciente-id",
    "mensaje": "Hola Dr. García...",
    "timestamp": "..."
  },
  {
    "_id": "...",
    "de": "psicologo-uuid-001", 
    "mensaje": "¡Hola! ¿Cómo estás?",
    "timestamp": "..."
  }
]
```

**Test 3: Actualizar (editar) mensaje**
```
PUT /chats/{{mensaje_id}}

Body:
{
  "mensaje": "Hola Dr. García, tengo algunas preguntas (editado)"
}

✅ Response esperada: 200 OK
{
  "_id": "...",
  "mensaje": "Hola Dr. García, tengo algunas preguntas (editado)",
  "edited": true,
  "editedAt": "..."
}
```

**Test 4: Eliminar mensaje**
```
DELETE /chats/{{mensaje_id}}

✅ Response esperada: 200 OK
{
  "deleted": true
}
```

---

### FASE 4: TESTS PSICOMÉTRICOS (6 tests)

**Test 1: Registrar resultado**
```
POST /tests-psicometricos

Body:
{
  "tipoTest": "ANSIEDAD",
  "respuestas": {
    "item_1": 3,
    "item_2": 4,
    "item_3": 2,
    "item_4": 4,
    "item_5": 3
  },
  "puntajeTotal": 42,
  "diagnosticoPreliminar": "Ansiedad moderada"
}

✅ Response esperada: 201 Created
{
  "_id": "...",
  "pacienteId": "550e8400-...",
  "tipoTest": "ANSIEDAD",
  "puntajeTotal": 42,
  "diagnosticoPreliminar": "Ansiedad moderada",
  "fecha": "2024-06-28"
}

💡 GUARDAR: Copia el _id en "test_resultado_id"
```

**Test 2: Ver mis resultados**
```
GET /tests-psicometricos/mis-resultados

✅ Response esperada: 200 OK
[
  {
    "_id": "...",
    "tipoTest": "ANSIEDAD",
    "puntajeTotal": 42,
    "fecha": "2024-06-28"
  },
  {
    "_id": "...",
    "tipoTest": "DEPRESION",
    "puntajeTotal": 35,
    "fecha": "2024-06-20"
  }
]
```

**Test 3: Obtener resultado específico**
```
GET /tests-psicometricos/{{test_resultado_id}}

✅ Response esperada: 200 OK
{
  "_id": "...",
  "tipoTest": "ANSIEDAD",
  "puntajeTotal": 42,
  "diagnosticoPreliminar": "Ansiedad moderada"
}
```

**Test 4: Ver estadísticas (admin/psicólogo)**
```
GET /tests-psicometricos/estadisticas/ANSIEDAD

✅ Response esperada (si eres admin/psicologo): 200 OK
{
  "tipoTest": "ANSIEDAD",
  "promedioMensual": 42.5,
  "cantidadPacientes": 24,
  "distribucion": {
    "BAJO": 5,
    "MODERADO": 12,
    "ALTO": 7
  }
}

❌ Response esperada (si eres paciente): 403 Forbidden
```

**Test 5: Actualizar resultado**
```
PUT /tests-psicometricos/{{test_resultado_id}}

Body:
{
  "diagnosticoPreliminar": "Ansiedad moderada-baja"
}

✅ Response esperada: 200 OK
{
  "_id": "...",
  "diagnosticoPreliminar": "Ansiedad moderada-baja",
  "updatedAt": "..."
}
```

**Test 6: Eliminar resultado**
```
DELETE /tests-psicometricos/{{test_resultado_id}}

✅ Response esperada: 200 OK
{
  "deleted": true
}
```

---

## 📊 CHECKLIST DE TESTING

```
ENCUESTAS
  [ ] Crear encuesta
  [ ] Obtener todas
  [ ] Obtener una específica
  [ ] Responder encuesta
  [ ] Ver respuestas
  [ ] Actualizar encuesta
  [ ] Eliminar encuesta

NOTIFICACIONES
  [ ] Crear notificación
  [ ] Obtener del usuario
  [ ] Obtener específica
  [ ] Marcar como leída
  [ ] Obtener todas (admin)
  [ ] Actualizar
  [ ] Eliminar

CHATS
  [ ] Enviar mensaje
  [ ] Obtener historial
  [ ] Editar mensaje
  [ ] Eliminar mensaje

TESTS PSICOMÉTRICOS
  [ ] Registrar resultado
  [ ] Ver mis resultados
  [ ] Obtener específico
  [ ] Ver estadísticas
  [ ] Actualizar resultado
  [ ] Eliminar resultado
```

---

## 🐛 DEBUGGING COMÚN

### Problema: "401 Unauthorized"
**Causa:** Token inválido o expirado
**Solución:** 
- Verifica que {{jwt_token}} esté configurado
- Repite login para obtener nuevo token

### Problema: "400 Bad Request"
**Causa:** JSON inválido o campos faltantes
**Solución:**
- Revisa que el Content-Type sea "application/json"
- Verifica que todos los campos requeridos estén presentes

### Problema: "403 Forbidden"
**Causa:** Rol insuficiente
**Solución:**
- Verifica tu rol (algunos endpoints requieren ADMIN)
- Intenta con otra credencial si es necesario

### Problema: "404 Not Found"
**Causa:** Recurso no existe
**Solución:**
- Verifica que el ID sea válido
- Asegúrate de haber creado el recurso primero

### Problema: "500 Internal Server Error"
**Causa:** Error en el servidor
**Solución:**
- Verifica que el servidor esté corriendo
- Revisa los logs del servidor
- Contacta al administrador

---

## 🚀 AUTOMACIÓN DE TESTING

### Crear Test Script en Postman

```javascript
// Ejemplo: Después de crear una encuesta, guardar su ID
pm.test("Guardar encuesta ID", function() {
  var jsonData = pm.response.json();
  pm.environment.set("encuesta_id", jsonData._id);
  console.log("Encuesta ID guardado: " + jsonData._id);
});
```

Agregar esto en la sección **Tests** de cada request.

---

## 📝 REPORTE DE TESTING

Después de completar todos los tests, genera un reporte:

```
FECHA: 28/06/2024
TESTER: [Tu nombre]
ENTORNO: Local Dev

TOTAL TESTS: 24
EXITOSOS: ✅ 24
FALLIDOS: ❌ 0
PENDIENTES: ⏳ 0

MÓDULOS:
  - Encuestas: ✅ COMPLETO
  - Notificaciones: ✅ COMPLETO
  - Chats: ✅ COMPLETO
  - Tests: ✅ COMPLETO

NOTAS:
- Todos los endpoints respondieron correctamente
- Validación de permisos funcionando
- JWT authentication operativa
```

---

¡Listo para testing! 🎉

