import {
    Injectable,
    BadRequestException,
    Logger,
    ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { OrdersService } from '../../orders/application/orders.service';
import { OrderStatus } from '../../orders/domain/order.entity';

export interface CheckoutSessionResult {
    url: string;
    sessionId: string;
}

/**
 * Integración de pagos con Stripe (Checkout Session).
 * El flujo: el frontend pide una sesión para una orden pendiente, el usuario
 * paga en la página de Stripe, y el webhook `checkout.session.completed`
 * marca la orden como pagada.
 */
@Injectable()
export class PaymentsService {
    private readonly logger = new Logger(PaymentsService.name);
    private readonly stripe: Stripe | null;
    private readonly frontendUrl: string;
    private readonly webhookSecret: string;

    constructor(
        config: ConfigService,
        private readonly ordersService: OrdersService,
    ) {
        const secretKey = config.get<string>('STRIPE_SECRET_KEY') ?? '';
        if (!secretKey) {
            this.logger.warn(
                'STRIPE_SECRET_KEY no configurada: los pagos no funcionarán',
            );
            this.stripe = null;
        } else {
            this.stripe = new Stripe(secretKey, {
                apiVersion: '2026-07-29.dahlia',
            });
        }
        this.frontendUrl =
            config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
        this.webhookSecret = config.get<string>('STRIPE_WEBHOOK_SECRET') ?? '';
    }

    /** Devuelve el cliente Stripe o lanza si no está configurado. */
    private get client(): Stripe {
        if (!this.stripe) {
            throw new ServiceUnavailableException(
                'Los pagos no están configurados (falta STRIPE_SECRET_KEY)',
            );
        }
        return this.stripe;
    }

    /**
     * Crea una Checkout Session para una orden pendiente del usuario.
     * Devuelve la URL a la que el navegador debe redirigir (hosted checkout).
     */
    async createCheckoutSession(
        userId: string,
        orderId: string,
        customerEmail?: string,
    ): Promise<CheckoutSessionResult> {
        const order = await this.ordersService.findOne(orderId, userId, false);
        if (order.status !== OrderStatus.PENDING) {
            throw new BadRequestException(
                'La orden no está pendiente de pago (estado: ' + order.status + ')',
            );
        }

        const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
            order.items.map((i) => ({
                price_data: {
                    currency: (order.currency || 'USD').toLowerCase(),
                    product_data: { name: i.name },
                    unit_amount: Math.round(i.price * 100), // Stripe trabaja en centavos
                },
                quantity: i.qty,
            }));

        const session = await this.client.checkout.sessions.create({
            mode: 'payment',
            customer_email: customerEmail,
            line_items: lineItems,
            success_url: `${this.frontendUrl}/orders/${orderId}?paid=1`,
            cancel_url: `${this.frontendUrl}/orders/${orderId}?cancelled=1`,
            metadata: { orderId },
        });

        await this.ordersService.setCheckoutSession(orderId, session.id);

        if (!session.url) {
            throw new BadRequestException('Stripe no devolvió URL de pago');
        }
        return { url: session.url, sessionId: session.id };
    }

    /**
     * Procesa un evento del webhook de Stripe. Valida la firma para asegurar
     * que el evento vino de Stripe, y ante `checkout.session.completed` marca
     * la orden como pagada.
     */
    async handleWebhook(
        payload: string | Buffer,
        signature: string,
    ): Promise<{ received: boolean }> {
        if (!this.webhookSecret) {
            throw new BadRequestException(
                'STRIPE_WEBHOOK_SECRET no configurada',
            );
        }

        let event: Stripe.Event;
        try {
            event = this.client.webhooks.constructEvent(
                payload,
                signature,
                this.webhookSecret,
            );
        } catch (err) {
            this.logger.error(
                'Firma de webhook inválida: ' + (err as Error).message,
            );
            throw new BadRequestException('Firma de webhook inválida');
        }

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;
            const orderId = session.metadata?.orderId;
            if (!orderId) {
                this.logger.warn(
                    'Checkout session sin orderId en metadata: ' + session.id,
                );
                return { received: true };
            }
            const paymentIntentId =
                typeof session.payment_intent === 'string'
                    ? session.payment_intent
                    : session.payment_intent?.id;

            await this.ordersService.markAsPaid(orderId, {
                paymentId: paymentIntentId ?? session.id,
                paymentMethod: session.payment_method_types?.[0] ?? 'card',
            });
            this.logger.log(
                `Orden ${orderId} marcada como pagada (session ${session.id})`,
            );
        }

        return { received: true };
    }
}
