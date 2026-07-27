import { useGetMarkets, useGetWallet, useGetSettings } from '@workspace/api-client-react';
import { MobileShell } from '@/components/mobile-shell';
import { BottomNav } from '@/components/bottom-nav';
import { Link } from 'wouter';
import { useAuth } from '@/contexts/auth-context';
import { TrendingUp, Clock, Coins } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage() {
  const { user } = useAuth();
  const { data: markets, isLoading: marketsLoading } = useGetMarkets();
  const { data: wallet, isLoading: walletLoading } = useGetWallet();
  const { data: settings } = useGetSettings();
  
  const formatTime = (time: string) => {
    if (!time) return '--:--';
    const parts = time.split(':');
    const hours = parseInt(parts[0]);
    const mins = parts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${mins} ${ampm}`;
  };
  
  const formatResult = (market: any) => {
    const open = market.openResult || '---';
    const close = market.closeResult || '---';
    const jodi = market.jodi || '--';
    return `${open} | ${jodi} | ${close}`;
  };
  
  return (
    <MobileShell>
      <div className="min-h-[100dvh] bg-background">
        {/* Header */}
        <div className="bg-gradient-to-br from-card via-card to-secondary p-6 pb-8 border-b border-border">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display text-2xl font-bold text-primary gold-glow" data-testid="text-app-title">
                Sara777
              </h1>
              <p className="text-sm text-muted-foreground mt-1" data-testid="text-user-greeting">
                Welcome, {user?.name}
              </p>
            </div>
            <Link href="/wallet" className="text-right" data-testid="link-wallet-quick">
              <div className="text-xs text-muted-foreground mb-1">Wallet Balance</div>
              {walletLoading ? (
                <Skeleton className="h-7 w-24" />
              ) : (
                <div className="font-display text-2xl font-bold text-primary flex items-center gap-1" data-testid="text-wallet-balance">
                  <Coins className="w-5 h-5" />
                  {wallet?.balance?.toFixed(2) || '0.00'}
                </div>
              )}
            </Link>
          </div>
          
          {/* Banner Message */}
          {settings?.bannerMessage && (
            <div className="bg-accent/10 border border-accent/20 rounded-lg p-3 overflow-hidden">
              <div className="whitespace-nowrap marquee text-xs text-accent-foreground font-medium" data-testid="text-banner">
                {settings.bannerMessage}
              </div>
            </div>
          )}
        </div>
        
        {/* Markets List */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Live Markets
            </h2>
          </div>
          
          {marketsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-32 w-full rounded-xl" />
              ))}
            </div>
          ) : markets && markets.length > 0 ? (
            <div className="space-y-3">
              {markets
                .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                .map((market) => (
                  <Link href={`/game/${market.id}`} key={market.id} data-testid={`card-market-${market.id}`}>
                    <Card className="p-4 bg-card border-card-border hover:border-primary/50 transition-all cursor-pointer">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-display text-lg font-bold text-foreground mb-1" data-testid={`text-market-name-${market.id}`}>
                            {market.name}
                          </h3>
                          <div className="flex items-center gap-2 text-xs">
                            {market.isActive ? (
                              market.isBettingOpen ? (
                                <Badge className="bg-chart-2 text-white font-semibold" data-testid={`badge-status-${market.id}`}>
                                  OPEN
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="font-semibold" data-testid={`badge-status-${market.id}`}>
                                  CLOSED
                                </Badge>
                              )
                            ) : (
                              <Badge variant="destructive" className="font-semibold" data-testid={`badge-status-${market.id}`}>
                                INACTIVE
                              </Badge>
                            )}
                            <span className="text-muted-foreground">{market.type}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="bg-secondary/50 rounded-lg p-2">
                          <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Open Time
                          </div>
                          <div className="font-semibold text-sm text-foreground" data-testid={`text-open-time-${market.id}`}>
                            {formatTime(market.openTime)}
                          </div>
                        </div>
                        <div className="bg-secondary/50 rounded-lg p-2">
                          <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Close Time
                          </div>
                          <div className="font-semibold text-sm text-foreground" data-testid={`text-close-time-${market.id}`}>
                            {formatTime(market.closeTime)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                        <div className="text-xs text-primary font-semibold mb-1">Today's Result</div>
                        <div className="font-mono text-lg font-bold text-primary" data-testid={`text-result-${market.id}`}>
                          {formatResult(market)}
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No markets available</p>
            </Card>
          )}
        </div>
      </div>
      <BottomNav />
    </MobileShell>
  );
}
