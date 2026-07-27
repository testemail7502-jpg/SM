import React from 'react';
import { useGetAdminDashboard } from '@workspace/api-client-react';
import { 
  Users, Gamepad2, ArrowDownToLine, Wallet, Trophy, 
  AlertCircle, ChevronRight, Activity, IndianRupee
} from 'lucide-react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Dashboard() {
  const { data, isLoading } = useGetAdminDashboard();

  if (isLoading) {
    return <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-muted rounded"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-32 bg-muted rounded-xl"></div>
        ))}
      </div>
    </div>;
  }

  const d = data || {
    totalUsers: 0, totalBetsToday: 0, totalPayoutToday: 0, 
    totalDepositToday: 0, totalWithdrawToday: 0, pendingDeposits: 0, 
    pendingWithdraws: 0, activeMarkets: 0, recentBets: [], recentDeposits: []
  };

  const statCards = [
    { title: 'Total Users', value: d.totalUsers, icon: Users, color: 'text-blue-500' },
    { title: 'Active Markets', value: d.activeMarkets, icon: Gamepad2, color: 'text-indigo-500' },
    { title: 'Bets Today', value: d.totalBetsToday, icon: Activity, color: 'text-purple-500' },
    { title: 'Payouts Today', value: `₹${d.totalPayoutToday}`, icon: Trophy, color: 'text-green-500' },
    { title: 'Deposits Today', value: `₹${d.totalDepositToday}`, icon: ArrowDownToLine, color: 'text-emerald-500' },
    { title: 'Withdrawals Today', value: `₹${d.totalWithdrawToday}`, icon: Wallet, color: 'text-rose-500' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Command Center</h1>
          <p className="text-muted-foreground text-sm mt-1">Platform overview and real-time metrics.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link href="/deposits" className="flex items-center px-4 py-2 bg-amber-100 text-amber-900 hover:bg-amber-200 rounded-lg text-sm font-semibold transition-colors">
            <AlertCircle className="w-4 h-4 mr-2" />
            {d.pendingDeposits} Pending Deposits
          </Link>
          <Link href="/withdrawals" className="flex items-center px-4 py-2 bg-rose-100 text-rose-900 hover:bg-rose-200 rounded-lg text-sm font-semibold transition-colors">
            <AlertCircle className="w-4 h-4 mr-2" />
            {d.pendingWithdraws} Pending Withdrawals
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
                <p className="text-xs font-medium text-muted-foreground mt-1 uppercase tracking-wider">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bets */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-bold">Recent Live Bets</CardTitle>
            <Badge variant="outline" className="font-mono text-xs">Real-time</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {d.recentBets && d.recentBets.length > 0 ? d.recentBets.map(bet => (
                <div key={bet.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                  <div>
                    <p className="font-semibold text-sm">{bet.marketName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{bet.userPhone || bet.userName} • {bet.betType} • No: <span className="font-mono font-bold text-foreground">{bet.number}</span></p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm flex items-center justify-end"><IndianRupee className="w-3 h-3 mr-0.5"/>{bet.amount}</p>
                    <p className="text-[10px] text-muted-foreground mt-1 uppercase">{new Date(bet.createdAt).toLocaleTimeString()}</p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-muted-foreground text-sm">No recent bets</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Deposits */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-bold">Recent Deposits</CardTitle>
            <Link href="/deposits" className="text-sm font-medium text-primary hover:underline flex items-center">
              View all <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {d.recentDeposits && d.recentDeposits.length > 0 ? d.recentDeposits.map(dep => (
                <div key={dep.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                  <div>
                    <p className="font-semibold text-sm">{dep.userPhone || dep.userName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 font-mono">UTR: {dep.utrNumber}</p>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <p className="font-bold text-sm flex items-center justify-end"><IndianRupee className="w-3 h-3 mr-0.5"/>{dep.amount}</p>
                    <Badge variant={dep.status === 'pending' ? 'secondary' : dep.status === 'approved' ? 'default' : 'destructive'} className="mt-1 text-[10px] px-1.5 py-0">
                      {dep.status}
                    </Badge>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-muted-foreground text-sm">No recent deposits</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
