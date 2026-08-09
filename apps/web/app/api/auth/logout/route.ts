import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Logout que cierra la sesión SSO de Keycloak además de borrar la cookie
 * local de next-auth. Sin esto, el signOut() de next-auth deja viva la
 * cookie KEYCLOAK_IDENTITY y el próximo "Iniciar sesión" no muestra el login
 * (Keycloak redirige automáticamente).
 *
 * Se pasa el id_token como id_token_hint: sin él, Keycloak muestra una
 * pantalla de confirmación de logout en vez de cerrar la sesión.
 */
export async function GET(req: NextRequest) {
    const issuer = process.env.KEYCLOAK_ISSUER!;
    const clientId = process.env.KEYCLOAK_CLIENT_ID!;
    const postLogoutUri =
        process.env.NEXTAUTH_URL || 'http://cloudcart.local';

    // Lee el id_token de la cookie de sesión de next-auth (JWT)
    const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
    });
    const idToken = token?.idToken as string | undefined;

    const endSessionUrl = new URL(
        `${issuer}/protocol/openid-connect/logout`,
    );
    endSessionUrl.searchParams.set('client_id', clientId);
    if (idToken) {
        endSessionUrl.searchParams.set('id_token_hint', idToken);
    }
    endSessionUrl.searchParams.set(
        'post_logout_redirect_uri',
        postLogoutUri,
    );

    const res = NextResponse.redirect(endSessionUrl.toString());
    // Borra las cookies de sesión de next-auth (dominio local)
    res.cookies.set('next-auth.session-token', '', {
        path: '/',
        maxAge: 0,
    });
    res.cookies.set('next-auth.csrf-token', '', {
        path: '/',
        maxAge: 0,
    });
    res.cookies.set('next-auth.callback-url', '', {
        path: '/',
        maxAge: 0,
    });
    return res;
}
