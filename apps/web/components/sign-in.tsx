'use client';

import { signIn, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';

export function SignInButton() {
    const { data: session, status } = useSession();

    if (status === 'loading') {
        return (
            <Button variant="outline" size="sm" disabled>
                Cargando...
            </Button>
        );
    }

    if (session?.user) {
        const isAdmin = session.user.roles?.includes('admin');
        return (
            <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                    {session.user.name ?? session.user.email}
                    {isAdmin && (
                        <span className="ml-2 rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
                            admin
                        </span>
                    )}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        // /api/auth/logout borra la cookie local y cierra la
                        // sesión SSO de Keycloak (end_session_endpoint).
                        window.location.href = '/api/auth/logout';
                    }}
                >
                    Cerrar sesión
                </Button>
            </div>
        );
    }

    return (
        <Button size="sm" onClick={() => signIn('keycloak')}>
            Iniciar sesión
        </Button>
    );
}
