'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { api, type Order, formatPrice } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Package } from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUS: Record<
    Order['status'],
    { label: string; badge: string; dot: string }
> = {
    pending: { label: 'Pendiente', badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
    paid: { label: 'Pagado', badge: 'bg-sky-100 text-sky-700', dot: 'bg-sky-500' },
    shipped: { label: 'Enviado', badge: 'bg-violet-100 text-violet-700', dot: 'bg-violet-500' },
    delivered: { label: 'Entregado', badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
    cancelled: { label: 'Cancelado', badge: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
};

export function OrdersClient() {
    const { data: session } = useSession();
    const accessToken = session?.accessToken;

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        if (!accessToken) return;
        setLoading(true);
        setError(null);
        try {
            const res = await api.getOrders(accessToken);
            setOrders(res.data);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Error al cargar órdenes');
        } finally {
            setLoading(false);
        }
    }, [accessToken]);

    useEffect(() => {
        if (accessToken) void load();
    }, [accessToken, load]);

    const fmtDate = (iso: string) =>
        new Date(iso).toLocaleDateString('es-AR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });

    if (!accessToken) {
        return (
            <div className="mx-auto max-w-md py-16 text-center">
                <Package className="mx-auto h-16 w-16 text-muted-foreground/40" />
                <h1 className="mt-4 text-2xl font-bold">Tus pedidos te esperan</h1>
                <p className="mt-2 text-muted-foreground">Iniciá sesión para ver tu historial.</p>
                <Button asChild className="mt-6" size="lg">
                    <Link href="/api/auth/signin?callbackUrl=/orders">Iniciar sesión</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Mis órdenes</h1>
                <p className="text-muted-foreground">Historial de tus compras.</p>
            </div>

            {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="space-y-4">
                    {Array.from({ length: 2 }).map((_, i) => (
                        <Skeleton key={i} className="h-40 w-full" />
                    ))}
                </div>
            ) : orders.length === 0 ? (
                <div className="mx-auto max-w-md rounded-2xl border border-dashed p-12 text-center">
                    <div className="text-6xl">📦</div>
                    <p className="mt-3 font-medium">Todavía no tenés órdenes</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Cuando compres algo, va a aparecer acá.
                    </p>
                    <Button asChild className="mt-5">
                        <Link href="/">Ir a comprar</Link>
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => {
                        const st = STATUS[order.status] ?? STATUS.pending;
                        return (
                            <div key={order.id} className="rounded-2xl border bg-card shadow-sm">
                                {/* Cabecera */}
                                <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-muted/30 px-5 py-3">
                                    <div className="flex items-center gap-3">
                                        <span className="font-semibold">
                                            Orden #{order.id.slice(0, 8)}
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            {fmtDate(order.createdAt)}
                                        </span>
                                    </div>
                                    <span
                                        className={cn(
                                            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
                                            st.badge,
                                        )}
                                    >
                                        <span className={cn('h-1.5 w-1.5 rounded-full', st.dot)} />
                                        {st.label}
                                    </span>
                                </div>

                                {/* Ítems */}
                                <div className="space-y-3 px-5 py-4">
                                    {order.items.map((item) => (
                                        <div
                                            key={item.productId}
                                            className="flex items-center gap-3"
                                        >
                                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                                                {item.image ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="flex h-full w-full items-center justify-center text-xl">
                                                        🛍️
                                                    </span>
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <Link
                                                    href={`/products/${item.productId}`}
                                                    className="block truncate text-sm font-medium hover:text-primary"
                                                >
                                                    {item.name}
                                                </Link>
                                                <span className="text-xs text-muted-foreground">
                                                    {item.qty} × {formatPrice(item.price)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Total */}
                                <div className="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-3">
                                    <span className="text-sm text-muted-foreground">
                                        {order.items.length} producto(s)
                                    </span>
                                    <div className="flex items-center gap-3">
                                        <Link
                                            href={`/orders/${order.id}`}
                                            className="text-sm font-semibold text-primary hover:underline"
                                        >
                                            Ver seguimiento →
                                        </Link>
                                        <span className="font-bold">
                                            Total:{' '}
                                            <span className="text-primary">
                                                {formatPrice(Number(order.total))}
                                            </span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
