import { useGetResults } from '@workspace/api-client-react';
import { MobileShell } from '@/components/mobile-shell';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Trophy, Calendar } from 'lucide-react';
import { Link } from 'wouter';

export default function ResultsHistoryPage() {
  const { data: results, isLoading } = useGetResults({});

  return (
    <MobileShell showBottomNav={true}>
      <div className="min-h-[100dvh] bg-background pb-20">
        <div className="bg-gradient-to-br from-card via-card to-secondary p-5 border-b border-border sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Link href="/home" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" /> Result History & Charts
            </h1>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : !results || results.length === 0 ? (
            <div className="text-center py-12 space-y-2 text-muted-foreground">
              <Trophy className="w-10 h-10 mx-auto opacity-50" />
              <p className="text-sm">No declared results found yet.</p>
            </div>
          ) : (
            results.map((r) => (
              <Card key={r.id} className="p-4 bg-card border-border shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-foreground">{r.marketName || 'Market'}</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Calendar className="w-3 h-3" /> {r.date}
                  </p>
                </div>
                <div className="text-right">
                  <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-base font-mono font-bold px-3 py-1">
                    {r.openPanna || '***'}-{r.jodi || '**'}-{r.closePanna || '***'}
                  </Badge>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </MobileShell>
  );
}
