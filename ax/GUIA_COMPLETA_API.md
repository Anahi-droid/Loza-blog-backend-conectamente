# 📱 GUÍA COMPLETA DE USO - LOZA CONECTAMENTE API

---

## 🚀 SETUP INICIAL

### 1. Importar la Colección en Postman
1. Abre **Postman**
2. Click en **Import**
3. Selecciona el archivo: `Loza-Conectamente-API-Collection.postman_collection.json`
4. La colección se creará con todos los endpoints

### 2. Configurar Variables de Entorno
En Postman, ve a **Environment** y actualiza:
```
baseUrl = http://localhost:3000
jwt_token = (tu_token_jwt_aqui)
```

---

## 🔑 AUTENTICACIÓN

Todos los endpoints requieren un **JWT Token** en el header:
```
Authorization: Bearer {{jwt_token}}
```

**El token se obtiene en:** `POST /auth/login`
```json
{
  "email": "usuario@example.com",
  "password": "password123"
}
```

---

## 📋 GUÍA DE ENCUESTAS

### ¿QUÉ SON?
Las encuestas son cuestionarios dinámicos que los pacientes responden. Se guardan las respuestas en MongoDB para análisis posterior.

### FLUJO NORMAL

#### **Paso 1: Admin crea una encuesta**
```
POST /encuestas
```
**Body:**
```json
{
  "titulo": "Evaluación de Depresión",
  "descripcion": "Test para evaluar síntomas depresivos",
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
```

**Respuesta esperada:**
```json
{
  "_id": "64af5e3bcc7f1a2c3d4e5f6g",
  "titulo": "Evaluación de Depresión",
  "descripcion": "Test para evaluar síntomas depresivos",
  "preguntas": [...],
  "createdAt": "2024-06-28T10:30:00Z"
}
```

#### **Paso 2: Paciente ve la encuesta disponible**
```
GET /encuestas
```

Retorna todas las encuestas para que el paciente elija cuál responder.

#### **Paso 3: Paciente la responde**
```
POST /encuestas/64af5e3bcc7f1a2c3d4e5f6g/responder
```

**Body:**
```json
{
  "usuarioId": "550e8400-e29b-41d4-a716-446655440000",
  "respuestas": {
    "pregunta_1": "Frecuentemente",
    "pregunta_2": "A veces"
  }
}
```

#### **Paso 4: Admin ve los resultados**
```
GET /encuestas/64af5e3bcc7f1a2c3d4e5f6g/respuestas
```

**Respuesta:**
```json
[
  {
    "_id": "64bf5e3bcc7f1a2c3d4e5f7h",
    "usuarioId": "550e8400-e29b-41d4-a716-446655440000",
    "respuestas": {
      "pregunta_1": "Frecuentemente",
      "pregunta_2": "A veces"
    },
    "fecha": "2024-06-28T10:35:00Z"
  }
]
```

### TIPOS DE PREGUNTAS
- **TEXTO**: Respuesta libre
- **ESCALA**: Seleccionar una opción de una lista ordenada
- **MULTIPLE**: Seleccionar una opción de varias

---

## 🔔 GUÍA DE NOTIFICACIONES

### ¿QUÉ SON?
Sistema que envía notificaciones a los usuarios sobre eventos importantes (citas, recordatorios, etc.)

### FLUJO NORMAL

#### **Paso 1: Sistema/Admin crea notificación**
```
POST /notificaciones
```

**Body:**
```json
{
  "usuarioId": "550e8400-e29b-41d4-a716-446655440000",
  "titulo": "Nueva Cita Confirmada",
  "mensaje": "Tu cita con el Dr. García está confirmada para mañana a las 10:00 AM",
  "tipo": "CITA"
}
```

**Tipos disponibles:**
- `INFO` - Información general
- `ALERTA` - Avisos importantes  
- `CITA` - Relacionado con citas

#### **Paso 2: Usuario ve sus notificaciones**
```
GET /notificaciones/usuario/550e8400-e29b-41d4-a716-446655440000
```

**Respuesta:**
```json
[
  {
    "_id": "64bf5e3bcc7f1a2c3d4e5f7h",
    "usuarioId": "550e8400-e29b-41d4-a716-446655440000",
    "titulo": "Nueva Cita Confirmada",
    "mensaje": "Tu cita con el Dr. García está confirmada...",
    "tipo": "CITA",
    "leida": false,
    "createdAt": "2024-06-28T10:30:00Z"
  }
]
```

#### **Paso 3: Usuario marca como leída**
```
PATCH /notificaciones/64bf5e3bcc7f1a2c3d4e5f7h/leer
```

**Respuesta:**
```json
{
  "_id": "64bf5e3bcc7f1a2c3d4e5f7h",
  "leida": true,
  "leidoAt": "2024-06-28T10:45:00Z"
}
```

