import Link from 'next/link';
import { Star } from 'lucide-react';
import { type Product, discountPercent, formatPrice } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { AddToCartButton } from '@/components/add-to-cart-button';
import { cn } from '@/lib/utils';

/** Estrellas de rating (compactas). */
function Rating({ rating, count }: { rating: number; count: number }) {
    return (
        <div className="flex items-center gap-1">
            <div className="flex">
                {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                        key={i}
                        className={cn(
                            'h-3.5 w-3.5',
                            i <= Math.round(rating)
                                ? 'fill-amber-400 text-amber-400'
                                : 'fill-muted text-muted',
                        )}
                    />
                ))}
            </div>
            {rating > 0 && (
                <span className="text-xs font-medium text-muted-foreground">
                    {rating.toFixed(1)} ({count})
                </span>
            )}
        </div>
    );
}

export function ProductCard({ product }: { product: Product }) {
    const image = product.images?.[0];
    const discount = discountPercent(product);
    const outOfStock = product.stock <= 0;

    return (
        <div className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            {/* Imagen */}
            <Link
                href={`/products/${product._id}`}
                className="relative block aspect-square overflow-hidden bg-muted"
            >
                {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={image}
                        alt={product.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-5xl text-muted-foreground/40">
                        🛍️
                    </div>
                )}

                {/* Badge de descuento */}
                {discount > 0 && (
                    <Badge variant="sale" className="absolute left-2 top-2 text-xs">
                        -{discount}%
                    </Badge>
                )}

                {outOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm">
                        <Badge variant="secondary" className="text-sm">
                            Agotado
                        </Badge>
                    </div>
                )}
            </Link>

            {/* Contenido */}
            <div className="flex flex-1 flex-col gap-1.5 p-3">
                <Badge variant="outline" className="w-fit text-[10px] text-muted-foreground">
                    {product.category}
                </Badge>

                <Link
                    href={`/products/${product._id}`}
                    className="line-clamp-2 text-sm font-medium leading-snug hover:text-primary"
                >
                    {product.name}
                </Link>

                {typeof product.rating === 'number' && (
                    <Rating rating={product.rating} count={product.reviewCount ?? 0} />
                )}

                <div className="mt-auto flex items-end justify-between gap-2 pt-1">
                    <div className="leading-tight">
                        {discount > 0 && product.originalPrice && (
                            <span className="block text-xs text-muted-foreground line-through">
                                {formatPrice(product.originalPrice)}
                            </span>
                        )}
                        <span className="text-base font-bold text-primary">
                            {formatPrice(product.price)}
                        </span>
                    </div>
                    {!outOfStock && <AddToCartButton productId={product._id} />}
                </div>
            </div>
        </div>
    );
}
