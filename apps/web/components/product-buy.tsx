'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { api, type Product } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Check, Zap, Minus, Plus } from 'lucide-react';

export function ProductBuy({ product }: { product: Product }) {
    const { data: session } = useSession();
    const router = useRouter();
    const [qty, setQty] = useState(1);
    const [loading, setLoading] = useState(false);
    const [added, setAdded] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const outOfStock = product.stock <= 0;
    const maxQty = Math.min(product.stock, 99);

    /** Asegura sesión o redirige a login volviendo a esta página. */
    const requireSession = (): string | null => {
        if (session?.accessToken) return session.accessToken;
        router.push(`/api/auth/signin?callbackUrl=/products/${product._id}`);
        return null;
    };

    const add = async (): Promise<boolean> => {
        const token = requireSession();
        if (!token) return false;
        setLoading(true);
        setError(null);
        setAdded(false);
        try {
            await api.addCartItem(token, product._id, qty);
            setAdded(true);
            window.dispatchEvent(new Event('cart-updated'));
            setTimeout(() => setAdded(false), 2500);
            return true;
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Error al agregar al carrito');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (outOfStock) return;
        await add();
        router.refresh();
    };

    const handleBuyNow = async () => {
        if (outOfStock) return;
        const ok = await add();
        if (ok) router.push('/cart');
    };

    return (
        <div className="space-y-4">
            {/* Selector de cantidad */}
            <div>
                <span className="mb-1.5 block text-sm text-muted-foreground">Cantidad</span>
                <div className="inline-flex items-center rounded-lg border">
                    <button
                        type="button"
                        aria-label="Disminuir cantidad"
                        disabled={qty <= 1}
                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                        className="flex h-10 w-10 items-center justify-center rounded-l-lg text-muted-foreground transition hover:bg-muted disabled:opacity-40"
                    >
                        <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-12 text-center text-sm font-semibold">{qty}</span>
                    <button
                        type="button"
                        aria-label="Aumentar cantidad"
                        disabled={qty >= maxQty}
                        onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                        className="flex h-10 w-10 items-center justify-center rounded-r-lg text-muted-foreground transition hover:bg-muted disabled:opacity-40"
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                    {product.stock > 0 ? (
                        <>
                            <span className="font-medium text-emerald-600">
                                {product.stock > 10 ? 'En stock' : `¡Solo quedan ${product.stock}!`}
                            </span>{' '}
                            — {product.stock} unidades disponibles
                        </>
                    ) : (
                        <span className="font-medium text-destructive">Agotado</span>
                    )}
                </p>
            </div>

            {error && (
                <p className="rounded-md bg-destructive/10 p-2.5 text-sm text-destructive">
                    {error}
                </p>
            )}

            <div className="space-y-2">
                <Button
                    onClick={handleAdd}
                    disabled={outOfStock || loading}
                    className="w-full gap-2"
                    size="lg"
                >
                    {added ? (
                        <>
                            <Check className="h-5 w-5" /> ¡Agregado!
                        </>
                    ) : (
                        <>
                            <ShoppingCart className="h-5 w-5" /> Agregar al carrito
                        </>
                    )}
                </Button>
                <Button
                    onClick={handleBuyNow}
                    disabled={outOfStock || loading}
                    variant="secondary"
                    size="lg"
                    className="w-full gap-2"
                >
                    <Zap className="h-5 w-5" />
                    Comprar ahora
                </Button>
            </div>
        </div>
    );
}
