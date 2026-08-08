import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { DashboardClient } from '@/components/dashboard-client';

export const metadata: Metadata = {
    title: 'Dashboard',
};

export const dynamic = 'force-dynamic';

export default async function DashboardPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>;
}) {
    const session = await getServerSession(authOptions);

    // Sin sesión → el middleware redirige, pero doble check server-side
    if (!session?.user) {
        redirect('/api/auth/signin?callbackUrl=/dashboard');
    }

    // Solo admin puede ver el dashboard
    const roles = session.user.roles ?? [];
    if (!roles.includes('admin')) {
        redirect('/?error=forbidden');
    }

    return <DashboardClient />;
}
