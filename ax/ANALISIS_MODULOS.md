## 📋 ANÁLISIS DE MÓDULOS - LOZA CONECTAMENTE

### ✅ REVISIÓN DE IMPORTACIONES

#### 1️⃣ MÓDULO: ENCUESTAS
**Archivo:** `src/encuestas/encuestas.module.ts`

```typescript
✓ Importaciones Correctas:
  - @nestjs/common → Module
  - @nestjs/mongoose → MongooseModule (Mongoose para MongoDB)
  - Servicios internos → EncuestasService
  - Controlador → EncuestasController
  - Schemas → Encuesta, Respuesta (Modelos MongoDB)
  - AuthModule → Autenticación con JWT
```

**Configuración:**
- ✅ Imports: MongoDB (Encuesta + Respuesta), AuthModule
- ✅ Controllers: EncuestasController
- ✅ Providers: EncuestasService
- ✅ Exports: EncuestasService (exportado para otros módulos)

---

#### 2️⃣ MÓDULO: NOTIFICACIONES
**Archivo:** `src/notificaciones/notificaciones.module.ts`

```typescript
✓ Importaciones Correctas:
  - @nestjs/common → Module
  - @nestjs/mongoose → MongooseModule
  - Servicios → NotificacionesService
  - Controlador → NotificacionesController
  - Schema → Notificacion
  - AuthModule → Autenticación
```

**Configuración:**
- ✅ Imports: MongoDB (Notificacion), AuthModule
- ✅ Controllers: NotificacionesController
- ✅ Providers: NotificacionesService
- ✅ Exports: NotificacionesService

---

#### 3️⃣ MÓDULO: CHATS
**Archivo:** `src/chats/chats.module.ts`

```typescript
✓ Importaciones Correctas:
  - @nestjs/common → Module
  - @nestjs/mongoose → MongooseModule
  - Servicios → ChatsService
  - Controlador → ChatsController
  - Schema → Chat
  - AuthModule → Autenticación
```

**Configuración:**
- ✅ Imports: MongoDB (Chat), AuthModule
- ✅ Controllers: ChatsController
- ✅ Providers: ChatsService
- ⚠️ Exports: NO EXPORTA (considerar exportar si otros módulos lo necesitan)

---

#### 4️⃣ MÓDULO: TESTS PSICOMÉTRICOS
**Archivo:** `src/tests-psicometricos/tests-psicometricos.module.ts`

```typescript
✓ Importaciones Correctas:
  - @nestjs/common → Module
  - @nestjs/mongoose → MongooseModule
  - Servicios → TestsPsicometricosService
  - Controlador → TestsPsicometricosController
  - Schema → TestResultado
  - AuthModule → Autenticación
```

**Configuración:**
- ✅ Imports: MongoDB (TestResultado), AuthModule
- ✅ Controllers: TestsPsicometricosController
- ✅ Providers: TestsPsicometricosService
- ⚠️ Exports: NO EXPORTA

---

### 🔒 SEGURIDAD - GUARDS APLICADOS

Todos los módulos utilizan `JwtAuthGuard` en sus controladores:
- ✅ **Encuestas**: `@UseGuards(JwtAuthGuard)` en clase controlador
- ✅ **Notificaciones**: `@UseGuards(JwtAuthGuard)` en clase controlador
- ✅ **Chats**: `@UseGuards(JwtAuthGuard)` en clase controlador
- ✅ **Tests**: `@UseGuards(JwtAuthGuard)` en clase controlador

**Línea recomendada en app.module.ts:**
```typescript
imports: [
  EncuestasModule,      // ✅
  NotificacionesModule, // ✅
  ChatsModule,          // ✅
  TestsPsicometricosModule, // ✅
  // ... otros módulos
]
```

---

### 📊 TABLA DE ENDPOINTS

