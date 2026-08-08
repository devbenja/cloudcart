import { Injectable } from '@nestjs/common';
import { RedisService } from '../../../infrastructure/database/redis/redis.service';
import { Cart, CART_TTL_SECONDS } from '../domain/cart.interface';

const cartKey = (userId: string) => `cart:${userId}`;

/**
 * Repositorio del carrito sobre Redis.
 * Cada carrito es un JSON en la clave `cart:{userId}` con TTL.
 */
@Injectable()
export class CartRepository {
    constructor(private readonly redisService: RedisService) {}

    private get client() {
        return this.redisService.getClient();
    }

    async get(userId: string): Promise<Cart | null> {
        const raw = await this.client.get(cartKey(userId));
        if (!raw) {
            return null;
        }
        try {
            return JSON.parse(raw) as Cart;
        } catch {
            return null;
        }
    }

    async save(cart: Cart): Promise<void> {
        await this.client.set(
            cartKey(cart.userId),
            JSON.stringify(cart),
            'EX',
            CART_TTL_SECONDS,
        );
    }

    async clear(userId: string): Promise<void> {
        await this.client.del(cartKey(userId));
    }
}
