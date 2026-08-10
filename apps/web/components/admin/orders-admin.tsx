'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
    api,
    formatPrice,
    ORDER_TRANSITIONS,
    type Order,
    type OrderStatus,
    type User,
} from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronDown, ChevronRight } from 'lucide-react';

const STATUS: Record<OrderStatus, { label: string; badge: string; dot: string }> = {
    pending: { label: 'Pendiente', badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
    paid: { label: 'Pagado', badge: 'bg-sky-100 text-sky-700', dot: 'bg-sky-500' },
    shipped: { label: 'Enviado', badge: 'bg-violet-100 text-violet-700', dot: 'bg-violet-500' },
    delivered: { label: 'Entregado', badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
    cancelled: { label: 'Cancelado', badge: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
};

export function OrdersAdmin() {
    const { data: session } = useSession();
    const accessToken = session?.accessToken;

    const [orders, setOrders] = useState<Order[]>([]);
    const [usersByKeycloak, setUsersByKeycloak] = useState<Map<string, User>>(new Map());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [expanded, setExpanded] = useState<string | null>(null);
    const [pendingStatus, setPendingStatus] = useState<Record<string, OrderStatus>>({});
    const [saving, setSaving] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');

    const load = useCallback(async () => {
        if (!accessToken) return;
        setLoading(true);
        setError(null);
        try {
            const [ordersRes, usersRes] = await Promise.all([
                api.getOrders(accessToken),
                // Best-effort: resuelve el email del dueño vía la tabla de usuarios
                api.getUsers(accessToken).catch(() => null),
            ]);
            setOrders(ordersRes.data);
            if (usersRes) {
                setUsersByKeycloak(
                    new Map(
                        usersRes.data
                            .filter((u) => u.keycloakId)
                            .map((u) => [u.keycloakId!, u]),
                    ),
                );
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Error al cargar pedidos');
        } finally {
            setLoading(false);
        }
    }, [accessToken]);

    useEffect(() => {
        if (accessToken) void load();
    }, [accessToken, load]);

    // Filtro client-side: por id de orden (substring) y por estado
    const filteredOrders = useMemo(() => {
        const q = search.trim().toLowerCase();
        return orders.filter((o) => {
            const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
            const matchesSearch = !q || o.id.toLowerCase().includes(q);
            return matchesStatus && matchesSearch;
        });
    }, [orders, search, statusFilter]);

    const userLabel = (userId: string) => {
        const u = usersByKeycloak.get(userId);
        if (u) return `${u.firstName} ${u.lastName} (${u.email})`;
        return `#${userId.slice(0, 8)}`;
    };

    const fmtDate = (iso: string) =>
        new Date(iso).toLocaleDateString('es-AR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

    const handleStatus = async (id: string, status: OrderStatus) => {
        if (!accessToken) return;
        setSaving(id);
        setError(null);
        setMessage(null);
        try {
            await api.updateOrderStatus(accessToken, id, status);
            setMessage('Estado actualizado');
            await load();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Error al cambiar estado');
        } finally {
            setSaving(null);
        }
    };

    return (
        <div className="space-y-4">
            {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
            )}
            {message && (
                <div className="rounded-md bg-green-600/10 p-3 text-sm text-green-700">{message}</div>
            )}

            <div className="rounded-xl border bg-card">
                <div className="flex items-center justify-between border-b p-4">
                    <h2 className="text-lg font-semibold">Pedidos ({orders.length})</h2>
                    <p className="text-sm text-muted-foreground">
                        Cambiá el estado según la máquina de estados.
                    </p>
                </div>

                {/* Barra de búsqueda y filtro por estado */}
                <div className="flex flex-col gap-2 border-b p-4 sm:flex-row sm:items-center sm:gap-3">
                    <Input
                        type="search"
                        placeholder="Buscar por id de pedido..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="sm:max-w-xs"
                    />
                    <Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as 'all' | OrderStatus)}
                        className="sm:w-48"
                    >
                        <option value="all">Todos los estados</option>
                        <option value="pending">Pendiente</option>
                        <option value="paid">Pagado</option>
                        <option value="shipped">Enviado</option>
                        <option value="delivered">Entregado</option>
                        <option value="cancelled">Cancelado</option>
                    </Select>
                </div>

                {loading ? (
                    <div className="space-y-3 p-6">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                ) : orders.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">No hay pedidos aún.</div>
                ) : filteredOrders.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                        No se encontraron pedidos con ese filtro.
                    </div>
                ) : (
                    <ul className="divide-y">
                        {filteredOrders.map((order) => {
                            const s = STATUS[order.status];
                            const transitions = ORDER_TRANSITIONS[order.status];
                            const isOpen = expanded === order.id;
                            const itemsCount = order.items.reduce((acc, i) => acc + i.qty, 0);
                            return (
                                <li key={order.id}>
                                    <div className="flex flex-wrap items-center gap-3 p-4">
                                        <button
                                            type="button"
                                            onClick={() => setExpanded(isOpen ? null : order.id)}
                                            className="rounded-md p-1 text-muted-foreground hover:bg-muted"
                                            aria-label={isOpen ? 'Ocultar detalle' : 'Ver detalle'}
                                        >
                                            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                        </button>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold">Orden #{order.id.slice(0, 8)}</span>
                                                <span
                                                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${s.badge}`}
                                                >
                                                    <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                                                    {s.label}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {fmtDate(order.createdAt)} · {userLabel(order.userId)}
                                            </p>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {itemsCount} producto(s)
                                        </div>
                                        <div className="font-semibold">{formatPrice(Number(order.total))}</div>
                                        <div className="flex items-center gap-2">
                                            {transitions.length > 0 ? (
                                                <>
                                                    <select
                                                        value={pendingStatus[order.id] ?? transitions[0]}
                                                        onChange={(e) =>
                                                            setPendingStatus((m) => ({
                                                                ...m,
                                                                [order.id]: e.target.value as OrderStatus,
                                                            }))
                                                        }
                                                        className="rounded-md border bg-background px-2 py-1.5 text-sm"
                                                    >
                                                        {transitions.map((t) => (
                                                            <option key={t} value={t}>
                                                                → {STATUS[t].label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <Button
                                                        size="sm"
                                                        disabled={saving === order.id || !accessToken}
                                                        onClick={() =>
                                                            handleStatus(order.id, pendingStatus[order.id] ?? transitions[0])
                                                        }
                                                    >
                                                        {saving === order.id ? 'Guardando...' : 'Cambiar'}
                                                    </Button>
                                                </>
                                            ) : (
                                                <Badge variant="outline">Estado final</Badge>
                                            )}
                                        </div>
                                    </div>

                                    {isOpen && (
                                        <div className="space-y-3 border-t bg-muted/40 px-5 py-4">
                                            <ul className="space-y-1.5">
                                                {order.items.map((item) => (
                                                    <li key={item.productId} className="flex justify-between text-sm">
                                                        <span>
                                                            {item.qty} × {item.name}
                                                        </span>
                                                        <span className="text-muted-foreground">{formatPrice(item.price)}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                            {order.shippingAddress && (
                                                <p className="text-sm text-muted-foreground">
                                                    Envío a: {order.shippingAddress.street},{' '}
                                                    {order.shippingAddress.city},{' '}
                                                    {order.shippingAddress.state} {order.shippingAddress.zip} (
                                                    {order.shippingAddress.country})
                                                    {order.trackingNumber
                                                        ? ` · Tracking: ${order.trackingNumber}${
                                                              order.carrier ? ` (${order.carrier})` : ''
                                                          }`
                                                        : ''}
                                                </p>
                                            )}
                                            {order.events && order.events.length > 0 && (
                                                <ol className="space-y-1 text-sm">
                                                    {order.events.map((ev, i) => (
                                                        <li key={i} className="flex items-center gap-2">
                                                            <span
                                                                className={`h-1.5 w-1.5 rounded-full ${
                                                                    STATUS[ev.status]?.dot ?? 'bg-muted-foreground'
                                                                }`}
                                                            />
                                                            <span>{STATUS[ev.status]?.label ?? ev.status}</span>
                                                            <span className="text-muted-foreground">
                                                                {new Date(ev.at).toLocaleString('es-AR')}
                                                            </span>
                                                            {ev.note && (
                                                                <span className="text-muted-foreground">— {ev.note}</span>
                                                            )}
                                                        </li>
                                                    ))}
                                                </ol>
                                            )}
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}
