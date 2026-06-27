# 🗂️ ESTRUCTURA Y FLUJOS DEL SISTEMA

---

## 📐 ARQUITECTURA GENERAL

```
┌─────────────────────────────────────────────────────────────────┐
│                        LOZA CONECTAMENTE API                    │
│                      (NestJS + MongoDB)                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
         ┌──────▼─────┐ ┌────▼─────┐ ┌────▼────────┐
         │ PostgreSQL │ │ MongoDB   │ │   JWT Auth  │
         │ (Usuarios) │ │ (Datos)   │ │  (Seguridad)│
         └────────────┘ └───────────┘ └─────────────┘
```

---

## 🛠️ MÓDULOS Y DEPENDENCIAS

```
app.module.ts (Principal)
    │
    ├── auth.module          ← Todos los demás dependen de este
    │   ├── jwt.strategy
    │   └── jwt-auth.guard
    │
    ├── usuarios.module      (PostgreSQL)
    │
    ├── encuestas.module     (MongoDB)
    │   └── imports: AuthModule
    │
    ├── notificaciones.module (MongoDB)
    │   └── imports: AuthModule
    │
    ├── chats.module         (MongoDB)  ✅ MEJOR: Exporta ChatsService
    │   └── imports: AuthModule
    │
    └── tests-psicometricos.module (MongoDB) ✅ MEJOR: Exporta Service
        └── imports: AuthModule
```

---

## 🔄 FLUJO DE DATOS - USUARIO LOGUEADO

```
1. CLIENTE POSTMAN / FRONTEND
   │
   └─> POST /auth/login
       │ email: "paciente@test.com"
       │ password: "pass123"
       │
       ├─> JWT Auth Guard ✓ VALIDA
       │
       └─> AuthService.login()
           │
           └─> RESPUESTA: 
               {
                 access_token: "eyJhbGc...",
                 user: {
                   id: "550e8400-e29b-41d4...",
                   email: "paciente@test.com",
                   rol: "PACIENTE"
                 }
               }

2. SIGUIENTE REQUEST CUALQUIERA
   │
   ├─> HEADER: Authorization: Bearer eyJhbGc...
   │
   └─> JWT Auth Guard
       ├─> ✓ Token válido? CONTINÚA
       ├─> ✓ No expirado? CONTINÚA
       └─> ✗ Inválido? 401 UNAUTHORIZED
```

---

## 📋 FLUJO COMPLETO: ENCUESTA

```
PASO 1: ADMIN PREPARA LA ENCUESTA
        ┌─────────────────────────────────────┐
        │ POST /encuestas                     │
        │ {                                   │
        │   "titulo": "Depresión",            │
        │   "preguntas": [...]                │
        │ }                                   │
        └────────────┬────────────────────────┘
                     │
                     ├─→ JwtAuthGuard ✓
                     ├─→ EncuestasController.create()
                     ├─→ EncuestasService.create()
                     └─→ MongoDB: guardar Encuesta

PASO 2: PACIENTE VE DISPONIBLES
        ┌─────────────────────────────────────┐
        │ GET /encuestas                      │
        └────────────┬────────────────────────┘
                     │
                     ├─→ JwtAuthGuard ✓
                     ├─→ EncuestasController.findAll()
                     ├─→ EncuestasService.findAll()
                     └─→ MongoDB: devuelve Encuestas

PASO 3: PACIENTE RESPONDE
        ┌─────────────────────────────────────┐
        │ POST /encuestas/ID/responder        │
        │ {                                   │
        │   "usuarioId": "paciente-uuid",     │
        │   "respuestas": {                   │
        │     "preg_1": "Sí",                 │
        │     "preg_2": "A veces"             │
        │   }                                 │
        │ }                                   │
        └────────────┬────────────────────────┘
                     │
                     ├─→ JwtAuthGuard ✓
                     ├─→ EncuestasController.guardarRespuesta()
                     ├─→ EncuestasService.guardarRespuesta()
                     └─→ MongoDB: guardar Respuesta

PASO 4: ADMIN VE RESULTADOS
        ┌─────────────────────────────────────┐
        │ GET /encuestas/ID/respuestas        │
        └────────────┬────────────────────────┘
                     │
                     ├─→ JwtAuthGuard ✓
                     ├─→ EncuestasController.obtenerRespuestas()
                     ├─→ EncuestasService.obtenerRespuestas()
                     └─→ MongoDB: devuelve Respuestas
```

