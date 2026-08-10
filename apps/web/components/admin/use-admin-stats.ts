'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { api } from '@/lib/api';

export interface AdminStats {
    products: number;
    orders: number;
    pendingOrders: number;
    revenue: number;
    users: number;
    loading: boolean;
}

/**
 * KPIs del panel: productos, pedidos (totales/pendientes), ingresos y usuarios.
 * Los pedidos y usuarios requieren token (endpoints protegidos); los productos son públicos.
 */
export function useAdminStats(): AdminStats {
    const { data: session } = useSession();
    const accessToken = session?.accessToken;

    const [stats, setStats] = useState<AdminStats>({
        products: 0,
        orders: 0,
        pendingOrders: 0,
        revenue: 0,
        users: 0,
        loading: true,
    });

    const load = useCallback(async () => {
        if (!accessToken) return;
        setStats((s) => ({ ...s, loading: true }));
        try {
            const [productsRes, ordersRes, usersRes] = await Promise.all([
                api.getProducts({ page: 1, limit: 1 }),
                api.getOrders(accessToken),
                api.getUsers(accessToken),
            ]);

            const orders = ordersRes.data ?? [];
            const revenue = orders
                .filter((o) => o.status !== 'cancelled')
                .reduce((acc, o) => acc + Number(o.total), 0);

            setStats({
                products: productsRes.total ?? 0,
                orders: ordersRes.total ?? orders.length,
                pendingOrders: orders.filter((o) => o.status === 'pending').length,
                revenue,
                users: usersRes.total ?? 0,
                loading: false,
            });
        } catch {
            setStats((s) => ({ ...s, loading: false }));
        }
    }, [accessToken]);

    useEffect(() => {
        if (accessToken) void load();
    }, [accessToken, load]);

    return stats;
}
