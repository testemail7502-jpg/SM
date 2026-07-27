import React, { useState, useEffect } from 'react';
import { 
  useGetMarkets, 
  useDeclareResult 
} from '@workspace/api-client-react';
import { format } from 'date-fns';
import { Trophy, Calculator, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export default function DeclareResult() {
  const { toast } = useToast();
  const { data: markets = [] } = useGetMarkets();
  const declareResult = useDeclareResult();

  const [formData, setFormData] = useState({
    marketId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    openPanna: '',
    closePanna: ''
  });

  const [calc, setCalc] = useState({
    openDigit: '',
    closeDigit: '',
    jodi: ''
  });

  const [successData, setSuccessData] = useState<{winners: number, payout: number} | null>(null);

  // Helper to calculate digit from panna
  const calculateDigit = (panna: string) => {
    if (!panna || panna.length !== 3 || isNaN(Number(panna))) return '';
    const sum = parseInt(panna[0]) + parseInt(panna[1]) + parseInt(panna[2]);
    return (sum % 10).toString();
  };

  useEffect(() => {
    const od = calculateDigit(formData.openPanna);
    const cd = calculateDigit(formData.closePanna);
    setCalc({
      openDigit: od,
      closeDigit: cd,
      jodi: od && cd ? `${od}${cd}` : (od ? `${od}*` : (cd ? `*${cd}` : ''))
    });
  }, [formData.openPanna, formData.closePanna]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessData(null);

    if (!formData.marketId) {
      toast({ title: "Please select a market", variant: "destructive" });
      return;
    }

    if (formData.openPanna && formData.openPanna.length !== 3) {
      toast({ title: "Open Panna must be 3 digits", variant: "destructive" });
      return;
    }

    if (formData.closePanna && formData.closePanna.length !== 3) {
      toast({ title: "Close Panna must be 3 digits", variant: "destructive" });
      return;
    }

    if (!formData.openPanna && !formData.closePanna) {
      toast({ title: "Provide at least Open or Close Panna", variant: "destructive" });
      return;
    }

    declareResult.mutate({
      data: {
        marketId: formData.marketId,
        date: formData.date,
        openPanna: formData.openPanna,
        closePanna: formData.closePanna || ""
      }
    }, {
      onSuccess: (res) => {
        toast({ title: "Result declared successfully!" });
        setSuccessData({
          winners: res.winnersCount,
          payout: res.totalPayout
        });
        setFormData(prev => ({ ...prev, openPanna: '', closePanna: '' }));
      },
      onError: (err: any) => {
        toast({ 
          title: "Declaration failed", 
          description: err.message || "An error occurred",
          variant: "destructive" 
        });
      }
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Declare Result</h1>
        <p className="text-muted-foreground text-sm mt-1">Publish results to calculate winnings and execute automatic payouts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8">
          <Card className="border-2 shadow-md">
            <CardHeader className="bg-muted/30 border-b pb-4">
              <CardTitle className="flex items-center text-lg">
                <Trophy className="w-5 h-5 mr-2 text-primary" />
                Result Entry Form
              </CardTitle>
              <CardDescription>Enter the 3-digit Panna numbers. The digits and Jodi will calculate automatically.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold">Select Market</Label>
                    <Select value={formData.marketId} onValueChange={(val) => setFormData({...formData, marketId: val})}>
                      <SelectTrigger className="h-12 bg-muted/20">
                        <SelectValue placeholder="Choose a market" />
                      </SelectTrigger>
                      <SelectContent>
                        {markets.map(m => (
                          <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Result Date</Label>
                    <Input 
                      type="date" 
                      value={formData.date} 
                      onChange={(e) => setFormData({...formData, date: e.target.value})} 
                      className="h-12 bg-muted/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-2">
                  <div className="space-y-3 p-4 border rounded-xl bg-blue-50/50 dark:bg-blue-950/20">
                    <div className="flex items-center justify-between">
                      <Label className="font-bold text-blue-900 dark:text-blue-100">Open Panna (3 digits)</Label>
                      <Tooltip>
                        <TooltipTrigger><HelpCircle className="w-4 h-4 text-muted-foreground" /></TooltipTrigger>
                        <TooltipContent>E.g., 127</TooltipContent>
                      </Tooltip>
                    </div>
                    <Input 
                      placeholder="XXX" 
                      maxLength={3}
                      value={formData.openPanna}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setFormData({...formData, openPanna: val});
                      }}
                      className="h-14 text-center text-2xl font-mono tracking-widest font-bold border-blue-200 focus-visible:ring-blue-500"
                    />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground font-medium">Calculated Digit:</span>
                      <span className="font-bold font-mono text-lg text-blue-600 dark:text-blue-400 w-8 text-center">{calc.openDigit || '-'}</span>
                    </div>
                  </div>

                  <div className="space-y-3 p-4 border rounded-xl bg-purple-50/50 dark:bg-purple-950/20">
                    <div className="flex items-center justify-between">
                      <Label className="font-bold text-purple-900 dark:text-purple-100">Close Panna (3 digits)</Label>
                      <Tooltip>
                        <TooltipTrigger><HelpCircle className="w-4 h-4 text-muted-foreground" /></TooltipTrigger>
                        <TooltipContent>E.g., 348</TooltipContent>
                      </Tooltip>
                    </div>
                    <Input 
                      placeholder="XXX" 
                      maxLength={3}
                      value={formData.closePanna}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setFormData({...formData, closePanna: val});
                      }}
                      className="h-14 text-center text-2xl font-mono tracking-widest font-bold border-purple-200 focus-visible:ring-purple-500"
                    />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground font-medium">Calculated Digit:</span>
                      <span className="font-bold font-mono text-lg text-purple-600 dark:text-purple-400 w-8 text-center">{calc.closeDigit || '-'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button 
                    type="submit" 
                    className="w-full h-14 text-lg font-bold"
                    disabled={declareResult.isPending || !formData.marketId || (!formData.openPanna && !formData.closePanna)}
                  >
                    {declareResult.isPending ? 'Processing...' : 'Declare Result & Execute Payouts'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-4 space-y-6">
          <Card className="bg-sidebar text-sidebar-foreground border-sidebar-border overflow-hidden">
            <CardHeader className="bg-sidebar-accent/50 pb-4">
              <CardTitle className="flex items-center text-sm font-bold text-sidebar-accent-foreground">
                <Calculator className="w-4 h-4 mr-2" />
                Live Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center space-y-2 mb-6">
                <p className="text-xs text-sidebar-foreground/60 uppercase tracking-widest font-semibold">Final Display</p>
                <div className="flex items-center justify-center gap-2 text-2xl font-mono font-bold">
                  <span>{formData.openPanna || 'XXX'}</span>
                  <span className="text-primary">-</span>
                  <span className="text-4xl text-primary px-2">{calc.jodi || 'XX'}</span>
                  <span className="text-primary">-</span>
                  <span>{formData.closePanna || 'XXX'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {successData && (
            <Card className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900 animate-in fade-in slide-in-from-bottom-4">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-500/20">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-green-900 dark:text-green-100 text-lg">Declaration Successful</h3>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">Automatic payouts have been processed.</p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-green-200 dark:border-green-800">
                  <div>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-400">{successData.winners}</p>
                    <p className="text-xs font-semibold text-green-600/70 dark:text-green-500 uppercase">Winners</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-400">₹{successData.payout}</p>
                    <p className="text-xs font-semibold text-green-600/70 dark:text-green-500 uppercase">Total Payout</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
