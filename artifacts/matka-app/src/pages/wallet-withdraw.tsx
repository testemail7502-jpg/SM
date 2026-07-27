import { useState } from 'react';
import { useGetMe, useCreateWithdrawRequest, useGetSettings } from '@workspace/api-client-react';
import { MobileShell } from '@/components/mobile-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Link, useLocation } from 'wouter';
import { ArrowLeft } from 'lucide-react';

export default function WithdrawPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: user } = useGetMe();
  const { data: settings } = useGetSettings();
  const withdrawMutation = useCreateWithdrawRequest();
  
  const [method, setMethod] = useState<'BANK' | 'UPI'>('UPI');
  const [amount, setAmount] = useState('');
  const [upiId, setUpiId] = useState((user as any)?.upiId || '');
  const [bankAccount, setBankAccount] = useState((user as any)?.bankAccount || '');
  const [ifscCode, setIfscCode] = useState((user as any)?.ifscCode || '');
  const [accountName, setAccountName] = useState((user as any)?.accountName || '');
  const [bankName, setBankName] = useState((user as any)?.bankName || '');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    withdrawMutation.mutate(
      {
        data: {
          amount: parseFloat(amount),
          ...(method === 'UPI' ? { upiId } : { bankAccount, ifscCode, accountName, bankName })
        }
      },
      {
        onSuccess: () => {
          toast({ title: 'Request Submitted!', description: 'Your withdrawal request has been submitted' });
          setLocation('/wallet');
        },
        onError: (error) => {
          toast({ title: 'Request Failed', description: error.message, variant: 'destructive' });
        }
      }
    );
  };
  
  return (
    <MobileShell showBottomNav={false}>
      <div className="min-h-[100dvh] bg-background">
        <div className="bg-gradient-to-br from-card via-card to-secondary p-6 border-b border-border">
          <Link href="/wallet" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4" data-testid="link-back">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Wallet</span>
          </Link>
          
          <h1 className="font-display text-2xl font-bold text-foreground">Withdraw Funds</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-foreground font-semibold">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              step="1"
              min={settings?.minWithdraw || 1}
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="bg-input border-border text-foreground text-lg font-semibold"
              data-testid="input-amount"
            />
            {settings?.minWithdraw && (
              <p className="text-xs text-muted-foreground">
                Min: ₹{settings.minWithdraw} | Max: ₹{settings.maxWithdraw || 'No limit'}
              </p>
            )}
          </div>
          
          <div className="space-y-3">
            <Label className="text-foreground font-semibold">Withdrawal Method</Label>
            <Tabs value={method} onValueChange={(v) => setMethod(v as 'BANK' | 'UPI')}>
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="UPI" data-testid="tab-method-upi">UPI</TabsTrigger>
                <TabsTrigger value="BANK" data-testid="tab-method-bank">Bank Transfer</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {method === 'UPI' ? (
            <div className="space-y-2">
              <Label htmlFor="upi" className="text-foreground font-semibold">UPI ID</Label>
              <Input
                id="upi"
                type="text"
                placeholder="yourname@upi"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                required
                className="bg-input border-border text-foreground font-mono"
                data-testid="input-upi"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="account-name" className="text-foreground font-semibold">Account Holder Name</Label>
                <Input
                  id="account-name"
                  type="text"
                  placeholder="As per bank account"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  required
                  className="bg-input border-border text-foreground"
                  data-testid="input-account-name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="account-number" className="text-foreground font-semibold">Account Number</Label>
                <Input
                  id="account-number"
                  type="text"
                  placeholder="Enter account number"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  required
                  className="bg-input border-border text-foreground font-mono"
                  data-testid="input-account-number"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ifsc" className="text-foreground font-semibold">IFSC Code</Label>
                <Input
                  id="ifsc"
                  type="text"
                  placeholder="Enter IFSC code"
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                  required
                  className="bg-input border-border text-foreground font-mono"
                  data-testid="input-ifsc"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bank-name" className="text-foreground font-semibold">Bank Name</Label>
                <Input
                  id="bank-name"
                  type="text"
                  placeholder="Enter bank name"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  required
                  className="bg-input border-border text-foreground"
                  data-testid="input-bank-name"
                />
              </div>
            </div>
          )}
          
          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-lg h-14"
            disabled={withdrawMutation.isPending}
            data-testid="button-submit"
          >
            {withdrawMutation.isPending ? 'Submitting...' : 'Submit Request'}
          </Button>
        </form>
      </div>
    </MobileShell>
  );
}
