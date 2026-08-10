// INTERNAL_API_URL (no-NEXT_PUBLIC, solo disponible en el server) se usa para
// que los server components fetchen directo al Service `main` en Kubernetes en
// vez de rebotar por el ingress. En el cliente (y en dev local) se usa la URL pública.
const API_URL =
    process.env.INTERNAL_API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    'http://localhost:3001/api/v1';

/** Producto tal como lo devuelve la API del backend. */
export interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    rating?: number;
    reviewCount?: number;
    currency: string;
    category: string;
    tags: string[];
    stock: number;
    attributes: Record<string, unknown>;
    images: string[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

/** Formatea un precio en USD. */
export function formatPrice(value: number, currency = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
    }).format(value);
}

/** Porcentaje de descuento (entero) si hay precio original; 0 si no. */
export function discountPercent(product: Pick<Product, 'price' | 'originalPrice'>): number {
    if (!product.originalPrice || product.originalPrice <= product.price) return 0;
    return Math.round((1 - product.price / product.originalPrice) * 100);
}

export interface Paginated<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
}

export interface ProductQuery {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
}

export interface CreateProductInput {
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    rating?: number;
    reviewCount?: number;
    category: string;
    stock: number;
    currency?: string;
    tags?: string[];
    attributes?: Record<string, unknown>;
    images?: string[];
}

/** Ítem del carrito (Redis). */
export interface CartItem {
    productId: string;
    name: string;
    price: number;
    qty: number;
    stock: number;
    image?: string;
}

export interface Cart {
    userId: string;
    items: CartItem[];
    updatedAt: number;
}

/** Ítem congelado en la orden (snapshot). */
export interface OrderItem {
    productId: string;
    name: string;
    price: number;
    qty: number;
    image?: string;
}

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';

/** Espejo de ORDER_TRANSITIONS del backend: estados alcanzables desde cada uno. */
export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    pending: ['paid', 'cancelled'],
    paid: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: [],
    cancelled: [],
};

export interface OrderEvent {
    status: OrderStatus;
    at: string;
    note?: string;
}

export interface ShippingAddress {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
}

export interface Order {
    id: string;
    userId: string;
    status: OrderStatus;
    items: OrderItem[];
    total: string;
    currency: string;
    shippingAddress?: ShippingAddress | null;
    trackingNumber?: string | null;
    carrier?: string | null;
    events?: OrderEvent[];
    /** ID de la Checkout Session de Stripe. */
    checkoutSessionId?: string | null;
    /** ID del pago confirmado (PaymentIntent). */
    paymentId?: string | null;
    paymentMethod?: string | null;
    createdAt: string;
    updatedAt: string;
}

/** Resultado de crear una Checkout Session de Stripe. */
export interface CheckoutSessionResult {
    url: string;
    sessionId: string;
}

export interface Review {
    id: string;
    productId: string;
    userId: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    updatedAt: string;
}

export type UserRole = 'admin' | 'customer';

/** Usuario de la tabla local (Postgres), sincronizado manualmente por admin. */
export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    keycloakId: string | null;
    role: UserRole;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateUserInput {
    email: string;
    firstName: string;
    lastName: string;
    role?: UserRole;
    keycloakId?: string;
}

export class ApiError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.status = status;
    }
}

async function request<T>(
    path: string,
    options: RequestInit = {},
    accessToken?: string,
): Promise<T> {
    const headers: Record<string, string> = {
        ...(options.headers as Record<string, string>),
    };

    // Solo envía Content-Type: application/json cuando hay cuerpo.
    // Fastify rechaza un POST con ese header pero body vacío
    // ("Body cannot be empty when content-type is set to 'application/json'").
    if (options.body) {
        headers['Content-Type'] = 'application/json';
    }

    // Si hay sesión, adjunta el bearer token (endpoints protegidos)
    if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
    }

    const res = await fetch(`${API_URL}${path}`, {
        ...options,
        headers,
        cache: 'no-store',
    });

    if (!res.ok) {
        let message = `Error ${res.status}`;
        try {
            const body = await res.json();
            if (typeof body.message === 'string') message = body.message;
            else if (Array.isArray(body.message)) message = body.message.join(', ');
        } catch {
            // sin body JSON
        }
        throw new ApiError(message, res.status);
    }

    if (res.status === 204) {
        return undefined as T;
    }

    return res.json() as Promise<T>;
}

