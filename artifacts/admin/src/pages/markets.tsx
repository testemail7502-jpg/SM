import React, { useState } from 'react';
import { 
  useGetMarkets, 
  useCreateMarket, 
  useUpdateMarket, 
  useDeleteMarket,
  useToggleMarketBetting
} from '@workspace/api-client-react';
import { Plus, Edit2, Trash2, Power } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export default function Markets() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: markets = [], isLoading } = useGetMarkets();
  
  const createMarket = useCreateMarket();
  const updateMarket = useUpdateMarket();
  const deleteMarket = useDeleteMarket();
  const toggleBetting = useToggleMarketBetting();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMarket, setEditingMarket] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'regular',
    openTime: '10:00',
    closeTime: '22:00',
    displayOrder: '0'
  });

  const resetForm = () => {
    setFormData({
      name: '', type: 'regular', openTime: '10:00', closeTime: '22:00', displayOrder: '0'
    });
    setEditingMarket(null);
  };

  const openForm = (market?: any) => {
    if (market) {
      setEditingMarket(market);
      setFormData({
        name: market.name,
        type: market.type,
        openTime: market.openTime,
        closeTime: market.closeTime,
        displayOrder: String(market.displayOrder || 0)
      });
    } else {
      resetForm();
    }
    setIsFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      type: formData.type,
      openTime: formData.openTime,
      closeTime: formData.closeTime,
      displayOrder: parseInt(formData.displayOrder)
    };

    if (editingMarket) {
      updateMarket.mutate({ id: editingMarket.id, data: payload }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['/api/markets'] });
          setIsFormOpen(false);
          toast({ title: "Market updated successfully" });
        }
      });
    } else {
      createMarket.mutate({ data: payload }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['/api/markets'] });
          setIsFormOpen(false);
          toast({ title: "Market created successfully" });
        }
      });
    }
  };

  const handleToggleBetting = (id: string, current: boolean) => {
    toggleBetting.mutate({ id, data: { isBettingOpen: !current } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/markets'] });
      }
    });
  };

  const handleToggleStatus = (id: string, current: boolean) => {
    updateMarket.mutate({ id, data: { isActive: !current } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/markets'] });
      }
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this market?")) {
      deleteMarket.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['/api/markets'] });
          toast({ title: "Market deleted" });
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Market Management</h1>
          <p className="text-muted-foreground text-sm mt-1">Configure timings and betting status for all games.</p>
        </div>
        <Button onClick={() => openForm()} className="font-semibold shadow-sm">
          <Plus className="w-4 h-4 mr-2" /> Add Market
        </Button>
      </div>

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Open Time</th>
                <th className="px-4 py-3 font-semibold">Close Time</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Betting</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={7} className="text-center py-8">Loading markets...</td></tr>
              ) : markets.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8">No markets found. Create one to get started.</td></tr>
              ) : (
                markets.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)).map((market) => (
                  <tr key={market.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-bold">{market.name}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="capitalize text-[10px]">{market.type}</Badge>
                    </td>
                    <td className="px-4 py-3 font-mono">{market.openTime}</td>
                    <td className="px-4 py-3 font-mono">{market.closeTime}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={market.isActive} 
                          onCheckedChange={() => handleToggleStatus(market.id, market.isActive)}
                          aria-label="Toggle active status"
                        />
                        <span className="text-xs font-medium">{market.isActive ? 'Active' : 'Inactive'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={market.isBettingOpen} 
                          onCheckedChange={() => handleToggleBetting(market.id, market.isBettingOpen)}
                          aria-label="Toggle betting status"
                          className="data-[state=checked]:bg-green-500"
                        />
                        <span className={`text-xs font-bold ${market.isBettingOpen ? 'text-green-600' : 'text-rose-600'}`}>
                          {market.isBettingOpen ? 'OPEN' : 'CLOSED'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openForm(market)} className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(market.id)} className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingMarket ? 'Edit Market' : 'Add New Market'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="name">Market Name</Label>
                <Input 
                  id="name" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  required 
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="type">Market Type</Label>
                <Select value={formData.type} onValueChange={(val) => setFormData({...formData, type: val})}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="regular">Regular</SelectItem>
                    <SelectItem value="starline">Starline</SelectItem>
                    <SelectItem value="gali">Gali Disawar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="openTime">Open Time</Label>
                <Input 
                  id="openTime" 
                  type="time" 
                  value={formData.openTime} 
                  onChange={(e) => setFormData({...formData, openTime: e.target.value})} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="closeTime">Close Time</Label>
                <Input 
                  id="closeTime" 
                  type="time" 
                  value={formData.closeTime} 
                  onChange={(e) => setFormData({...formData, closeTime: e.target.value})} 
                  required 
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="displayOrder">Display Order</Label>
                <Input 
                  id="displayOrder" 
                  type="number" 
                  value={formData.displayOrder} 
                  onChange={(e) => setFormData({...formData, displayOrder: e.target.value})} 
                  required 
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMarket.isPending || updateMarket.isPending}>
                {editingMarket ? 'Update' : 'Create'} Market
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