| Módulo | Método | Endpoint | Autenticación | Descripción |
|--------|--------|----------|---|---|
| **ENCUESTAS** | POST | `/encuestas` | JWT | Crear nueva encuesta |
| | GET | `/encuestas` | JWT | Obtener todas las encuestas |
| | GET | `/encuestas/:id` | JWT | Obtener encuesta por ID |
| | GET | `/encuestas/:id/respuestas` | JWT | Obtener respuestas de encuesta |
| | POST | `/encuestas/:id/responder` | JWT | Responder encuesta |
| | PUT | `/encuestas/:id` | JWT | Actualizar encuesta |
| | DELETE | `/encuestas/:id` | JWT | Eliminar encuesta |
| **NOTIFICACIONES** | POST | `/notificaciones` | JWT | Crear notificación |
| | GET | `/notificaciones` | JWT | Obtener todas (admin) |
| | GET | `/notificaciones/:id` | JWT | Obtener por ID |
| | GET | `/notificaciones/usuario/:usuarioId` | JWT | Obtener del usuario |
| | PATCH | `/notificaciones/:id/leer` | JWT | Marcar como leída |
| | PUT | `/notificaciones/:id` | JWT | Actualizar notificación |
| | DELETE | `/notificaciones/:id` | JWT | Eliminar notificación |
| **CHATS** | POST | `/chats` | JWT | Enviar mensaje |
| | GET | `/chats/:usuarioId` | JWT | Obtener historial |
| | PUT | `/chats/:id` | JWT | Actualizar mensaje |
| | DELETE | `/chats/:id` | JWT | Eliminar mensaje |
| **TESTS PSICOMÉTRICOS** | POST | `/tests-psicometricos` | JWT | Guardar resultado |
| | GET | `/tests-psicometricos/mis-resultados` | JWT | Ver mis resultados |
| | GET | `/tests-psicometricos/:id` | JWT | Obtener resultado |
| | GET | `/tests-psicometricos/estadisticas/:tipoTest` | JWT (Admin/Psicologo) | Ver estadísticas |
| | PUT | `/tests-psicometricos/:id` | JWT | Actualizar resultado |
| | DELETE | `/tests-psicometricos/:id` | JWT | Eliminar resultado |

---

## 🎯 CÓMO FUNCIONAN LOS MÓDULOS

### A. FLUJO DE ENCUESTAS

**Caso de Uso:** Administrador crea una encuesta de depresión. Paciente responde. Se guardan las respuestas.

**Paso 1:** Crear encuesta
```
POST /encuestas
Body: {
  "titulo": "Test de Depresión",
  "descripcion": "Evaluación de síntomas depresivos",
  "preguntas": [
    {
      "pregunta": "¿Te sientes triste?",
      "tipo": "ESCALA",
      "opciones": ["Nunca", "A veces", "Frecuentemente", "Siempre"]
    }
  ]
}
Response: { id: "123", titulo: "Test de Depresión", ... }
```

**Paso 2:** Paciente responde la encuesta
```
POST /encuestas/123/responder
Body: {
  "usuarioId": "usuario-456",
  "respuestas": {
    "pregunta_1": "Frecuentemente",
    "pregunta_2": "A veces"
  }
}
Response: { respuestaId: "789", savedAt: "2024-06-28T10:30:00Z" }
```

**Paso 3:** Ver resultados de la encuesta
```
GET /encuestas/123/respuestas
Response: [
  { usuarioId: "usuario-456", respuestas: {...}, fecha: "2024-06-28" },
  { usuarioId: "usuario-789", respuestas: {...}, fecha: "2024-06-27" }
]
```

---

### B. FLUJO DE NOTIFICACIONES

**Caso de Uso:** Sistema crea una notificación cuando se agenda una cita. Usuario la marca como leída.

**Paso 1:** Crear y enviar notificación
```
POST /notificaciones
Body: {
  "usuarioId": "550e8400-e29b-41d4-a716-446655440000",
  "titulo": "Nueva Cita Agendada",
  "mensaje": "Tu cita con Dr. García ha sido confirmada para mañana a las 10:00 AM",
  "tipo": "CITA"
}
Response: { id: "notif-001", leida: false, createdAt: "2024-06-28T10:30:00Z" }
```

