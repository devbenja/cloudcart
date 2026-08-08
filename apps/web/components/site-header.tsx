import Link from 'next/link';
import { ShoppingBag, Truck, User } from 'lucide-react';
import { SearchBar } from '@/components/search-bar';
import { CartLink } from '@/components/cart-link';
import { SignInButton } from '@/components/sign-in';
import { MobileMenu } from '@/components/mobile-menu';

/** Header de marketplace: topbar + fila principal (logo, búsqueda, cuenta, carrito) + nav de categorías. */
export function SiteHeader({ categories }: { categories: string[] }) {
    return (
        <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            {/* Nivel 1 — topbar */}
            <div className="bg-primary text-primary-foreground">
                <div className="container flex h-8 items-center justify-between text-xs">
                    <p className="flex items-center gap-1.5 font-medium">
                        <Truck className="h-3.5 w-3.5" />
                        Envío gratis en pedidos superiores a $50
                    </p>
                    <div className="hidden items-center gap-4 sm:flex">
                        <Link href="/orders" className="hover:underline">
                            Seguir pedido
                        </Link>
                        <Link href="/dashboard" className="hover:underline">
                            Vender / Admin
                        </Link>
                    </div>
                </div>
            </div>

            {/* Nivel 2 — logo + búsqueda + acciones */}
            <div className="border-b border-border/70">
                <div className="container flex h-16 items-center gap-3 sm:gap-6">
                    <MobileMenu categories={categories} />

                    <Link href="/" className="flex shrink-0 items-center gap-2">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                            <ShoppingBag className="h-5 w-5" />
                        </span>
                        <span className="hidden text-lg font-extrabold tracking-tight sm:block">
                            Cloud<span className="text-gradient">Cart</span>
                        </span>
                    </Link>

                    <SearchBar />

                    <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                        <Link
                            href="/orders"
                            className="hidden flex-col items-start rounded-lg px-2 py-1 leading-tight hover:bg-muted md:flex"
                        >
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <User className="h-3 w-3" />
                                Mis pedidos
                            </span>
                            <span className="text-sm font-medium">Ordenes</span>
                        </Link>
                        <SignInButton />
                        <CartLink />
                    </div>
                </div>
            </div>

            {/* Nivel 3 — nav de categorías */}
            <nav className="hidden border-b border-border/60 lg:block">
                <div className="container flex h-10 items-center gap-1 overflow-x-auto text-sm">
                    <Link
                        href="/"
                        className="rounded-md px-3 py-1.5 font-semibold hover:bg-muted"
                    >
                        Inicio
                    </Link>
                    <Link
                        href="/#ofertas"
                        className="rounded-md px-3 py-1.5 font-medium text-primary hover:bg-muted"
                    >
                        🔥 Ofertas
                    </Link>
                    <span className="mx-1 h-4 w-px bg-border" />
                    {categories.map((c) => (
                        <Link
                            key={c}
                            href={`/?category=${encodeURIComponent(c)}`}
                            className="whitespace-nowrap rounded-md px-3 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                            {c}
                        </Link>
                    ))}
                </div>
            </nav>
        </header>
    );
}
