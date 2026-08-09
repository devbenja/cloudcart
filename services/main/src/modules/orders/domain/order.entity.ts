import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
} from 'typeorm';

/** Estados posibles de una orden (máquina de estados). */
export enum OrderStatus {
    PENDING = 'pending',
    PAID = 'paid',
    SHIPPED = 'shipped',
    DELIVERED = 'delivered',
    CANCELLED = 'cancelled',
}

/** Ítem congelado en el momento de la compra (snapshot del catálogo). */
export interface OrderItem {
    productId: string;
    name: string;
    price: number;
    qty: number;
    image?: string;
}

/** Dirección de envío de una orden. */
export interface ShippingAddress {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
}

/** Transiciones válidas: estado actual -> estados permitidos. */
export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.PENDING]: [OrderStatus.PAID, OrderStatus.CANCELLED],
    [OrderStatus.PAID]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
    [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
    [OrderStatus.DELIVERED]: [],
    [OrderStatus.CANCELLED]: [],
};

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index()
    @Column({ type: 'varchar', length: 255 })
    userId: string;

    @Column({ type: 'varchar', length: 20, default: OrderStatus.PENDING })
    status: OrderStatus;

    @Column({ type: 'jsonb' })
    items: OrderItem[];

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    total: string;

    @Column({ type: 'varchar', length: 3, default: 'USD' })
    currency: string;

    // ── Tracking / Envío ──────────────────────────────────────

    /** Dirección de envío (JSONB): { street, city, state, zip, country } */
    @Column({ type: 'jsonb', nullable: true })
    shippingAddress: ShippingAddress | null;

    @Column({ type: 'varchar', length: 100, nullable: true })
    trackingNumber: string | null;

    @Column({ type: 'varchar', length: 50, nullable: true })
    carrier: string | null;

    /** Historial de eventos de la orden (timeline). */
    @Column({ type: 'jsonb', default: '[]' })
    events: { status: string; at: string; note?: string }[];

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;
}
