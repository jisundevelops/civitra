'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function AddOfficerPage() {
  const [addForm, setAddForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [addLoading, setAddLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create officer';
      toast.error(message);
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center">
          <Shield className="h-5 w-5 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[var(--c-text)]">Add Officer</h2>
          <p className="text-sm text-[var(--c-text-subtle)]">Create a new traffic police officer account</p>
        </div>
      </div>

      <Card className="bg-[var(--c-card)] border-[var(--c-accent-border)] max-w-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-[var(--c-text)] flex items-center gap-2">
            <Shield className="h-4 w-4 text-cyan-400" />
            Officer Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddOfficer} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[var(--c-text)] text-sm">Full Name *</Label>
              <Input
                value={addForm.name}
                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                placeholder="Enter full name"
                className="bg-[var(--c-bg)] border-[var(--c-input-border)] text-[var(--c-text)] placeholder:text-[var(--c-text-subtle)] h-10"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[var(--c-text)] text-sm">Email *</Label>
              <Input
                type="email"
                value={addForm.email}
                onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                placeholder="officer@example.com"
                className="bg-[var(--c-bg)] border-[var(--c-input-border)] text-[var(--c-text)] placeholder:text-[var(--c-text-subtle)] h-10"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[var(--c-text)] text-sm">Password *</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={addForm.password}
                  onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                  placeholder="Min 6 characters"
                  className="bg-[var(--c-bg)] border-[var(--c-input-border)] text-[var(--c-text)] placeholder:text-[var(--c-text-subtle)] h-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--c-text-subtle)] hover:text-[var(--c-text)] transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[var(--c-text)] text-sm">Phone</Label>
              <Input
                value={addForm.phone}
                onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                placeholder="+880..."
                className="bg-[var(--c-bg)] border-[var(--c-input-border)] text-[var(--c-text)] placeholder:text-[var(--c-text-subtle)] h-10"
              />
            </div>
            <div className="sm:col-span-2 pt-2">
              <Button type="submit" disabled={addLoading} className="bg-cyan-600 hover:bg-cyan-700 text-white px-8">
                {addLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Create Officer
                  </span>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
