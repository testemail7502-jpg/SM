import { useGetRates } from '@workspace/api-client-react';
import { MobileShell } from '@/components/mobile-shell';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Percent } from 'lucide-react';
import { Link } from 'wouter';

export default function RateCardPage() {
  const { data: rates, isLoading } = useGetRates({});

  const defaultRates = [
    { betType: 'Single Digit', multiplier: 9, desc: 'Pick 0–9; wins if matches open/close digit' },
    { betType: 'Jodi', multiplier: 90, desc: 'Pick 00–99 (open+close combined)' },
    { betType: 'Single Panna (SP)', multiplier: 150, desc: '3-digit number (sum unit = digit)' },
    { betType: 'Double Panna (DP)', multiplier: 300, desc: '3-digit number with 1 pair digit' },
    { betType: 'Triple Panna (TP)', multiplier: 600, desc: 'All 3 same digits (000-999)' },
    { betType: 'Half Sangam (Open)', multiplier: 1500, desc: 'Single digit + Panna (open side)' },
    { betType: 'Half Sangam (Close)', multiplier: 1500, desc: 'Panna + Single digit (close side)' },
    { betType: 'Full Sangam', multiplier: 10000, desc: 'Panna + Panna' },
    { betType: 'Family Sangam', multiplier: 1500, desc: 'Group of pannas under one digit' },
    { betType: 'Crossing', multiplier: 90, desc: 'Generate all jodie combinations' },
    { betType: 'SP Motor', multiplier: 150, desc: 'All pannas for given digits' },
    { betType: 'Group Jodi', multiplier: 90, desc: 'All jodies for selected digits' },
    { betType: 'Digit-based Jodi', multiplier: 90, desc: 'Jodie filtered by digit position' },
    { betType: 'Red Bracket', multiplier: 90, desc: 'Subset crossing variant' },
    { betType: 'Odd/Even', multiplier: 2, desc: 'Bet on whether digit is odd or even' },
  ];

  return (
    <MobileShell showBottomNav={true}>
      <div className="min-h-[100dvh] bg-background pb-20">
        <div className="bg-gradient-to-br from-card via-card to-secondary p-5 border-b border-border sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Link href="/home" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
              <Percent className="w-5 h-5 text-amber-400" /> Rate Card (Multipliers)
            </h1>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : (
            (rates && rates.length > 0
              ? rates.map((r) => ({
                  betType: r.betType.replace(/_/g, ' ').toUpperCase(),
                  multiplier: r.multiplier,
                  desc: r.description || `${r.multiplier}× Win Payout`,
                }))
              : defaultRates
            ).map((r, i) => (
              <Card key={i} className="p-4 bg-card border-border shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-foreground capitalize">{r.betType}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{r.desc}</p>
                </div>
                <Badge className="bg-primary text-primary-foreground text-sm font-bold px-3 py-1">
                  {r.multiplier}×
                </Badge>
              </Card>
            ))
          )}
        </div>
      </div>
    </MobileShell>
  );
}
