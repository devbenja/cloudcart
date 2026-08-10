'use client';

import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

type Tone = 'pink' | 'amber' | 'sky' | 'emerald' | 'violet';

const toneClasses: Record<Tone, { icon: string; chip: string }> = {
    pink: { icon: 'bg-primary/10 text-primary', chip: 'bg-primary/10 text-primary' },
    amber: { icon: 'bg-amber-100 text-amber-600', chip: 'bg-amber-100 text-amber-600' },
    sky: { icon: 'bg-sky-100 text-sky-600', chip: 'bg-sky-100 text-sky-600' },
    emerald: { icon: 'bg-emerald-100 text-emerald-600', chip: 'bg-emerald-100 text-emerald-600' },
    violet: { icon: 'bg-violet-100 text-violet-600', chip: 'bg-violet-100 text-violet-600' },
};

interface StatCardProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    tone?: Tone;
    hint?: string;
    loading?: boolean;
}

/** Tarjeta KPI compacta para el panel admin y el hero. */
export function StatCard({ label, value, icon: Icon, tone = 'pink', hint, loading }: StatCardProps) {
    return (
        <div className="rounded-2xl border bg-card p-4 shadow-sm transition hover:shadow-md">
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-muted-foreground">{label}</p>
                    {loading ? (
                        <Skeleton className="mt-2 h-8 w-16" />
                    ) : (
                        <p className="mt-1 text-2xl font-extrabold tracking-tight">{value}</p>
                    )}
                    {hint && !loading && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
                </div>
                <span
                    className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                        toneClasses[tone].icon,
                    )}
                >
                    <Icon className="h-4 w-4" />
                </span>
            </div>
        </div>
    );
}
