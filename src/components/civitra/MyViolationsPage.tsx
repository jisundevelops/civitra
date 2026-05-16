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
      <h2 className="text-xl font-bold text-white">My Violations</h2>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {statusFilters.map((filter) => (
          <Button
            key={filter}
            variant={activeFilter === filter ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveFilter(filter)}
            className={activeFilter === filter ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 bg-[#16161f]" />
          ))}
        </div>
      ) : violations.length === 0 ? (
        <Card className="bg-[#16161f] border-zinc-800/50">
          <CardContent className="py-12 text-center">
            <AlertTriangle className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-400 text-lg font-medium">No violations found 🎉</p>
            <p className="text-zinc-500 text-sm mt-1">You&apos;re a responsible driver!</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-[#16161f] border-zinc-800/50">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">#</th>
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">Vehicle</th>
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">Violation</th>
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">Location</th>
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">Fine</th>
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">Date</th>
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {violations.map((v, i) => (
                    <tr key={v.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                      <td className="py-3 px-4 text-zinc-500">{i + 1}</td>
                      <td className="py-3 px-4 text-zinc-200 font-mono text-xs">{v.registrationNumber || '—'}</td>
                      <td className="py-3 px-4 text-zinc-300">{v.violationTypeName || '—'}</td>
                      <td className="py-3 px-4 text-zinc-400">{v.location || '—'}</td>
                      <td className="py-3 px-4 text-zinc-200 font-medium">৳{v.fineAmount.toLocaleString()}</td>
                      <td className="py-3 px-4"><StatusBadge status={v.status} /></td>
                      <td className="py-3 px-4 text-zinc-400 text-xs">{new Date(v.dateTime).toLocaleDateString()}</td>
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
