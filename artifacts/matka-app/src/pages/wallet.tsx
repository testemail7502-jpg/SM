import { useGetWallet } from '@workspace/api-client-react';
import { MobileShell } from '@/components/mobile-shell';
import { BottomNav } from '@/components/bottom-nav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'wouter';
import { Wallet as WalletIcon, Plus, Minus, FileText, History } from 'lucide-react';

export default function WalletPage() {
  const { data: wallet, isLoading } = useGetWallet();
  
  return (
    <MobileShell>
      <div className="min-h-[100dvh] bg-background pb-20">
        {/* Header */}
        <div className="bg-gradient-to-br from-card via-card to-secondary p-6 border-b border-border">
          <h1 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <WalletIcon className="w-6 h-6 text-primary" />
            My Wallet
          </h1>
          
          {/* Balance Card */}
          <Card className="bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border-primary/30 p-6">
            <div className="text-sm text-muted-foreground mb-2">Available Balance</div>
            {isLoading ? (
              <Skeleton className="h-12 w-48" />
            ) : (
              <div className="font-display text-5xl font-bold text-primary gold-glow" data-testid="text-balance">
                ₹{wallet?.balance?.toFixed(2) || '0.00'}
              </div>
            )}
          </Card>
        </div>
        
        {/* Quick Actions */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Link href="/wallet/add-funds" data-testid="link-add-funds">
              <Card className="p-6 text-center cursor-pointer hover:border-primary/50 transition-all bg-card border-card-border">
                <div className="w-12 h-12 rounded-full bg-chart-2/20 flex items-center justify-center mx-auto mb-3">
                  <Plus className="w-6 h-6 text-chart-2" />
                </div>
                <div className="font-semibold text-foreground">Add Funds</div>
              </Card>
            </Link>
            
            <Link href="/wallet/withdraw" data-testid="link-withdraw">
              <Card className="p-6 text-center cursor-pointer hover:border-primary/50 transition-all bg-card border-card-border">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-3">
                  <Minus className="w-6 h-6 text-accent" />
                </div>
                <div className="font-semibold text-foreground">Withdraw</div>
              </Card>
            </Link>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Link href="/wallet/passbook" data-testid="link-passbook">
              <Card className="p-6 text-center cursor-pointer hover:border-primary/50 transition-all bg-card border-card-border">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div className="font-semibold text-foreground">Passbook</div>
              </Card>
            </Link>
            
            <Link href="/wallet/passbook" data-testid="link-history">
              <Card className="p-6 text-center cursor-pointer hover:border-primary/50 transition-all bg-card border-card-border">
                <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                  <History className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="font-semibold text-foreground">History</div>
              </Card>
            </Link>
          </div>
        </div>
        
        {/* Stats */}
        {!isLoading && wallet && (
          <div className="px-6 pb-6">
            <h2 className="font-display text-lg font-bold text-foreground mb-4">Statistics</h2>
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 bg-card border-card-border">
                <div className="text-xs text-muted-foreground mb-1">Total Deposit</div>
                <div className="font-semibold text-lg text-chart-2" data-testid="text-total-deposit">
                  ₹{wallet.totalDeposit?.toFixed(2) || '0.00'}
                </div>
              </Card>
              
              <Card className="p-4 bg-card border-card-border">
                <div className="text-xs text-muted-foreground mb-1">Total Withdraw</div>
                <div className="font-semibold text-lg text-accent" data-testid="text-total-withdraw">
                  ₹{wallet.totalWithdraw?.toFixed(2) || '0.00'}
                </div>
              </Card>
              
              <Card className="p-4 bg-card border-card-border">
                <div className="text-xs text-muted-foreground mb-1">Total Win</div>
                <div className="font-semibold text-lg text-primary" data-testid="text-total-win">
                  ₹{wallet.totalWin?.toFixed(2) || '0.00'}
                </div>
              </Card>
              
              <Card className="p-4 bg-card border-card-border">
                <div className="text-xs text-muted-foreground mb-1">Total Bet</div>
                <div className="font-semibold text-lg text-foreground" data-testid="text-total-bet">
                  ₹{wallet.totalBet?.toFixed(2) || '0.00'}
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </MobileShell>
  );
}