---

## 🔔 FLUJO COMPLETO: NOTIFICACIONES

```
PASO 1: SISTEMA CREA NOTIFICACIÓN (después de agendar cita)
        ┌──────────────────────────────────────────┐
        │ POST /notificaciones                     │
        │ {                                        │
        │   "usuarioId": "paciente-uuid",          │
        │   "titulo": "Cita Confirmada",           │
        │   "mensaje": "Tu cita es mañana...",     │
        │   "tipo": "CITA"                         │
        │ }                                        │
        └────────────┬─────────────────────────────┘
                     │
                     ├─→ JwtAuthGuard ✓
                     ├─→ NotificacionesController.create()
                     ├─→ NotificacionesService.create()
                     └─→ MongoDB: guardar Notificacion

PASO 2: USUARIO VE SUS NOTIFICACIONES
        ┌──────────────────────────────────────────┐
        │ GET /notificaciones/usuario/paciente-uuid│
        └────────────┬─────────────────────────────┘
                     │
                     ├─→ JwtAuthGuard ✓
                     ├─→ NotificacionesService.findByUsuario()
                     └─→ MongoDB: devuelve notificaciones del usuario
                         [
                           { leida: false, titulo: "Cita..." },
                           { leida: true, titulo: "Recordatorio..." }
                         ]

PASO 3: MARCAR COMO LEÍDA
        ┌──────────────────────────────────────────┐
        │ PATCH /notificaciones/ID/leer            │
        └────────────┬─────────────────────────────┘
                     │
                     ├─→ JwtAuthGuard ✓
                     ├─→ NotificacionesService.marcarComoLeida()
                     └─→ MongoDB: actualizar leida: true
```

---

## 💬 FLUJO COMPLETO: CHAT

```
PASO 1: PACIENTE ENVÍA MENSAJE
        ┌────────────────────────────────────────────┐
        │ POST /chats                                │
        │ {                                          │
        │   "destinatarioId": "psicologo-uuid",      │
        │   "mensaje": "Hola Dr. García..."         │
        │ }                                          │
        └────────────┬───────────────────────────────┘
                     │
                     ├─→ JwtAuthGuard ✓
                     ├─→ ChatsController.guardarMensaje()
                     ├─→ ChatsService.enviarMensaje()
                     └─→ MongoDB: guardar Chat
                         {
                           de: "paciente-uuid",
                           hacia: "psicologo-uuid",
                           mensaje: "Hola Dr. García...",
                           timestamp: "2024-06-28T10:30:00Z"
                         }

PASO 2: PSICÓLOGO VE EL HISTORIAL
        ┌────────────────────────────────────────────┐
        │ GET /chats/paciente-uuid                   │
        └────────────┬───────────────────────────────┘
                     │
                     ├─→ JwtAuthGuard ✓
                     ├─→ ChatsService.obtenerHistorial()
                     └─→ MongoDB: devuelve mensajes bidireccionales
                         [
                           { de: "paciente", mensaje: "Hola..." },
                           { de: "psicologo", mensaje: "¡Hola!..." }
                         ]

PASO 3: EDITAR MENSAJE (si es necesario)
        ┌────────────────────────────────────────────┐
        │ PUT /chats/mensaje-id                      │
        │ { "mensaje": "Hola Dr. García... (editado)"}
        └────────────┬───────────────────────────────┘
                     │
                     ├─→ JwtAuthGuard ✓
                     ├─→ Solo si eres el propietario ✓
                     ├─→ ChatsService.actualizarMensaje()
                     └─→ MongoDB: actualizar mensaje
```

---

## 🧠 FLUJO COMPLETO: TESTS PSICOMÉTRICOS

