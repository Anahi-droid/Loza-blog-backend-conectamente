# 🔧 RECOMENDACIONES Y AJUSTES PARA LOS MÓDULOS

---

## 📋 RESUMEN DE ESTADO ACTUAL

### ✅ LO QUE ESTÁ BIEN

1. **Importaciones correctas**: Todos los módulos importan correctamente AuthModule
2. **Seguridad**: Todos usan `JwtAuthGuard` para proteger endpoints
3. **Estructura**: Patrón Module/Service/Controller implementado correctamente
4. **Swagger**: Documentación API presente con @ApiOperation
5. **MongoDB**: Esquemas bien definidos para Encuesta, Notificacion, Chat, Test

---

## ⚠️ PROBLEMAS IDENTIFICADOS Y SOLUCIONES

### 1. PROBLEMA: ChatsModule NO exporta el servicio

**Archivo:** `src/chats/chats.module.ts`

**Problema:**
```typescript
@Module({
  // ... otros módulos sí exportan sus servicios
  exports: [ChatsService], // ❌ FALTA ESTO
})
```

**Solución:**
```typescript
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Chat.name, schema: ChatSchema }]),
    AuthModule,
  ],
  controllers: [ChatsController],
  providers: [ChatsService],
  exports: [ChatsService], // ✅ AGREGADO
})
export class ChatsModule {}
```

---

### 2. PROBLEMA: TestsPsicometricosModule NO exporta el servicio

**Archivo:** `src/tests-psicometricos/tests-psicometricos.module.ts`

**Problema:**
```typescript
@Module({
  // ... NO hay exports
})
```

**Solución:**
```typescript
@Module({
  imports: [
    MongooseModule.forFeature([{ name: TestResultado.name, schema: TestResultadoSchema }]),
    AuthModule,
  ],
  controllers: [TestsPsicometricosController],
  providers: [TestsPsicometricosService],
  exports: [TestsPsicometricosService], // ✅ AGREGADO
})
export class TestsPsicometricosModule {}
```

---

### 3. PROBLEMA: ChatsController falta decoradores Swagger

**Archivo:** `src/chats/chats.controller.ts`

**Problema:**
```typescript
@Controller('chats')
@UseGuards(JwtAuthGuard) 
export class ChatsController {
  // ❌ Falta @ApiTags y @ApiBearerAuth
```

**Solución:**
```typescript
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('chats')
@ApiBearerAuth('jwt-auth')
@Controller('chats')
@UseGuards(JwtAuthGuard) 
export class ChatsController {
  // ✅ Ahora aparecerá bien en Swagger
```

---

### 4. PROBLEMA: TestsPsicometricosController falta decoradores Swagger

**Archivo:** `src/tests-psicometricos/tests-psicometricos.controller.ts`

**Problema:**
```typescript
@Controller('tests-psicometricos')
@UseGuards(JwtAuthGuard)
export class TestsPsicometricosController {
  // ❌ Falta @ApiTags y @ApiBearerAuth
```

**Solución:**
```typescript
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('tests-psicometricos')
@ApiBearerAuth('jwt-auth')
@Controller('tests-psicometricos')
@UseGuards(JwtAuthGuard)
export class TestsPsicometricosController {
  // ✅ Ahora aparecerá bien en Swagger y será consistente
```

---

### 5. PROBLEMA: DTOs sin validaciones suficientes

**Archivo:** `src/chats/dto/create-chat.dto.ts`

**Problema actual (muy básico):**
```typescript
export class CreateChatDto {
  @IsString()
  @IsNotEmpty()
  destinatarioId?: string;

  @IsString()
  @IsNotEmpty()
  mensaje?: string;
}
```

**Solución mejorada:**
```typescript
import { IsString, IsNotEmpty, IsUUID, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateChatDto {
  @ApiProperty({ example: 'psicologo-uuid-001', description: 'UUID del destinatario' })
  @IsUUID()
  @IsNotEmpty()
  destinatarioId!: string;

  @ApiProperty({ example: 'Hola Dr. García, tengo una pregunta', description: 'Contenido del mensaje' })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(5000)
  mensaje!: string;
}
```

---

### 6. PROBLEMA: TestResultadoDto sin validaciones suficientes

**Archivo:** `src/tests-psicometricos/dto/create-test-resultado.dto.ts`

**Problema actual:**
```typescript
export class CreateTestResultadoDto {
  @IsString()
  @IsNotEmpty()
  tipoTest?: string;

  @IsObject()
  @IsNotEmpty()
  respuestas?: any; // ❌ any es malo

  @IsNumber()
  @IsNotEmpty()
  puntajeTotal?: number;

  @IsString()
  @IsNotEmpty()
  diagnosticoPreliminar?: string;
}
```

**Solución:**
```typescript
import { IsString, IsNotEmpty, IsObject, IsNumber, IsIn, MinLength, MaxLength, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTestResultadoDto {
  @ApiProperty({ example: 'ANSIEDAD', description: 'Tipo de test psicométrico' })
  @IsString()
  @IsNotEmpty()
  @IsIn(['ANSIEDAD', 'DEPRESION', 'ESTRES', 'AUTOESTIMA', 'PERSONALIDAD', 'IMPULSIVIDAD'])
  tipoTest!: string;

  @ApiProperty({ example: { item_1: 3, item_2: 4 }, description: 'Respuestas del test' })
  @IsObject()
  @IsNotEmpty()
  respuestas!: Record<string, number | string>;

  @ApiProperty({ example: 45, description: 'Puntaje total obtenido' })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Max(100)
  puntajeTotal!: number;

  @ApiProperty({ example: 'Ansiedad moderada', description: 'Diagnóstico preliminar' })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(500)
  diagnosticoPreliminar!: string;
}
```

