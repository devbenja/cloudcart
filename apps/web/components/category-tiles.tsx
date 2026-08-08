import Link from 'next/link';

interface Tile {
    image: string;
    emoji: string;
}

// Imagen + emoji por categoría; fallback para categorías nuevas.
const TILES: Record<string, Tile> = {
    'Electrónica': {
        image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&q=60',
        emoji: '📱',
    },
    Zapatillas: {
        image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=60',
        emoji: '👟',
    },
    Moda: {
        image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&q=60',
        emoji: '👗',
    },
    Libros: {
        image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=60',
        emoji: '📚',
    },
    Deportes: {
        image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=60',
        emoji: '🏋️',
    },
    Hogar: {
        image: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=600&q=60',
        emoji: '🏠',
    },
};

const FALLBACK_GRADIENT = 'from-rose-100 to-fuchsia-100';

/** Tiles de categorías con imagen de fondo y nombre superpuesto. */
export function CategoryTiles({ categories }: { categories: string[] }) {
    if (categories.length === 0) return null;

    return (
        <section>
            <h2 className="mb-4 text-lg font-bold tracking-tight">Explorar categorías</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {categories.map((c) => {
                    const tile = TILES[c];
                    return (
                        <Link
                            key={c}
                            href={`/?category=${encodeURIComponent(c)}`}
                            className={`group relative aspect-[4/3] overflow-hidden rounded-2xl ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-lg ${
                                tile ? '' : `bg-gradient-to-br ${FALLBACK_GRADIENT}`
                            }`}
                        >
                            {tile ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={tile.image}
                                    alt={c}
                                    loading="lazy"
                                    className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                />
                            ) : (
                                <span className="absolute inset-0 flex items-center justify-center text-5xl">
                                    {TILES[c]?.emoji ?? '🛍️'}
                                </span>
                            )}

                            {/* Overlay para legibilidad */}
                            <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />

                            <span className="absolute inset-x-0 bottom-0 p-3 text-sm font-semibold text-white drop-shadow">
                                {c}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
