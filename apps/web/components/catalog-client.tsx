'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, type Paginated, type Product } from '@/lib/api';
import { ProductCard } from '@/components/product-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, X } from 'lucide-react';

const RESULTS_PER_PAGE = 12;

interface Props {
    initial: Paginated<Product>;
    categories: string[];
    initialSearch?: string;
    initialCategory?: string;
}

export function CatalogClient({
    initial,
    categories,
    initialSearch = '',
    initialCategory = '',
}: Props) {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>(initial.data);
    const [search, setSearch] = useState(initialSearch);
    const [category, setCategory] = useState(initialCategory);
    const [total, setTotal] = useState(initial.total);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const load = useCallback(
        async (query: { search?: string; category?: string; page?: number }) => {
            setLoading(true);
            setError(null);
            try {
                const res = await api.getProducts({
                    page: query.page ?? 1,
                    limit: RESULTS_PER_PAGE,
                    search: query.search || undefined,
                    category: query.category || undefined,
                });
                setProducts(res.data);
                setTotal(res.total);
            } catch (e) {
                setError(e instanceof Error ? e.message : 'Error al cargar productos');
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    // Sincroniza la URL con los filtros (para compartir links y volver atrás)
    const syncUrl = (s: string, c: string) => {
        const params = new URLSearchParams();
        if (s) params.set('search', s);
        if (c) params.set('category', c);
        const qs = params.toString();
        router.replace(qs ? `/?${qs}` : '/', { scroll: false });
    };

    const handleSearchChange = (value: string) => {
        setSearch(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            load({ search: value, category });
            syncUrl(value, category);
        }, 300);
    };

    const handleCategoryChange = (value: string) => {
        setCategory(value);
        load({ search, category: value });
        syncUrl(search, value);
    };

    const resetFilters = () => {
        setSearch('');
        setCategory('');
        load({});
        syncUrl('', '');
    };

    const hasFilters = search !== '' || category !== '';

    useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, []);

    return (
        <div className="space-y-6">
            {/* Barra de filtros */}
            <div className="flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nombre o descripción..."
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <select
                        value={category}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
                    >
                        <option value="">Todas las categorías</option>
                        {categories.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>
                    {hasFilters && (
                        <Button type="button" variant="ghost" size="sm" onClick={resetFilters}>
                            <X className="h-4 w-4" />
                            Limpiar
                        </Button>
                    )}
                </div>
                {hasFilters && (
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Filtros activos:</span>
                        {search && <Badge variant="secondary">búsqueda: "{search}"</Badge>}
                        {category && <Badge variant="secondary">{category}</Badge>}
                        <span className="ml-auto text-muted-foreground">
                            {loading ? 'Buscando...' : `${total} resultado(s)`}
                        </span>
                    </div>
                )}
            </div>

            {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="space-y-3 rounded-2xl border p-4">
                            <Skeleton className="h-40 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    ))}
                </div>
            ) : products.length === 0 ? (
                <div className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground">
                    <p className="text-4xl">🔍</p>
                    <p className="mt-2">No hay productos que coincidan con tu búsqueda.</p>
                    {hasFilters && (
                        <div className="mt-2">
                            <Button variant="link" onClick={resetFilters}>
                                Limpiar filtros
                            </Button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {products.map((p) => (
                        <ProductCard key={p._id} product={p} />
                    ))}
                </div>
            )}
        </div>
    );
}
