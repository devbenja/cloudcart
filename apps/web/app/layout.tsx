import type { Metadata } from 'next';
import Link from 'next/link';
import { SessionProvider } from '@/components/session-provider';
import { SignInButton } from '@/components/sign-in';
import { cn } from '@/lib/utils';
import './globals.css';

export const metadata: Metadata = {
    title: {
        default: 'CloudCart',
        template: '%s | CloudCart',
    },
    description: 'Tienda de demostración — Next.js + NestJS + Keycloak',
};

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="es">
            <body className={cn('min-h-screen bg-background font-sans antialiased')}>
                <SessionProvider>
                    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                        <div className="container flex h-14 items-center gap-6">
                            <Link href="/" className="font-bold text-lg tracking-tight">
                                Cloud<span className="text-primary">Cart</span>
                            </Link>
                            <nav className="flex items-center gap-4 text-sm text-muted-foreground">
                                <Link href="/" className="hover:text-foreground">
                                    Catálogo
                                </Link>
                                <Link href="/dashboard" className="hover:text-foreground">
                                    Dashboard
                                </Link>
                            </nav>
                            <div className="ml-auto">
                                <SignInButton />
                            </div>
                        </div>
                    </header>
                    <main className="container py-6">{children}</main>
                </SessionProvider>
            </body>
        </html>
    );
}
