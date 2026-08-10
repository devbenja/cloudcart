'use client';

import { useSession } from 'next-auth/react';
import { Boxes, CircleDollarSign, PackageCheck, ReceiptText, Users } from 'lucide-react';
import { formatPrice } from '@/lib/api';
import { StatCard } from '@/components/admin/stat-card';
import { useAdminStats } from '@/components/admin/use-admin-stats';

/**
 * Hero del home cuando el usuario logueado es admin: resumen en vivo de KPIs.
 * Reemplaza el hero de ofertas (orientado a clientes) sin tarjetas de navegación.
 */
export function AdminHero() {
    const { data: session } = useSession();
    const stats = useAdminStats();

    const firstName = session?.user?.name ?? session?.user?.email ?? 'Admin';

    return (
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-rose-600 to-violet-600 text-primary-foreground">
            <div className="absolute inset-0 opacity-15 [background-image:linear-gradient(rgba(255,255,255,.15)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.15)_1px,transparent_1px)] [background-size:28px_28px]" />
            <div className="relative space-y-6 p-6 sm:p-10">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div className="space-y-1">
                        <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">
                            Panel de administración
                        </span>
                        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                            Hola, {firstName}
                        </h1>
                        <p className="text-sm text-white/90">
                            Resumen en vivo de la tienda — todo al día.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                    <StatCard
                        label="Productos activos"
                        value={stats.loading ? '…' : stats.products}
                        icon={Boxes}
                        tone="pink"
                        loading={stats.loading}
                    />
                    <StatCard
                        label="Pedidos"
                        value={stats.loading ? '…' : stats.orders}
                        icon={ReceiptText}
                        tone="sky"
                        loading={stats.loading}
                    />
                    <StatCard
                        label="Pendientes"
                        value={stats.loading ? '…' : stats.pendingOrders}
                        icon={PackageCheck}
                        tone="amber"
                        loading={stats.loading}
                    />
                    <StatCard
                        label="Ingresos"
                        value={stats.loading ? '…' : formatPrice(stats.revenue)}
                        icon={CircleDollarSign}
                        tone="emerald"
                        loading={stats.loading}
                    />
                    <StatCard
                        label="Usuarios"
                        value={stats.loading ? '…' : stats.users}
                        icon={Users}
                        tone="violet"
                        loading={stats.loading}
                    />
                </div>
            </div>
        </section>
    );
}
