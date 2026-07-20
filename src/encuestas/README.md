# Módulo de Encuestas - Documentación

## 📋 Descripción General

Sistema de encuestas con seguridad por roles donde:
- **Todos los psicólogos** pueden ver las plantillas de encuestas
- **Las respuestas** están protegidas y solo el psicólogo que asignó la encuesta puede verlas
- **Los pacientes** solo ven las encuestas que les fueron asignadas

## 🏗️ Arquitectura

### Colecciones MongoDB

#### 1. **Encuestas** (Plantillas)
```typescript
{
  _id: ObjectId,
  titulo: string,
  descripcion: string,
  psicologoId: string,      // ID del psicólogo que creó la plantilla
  preguntas: Array<{
    pregunta: string,
    tipo: 'TEXTO' | 'ESCALA' | 'MULTIPLE',
    opciones?: string[]
  }>,
  createdAt: Date,
  updatedAt: Date
}
```

#### 2. **Respuestas**
```typescript
{
  _id: ObjectId,
  encuestaId: ObjectId,     // Referencia a la encuesta
  usuarioId: string,         // ID del paciente que respondió
  respuestas: Record<string, any>,  // { "pregunta1": "respuesta", ... }
  createdAt: Date,
  updatedAt: Date
}
```

#### 3. **AsignacionEncuestas** (Nueva)
```typescript
{
  _id: ObjectId,
  encuestaId: ObjectId,     // Referencia a la encuesta
  psicologoId: ObjectId,    // Psicólogo que asignó la encuesta
  pacienteId: ObjectId,     // Paciente que debe responder
  estado: 'PENDIENTE' | 'RESPONDIDA',
  fechaRespuesta: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔒 Seguridad Implementada

### Capa 1: JWT
- El token contiene el `id` y `rol` del usuario
- Se extrae automáticamente en cada request

### Capa 2: Controlador
- Valida que el usuario esté autenticado (`JwtAuthGuard`)
- Pasa el `psicologoId` del JWT a los servicios

### Capa 3: Servicio
- **Validación de propiedad**: Solo el psicólogo que creó la encuesta puede ver respuestas
- **Filtrado por asignación**: Los pacientes solo ven respuestas de encuestas asignadas a ellos
- **Excepciones explícitas**: `ForbiddenException` si se intenta acceder sin permisos

## 📡 Endpoints Disponibles

### Para Psicólogos

#### 1. Ver todas las plantillas de encuestas
```http
GET /encuestas
```
**Respuesta**: Array de todas las encuestas disponibles

#### 2. Crear nueva plantilla
```http
POST /encuestas
Headers: Authorization: Bearer <token>
Body: {
  "titulo": "Test de Ansiedad",
  "descripcion": "Evaluación semanal",
  "preguntas": [
    {
      "pregunta": "¿Cómo te sientes hoy?",
      "tipo": "ESCALA",
      "opciones": ["1", "2", "3", "4", "5"]
    }
  ]
}
```

#### 3. Ver respuestas de una encuesta (SOLO el creador)
```http
GET /encuestas/:id/respuestas
Headers: Authorization: Bearer <token>
```
**Seguridad**: Solo el psicólogo que creó la encuesta puede acceder

#### 4. Asignar encuesta a un paciente
```http
POST /encuestas/:id/asignar
Headers: Authorization: Bearer <token>
Body: {
  "pacienteId": "uuid-del-paciente"
}
```

#### 5. Ver encuestas asignadas por mí
```http
GET /encuestas/mis-asignadas
Headers: Authorization: Bearer <token>
```
**Respuesta**: Lista de asignaciones con detalles de encuesta y paciente

### Para Pacientes

#### 1. Ver encuestas asignadas a mí
```http
GET /encuestas/mis-encuestas
Headers: Authorization: Bearer <token>
```
**Respuesta**: Lista de encuestas que el psicólogo me asignó

#### 2. Responder una encuesta
```http
POST /encuestas/:id/responder
Headers: Authorization: Bearer <token>
Body: {
  "usuarioId": "mi-uuid",
  "respuestas": {
    "¿Cómo te sientes hoy?": "4",
    "¿Tuviste ansiedad?": "Sí"
  }
}
```

#### 3. Ver mis respuestas
```http
GET /encuestas/mis-respuestas
Headers: Authorization: Bearer <token>
```
**Seguridad**: Solo ve respuestas de encuestas que le fueron asignadas

### Para Administradores

#### 1. Ver métricas generales
```http
GET /encuestas/metricas/generales
Headers: Authorization: Bearer <token>
```
**Respuesta**:
```json
{
  "totalEncuestas": 10,
  "totalRespuestas": 45,
  "respuestasPorEncuesta": [
    {
      "encuestaId": "uuid",
      "encuestaTitulo": "Test de Ansiedad",
      "cantidad": 12
    }
  ]
}
```

## 🔄 Flujo Completo

### 1. Psicólogo crea plantilla
```typescript
POST /encuestas
{
  titulo: "Evaluación Semanal",
  descripcion: "Check-in emocional",
  preguntas: [...]
}
// Backend guarda: psicologoId = "uuid-psicologo-123"
```

### 2. Psicólogo asigna a paciente
```typescript
POST /encuestas/encuesta-456/asignar
{
  pacienteId: "uuid-paciente-789"
}
// Backend crea en AsignacionEncuestas:
// {
//   encuestaId: "encuesta-456",
//   psicologoId: "uuid-psicologo-123",
//   pacienteId: "uuid-paciente-789",
//   estado: "PENDIENTE"
// }
```

### 3. Paciente responde
```typescript
POST /encuestas/encuesta-456/responder
{
  usuarioId: "uuid-paciente-789",
  respuestas: { "¿Cómo te sientes?": "Bien" }
}
// Backend guarda en Respuestas:
// {
//   encuestaId: "encuesta-456",
//   usuarioId: "uuid-paciente-789",
//   respuestas: { "¿Cómo te sientes?": "Bien" }
// }
// Backend actualiza AsignacionEncuestas: estado = "RESPONDIDA"
```

### 4. Psicólogo ve respuestas
```typescript
GET /encuestas/encuesta-456/respuestas
// Backend valida:
// 1. ¿La encuesta existe? Sí
// 2. ¿El usuario es el creador? 
//    encuesta.psicologoId === "uuid-psicologo-123" → true
// 3. Retorna las respuestas
```

### 5. Paciente ve sus respuestas
```typescript
GET /encuestas/mis-respuestas
// Backend:
// 1. Obtiene asignaciones del paciente: [{encuestaId: "encuesta-456"}]
// 2. Filtra respuestas: WHERE usuarioId = "uuid-paciente-789" 
//                        AND encuestaId IN ["encuesta-456"]
// 3. Retorna solo esas respuestas
```

## 🚫 Casos de Acceso Denegado

### Psicólogo intenta ver respuestas de encuesta que no creó
```http
GET /encuestas/encuesta-456/respuestas
Headers: Authorization: Bearer <token-psicologo-diferente>
```
**Respuesta**: `403 Forbidden - Solo puedes ver las respuestas de encuestas que creaste`

### Paciente intenta ver respuestas de encuesta no asignada
```http
GET /encuestas/mis-respuestas
```
**Respuesta**: Array vacío (no hay asignaciones para este paciente)

## 🎯 Reglas de Negocio

1. **Plantillas públicas**: Todos los psicólogos pueden ver todas las plantillas
2. **Creación**: Al crear una encuesta, se asigna automáticamente el `psicologoId` del JWT
3. **Asignación**: Solo el psicólogo creador puede asignar su encuesta a pacientes
4. **Respuestas**: 
   - Solo el psicólogo creador puede ver las respuestas de su encuesta
   - Los pacientes solo ven respuestas de encuestas asignadas a ellos
5. **Unicidad**: No se puede asignar la misma encuesta al mismo paciente dos veces

## 📊 Ejemplo de Uso en Frontend

### Psicólogo - Asignar encuesta
```typescript
import { encuestasService } from '../../services/encuestasService';

