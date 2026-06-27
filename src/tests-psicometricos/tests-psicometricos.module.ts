import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TestsPsicometricosService } from './tests-psicometricos.service';
import { TestsPsicometricosController } from './tests-psicometricos.controller';
import { TestResultado, TestResultadoSchema } from './schemas/test-resultado.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TestResultado.name, schema: TestResultadoSchema }]),
  ],
  controllers: [TestsPsicometricosController],
  providers: [TestsPsicometricosService],
})
export class TestsPsicometricosModule {}