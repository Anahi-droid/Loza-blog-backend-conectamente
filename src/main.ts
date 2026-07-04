import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Clínica Psicológica — API')
    .setDescription(
      'API REST para la gestión de usuarios, autenticación y perfiles ' +
      'de la plataforma de la clínica psicológica.\n\n' +
      '**Roles disponibles:** `PACIENTE` · `PSICOLOGO` · `ADMIN`\n\n' +
      'Para rutas protegidas, haz login en `/auth/login`, copia el ' +
      '`accessToken` y pégalo en el botón **Authorize 🔒** de arriba.',
    )
    .setVersion('1.0.0')
    .addTag('auth',   'Registro público y login global')
    .addTag('perfil', 'Gestión del perfil del usuario autenticado')
    .addTag('admin',  'Panel de administración de personal (solo ADMIN)')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Ingresa tu JWT: Bearer <token>',
        in: 'header',
      },
      'jwt-auth', 
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,   
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'Clínica Psicológica · Docs',
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 App corriendo en: http://localhost:${process.env.PORT ?? 3000}`);
  console.log(`📚 Swagger docs en:  http://localhost:${process.env.PORT ?? 3000}/api/docs`);
}

bootstrap();