import { UsersAdmin } from '@/components/admin/users-admin';

export const metadata = {
    title: 'Usuarios',
};

export const dynamic = 'force-dynamic';

export default async function DashboardUsersPage() {
    return <UsersAdmin />;
}
