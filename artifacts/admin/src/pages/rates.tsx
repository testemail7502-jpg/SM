import React, { useState } from 'react';
import { useGetRates, useCreateRate, useUpdateRate } from '@workspace/api-client-react';
import { Percent, Plus, Edit2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export default function Rates() {
  const { data: rates = [], isLoading } = useGetRates();
  const createRate = useCreateRate();
  const updateRate = useUpdateRate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  
  const [formData, setFormData] = useState({
    betType: '',
    multiplier: '',
    description: ''
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    createRate.mutate({
      data: {
        betType: formData.betType,
        multiplier: parseFloat(formData.multiplier),
        description: formData.description
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/rates'] });
        setIsAddOpen(false);
        setFormData({ betType: '', multiplier: '', description: '' });
        toast({ title: 'Rate added successfully' });
      }
    });
  };

  const handleSaveEdit = (id: string) => {
    updateRate.mutate({
      id,
      data: { multiplier: parseFloat(editValue) }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/rates'] });
        setEditingId(null);
        toast({ title: 'Rate updated successfully' });
      }
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payout Rates</h1>
          <p className="text-muted-foreground text-sm mt-1">Configure win multipliers for different bet types.</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="font-semibold shadow-sm">
          <Plus className="w-4 h-4 mr-2" /> Add Rate
        </Button>
      </div>

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
              <tr>
                <th className="px-4 py-3 font-semibold">Bet Type</th>
                <th className="px-4 py-3 font-semibold">Description</th>
                <th className="px-4 py-3 font-semibold text-right">Multiplier</th>
                <th className="px-4 py-3 font-semibold text-right w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={4} className="text-center py-8">Loading rates...</td></tr>
              ) : rates.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-12 text-muted-foreground">No rates configured.</td></tr>
              ) : (
                rates.map((rate) => (
                  <tr key={rate.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-bold capitalize text-base">{rate.betType.replace('_', ' ')}</td>
                    <td className="px-4 py-3 text-muted-foreground">{rate.description}</td>
                    <td className="px-4 py-3 text-right">
                      {editingId === rate.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-muted-foreground text-xs">x</span>
                          <Input 
                            type="number" 
                            value={editValue} 
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-20 h-8 text-right font-mono font-bold"
                            step="0.1"
                          />
                        </div>
                      ) : (
                        <div className="inline-flex items-center font-mono font-bold text-lg text-primary bg-primary/10 px-3 py-1 rounded-md">
                          <span className="text-xs mr-1 opacity-50">x</span>
                          {rate.multiplier}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {editingId === rate.id ? (
                        <Button size="sm" onClick={() => handleSaveEdit(rate.id)} disabled={updateRate.isPending} className="h-8">
                          <Check className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button variant="ghost" size="icon" onClick={() => { setEditingId(rate.id); setEditValue(String(rate.multiplier)); }} className="h-8 w-8">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Rate</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Bet Type Code</Label>
              <Input 
                placeholder="e.g., single_digit, jodi, half_sangam" 
                value={formData.betType} 
                onChange={(e) => setFormData({...formData, betType: e.target.value})} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label>Multiplier (e.g., 9.5 for 10 ka 95)</Label>
              <Input 
                type="number" 
                step="0.1"
                placeholder="9.5" 
                value={formData.multiplier} 
                onChange={(e) => setFormData({...formData, multiplier: e.target.value})} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input 
                placeholder="Single Digit 10 ka 95" 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})} 
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createRate.isPending}>Add Rate</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
