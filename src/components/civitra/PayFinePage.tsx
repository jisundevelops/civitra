'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import type { Violation } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, CreditCard, ArrowLeft, Receipt } from 'lucide-react';
import { toast } from 'sonner';

export default function PayFinePage() {
  const { selectedViolationId, setCurrentPage } = useAuth();
  const [violationId, setViolationId] = useState(selectedViolationId || '');
  const [violation, setViolation] = useState<Violation | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingViolation, setFetchingViolation] = useState(false);
  const [receipt, setReceipt] = useState<{ receiptNumber: string; amount: number } | null>(null);

  useEffect(() => {
    if (selectedViolationId) {
      setViolationId(selectedViolationId);
      fetchViolationDetails(selectedViolationId);
    }
  }, [selectedViolationId]);

  const fetchViolationDetails = async (id: string) => {
    if (!id) return;
    setFetchingViolation(true);
    try {
      const violations = await api.getMyViolations();
      const found = violations.find((v) => v.id === id);
      if (found) {
        setViolation(found);
      }
    } catch (err) {
      console.error('Failed to fetch violation details:', err);
    } finally {
      setFetchingViolation(false);
    }
  };

  const handleViolationIdChange = (value: string) => {
    setViolationId(value);
    setViolation(null);
    setReceipt(null);
  };

  const handleLookup = async () => {
    if (!violationId) {
      toast.error('Please enter a violation ID');
      return;
    }
    await fetchViolationDetails(violationId);
  };

  const handlePay = async () => {
    if (!violationId) {
      toast.error('Please enter a violation ID');
      return;
    }
    setLoading(true);
    try {
      const result = await api.payFine(violationId);
      setReceipt({
        receiptNumber: result.receipt_number,
        amount: result.amount,
      });
      toast.success('Payment successful!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Payment failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (receipt) {
    return (
      <div className="max-w-lg mx-auto animate-fadeIn">
        <Card className="bg-[var(--c-card)] border-[var(--c-border)] shadow-xl">
          <CardContent className="pt-8 text-center space-y-6">
            <div className="mx-auto h-20 w-20 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[var(--c-text)]">Payment Successful!</h3>
              <p className="text-[var(--c-text-muted)] text-sm mt-1">Your fine has been paid successfully</p>
            </div>
            <div className="bg-[var(--c-bg)] rounded-lg p-5 space-y-3 text-left">
              <div className="flex justify-between items-center">
                <span className="text-[var(--c-text-muted)] text-sm">Receipt Number</span>
                <span className="text-[var(--c-text)] font-mono font-medium">{receipt.receiptNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--c-text-muted)] text-sm">Amount Paid</span>
                <span className="text-emerald-400 font-bold text-lg">৳{receipt.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--c-text-muted)] text-sm">Date</span>
                <span className="text-[var(--c-text)]">{new Date().toLocaleDateString()}</span>
              </div>
            </div>
            <Button
              onClick={() => setCurrentPage('my-violations')}
              className="bg-[var(--c-accent)] hover:bg-[var(--c-accent-hover)] text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Violations
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto animate-fadeIn">
      <Card className="bg-[var(--c-card)] border-[var(--c-border)] shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/15 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <CardTitle className="text-lg text-[var(--c-text)]">Pay Fine</CardTitle>
              <CardDescription className="text-[var(--c-text-muted)]">Pay a pending violation fine</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label className="text-[var(--c-text)] text-sm">Violation ID</Label>
            <div className="flex gap-2">
              <Input
                value={violationId}
                onChange={(e) => handleViolationIdChange(e.target.value)}
                placeholder="Enter violation ID"
                className="bg-[var(--c-bg)] border-[var(--c-input-border)] text-[var(--c-text)] placeholder:text-[var(--c-text-subtle)] font-mono text-sm"
              />
              {!selectedViolationId && (
                <Button
                  variant="ghost"
                  onClick={handleLookup}
                  disabled={fetchingViolation}
                  className="text-[var(--c-text-muted)] hover:text-[var(--c-text)] hover:bg-zinc-800 whitespace-nowrap"
                >
                  Lookup
                </Button>
              )}
            </div>
          </div>

          {fetchingViolation && (
            <div className="text-center py-4 text-[var(--c-text-muted)] text-sm">Loading violation details...</div>
          )}

          {violation && !fetchingViolation && (
            <div className="bg-[var(--c-bg)] rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[var(--c-text-muted)] text-sm">Vehicle</span>
                <span className="text-[var(--c-text)] font-mono">{violation.registrationNumber || '—'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--c-text-muted)] text-sm">Violation</span>
                <span className="text-[var(--c-text)]">{violation.violationTypeName || '—'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--c-text-muted)] text-sm">Location</span>
                <span className="text-[var(--c-text)]">{violation.location || '—'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--c-text-muted)] text-sm">Status</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded border ${
                  violation.status === 'pending'
                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    : violation.status === 'paid'
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : 'bg-red-500/15 text-red-400 border-red-500/30'
                }`}>
                  {violation.status.charAt(0).toUpperCase() + violation.status.slice(1)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-[var(--c-border)]">
                <span className="text-[var(--c-text)] font-medium">Fine Amount</span>
                <span className="text-[var(--c-text)] font-bold text-lg">৳{violation.fineAmount.toLocaleString()}</span>
              </div>
            </div>
          )}

          {violation && violation.status !== 'pending' && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-sm text-amber-400">
              This violation is already {violation.status}. Only pending violations can be paid.
            </div>
          )}

          <Button
            onClick={handlePay}
            disabled={loading || !violationId || (violation !== null && violation.status !== 'pending')}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing Payment...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                Confirm Payment
              </span>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
