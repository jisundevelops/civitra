'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import type { User, Vehicle } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { User as UserIcon, Mail, Phone, CreditCard, Car, Calendar, Pencil, Save, X } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '', nid: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await api.getProfile();
      setProfile(data.user);
      setVehicles(data.user.vehicles || data.vehicles || []);
      setEditForm({
        name: data.user.name,
        phone: data.user.phone || '',
        nid: data.user.nid || '',
      });
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateProfile(editForm);
      toast.success('Profile updated successfully');
      setEditing(false);
      loadProfile();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update profile';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30';
      case 'police': return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
      default: return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
        <Skeleton className="h-10 w-48 bg-[var(--c-card)]" />
        <Skeleton className="h-48 bg-[var(--c-card)]" />
        <Skeleton className="h-32 bg-[var(--c-card)]" />
      </div>
    );
  }

  const displayUser = profile || user;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[var(--c-text)]">My Profile</h2>
        {!editing ? (
          <Button
            onClick={() => setEditing(true)}
            variant="ghost"
            className="text-[var(--c-text-muted)] hover:text-[var(--c-accent-text)] hover:bg-[var(--c-accent-bg)]"
          >
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setEditing(false);
                if (displayUser) {
                  setEditForm({ name: displayUser.name, phone: displayUser.phone || '', nid: displayUser.nid || '' });
                }
              }}
              variant="ghost"
              className="text-[var(--c-text-muted)] hover:text-[var(--c-text)]"
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[var(--c-accent)] hover:bg-[var(--c-accent-hover)] text-white"
            >
              <Save className="h-4 w-4 mr-1" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <Card className="bg-[var(--c-card)] border-[var(--c-border)]">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-full bg-[var(--c-accent-bg)] border border-[var(--c-accent-border)] flex items-center justify-center text-2xl font-bold text-[var(--c-accent-text)]">
              {displayUser?.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[var(--c-text)]">{displayUser?.name}</h3>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getRoleColor(displayUser?.role || 'citizen')}`}>
                {displayUser?.role.charAt(0).toUpperCase() + displayUser?.role.slice(1)}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {editing ? (
              <>
                <div className="space-y-2">
                  <Label className="text-[var(--c-text)] text-sm">Full Name</Label>
                  <Input
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="bg-[var(--c-bg)] border-[var(--c-input-border)] text-[var(--c-text)]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[var(--c-text)] text-sm">Phone</Label>
                  <Input
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="bg-[var(--c-bg)] border-[var(--c-input-border)] text-[var(--c-text)]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[var(--c-text)] text-sm">NID</Label>
                  <Input
                    value={editForm.nid}
                    onChange={(e) => setEditForm({ ...editForm, nid: e.target.value })}
                    className="bg-[var(--c-bg)] border-[var(--c-input-border)] text-[var(--c-text)]"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 py-2">
                  <Mail className="h-4 w-4 text-[var(--c-text-subtle)]" />
                  <div>
                    <p className="text-xs text-[var(--c-text-subtle)]">Email</p>
                    <p className="text-sm text-[var(--c-text)]">{displayUser?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 py-2">
                  <Phone className="h-4 w-4 text-[var(--c-text-subtle)]" />
                  <div>
                    <p className="text-xs text-[var(--c-text-subtle)]">Phone</p>
                    <p className="text-sm text-[var(--c-text)]">{displayUser?.phone || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 py-2">
                  <CreditCard className="h-4 w-4 text-[var(--c-text-subtle)]" />
                  <div>
                    <p className="text-xs text-[var(--c-text-subtle)]">NID</p>
                    <p className="text-sm text-[var(--c-text)]">{displayUser?.nid || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 py-2">
                  <Calendar className="h-4 w-4 text-[var(--c-text-subtle)]" />
                  <div>
                    <p className="text-xs text-[var(--c-text-subtle)]">Member Since</p>
                    <p className="text-sm text-[var(--c-text)]">{new Date(displayUser?.createdAt || '').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Vehicles Section */}
      <Card className="bg-[var(--c-card)] border-[var(--c-border)]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-[var(--c-text)] flex items-center gap-2">
            <Car className="h-4 w-4 text-cyan-400" />
            Registered Vehicles
          </CardTitle>
        </CardHeader>
        <CardContent>
          {vehicles.length === 0 ? (
            <p className="text-[var(--c-text-subtle)] text-sm py-4 text-center">No vehicles registered</p>
          ) : (
            <div className="space-y-2">
              {vehicles.map((v) => (
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
    </div>
  );
}
