'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { User } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Users, UserCheck, UserX } from 'lucide-react';
import { toast } from 'sonner';

function RoleBadge({ role }: { role: string }) {
  const colors: Record<string, string> = {
    admin: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
    police: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    citizen: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${colors[role] || 'bg-[var(--c-accent-bg)] text-[var(--c-text-muted)] border-[var(--c-accent-border)]'}`}>
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  const loadUsers = async (searchTerm?: string) => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (roleFilter !== 'all') params.role = roleFilter;
      if (searchTerm) params.search = searchTerm;
      const data = await api.getUsers(params);
      setUsers(data.users || data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    if (searchTimeout) clearTimeout(searchTimeout);
    const timeout = setTimeout(() => {
      loadUsers(value);
    }, 400);
    setSearchTimeout(timeout);
  };

  const handleToggleActive = async (user: User) => {
    try {
      await api.updateUser(user.id, { isActive: !user.isActive });
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'} successfully`);
      loadUsers(search);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update user';
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-[var(--c-accent-bg)] border border-[var(--c-accent-border)] flex items-center justify-center">
          <Users className="h-5 w-5 text-[var(--c-accent-text)]" />
        </div>
        <h2 className="text-xl font-bold text-[var(--c-text)]">Users</h2>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--c-text-subtle)]" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 bg-[var(--c-card)] border-[var(--c-input-border)] text-[var(--c-text)] placeholder:text-[var(--c-text-subtle)]"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-40 bg-[var(--c-card)] border-[var(--c-input-border)] text-[var(--c-text)]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent className="bg-[var(--c-card)] border-[var(--c-input-border)]">
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="police">Police</SelectItem>
            <SelectItem value="citizen">Citizen</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 bg-[var(--c-card)]" />
          ))}
        </div>
      ) : (
        <Card className="bg-[var(--c-card)] border-[var(--c-border)]">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--c-border)]">
                    <th className="text-left py-3 px-4 text-[var(--c-text-muted)] font-medium">Name</th>
                    <th className="text-left py-3 px-4 text-[var(--c-text-muted)] font-medium">Email</th>
                    <th className="text-left py-3 px-4 text-[var(--c-text-muted)] font-medium">Phone</th>
                    <th className="text-left py-3 px-4 text-[var(--c-text-muted)] font-medium">Role</th>
                    <th className="text-left py-3 px-4 text-[var(--c-text-muted)] font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-[var(--c-text-muted)] font-medium">Joined</th>
                    <th className="text-left py-3 px-4 text-[var(--c-text-muted)] font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-[var(--c-border)] hover:bg-[var(--c-card-hover)]/30 transition-colors">
                      <td className="py-3 px-4 text-[var(--c-text)] font-medium">{u.name}</td>
                      <td className="py-3 px-4 text-[var(--c-text-muted)] text-xs">{u.email}</td>
                      <td className="py-3 px-4 text-[var(--c-text-muted)]">{u.phone || '—'}</td>
                      <td className="py-3 px-4"><RoleBadge role={u.role} /></td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium ${u.isActive ? 'text-emerald-400' : 'text-red-400'}`}>
                          {u.isActive ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[var(--c-text-muted)] text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        {u.role !== 'admin' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleToggleActive(u)}
                            className={`text-xs h-7 ${u.isActive ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10' : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10'}`}
                          >
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
