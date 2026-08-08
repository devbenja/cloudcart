'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { api, type Paginated, type Product } from '@/lib/api';
import { ProductCard } from '@/components/product-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X } from 'lucide-react';

const RESULTS_PER_PAGE = 12;

export function CatalogClient({ initial }: { initial: Paginated<Product> }) {
    const [products, setProducts] = useState<Product[]>(initial.data);
    const [categories, setCategories] = useState<string[]>([]);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [total, setTotal] = useState(initial.total);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Carga las categorías reales desde la API (no hardcodeadas)
    useEffect(() => {
        api.getCategories()
            .then(setCategories)
            .catch(() => setCategories([]));
    }, []);

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

    // Búsqueda en vivo con debounce (300ms)
    const handleSearchChange = (value: string) => {
        setSearch(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            load({ search: value, category });
        }, 300);
    };

    // Filtro por categoría: aplica de inmediato
    const handleCategoryChange = (value: string) => {
        setCategory(value);
        load({ search, category: value });
    };

    const resetFilters = () => {
        setSearch('');
        setCategory('');
        load({});
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
            <div className="flex flex-col gap-3 rounded-xl border bg-card p-4">
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
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                    >
                        <option value="">Todas las categorías</option>
                        {categories.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>
                    {hasFilters && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={resetFilters}
                        >
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

            {products.length === 0 && !loading ? (
                <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
                    No hay productos que coincidan con tu búsqueda.
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
