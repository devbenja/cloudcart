'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Star, MessageSquare, Pencil, Trash2 } from 'lucide-react';
import { api, type Review } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Props {
    productId: string;
    rating?: number;
    reviewCount?: number;
}

function Stars({ value, size = 16 }: { value: number; size?: number }) {
    return (
        <span className="inline-flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
                <Star
                    key={i}
                    size={size}
                    className={cn(
                        i <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted-foreground/30',
                    )}
                />
            ))}
        </span>
    );
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

export function ProductReviews({ productId }: Props) {
    const { data: session } = useSession();
    const accessToken = session?.accessToken;

    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingRating, setEditingRating] = useState(5);
    const [editingComment, setEditingComment] = useState('');

    const load = useCallback(async () => {
        try {
            const res = await api.getProductReviews(productId);
            setReviews(res.data);
        } catch {
            // catálogo caído: mostrar vacío
        } finally {
            setLoading(false);
        }
    }, [productId]);

    useEffect(() => {
        load();
    }, [load]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!accessToken) return;
        setSubmitting(true);
        setError(null);
        setSuccess(null);
        try {
            if (editingId) {
                await api.updateReview(accessToken, editingId, { rating: editingRating, comment: editingComment });
                setSuccess('✓ Reseña actualizada');
            } else {
                await api.createReview(accessToken, productId, { rating, comment: comment || undefined });
                setSuccess('✓ ¡Gracias por tu reseña!');
            }
            setComment('');
            setRating(5);
            setEditingId(null);
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al guardar la reseña');
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDelete(id: string) {
        if (!accessToken) return;
        if (!confirm('¿Eliminar esta reseña?')) return;
        setError(null);
        try {
            await api.deleteReview(accessToken, id);
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al eliminar');
        }
    }

    function startEdit(r: Review) {
        setEditingId(r.id);
        setEditingRating(r.rating);
        setEditingComment(r.comment ?? '');
    }

    return (
        <section id="reviews" className="mt-12 scroll-mt-24">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Reseñas
                    <Badge variant="secondary">{reviews.length}</Badge>
                </h2>
            </div>

            {success && (
                <div className="mb-4 rounded-lg bg-emerald-50 dark:bg-emerald-950 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
                    {success}
                </div>
            )}
            {error && (
                <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-950 px-4 py-3 text-sm text-red-700 dark:text-red-300">
                    {error}
                </div>
            )}

            {/* Lista de reseñas */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse h-20 rounded-lg bg-muted" />
                    ))}
                </div>
            ) : reviews.length === 0 ? (
                <p className="text-muted-foreground text-sm mb-6">
                    Todavía no hay reseñas para este producto. Sé el primero en opinar.
                </p>
            ) : (
                <div className="space-y-4 mb-8">
                    {reviews.map((r) => (
                        <div key={r.id} className="rounded-lg border p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <Stars value={r.rating} />
                                    <span className="text-sm font-medium">{r.rating.toFixed(1)}</span>
                                    <span className="text-xs text-muted-foreground">· {formatDate(r.createdAt)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    {editingId === r.id ? (
                                        <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                                            Cancelar
                                        </Button>
                                    ) : (
                                        <>
                                            <Button variant="ghost" size="icon" title="Editar" onClick={() => startEdit(r)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" title="Eliminar" onClick={() => handleDelete(r.id)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {editingId === r.id ? (
                                <form onSubmit={handleSubmit} className="mt-3 space-y-3">
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => setEditingRating(i)}
                                                className="transition-transform hover:scale-110"
                                            >
                                                <Star size={20} className={cn(i <= editingRating ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted-foreground/30')} />
                                            </button>
                                        ))}
                                    </div>
                                    <textarea
                                        value={editingComment}
                                        onChange={(e) => setEditingComment(e.target.value)}
                                        rows={2}
                                        placeholder="Tu opinión sobre el producto..."
                                        className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                                    />
                                    <Button type="submit" size="sm" disabled={submitting}>
                                        {submitting ? 'Guardando...' : 'Guardar cambios'}
                                    </Button>
                                </form>
                            ) : (
                                <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Formulario de nueva reseña */}
            {accessToken && (
                <form onSubmit={handleSubmit} className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => setRating(i)}
                                className="transition-transform hover:scale-110"
                            >
                                <Star size={24} className={cn(i <= rating ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted-foreground/30')} />
                            </button>
                        ))}
                        <span className="ml-2 text-sm font-medium">{rating}.0</span>
                    </div>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={3}
                        placeholder="Escribí tu opinión sobre este producto..."
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    />
                    <Button type="submit" disabled={submitting || !accessToken}>
                        {submitting ? 'Enviando...' : 'Publicar reseña'}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                        Solo podés reseñar productos que hayas comprado (orden pagada o entregada).
                    </p>
                </form>
            )}
        </section>
    );
}
