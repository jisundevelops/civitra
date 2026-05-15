'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Shield, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const { setCurrentPage } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    setLoading(true);
    try {
      const res = await api.forgotPassword(email);
      setDevOtp(res.otp || null);
      setStep(2);
      toast.success('OTP sent to your email');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send OTP';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !newPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await api.resetPassword(email, otp, newPassword);
      setSuccess(true);
      toast.success('Password reset successfully!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to reset password';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] px-4">
        <Card className="w-full max-w-md bg-[#16161f] border-zinc-800/50 shadow-2xl">
          <CardContent className="pt-8 text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-emerald-400 mx-auto" />
            <h2 className="text-xl font-bold text-white">Password Reset!</h2>
            <p className="text-zinc-400 text-sm">Your password has been successfully reset. You can now sign in with your new password.</p>
            <Button
              onClick={() => setCurrentPage('login')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Go to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-indigo-500/5" />
      <Card className="w-full max-w-md relative bg-[#16161f] border-zinc-800/50 shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 h-14 w-14 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
            <Shield className="h-7 w-7 text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Reset Password</h1>
          <CardDescription className="text-zinc-400">
            {step === 1 ? 'Enter your email to receive an OTP' : 'Enter the OTP and your new password'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-zinc-300 text-sm">Email Address</Label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[#0a0a0f] border-zinc-700 text-zinc-200 placeholder:text-zinc-600"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending OTP...
                  </span>
                ) : (
                  'Send OTP'
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {devOtp && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-sm">
                  <p className="text-amber-400 font-medium">Development OTP: <span className="font-mono text-lg">{devOtp}</span></p>
                </div>
              )}
              <div className="space-y-2">
                <Label className="text-zinc-300 text-sm">OTP Code</Label>
                <Input
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  className="bg-[#0a0a0f] border-zinc-700 text-zinc-200 placeholder:text-zinc-600 font-mono text-center text-lg tracking-widest"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300 text-sm">New Password</Label>
                <Input
                  type="password"
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-[#0a0a0f] border-zinc-700 text-zinc-200 placeholder:text-zinc-600"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Resetting...
                  </span>
                ) : (
                  'Reset Password'
                )}
              </Button>
            </form>
          )}
          <div className="mt-6 text-center">
            <button
              onClick={() => setCurrentPage('login')}
              className="text-sm text-zinc-400 hover:text-indigo-400 transition-colors inline-flex items-center gap-1"
            >
              <ArrowLeft className="h-3 w-3" />
              Back to Sign In
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
