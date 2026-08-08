import { Global, Module } from '@nestjs/common';
import { KafkaService } from './kafka.service';
import { KafkaConsumer } from './kafka.consumer';

/**
 * Módulo global de Kafka: expone KafkaService para publicar eventos
 * y arranca el consumer que los procesa.
 */
@Global()
@Module({
    providers: [KafkaService, KafkaConsumer],
    exports: [KafkaService],
})
export class KafkaModule {}
