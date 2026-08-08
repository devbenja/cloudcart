import Link from 'next/link';
import { ShoppingBag, Truck, ShieldCheck, RotateCcw } from 'lucide-react';

const BENEFITS = [
    { icon: Truck, title: 'Envío rápido', text: 'En 24–72hs' },
    { icon: ShieldCheck, title: 'Compra protegida', text: 'Pago seguro' },
    { icon: RotateCcw, title: 'Devolución fácil', text: '30 días' },
];

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
    {
        title: 'Comprar',
        links: [
            { label: 'Catálogo', href: '/' },
            { label: 'Ofertas', href: '/#ofertas' },
            { label: 'Mis órdenes', href: '/orders' },
            { label: 'Mi carrito', href: '/cart' },
        ],
    },
    {
        title: 'Mi cuenta',
        links: [
            { label: 'Iniciar sesión', href: '/api/auth/signin' },
            { label: 'Administrar tienda', href: '/dashboard' },
        ],
    },
    {
        title: 'Empresa',
        links: [
            { label: 'Sobre CloudCart', href: '/' },
            { label: 'ADRs de arquitectura', href: '/' },
            { label: 'Documentación', href: '/' },
        ],
    },
];

export function SiteFooter({ categories }: { categories: string[] }) {
    return (
        <footer className="mt-16 border-t bg-muted/40">
            {/* Beneficios */}
            <div className="container grid grid-cols-3 gap-4 border-b py-6">
                {BENEFITS.map(({ icon: Icon, title, text }) => (
                    <div key={title} className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Icon className="h-5 w-5" />
                        </span>
                        <div className="leading-tight">
                            <p className="text-sm font-semibold">{title}</p>
                            <p className="text-xs text-muted-foreground">{text}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Columnas */}
            <div className="container grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                    <Link href="/" className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <ShoppingBag className="h-4 w-4" />
                        </span>
                        <span className="text-base font-extrabold tracking-tight">
                            Cloud<span className="text-gradient">Cart</span>
                        </span>
                    </Link>
                    <p className="mt-3 text-sm text-muted-foreground">
                        Marketplace de demostración: Next.js + NestJS + Keycloak +
                        Kafka. Arquitectura de nivel producción.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                        {categories.map((c) => (
                            <Link
                                key={c}
                                href={`/?category=${encodeURIComponent(c)}`}
                                className="rounded-full bg-background px-2.5 py-1 text-xs text-muted-foreground ring-1 ring-border hover:text-primary"
                            >
                                {c}
                            </Link>
                        ))}
                    </div>
                </div>

                {COLUMNS.map((col) => (
                    <div key={col.title}>
                        <h3 className="mb-3 text-sm font-semibold">{col.title}</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            {col.links.map((l) => (
                                <li key={l.label}>
                                    <Link href={l.href} className="hover:text-primary">
                                        {l.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            <div className="border-t">
                <div className="container flex flex-col items-center justify-between gap-2 py-4 text-xs text-muted-foreground sm:flex-row">
                    <p>© {new Date().getFullYear()} CloudCart — Proyecto de portafolio</p>
                    <p>Demo — los precios y productos son ilustrativos</p>
                </div>
            </div>
        </footer>
    );
}
