import React, { useState } from 'react';
import { 
  useGetAdminUsers, 
  useGetAdminUser, 
  useUpdateAdminUser 
} from '@workspace/api-client-react';
import { Search, UserCheck, UserX, Wallet, Phone, Edit, PlusCircle, MinusCircle, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export default function Users() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const { data, isLoading } = useGetAdminUsers({ search, page, limit: 20 });
  
  const users = data?.users || [];
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Player Management</h1>
          <p className="text-muted-foreground text-sm mt-1">Monitor accounts, balances, and access control.</p>
        </div>
      </div>

      <div className="bg-card p-4 rounded-xl border shadow-sm">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name or phone number..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 h-10"
          />
        </div>
      </div>

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
              <tr>
                <th className="px-4 py-3 font-semibold">Player</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 font-semibold text-right">Wallet Balance</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-8">Loading users...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8">No users found.</td></tr>
              ) : (
                users.map((u) => (
                  <tr 
                    key={u.id} 
                    className="hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedUserId(u.id)}
                  >
                    <td className="px-4 py-3 font-bold">{u.name}</td>
                    <td className="px-4 py-3 font-mono">{u.phone}</td>
                    <td className="px-4 py-3 text-right font-bold text-green-600">₹{u.walletBalance}</td>
                    <td className="px-4 py-3">
                      {u.isBlocked ? (
                        <Badge variant="destructive" className="text-[10px]">Blocked</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-[10px]">Active</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground text-xs">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t bg-muted/20 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total: {data?.total || 0} users</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
            <Button variant="outline" size="sm" disabled={users.length < 20} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      </div>

      {selectedUserId && (
        <UserDetailModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
      )}
    </div>
  );
}

function UserDetailModal({ userId, onClose }: { userId: string, onClose: () => void }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: user, isLoading } = useGetAdminUser(userId);
  const updateUser = useUpdateAdminUser();
  
  const [editPhone, setEditPhone] = useState('');
  const [isEditingPhone, setIsEditingPhone] = useState(false);

  const [balanceAmt, setBalanceAmt] = useState('');
  const [adjustAction, setAdjustAction] = useState<'add' | 'subtract' | 'set'>('add');
  const [isAdjusting, setIsAdjusting] = useState(false);

  React.useEffect(() => {
    if (user && !isEditingPhone) {
      setEditPhone(user.phone);
    }
  }, [user, isEditingPhone]);

  const handleToggleBlock = () => {
    if (!user) return;
    updateUser.mutate({ id: userId, data: { isBlocked: !user.isBlocked } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [`/api/admin/users/${userId}`] });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
        toast({ title: user.isBlocked ? "User unblocked" : "User blocked" });
      }
    });
  };

  const handleSavePhone = () => {
    updateUser.mutate({ id: userId, data: { phone: editPhone } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [`/api/admin/users/${userId}`] });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
        setIsEditingPhone(false);
        toast({ title: "Phone number updated" });
      }
    });
  };

  const handleAdjustBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!balanceAmt || isNaN(Number(balanceAmt))) {
      toast({ title: "Invalid amount", variant: "destructive" });
      return;
    }
    setIsAdjusting(true);
    try {
      const token = localStorage.getItem('sara777_admin_token') || localStorage.getItem('sara777_token');
      const res = await fetch(`/api/admin/users/${userId}/adjust-balance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: Number(balanceAmt),
          action: adjustAction,
          reason: `Admin balance adjustment`
        })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to adjust balance');
      }
      queryClient.invalidateQueries({ queryKey: [`/api/admin/users/${userId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({ title: "Wallet balance updated!" });
      setBalanceAmt('');
    } catch (err: any) {
      toast({ title: "Failed to adjust balance", description: err.message, variant: "destructive" });
    } finally {
      setIsAdjusting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Player Profile</DialogTitle>
        </DialogHeader>
        
        {isLoading || !user ? (
          <div className="py-8 text-center">Loading...</div>
        ) : (
          <div className="space-y-6 pt-2">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  {isEditingPhone ? (
                    <div className="flex items-center gap-2">
                      <Input value={editPhone} onChange={e => setEditPhone(e.target.value)} className="h-8 w-36 font-mono text-xs" />
                      <Button size="sm" className="h-8" onClick={handleSavePhone}>Save Phone</Button>
                      <Button size="sm" variant="ghost" className="h-8" onClick={() => setIsEditingPhone(false)}>Cancel</Button>
                    </div>
                  ) : (
                    <p className="text-muted-foreground font-mono flex items-center">
                      <Phone className="w-3.5 h-3.5 mr-1" /> {user.phone}
                      <Button variant="ghost" size="sm" className="h-6 px-1.5 ml-2 text-xs text-blue-600" onClick={() => setIsEditingPhone(true)}>
                        <Edit className="w-3 h-3 mr-1" /> Edit Phone
                      </Button>
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <Button 
                  variant={user.isBlocked ? "default" : "destructive"} 
                  onClick={handleToggleBlock}
                  size="sm"
                >
                  {user.isBlocked ? <UserCheck className="w-4 h-4 mr-1" /> : <UserX className="w-4 h-4 mr-1" />}
                  {user.isBlocked ? "Unblock User" : "Block User"}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-muted/30 p-3 rounded-xl border">
                <p className="text-[11px] text-muted-foreground font-semibold uppercase">Wallet</p>
                <p className="text-xl font-bold mt-1 text-primary">₹{user.walletBalance}</p>
              </div>
              <div className="bg-muted/30 p-3 rounded-xl border">
                <p className="text-[11px] text-muted-foreground font-semibold uppercase">Total Bets</p>
                <p className="text-xl font-bold mt-1">{user.totalBets || 0}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-xl border border-green-100">
                <p className="text-[11px] text-green-700 font-semibold uppercase">Deposit</p>
                <p className="text-xl font-bold mt-1 text-green-600">₹{user.totalDeposit || 0}</p>
              </div>
              <div className="bg-rose-50 p-3 rounded-xl border border-rose-100">
                <p className="text-[11px] text-rose-700 font-semibold uppercase">Withdraw</p>
                <p className="text-xl font-bold mt-1 text-rose-600">₹{user.totalWithdraw || 0}</p>
              </div>
            </div>

            {/* Edit Wallet Balance Box */}
            <form onSubmit={handleAdjustBalance} className="border rounded-xl p-4 bg-card space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-1.5 text-foreground">
                <Wallet className="w-4 h-4 text-primary" /> Edit Wallet Balance
              </h3>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={balanceAmt}
                  onChange={(e) => setBalanceAmt(e.target.value)}
                  className="h-9 text-sm font-semibold"
                />
                <Button
                  type="submit"
                  size="sm"
                  onClick={() => setAdjustAction('add')}
                  disabled={isAdjusting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <PlusCircle className="w-4 h-4 mr-1" /> Add
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  onClick={() => setAdjustAction('subtract')}
                  disabled={isAdjusting}
                  variant="outline"
                  className="border-rose-200 text-rose-600 hover:bg-rose-50"
                >
                  <MinusCircle className="w-4 h-4 mr-1" /> Deduct
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  onClick={() => setAdjustAction('set')}
                  disabled={isAdjusting}
                  variant="secondary"
                >
                  <RefreshCw className="w-4 h-4 mr-1" /> Set
                </Button>
              </div>
            </form>

            {/* Bank Details */}
            <div className="border rounded-xl p-4 bg-muted/10 space-y-2 text-xs">
              <h3 className="font-semibold text-sm">Bank Account Details</h3>
              <div className="grid grid-cols-2 gap-y-1.5 text-muted-foreground">
                <div>A/C Name: <span className="font-medium text-foreground">{user.accountName || '-'}</span></div>
                <div>Bank Name: <span className="font-medium text-foreground">{user.bankName || '-'}</span></div>
                <div>A/C Number: <span className="font-mono text-foreground">{user.bankAccount || '-'}</span></div>
                <div>IFSC Code: <span className="font-mono text-foreground">{user.ifscCode || '-'}</span></div>
                <div className="col-span-2">UPI ID: <span className="font-mono text-foreground">{user.upiId || '-'}</span></div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
