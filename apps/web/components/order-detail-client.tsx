'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MapPin, Truck, CheckCircle2, Circle, Package, CreditCard, Loader2 } from 'lucide-react';
import { api, type Order, type OrderEvent, formatPrice } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface Props {
    order: Order;
    accessToken: string;
}

const STATUS_LABEL: Record<Order['status'], { label: string; badge: string; dot: string }> = {
    pending: { label: 'Pendiente', badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300', dot: 'bg-amber-500' },
    paid: { label: 'Pagado', badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300', dot: 'bg-blue-500' },
    shipped: { label: 'Enviado', badge: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300', dot: 'bg-violet-500' },
    delivered: { label: 'Entregado', badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300', dot: 'bg-emerald-500' },
    cancelled: { label: 'Cancelado', badge: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300', dot: 'bg-red-500' },
};

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function OrderDetailClient({ order: initialOrder, accessToken }: Props) {
    const [order, setOrder] = useState<Order>(initialOrder);
    const [street, setStreet] = useState(order.shippingAddress?.street ?? '');
    const [city, setCity] = useState(order.shippingAddress?.city ?? '');
    const [state, setState] = useState(order.shippingAddress?.state ?? '');
    const [zip, setZip] = useState(order.shippingAddress?.zip ?? '');
    const [country, setCountry] = useState(order.shippingAddress?.country ?? '');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [paying, setPaying] = useState(false);
    const [payError, setPayError] = useState<string | null>(null);

    const status = STATUS_LABEL[order.status];

    async function handlePayNow() {
        setPaying(true);
        setPayError(null);
        try {
            const { url } = await api.createCheckoutSession(accessToken, order.id);
            window.location.href = url;
        } catch (err) {
            setPayError(err instanceof Error ? err.message : 'Error al iniciar el pago');
            setPaying(false);
        }
    }
    const events: OrderEvent[] = order.events ?? [];
    const timeline = events.length > 0
        ? events
        : [{ status: order.status, at: order.createdAt, note: 'Orden creada' }];

    async function handleSaveShipping(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setSaved(false);
        setError(null);
        try {
            const updated = await api.updateShipping(accessToken, order.id, {
                shippingAddress: { street, city, state, zip, country },
            });
            setOrder(updated);
            setSaved(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al guardar la dirección');
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="grid gap-6 lg:grid-cols-3">
            {/* Columna principal: items + timeline */}
            <div className="space-y-6 lg:col-span-2">
                <div className="rounded-lg border p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Package className="h-4 w-4 text-primary" />
                        <h2 className="font-semibold">Productos</h2>
                    </div>
                    <div className="space-y-3">
                        {order.items.map((item) => (
                            <div key={item.productId} className="flex items-center gap-3">
                                {item.image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={item.image} alt={item.name} className="h-14 w-14 rounded-md object-cover" />
                                ) : (
                                    <div className="flex h-14 w-14 items-center justify-center rounded-md bg-muted text-2xl">🛍️</div>
                                )}
                                <div className="flex-1">
                                    <Link href={`/products/${item.productId}`} className="text-sm font-medium hover:text-primary">
                                        {item.name}
                                    </Link>
                                    <p className="text-xs text-muted-foreground">
                                        {item.qty} × {formatPrice(item.price)}
                                    </p>
                                </div>
                                <span className="text-sm font-semibold">
                                    {formatPrice(item.price * item.qty)}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t pt-3">
                        <span className="font-medium">Total</span>
                        <span className="text-lg font-bold">{formatPrice(Number(order.total))}</span>
                    </div>
                </div>

                {/* Timeline */}
                <div className="rounded-lg border p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Truck className="h-4 w-4 text-primary" />
                        <h2 className="font-semibold">Seguimiento</h2>
                        <Badge className={cn('ml-auto', status.badge)}>
                            <span className={cn('mr-1.5 inline-block h-2 w-2 rounded-full', status.dot)} />
                            {status.label}
                        </Badge>
                    </div>

                    <ol className="relative space-y-6 border-l-2 border-muted pl-6">
                        {timeline.map((ev, i) => (
                            <li key={i} className="relative">
                                <span
                                    className={cn(
                                        'absolute -left-[31px] flex h-5 w-5 items-center justify-center rounded-full ring-4 ring-background',
                                        i === timeline.length - 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                                    )}
                                >
                                    {i === timeline.length - 1 ? (
                                        <CheckCircle2 className="h-3 w-3" />
                                    ) : (
                                        <Circle className="h-2.5 w-2.5" />
                                    )}
                                </span>
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-sm font-medium capitalize">{ev.status}</span>
                                    <span className="text-xs text-muted-foreground">{formatDate(ev.at)}</span>
                                </div>
                                {ev.note && <p className="text-xs text-muted-foreground mt-0.5">{ev.note}</p>}
                            </li>
                        ))}
                    </ol>

                    {(order.trackingNumber || order.carrier) && (
                        <div className="mt-4 rounded-md bg-muted px-4 py-3 text-sm">
                            <p className="font-medium">Envío</p>
                            {order.carrier && <p className="text-muted-foreground">Transporte: {order.carrier}</p>}
                            {order.trackingNumber && (
                                <p className="text-muted-foreground">
                                    N° de seguimiento: <span className="font-mono text-foreground">{order.trackingNumber}</span>
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Columna lateral: pago */}
            <div className="space-y-6">
                <div className="rounded-lg border p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <CreditCard className="h-4 w-4 text-primary" />
                        <h2 className="font-semibold">Pago</h2>
                    </div>
                    {order.status === 'pending' ? (
                        <div className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                                Tu pedido está pendiente de pago. Completá el pago para
                                que comience el procesamiento.
                            </p>
                            <Button onClick={handlePayNow} disabled={paying} className="w-full">
                                {paying ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Redirigiendo...
                                    </>
                                ) : (
                                    'Pagar ahora'
                                )}
                            </Button>
                            {payError && <p className="text-xs text-destructive">{payError}</p>}
                        </div>
                    ) : (
                        <div className="text-sm text-muted-foreground space-y-1">
                            <p className="flex items-center gap-2">
                                <span className={cn('inline-block h-2 w-2 rounded-full', status.dot)} />
                                {status.label}
                            </p>
                            {order.paymentMethod && (
                                <p>Método: {order.paymentMethod}</p>
                            )}
                            {order.paymentId && (
                                <p className="break-all font-mono text-xs">ID: {order.paymentId}</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Dirección de envío */}
                <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2 mb-4">
                    <MapPin className="h-4 w-4 text-primary" />
                    <h2 className="font-semibold">Dirección de envío</h2>
                </div>

                {order.shippingAddress && !saved ? (
                    <div className="text-sm text-muted-foreground mb-4">
                        <p>{order.shippingAddress.street}</p>
                        <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
                        <p>{order.shippingAddress.country}</p>
                    </div>
                ) : null}

                {(!order.shippingAddress || saved) && (
                <form onSubmit={handleSaveShipping} className="space-y-3">
                    <Input
                        placeholder="Calle y número"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        required
                    />
                    <Input
                        placeholder="Ciudad"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                    />
                    <div className="grid grid-cols-2 gap-3">
                        <Input
                            placeholder="Provincia"
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            required
                        />
                        <Input
                            placeholder="Código postal"
                            value={zip}
                            onChange={(e) => setZip(e.target.value)}
                            required
                        />
                    </div>
                    <Input
                        placeholder="País (ej. AR)"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        required
                        maxLength={3}
                    />
                    {error && <p className="text-xs text-destructive">{error}</p>}
                    {saved && <p className="text-xs text-emerald-600">✓ Dirección guardada</p>}
                    <Button type="submit" className="w-full" disabled={saving}>
                        {saving ? 'Guardando...' : 'Guardar dirección'}
                    </Button>
                </form>
                )}
                </div>
            </div>
        </div>
    );
}
