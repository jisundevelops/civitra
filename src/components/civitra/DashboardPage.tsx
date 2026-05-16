'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import type { AdminStats, Violation } from '@/types';
import { AlertTriangle, CreditCard, Users, TrendingUp, Car, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    paid: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    cancelled: 'bg-red-500/15 text-red-400 border-red-500/30',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${colors[status] || 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: string | number; icon: React.ReactNode; color: string }) {
  return (
    <Card className="bg-[var(--c-card)] border-[var(--c-border)] hover:border-[var(--c-input-border)] transition-colors">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[var(--c-text-muted)] mb-1">{title}</p>
            <p className="text-2xl font-bold text-[var(--c-text)]">{value}</p>
          </div>
          <div className={`h-11 w-11 rounded-lg flex items-center justify-center ${color}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RecentViolationsTable({ violations }: { violations: Violation[] }) {
  if (violations.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--c-text-subtle)]">
        No recent violations found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--c-border)]">
            <th className="text-left py-3 px-2 text-[var(--c-text-muted)] font-medium">Vehicle</th>
            <th className="text-left py-3 px-2 text-[var(--c-text-muted)] font-medium">Violation</th>
            <th className="text-left py-3 px-2 text-[var(--c-text-muted)] font-medium">Fine</th>
            <th className="text-left py-3 px-2 text-[var(--c-text-muted)] font-medium">Status</th>
            <th className="text-left py-3 px-2 text-[var(--c-text-muted)] font-medium">Date</th>
          </tr>
        </thead>
        <tbody>
          {violations.map((v) => (
            <tr key={v.id} className="border-b border-[var(--c-border)] hover:bg-zinc-800/20 transition-colors">
              <td className="py-3 px-2 text-[var(--c-text)] font-mono text-xs">{v.registrationNumber || '—'}</td>
              <td className="py-3 px-2 text-[var(--c-text)]">{v.violationTypeName || '—'}</td>
              <td className="py-3 px-2 text-[var(--c-text)] font-medium">৳{v.fineAmount.toLocaleString()}</td>
              <td className="py-3 px-2"><StatusBadge status={v.status} /></td>
              <td className="py-3 px-2 text-[var(--c-text-muted)] text-xs">{new Date(v.dateTime).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [myViolations, setMyViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      if (user?.role === 'admin') {
        const data = await api.getStats();
        setStats(data);
      } else if (user?.role === 'police') {
        const data = await api.getViolations({ limit: 5 });
        setMyViolations(data);
        const allData = await api.getViolations();
        setStats({
          totalViolations: allData.length,
          pendingViolations: allData.filter((v: Violation) => v.status === 'pending').length,
          totalRevenue: allData.filter((v: Violation) => v.status === 'paid').reduce((s: number, v: Violation) => s + v.fineAmount, 0),
          totalCitizens: 0,
          totalPolice: 0,
          recentViolations: allData.slice(0, 5),
        });
      } else {
        const data = await api.getMyViolations();
        setMyViolations(data);
        setStats({
          totalViolations: data.length,
          pendingViolations: data.filter((v: Violation) => v.status === 'pending').length,
          totalRevenue: data.filter((v: Violation) => v.status === 'paid').reduce((s: number, v: Violation) => s + v.fineAmount, 0),
          totalCitizens: 0,
          totalPolice: 0,
          recentViolations: data.slice(0, 5),
        });
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64 bg-[var(--c-card)]" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 bg-[var(--c-card)]" />
          ))}
        </div>
        <Skeleton className="h-64 bg-[var(--c-card)]" />
      </div>
    );
  }

  const greeting = user?.name ? `Welcome back, ${user.name.split(' ')[0]}!` : 'Welcome!';
  const recentViolations = stats?.recentViolations || myViolations.slice(0, 5);

  return (
    <div className="space-y-6 animate-fadeIn">
      <h2 className="text-xl font-bold text-[var(--c-text)]">{greeting}</h2>

      {user?.role === 'admin' && stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Violations" value={stats.totalViolations} icon={<AlertTriangle className="h-5 w-5 text-amber-400" />} color="bg-amber-500/15" />
          <StatCard title="Pending Fines" value={stats.pendingViolations} icon={<CreditCard className="h-5 w-5 text-red-400" />} color="bg-red-500/15" />
          <StatCard title="Revenue" value={`৳${stats.totalRevenue.toLocaleString()}`} icon={<TrendingUp className="h-5 w-5 text-emerald-400" />} color="bg-emerald-500/15" />
          <StatCard title="Citizens" value={stats.totalCitizens} icon={<Users className="h-5 w-5 text-cyan-400" />} color="bg-cyan-500/15" />
        </div>
      )}

      {user?.role === 'citizen' && stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="Total Violations" value={stats.totalViolations} icon={<AlertTriangle className="h-5 w-5 text-amber-400" />} color="bg-amber-500/15" />
          <StatCard title="Pending" value={stats.pendingViolations} icon={<CreditCard className="h-5 w-5 text-red-400" />} color="bg-red-500/15" />
          <StatCard title="Paid" value={`৳${stats.totalRevenue.toLocaleString()}`} icon={<ShieldCheck className="h-5 w-5 text-emerald-400" />} color="bg-emerald-500/15" />
        </div>
      )}

      {user?.role === 'police' && stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="Total Issued" value={stats.totalViolations} icon={<Car className="h-5 w-5 text-cyan-400" />} color="bg-cyan-500/15" />
          <StatCard title="Pending" value={stats.pendingViolations} icon={<AlertTriangle className="h-5 w-5 text-amber-400" />} color="bg-amber-500/15" />
          <StatCard title="Collected" value={`৳${stats.totalRevenue.toLocaleString()}`} icon={<TrendingUp className="h-5 w-5 text-emerald-400" />} color="bg-emerald-500/15" />
        </div>
      )}

      <Card className="bg-[var(--c-card)] border-[var(--c-border)]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-[var(--c-text)]">Recent Violations</CardTitle>
        </CardHeader>
        <CardContent className="p-0 px-2 pb-2">
          <RecentViolationsTable violations={recentViolations} />
        </CardContent>
      </Card>
    </div>
  );
}