```
PASO 1: PACIENTE COMPLETA EL TEST
        ┌─────────────────────────────────────────┐
        │ POST /tests-psicometricos               │
        │ {                                       │
        │   "tipoTest": "ANSIEDAD",               │
        │   "respuestas": {                       │
        │     "item_1": 3,                        │
        │     "item_2": 4,                        │
        │     ...                                 │
        │   },                                    │
        │   "puntajeTotal": 45,                   │
        │   "diagnosticoPreliminar": "Moderada"   │
        │ }                                       │
        └────────────┬────────────────────────────┘
                     │
                     ├─→ JwtAuthGuard ✓
                     ├─→ TestsService.registrarResultado()
                     └─→ MongoDB: guardar TestResultado
                         {
                           pacienteId: "usuario-uuid",
                           tipoTest: "ANSIEDAD",
                           puntajeTotal: 45,
                           diagnosticoPreliminar: "Moderada",
                           fecha: "2024-06-28"
                         }

PASO 2: PACIENTE VE SUS RESULTADOS
        ┌─────────────────────────────────────────┐
        │ GET /tests-psicometricos/mis-resultados │
        └────────────┬────────────────────────────┘
                     │
                     ├─→ JwtAuthGuard ✓
                     ├─→ TestsService.obtenerHistorialPaciente()
                     └─→ MongoDB: devuelve todos los tests del paciente
                         [
                           { tipoTest: "ANSIEDAD", puntajeTotal: 45 },
                           { tipoTest: "DEPRESION", puntajeTotal: 32 }
                         ]

PASO 3: PSICÓLOGO VE ESTADÍSTICAS
        ┌─────────────────────────────────────────┐
        │ GET /tests/.../estadisticas/ANSIEDAD    │
        │ Requerimientos: rol = ADMIN o PSICOLOGO │
        └────────────┬────────────────────────────┘
                     │
                     ├─→ JwtAuthGuard ✓
                     ├─→ Validar rol ✓
                     ├─→ TestsService.obtenerPromedios()
                     └─→ MongoDB: estadísticas agregadas
                         {
                           promedioMensual: 42.5,
                           cantidadPacientes: 24,
                           distribucion: {...}
                         }
```

---

## 🔐 SEGURIDAD: CAPAS DE PROTECCIÓN

```
REQUEST ENTRANTE
    │
    ├─→ CAPA 1: JWT Auth Guard
    │   ├─ ¿Token presente? ✓
    │   ├─ ¿Token válido? ✓
    │   ├─ ¿No expirado? ✓
    │   └─ Si falla: 401 Unauthorized
    │
    ├─→ CAPA 2: Validación de DTO
    │   ├─ ¿JSON válido? ✓
    │   ├─ ¿Campos requeridos? ✓
    │   ├─ ¿Tipos correctos? ✓
    │   └─ Si falla: 400 Bad Request
    │
    ├─→ CAPA 3: Validación de Negocio
    │   ├─ ¿El usuario existe? ✓
    │   ├─ ¿Tiene permisos? ✓
    │   ├─ ¿Es propietario del recurso? ✓
    │   └─ Si falla: 403 Forbidden
    │
    └─→ CAPA 4: MongoDB
        ├─ Transacción
        ├─ Validación de esquema
        └─ Persistencia
```

---

## 📊 TABLA DE FLUJOS DE PERMISOS

```
┌─────────────┬──────────┬────────────┬───────┐
│ ACCIÓN      │ PACIENTE │ PSICÓLOGO  │ ADMIN │
├─────────────┼──────────┼────────────┼───────┤
│ Crear Encu. │    ❌    │     ❌     │  ✅   │
│ Responder   │    ✅    │     ✅     │  ✅   │
│ Ver Resp.   │    ❌    │     ✅     │  ✅   │
│ Crear Notif │    ✅    │     ✅     │  ✅   │
│ Ver Propias │    ✅    │     ✅     │  ✅   │
│ Ver Todas   │    ❌    │     ❌     │  ✅   │
│ Chat Enviar │    ✅    │     ✅     │  ✅   │
│ Test Hacer  │    ✅    │     ✅     │  ✅   │
│ Test Ver    │   Solo P │   Personal │ Todos │
│ Estadísticas│    ❌    │     ✅     │  ✅   │
└─────────────┴──────────┴────────────┴───────┘

Leyenda:
✅ = Permitido
❌ = Prohibido
P = Personal (solo propio)
```