---

## 🚀 MEJORAS SUGERIDAS

### 1. Agregar Global Error Handler

**Crear archivo:** `src/common/filters/http-exception.filter.ts`

```typescript
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = exception instanceof HttpException ? exception.getResponse() : 'Internal server error';

    response.status(status).json({
      statusCode: status,
      message: message,
      timestamp: new Date().toISOString(),
    });
  }
}
```

**Aplicar en:** `src/main.ts`
```typescript
app.useGlobalFilters(new HttpExceptionFilter());
```

---

### 2. Agregar Response Interceptor

**Crear archivo:** `src/common/interceptors/response.interceptor.ts`

```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => ({
        success: true,
        data: data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
```

**Aplicar en:** `src/main.ts`
```typescript
app.useGlobalInterceptors(new ResponseInterceptor());
```

---

### 3. Validación Global de Pipe

**En:** `src/main.ts`

```typescript
import { ValidationPipe, BadRequestException } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  
  // resto del código...
}
```

---

### 4. Rate Limiting para Chats

**Instalar:**
```bash
npm install @nestjs/throttler
```

**Configurar en:** `src/chats/chats.controller.ts`

```typescript
import { Throttle } from '@nestjs/throttler';

@ApiTags('chats')
@ApiBearerAuth('jwt-auth')
@Controller('chats')
@UseGuards(JwtAuthGuard)
export class ChatsController {
  @Post()
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 mensajes por minuto
  async guardarMensaje(@Req() req, @Body() createChatDto: CreateChatDto) {
    return this.chatsService.enviarMensaje(req.user.id, createChatDto);
  }
  // ...
}
```

---

### 5. Tests (Unit Tests)

**Crear archivo:** `src/encuestas/encuestas.service.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { EncuestasService } from './encuestas.service';
import { getModelToken } from '@nestjs/mongoose';
import { Encuesta } from './schemas/encuesta.schema';

describe('EncuestasService', () => {
  let service: EncuestasService;

  const mockEncuestaModel = {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EncuestasService,
        {
          provide: getModelToken(Encuesta.name),
          useValue: mockEncuestaModel,
        },
      ],
    }).compile();

    service = module.get<EncuestasService>(EncuestasService);
  });

  it('debe crear una encuesta', async () => {
    const dto = {
      titulo: 'Test',
      descripcion: 'Test description',
      preguntas: [],
    };

    mockEncuestaModel.create.mockResolvedValue({ ...dto, _id: '123' });

    const result = await service.create(dto);
    expect(result).toBeDefined();
    expect(mockEncuestaModel.create).toHaveBeenCalledWith(dto);
  });
});
```

---

## 📊 TABLA DE PRIORIDADES

| Prioridad | Tarea | Impacto |
|---|---|---|
| 🔴 ALTA | Agregar exports a ChatsModule | Otros módulos no pueden usar ChatsService |
| 🔴 ALTA | Agregar exports a TestsPsicometricosModule | Otros módulos no pueden usar TestsPsicometricosService |
| 🟡 MEDIA | Agregar @ApiTags a ChatsController | Swagger no mostrará bien el controlador |
| 🟡 MEDIA | Agregar @ApiTags a TestsPsicometricosController | Swagger no mostrará bien el controlador |
| 🟢 BAJA | Mejorar DTOs con validaciones | Validación de datos pero ya funciona |
| 🟢 BAJA | Error handler global | Mejor manejo de errores |

---

## 🎯 ACCIONES RECOMENDADAS

### Inmediatas (Hacer HOY)
```typescript
// 1. Actualizar chats.module.ts
exports: [ChatsService]

// 2. Actualizar tests-psicometricos.module.ts
exports: [TestsPsicometricosService]

// 3. Actualizar chats.controller.ts
@ApiTags('chats')
@ApiBearerAuth('jwt-auth')

// 4. Actualizar tests-psicometricos.controller.ts
@ApiTags('tests-psicometricos')
@ApiBearerAuth('jwt-auth')
```

### Corto Plazo (Esta semana)
- Mejorar DTOs con validaciones
- Agregar Global Error Handler
- Agregar Response Interceptor
- Agregar Rate Limiting

### Largo Plazo (Este mes)
- Implementar tests unitarios
- Agregar logging completo
- Caching de datos frecuentes
- Documentación adicional

---

## 🧪 CHECKLIST DE VERIFICACIÓN

- [ ] Todos los módulos tienen exports
- [ ] Todos los controladores tienen @ApiTags
- [ ] Todos los controladores tienen @ApiBearerAuth
- [ ] Los DTOs tienen validaciones completas
- [ ] Hay error handler global
- [ ] Hay response interceptor
- [ ] Tests unitarios implementados
- [ ] Documentación Swagger correcta
- [ ] Rate limiting en endpoints críticos
- [ ] Logging implementado

