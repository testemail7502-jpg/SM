import { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useGetMarket, usePlaceBet, useGetRates, getGetMarketsQueryKey } from '@workspace/api-client-react';
import { MobileShell } from '@/components/mobile-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Coins, Calculator } from 'lucide-react';
import { Link } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';

export default function GamePage() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const marketId = params.marketId || '';
  
  const { data: market, isLoading: marketLoading } = useGetMarket(marketId);
  const { data: rates } = useGetRates({ marketId });
  const placeBetMutation = usePlaceBet();
  
  const [session, setSession] = useState<'open' | 'close'>('open');
  const [betType, setBetType] = useState('single_digit');
  const [number, setNumber] = useState('');
  const [amount, setAmount] = useState('');
  
  const betTypes = [
    { value: 'single_digit', label: 'Single Digit', multiplier: 9, desc: 'Pick 0–9' },
    { value: 'jodi', label: 'Jodi', multiplier: 90, desc: 'Pick 00–99' },
    { value: 'single_panna', label: 'Single Panna', multiplier: 150, desc: '3 distinct digits' },
    { value: 'double_panna', label: 'Double Panna', multiplier: 300, desc: '3 digits with 1 pair' },
    { value: 'triple_panna', label: 'Triple Panna', multiplier: 600, desc: 'All 3 same digits' },
    { value: 'half_sangam_open', label: 'Half Sangam (Open)', multiplier: 1500, desc: 'Digit + Panna' },
    { value: 'half_sangam_close', label: 'Half Sangam (Close)', multiplier: 1500, desc: 'Panna + Digit' },
    { value: 'full_sangam', label: 'Full Sangam', multiplier: 10000, desc: 'Panna + Panna' },
    { value: 'family_sangam', label: 'Family Sangam', multiplier: 1500, desc: 'Digit family pannas' },
    { value: 'crossing', label: 'Crossing', multiplier: 90, desc: 'Jodi combinations' },
    { value: 'sp_motor', label: 'SP Motor', multiplier: 150, desc: 'Motor pannas' },
    { value: 'group_jodi', label: 'Group Jodi', multiplier: 90, desc: 'Group family jodis' },
    { value: 'digit_jodi', label: 'Digit-based Jodi', multiplier: 90, desc: 'Digit position jodi' },
    { value: 'red_bracket', label: 'Red Bracket', multiplier: 90, desc: 'Red doublet jodis' },
    { value: 'odd_even', label: 'Odd/Even', multiplier: 2, desc: 'Odd or Even digit' },
  ];
  
  const currentRate = rates?.find(r => r.betType === betType)?.multiplier || 
    betTypes.find(b => b.value === betType)?.multiplier || 0;
  
  const totalWin = amount ? (parseFloat(amount) * currentRate).toFixed(2) : '0.00';

  const quickAmounts = [10, 50, 100, 500, 1000];
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!market?.isBettingOpen) {
      toast({ title: 'Betting Closed', description: 'This market is not accepting bets right now', variant: 'destructive' });
      return;
    }

    if (!number.trim()) {
      toast({ title: 'Input Error', description: 'Please enter a valid number or choice', variant: 'destructive' });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({ title: 'Input Error', description: 'Please enter a valid bet amount', variant: 'destructive' });
      return;
    }
    
    placeBetMutation.mutate(
      {
        data: {
          marketId,
          betType,
          number: number.trim(),
          amount: parseFloat(amount),
          session
        }
      },
      {
        onSuccess: () => {
          toast({ title: 'Bet Placed Successfully!', description: `₹${amount} placed on ${betType.replace(/_/g, ' ')} (${number})` });
          setNumber('');
          setAmount('');
          queryClient.invalidateQueries({ queryKey: getGetMarketsQueryKey() });
          setTimeout(() => setLocation('/bids'), 600);
        },
        onError: (error: any) => {
          toast({ title: 'Bet Placement Failed', description: error?.response?.data?.error || error.message, variant: 'destructive' });
        }
      }
    );
  };
  
  const getNumberPlaceholder = () => {
    switch (betType) {
      case 'single_digit': return 'e.g. 7 (0-9)';
      case 'jodi': return 'e.g. 45 (00-99)';
      case 'single_panna': return 'e.g. 124 (3 distinct digits)';
      case 'double_panna': return 'e.g. 112 (1 pair digit)';
      case 'triple_panna': return 'e.g. 333 (000-999)';
      case 'half_sangam_open': return 'e.g. 4|127 (Open Digit | Close Panna)';
      case 'half_sangam_close': return 'e.g. 127|4 (Open Panna | Close Digit)';
      case 'full_sangam': return 'e.g. 127|456 (Open Panna | Close Panna)';
      case 'family_sangam': return 'e.g. 4|127 or 127';
      case 'crossing': return 'e.g. 123 (crossing digits)';
      case 'sp_motor': return 'e.g. 1234 (motor digits)';
      case 'group_jodi': return 'e.g. 45 (group jodi)';
      case 'digit_jodi': return 'e.g. 5';
      case 'red_bracket': return 'e.g. 00 or 50 or red';
      case 'odd_even': return 'e.g. odd or even';
      default: return 'Enter bet number';
    }
  };
  
  if (marketLoading) {
    return (
      <MobileShell showBottomNav={false}>
        <div className="p-6 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </MobileShell>
    );
  }
  
  if (!market) {
    return (
      <MobileShell showBottomNav={false}>
        <div className="p-6 text-center">
          <p className="text-muted-foreground">Market not found</p>
          <Link href="/home" className="text-primary mt-2 inline-block font-semibold">Back to Home</Link>
        </div>
      </MobileShell>
    );
  }
  
  return (
    <MobileShell showBottomNav={false}>
      <div className="min-h-[100dvh] bg-background pb-12">
        {/* Header */}
        <div className="bg-gradient-to-br from-card via-card to-secondary p-5 border-b border-border sticky top-0 z-10">
          <Link href="/home" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-3" data-testid="link-back">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Markets</span>
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-xl font-bold text-foreground" data-testid="text-market-name">
                {market.name}
              </h1>
              <p className="text-xs text-muted-foreground">Timing: {market.openTime} - {market.closeTime}</p>
            </div>
            {market.isBettingOpen ? (
              <Badge className="bg-emerald-600 text-white font-semibold px-3 py-1" data-testid="badge-market-status">
                OPEN
              </Badge>
            ) : (
              <Badge variant="destructive" className="font-semibold px-3 py-1" data-testid="badge-market-status">
                CLOSED
              </Badge>
            )}
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-5">
          {/* Session Selection */}
          <div className="space-y-2">
            <Label className="text-foreground font-semibold text-sm">Select Session</Label>
            <Tabs value={session} onValueChange={(v) => setSession(v as 'open' | 'close')}>
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="open" data-testid="tab-session-open">OPEN SESSION</TabsTrigger>
                <TabsTrigger value="close" data-testid="tab-session-close">CLOSE SESSION</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {/* Bet Type Grid */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-foreground font-semibold text-sm">Bet Type ({betTypes.length})</Label>
              <span className="text-xs text-primary font-medium">{currentRate}× Multiplier</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1 p-1 bg-card border border-border rounded-lg">
              {betTypes.map((type) => {
                const active = betType === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => {
                      setBetType(type.value);
                      setNumber('');
                    }}
                    className={`p-2 rounded border text-left transition-all ${
                      active
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                        : 'bg-background hover:bg-muted text-foreground border-border'
                    }`}
                  >
                    <div className="font-bold text-xs truncate">{type.label}</div>
                    <div className="text-[10px] opacity-80 mt-0.5">{type.multiplier}× Win</div>
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Number Input / Selector */}
          <div className="space-y-2">
            <Label htmlFor="number" className="text-foreground font-semibold text-sm">
              Enter Number / Choice
            </Label>
            
            {betType === 'odd_even' ? (
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={number === 'odd' ? 'default' : 'outline'}
                  className="h-12 text-base font-bold"
                  onClick={() => setNumber('odd')}
                >
                  ODD (1, 3, 5, 7, 9)
                </Button>
                <Button
                  type="button"
                  variant={number === 'even' ? 'default' : 'outline'}
                  className="h-12 text-base font-bold"
                  onClick={() => setNumber('even')}
                >
                  EVEN (0, 2, 4, 6, 8)
                </Button>
              </div>
            ) : (
              <Input
                id="number"
                type="text"
                placeholder={getNumberPlaceholder()}
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                required
                className="bg-input border-border text-foreground text-lg font-mono text-center h-12"
                data-testid="input-number"
              />
            )}
          </div>
          
          {/* Bet Amount Input & Quick Chips */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-foreground font-semibold text-sm">Bet Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              step="1"
              min="10"
              placeholder="Enter amount (Min ₹10)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="bg-input border-border text-foreground text-xl font-bold text-center h-12"
              data-testid="input-amount"
            />
            
            {/* Quick Chips */}
            <div className="flex gap-2 justify-center pt-1">
              {quickAmounts.map((amt) => (
                <Button
                  key={amt}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs font-semibold px-3 h-8"
                  onClick={() => setAmount(String((parseInt(amount || '0') || 0) + amt))}
                >
                  +₹{amt}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Win Calculation Card */}
          <Card className="bg-primary/10 border-primary/30 p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <Calculator className="w-3.5 h-3.5" /> Projected Win Payout
              </span>
              <Badge className="bg-primary text-primary-foreground font-bold">{currentRate}× Rate</Badge>
            </div>
            <div className="font-display text-2xl font-bold text-primary flex items-center gap-2" data-testid="text-potential-win">
              <Coins className="w-5 h-5 text-amber-500" />
              ₹{totalWin}
            </div>
          </Card>
          
          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-lg h-12 shadow-lg"
            disabled={!market.isBettingOpen || placeBetMutation.isPending}
            data-testid="button-place-bet"
          >
            {placeBetMutation.isPending ? 'Placing Bet...' : market.isBettingOpen ? `CONFIRM & PLACE BET (₹${amount || '0'})` : 'BETTING CLOSED'}
          </Button>
          
          <div className="text-center pt-1">
            <Link href="/rates" className="text-xs text-primary font-medium hover:underline" data-testid="link-view-rates">
              View Rate Card & Rules
            </Link>
          </div>
        </form>
      </div>
    </MobileShell>
  );
}
