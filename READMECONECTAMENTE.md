
CONECTAMENTE - SISTEMA CLINICO DE PSICOLOGIA Y SALUD MENTAL (BACKEND)

Informacion oficial del repositorio backend para ConectaMente. Esta es una 
API REST desarrollada con NestJS, diseñada para la gestion integral 
de un Sistema Clinico de Psicologia y Salud Mental. El sistema 
implementa una arquitectura hibrida con bases de datos relacionales y NoSQL de manera 
simultanea.

1. INFORMACION GENERAL

* Nombre del Proyecto: LOZA-BLOG-BACKEND-CONECTAMENTE
* Repositorio: https://github.com/Anahi-droid/Loza-blog-backend-conectamente.git
* Integrantes del Equipo: Anahi Loza (@Anahi-droid), Andres Jurado (anrresJurado) y Antoni Fernandez (starx04)
* Descripcion Funcional: ConectaMente es una plataforma tecnologica orientada a la 
  gestion y automatizacion de servicios de salud mental. Permite el control 
  agendas medicas, reserva y pago de citas, gestion confidencial de 
  historias clinicas y diagnosticos, seguimiento evolutivo del progreso 
  psicoterapeutico, e interacciones dinamicas de alta concurrencia como chat 
  interactivo en tiempo real entre pacientes y psicologos, encuestas de 
  satisfaccion y la aplicacion de tests psicometricos.

2. TECNOLOGIAS UTILIZADAS

La arquitectura aprovecha bases de datos Relacionales y NoSQL:
* NestJS (v10+): Framework progresivo de Node.js en TypeScript, con arquitectura modular.
* PostgreSQL (v16): Motor relacional para la integridad de datos.
* TypeORM: ORM bajo el patron Data Mapper para interactuar con PostgreSQL.
* MongoDB: Base de datos NoSQL.
* Mongoose: ODM para el modelado de esquemas flexibles de MongoDB dentro de NestJS.
* JSON Web Tokens (JWT): Estandar para transmision segura de tokens.
* Passport & Passport-JWT: Middleware implementado para la proteccion de rutas.
* Class-Validator & Class-Transformer: Validacion de datos declarativa mediante DTOs.
* Swagger (OpenAPI): Documentacion interactiva y sandbox en el endpoint /api/docs.


3. ARQUITECTURA DEL PROYECTO

El proyecto se organiza en modulos autonomos de dominio dentro de /src:

LOZA-BLOG-BACKEND-CONECTAMENTE
├── .github/workflows/          # Automatizaciones y flujos de CI/CD
├── dist/                       # Codigo TypeScript compilado a JavaScript
├── node_modules/               # Dependencias y librerias externas
└── src/                        # Codigo fuente de la aplicacion (Ecosistema NestJS)
    ├── admin/                  # Modulo de administracion global del sistema
    ├── agenda/                 # Control de agendas clinicas y horarios de trabajo
    ├── auth/                   # Estrategias, guards y logica de autenticacion (JWT)
    ├── chats/                  # Modulo de comunicacion por chat (MongoDB)
    ├── citas/                  # Gestion de reservas, estados de citas y pagos
    ├── encuestas/              # Evaluaciones de servicio y satisfaccion (MongoDB)
    ├── especialidades/         # Especialidades clinicas de los psicologos
    ├── historial/              # Historias clinicas, diagnosticos y tratamientos
    ├── notificaciones/         # Alertas del sistema y push (MongoDB)
    ├── pacientes/              # Perfiles y datos del pacientes
    ├── perfil/                 # Gestion de datos de cuenta del usuario actual
    ├── progreso/               # Seguimiento evolutivo del tratamiento
    ├── psicologos/             # Profesionales de la salud mental y excepciones
    ├── recomendaciones/        # Pautas y tareas terapeuticas asignadas
    ├── tests-psicometricos/    # Plantillas y respuestas de test aplicados (MongoDB)
    ├── usuarios/               # Entidad base de autenticacion y credenciales
    ├── app.module.ts           # Modulo raiz que orquesta todas las dependencias
    └── main.ts                 # Punto de entrada (bootstrap) de la aplicacion

