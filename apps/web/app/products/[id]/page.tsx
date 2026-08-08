import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Star, Truck, ShieldCheck, RotateCcw, Tag } from 'lucide-react';
import { api, type Product, discountPercent, formatPrice } from '@/lib/api';
import { ProductBuy } from '@/components/product-buy';
import { ProductGallery } from '@/components/product-gallery';
import { ProductCard } from '@/components/product-card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Props {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    try {
        const product = await api.getProduct(id);
        return { title: product.name, description: product.description };
    } catch {
        return { title: 'Producto' };
    }
}

export const dynamic = 'force-dynamic';

const BENEFITS = [
    { icon: Truck, label: 'Envío gratis +$50' },
    { icon: ShieldCheck, label: 'Compra protegida' },
    { icon: RotateCcw, label: 'Devolución en 30 días' },
];

export default async function ProductPage({ params }: Props) {
    const { id } = await params;

    let product: Product;
    try {
        product = await api.getProduct(id);
    } catch {
        notFound();
    }

    const discount = discountPercent(product);
    const savings =
        discount > 0 && product.originalPrice
            ? product.originalPrice - product.price
            : 0;
    const attributes = Object.entries(product.attributes ?? {});
    const tags = product.tags ?? [];

    // Productos relacionados: misma categoría, excluye el actual
    let related: Product[] = [];
    try {
        const res = await api.getProducts({ category: product.category, limit: 5 });
        related = res.data.filter((p) => p._id !== product._id).slice(0, 4);
    } catch {
        /* sin relacionados */
    }

    return (
        <div className="space-y-8">
            {/* Breadcrumbs */}
            <nav className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
                <Link href="/" className="hover:text-primary">
                    Inicio
                </Link>
                <ChevronRight className="h-3.5 w-3.5" />
                <Link
                    href={`/?category=${encodeURIComponent(product.category)}`}
                    className="hover:text-primary"
                >
                    {product.category}
                </Link>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="font-medium text-foreground">{product.name}</span>
            </nav>

            <div className="grid gap-8 lg:grid-cols-2">
                {/* Galería */}
                <ProductGallery images={product.images} name={product.name} />

                {/* Información + compra */}
                <div className="space-y-5">
                    <div className="space-y-2">
                        <Badge variant="outline" className="text-muted-foreground">
                            {product.category}
                        </Badge>
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                            {product.name}
                        </h1>

                        {typeof product.rating === 'number' && product.rating > 0 && (
                            <div className="flex items-center gap-2 text-sm">
                                <div className="flex">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <Star
                                            key={i}
                                            className={cn(
                                                'h-4 w-4',
                                                i <= Math.round(product.rating!)
                                                    ? 'fill-amber-400 text-amber-400'
                                                    : 'fill-muted text-muted',
                                            )}
                                        />
                                    ))}
                                </div>
                                <span className="font-semibold">
                                    {product.rating.toFixed(1)}
                                </span>
                                <span className="text-muted-foreground">
                                    ({product.reviewCount ?? 0} reseñas)
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Precio */}
                    <div className="rounded-2xl border bg-muted/30 p-4">
                        <div className="flex flex-wrap items-baseline gap-3">
                            <span className="text-3xl font-extrabold text-primary">
                                {formatPrice(product.price)}
                            </span>
                            {discount > 0 && product.originalPrice && (
                                <>
                                    <span className="text-lg text-muted-foreground line-through">
                                        {formatPrice(product.originalPrice)}
                                    </span>
                                    <Badge variant="sale">-{discount}%</Badge>
                                    <span className="text-sm font-medium text-emerald-600">
                                        Ahorrás {formatPrice(savings)}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    <ProductBuy product={product} />

                    {/* Beneficios */}
                    <div className="grid grid-cols-3 gap-2 border-t pt-4 text-center">
                        {BENEFITS.map(({ icon: Icon, label }) => (
                            <div key={label} className="flex flex-col items-center gap-1.5 text-xs text-muted-foreground">
                                <Icon className="h-5 w-5 text-primary" />
                                {label}
                            </div>
                        ))}
                    </div>

                    {/* Tags */}
                    {tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 border-t pt-4">
                            <Tag className="h-4 w-4 text-muted-foreground" />
                            {tags.map((t) => (
                                <Link key={t} href={`/?search=${encodeURIComponent(t)}`}>
                                    <Badge variant="secondary" className="hover:bg-muted">
                                        {t}
                                    </Badge>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Descripción + atributos */}
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="rounded-2xl border p-5 lg:col-span-2">
                    <h2 className="mb-2 text-lg font-bold">Descripción</h2>
                    <p className="leading-relaxed text-muted-foreground">
                        {product.description}
                    </p>
                </div>
                {attributes.length > 0 && (
                    <div className="rounded-2xl border p-5">
                        <h2 className="mb-3 text-lg font-bold">Especificaciones</h2>
                        <dl className="space-y-2 text-sm">
                            {attributes.map(([k, v]) => (
                                <div key={k} className="flex justify-between gap-4 border-b pb-1.5 last:border-0">
                                    <dt className="capitalize text-muted-foreground">{k}</dt>
                                    <dd className="font-medium">{String(v)}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                )}
            </div>

            {/* Relacionados */}
            {related.length > 0 && (
                <section className="space-y-4">
                    <h2 className="text-lg font-bold tracking-tight">
                        También te puede gustar
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {related.map((p) => (
                            <ProductCard key={p._id} product={p} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
