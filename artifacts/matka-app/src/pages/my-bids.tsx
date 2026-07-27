import { useState } from 'react';
import { useGetMyBets } from '@workspace/api-client-react';
import { MobileShell } from '@/components/mobile-shell';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Ticket, Coins, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Link } from 'wouter';

export default function MyBidsPage() {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const { data, isLoading } = useGetMyBets(
    filterStatus === 'all' ? {} : { status: filterStatus }
  );

  const bets = data?.bets || [];

  return (
    <MobileShell showBottomNav={true}>
      <div className="min-h-[100dvh] bg-background pb-20">
        {/* Header */}
        <div className="bg-gradient-to-br from-card via-card to-secondary p-5 border-b border-border sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/home" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                <Ticket className="w-5 h-5 text-primary" /> My Bids
              </h1>
            </div>
            <Badge variant="outline" className="text-xs">
              {bets.length} Total Bids
            </Badge>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
            {['all', 'pending', 'won', 'lost'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase transition-all ${
                  filterStatus === status
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : bets.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Ticket className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
              <p className="text-muted-foreground text-sm font-medium">No bids found</p>
              <Link href="/home" className="text-primary text-xs font-semibold inline-block hover:underline">
                Explore Markets & Place a Bid
              </Link>
            </div>
          ) : (
            bets.map((bet: any) => (
              <Card key={bet.id} className="p-4 bg-card border-border shadow-sm">
                <div className="flex items-start justify-between border-b border-border pb-2.5 mb-2.5">
                  <div>
                    <h3 className="font-bold text-sm text-foreground">{bet.marketName}</h3>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      {new Date(bet.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <Badge
                    className={`capitalize text-[11px] font-bold px-2.5 py-0.5 ${
                      bet.status === 'won'
                        ? 'bg-emerald-600 text-white'
                        : bet.status === 'lost'
                        ? 'bg-rose-600 text-white'
                        : 'bg-amber-500 text-slate-950'
                    }`}
                  >
                    {bet.status === 'won' && <CheckCircle2 className="w-3 h-3 mr-1 inline" />}
                    {bet.status === 'lost' && <XCircle className="w-3 h-3 mr-1 inline" />}
                    {bet.status === 'pending' && <Clock className="w-3 h-3 mr-1 inline" />}
                    {bet.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">BET TYPE</span>
                    <span className="font-semibold text-foreground capitalize">
                      {bet.betType.replace(/_/g, ' ')} ({bet.session})
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">NUMBER</span>
                    <span className="font-mono font-bold text-primary text-sm">{bet.number}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-muted-foreground block text-[10px]">AMOUNT</span>
                    <span className="font-bold text-foreground">₹{bet.amount}</span>
                  </div>
                </div>

                {bet.status === 'won' && bet.winAmount && (
                  <div className="mt-3 pt-2 border-t border-emerald-500/20 flex justify-between items-center bg-emerald-500/10 p-2 rounded">
                    <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5" /> Won Payout
                    </span>
                    <span className="font-bold text-emerald-400 text-sm">₹{bet.winAmount}</span>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </MobileShell>
  );
}
