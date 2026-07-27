import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useUpdateMe } from '@workspace/api-client-react';
import { MobileShell } from '@/components/mobile-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, User as UserIcon, Wallet, LogOut, Building, ShieldCheck } from 'lucide-react';
import { Link, useLocation } from 'wouter';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const updateMutation = useUpdateMe();

  const [name, setName] = useState(user?.name || '');
  const [bankAccount, setBankAccount] = useState((user as any)?.bankAccount || '');
  const [ifscCode, setIfscCode] = useState((user as any)?.ifscCode || '');
  const [upiId, setUpiId] = useState((user as any)?.upiId || '');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(
      { data: { name, bankAccount, ifscCode, upiId } },
      {
        onSuccess: () => {
          toast({ title: 'Profile Updated', description: 'Your bank details have been saved.' });
        },
        onError: (err: any) => {
          toast({ title: 'Update Failed', description: err.message, variant: 'destructive' });
        },
      }
    );
  };

  const handleLogout = () => {
    logout();
    toast({ title: 'Logged Out', description: 'You have been logged out successfully.' });
    setLocation('/login');
  };

  return (
    <MobileShell showBottomNav={true}>
      <div className="min-h-[100dvh] bg-background pb-20">
        <div className="bg-gradient-to-br from-card via-card to-secondary p-5 border-b border-border sticky top-0 z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/home" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-primary" /> Profile & Settings
            </h1>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-rose-500 hover:text-rose-400 hover:bg-rose-500/10">
            <LogOut className="w-4 h-4 mr-1" /> Logout
          </Button>
        </div>

        <div className="p-4 space-y-4">
          {/* User Card */}
          <Card className="p-5 bg-card border-border shadow-sm flex items-center justify-between">
            <div>
              <h2 className="font-bold text-lg text-foreground flex items-center gap-2">
                {user?.name || 'User'} <ShieldCheck className="w-4 h-4 text-emerald-500 inline" />
              </h2>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">Phone: {user?.phone || 'N/A'}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-muted-foreground block">WALLET BALANCE</span>
              <span className="font-bold text-primary text-lg flex items-center gap-1 justify-end">
                <Wallet className="w-4 h-4" /> ₹{user?.walletBalance ?? 0}
              </span>
            </div>
          </Card>

          {/* Bank & Payment Details */}
          <form onSubmit={handleSave} className="space-y-4">
            <Card className="p-4 bg-card border-border shadow-sm space-y-4">
              <h3 className="font-semibold text-sm text-foreground flex items-center gap-2 border-b border-border pb-2">
                <Building className="w-4 h-4 text-primary" /> Bank & Payment Details (For Withdrawals)
              </h3>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-semibold text-foreground">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-input border-border text-foreground text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankAccount" className="text-xs font-semibold text-foreground">Bank Account Number</Label>
                <Input
                  id="bankAccount"
                  type="text"
                  placeholder="Enter Bank Account Number"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  className="bg-input border-border text-foreground font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ifscCode" className="text-xs font-semibold text-foreground">IFSC Code</Label>
                <Input
                  id="ifscCode"
                  type="text"
                  placeholder="e.g. SBIN0001234"
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value)}
                  className="bg-input border-border text-foreground font-mono text-sm uppercase"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="upiId" className="text-xs font-semibold text-foreground">UPI ID</Label>
                <Input
                  id="upiId"
                  type="text"
                  placeholder="e.g. username@upi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="bg-input border-border text-foreground font-mono text-sm"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-sm h-11"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? 'Saving...' : 'SAVE DETAILS'}
              </Button>
            </Card>
          </form>
        </div>
      </div>
    </MobileShell>
  );
}