---

## 🗄️ ESQUEMAS MONGODB

```
ENCUESTAS Collection
├─ _id (ObjectId)
├─ titulo (String)
├─ descripcion (String)
├─ preguntas (Array)
│  ├─ pregunta (String)
│  ├─ tipo (Enum: TEXTO, ESCALA, MULTIPLE)
│  └─ opciones (Array<String>)
├─ createdAt (Date)
└─ updatedAt (Date)

RESPUESTAS Collection
├─ _id (ObjectId)
├─ encuestaId (ObjectId - ref)
├─ usuarioId (UUID - ref a PostgreSQL)
├─ respuestas (Object)
├─ fecha (Date)
└─ updatedAt (Date)

NOTIFICACIONES Collection
├─ _id (ObjectId)
├─ usuarioId (UUID)
├─ titulo (String)
├─ mensaje (String)
├─ tipo (Enum: INFO, ALERTA, CITA)
├─ leida (Boolean)
├─ leidoAt (Date - nullable)
├─ createdAt (Date)
└─ updatedAt (Date)

CHATS Collection
├─ _id (ObjectId)
├─ de (UUID)
├─ hacia (UUID)
├─ mensaje (String)
├─ timestamp (Date)
├─ edited (Boolean)
└─ editedAt (Date - nullable)

TEST_RESULTADOS Collection
├─ _id (ObjectId)
├─ pacienteId (UUID)
├─ tipoTest (String: ANSIEDAD, DEPRESION, etc)
├─ respuestas (Object)
├─ puntajeTotal (Number)
├─ diagnosticoPreliminar (String)
├─ fecha (Date)
└─ updatedAt (Date)
```

---

## 🔄 CICLO COMPLETO: DE INICIO DE SESIÓN A CONSULTACIÓN

```
1️⃣  USUARIO ABRE APP
    └─> PANTALLA: Login

2️⃣  INTRODUCE CREDENCIALES
    └─> POST /auth/login
        Response: 
        {
          access_token: "eyJhbGc...",
          user: { id, email, rol: "PACIENTE" }
        }

3️⃣  GUARDAMOS TOKEN EN localStorage/SessionStorage
    └─> Ahora todos los requests llevan: 
        Authorization: Bearer eyJhbGc...

4️⃣  USUARIO VE DASHBOARD
    ├─> Obtener notificaciones no leídas
    │   └─> GET /notificaciones/usuario/:id
    │
    ├─> Obtener chats recientes
    │   └─> GET /chats/:psicologo_id
    │
    └─> Obtener mis tests
        └─> GET /tests-psicometricos/mis-resultados

5️⃣  USUARIO DECIDE RESPONDER ENCUESTA
    ├─> GET /encuestas (Ver lista)
    ├─> GET /encuestas/:id (Ver detalles)
    └─> POST /encuestas/:id/responder (Enviar respuestas)

6️⃣  USUARIO COMUNICA CON PSICÓLOGO
    ├─> POST /chats (Enviar mensaje)
    ├─> GET /chats/:psicologo_id (Ver historial)
    └─> PUT /chats/:id (Editar si es necesario)

7️⃣  PSICÓLOGO REVISA PROGRESO
    ├─> GET /tests-psicometricos/estadisticas/ANSIEDAD
    ├─> GET /chats/:paciente_id
    └─> GET /encuestas/:id/respuestas

8️⃣  NOTIFICACIÓN AUTOMÁTICA
    └─> Sistema programa notificación de próxima cita
        └─> POST /notificaciones (antes de la cita)
            Usuario recibe: "Tu cita es mañana..."
            └─> PATCH /notificaciones/:id/leer (Usuario marca como leída)
```

---

## ✨ RESUMEN

- **4 Módulos principales** con 24 endpoints
- **2 Bases de datos**: PostgreSQL (usuarios) + MongoDB (datos)
- **4 Capas de seguridad** por request
- **2 Tipos de usuarios**: Paciente y Psicólogo (+ Admin)
- **Documentación completa** en Swagger
- **Colección de Postman** lista para usar

