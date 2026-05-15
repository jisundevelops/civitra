'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';

export default function LoginPage() {
  const { login, setCurrentPage } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-cyan-500/5" />
      <Card className="w-full max-w-md relative bg-[#16161f] border-zinc-800/50 shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 h-14 w-14 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
            <Shield className="h-7 w-7 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">CIVITRA</h1>
          <CardDescription className="text-zinc-400">
            Traffic Management System
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300 text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#0a0a0f] border-zinc-700 text-zinc-200 placeholder:text-zinc-600 focus:border-indigo-500 focus:ring-indigo-500/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300 text-sm">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-[#0a0a0f] border-zinc-700 text-zinc-200 placeholder:text-zinc-600 focus:border-indigo-500 focus:ring-indigo-500/20"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
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
              className="text-zinc-400 hover:text-indigo-400 transition-colors"
            >
              Forgot Password?
            </button>
            <button
              onClick={() => setCurrentPage('register')}
              className="text-zinc-400 hover:text-indigo-400 transition-colors"
            >
              Don&apos;t have an account? <span className="text-indigo-400 font-medium">Create Account</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
