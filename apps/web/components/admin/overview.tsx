'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { ArrowRight, Boxes, ReceiptText, Users } from 'lucide-react';
import { formatPrice } from '@/lib/api';
import { StatCard } from '@/components/admin/stat-card';
import { useAdminStats } from '@/components/admin/use-admin-stats';
import { Button } from '@/components/ui/button';

/** Vista "Resumen" del panel admin: KPIs + accesos rápidos a cada sección. */
export function Overview() {
    const { data: session } = useSession();
    const stats = useAdminStats();

    const firstName = session?.user?.name ?? session?.user?.email ?? 'Admin';

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h1 className="text-2xl font-extrabold tracking-tight">Resumen</h1>
                <p className="text-sm text-muted-foreground">
                    Hola {firstName}, este es el estado actual de la tienda.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                <StatCard label="Productos" value={stats.products} icon={Boxes} tone="pink" loading={stats.loading} />
                <StatCard label="Pedidos" value={stats.orders} icon={ReceiptText} tone="sky" loading={stats.loading} />
                <StatCard
                    label="Pendientes"
                    value={stats.pendingOrders}
                    icon={ReceiptText}
                    tone="amber"
                    loading={stats.loading}
                />
                <StatCard
                    label="Ingresos"
                    value={formatPrice(stats.revenue)}
                    icon={ReceiptText}
                    tone="emerald"
                    loading={stats.loading}
                />
                <StatCard label="Usuarios" value={stats.users} icon={Users} tone="violet" loading={stats.loading} />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
                {[
                    { href: '/dashboard/products', label: 'Productos', desc: 'Crear y editar el catálogo', icon: Boxes },
                    { href: '/dashboard/orders', label: 'Pedidos', desc: 'Cambiar estado y hacer seguimiento', icon: ReceiptText },
                    { href: '/dashboard/users', label: 'Usuarios', desc: 'Administrar cuentas', icon: Users },
                ].map(({ href, label, desc, icon: Icon }) => (
                    <Link
                        key={href}
                        href={href}
                        className="group rounded-2xl border bg-card p-5 shadow-sm transition hover:shadow-md"
                    >
                        <div className="flex items-center justify-between">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <Icon className="h-5 w-5" />
                            </span>
                            <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
                        </div>
                        <p className="mt-3 font-semibold">{label}</p>
                        <p className="text-sm text-muted-foreground">{desc}</p>
                    </Link>
                ))}
            </div>

            <Button asChild variant="outline" size="sm">
                <Link href="/">← Volver a la tienda</Link>
            </Button>
        </div>
    );
}
