'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

/** Galería de imágenes del producto con thumbnails. */
export function ProductGallery({ images, name }: { images: string[]; name: string }) {
    const [active, setActive] = useState(0);
    const list = images.length > 0 ? images : [''];
    const current = list[Math.min(active, list.length - 1)];

    return (
        <div className="space-y-3">
            <div className="relative aspect-square overflow-hidden rounded-2xl border bg-muted">
                {current ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={current}
                        alt={name}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-7xl text-muted-foreground/40">
                        🛍️
                    </div>
                )}
            </div>

            {list.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                    {list.map((src, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => setActive(i)}
                            aria-label={`Imagen ${i + 1}`}
                            className={cn(
                                'h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition',
                                i === active
                                    ? 'border-primary'
                                    : 'border-transparent opacity-70 hover:opacity-100',
                            )}
                        >
                            {src ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={src} alt="" className="h-full w-full object-cover" />
                            ) : (
                                <span className="flex h-full w-full items-center justify-center text-2xl">
                                    🛍️
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
