'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { User } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Users, Shield, X, UserCheck, UserX } from 'lucide-react';
import { toast } from 'sonner';

function RoleBadge({ role }: { role: string }) {
  const colors: Record<string, string> = {
    admin: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
    police: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    citizen: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${colors[role] || 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30'}`}>
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [addLoading, setAddLoading] = useState(false);
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

  const handleAddOfficer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name || !addForm.email || !addForm.password) {
      toast.error('Please fill in all required fields');
      return;
    }
    setAddLoading(true);
    try {
      await api.createOfficer(addForm);
      toast.success('Officer created successfully');
      setAddForm({ name: '', email: '', password: '', phone: '' });
      setShowAddForm(false);
      loadUsers(search);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create officer';
      toast.error(message);
    } finally {
      setAddLoading(false);
    }
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
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Users</h2>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          {showAddForm ? <X className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
          {showAddForm ? 'Cancel' : 'Add Officer'}
        </Button>
      </div>

      {/* Add Officer Form */}
      {showAddForm && (
        <Card className="bg-[#16161f] border-indigo-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-zinc-200 flex items-center gap-2">
              <Shield className="h-4 w-4 text-cyan-400" />
              Add New Officer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddOfficer} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-zinc-300 text-xs">Name *</Label>
                <Input
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  placeholder="Full Name"
                  className="bg-[#0a0a0f] border-zinc-700 text-zinc-200 placeholder:text-zinc-600 h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-zinc-300 text-xs">Email *</Label>
                <Input
                  type="email"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  placeholder="Email"
                  className="bg-[#0a0a0f] border-zinc-700 text-zinc-200 placeholder:text-zinc-600 h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-zinc-300 text-xs">Password *</Label>
                <Input
                  type="password"
                  value={addForm.password}
                  onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                  placeholder="Min 6 characters"
                  className="bg-[#0a0a0f] border-zinc-700 text-zinc-200 placeholder:text-zinc-600 h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-zinc-300 text-xs">Phone</Label>
                <Input
                  value={addForm.phone}
                  onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                  placeholder="+880..."
                  className="bg-[#0a0a0f] border-zinc-700 text-zinc-200 placeholder:text-zinc-600 h-9"
                />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" disabled={addLoading} className="bg-cyan-600 hover:bg-cyan-700 text-white">
                  {addLoading ? 'Creating...' : 'Create Officer'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 bg-[#16161f] border-zinc-700 text-zinc-200 placeholder:text-zinc-600"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-40 bg-[#16161f] border-zinc-700 text-zinc-200">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent className="bg-[#16161f] border-zinc-700">
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
            <Skeleton key={i} className="h-16 bg-[#16161f]" />
          ))}
        </div>
      ) : (
        <Card className="bg-[#16161f] border-zinc-800/50">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">Name</th>
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">Email</th>
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">Phone</th>
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">Role</th>
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">Joined</th>
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                      <td className="py-3 px-4 text-zinc-200 font-medium">{u.name}</td>
                      <td className="py-3 px-4 text-zinc-400 text-xs">{u.email}</td>
                      <td className="py-3 px-4 text-zinc-400">{u.phone || '—'}</td>
                      <td className="py-3 px-4"><RoleBadge role={u.role} /></td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium ${u.isActive ? 'text-emerald-400' : 'text-red-400'}`}>
                          {u.isActive ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-zinc-400 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
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
