import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { OrdersClient } from '@/components/orders-client';

export const metadata: Metadata = {
    title: 'Mis órdenes',
};

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect('/api/auth/signin?callbackUrl=/orders');
    }
    return <OrdersClient />;
}
