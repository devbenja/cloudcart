import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Truck, MapPin, Package } from 'lucide-react';
import { authOptions } from '@/lib/auth';
import { api, type Order } from '@/lib/api';
import { OrderDetailClient } from '@/components/order-detail-client';

interface Props {
    params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

export default async function OrderDetailPage({ params }: Props) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
        redirect('/api/auth/signin?callbackUrl=' + encodeURIComponent(`/orders/${id}`));
    }

    let order: Order;
    try {
        order = await api.getOrder(session.accessToken, id);
    } catch {
        notFound();
    }

    return (
        <div className="space-y-6">
            <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Link href="/orders" className="hover:text-primary">Mis pedidos</Link>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="font-medium text-foreground">Orden #{order.id.slice(0, 8)}</span>
            </nav>

            <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                <h1 className="text-2xl font-bold tracking-tight">
                    Detalle del pedido #{order.id.slice(0, 8)}
                </h1>
            </div>

            <OrderDetailClient order={order} accessToken={session.accessToken} />
        </div>
    );
}
