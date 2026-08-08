import type { Product } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function ProductCard({ product }: { product: Product }) {
    const formattedPrice = new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: product.currency || 'USD',
    }).format(product.price);

    return (
        <Card className="flex flex-col">
            <CardHeader>
                <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{product.name}</CardTitle>
                    <Badge variant="secondary">{product.category}</Badge>
                </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-3">
                <p className="line-clamp-2 text-sm text-muted-foreground">
                    {product.description}
                </p>
                <div className="flex flex-wrap gap-1.5">
                    {product.tags?.slice(0, 4).map((tag) => (
                        <span
                            key={tag}
                            className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
                        >
                            #{tag}
                        </span>
                    ))}
                </div>
                {Object.keys(product.attributes ?? {}).length > 0 && (
                    <div className="rounded-md bg-muted/50 p-2 text-xs">
                        {Object.entries(product.attributes ?? {})
                            .slice(0, 3)
                            .map(([k, v]) => (
                                <div key={k} className="flex justify-between">
                                    <span className="text-muted-foreground capitalize">{k}</span>
                                    <span className="font-medium">{String(v)}</span>
                                </div>
                            ))}
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex items-center justify-between">
                <span className="text-lg font-semibold">{formattedPrice}</span>
                <span
                    className={cn(
                        'text-xs',
                        product.stock > 0 ? 'text-green-600' : 'text-destructive',
                    )}
                >
                    {product.stock > 0 ? `${product.stock} en stock` : 'Sin stock'}
                </span>
            </CardFooter>
        </Card>
    );
}
