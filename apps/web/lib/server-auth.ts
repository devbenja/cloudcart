import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from './auth';

/**
 * Guarda server-side para rutas del panel admin.
 * Redirige al login si no hay sesión, y al home con error si no es admin.
 */
export async function requireAdmin(): Promise<void> {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect('/api/auth/signin?callbackUrl=/dashboard');
    }
    if (!session.user.roles?.includes('admin')) {
        redirect('/?error=forbidden');
    }
}
