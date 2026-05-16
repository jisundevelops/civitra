'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Shield, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';

export default function LoginPage() {
  const { login, setCurrentPage } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const res = await api.login(email, password);
      login(res.token, res.user);
      toast.success('Welcome back!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--c-bg)] px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-cyan-500/5" />
      <Card className="w-full max-w-md relative bg-[var(--c-card)] border-[var(--c-border)] shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 h-14 w-14 rounded-xl bg-[var(--c-accent-bg)] border border-[var(--c-accent-border)] flex items-center justify-center">
            <Shield className="h-7 w-7 text-[var(--c-accent-text)]" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--c-text)] tracking-wide">CIVITRA</h1>
          <CardDescription className="text-[var(--c-text-muted)]">
            Traffic Management System
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[var(--c-text-muted)] text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[var(--c-input)] border-[var(--c-input-border)] text-[var(--c-text)] placeholder:text-[var(--c-text-subtle)] focus:border-[var(--c-accent)] focus:ring-[var(--c-accent)]/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[var(--c-text-muted)] text-sm">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-[var(--c-input)] border-[var(--c-input-border)] text-[var(--c-text)] placeholder:text-[var(--c-text-subtle)] focus:border-[var(--c-accent)] focus:ring-[var(--c-accent)]/20 pr-10"
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
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--c-accent)] hover:bg-[var(--c-accent-hover)] text-white font-medium"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing In...
                </span>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
          <div className="mt-6 flex flex-col gap-2 text-center text-sm">
            <button
              onClick={() => setCurrentPage('forgot-password')}
              className="text-[var(--c-text-muted)] hover:text-[var(--c-accent-text)] transition-colors"
            >
              Forgot Password?
            </button>
            <button
              onClick={() => setCurrentPage('register')}
              className="text-[var(--c-text-muted)] hover:text-[var(--c-accent-text)] transition-colors"
            >
              Don&apos;t have an account? <span className="text-[var(--c-accent-text)] font-medium">Create Account</span>
            </button>
            <button
              onClick={() => setCurrentPage('landing')}
              className="text-[var(--c-text-subtle)] hover:text-[var(--c-text-muted)] transition-colors mt-2 inline-flex items-center justify-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Home
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
