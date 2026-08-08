import type { Metadata } from 'next';
import { CatalogClient } from '@/components/catalog-client';
import { api } from '@/lib/api';

export const metadata: Metadata = {
    title: 'Catálogo',
    description: 'Explora el catálogo de CloudCart',
};

export const dynamic = 'force-dynamic';

export default async function CatalogPage() {
    // Server component: la data se obtiene en el servidor (público, sin token)
    const initial = await api.getProducts({ page: 1, limit: 12 });

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Catálogo</h1>
                <p className="text-muted-foreground">
                    Explora los productos disponibles en la tienda.
                </p>
            </div>
            <CatalogClient initial={initial} />
        </div>
    );
}
