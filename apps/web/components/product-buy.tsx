'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { api, type Product } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Check } from 'lucide-react';

export function ProductBuy({ product }: { product: Product }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [qty, setQty] = useState(1);
    const [loading, setLoading] = useState(false);
    const [added, setAdded] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const outOfStock = product.stock <= 0;

    const handleAdd = async () => {
        if (outOfStock) return;

        // Sin sesión → redirige al login (vuelve a esta página)
        if (!session?.accessToken) {
            router.push(`/api/auth/signin?callbackUrl=/products/${product._id}`);
            return;
        }

        setLoading(true);
        setError(null);
        setAdded(false);
        try {
            await api.addCartItem(session.accessToken, product._id, qty);
            setAdded(true);
            router.refresh();
            window.dispatchEvent(new Event('cart-updated'));
            setTimeout(() => setAdded(false), 2500);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Error al agregar al carrito');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-3">
                <label htmlFor="qty" className="text-sm text-muted-foreground">
                    Cantidad
                </label>
                <Input
                    id="qty"
                    type="number"
                    min={1}
                    max={Math.max(product.stock, 1)}
                    value={qty}
                    onChange={(e) =>
                        setQty(Math.max(1, Number(e.target.value) || 1))
                    }
                    disabled={outOfStock}
                    className="w-20"
                />
                {product.stock > 0 && (
                    <span className="text-xs text-muted-foreground">
                        (máx. {product.stock})
                    </span>
                )}
            </div>

            {error && (
                <div className="rounded-md bg-destructive/10 p-2.5 text-sm text-destructive">
                    {error}
                </div>
            )}

            <Button
                className="w-full sm:w-auto"
                onClick={handleAdd}
                disabled={loading || outOfStock}
            >
                {added ? (
                    <>
                        <Check className="h-4 w-4" />
                        ¡Agregado!
                    </>
                ) : (
                    <>
                        <ShoppingCart className="h-4 w-4" />
                        {loading
                            ? 'Agregando...'
                            : outOfStock
                              ? 'Agotado'
                              : `Agregar al carrito — $${(product.price * qty).toFixed(2)}`}
                    </>
                )}
            </Button>

            {added && (
                <Link
                    href="/cart"
                    className="inline-block text-sm text-primary hover:underline"
                >
                    Ver carrito →
                </Link>
            )}

            {status === 'unauthenticated' && (
                <p className="text-xs text-muted-foreground">
                    Necesitás iniciar sesión para comprar.
                </p>
            )}
        </div>
    );
}