4. INSTALACION Y DESPLIEGUE LOCAL

Paso 1: Clonar el repositorio
git clone https://github.com/Anahi-droid/Loza-blog-backend-conectamente.git
cd Loza-blog-backend-conectamente

Paso 2: Instalacion de dependencias
npm install

Paso 3: Configuracion de variables de entorno (.env)
Cree un archivo llamado '.env':

NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USER=usuario_postgres
DB_PASS=contrasena_postgres
DB_NAME=conectamente_db

MONGO_URI=mongodb://psicologia_user_mongo:psicologia_user_mongo_123@localhost:27017/psicologia_db_mongo?authSource=admin

JWT_SECRET=supersecret_clave_altamente_segura_2026
JWT_EXPIRES_IN=3600s

MAIL_USER=tu_correo@dominio.com
MAIL_PASS=tu_password_smtp
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_SENDER=remitente@tudominio.com

Paso 4: Levantar el servidor en desarrollo
npm run start:dev

5. USO DE LA API Y EJEMPLOS DE CONSUMO

5.1 Estructura Estandar (CRUD)
* GET    modulo     - Obtener listado de la entidad (Codigo: 200 OK)
* GET    /modulo/:id - Buscar registro por UUID (Codigo: 200 OK)
* POST   modulo     - Crear un nuevo registro usando DTO (Codigo: 201 Created)
* PATCH  /modulo/:id - Actualizacion parcial (Codigo: 200 OK)
* DELETE /modulo/:id - Eliminacion fisica o logica (Codigo: 200 OK)

5.2 Flujo de Autenticacion y Obtencion de Token JWT

A. Registro de Usuario (Paciente)
Endpoint: POST /auth/user
Payload (JSON):
{
  "email": "paciente.ejemplo@correo.com",
  "password": "PasswordSeguro123*",
  "nombre": "Juan Perez",
  "telefono": "+593987654321"
}

B. Inicio de Sesion (Login)
Endpoint: POST /auth/login
Payload (JSON):
{
  "email": "paciente.ejemplo@correo.com",
  "password": "PasswordSeguro123*"
}
Respuesta Exitosa:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

5.3 Consumo de Endpoints Protegidos
Debe adjuntar el token en las cabeceras HTTP mediante el esquema Bearer:
Cabecera: Authorization: Bearer <TOKEN>

Ejemplo para crear una cita (POST /citas):
{
  "agendaId": "e106662c-27ec-4240-8f33-fce19e9f8027",
  "motivoConsulta": "Estres academico intenso por examenes finales."
}

Rutas Restringidas a Administradores (Protegido por RolesGuard):
Endpoint: POST /admin/usuarios (Requiere rol ADMIN en el JWT)

6. DOCUMENTACION CON SWAGGER

Disponible localmente en la siguiente direccion una vez encendido el servidor:
http://localhost:3000/api/docs

* Exploracion de Esquemas: Inspeccion tecnica de DTOs y entidades de respuesta.
* Codigos Semanticos: Detalle de errores comunes.
* Sandbox Integrada: Permite usar el boton "Authorize" para inyectar el JWT 
  y ejecutar pruebas directamente sin usar Postman.

# 🧪 Testing - ConectaMente Backend

Documentación técnica de la suite de pruebas para el backend de ConectaMente. Define estrategia de testing, configuración, ejecución y estándares de cobertura para garantizar la estabilidad y confiabilidad de la API.

