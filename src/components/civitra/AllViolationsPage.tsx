'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Violation } from '@/types';
import UpdateViolationDialog from './UpdateViolationDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, AlertTriangle, Pencil } from 'lucide-react';

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    paid: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    cancelled: 'bg-red-500/15 text-red-400 border-red-500/30',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${colors[status] || 'bg-[var(--c-accent-bg)] text-[var(--c-text-muted)] border-[var(--c-accent-border)]'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function AllViolationsPage() {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadViolations();
  }, [statusFilter]);

  const loadViolations = async (searchTerm?: string) => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchTerm) params.search = searchTerm;
      const data = await api.getViolations(params);
      setViolations(data);
    } catch (err) {
      console.error('Failed to load violations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    if (searchTimeout) clearTimeout(searchTimeout);
    const timeout = setTimeout(() => {
      loadViolations(value);
    }, 400);
    setSearchTimeout(timeout);
  };

  const handleUpdateClick = (violation: Violation) => {
    setSelectedViolation(violation);
    setDialogOpen(true);
  };

  const handleUpdateSuccess = () => {
    setDialogOpen(false);
    setSelectedViolation(null);
    loadViolations(search);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <h2 className="text-xl font-bold text-[var(--c-text)]">All Violations</h2>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--c-text-subtle)]" />
          <Input
            placeholder="Search by vehicle, owner, or violation..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 bg-[var(--c-card)] border-[var(--c-input-border)] text-[var(--c-text)] placeholder:text-[var(--c-text-subtle)]"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40 bg-[var(--c-card)] border-[var(--c-input-border)] text-[var(--c-text)]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-[var(--c-card)] border-[var(--c-input-border)]">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
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
            <p className="text-[var(--c-text-muted)] text-lg font-medium">No violations found</p>
            <p className="text-[var(--c-text-subtle)] text-sm mt-1">Try adjusting your search or filter</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-[var(--c-card)] border-[var(--c-border)]">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--c-border)]">
                    <th className="text-left py-3 px-4 text-[var(--c-text-muted)] font-medium">Vehicle</th>
                    <th className="text-left py-3 px-4 text-[var(--c-text-muted)] font-medium">Owner</th>
                    <th className="text-left py-3 px-4 text-[var(--c-text-muted)] font-medium">Violation</th>
                    <th className="text-left py-3 px-4 text-[var(--c-text-muted)] font-medium">Location</th>
                    <th className="text-left py-3 px-4 text-[var(--c-text-muted)] font-medium">Fine</th>
                    <th className="text-left py-3 px-4 text-[var(--c-text-muted)] font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-[var(--c-text-muted)] font-medium">Officer</th>
                    <th className="text-left py-3 px-4 text-[var(--c-text-muted)] font-medium">Date</th>
                    <th className="text-left py-3 px-4 text-[var(--c-text-muted)] font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {violations.map((v) => (
                    <tr key={v.id} className="border-b border-[var(--c-border)] hover:bg-[var(--c-card-hover)]/30 transition-colors">
                      <td className="py-3 px-4 text-[var(--c-text)] font-mono text-xs">{v.registrationNumber || '—'}</td>
                      <td className="py-3 px-4 text-[var(--c-text)]">{v.ownerName || '—'}</td>
                      <td className="py-3 px-4 text-[var(--c-text)]">{v.violationTypeName || '—'}</td>
                      <td className="py-3 px-4 text-[var(--c-text-muted)]">{v.location || '—'}</td>
                      <td className="py-3 px-4 text-[var(--c-text)] font-medium">৳{v.fineAmount.toLocaleString()}</td>
                      <td className="py-3 px-4"><StatusBadge status={v.status} /></td>
                      <td className="py-3 px-4 text-[var(--c-text-muted)]">{v.officerName || '—'}</td>
                      <td className="py-3 px-4 text-[var(--c-text-muted)] text-xs">{new Date(v.dateTime).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleUpdateClick(v)}
                          className="text-[var(--c-text-muted)] hover:text-[var(--c-accent-text)] hover:bg-[var(--c-accent-bg)] h-7 text-xs"
                        >
                          <Pencil className="h-3 w-3 mr-1" />
                          Update
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <UpdateViolationDialog
        violation={selectedViolation}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleUpdateSuccess}
      />
    </div>
  );
}
