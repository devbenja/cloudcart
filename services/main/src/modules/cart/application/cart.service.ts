import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CartRepository } from '../infrastructure/cart.repository';
import { ProductsService } from '../../catalog/application/products.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { Cart, CartItem } from '../domain/cart.interface';

@Injectable()
export class CartService {
    constructor(
        private readonly cartRepository: CartRepository,
        private readonly productsService: ProductsService,
    ) {}

    /** Devuelve el carrito del usuario (vacío si no existe). */
    async getCart(userId: string): Promise<Cart> {
        const cart = await this.cartRepository.get(userId);
        return (
            cart ?? {
                userId,
                items: [],
                updatedAt: Date.now(),
            }
        );
    }

    /** Agrega un producto al carrito. Valida existencia y stock del catálogo. */
    async addItem(userId: string, dto: AddCartItemDto): Promise<Cart> {
        // Valida que el producto exista y esté activo
        const product = await this.productsService.findOne(dto.productId);
        if (!product.isActive) {
            throw new BadRequestException('El producto no está disponible');
        }

        const cart = await this.getCart(userId);
        const existing = cart.items.find((i) => i.productId === dto.productId);

        const newQty = (existing?.qty ?? 0) + dto.qty;
        // Verifica stock disponible (suma de lo que ya está en el carrito + nuevo)
        if (newQty > product.stock) {
            throw new BadRequestException(
                `Stock insuficiente: solo hay ${product.stock} unidades de "${product.name}"`,
            );
        }

        const item: CartItem = {
            productId: product.id,
            name: product.name,
            price: product.price,
            qty: newQty,
            stock: product.stock,
            image: product.images?.[0],
        };

        if (existing) {
            existing.qty = newQty;
            existing.stock = product.stock;
            existing.price = product.price;
        } else {
            cart.items.push(item);
        }

        cart.updatedAt = Date.now();
        await this.cartRepository.save(cart);
        return cart;
    }

    /** Actualiza la cantidad de un ítem (0 elimina). */
    async updateItem(userId: string, productId: string, qty: number): Promise<Cart> {
        const cart = await this.getCart(userId);
        const existing = cart.items.find((i) => i.productId === productId);
        if (!existing) {
            throw new NotFoundException('Ítem no está en el carrito');
        }

        if (qty === 0) {
            cart.items = cart.items.filter((i) => i.productId !== productId);
        } else {
            if (qty > existing.stock) {
                throw new BadRequestException(
                    `Stock insuficiente: solo hay ${existing.stock} unidades de "${existing.name}"`,
                );
            }
            existing.qty = qty;
        }

        cart.updatedAt = Date.now();
        await this.cartRepository.save(cart);
        return cart;
    }

    /** Elimina un ítem del carrito. */
    async removeItem(userId: string, productId: string): Promise<Cart> {
        const cart = await this.getCart(userId);
        const existed = cart.items.some((i) => i.productId === productId);
        if (!existed) {
            throw new NotFoundException('Ítem no está en el carrito');
        }

        cart.items = cart.items.filter((i) => i.productId !== productId);
        cart.updatedAt = Date.now();
        await this.cartRepository.save(cart);
        return cart;
    }

    /** Vacía el carrito (tras crear la orden). */
    async clear(userId: string): Promise<void> {
        await this.cartRepository.clear(userId);
    }
}