## Tabla de Contenidos
- [1. Información general](#1-información-general)
- [2. Tecnologías de testing](#2-tecnologías-de-testing)
- [3. Arquitectura de pruebas](#3-arquitectura-de-pruebas)
- [4. Convenciones de nombres](#4-convenciones-de-nombres)
- [5. Configuración del entorno](#5-configuración-del-entorno)
- [6. Levantamiento de infraestructura](#6-levantamiento-de-infraestructura)
- [7. Flujo de ejecución](#7-flujo-de-ejecución)
- [8. Scripts disponibles](#8-scripts-disponibles)
- [9. Cobertura de código](#9-cobertura-de-código)
- [10. Mocks y fixtures](#10-mocks-y-fixtures)
- [11. Integración continua (CI)](#11-integración-continua-ci)

---

## 1. Información general

- **Proyecto**: LOZA-BLOG-BACKEND-CONECTAMENTE
- **Alcance**: Pruebas unitarias, integración y E2E
- **Ambiente dedicado**: Tests ejecutados contra instancias aisladas de bases de datos (sin contaminar desarrollo/producción)
- **Repositorio**: https://github.com/Anahi-droid/Loza-blog-backend-conectamente.git

---

## 2. Tecnologías de testing

| Componente | Tecnología | Propósito |
|---|---|---|
| **Test runner** | Jest 30.4.2 | Framework principal para ejecutar pruebas |
| **Compilación TS** | ts-jest 29.4.11 | Transformar TypeScript en tiempo real para Jest |
| **Testing NestJS** | @nestjs/testing 11.1.27 | Utilidades para crear `TestingModule` sin instanciar app |
| **HTTP testing** | supertest 7.2.2 | Simular requests HTTP contra app real levantada |
| **Runtime TS** | ts-node 10.9.2 | Ejecutar código TypeScript en CLI (debug) |
| **Inspección de código** | node --inspect-brk | Debugging paso a paso con breakpoints |

---

## 3. Arquitectura de pruebas

```text
          [E2E]
        ┌───────────┐
        │ API real  │
        │ supertest │
        └───────────┘
             ▲
          [Integración]
        ┌───────────┐
        │ Testing   │
        │ Module    │
        └───────────┘
             ▲
          [Unitarias]
        ┌────────────┐
        │ Services   │
        │ Controllers│
        │ Guards     │
        │ Pipes      │
        └────────────┘
```

### Niveles y cobertura de NestJS

| Nivel | Componentes NestJS | Alcance |
|---|---|---|
| Unitarias | `Service`, `Controller`, `Guard`, `Pipe`, `PipeTransform` | Lógica aislada con mocking de repositorios y providers externos |
| Integración | `TestingModule`, `Controller`, `Service`, `Provider`, `Module` | Validación del wiring real de módulos Nest sin levantar el servidor completo |
| E2E | `INestApplication`, rutas HTTP, middleware, guards, pipes | Flujo completo request → response contra la app real, validado con `test:e2e` (ver sección 8) |

---

## 4. Convenciones de nombres

- `src/**/*.spec.ts` → pruebas unitarias e integración.
- `test/**/*.e2e-spec.ts` → pruebas E2E.

Ejemplo de estructura:

```text
src/
├── auth/
│   ├── auth.controller.ts
│   ├── auth.controller.spec.ts
│   ├── auth.service.ts
│   └── auth.service.spec.ts
└── ...

test/
├── jest-e2e.json
└── app.e2e-spec.ts
```

> El `rootDir` de Jest para tests unitarios está en `src`; `npm run test` **no detecta** `*.spec.ts` fuera de esa carpeta. Las pruebas E2E usan una configuración independiente (`test/jest-e2e.json`), ejecutada únicamente vía `npm run test:e2e`.

---

## 5. Configuración del entorno

### ⚠️ Archivo `.env.test` no incluido en el repositorio

El archivo `.env.test` **no está versionado** por razones de seguridad y debe crearse manualmente en la raíz del proyecto antes de ejecutar cualquier prueba de integración o E2E que requiera conexión a base de datos.

El procedimiento de creación se detalla en el **Paso 3** de la sección [6. Levantamiento de infraestructura](#6-levantamiento-de-infraestructura).

Variables mínimas requeridas:

```env
NODE_ENV=test

DB_HOST=localhost
DB_PORT=5432
DB_USER=test_user
DB_PASS=test_pass
DB_NAME=conectamente_test

MONGO_URI=mongodb://test_user:test_pass@localhost:27017/conectamente_test?authSource=admin

JWT_SECRET=test_secret_key_2026
JWT_EXPIRES_IN=3600s
```

---

## 6. Levantamiento de infraestructura

### Requisitos previos

- Node.js ≥ 18
- Docker y Docker Compose instalados
- Dependencias del proyecto (`npm install`)
- Archivo `.env.test` (ver sección 5)

### Paso a paso

```bash
# Paso 1: Clonar repositorio
git clone https://github.com/Anahi-droid/Loza-blog-backend-conectamente.git
cd Loza-blog-backend-conectamente

# Paso 2: Instalar dependencias
npm install

# Paso 3: Crear archivo de variables de entorno de test
cat > .env.test << EOF
NODE_ENV=test

DB_HOST=localhost
DB_PORT=5432
DB_USER=test_user
DB_PASS=test_pass
DB_NAME=conectamente_test

MONGO_URI=mongodb://test_user:test_pass@localhost:27017/conectamente_test?authSource=admin

JWT_SECRET=test_secret_key_2026
JWT_EXPIRES_IN=3600s
EOF

# Paso 4: Levantar PostgreSQL y MongoDB de test
docker compose -f docker-compose.test.yml up -d postgres mongo
```

### Alternativa manual (sin `docker-compose.test.yml`)

```bash
# PostgreSQL
docker run -d \
  --name postgres-test \
  -e POSTGRES_USER=test_user \
  -e POSTGRES_PASSWORD=test_pass \
  -e POSTGRES_DB=conectamente_test \
  -p 5432:5432 \
  postgres:16

# MongoDB
docker run -d \
  --name mongo-test \
  -e MONGO_INITDB_ROOT_USERNAME=test_user \
  -e MONGO_INITDB_ROOT_PASSWORD=test_pass \
  -p 27017:27017 \
  mongo:latest
```

### Verificar servicios activos

```bash
docker ps

# output esperado:
# postgres-test   postgres:16 ...  5432/tcp
# mongo-test      mongo:latest ... 27017/tcp
```

### Limpiar infraestructura

```bash
docker compose -f docker-compose.test.yml down -v

# o manualmente
docker stop postgres-test mongo-test
docker rm postgres-test mongo-test
```

---

## 7. Flujo de ejecución

```text
┌─────────────────────────────────────────────────────────────┐
│                    DESARROLLADOR LOCAL                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │  npm run test:watch  │
                 │  (desarrollo activo) │
                 └──────────────────────┘
                            │
                  ┌─────────┴─────────┐
                  ▼                   ▼
        ┌─────────────────┐ ┌─────────────────┐
        │  Cambio en .ts  │ │  Cambio en test │
        └─────────────────┘ └─────────────────┘
                  │                   │
                  └─────────┬─────────┘
                            ▼
           ┌─────────────────────────────────┐
           │  Jest detecta cambios (watch)   │
           │  Re-ejecuta tests afectados     │
           └─────────────────────────────────┘
                            │
                            ▼
                  ┌──────────────────────────┐
                  │  Todas las pruebas OK?   │
                  └──────────────────────────┘
                     Sí │                │ No
                        ▼                ▼
                 ┌─────────────┐  ┌──────────────┐
                 │  Proceder   │  │  Ver errores │
                 │  con commit │  │  y ajustar   │
                 └─────────────┘  └──────────────┘
                        │                │
                        └────────┬───────┘
                                 ▼
                  ┌────────────────────────────┐
                  │  npm run test:cov          │
                  │  (antes de PR)             │
                  └────────────────────────────┘
                                 │
                                 ▼
           ┌─────────────────────────────────────┐
           │  Cobertura ≥ 80% (Statements)   ?   │
           │  Cobertura ≥ 75% (Branches)    ?   │
           └─────────────────────────────────────┘
           Sí │                              │ No
              ▼                              ▼
       ┌──────────────┐           ┌─────────────────────┐
       │  Push a repo │           │  Aumentar cobertura │
       └──────────────┘           │  y re-ejecutar      │
              │                   └─────────────────────┘
              ▼
  ┌─────────────────────────┐
  │  GitHub Actions (CI)    │
  │  Ejecuta pipeline       │
  └─────────────────────────┘
    │ npm run lint
    │ npm run test:cov
    │ npm run test:e2e
              │
              ▼
  ┌─────────────────────────┐
  │  Todos los checks OK?   │
  └─────────────────────────┘
  Sí │                 │ No
     ▼                 ▼
  Mergear          Rechazar PR
  a main
```

---

## 8. Scripts disponibles

| Script | Comando | Descripción / Cuándo usarlo |
|---|---|---|
| `test` | `jest` | Ejecuta todas las pruebas unitarias e integración de `src/`; uso pre-commit y verificación local |
| `test:watch` | `jest --watch` | Corre tests en modo watch durante desarrollo activo |
| `test:cov` | `jest --coverage` | Genera reporte de cobertura; uso en revisión de PR y pipeline |
| `test:debug` | `node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand` | Debug con breakpoints en VSCode/Chrome |
| `test:e2e` | `jest --config ./test/jest-e2e.json` | Ejecuta pruebas E2E (`test/jest-e2e.json`), validando autenticación JWT en rutas protegidas, guards/pipes en el flujo HTTP, y contratos de respuesta/códigos de estado |

### Ejecución focalizada

```bash
npm run test -- src/auth/auth.service.spec.ts
```

---

## 9. Cobertura de código

Configuración Jest relevante en `package.json`:

- `rootDir`: `src`
- `testRegex`: `.*\.spec\.ts$`
- `coverageDirectory`: `../coverage`
- `collectCoverageFrom`:
  - `**/*.(t|j)s`
  - `!**/main.ts`
  - `!**/*.module.ts`
  - `!**/*.entity.ts`
  - `!**/*.dto.ts`
  - `!**/*.schema.ts`
  - `!**/*.strategy.ts`
  - `!**/*.guard.ts`
  - `!**/*.decorator.ts`

### Umbrales mínimos

| Métrica | Umbral |
|---|---|
| Statements | 80% |
| Branches | 75% |
| Functions | 80% |
| Lines | 80% |

### Configuración de fallo automático

```json
"coverageThreshold": {
  "global": {
    "branches": 75,
    "functions": 80,
    "lines": 80,
    "statements": 80
  }
}
```

### Reporte

Ejecutar:

```bash
npm run test:cov
```

Genera el HTML en:

```text
coverage/lcov-report/index.html
```

Interpretación de colores:

- 🟢 Verde: la línea se ejecutó durante la suite.
- 🔴 Rojo: línea no ejecutada.
- 🟡 Amarillo: cobertura parcial en ramas condicionales.

---

## 10. Mocks y fixtures

| Dependencia real | Estrategia de mock / Herramienta |
|---|---|
| Repositorio TypeORM | `overrideProvider(getRepositoryToken(Entity))`, `jest.fn()` en `find`, `save`, `findOne`, `delete` |
| Modelo Mongoose | `overrideProvider(getModelToken('NombreModelo'))`, mock de métodos `find`, `create`, `updateOne` |
| JWT / Passport | mock de estrategia JWT o generación de token con secreto de test |
| Validadores / DTOs | fixtures de datos y factories, evitar datos hardcodeados |

### Ejemplo de mock técnico

```ts
const moduleRef = await Test.createTestingModule({
  providers: [
    AuthService,
    {
      provide: getRepositoryToken(User),
      useValue: {
        findOne: jest.fn().mockResolvedValue(mockUser),
        save: jest.fn().mockResolvedValue(mockUser),
      },
    },
  ],
}).compile();

const service = moduleRef.get<AuthService>(AuthService);
```

> En integración, use el `TestingModule` real y mockee solo las dependencias externas claramente identificadas (repositorios, modelos, servicios de terceros).

---

## 11. Integración continua (CI)

Secuencia recomendada en el pipeline (ej. GitHub Actions):

```yaml
- run: npm install
- run: npm run lint
- run: npm run test:cov
- run: npm run test:e2e
```

No mergear un Pull Request si:

- Falla cualquier prueba unitaria, de integración o E2E.
- La cobertura no cumple los umbrales definidos en la sección 9.
- Hay errores reportados por el linter.

> El objetivo es mantener `main` estable, reproducible y listo para despliegue.