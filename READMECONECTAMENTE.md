
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
