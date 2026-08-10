import type { ReactNode } from 'react';
import { requireAdmin } from '@/lib/server-auth';
import { Sidebar } from '@/components/admin/sidebar';

export const metadata = {
    title: 'Dashboard',
};

export const dynamic = 'force-dynamic';

/**
 * Layout del panel admin: protege toda la ruta /dashboard (solo admin)
 * y monta la navegación lateral + el contenido de cada sub-ruta.
 */
export default async function DashboardLayout({ children }: { children: ReactNode }) {
    await requireAdmin();

    return (
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
            <Sidebar />
            <main className="min-w-0 flex-1">{children}</main>
        </div>
    );
}
