'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Payment } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { History, Receipt } from 'lucide-react';

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const data = await api.getPaymentHistory();
      setPayments(data);
    } catch (err) {
      console.error('Failed to load payments:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <h2 className="text-xl font-bold text-[var(--c-text)]">Payment History</h2>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 bg-[var(--c-card)]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <h2 className="text-xl font-bold text-[var(--c-text)]">Payment History</h2>

      {payments.length === 0 ? (
        <Card className="bg-[var(--c-card)] border-[var(--c-border)]">
          <CardContent className="py-12 text-center">
            <History className="h-12 w-12 text-[var(--c-text-subtle)] mx-auto mb-3" />
            <p className="text-[var(--c-text-muted)] text-lg font-medium">No payments yet</p>
            <p className="text-[var(--c-text-subtle)] text-sm mt-1">Your payment history will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-[var(--c-card)] border-[var(--c-border)]">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--c-border)]">
                    <th className="text-left py-3 px-4 text-[var(--c-text-muted)] font-medium">Receipt #</th>
                    <th className="text-left py-3 px-4 text-[var(--c-text-muted)] font-medium">Vehicle</th>
                    <th className="text-left py-3 px-4 text-[var(--c-text-muted)] font-medium">Violation</th>
                    <th className="text-left py-3 px-4 text-[var(--c-text-muted)] font-medium">Amount</th>
                    <th className="text-left py-3 px-4 text-[var(--c-text-muted)] font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} className="border-b border-[var(--c-border)] hover:bg-zinc-800/20 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Receipt className="h-3.5 w-3.5 text-[var(--c-text-subtle)]" />
                          <span className="text-[var(--c-text)] font-mono text-xs">{p.receiptNumber}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[var(--c-text)] font-mono text-xs">{p.registrationNumber || '—'}</td>
                      <td className="py-3 px-4 text-[var(--c-text)]">{p.violationTypeName || '—'}</td>
                      <td className="py-3 px-4 text-emerald-400 font-medium">৳{p.amount.toLocaleString()}</td>
                      <td className="py-3 px-4 text-[var(--c-text-muted)] text-xs">{new Date(p.paymentDate).toLocaleDateString()}</td>
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
