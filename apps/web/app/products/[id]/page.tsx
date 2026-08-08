import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import { ProductBuy } from '@/components/product-buy';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Props {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    try {
        const product = await api.getProduct(id);
        return { title: product.name };
    } catch {
        return { title: 'Producto' };
    }
}

export const dynamic = 'force-dynamic';

export default async function ProductPage({ params }: Props) {
    const { id } = await params;

    let product;
    try {
        product = await api.getProduct(id);
    } catch {
        notFound();
    }

    if (!product) notFound();

    const formattedPrice = new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: product.currency || 'USD',
    }).format(product.price);

    const image = product.images?.[0];
    const attributes = Object.entries(product.attributes ?? {});

    return (
        <div className="space-y-6">
            <Link
                href="/"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
                <ArrowLeft className="h-4 w-4" />
                Volver al catálogo
            </Link>

            <div className="grid gap-8 lg:grid-cols-2">
                {/* Imagen */}
                <div className="overflow-hidden rounded-xl border bg-muted">
                    {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={image}
                            alt={product.name}
                            className="h-72 w-full object-cover lg:h-96"
                        />
                    ) : (
                        <div className="flex h-72 w-full items-center justify-center text-muted-foreground lg:h-96">
                            <span className="text-sm uppercase tracking-wider">
                                Sin imagen
                            </span>
                        </div>
                    )}
                </div>

                {/* Información */}
                <div className="space-y-5">
                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary">{product.category}</Badge>
                            <span
                                className={
                                    product.stock > 0
                                        ? 'text-sm font-medium text-green-600'
                                        : 'text-sm font-medium text-destructive'
                                }
                            >
                                {product.stock > 0
                                    ? `${product.stock} en stock`
                                    : 'Agotado'}
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {product.name}
                        </h1>
                        <p className="text-2xl font-semibold text-primary">
                            {formattedPrice}
                        </p>
                    </div>

                    <p className="text-muted-foreground">{product.description}</p>

                    {product.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {product.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="rounded bg-muted px-2 py-1 text-xs text-muted-foreground"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {attributes.length > 0 && (
                        <Card>
                            <CardContent className="grid grid-cols-2 gap-x-4 gap-y-2 p-4 text-sm sm:grid-cols-3">
                                {attributes.map(([key, value]) => (
                                    <div key={key}>
                                        <p className="text-xs capitalize text-muted-foreground">
                                            {key}
                                        </p>
                                        <p className="font-medium">{String(value)}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* Compra */}
                    <div className="rounded-xl border bg-card p-4">
                        <ProductBuy product={product} />
                    </div>
                </div>
            </div>
        </div>
    );
}
