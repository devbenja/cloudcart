'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Boxes,
    ReceiptText,
    Users,
    Store,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
    { href: '/dashboard', label: 'Resumen', icon: LayoutDashboard },
    { href: '/dashboard/products', label: 'Productos', icon: Boxes },
    { href: '/dashboard/orders', label: 'Pedidos', icon: ReceiptText },
    { href: '/dashboard/users', label: 'Usuarios', icon: Users },
] as const;

function isActive(href: string, pathname: string): boolean {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
}

/**
 * Navegación del panel admin. En desktop: columna vertical fija.
 * En mobile: barra horizontal scrolleable arriba del contenido.
 */
export function Sidebar() {
    const pathname = usePathname();

    return (
        <>
            {/* Mobile: barra horizontal */}
            <nav className="flex gap-1 overflow-x-auto pb-1 md:hidden" aria-label="Panel admin">
                {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
                    <Link
                        key={href}
                        href={href}
                        className={cn(
                            'inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                            isActive(href, pathname)
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                        )}
                    >
                        <Icon className="h-4 w-4" />
                        {label}
                    </Link>
                ))}
            </nav>

            {/* Desktop: columna fija */}
            <aside className="sticky top-24 hidden h-fit w-56 shrink-0 flex-col gap-1 md:flex">
                <Link
                    href="/"
                    className="mb-2 inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
                >
                    <Store className="h-4 w-4" />
                    Ver la tienda
                </Link>
                {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
                    <Link
                        key={href}
                        href={href}
                        className={cn(
                            'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                            isActive(href, pathname)
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                        )}
                    >
                        <Icon className="h-4 w-4" />
                        {label}
                    </Link>
                ))}
            </aside>
        </>
    );
}
