import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { SessionProvider } from '@/components/session-provider';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import './globals.css';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: {
        default: 'CloudCart — Marketplace moderno',
        template: '%s | CloudCart',
    },
    description:
        'Marketplace de demostración: Next.js + NestJS + Keycloak + Kafka',
};

export default async function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    let categories: string[] = [];
    try {
        categories = await api.getCategories();
    } catch {
        /* header sigue funcionando sin categorías */
    }

    return (
        <html lang="es">
            <body
                className={cn(
                    'min-h-screen bg-background font-sans antialiased',
                    geistSans.variable,
                    geistMono.variable,
                )}
            >
                <SessionProvider>
                    <SiteHeader categories={categories} />
                    <main className="container flex-1 py-6">{children}</main>
                    <SiteFooter categories={categories} />
                </SessionProvider>
            </body>
        </html>
    );
}
