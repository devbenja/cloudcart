import { OrdersAdmin } from '@/components/admin/orders-admin';

export const metadata = {
    title: 'Pedidos',
};

export const dynamic = 'force-dynamic';

export default async function DashboardOrdersPage() {
    return <OrdersAdmin />;
}
