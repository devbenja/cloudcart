'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { ShoppingCart } from 'lucide-react';

export function CartLink() {
    const { data: session, status } = useSession();
    const [count, setCount] = useState(0);

    const refresh = useCallback(() => {
        if (status !== 'authenticated' || !session?.accessToken) return;
        api.getCart(session.accessToken)
            .then((c) => {
                setCount(c.items.reduce((acc, i) => acc + i.qty, 0));
            })
            .catch(() => {
                /* carrito puede no existir aún */
            });
    }, [status, session?.accessToken]);

    useEffect(() => {
        refresh();
        // Se actualiza en vivo cuando un componente agrega/quita ítems
        window.addEventListener('cart-updated', refresh);
        return () => {
            window.removeEventListener('cart-updated', refresh);
        };
    }, [refresh]);

    return (
        <Link
            href="/cart"
            className="relative flex h-10 items-center gap-2 rounded-lg px-2.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label={`Carrito con ${count} producto(s)`}
        >
            <ShoppingCart className="h-5 w-5" />
            <span className="hidden text-sm font-medium xl:block">Carrito</span>
            {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground ring-2 ring-background">
                    {count}
                </span>
            )}
        </Link>
    );
}
