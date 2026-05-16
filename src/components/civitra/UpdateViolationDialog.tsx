'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import type { Violation } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface UpdateViolationDialogProps {
  violation: Violation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function UpdateViolationDialog({ violation, open, onOpenChange, onSuccess }: UpdateViolationDialogProps) {
  const [status, setStatus] = useState('pending');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (violation) {
      setStatus(violation.status);
      setNotes(violation.notes || '');
    }
  }, [violation]);

  const handleSubmit = async () => {
    if (!violation) return;
    if (violation.status === 'paid') {
      toast.error('Cannot update a paid violation');
      return;
    }
    setLoading(true);
    try {
      await api.updateViolation(violation.id, { status, notes });
      toast.success('Violation updated successfully');
      onSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update violation';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const isPaid = violation?.status === 'paid';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[var(--c-card)] border-[var(--c-border)] text-[var(--c-text)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">Update Violation</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label className="text-[var(--c-text)] text-sm">Status</Label>
            {isPaid ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-md px-3 py-2 text-sm text-emerald-400">
                Paid — cannot be changed
              </div>
            ) : (
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="bg-[var(--c-bg)] border-[var(--c-input-border)] text-[var(--c-text)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[var(--c-card)] border-[var(--c-input-border)]">
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-[var(--c-text)] text-sm">Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add or update notes..."
              rows={3}
              disabled={isPaid}
              className="bg-[var(--c-bg)] border-[var(--c-input-border)] text-[var(--c-text)] placeholder:text-[var(--c-text-subtle)] resize-none"
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-[var(--c-text-muted)] hover:text-[var(--c-text)]">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || isPaid}
            className="bg-[var(--c-accent)] hover:bg-[var(--c-accent-hover)] text-white"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Updating...
              </span>
            ) : (
              'Update'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
