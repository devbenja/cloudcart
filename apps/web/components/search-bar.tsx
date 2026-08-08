'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Search } from 'lucide-react';

/** Barra de búsqueda del header: navega a /?search=<query>. */
export function SearchBar({ defaultValue = '' }: { defaultValue?: string }) {
    const router = useRouter();
    const [q, setQ] = useState(defaultValue);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const query = q.trim();
        router.push(query ? `/?search=${encodeURIComponent(query)}` : '/');
    };

    return (
        <form onSubmit={submit} className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar productos, marcas y más..."
                className="h-10 w-full rounded-full border border-border bg-muted/40 pl-9 pr-24 text-sm outline-none ring-ring transition focus:bg-background focus:ring-2"
            />
            <button
                type="submit"
                className="absolute right-0.5 top-0.5 h-9 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
            >
                Buscar
            </button>
        </form>
    );
}
