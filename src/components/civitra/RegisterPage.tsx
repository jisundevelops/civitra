'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';

export default function RegisterPage() {
  const { setCurrentPage } = useAuth();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    nid: '',
    vehicle_number: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error('Please fill in name, email, and password');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await api.register(form);
      toast.success('Account created successfully! Please sign in.');
      setCurrentPage('login');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--c-bg)] px-4 py-8">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-indigo-500/5" />
      <Card className="w-full max-w-md relative bg-[var(--c-card)] border-[var(--c-border)] shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 h-14 w-14 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
            <Shield className="h-7 w-7 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--c-text)]">Create Account</h1>
          <CardDescription className="text-[var(--c-text-muted)]">
            Join Civitra as a citizen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-[var(--c-text-muted)] text-sm">Full Name</Label>
                <Input
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  className="bg-[var(--c-input)] border-[var(--c-input-border)] text-[var(--c-text)] placeholder:text-[var(--c-text-subtle)]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[var(--c-text-muted)] text-sm">Phone</Label>
                <Input
                  placeholder="+880..."
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  className="bg-[var(--c-input)] border-[var(--c-input-border)] text-[var(--c-text)] placeholder:text-[var(--c-text-subtle)]"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[var(--c-text-muted)] text-sm">Email</Label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                className="bg-[var(--c-input)] border-[var(--c-input-border)] text-[var(--c-text)] placeholder:text-[var(--c-text-subtle)]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[var(--c-text-muted)] text-sm">Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  className="bg-[var(--c-input)] border-[var(--c-input-border)] text-[var(--c-text)] placeholder:text-[var(--c-text-subtle)] pr-10"
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
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-[var(--c-text-muted)] text-sm">NID Number</Label>
                <Input
                  placeholder="NID"
                  value={form.nid}
                  onChange={(e) => update('nid', e.target.value)}
                  className="bg-[var(--c-input)] border-[var(--c-input-border)] text-[var(--c-text)] placeholder:text-[var(--c-text-subtle)]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[var(--c-text-muted)] text-sm">Vehicle Reg.</Label>
                <Input
                  placeholder="DHA-1234"
                  value={form.vehicle_number}
                  onChange={(e) => update('vehicle_number', e.target.value)}
                  className="bg-[var(--c-input)] border-[var(--c-input-border)] text-[var(--c-text)] placeholder:text-[var(--c-text-subtle)]"
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Account...
                </span>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            <button
              onClick={() => setCurrentPage('login')}
              className="text-[var(--c-text-muted)] hover:text-[var(--c-accent-text)] transition-colors"
            >
              Already have an account? <span className="text-[var(--c-accent-text)] font-medium">Sign In</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
