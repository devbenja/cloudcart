/**
 * Dominio del carrito de compras.
 * Se persiste en Redis (sesión, rápida, con TTL).
 */

/** Ítem del carrito: snapshot del producto + cantidad elegida. */
export interface CartItem {
    productId: string;
    name: string;
    price: number;
    qty: number;
    /** Stock disponible al momento de agregar (para validar y mostrar). */
    stock: number;
    image?: string;
}

/** Carrito completo de un usuario. */
export interface Cart {
    userId: string;
    items: CartItem[];
    updatedAt: number;
}

/** TTL del carrito en segundos (7 días). */
export const CART_TTL_SECONDS = 60 * 60 * 24 * 7;
