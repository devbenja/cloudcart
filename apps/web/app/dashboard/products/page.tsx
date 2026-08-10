import { ProductsAdmin } from '@/components/admin/products-admin';

export const metadata = {
    title: 'Productos',
};

export const dynamic = 'force-dynamic';

export default async function DashboardProductsPage() {
    return <ProductsAdmin />;
}
