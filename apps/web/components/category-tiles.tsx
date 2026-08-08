import Link from 'next/link';

interface Tile {
    emoji: string;
    gradient: string;
}

// Emoji + gradiente por categoría; fallback para categorías nuevas.
const TILES: Record<string, Tile> = {
    'Electrónica': { emoji: '📱', gradient: 'from-rose-100 to-orange-100' },
    Zapatillas: { emoji: '👟', gradient: 'from-sky-100 to-indigo-100' },
    Moda: { emoji: '👗', gradient: 'from-fuchsia-100 to-rose-100' },
    Libros: { emoji: '📚', gradient: 'from-amber-100 to-yellow-100' },
    Deportes: { emoji: '🏋️', gradient: 'from-emerald-100 to-teal-100' },
    Hogar: { emoji: '🏠', gradient: 'from-violet-100 to-purple-100' },
};

const FALLBACK: Tile = { emoji: '🛍️', gradient: 'from-slate-100 to-slate-200' };

/** Tiles de categorías del marketplace (linkean al catálogo filtrado). */
export function CategoryTiles({ categories }: { categories: string[] }) {
    if (categories.length === 0) return null;

    return (
        <section>
            <h2 className="mb-4 text-lg font-bold tracking-tight">Explorar categorías</h2>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                {categories.map((c) => {
                    const tile = TILES[c] ?? FALLBACK;
                    return (
                        <Link
                            key={c}
                            href={`/?category=${encodeURIComponent(c)}`}
                            className={`group flex flex-col items-center gap-2 rounded-2xl bg-gradient-to-br p-4 text-center ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md ${tile.gradient}`}
                        >
                            <span className="text-3xl transition group-hover:scale-110">
                                {tile.emoji}
                            </span>
                            <span className="text-sm font-semibold text-foreground">
                                {c}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