// Ver todas las encuestas disponibles
const encuestas = await encuestasService.getAll();

// Asignar encuesta a paciente
await encuestasService.asignarEncuesta(
  "encuesta-456",
  "paciente-789"
);

// Ver encuestas que he asignado
const misAsignadas = await encuestasService.getMisAsignadas();

// Ver respuestas de una encuesta
const respuestas = await encuestasService.getRespuestas("encuesta-456");
```

### Paciente - Responder encuesta
```typescript
import { encuestasService } from '../../services/encuestasService';

// Ver encuestas asignadas
const misEncuestas = await encuestasService.getMisEncuestas();

// Responder encuesta
await encuestasService.guardarRespuesta(
  "encuesta-456",
  "mi-usuario-id",
  {
    "¿Cómo te sientes?": "Bien",
    "¿Tuviste ansiedad?": "No"
  }
);

// Ver mis respuestas
const misRespuestas = await encuestasService.getMisRespuestas();
```

## 🧪 Testing

### Probar seguridad - Psicólogo ve sus respuestas
```bash
# 1. Login como psicólogo A
POST /auth/login
{ "email": "psicologo-a@test.com", "password": "123456" }

# 2. Crear encuesta
POST /encuestas
Authorization: Bearer <token-psicologo-a>
{ "titulo": "Test A", "descripcion": "...", "preguntas": [...] }

# 3. Ver respuestas (debería funcionar)
GET /encuestas/:id/respuestas
Authorization: Bearer <token-psicologo-a>

# 4. Login como psicólogo B
POST /auth/login
{ "email": "psicologo-b@test.com", "password": "123456" }

# 5. Intentar ver respuestas de encuesta de psicólogo A (debería fallar)
GET /encuestas/:id/respuestas
Authorization: Bearer <token-psicologo-b>
# Esperado: 403 Forbidden
```

### Probar seguridad - Paciente ve solo sus respuestas
```bash
# 1. Asignar encuesta a paciente
POST /encuestas/:id/asignar
Authorization: Bearer <token-psicologo>
{ "pacienteId": "paciente-123" }

# 2. Login como paciente
POST /auth/login
{ "email": "paciente@test.com", "password": "123456" }

# 3. Ver sus encuestas
GET /encuestas/mis-encuestas
Authorization: Bearer <token-paciente>
# Esperado: Solo ve la encuesta que le asignaron

# 4. Ver sus respuestas
GET /encuestas/mis-respuestas
Authorization: Bearer <token-paciente>
# Esperado: Solo respuestas de encuestas asignadas a él
```

## 📝 Notas Adicionales

- Las encuestas son **plantillas reutilizables** que pueden asignarse a múltiples pacientes
- Cada asignación es única (no se puede asignar dos veces al mismo paciente)
- El estado de la asignación cambia automáticamente a "RESPONDIDA" cuando el paciente responde
- Las métricas generales están disponibles para admin y psicólogos, pero no incluyen datos sensibles de respuestas individuales