export const api = {
    /** Catálogo público: no requiere token. */
    getProducts(query: ProductQuery = {}): Promise<Paginated<Product>> {
        const params = new URLSearchParams();
        if (query.page) params.set('page', String(query.page));
        if (query.limit) params.set('limit', String(query.limit));
        if (query.category) params.set('category', query.category);
        if (query.search) params.set('search', query.search);
        const qs = params.toString();
        return request<Paginated<Product>>(`/products${qs ? `?${qs}` : ''}`);
    },

    /** Obtener un producto por ID (público). */
    getProduct(id: string): Promise<Product> {
        return request<Product>(`/products/${id}`);
    },

    /** Categorías activas del catálogo (público). */
    getCategories(): Promise<string[]> {
        return request<string[]>('/products/categories');
    },

    /** Crear producto: requiere rol admin. */
    createProduct(data: CreateProductInput, accessToken: string): Promise<Product> {
        return request<Product>(
            '/products',
            { method: 'POST', body: JSON.stringify(data) },
            accessToken,
        );
    },

    /** Actualizar producto: requiere rol admin. */
    updateProduct(
        id: string,
        data: Partial<CreateProductInput>,
        accessToken: string,
    ): Promise<Product> {
        return request<Product>(
            `/products/${id}`,
            { method: 'PATCH', body: JSON.stringify(data) },
            accessToken,
        );
    },

    /** Eliminar producto: requiere rol admin. */
    deleteProduct(id: string, accessToken: string): Promise<void> {
        return request<void>(`/products/${id}`, { method: 'DELETE' }, accessToken);
    },

    // ---- Carrito (requiere sesión) ----

    getCart(accessToken: string): Promise<Cart> {
        return request<Cart>('/cart', {}, accessToken);
    },

    addCartItem(accessToken: string, productId: string, qty: number): Promise<Cart> {
        return request<Cart>(
            '/cart/items',
            { method: 'POST', body: JSON.stringify({ productId, qty }) },
            accessToken,
        );
    },

    updateCartItem(
        accessToken: string,
        productId: string,
        qty: number,
    ): Promise<Cart> {
        return request<Cart>(
            `/cart/items/${productId}`,
            { method: 'PATCH', body: JSON.stringify({ qty }) },
            accessToken,
        );
    },

    removeCartItem(accessToken: string, productId: string): Promise<Cart> {
        return request<Cart>(`/cart/items/${productId}`, { method: 'DELETE' }, accessToken);
    },

    clearCart(accessToken: string): Promise<void> {
        return request<void>('/cart', { method: 'DELETE' }, accessToken);
    },

    // ---- Órdenes (requiere sesión) ----

    /**
     * Crea la orden (checkout). La dirección de envío es opcional y se pide
     * ANTES del pago, por eso viaja en el body de creación.
     */
    createOrder(
        accessToken: string,
        data?: { shippingAddress: ShippingAddress },
    ): Promise<Order> {
        const options: RequestInit = data
            ? { method: 'POST', body: JSON.stringify(data) }
            : { method: 'POST' };
        return request<Order>('/orders', options, accessToken);
    },

    getOrders(accessToken: string): Promise<Paginated<Order>> {
        return request<Paginated<Order>>('/orders?limit=50', {}, accessToken);
    },

    getOrder(accessToken: string, id: string): Promise<Order> {
        return request<Order>(`/orders/${id}`, {}, accessToken);
    },

    /** Completar dirección de envío de una orden (dueño). */
    updateShipping(
        accessToken: string,
        id: string,
        data: { shippingAddress: ShippingAddress; carrier?: string; trackingNumber?: string },
    ): Promise<Order> {
        return request<Order>(
            `/orders/${id}/shipping`,
            { method: 'PATCH', body: JSON.stringify(data) },
            accessToken,
        );
    },

    /** Cambiar estado de una orden (máquina de estados, solo admin). */
    updateOrderStatus(accessToken: string, id: string, status: OrderStatus): Promise<Order> {
        return request<Order>(
            `/orders/${id}/status`,
            { method: 'PATCH', body: JSON.stringify({ status }) },
            accessToken,
        );
    },

    // ---- Pagos (Stripe, requiere sesión) ----

    /** Crea una Checkout Session y devuelve la URL de Stripe para redirigir. */
    createCheckoutSession(accessToken: string, orderId: string): Promise<CheckoutSessionResult> {
        return request<CheckoutSessionResult>(
            '/payments/checkout-session',
            { method: 'POST', body: JSON.stringify({ orderId }) },
            accessToken,
        );
    },

    // ---- Reseñas (requiere sesión para escribir) ----

    /** Listar reseñas de un producto (público). */
    getProductReviews(productId: string): Promise<Paginated<Review>> {
        return request<Paginated<Review>>(`/reviews/product/${productId}`);
    },

    /** Crear reseña: requiere haber comprado el producto. */
    createReview(
        accessToken: string,
        productId: string,
        data: { rating: number; comment?: string },
    ): Promise<Review> {
        return request<Review>(
            `/reviews/product/${productId}`,
            { method: 'POST', body: JSON.stringify(data) },
            accessToken,
        );
    },

    /** Editar reseña propia (o admin). */
    updateReview(
        accessToken: string,
        id: string,
        data: { rating?: number; comment?: string },
    ): Promise<Review> {
        return request<Review>(
            `/reviews/${id}`,
            { method: 'PATCH', body: JSON.stringify(data) },
            accessToken,
        );
    },

    /** Eliminar reseña propia (o admin). */
    deleteReview(accessToken: string, id: string): Promise<void> {
        return request<void>(`/reviews/${id}`, { method: 'DELETE' }, accessToken);
    },

    // ---- Usuarios (solo admin) ----

    getUsers(accessToken: string, page = 1, limit = 50): Promise<Paginated<User>> {
        return request<Paginated<User>>(
            `/users?page=${page}&limit=${limit}`,
            {},
            accessToken,
        );
    },

    createUser(accessToken: string, data: CreateUserInput): Promise<User> {
        return request<User>(
            '/users',
            { method: 'POST', body: JSON.stringify(data) },
            accessToken,
        );
    },

    updateUser(
        accessToken: string,
        id: string,
        data: Partial<CreateUserInput> & { isActive?: boolean },
    ): Promise<User> {
        return request<User>(
            `/users/${id}`,
            { method: 'PATCH', body: JSON.stringify(data) },
            accessToken,
        );
    },

    deleteUser(accessToken: string, id: string): Promise<void> {
        return request<void>(`/users/${id}`, { method: 'DELETE' }, accessToken);
    },
};
