'use client';

import { useCallback, useState } from 'react';
import { api, type Paginated, type Product } from '@/lib/api';
import { ProductCard } from '@/components/product-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function CatalogClient({ initial }: { initial: Paginated<Product> }) {
    const [products, setProducts] = useState<Product[]>(initial.data);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async (query: { search?: string; category?: string }) => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.getProducts({
                page: 1,
                limit: 24,
                ...query,
            });
            setProducts(res.data);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Error al cargar productos');
        } finally {
            setLoading(false);
        }
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        load({ search, category: category || undefined });
    };

    return (
        <div className="space-y-6">
            <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
                <Input
                    placeholder="Buscar productos..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="sm:max-w-xs"
                />
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="h-9 rounded-md border border-input bg-transparent px-3 text-sm sm:max-w-[160px]"
                >
                    <option value="">Todas las categorías</option>
                    <option value="footwear">Calzado</option>
                    <option value="electronics">Electrónica</option>
                    <option value="books">Libros</option>
                    <option value="test">Test</option>
                </select>
                <Button type="submit" disabled={loading}>
                    {loading ? 'Buscando...' : 'Buscar'}
                </Button>
            </form>

            {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                </div>
            )}

            {products.length === 0 ? (
                <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
                    No hay productos que coincidan con tu búsqueda.
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
