'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { ViolationType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Pencil, Trash2, X, Car } from 'lucide-react';
import { toast } from 'sonner';

export default function ViolationTypesPage() {
  const [types, setTypes] = useState<ViolationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', description: '', fineAmount: '' });
  const [addLoading, setAddLoading] = useState(false);
  const [editType, setEditType] = useState<ViolationType | null>(null);
  const [editForm, setEditForm] = useState({ name: '', description: '', fineAmount: '', isActive: true });
  const [editLoading, setEditLoading] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    loadTypes();
  }, []);

  const loadTypes = async () => {
    setLoading(true);
    try {
      const data = await api.getViolationTypes();
      setTypes(data);
    } catch (err) {
      console.error('Failed to load violation types:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name || !addForm.fineAmount) {
      toast.error('Please fill in name and fine amount');
      return;
    }
    setAddLoading(true);
    try {
      await api.createViolationType({
        name: addForm.name,
        description: addForm.description || undefined,
        fineAmount: parseFloat(addForm.fineAmount),
      });
      toast.success('Violation type created');
      setAddForm({ name: '', description: '', fineAmount: '' });
      setShowAddForm(false);
      loadTypes();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create type';
      toast.error(message);
    } finally {
      setAddLoading(false);
    }
  };

  const handleEditClick = (vt: ViolationType) => {
    setEditType(vt);
    setEditForm({
      name: vt.name,
      description: vt.description || '',
      fineAmount: String(vt.fineAmount),
      isActive: vt.isActive,
    });
    setEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    if (!editType) return;
    setEditLoading(true);
    try {
      await api.updateViolationType(editType.id, {
        name: editForm.name,
        description: editForm.description || undefined,
        fineAmount: parseFloat(editForm.fineAmount),
        isActive: editForm.isActive,
      });
      toast.success('Violation type updated');
      setEditDialogOpen(false);
      setEditType(null);
      loadTypes();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update type';
      toast.error(message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeactivate = async (vt: ViolationType) => {
    try {
      await api.updateViolationType(vt.id, { isActive: false });
      toast.success('Violation type deactivated');
      loadTypes();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to deactivate type';
      toast.error(message);
    }
  };

  const handleActivate = async (vt: ViolationType) => {
    try {
      await api.updateViolationType(vt.id, { isActive: true });
      toast.success('Violation type activated');
      loadTypes();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to activate type';
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Violation Types</h2>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          {showAddForm ? <X className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
          {showAddForm ? 'Cancel' : 'Add Type'}
        </Button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <Card className="bg-[#16161f] border-indigo-500/20">
          <CardContent className="pt-5">
            <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-zinc-300 text-xs">Name *</Label>
                <Input
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  placeholder="Speeding"
                  className="bg-[#0a0a0f] border-zinc-700 text-zinc-200 placeholder:text-zinc-600 h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-zinc-300 text-xs">Fine Amount (৳) *</Label>
                <Input
                  type="number"
                  value={addForm.fineAmount}
                  onChange={(e) => setAddForm({ ...addForm, fineAmount: e.target.value })}
                  placeholder="500"
                  className="bg-[#0a0a0f] border-zinc-700 text-zinc-200 placeholder:text-zinc-600 h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-zinc-300 text-xs">Description</Label>
                <Input
                  value={addForm.description}
                  onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                  placeholder="Optional description"
                  className="bg-[#0a0a0f] border-zinc-700 text-zinc-200 placeholder:text-zinc-600 h-9"
                />
              </div>
              <div className="sm:col-span-3">
                <Button type="submit" disabled={addLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  {addLoading ? 'Creating...' : 'Create Type'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 bg-[#16161f]" />
          ))}
        </div>
      ) : (
        <Card className="bg-[#16161f] border-zinc-800/50">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">Name</th>
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">Description</th>
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">Fine Amount</th>
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {types.map((vt) => (
                    <tr key={vt.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                      <td className="py-3 px-4 text-zinc-200 font-medium">{vt.name}</td>
                      <td className="py-3 px-4 text-zinc-400 text-xs max-w-48 truncate">{vt.description || '—'}</td>
                      <td className="py-3 px-4 text-zinc-200 font-medium">৳{vt.fineAmount.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                          vt.isActive
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : 'bg-red-500/15 text-red-400 border-red-500/30'
                        }`}>
                          {vt.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditClick(vt)}
                            className="text-zinc-400 hover:text-indigo-400 hover:bg-indigo-500/10 h-7 text-xs"
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          {vt.isActive ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeactivate(vt)}
                              className="text-zinc-400 hover:text-red-400 hover:bg-red-500/10 h-7 text-xs"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleActivate(vt)}
                              className="text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 h-7 text-xs"
                            >
                              Activate
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-[#16161f] border-zinc-800/50 text-zinc-200 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">Edit Violation Type</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-zinc-300 text-sm">Name</Label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="bg-[#0a0a0f] border-zinc-700 text-zinc-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300 text-sm">Description</Label>
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows={2}
                className="bg-[#0a0a0f] border-zinc-700 text-zinc-200 resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300 text-sm">Fine Amount (৳)</Label>
              <Input
                type="number"
                value={editForm.fineAmount}
                onChange={(e) => setEditForm({ ...editForm, fineAmount: e.target.value })}
                className="bg-[#0a0a0f] border-zinc-700 text-zinc-200"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setEditDialogOpen(false)} className="text-zinc-400 hover:text-white">
              Cancel
            </Button>
            <Button onClick={handleEditSave} disabled={editLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {editLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
