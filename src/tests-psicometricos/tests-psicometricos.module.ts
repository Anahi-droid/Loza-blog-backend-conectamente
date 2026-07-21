import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TestsPsicometricosService } from './tests-psicometricos.service';
import { TestsPsicometricosController } from './tests-psicometricos.controller';
import { TestResultado, TestResultadoSchema } from './schemas/test-resultado.schema';
import { AsignacionTest, AsignacionTestSchema } from './schemas/asignacion-test.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TestResultado.name, schema: TestResultadoSchema },
      { name: AsignacionTest.name, schema: AsignacionTestSchema },
    ]),
    AuthModule,
  ],
  controllers: [TestsPsicometricosController],
  providers: [TestsPsicometricosService],
  exports: [TestsPsicometricosService],
})
export class TestsPsicometricosModule {}
