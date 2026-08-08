'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { api, type Order } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const statusVariant: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
    pending: 'secondary',
    paid: 'default',
    shipped: 'default',
    delivered: 'outline',
    cancelled: 'destructive',
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

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Mis órdenes</h1>
                <p className="text-muted-foreground">Historial de tus compras.</p>
            </div>

            {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
            )}

            {loading ? (
                <div className="p-8 text-center text-muted-foreground">Cargando órdenes...</div>
            ) : orders.length === 0 ? (
                <Card>
                    <CardContent className="p-10 text-center text-muted-foreground">
                        Todavía no tenés órdenes.
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <Card key={order.id}>
                            <CardHeader className="flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-base">
                                    Orden #{order.id.slice(0, 8)}
                                </CardTitle>
                                <Badge variant={statusVariant[order.status] ?? 'secondary'}>
                                    {order.status}
                                </Badge>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex flex-wrap gap-2">
                                    {order.items.map((item) => (
                                        <div
                                            key={item.productId}
                                            className="rounded-lg border px-3 py-1.5 text-sm"
                                        >
                                            <span className="font-medium">{item.name}</span>
                                            <span className="text-muted-foreground">
                                                {' '}
                                                × {item.qty} — ${(item.price * item.qty).toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">{fmtDate(order.createdAt)}</span>
                                    <span
                                        className={cn('text-base font-semibold')}
                                    >
                                        Total: ${Number(order.total).toFixed(2)}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
