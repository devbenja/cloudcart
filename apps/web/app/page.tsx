import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Flame } from 'lucide-react';
import { CatalogClient } from '@/components/catalog-client';
import { CategoryTiles } from '@/components/category-tiles';
import { ProductCard } from '@/components/product-card';
import { api, type Product } from '@/lib/api';

export const metadata: Metadata = {
    title: 'Inicio',
    description: 'Marketplace moderno — explora ofertas, novedades y el catálogo',
};

export const dynamic = 'force-dynamic';

interface Props {
    searchParams: Promise<{ search?: string; category?: string }>;
}

export default async function CatalogPage({ searchParams }: Props) {
    const params = await searchParams;
    const initialSearch = typeof params.search === 'string' ? params.search : '';
    const initialCategory =
        typeof params.category === 'string' ? params.category : '';

    const [categories, initial, all] = await Promise.all([
        api.getCategories().catch(() => [] as string[]),
        api.getProducts({
            page: 1,
            limit: 12,
            search: initialSearch || undefined,
            category: initialCategory || undefined,
        }),
        api.getProducts({ page: 1, limit: 100 }),
    ]);

    // Ofertas del día: productos con precio original (descuento)
    const deals = all.data.filter((p) => p.originalPrice).slice(0, 8);

    return (
        <div className="space-y-10">
            {/* Hero */}
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary via-rose-500 to-fuchsia-500 text-primary-foreground">
                <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_20%_50%,white_2px,transparent_2px)] [background-size:32px_32px]" />
                <div className="relative grid gap-6 p-8 sm:p-12 lg:grid-cols-2 lg:items-center">
                    <div className="space-y-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">
                            <Flame className="h-3.5 w-3.5" />
                            Temporada de ofertas
                        </span>
                        <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
                            Todo lo que necesitás,
                            <br />
                            a precios que enamoran
                        </h1>
                        <p className="max-w-md text-sm text-white/90 sm:text-base">
                            Hasta <strong>38% OFF</strong> en miles de productos.
                            Envío gratis en compras +$50.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Link
                                href="/#ofertas"
                                className="inline-flex items-center gap-1.5 rounded-full bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-white"
                            >
                                Ver ofertas
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <Link
                                href="/#catalogo"
                                className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-5 py-2.5 text-sm font-semibold backdrop-blur transition hover:bg-white/30"
                            >
                                Explorar catálogo
                            </Link>
                        </div>
                    </div>
                    <div className="hidden lg:block">
                        <div className="mx-auto flex h-52 w-52 rotate-6 items-center justify-center rounded-3xl bg-white/15 text-7xl shadow-xl backdrop-blur transition hover:rotate-3">
                            🛍️
                        </div>
                    </div>
                </div>
            </section>

            {/* Tiles de categorías */}
            <CategoryTiles categories={categories} />

            {/* Ofertas del día */}
            {deals.length > 0 && (
                <section id="ofertas">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight">
                            <Flame className="h-5 w-5 text-primary" />
                            Ofertas del día
                        </h2>
                        <Link
                            href="/#catalogo"
                            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                        >
                            Ver todo el catálogo
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {deals.map((p: Product) => (
                            <ProductCard key={p._id} product={p} />
                        ))}
                    </div>
                </section>
            )}

            {/* Catálogo completo */}
            <section id="catalogo" className="space-y-4">
                <h2 className="text-lg font-bold tracking-tight">
                    {initialSearch || initialCategory
                        ? 'Resultados de búsqueda'
                        : 'Catálogo completo'}
                </h2>
                <CatalogClient
                    initial={initial}
                    categories={categories}
                    initialSearch={initialSearch}
                    initialCategory={initialCategory}
                />
            </section>
        </div>
    );
}
