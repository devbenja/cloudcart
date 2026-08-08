import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Consumer } from 'kafkajs';
import { RedisService } from '../database/redis/redis.service';
import {
    KAFKA_CLIENT_ID,
    KAFKA_CONSUMER_GROUP,
    KAFKA_EVENTS,
    KAFKA_TOPICS,
} from './kafka.constants';

interface OrderCreatedEvent {
    type: string;
    occurredAt: string;
    data: {
        id: string;
        userId: string;
        status: string;
        total: string;
        currency: string;
        items: { productId: string; name: string; price: number; qty: number }[];
    };
}

/**
 * Consumer de eventos de dominio.
 *
 * En un monólito, publisher y consumer conviven; al dividir en servicios este
 * módulo migraría a un servicio aparte (ej: notificaciones) sin cambios en el
 * producer, que es exactamente el desacoplamiento que da el bus de eventos.
 */
@Injectable()
export class KafkaConsumer implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(KafkaConsumer.name);
    private consumer: Consumer | null = null;
    private brokers: string[];

    constructor(
        private readonly configService: ConfigService,
        private readonly redisService: RedisService,
    ) {
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

        this.consumer = kafka.consumer({
            groupId: KAFKA_CONSUMER_GROUP,
            sessionTimeout: 10000,
            rebalanceTimeout: 30000,
        });

        try {
            await this.consumer.connect();
            await this.consumer.subscribe({
                topic: KAFKA_TOPICS.ORDERS,
                fromBeginning: false,
            });
            await this.consumer.run({
                eachMessage: async ({ message }) => {
                    await this.handleMessage(message.value?.toString());
                },
            });
            this.logger.log(`Consumer suscrito a ${KAFKA_TOPICS.ORDERS}`);
        } catch (err) {
            this.logger.warn(
                `Consumer no pudo iniciar (¿Kafka caído?): ${(err as Error).message}`,
            );
        }
    }

    async onModuleDestroy(): Promise<void> {
        if (this.consumer) {
            try {
                await this.consumer.disconnect();
            } catch {
                /* noop */
            }
        }
    }

    /** Dispatch del evento recibido según su tipo. */
    private async handleMessage(raw: string | undefined): Promise<void> {
        if (!raw) return;

        let event: OrderCreatedEvent;
        try {
            event = JSON.parse(raw);
        } catch {
            this.logger.warn('Mensaje no-JSON ignorado');
            return;
        }

        switch (event.type) {
            case KAFKA_EVENTS.ORDER_CREATED:
                await this.handleOrderCreated(event);
                break;
            default:
                this.logger.warn(`Tipo de evento desconocido: ${event.type}`);
        }
    }

    /** Simula el envío de una notificación de confirmación de pedido. */
    private async handleOrderCreated(event: OrderCreatedEvent): Promise<void> {
        const { id, total, currency, items, userId } = event.data;

        const client = this.redisService.getClient();
        // Registro verificable del evento procesado (permite validar el flujo E2E)
        await client.set(
            `events:order.created:${id}`,
            JSON.stringify({
                orderId: id,
                userId,
                total,
                currency,
                items,
                processedAt: new Date().toISOString(),
            }),
            'EX',
            86400, // 24h
        );

        this.logger.log(
            `📬 Notificación simulada: pedido ${id} confirmado (${currency} ${total}, ` +
                `${items.length} ítems) para usuario ${userId}`,
        );
    }
}
