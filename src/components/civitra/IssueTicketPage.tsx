'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { ViolationType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function IssueTicketPage() {
  const [violationTypes, setViolationTypes] = useState<ViolationType[]>([]);
  const [form, setForm] = useState({
    registration_number: '',
    violation_type_id: '',
    location: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadViolationTypes();
  }, []);

  const loadViolationTypes = async () => {
    try {
      const data = await api.getViolationTypes();
      setViolationTypes(data);
    } catch (err) {
      console.error('Failed to load violation types:', err);
    }
  };

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.registration_number || !form.violation_type_id || !form.location) {
      toast.error('Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      await api.createViolation(form);
      toast.success('Ticket issued successfully!');
      setSuccess(true);
      setForm({
        registration_number: '',
        violation_type_id: '',
        location: '',
        notes: '',
      });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to issue ticket';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const selectedType = violationTypes.find((vt) => vt.id === form.violation_type_id);

  return (
    <div className="max-w-xl mx-auto animate-fadeIn">
      <Card className="bg-[var(--c-card)] border-[var(--c-border)] shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg bg-cyan-500/15 flex items-center justify-center">
              <FileText className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <CardTitle className="text-lg text-[var(--c-text)]">Issue Traffic Ticket</CardTitle>
              <CardDescription className="text-[var(--c-text-muted)]">Create a new traffic violation record</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {success && (
            <div className="mb-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 flex items-center gap-2 text-sm text-emerald-400">
              <CheckCircle className="h-4 w-4" />
              Ticket issued successfully!
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[var(--c-text)] text-sm">Vehicle Registration Number *</Label>
              <Input
                placeholder="DHA-1234"
                value={form.registration_number}
                onChange={(e) => update('registration_number', e.target.value.toUpperCase())}
                className="bg-[var(--c-bg)] border-[var(--c-input-border)] text-[var(--c-text)] placeholder:text-[var(--c-text-subtle)] font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[var(--c-text)] text-sm">Violation Type *</Label>
              <Select value={form.violation_type_id} onValueChange={(value) => update('violation_type_id', value)}>
                <SelectTrigger className="bg-[var(--c-bg)] border-[var(--c-input-border)] text-[var(--c-text)]">
                  <SelectValue placeholder="Select violation type" />
                </SelectTrigger>
                <SelectContent className="bg-[var(--c-card)] border-[var(--c-input-border)]">
                  {violationTypes.map((vt) => (
                    <SelectItem key={vt.id} value={vt.id} className="text-[var(--c-text)]">
                      {vt.name} — ৳{vt.fineAmount.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedType && (
                <p className="text-xs text-[var(--c-text-subtle)]">Fine: ৳{selectedType.fineAmount.toLocaleString()}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-[var(--c-text)] text-sm">Location *</Label>
              <Input
                placeholder="Intersection, Road name, Area"
                value={form.location}
                onChange={(e) => update('location', e.target.value)}
                className="bg-[var(--c-bg)] border-[var(--c-input-border)] text-[var(--c-text)] placeholder:text-[var(--c-text-subtle)]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[var(--c-text)] text-sm">Notes (Optional)</Label>
              <Textarea
                placeholder="Additional details about the violation..."
                value={form.notes}
                onChange={(e) => update('notes', e.target.value)}
                rows={3}
                className="bg-[var(--c-bg)] border-[var(--c-input-border)] text-[var(--c-text)] placeholder:text-[var(--c-text-subtle)] resize-none"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-medium"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Issuing Ticket...
                </span>
              ) : (
                'Issue Ticket'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
