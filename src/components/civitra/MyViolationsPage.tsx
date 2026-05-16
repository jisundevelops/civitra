'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import type { Violation } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CreditCard, AlertTriangle } from 'lucide-react';

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

const statusFilters = ['all', 'pending', 'paid', 'cancelled'] as const;

export default function MyViolationsPage() {
  const { setCurrentPage, setSelectedViolationId } = useAuth();
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  useEffect(() => {
    loadViolations();
  }, [activeFilter]);

  const loadViolations = async () => {
    setLoading(true);
    try {
      const params = activeFilter !== 'all' ? { status: activeFilter } : {};
      const data = await api.getMyViolations(params);
      setViolations(data);
    } catch (err) {
      console.error('Failed to load violations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = (violationId: string) => {
    setSelectedViolationId(violationId);
    setCurrentPage('pay-fine');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <h2 className="text-xl font-bold text-[var(--c-text)]">My Violations</h2>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {statusFilters.map((filter) => (
          <Button
            key={filter}
            variant={activeFilter === filter ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveFilter(filter)}
            className={activeFilter === filter ? 'bg-[var(--c-accent)] hover:bg-[var(--c-accent-hover)] text-white' : 'text-[var(--c-text-muted)] hover:text-[var(--c-text)] hover:bg-zinc-800'}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 bg-[var(--c-card)]" />
          ))}
        </div>
      ) : violations.length === 0 ? (
        <Card className="bg-[var(--c-card)] border-[var(--c-border)]">
          <CardContent className="py-12 text-center">
            <AlertTriangle className="h-12 w-12 text-[var(--c-text-subtle)] mx-auto mb-3" />
            <p className="text-[var(--c-text-muted)] text-lg font-medium">No violations found 🎉</p>
            <p className="text-[var(--c-text-subtle)] text-sm mt-1">You&apos;re a responsible driver!</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-[var(--c-card)] border-[var(--c-border)]">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--c-border)]">
                    <th className="text-left py-3 px-4 text-[var(--c-text-muted)] font-medium">#</th>
                    <th className="text-left py-3 px-4 text-[var(--c-text-muted)] font-medium">Vehicle</th>
                    <th className="text-left py-3 px-4 text-[var(--c-text-muted)] font-medium">Violation</th>
                    <th className="text-left py-3 px-4 text-[var(--c-text-muted)] font-medium">Location</th>
                    <th className="text-left py-3 px-4 text-[var(--c-text-muted)] font-medium">Fine</th>
                    <th className="text-left py-3 px-4 text-[var(--c-text-muted)] font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-[var(--c-text-muted)] font-medium">Date</th>
                    <th className="text-left py-3 px-4 text-[var(--c-text-muted)] font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {violations.map((v, i) => (
                    <tr key={v.id} className="border-b border-[var(--c-border)] hover:bg-zinc-800/20 transition-colors">
                      <td className="py-3 px-4 text-[var(--c-text-subtle)]">{i + 1}</td>
                      <td className="py-3 px-4 text-[var(--c-text)] font-mono text-xs">{v.registrationNumber || '—'}</td>
                      <td className="py-3 px-4 text-[var(--c-text)]">{v.violationTypeName || '—'}</td>
                      <td className="py-3 px-4 text-[var(--c-text-muted)]">{v.location || '—'}</td>
                      <td className="py-3 px-4 text-[var(--c-text)] font-medium">৳{v.fineAmount.toLocaleString()}</td>
                      <td className="py-3 px-4"><StatusBadge status={v.status} /></td>
                      <td className="py-3 px-4 text-[var(--c-text-muted)] text-xs">{new Date(v.dateTime).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        {v.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => handlePayNow(v.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-7"
                          >
                            <CreditCard className="h-3 w-3 mr-1" />
                            Pay
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
