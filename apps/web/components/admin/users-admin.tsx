'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { api, type User, type UserRole } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface FormState {
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
}

const emptyForm: FormState = {
    email: '',
    firstName: '',
    lastName: '',
    role: 'customer',
};

export function UsersAdmin() {
    const { data: session } = useSession();
    const accessToken = session?.accessToken;

    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [form, setForm] = useState<FormState>(emptyForm);
    const [busyId, setBusyId] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    const load = useCallback(async () => {
        if (!accessToken) return;
        setLoading(true);
        setError(null);
        try {
            const res = await api.getUsers(accessToken);
            setUsers(res.data);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Error al cargar usuarios');
        } finally {
            setLoading(false);
        }
    }, [accessToken]);

    useEffect(() => {
        if (accessToken) void load();
    }, [accessToken, load]);

    // Filtro client-side por email o nombre completo
    const filteredUsers = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return users;
        return users.filter(
            (u) =>
                u.email.toLowerCase().includes(q) ||
                `${u.firstName} ${u.lastName}`.toLowerCase().includes(q),
        );
    }, [users, search]);

    const handleField = (field: keyof FormState) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        setForm((f) => ({ ...f, [field]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!accessToken) return;
        setSaving(true);
        setError(null);
        setMessage(null);
        try {
            await api.createUser(accessToken, form);
            setMessage('Usuario creado');
            setForm(emptyForm);
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al crear usuario');
        } finally {
            setSaving(false);
        }
    };

    const handleRole = async (u: User, role: UserRole) => {
        if (!accessToken || role === u.role) return;
        setBusyId(u.id);
        setError(null);
        setMessage(null);
        try {
            await api.updateUser(accessToken, u.id, { role });
            setMessage('Rol actualizado');
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cambiar rol');
        } finally {
            setBusyId(null);
        }
    };

    const handleToggleActive = async (u: User) => {
        if (!accessToken) return;
        setBusyId(u.id);
        setError(null);
        setMessage(null);
        try {
            await api.updateUser(accessToken, u.id, { isActive: !u.isActive });
            setMessage(u.isActive ? 'Usuario desactivado' : 'Usuario activado');
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al actualizar usuario');
        } finally {
            setBusyId(null);
        }
    };

    const handleDelete = async (u: User) => {
        if (!accessToken) return;
        if (!confirm(`¿Eliminar al usuario ${u.email}?`)) return;
        setError(null);
        setMessage(null);
        try {
            await api.deleteUser(accessToken, u.id);
            setMessage('Usuario eliminado');
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al eliminar usuario');
        }
    };

    const fmtDate = (iso: string) =>
        new Date(iso).toLocaleDateString('es-AR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });

    return (
        <div className="space-y-4">
            {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
            )}
            {message && (
                <div className="rounded-md bg-green-600/10 p-3 text-sm text-green-700">{message}</div>
            )}

            {/* Formulario crear */}
            <form
                onSubmit={handleSubmit}
                className="rounded-xl border bg-card p-6 space-y-4"
            >
                <h2 className="text-lg font-semibold">Crear usuario</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Email</label>
                        <Input
                            type="email"
                            value={form.email}
                            onChange={handleField('email')}
                            required
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Rol</label>
                        <select
                            value={form.role}
                            onChange={handleField('role')}
                            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                        >
                            <option value="customer">customer</option>
                            <option value="admin">admin</option>
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Nombre</label>
                        <Input value={form.firstName} onChange={handleField('firstName')} required />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Apellido</label>
                        <Input value={form.lastName} onChange={handleField('lastName')} required />
                    </div>
                </div>
                <Button type="submit" disabled={saving || !accessToken}>
                    {saving ? 'Creando...' : 'Crear usuario'}
                </Button>
            </form>

            {/* Tabla de usuarios */}
            <div className="rounded-xl border bg-card">
                <div className="flex flex-col gap-2 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-lg font-semibold">Usuarios ({users.length})</h2>
                    <Input
                        type="search"
                        placeholder="Buscar por email o nombre..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="sm:max-w-xs"
                    />
                </div>
                {loading ? (
                    <div className="space-y-3 p-6">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                ) : users.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">No hay usuarios aún.</div>
                ) : filteredUsers.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                        No se encontraron usuarios con ese filtro.
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Usuario</TableHead>
                                <TableHead>Rol</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Alta</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.map((u) => (
                                <TableRow key={u.id}>
                                    <TableCell>
                                        <div className="font-medium">{u.email}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {u.firstName} {u.lastName}
                                            {u.keycloakId ? ' · SSO' : ''}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <select
                                            value={u.role}
                                            disabled={busyId === u.id}
                                            onChange={(e) => handleRole(u, e.target.value as UserRole)}
                                            className="rounded-md border bg-background px-2 py-1 text-sm"
                                        >
                                            <option value="customer">customer</option>
                                            <option value="admin">admin</option>
                                        </select>
                                    </TableCell>
                                    <TableCell>
                                        {u.isActive ? (
                                            <Badge variant="success">Activo</Badge>
                                        ) : (
                                            <Badge variant="destructive">Inactivo</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{fmtDate(u.createdAt)}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={busyId === u.id}
                                                onClick={() => handleToggleActive(u)}
                                            >
                                                {u.isActive ? 'Desactivar' : 'Activar'}
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                disabled={busyId === u.id}
                                                onClick={() => handleDelete(u)}
                                            >
                                                Eliminar
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    );
}
