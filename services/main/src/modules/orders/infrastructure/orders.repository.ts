import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../domain/order.entity';

@Injectable()
export class OrdersRepository {
    constructor(
        @InjectRepository(Order)
        private readonly repo: Repository<Order>,
    ) {}

    create(data: Partial<Order>): Order {
        return this.repo.create(data);
    }

    async save(order: Order): Promise<Order> {
        return this.repo.save(order);
    }

    async findAll(
        filter: { userId?: string },
        skip: number,
        take: number,
    ): Promise<[Order[], number]> {
        return this.repo.findAndCount({
            where: filter.userId ? { userId: filter.userId } : {},
            skip,
            take,
            order: { createdAt: 'DESC' },
        });
    }

    async findById(id: string): Promise<Order | null> {
        return this.repo.findOne({ where: { id } });
    }

    /** Actualiza el estado de una orden (máquina de estados). */
    async updateStatus(id: string, status: OrderStatus): Promise<Order | null> {
        await this.repo.update(id, { status });
        return this.findById(id);
    }

    /** Actualiza campos parciales de una orden (shipping, tracking, events). */
    async update(id: string, data: Partial<Order>): Promise<void> {
        await this.repo.update(id, data);
    }
}
