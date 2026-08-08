'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

/** Menú hamburguesa para pantallas pequeñas (header). */
export function MobileMenu({ categories }: { categories: string[] }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="lg:hidden">
            <button
                type="button"
                aria-label="Abrir menú"
                onClick={() => setOpen((v) => !v)}
                className="flex h-9 w-9 items-center justify-center rounded-md text-foreground hover:bg-muted"
            >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {open && (
                <div className="absolute inset-x-0 top-full z-50 border-t bg-background shadow-lg lg:hidden">
                    <nav className="container flex flex-col gap-1 py-3 text-sm">
                        <Link href="/" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 font-medium hover:bg-muted">
                            Inicio
                        </Link>
                        <Link href="/#ofertas" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-primary hover:bg-muted">
                            🔥 Ofertas
                        </Link>
                        {categories.map((c) => (
                            <Link
                                key={c}
                                href={`/?category=${encodeURIComponent(c)}`}
                                onClick={() => setOpen(false)}
                                className="rounded-md px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                            >
                                {c}
                            </Link>
                        ))}
                        <div className="mt-2 border-t pt-2">
                            <Link href="/cart" onClick={() => setOpen(false)} className="block rounded-md px-3 py-2 hover:bg-muted">
                                🛒 Mi carrito
                            </Link>
                            <Link href="/orders" onClick={() => setOpen(false)} className="block rounded-md px-3 py-2 hover:bg-muted">
                                📦 Mis órdenes
                            </Link>
                        </div>
                    </nav>
                </div>
            )}
        </div>
    );
}
