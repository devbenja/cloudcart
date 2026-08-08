'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { api, type Product } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface FormState {
    name: string;
    description: string;
    price: string;
    category: string;
    stock: string;
    attributes: string;
}

const emptyForm: FormState = {
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    attributes: '{}',
};

export function DashboardClient() {
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

    const handleField = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
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

            const payload = {
                name: form.name,
                description: form.description,
                price: Number(form.price),
                category: form.category,
                stock: Number(form.stock),
                attributes: parsedAttributes,
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
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Error al guardar');
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
            category: p.category,
            stock: String(p.stock),
            attributes: JSON.stringify(p.attributes ?? {}, null, 2),
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
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard de administración</h1>
                <p className="text-muted-foreground">
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
            <form
                onSubmit={handleSubmit}
                className="rounded-xl border bg-card p-6 space-y-4"
            >
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
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Nombre</label>
                        <Input value={form.name} onChange={handleField('name')} required />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Categoría</label>
                        <Input
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
                    <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-sm font-medium">Descripción</label>
                        <Input value={form.description} onChange={handleField('description')} required />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Precio (USD)</label>
                        <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.price}
                            onChange={handleField('price')}
                            required
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Stock</label>
                        <Input
                            type="number"
                            min="0"
                            value={form.stock}
                            onChange={handleField('stock')}
                            required
                        />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-sm font-medium">
                            Atributos (JSON flexible)
                        </label>
                        <Input
                            value={form.attributes}
                            onChange={handleField('attributes')}
                            placeholder='{"talla":42,"color":"negro"}'
                        />
                    </div>
                </div>
                <Button type="submit" disabled={saving || !accessToken}>
                    {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear producto'}
                </Button>
            </form>

            {/* Tabla de productos */}
            <div className="rounded-xl border bg-card">
                <div className="p-4 border-b">
                    <h2 className="text-lg font-semibold">Productos ({products.length})</h2>
                </div>
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
                                <TableHead>Stock</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.map((p) => (
                                <TableRow key={p._id}>
                                    <TableCell className="font-medium">{p.name}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{p.category}</Badge>
                                    </TableCell>
                                    <TableCell>${p.price.toFixed(2)}</TableCell>
                                    <TableCell>{p.stock}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="outline" size="sm" onClick={() => handleEdit(p)}>
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
            </div>
        </div>
    );
}
