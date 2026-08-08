import Link from 'next/link';
import type { Product } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AddToCartButton } from '@/components/add-to-cart-button';
import { cn } from '@/lib/utils';

export function ProductCard({ product }: { product: Product }) {
    const formattedPrice = new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: product.currency || 'USD',
    }).format(product.price);

    const image = product.images?.[0];

    return (
        <Card className="group flex flex-col overflow-hidden transition-shadow hover:shadow-md">
            {/* Imagen (clic → detalle) */}
            <Link
                href={`/products/${product._id}`}
                className="relative block h-40 w-full overflow-hidden bg-muted"
            >
                {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={image}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <span className="text-xs uppercase tracking-wider">Sin imagen</span>
                    </div>
                )}
                <Badge className="absolute left-2 top-2" variant="secondary">
                    {product.category}
                </Badge>
            </Link>

            <CardHeader className="pb-2">
                <CardTitle className="text-base leading-snug">
                    <Link
                        href={`/products/${product._id}`}
                        className="hover:text-primary hover:underline"
                    >
                        {product.name}
                    </Link>
                </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 space-y-3 pb-2">
                <p className="line-clamp-2 text-sm text-muted-foreground">
                    {product.description}
                </p>
                <div className="flex flex-wrap gap-1.5">
                    {product.tags?.slice(0, 3).map((tag) => (
                        <span
                            key={tag}
                            className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
                        >
                            #{tag}
                        </span>
                    ))}
                </div>
            </CardContent>

            <CardFooter className="flex items-center justify-between gap-2 pt-2">
                <div className="flex flex-col">
                    <span className="text-lg font-semibold">{formattedPrice}</span>
                    <span
                        className={cn(
                            'text-xs',
                            product.stock > 0 ? 'text-green-600' : 'text-destructive',
                        )}
                    >
                        {product.stock > 0 ? `${product.stock} en stock` : 'Sin stock'}
                    </span>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <AddToCartButton productId={product._id} />
                    <Link
                        href={`/products/${product._id}`}
                        className="text-xs text-primary hover:underline"
                    >
                        Ver detalles →
                    </Link>
                </div>
            </CardFooter>
        </Card>
    );
}
