'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
    api,
    formatPrice,
    type CreateProductInput,
    type Product,
} from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';

/** Payload del form: todos los campos de CreateProductInput más isActive (lo acepta el backend). */
interface ProductPayload extends CreateProductInput {
    isActive: boolean;
}

interface FormState {
    name: string;
    description: string;
    price: string;
    originalPrice: string;
    rating: string;
    reviewCount: string;
    currency: string;
    category: string;
    stock: string;
    tags: string;
    attributes: string;
    images: string;
    isActive: string;
}

const emptyForm: FormState = {
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    rating: '',
    reviewCount: '',
    currency: 'USD',
    category: '',
    stock: '',
    tags: '',
    attributes: '{}',
    images: '',
    isActive: 'true',
};

/** Convierte "a, b ,c" en ['a', 'b', 'c'] descartando vacíos. */
const parseList = (value: string): string[] =>
    value
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

export function ProductsAdmin() {
    const { data: session } = useSession();
    const accessToken = session?.accessToken;

    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState<FormState>(emptyForm);
    const [editing, setEditing] = useState<Product | null>(null);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);

    // Categorías existentes para sugerir en el formulario (evita typos)
    useEffect(() => {
        api.getCategories()
            .then(setCategories)
            .catch(() => setCategories([]));
    }, []);

    const load = useCallback(async () => {
        if (!accessToken) return;
        setLoading(true);
        setError(null);
        try {
            const res = await api.getProducts({ page: 1, limit: 100 });
            setProducts(res.data);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Error al cargar productos');
        } finally {
            setLoading(false);
        }
    }, [accessToken]);

    useEffect(() => {
        if (accessToken) void load();
    }, [accessToken, load]);

    const handleField =
        (field: keyof FormState) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
            setForm((f) => ({ ...f, [field]: e.target.value }));
        };

    const resetForm = () => {
        setForm(emptyForm);
        setEditing(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!accessToken) return;
        setSaving(true);
        setError(null);
        setSuccess(null);
        try {
            let parsedAttributes: Record<string, unknown> = {};
            try {
                parsedAttributes = form.attributes.trim() ? JSON.parse(form.attributes) : {};
            } catch {
                throw new Error('El campo "Atributos (JSON)" no es JSON válido');
            }

            const payload: ProductPayload = {
                name: form.name,
                description: form.description,
                price: Number(form.price),
                originalPrice: form.originalPrice.trim() ? Number(form.originalPrice) : undefined,
                rating: form.rating.trim() ? Number(form.rating) : undefined,
                reviewCount: form.reviewCount.trim() ? Number(form.reviewCount) : undefined,
                currency: form.currency,
                category: form.category,
                tags: parseList(form.tags),
                stock: Number(form.stock),
                attributes: parsedAttributes,
                images: parseList(form.images),
                isActive: form.isActive === 'true',
            };

            if (editing) {
                await api.updateProduct(editing._id, payload, accessToken);
                setSuccess('Producto actualizado');
            } else {
                await api.createProduct(payload, accessToken);
                setSuccess('Producto creado');
            }
            resetForm();
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al guardar');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (p: Product) => {
        setEditing(p);
        setForm({
            name: p.name,
            description: p.description,
            price: String(p.price),
            originalPrice: p.originalPrice != null ? String(p.originalPrice) : '',
            rating: p.rating != null ? String(p.rating) : '',
            reviewCount: p.reviewCount != null ? String(p.reviewCount) : '',
            currency: p.currency || 'USD',
            category: p.category,
            stock: String(p.stock),
            tags: p.tags?.join(', ') ?? '',
            attributes: JSON.stringify(p.attributes ?? {}, null, 2),
            images: p.images?.join(', ') ?? '',
            isActive: String(p.isActive),
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: string) => {
        if (!accessToken) return;
        if (!confirm('¿Eliminar este producto?')) return;
        setError(null);
        try {
            await api.deleteProduct(id, accessToken);
            setSuccess('Producto eliminado');
            await load();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Error al eliminar');
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h1 className="text-2xl font-extrabold tracking-tight">Productos</h1>
                <p className="text-sm text-muted-foreground">
                    Gestiona el catálogo de productos (requiere rol admin).
                </p>
            </div>

            {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
            )}
            {success && (
                <div className="rounded-md bg-green-600/10 p-3 text-sm text-green-700">{success}</div>
            )}

            {/* Formulario crear/editar */}
            <Card className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">
                            {editing ? `Editar: ${editing.name}` : 'Crear producto'}
                        </h2>
                        {editing && (
                            <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
                                Cancelar edición
                            </Button>
                        )}
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5 sm:col-span-2">
                            <Label htmlFor="product-name">Nombre</Label>
                            <Input
                                id="product-name"
                                value={form.name}
                                onChange={handleField('name')}
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="product-category">Categoría</Label>
                            <Input
                                id="product-category"
                                value={form.category}
                                onChange={handleField('category')}
                                list="category-suggestions"
                                placeholder="Ej: electronics"
                                required
                            />
                            <datalist id="category-suggestions">
                                {categories.map((c) => (
                                    <option key={c} value={c} />
                                ))}
                            </datalist>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="product-currency">Moneda</Label>
                            <Select
                                id="product-currency"
                                value={form.currency}
                                onChange={handleField('currency')}
                            >
                                <option value="USD">USD</option>
                                <option value="ARS">ARS</option>
                                <option value="EUR">EUR</option>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="product-price">Precio</Label>
                            <Input
                                id="product-price"
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.price}
                                onChange={handleField('price')}
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="product-original-price">Precio original</Label>
                            <Input
                                id="product-original-price"
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.originalPrice}
                                onChange={handleField('originalPrice')}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="product-stock">Stock</Label>
                            <Input
                                id="product-stock"
                                type="number"
                                min="0"
                                value={form.stock}
                                onChange={handleField('stock')}
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="product-rating">Rating (0-5)</Label>
                            <Input
                                id="product-rating"
                                type="number"
                                min="0"
                                max="5"
                                step="0.1"
                                value={form.rating}
                                onChange={handleField('rating')}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="product-review-count">Cantidad de reseñas</Label>
                            <Input
                                id="product-review-count"
                                type="number"
                                min="0"
                                value={form.reviewCount}
                                onChange={handleField('reviewCount')}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="product-tags">Tags (separados por comas)</Label>
                            <Input
                                id="product-tags"
                                value={form.tags}
                                onChange={handleField('tags')}
                                placeholder="running, deportes, oferta"
                            />
                        </div>
                        <div className="space-y-1.5 sm:col-span-2">
                            <Label htmlFor="product-images">
                                Imágenes (URLs separadas por comas)
                            </Label>
                            <Input
                                id="product-images"
                                value={form.images}
                                onChange={handleField('images')}
                                placeholder="https://cdn.example.com/img1.jpg, https://cdn.example.com/img2.jpg"
                            />
                        </div>
                        <div className="space-y-1.5 sm:col-span-2">
                            <Label htmlFor="product-description">Descripción</Label>
                            <Textarea
                                id="product-description"
                                value={form.description}
                                onChange={handleField('description')}
                                required
                            />
                        </div>
                        <div className="space-y-1.5 sm:col-span-2">
                            <Label htmlFor="product-attributes">Atributos (JSON flexible)</Label>
                            <Textarea
                                id="product-attributes"
                                value={form.attributes}
                                onChange={handleField('attributes')}
                                placeholder='{"talla":42,"color":"negro"}'
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="product-active">Estado</Label>
                            <Select
                                id="product-active"
                                value={form.isActive}
                                onChange={handleField('isActive')}
                            >
                                <option value="true">Sí (visible)</option>
                                <option value="false">No (oculto)</option>
                            </Select>
                        </div>
                    </div>
                    <Button type="submit" disabled={saving || !accessToken}>
                        {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear producto'}
                    </Button>
                </form>
            </Card>

            {/* Tabla de productos */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b p-4">
                    <CardTitle className="text-lg font-semibold">
                        Productos ({products.length})
                    </CardTitle>
                </CardHeader>
                {loading ? (
                    <div className="p-8 text-center text-muted-foreground">Cargando...</div>
                ) : products.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                        No hay productos aún.
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Producto</TableHead>
                                <TableHead>Categoría</TableHead>
                                <TableHead>Precio</TableHead>
                                <TableHead>Rating</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.map((p) => (
                                <TableRow key={p._id}>
                                    <TableCell className="min-w-0">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                                                {p.images?.[0] ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={p.images[0]}
                                                        alt={p.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="flex h-full w-full items-center justify-center text-lg">
                                                        🛍️
                                                    </span>
                                                )}
                                            </div>
                                            <span className="line-clamp-1 font-medium">
                                                {p.name}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{p.category}</Badge>
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap">
                                        <span className="font-semibold">
                                            {formatPrice(p.price, p.currency)}
                                        </span>
                                        {p.originalPrice != null && p.originalPrice > p.price && (
                                            <span className="ml-1 text-xs text-muted-foreground line-through">
                                                {formatPrice(p.originalPrice, p.currency)}
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {typeof p.rating === 'number' && p.rating > 0 ? (
                                            <Badge variant="success">★ {p.rating.toFixed(1)}</Badge>
                                        ) : (
                                            <span className="text-muted-foreground">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={p.stock <= 0 ? 'destructive' : 'secondary'}
                                        >
                                            {p.stock}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEdit(p)}
                                        >
                                            Editar
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDelete(p._id)}
                                        >
                                            Eliminar
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </Card>
        </div>
    );
}
