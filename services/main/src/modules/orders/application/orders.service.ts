import {
    Injectable,
    BadRequestException,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { OrdersRepository } from '../infrastructure/orders.repository';
import { CartService } from '../../cart/application/cart.service';
import { ProductsService } from '../../catalog/application/products.service';
import { KafkaService } from '../../../infrastructure/kafka/kafka.service';
import {
    KAFKA_TOPICS,
    KAFKA_EVENTS,
} from '../../../infrastructure/kafka/kafka.constants';
import { Order, OrderItem, OrderStatus, ORDER_TRANSITIONS } from '../domain/order.entity';
import { UpdateShippingDto } from './dto/update-shipping.dto';

export interface CreateOrderResult {
    order: Order;
    items: OrderItem[];
    total: number;
}

@Injectable()
export class OrdersService {
    constructor(
        private readonly ordersRepository: OrdersRepository,
        private readonly cartService: CartService,
        private readonly productsService: ProductsService,
        private readonly kafkaService: KafkaService,
    ) {}

    /**
     * Checkout: lee el carrito, descuenta stock de forma atómica por ítem,
     * crea la orden con snapshot y vacía el carrito.
     * Si falla el descuento de un ítem, hace rollback de los ya descontados
     * (mini-Saga sin transacción distribuida).
     */
    async create(userId: string): Promise<Order> {
        const cart = await this.cartService.getCart(userId);
        if (cart.items.length === 0) {
            throw new BadRequestException('El carrito está vacío');
        }

        // 1) Descontar stock de todos los ítems
        const decremented: { productId: string; qty: number }[] = [];
        try {
            for (const item of cart.items) {
                await this.productsService.decrementStock(item.productId, item.qty);
                decremented.push({ productId: item.productId, qty: item.qty });
            }
        } catch (err) {
            // Rollback: devolver el stock de los ítems ya descontados
            for (const d of decremented) {
                try {
                    await this.productsService.incrementStock(d.productId, d.qty);
                } catch {
                    // rollback best-effort: si falla, queda un log pendiente
                }
            }
            throw err;
        }

        // 2) Snapshot de la orden (congela precios/nombres del momento de compra)
        const items: OrderItem[] = cart.items.map((i) => ({
            productId: i.productId,
            name: i.name,
            price: i.price,
            qty: i.qty,
            image: i.image,
        }));

        const total = items.reduce((acc, i) => acc + i.price * i.qty, 0);

        const order = this.ordersRepository.create({
            userId,
            status: OrderStatus.PENDING,
            items,
            total: total.toFixed(2),
            currency: 'USD',
        });

        // 3) Registrar evento de creación + persistir orden
        const now = new Date().toISOString();
        order.events = [{ status: OrderStatus.PENDING, at: now, note: 'Orden creada' }];
        const saved = await this.ordersRepository.save(order);

        // 4) Limpiar carrito
        await this.cartService.clear(userId);

        // 5) Evento de dominio: avisa al resto del sistema que se creó una orden.
        await this.kafkaService.publish(
            KAFKA_TOPICS.ORDERS,
            saved.id,
            KAFKA_EVENTS.ORDER_CREATED,
            {
                id: saved.id,
                userId: saved.userId,
                status: saved.status,
                total: saved.total,
                currency: saved.currency,
                items: saved.items.map((i) => ({
                    productId: i.productId,
                    name: i.name,
                    price: i.price,
                    qty: i.qty,
                })),
            },
        );

        return saved;
    }

    /** Lista órdenes: admin ve todas; usuario ve solo las suyas. */
    async findAll(
        userId: string,
        isAdmin: boolean,
        page = 1,
        limit = 20,
    ): Promise<{ data: Order[]; total: number; page: number; limit: number }> {
        const skip = (page - 1) * limit;
        const filter = isAdmin ? {} : { userId };
        const [data, total] = await this.ordersRepository.findAll(filter, skip, limit);
        return { data, total, page, limit };
    }

    /** Detalle de una orden (dueño o admin). */
    async findOne(id: string, userId: string, isAdmin: boolean): Promise<Order> {
        const order = await this.ordersRepository.findById(id);
        if (!order) {
            throw new NotFoundException(`Orden ${id} no encontrada`);
        }
        if (!isAdmin && order.userId !== userId) {
            throw new ForbiddenException('No tienes acceso a esta orden');
        }
        return order;
    }

    /**
     * Cambia el estado siguiendo la máquina de estados.
     * Validar: la orden existe, el usuario es admin, y la transición es válida.
     */
    async updateStatus(
        id: string,
        newStatus: OrderStatus,
        note?: string,
    ): Promise<Order> {
        const order = await this.ordersRepository.findById(id);
        if (!order) {
            throw new NotFoundException(`Orden ${id} no encontrada`);
        }

        const allowed = ORDER_TRANSITIONS[order.status] ?? [];
        if (!allowed.includes(newStatus)) {
            throw new BadRequestException(
                `Transición inválida: ${order.status} -> ${newStatus}. Permitidas: ${allowed.join(', ')}`,
            );
        }

        // Registrar evento de timeline
        const events = [
            ...(order.events ?? []),
            {
                status: newStatus,
                at: new Date().toISOString(),
                note,
            },
        ];
        await this.ordersRepository.update(id, { status: newStatus, events });

        return this.ordersRepository.findById(id) as Promise<Order>;
    }

    async updateShipping(
        orderId: string,
        userId: string,
        dto: UpdateShippingDto,
    ): Promise<Order> {
        const order = await this.ordersRepository.findById(orderId);
        if (!order) {
            throw new NotFoundException(`Orden ${orderId} no encontrada`);
        }
        if (order.userId !== userId) {
            throw new ForbiddenException('No puedes modificar el envío de esta orden');
        }
        await this.ordersRepository.update(orderId, {
            shippingAddress: dto.shippingAddress,
            trackingNumber: dto.trackingNumber ?? null,
            carrier: dto.carrier ?? null,
        });
        return this.ordersRepository.findById(orderId) as Promise<Order>;
    }
}
