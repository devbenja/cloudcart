const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

/** Producto tal como lo devuelve la API del backend. */
export interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
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

export interface Order {
    id: string;
    userId: string;
    status: OrderStatus;
    items: OrderItem[];
    total: string;
    currency: string;
    createdAt: string;
    updatedAt: string;
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
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

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

    createOrder(accessToken: string): Promise<Order> {
        return request<Order>('/orders', { method: 'POST' }, accessToken);
    },

    getOrders(accessToken: string): Promise<Paginated<Order>> {
        return request<Paginated<Order>>('/orders?limit=50', {}, accessToken);
    },

    getOrder(accessToken: string, id: string): Promise<Order> {
        return request<Order>(`/orders/${id}`, {}, accessToken);
    },
};
