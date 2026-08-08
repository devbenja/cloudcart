'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { ShoppingCart } from 'lucide-react';

export function CartLink() {
    const { data: session, status } = useSession();
    const [count, setCount] = useState(0);

    useEffect(() => {
        let active = true;
        if (status === 'authenticated' && session?.accessToken) {
            api.getCart(session.accessToken)
                .then((c) => {
                    if (active) setCount(c.items.reduce((acc, i) => acc + i.qty, 0));
                })
                .catch(() => {
                    /* carrito puede no existir aún */
                });
        }
        return () => {
            active = false;
        };
    }, [status, session?.accessToken]);

    return (
        <Link
            href="/cart"
            className="relative flex items-center text-muted-foreground hover:text-foreground"
            aria-label="Carrito"
        >
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                    {count}
                </span>
            )}
        </Link>
    );
}
