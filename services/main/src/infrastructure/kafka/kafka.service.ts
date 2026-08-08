import {
    Injectable,
    Logger,
    OnModuleDestroy,
    OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer } from 'kafkajs';
import { KAFKA_CLIENT_ID } from './kafka.constants';

/** Envoltura del producer de kafkajs para publicar eventos de dominio. */
@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(KafkaService.name);
    private producer: Producer | null = null;
    private brokers: string[];

    constructor(private readonly configService: ConfigService) {
        const brokers =
            this.configService.get<string>('KAFKA_BROKERS') || 'localhost:9092';
        this.brokers = brokers.split(',').map((b) => b.trim());
    }

    async onModuleInit(): Promise<void> {
        const kafka = new Kafka({
            clientId: KAFKA_CLIENT_ID,
            brokers: this.brokers,
            logLevel: this.configService.get('NODE_ENV') === 'development' ? 2 : 4,
        });

        this.producer = kafka.producer({ allowAutoTopicCreation: true });
        try {
            await this.producer.connect();
            this.logger.log(`Kafka conectado (brokers: ${this.brokers.join(', ')})`);
        } catch (err) {
            // No crasheamos si Kafka está caído: el publicador reintenta por mensaje.
            this.logger.warn(
                `No se pudo conectar a Kafka al inicio: ${(err as Error).message}`,
            );
        }
    }

    async onModuleDestroy(): Promise<void> {
        if (this.producer) {
            try {
                await this.producer.disconnect();
            } catch {
                /* noop */
            }
        }
    }

    /** Publica un evento en un topic. key permite conservar el orden por entidad. */
    async publish<T extends Record<string, unknown>>(
        topic: string,
        key: string,
        type: string,
        data: T,
    ): Promise<void> {
        if (!this.producer) return;

        const value = JSON.stringify({
            type,
            occurredAt: new Date().toISOString(),
            data,
        });

        try {
            await this.producer.send({
                topic,
                messages: [{ key, value }],
            });
            this.logger.log(`Evento publicado: ${type} (topic=${topic}, key=${key})`);
        } catch (err) {
            this.logger.error(
                `Error al publicar ${type} en ${topic}: ${(err as Error).message}`,
            );
        }
    }

    isConnected(): boolean {
        return this.producer !== null;
    }
}
