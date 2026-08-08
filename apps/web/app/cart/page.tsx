import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { CartClient } from '@/components/cart-client';

export const metadata: Metadata = {
    title: 'Carrito',
};

export const dynamic = 'force-dynamic';

export default async function CartPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect('/api/auth/signin?callbackUrl=/cart');
    }
    return <CartClient />;
}