### CASOS DE USO
1. **Recordatorio de Cita**: Cuando se agenda una cita
2. **Confirmación de Cita**: Cuando psicólogo confirma
3. **Cambio de Cita**: Si se reprograma
4. **Resultados Listos**: Cuando un test está listo

---

## 💬 GUÍA DE CHATS

### ¿QUÉ ES?
Sistema de mensajería directa entre pacientes y psicólogos para comunicación asincrónica.

### FLUJO NORMAL

#### **Paso 1: Paciente envía mensaje**
```
POST /chats
```

**Body:**
```json
{
  "destinatarioId": "psicologo-uuid-001",
  "mensaje": "Hola Dr. García, tengo una pregunta sobre mis síntomas"
}
```

**Respuesta:**
```json
{
  "_id": "64cf5e3bcc7f1a2c3d4e5f8i",
  "de": "550e8400-e29b-41d4-a716-446655440000",
  "hacia": "psicologo-uuid-001",
  "mensaje": "Hola Dr. García, tengo una pregunta sobre mis síntomas",
  "timestamp": "2024-06-28T10:30:00Z",
  "edited": false
}
```

#### **Paso 2: Psicólogo obtiene el historial**
```
GET /chats/550e8400-e29b-41d4-a716-446655440000
```

**Respuesta:**
```json
[
  {
    "_id": "64cf5e3bcc7f1a2c3d4e5f8i",
    "de": "550e8400-e29b-41d4-a716-446655440000",
    "hacia": "psicologo-uuid-001",
    "mensaje": "Hola Dr. García, tengo una pregunta",
    "timestamp": "2024-06-28T10:30:00Z"
  },
  {
    "_id": "64df5e3bcc7f1a2c3d4e5f9j",
    "de": "psicologo-uuid-001",
    "hacia": "550e8400-e29b-41d4-a716-446655440000",
    "mensaje": "Hola, claro! ¿Cuál es tu pregunta?",
    "timestamp": "2024-06-28T10:35:00Z"
  }
]
```

#### **Paso 3: Editar un mensaje (si es necesario)**
```
PUT /chats/64cf5e3bcc7f1a2c3d4e5f8i
```

**Body:**
```json
{
  "mensaje": "Hola Dr. García, tengo algunas preguntas sobre mis síntomas (editado)"
}
```

#### **Paso 4: Eliminar un mensaje (si es necesario)**
```
DELETE /chats/64cf5e3bcc7f1a2c3d4e5f8i
```

### CARACTERÍSTICAS
- Los mensajes son bidireccionales (paciente ↔ psicólogo)
- Solo puedes editar/eliminar tus propios mensajes
- Se mantiene el historial completo
- Timestamps automáticos

---

## 🧠 GUÍA DE TESTS PSICOMÉTRICOS

### ¿QUÉ SON?
Tests estandarizados que miden aspectos psicológicos: ansiedad, depresión, estrés, autoestima, etc.

### FLUJO NORMAL

#### **Paso 1: Paciente completa el test**
```
POST /tests-psicometricos
```

**Body:**
```json
{
  "tipoTest": "ANSIEDAD",
  "respuestas": {
    "item_1": 3,
    "item_2": 4,
    "item_3": 2,
    "item_4": 4,
    "item_5": 3,
    "item_6": 2,
    "item_7": 1
  },
  "puntajeTotal": 42,
  "diagnosticoPreliminar": "Ansiedad moderada"
}
```

**Respuesta:**
```json
{
  "_id": "64df5e3bcc7f1a2c3d4e5f9j",
  "pacienteId": "550e8400-e29b-41d4-a716-446655440000",
  "tipoTest": "ANSIEDAD",
  "puntajeTotal": 42,
  "diagnosticoPreliminar": "Ansiedad moderada",
  "fecha": "2024-06-28"
}
```

#### **Paso 2: Paciente ve sus resultados previos**
```
GET /tests-psicometricos/mis-resultados
```

**Respuesta:**
```json
[
  {
    "_id": "64df5e3bcc7f1a2c3d4e5f9j",
    "tipoTest": "ANSIEDAD",
    "puntajeTotal": 42,
    "diagnosticoPreliminar": "Ansiedad moderada",
    "fecha": "2024-06-28"
  },
  {
    "_id": "64ef5e3bcc7f1a2c3d4e5fak",
    "tipoTest": "DEPRESION",
    "puntajeTotal": 35,
    "diagnosticoPreliminar": "Depresión leve",
    "fecha": "2024-06-20"
  }
]
```

#### **Paso 3: Psicólogo/Admin ve estadísticas**
```
GET /tests-psicometricos/estadisticas/ANSIEDAD
```

