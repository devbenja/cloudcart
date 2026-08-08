'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { api, type Cart } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';

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

    const changeQty = async (productId: string, qty: number) => {
        if (!accessToken) return;
        try {
            setCart(await api.updateCartItem(accessToken, productId, qty));
            setError(null);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Error');
        }
    };

    const remove = async (productId: string) => {
        if (!accessToken) return;
        try {
            setCart(await api.removeCartItem(accessToken, productId));
            setError(null);
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
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Error al procesar la compra');
        } finally {
            setCheckingOut(false);
        }
    };

    const total = (cart?.items ?? []).reduce(
        (acc, i) => acc + i.price * i.qty,
        0,
    );

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Carrito</h1>
                <p className="text-muted-foreground">Revisá tus productos antes de comprar.</p>
            </div>

            {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
            )}
            {success && (
                <div className="rounded-md bg-green-600/10 p-3 text-sm text-green-700">{success}</div>
            )}

            {loading ? (
                <div className="p-8 text-center text-muted-foreground">Cargando carrito...</div>
            ) : !cart || cart.items.length === 0 ? (
                <Card>
                    <CardContent className="p-10 text-center text-muted-foreground">
                        Tu carrito está vacío.
                        <div className="mt-4">
                            <Link href="/">
                                <Button>Ir al catálogo</Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                    {/* Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">
                                {cart.items.length}{' '}
                                {cart.items.length === 1 ? 'producto' : 'productos'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {cart.items.map((item) => (
                                <div
                                    key={item.productId}
                                    className="flex items-center justify-between gap-4 rounded-lg border p-3"
                                >
                                    <div className="min-w-0">
                                        <p className="truncate font-medium">{item.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            ${item.price.toFixed(2)} c/u
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            min={1}
                                            max={item.stock}
                                            value={item.qty}
                                            onChange={(e) =>
                                                changeQty(
                                                    item.productId,
                                                    Number(e.target.value),
                                                )
                                            }
                                            className="w-16"
                                        />
                                        <span className="text-sm text-muted-foreground w-14 text-right">
                                            ${(item.price * item.qty).toFixed(2)}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => remove(item.productId)}
                                            aria-label={`Quitar ${item.name}`}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Resumen */}
                    <Card className="h-fit">
                        <CardHeader>
                            <CardTitle className="text-lg">Resumen</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Envío</span>
                                <span>Grátis</span>
                            </div>
                            <div className="flex justify-between border-t pt-2 text-base font-semibold">
                                <span>Total</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-2">
                            <Button
                                className="w-full"
                                onClick={handleCheckout}
                                disabled={checkingOut || cart.items.length === 0}
                            >
                                {checkingOut ? 'Procesando...' : 'Finalizar compra'}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full"
                                onClick={clear}
                            >
                                Vaciar carrito
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}
        </div>
    );
}
