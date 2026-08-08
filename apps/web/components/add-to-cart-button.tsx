'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';

export function AddToCartButton({ productId }: { productId: string }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const handleClick = async () => {
        // Sin sesión → redirige al login (el callback vuelve a esta página)
        if (!session?.accessToken) {
            router.push('/api/auth/signin?callbackUrl=/');
            return;
        }

        setLoading(true);
        setMessage(null);
        try {
            await api.addCartItem(session.accessToken, productId, 1);
            setMessage('✓ Agregado al carrito');
            router.refresh();
        } catch (e) {
            setMessage(e instanceof Error ? e.message : 'Error al agregar');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-1">
            <Button
                size="sm"
                onClick={handleClick}
                disabled={loading}
                className="w-full"
            >
                <ShoppingCart className="h-4 w-4" />
                {loading ? 'Agregando...' : 'Agregar'}
            </Button>
            {message && (
                <span className="text-xs text-muted-foreground">{message}</span>
            )}
        </div>
    );
}
