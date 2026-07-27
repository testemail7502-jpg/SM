import React, { useState } from 'react';
import { useGetResults, useGetMarkets } from '@workspace/api-client-react';
import { History, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export default function Results() {
  const [marketId, setMarketId] = useState<string>('all');
  const [date, setDate] = useState<string>('');
  
  const { data: markets = [] } = useGetMarkets();
  
  // Create stable params for query
  const queryParams = {
    ...(marketId !== 'all' && { marketId }),
    ...(date && { date }),
    limit: 50
  };

  const { data: results = [], isLoading } = useGetResults(queryParams as any);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Result History</h1>
          <p className="text-muted-foreground text-sm mt-1">Past declared results and payout information.</p>
        </div>
      </div>

      <div className="bg-card p-4 rounded-xl border shadow-sm flex flex-col sm:flex-row gap-4 items-end">
        <div className="space-y-1.5 w-full sm:w-64">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Filter by Market</label>
          <Select value={marketId} onValueChange={setMarketId}>
            <SelectTrigger>
              <SelectValue placeholder="All Markets" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Markets</SelectItem>
              {markets.map(m => (
                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5 w-full sm:w-48">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Filter by Date</label>
          <Input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
          />
        </div>
        <Button variant="outline" onClick={() => { setMarketId('all'); setDate(''); }}>
          <Filter className="w-4 h-4 mr-2" /> Clear
        </Button>
      </div>

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
              <tr>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Market</th>
                <th className="px-4 py-3 font-semibold">Result</th>
                <th className="px-4 py-3 font-semibold text-right">Winners</th>
                <th className="px-4 py-3 font-semibold text-right">Total Payout</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-8">Loading results...</td></tr>
              ) : results.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-muted-foreground">
                    <History className="w-8 h-8 mx-auto mb-3 opacity-20" />
                    No results found for the selected filters.
                  </td>
                </tr>
              ) : (
                results.map((res) => (
                  <tr key={res.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground font-medium">
                      {new Date(res.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 font-bold text-primary">{res.marketName}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 font-mono font-bold bg-muted px-3 py-1 rounded-md inline-flex text-base">
                        <span className="text-muted-foreground">{res.openPanna || 'XXX'}</span>
                        <span className="text-primary/40">-</span>
                        <span className="text-primary">{res.jodi || 'XX'}</span>
                        <span className="text-primary/40">-</span>
                        <span className="text-muted-foreground">{res.closePanna || 'XXX'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {res.winnersCount || 0}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-green-600">
                      ₹{res.totalPayout || 0}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
