'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import type { User, Vehicle } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, User as UserIcon, Car, AlertTriangle, Phone, Mail, CreditCard, Calendar, Hash } from 'lucide-react';
import { toast } from 'sonner';

interface CitizenViolation {
  id: string;
  registrationNumber: string;
  violationTypeName: string;
  fineAmount: number;
  status: string;
  location?: string;
  dateTime: string;
  officerName: string;
}

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

export default function CheckCitizenPage() {
  const [citizenId, setCitizenId] = useState('');
  const [loading, setLoading] = useState(false);
  const [citizen, setCitizen] = useState<(User & { vehicles?: Vehicle[] }) | null>(null);
  const [violations, setViolations] = useState<CitizenViolation[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    const trimmed = citizenId.trim();
    if (!trimmed) {
      toast.error('Please enter a Citizen ID');
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const data = await api.checkCitizen(trimmed);
      setCitizen(data.citizen);
      setViolations(data.violations || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to find citizen';
      toast.error(message);
      setCitizen(null);
      setViolations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const totalFines = violations.reduce((sum, v) => sum + v.fineAmount, 0);
  const pendingFines = violations.filter((v) => v.status === 'pending').reduce((sum, v) => sum + v.fineAmount, 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-[var(--c-accent-bg)] border border-[var(--c-accent-border)] flex items-center justify-center">
          <UserIcon className="h-5 w-5 text-[var(--c-accent-text)]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[var(--c-text)]">Check Citizen</h2>
          <p className="text-sm text-[var(--c-text-subtle)]">Search by Citizen ID to view details</p>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="bg-[var(--c-card)] border-[var(--c-border)]">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--c-text-subtle)]" />
              <Input
                placeholder="Enter Citizen ID (e.g., CIV-2025-1234)"
                value={citizenId}
                onChange={(e) => setCitizenId(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-9 bg-[var(--c-bg)] border-[var(--c-input-border)] text-[var(--c-text)] placeholder:text-[var(--c-text-subtle)]"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={loading}
              className="bg-[var(--c-accent)] hover:bg-[var(--c-accent-hover)] text-white"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Searching...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Search
                </span>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* No Result */}
      {searched && !citizen && !loading && (
        <Card className="bg-[var(--c-card)] border-[var(--c-border)]">
          <CardContent className="py-12 text-center">
            <UserIcon className="h-12 w-12 text-[var(--c-text-subtle)] mx-auto mb-3" />
            <p className="text-[var(--c-text-muted)] text-lg font-medium">Citizen not found</p>
            <p className="text-[var(--c-text-subtle)] text-sm mt-1">No citizen found with ID &quot;{citizenId}&quot;</p>
          </CardContent>
        </Card>
      )}

      {/* Citizen Details */}
      {citizen && (
        <>
          {/* Info Card */}
          <Card className="bg-[var(--c-card)] border-[var(--c-border)]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-[var(--c-text)] flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-[var(--c-accent-text)]" />
                Citizen Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="h-14 w-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-xl font-bold text-emerald-400">
                  {citizen.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[var(--c-text)]">{citizen.name}</h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                    Citizen
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-3 py-2">
                  <Hash className="h-4 w-4 text-[var(--c-text-subtle)] shrink-0" />
                  <div>
                    <p className="text-xs text-[var(--c-text-subtle)]">Citizen ID</p>
                    <p className="text-sm text-[var(--c-accent-text)] font-mono font-semibold">{citizen.citizenId || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 py-2">
                  <Mail className="h-4 w-4 text-[var(--c-text-subtle)] shrink-0" />
                  <div>
                    <p className="text-xs text-[var(--c-text-subtle)]">Email</p>
                    <p className="text-sm text-[var(--c-text)]">{citizen.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 py-2">
                  <Phone className="h-4 w-4 text-[var(--c-text-subtle)] shrink-0" />
                  <div>
                    <p className="text-xs text-[var(--c-text-subtle)]">Phone</p>
                    <p className="text-sm text-[var(--c-text)]">{citizen.phone || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 py-2">
                  <CreditCard className="h-4 w-4 text-[var(--c-text-subtle)] shrink-0" />
                  <div>
                    <p className="text-xs text-[var(--c-text-subtle)]">NID</p>
                    <p className="text-sm text-[var(--c-text)]">{citizen.nid || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 py-2">
                  <Calendar className="h-4 w-4 text-[var(--c-text-subtle)] shrink-0" />
                  <div>
                    <p className="text-xs text-[var(--c-text-subtle)]">Member Since</p>
                    <p className="text-sm text-[var(--c-text)]">{new Date(citizen.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="bg-[var(--c-card)] border-[var(--c-border)]">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-[var(--c-text-subtle)] mb-1">Total Violations</p>
                <p className="text-xl font-bold text-[var(--c-text)]">{violations.length}</p>
              </CardContent>
            </Card>
            <Card className="bg-[var(--c-card)] border-[var(--c-border)]">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-[var(--c-text-subtle)] mb-1">Pending</p>
                <p className="text-xl font-bold text-amber-400">{violations.filter(v => v.status === 'pending').length}</p>
              </CardContent>
            </Card>
            <Card className="bg-[var(--c-card)] border-[var(--c-border)]">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-[var(--c-text-subtle)] mb-1">Total Fines</p>
                <p className="text-xl font-bold text-[var(--c-text)]">৳{totalFines.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card className="bg-[var(--c-card)] border-[var(--c-border)]">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-[var(--c-text-subtle)] mb-1">Pending Amount</p>
                <p className="text-xl font-bold text-red-400">৳{pendingFines.toLocaleString()}</p>
              </CardContent>
            </Card>
          </div>

          {/* Vehicles */}
          <Card className="bg-[var(--c-card)] border-[var(--c-border)]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-[var(--c-text)] flex items-center gap-2">
                <Car className="h-4 w-4 text-cyan-400" />
                Registered Vehicles ({citizen.vehicles?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(!citizen.vehicles || citizen.vehicles.length === 0) ? (
                <p className="text-[var(--c-text-subtle)] text-sm py-4 text-center">No vehicles registered</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {citizen.vehicles.map((v) => (
                    <div key={v.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-[var(--c-bg)] border border-[var(--c-border)]">
                      <div className="flex items-center gap-3">
                        <Car className="h-4 w-4 text-[var(--c-text-subtle)]" />
                        <span className="text-[var(--c-text)] font-mono text-sm">{v.registrationNumber}</span>
                      </div>
                      {v.vehicleType && (
                        <span className="text-[var(--c-text-muted)] text-xs">{v.vehicleType}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Violations */}
          <Card className="bg-[var(--c-card)] border-[var(--c-border)]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-[var(--c-text)] flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                Violation History ({violations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {violations.length === 0 ? (
                <p className="text-[var(--c-text-subtle)] text-sm py-4 text-center">No violations found</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--c-border)]">
                        <th className="text-left py-2 px-3 text-[var(--c-text-muted)] font-medium">Vehicle</th>
                        <th className="text-left py-2 px-3 text-[var(--c-text-muted)] font-medium">Violation</th>
                        <th className="text-left py-2 px-3 text-[var(--c-text-muted)] font-medium">Location</th>
                        <th className="text-left py-2 px-3 text-[var(--c-text-muted)] font-medium">Fine</th>
                        <th className="text-left py-2 px-3 text-[var(--c-text-muted)] font-medium">Status</th>
                        <th className="text-left py-2 px-3 text-[var(--c-text-muted)] font-medium">Officer</th>
                        <th className="text-left py-2 px-3 text-[var(--c-text-muted)] font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {violations.map((v) => (
                        <tr key={v.id} className="border-b border-[var(--c-border)] hover:bg-[var(--c-card-hover)]/30 transition-colors">
                          <td className="py-2.5 px-3 text-[var(--c-text)] font-mono text-xs">{v.registrationNumber}</td>
                          <td className="py-2.5 px-3 text-[var(--c-text)]">{v.violationTypeName}</td>
                          <td className="py-2.5 px-3 text-[var(--c-text-muted)]">{v.location || '—'}</td>
                          <td className="py-2.5 px-3 text-[var(--c-text)] font-medium">৳{v.fineAmount.toLocaleString()}</td>
                          <td className="py-2.5 px-3"><StatusBadge status={v.status} /></td>
                          <td className="py-2.5 px-3 text-[var(--c-text-muted)]">{v.officerName}</td>
                          <td className="py-2.5 px-3 text-[var(--c-text-muted)] text-xs">{new Date(v.dateTime).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
