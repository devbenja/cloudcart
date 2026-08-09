import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Truck, MapPin, Package, CheckCircle2, XCircle } from 'lucide-react';
import { authOptions } from '@/lib/auth';
import { api, type Order } from '@/lib/api';
import { OrderDetailClient } from '@/components/order-detail-client';

interface Props {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ paid?: string; cancelled?: string }>;
}

export const dynamic = 'force-dynamic';

export default async function OrderDetailPage({ params, searchParams }: Props) {
    const { id } = await params;
    const { paid, cancelled } = await searchParams;
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

            {paid === '1' && (
                <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    ¡Pago confirmado! Tu pedido ya está en proceso.
                </div>
            )}

            {cancelled === '1' && (
                <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300">
                    <XCircle className="h-4 w-4 shrink-0" />
                    El pago fue cancelado. Podés intentarlo de nuevo con «Pagar ahora».
                </div>
            )}

            <OrderDetailClient order={order} accessToken={session.accessToken} />
        </div>
    );
}
