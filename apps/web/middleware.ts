import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token as
            | { roles?: string[] }
            | undefined;
        const isAdminRoute = req.nextUrl.pathname.startsWith('/dashboard');

        // Rutas de admin: exigir rol admin
        if (isAdminRoute) {
            const roles = token?.roles ?? [];
            if (!roles.includes('admin')) {
                return NextResponse.redirect(new URL('/?error=forbidden', req.url));
            }
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            // Exigir sesión en todas las rutas excepto las públicas
            authorized: ({ token, req }) => {
                const isPublic =
                    req.nextUrl.pathname === '/' ||
                    req.nextUrl.pathname.startsWith('/api/auth');
                return isPublic || !!token;
            },
        },
    },
);

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