**Paso 2:** Usuario obtiene sus notificaciones
```
GET /notificaciones/usuario/550e8400-e29b-41d4-a716-446655440000
Response: [
  { id: "notif-001", titulo: "Nueva Cita Agendada", leida: false },
  { id: "notif-002", titulo: "Recordatorio de Cita", leida: true }
]
```

**Paso 3:** Marcar como leída
```
PATCH /notificaciones/notif-001/leer
Response: { id: "notif-001", leida: true, leidoAt: "2024-06-28T10:45:00Z" }
```

---

### C. FLUJO DE CHATS

**Caso de Uso:** Paciente envía mensaje al psicólogo. Recupera el historial.

**Paso 1:** Enviar mensaje
```
POST /chats
Body: {
  "destinatarioId": "psicologo-001",
  "mensaje": "Hola Dr. García, ¿cómo estás?"
}
Response: { 
  id: "msg-001", 
  de: "usuario-123",
  hacia: "psicologo-001",
  mensaje: "Hola Dr. García, ¿cómo estás?",
  timestamp: "2024-06-28T10:30:00Z"
}
```

**Paso 2:** Obtener historial de conversación
```
GET /chats/psicologo-001
Response: [
  { id: "msg-001", de: "usuario-123", mensaje: "Hola Dr. García...", timestamp: "2024-06-28T10:30:00Z" },
  { id: "msg-002", de: "psicologo-001", mensaje: "¡Hola! ¿Cómo te va?", timestamp: "2024-06-28T10:35:00Z" }
]
```

**Paso 3:** Actualizar mensaje (editar)
```
PUT /chats/msg-001
Body: { "mensaje": "Hola Dr. García, ¿cómo estás? (editado)" }
Response: { id: "msg-001", mensaje: "Hola Dr. García, ¿cómo estás? (editado)", edited: true }
```

---

### D. FLUJO DE TESTS PSICOMÉTRICOS

**Caso de Uso:** Paciente realiza un test de ansiedad. Psicólogo ve las estadísticas.

**Paso 1:** Guardar resultado del test
```
POST /tests-psicometricos
Body: {
  "tipoTest": "ANSIEDAD",
  "respuestas": { "item_1": 3, "item_2": 4, "item_3": 2 },
  "puntajeTotal": 45,
  "diagnosticoPreliminar": "Ansiedad moderada"
}
Response: {
  id: "test-001",
  pacienteId: "usuario-123",
  tipoTest: "ANSIEDAD",
  puntajeTotal: 45,
  diagnosticoPreliminar: "Ansiedad moderada",
  fecha: "2024-06-28"
}
```

**Paso 2:** Paciente ve sus resultados previos
```
GET /tests-psicometricos/mis-resultados
Response: [
  { id: "test-001", tipoTest: "ANSIEDAD", puntajeTotal: 45, fecha: "2024-06-28" },
  { id: "test-002", tipoTest: "DEPRESION", puntajeTotal: 32, fecha: "2024-06-20" }
]
```

**Paso 3:** Psicólogo ve estadísticas (requiere rol ADMIN o PSICOLOGO)
```
GET /tests-psicometricos/estadisticas/ANSIEDAD
Response: {
  tipoTest: "ANSIEDAD",
  promedioMensual: 42.5,
  cantidadPacientes: 24,
  distribucion: {
    "BAJO": 5,
    "MODERADO": 12,
    "ALTO": 7
  }
}
```

---

## ⚙️ RECOMENDACIONES

1. **Exportar ChatsModule** → Agregar `exports: [ChatsService]` en chats.module.ts
2. **Exportar TestsPsicometricos** → Agregar `exports: [TestsPsicometricosService]`
3. **Validar DTOs** → Los DTOs actuales son buenos, pero considera agregar validaciones más estrictas
4. **Documentar Swagger** → Todos los endpoints tienen decoradores @ApiOperation, muy bien
5. **Manejar excepciones** → Considera agregar filtros de excepciones globales

