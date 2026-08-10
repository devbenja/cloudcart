import type { NextAuthOptions } from 'next-auth';
import KeycloakProvider from 'next-auth/providers/keycloak';

/** Roles del usuario extraídos del token de Keycloak (realm_access.roles). */
export interface SessionUser {
    id: string;
    name?: string | null;
    email?: string | null;
    roles: string[];
    accessToken?: string;
}

/** ¿El usuario tiene el rol admin (del realm de Keycloak)? */
export function isAdmin(user?: { roles?: string[] } | null): boolean {
    return !!user?.roles?.includes('admin');
}

export const authOptions: NextAuthOptions = {
    providers: [
        KeycloakProvider({
            clientId: process.env.KEYCLOAK_CLIENT_ID!,
            clientSecret: '', // cliente público: PKCE, sin secret
            issuer: process.env.KEYCLOAK_ISSUER!,
        }),
    ],
    session: {
        strategy: 'jwt',
    },
    callbacks: {
        /**
         * Se ejecuta al iniciar sesión y al refrescar el token.
         * Extrae del token de Keycloak el access_token (para llamar a la API)
         * y los roles del realm (para UI condicional).
         */
        async jwt({ token, account, profile }) {
            if (account) {
                // Primer login: el account trae el access_token de Keycloak
                token.accessToken = account.access_token;
                // id_token se usa para el logout SSO (id_token_hint)
                token.idToken = account.id_token;
                // Los roles viven en realm_access del access_token de Keycloak
                token.roles = extractRoles(account.access_token);
                token.id = profile?.sub ?? token.sub;
            }
            return token;
        },
        async session({ session, token }) {
            // Expone el token y los roles al cliente
            if (session.user) {
                session.user.id = (token.id as string) ?? '';
                session.user.roles = (token.roles as string[]) ?? [];
                session.accessToken = token.accessToken as string;
            }
            return session;
        },
    },
    pages: {
        signIn: '/', // No página de login propia: redirige directo a Keycloak
    },
};

/**
 * Decodifica el payload de un JWT (sin verificar firma, solo lectura de claims).
 * Los roles del realm están en: accessToken -> realm_access.roles
 */
function extractRoles(accessToken?: string): string[] {
    if (!accessToken) return [];
    try {
        const payload = accessToken.split('.')[1];
        const decoded = JSON.parse(
            Buffer.from(payload, 'base64url').toString('utf-8'),
        );
        return (decoded.realm_access?.roles as string[]) ?? [];
    } catch {
        return [];
    }
}
