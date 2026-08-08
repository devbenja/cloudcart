import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ProductNotFound() {
    return (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
            <h1 className="text-2xl font-bold">Producto no encontrado</h1>
            <p className="text-muted-foreground">
                El producto que buscás no existe o fue eliminado.
            </p>
            <Link href="/">
                <Button>Volver al catálogo</Button>
            </Link>
        </div>
    );
}
