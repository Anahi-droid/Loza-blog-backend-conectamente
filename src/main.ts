import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express'; // 👈 Importación necesaria
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';


async function bootstrap() {
 const app = await NestFactory.create<NestExpressApplication>(AppModule); // 👈 Tipo específico
 app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
 app.useStaticAssets(join(__dirname, '..', 'public')); // 👈 Habilita acceso público a /public


 const config = new DocumentBuilder()
   .setTitle('Mi API')
   .setDescription('Documentación de la API')
   .setVersion('1.0')
   .addBearerAuth() // opcional si usas JWT
   .build();
 const document = SwaggerModule.createDocument(app, config);
 SwaggerModule.setup('docs', app, document);
  await app.listen(3000);
}
bootstrap();
