import { Overview } from '@/components/admin/overview';

export const metadata = {
    title: 'Resumen',
};

export const dynamic = 'force-dynamic';

export default async function DashboardOverviewPage() {
    // La protección admin la maneja app/dashboard/layout.tsx (requireAdmin).
    return <Overview />;
}
