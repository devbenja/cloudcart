'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { api, type Cart, formatPrice } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    ShoppingCart,
    Trash2,
    Plus,
    Minus,
    ArrowRight,
    Truck,
    Loader2,
} from 'lucide-react';

const FREE_SHIPPING_THRESHOLD = 50;

export function CartClient() {
    const { data: session } = useSession();
    const accessToken = session?.accessToken;

    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [checkingOut, setCheckingOut] = useState(false);

    const load = useCallback(async () => {
        if (!accessToken) return;
        setLoading(true);
        setError(null);
        try {
            setCart(await api.getCart(accessToken));
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Error al cargar el carrito');
        } finally {
            setLoading(false);
        }
    }, [accessToken]);

    useEffect(() => {
        if (accessToken) void load();
    }, [accessToken, load]);

    const notifyCartUpdated = () => window.dispatchEvent(new Event('cart-updated'));

    const changeQty = async (productId: string, qty: number) => {
        if (!accessToken) return;
        try {
            setCart(await api.updateCartItem(accessToken, productId, qty));
            setError(null);
            notifyCartUpdated();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Error');
        }
    };

    const remove = async (productId: string) => {
        if (!accessToken) return;
        try {
            setCart(await api.removeCartItem(accessToken, productId));
            setError(null);
            notifyCartUpdated();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Error');
        }
    };

    const clear = async () => {
        if (!accessToken) return;
        try {
            await api.clearCart(accessToken);
            setCart({ userId: '', items: [], updatedAt: Date.now() });
            setError(null);
            notifyCartUpdated();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Error al vaciar');
        }
    };

    const handleCheckout = async () => {
        if (!accessToken || !cart || cart.items.length === 0) return;
        setCheckingOut(true);
        setError(null);
        setSuccess(null);
        try {
            await api.createOrder(accessToken);
            setSuccess('✓ ¡Compra realizada! Tu pedido fue creado.');
            setCart({ userId: '', items: [], updatedAt: Date.now() });
            notifyCartUpdated();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Error al procesar la compra');
        } finally {
            setCheckingOut(false);
        }
    };

    const items = cart?.items ?? [];
    const subtotal = items.reduce((acc, i) => acc + i.price * i.qty, 0);
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : 5;
    const total = subtotal + shipping;

    // ── Sin sesión ─────────────────────────────────────────────────
    if (!accessToken) {
        return (
            <div className="mx-auto max-w-md py-16 text-center">
                <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground/40" />
                <h1 className="mt-4 text-2xl font-bold">Tu carrito está esperándote</h1>
                <p className="mt-2 text-muted-foreground">
                    Iniciá sesión para ver los productos que guardaste.
                </p>
                <Button asChild className="mt-6" size="lg">
                    <Link href="/api/auth/signin?callbackUrl=/cart">Iniciar sesión</Link>
                </Button>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-40" />
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-3 lg:col-span-2">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} className="h-28 w-full" />
                        ))}
                    </div>
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        );
    }

    // ── Carrito vacío ──────────────────────────────────────────────
    if (items.length === 0) {
        return (
            <div className="mx-auto max-w-md py-16 text-center">
                <div className="text-7xl">🛒</div>
                <h1 className="mt-4 text-2xl font-bold">Tu carrito está vacío</h1>
                <p className="mt-2 text-muted-foreground">
                    {success ?? 'Agregá productos para comenzar tu compra.'}
                </p>
                <Button asChild className="mt-6" size="lg">
                    <Link href="/">
                        Explorar catálogo
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>
        );
    }

    // ── Carrito con productos ──────────────────────────────────────
    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Carrito</h1>
                    <p className="text-muted-foreground">
                        {items.length} producto(s) en tu carrito
                    </p>
                </div>
                <Button variant="ghost" size="sm" onClick={clear}>
                    Vaciar carrito
                </Button>
            </div>

            {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
            )}
            {success && (
                <div className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">{success}</div>
            )}

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Lista de ítems */}
                <div className="space-y-3 lg:col-span-2">
                    {items.map((item) => (
                        <div
                            key={item.productId}
                            className="flex gap-4 rounded-2xl border bg-card p-3 shadow-sm"
                        >
                            <Link
                                href={`/products/${item.productId}`}
                                className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted"
                            >
                                {item.image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <span className="flex h-full w-full items-center justify-center text-2xl">
                                        🛍️
                                    </span>
                                )}
                            </Link>

                            <div className="flex flex-1 flex-col gap-1">
                                <Link
                                    href={`/products/${item.productId}`}
                                    className="line-clamp-2 text-sm font-medium hover:text-primary"
                                >
                                    {item.name}
                                </Link>
                                <span className="text-sm font-bold text-primary">
                                    {formatPrice(item.price)}
                                </span>

                                <div className="mt-auto flex items-center justify-between">
                                    <div className="inline-flex items-center rounded-lg border">
                                        <button
                                            type="button"
                                            aria-label="Disminuir"
                                            disabled={item.qty <= 1}
                                            onClick={() => changeQty(item.productId, item.qty - 1)}
                                            className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:bg-muted disabled:opacity-40"
                                        >
                                            <Minus className="h-3.5 w-3.5" />
                                        </button>
                                        <span className="w-9 text-center text-sm font-medium">
                                            {item.qty}
                                        </span>
                                        <button
                                            type="button"
                                            aria-label="Aumentar"
                                            disabled={item.qty >= item.stock}
                                            onClick={() => changeQty(item.productId, item.qty + 1)}
                                            className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:bg-muted disabled:opacity-40"
                                        >
                                            <Plus className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => remove(item.productId)}
                                        aria-label="Eliminar"
                                        className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="shrink-0 text-right">
                                <span className="text-sm font-semibold">
                                    {formatPrice(item.price * item.qty)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Resumen */}
                <div className="h-fit rounded-2xl border bg-card p-5 shadow-sm lg:sticky lg:top-40">
                    <h2 className="text-lg font-bold">Resumen del pedido</h2>
                    <dl className="mt-3 space-y-2 text-sm">
                        <div className="flex justify-between">
                            <dt className="text-muted-foreground">Subtotal</dt>
                            <dd className="font-medium">{formatPrice(subtotal)}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-muted-foreground">Envío</dt>
                            <dd className="font-medium">
                                {shipping === 0 ? (
                                    <span className="text-emerald-600">Gratis</span>
                                ) : (
                                    formatPrice(shipping)
                                )}
                            </dd>
                        </div>
                        <div className="flex justify-between border-t pt-2 text-base">
                            <dt className="font-semibold">Total</dt>
                            <dd className="font-extrabold text-primary">{formatPrice(total)}</dd>
                        </div>
                    </dl>

                    {shipping > 0 && (
                        <p className="mt-3 flex items-start gap-1.5 rounded-lg bg-muted/60 p-2.5 text-xs text-muted-foreground">
                            <Truck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                            Te faltan {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} para
                            envío gratis
                        </p>
                    )}

                    <Button
                        onClick={handleCheckout}
                        disabled={checkingOut}
                        size="lg"
                        className="mt-4 w-full gap-2"
                    >
                        {checkingOut ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Procesando...
                            </>
                        ) : (
                            <>
                                Finalizar compra
                                <ArrowRight className="h-4 w-4" />
                            </>
                        )}
                    </Button>
                    <p className="mt-3 text-center text-xs text-muted-foreground">
                        <Badge variant="success" className="mr-1">Seguro</Badge>
                        Al confirmar se creará tu pedido y se descontará el stock.
                    </p>
                </div>
            </div>
        </div>
    );
}