**Respuesta:**
```json
{
  "tipoTest": "ANSIEDAD",
  "promedioMensual": 42.5,
  "cantidadPacientes": 24,
  "distribucion": {
    "BAJO": 5,
    "MODERADO": 12,
    "ALTO": 7
  },
  "mes": "2024-06"
}
```

### ESCALA DE INTERPRETACIÓN (Ejemplo para Ansiedad)

| Rango | Interpretación |
|-------|---|
| 0-20 | Sin ansiedad |
| 21-40 | Ansiedad leve |
| 41-60 | Ansiedad moderada |
| 61-80 | Ansiedad severa |
| 81-100 | Ansiedad muy severa |

### TIPOS DE TESTS COMUNES
- `ANSIEDAD`
- `DEPRESION`
- `ESTRES`
- `AUTOESTIMA`
- `PERSONALIDAD`
- `IMPULSIVIDAD`

---

## 🛡️ PERMISOS Y RESTRICCIONES

| Acción | PACIENTE | PSICOLOGO | ADMIN |
|--------|---|---|---|
| Crear Encuesta | ❌ | ❌ | ✅ |
| Ver Encuestas | ✅ | ✅ | ✅ |
| Responder Encuesta | ✅ | ✅ | ✅ |
| Ver Respuestas Encuesta | ❌ | ✅ | ✅ |
| Crear Notificación | ✅ | ✅ | ✅ |
| Ver Propias Notificaciones | ✅ | ✅ | ✅ |
| Ver Todas Notificaciones | ❌ | ❌ | ✅ |
| Enviar Chat | ✅ | ✅ | ✅ |
| Ver Historial Chat | ✅ | ✅ | ✅ |
| Registrar Test | ✅ | ✅ | ✅ |
| Ver Propios Tests | ✅ | ✅ | ✅ |
| Ver Estadísticas Tests | ❌ | ✅ | ✅ |

---

## ❌ CÓDIGOS DE ERROR COMUNES

| Código | Significado | Solución |
|--------|---|---|
| 400 | Bad Request | Revisa el formato del JSON |
| 401 | Unauthorized | Token JWT expirado o inválido |
| 403 | Forbidden | No tienes permisos para esta acción |
| 404 | Not Found | El recurso no existe |
| 500 | Server Error | Contactar al administrador |

---

## 📌 EJEMPLOS PRÁCTICOS COMPLETOS

### Escenario 1: Paciente realiza una encuesta y ve resultados

```bash
# 1. Login (obtener token)
POST /auth/login
Body: { "email": "paciente@test.com", "password": "pass123" }

# 2. Ver encuestas disponibles
GET /encuestas

# 3. Responder una encuesta
POST /encuestas/[encuesta-id]/responder
Body: {
  "usuarioId": "[user-id]",
  "respuestas": { "pregunta_1": "Sí", "pregunta_2": "No" }
}

# 4. Ver mis resultados de tests
GET /tests-psicometricos/mis-resultados
```

### Escenario 2: Psicólogo revisa un paciente y envía notificación

```bash
# 1. Login psicólogo
POST /auth/login
Body: { "email": "psicologo@test.com", "password": "pass123" }

# 2. Ver estadísticas
GET /tests-psicometricos/estadisticas/ANSIEDAD

# 3. Enviar notificación al paciente
POST /notificaciones
Body: {
  "usuarioId": "[patient-uuid]",
  "titulo": "Evaluación Disponible",
  "mensaje": "Tu evaluación está lista. Por favor revísala.",
  "tipo": "INFO"
}

# 4. Ver historial de chat con paciente
GET /chats/[paciente-id]
```

---

## 🔍 DEBUGGING TIPS

1. **Verificar JWT Token**
   - Comprueba que el token no está expirado
   - Asegúrate de pasar `Authorization: Bearer {{jwt_token}}`

2. **Verificar IDs**
   - Los IDs de MongoDB tienen 24 caracteres hexadecimales
   - Los UUIDs de usuarios tienen el formato: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

3. **Validar JSON**
   - Usa un validador online si tienes dudas
   - Evita comas al final en JSON

4. **Revisar Permisos**
   - Algunos endpoints requieren rol específico (ADMIN, PSICOLOGO)
   - Revisa los códigos de error 403 (Forbidden)

---

## 📚 MEJORES PRÁCTICAS

1. **Siempre validar entrada**: Antes de enviar datos, valída que cumplan los DTOs
2. **Manejar errores**: Implementa try/catch en tu frontend
3. **Cachear datos**: Almacena respuestas GET para evitar solicitudes innecesarias
4. **Usar timestamps**: Para ordenar mensajes y eventos
5. **Documentar tu código**: Especialmente cuando hagas integraciones

