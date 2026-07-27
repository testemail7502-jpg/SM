import React, { useState } from 'react';
import { useGetWithdrawRequests, useUpdateWithdrawRequest } from '@workspace/api-client-react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export default function Withdrawals() {
  const [statusFilter, setStatusFilter] = useState('pending');
  const { data: requests = [], isLoading } = useGetWithdrawRequests(
    statusFilter === 'all' ? {} : { status: statusFilter }
  );
  
  const [selectedReq, setSelectedReq] = useState<any>(null);
  const [action, setAction] = useState<'approved' | 'rejected' | 'paid' | null>(null);
  const [note, setNote] = useState('');
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const updateRequest = useUpdateWithdrawRequest();

  const handleAction = () => {
    if (!selectedReq || !action) return;
    
    updateRequest.mutate({
      id: selectedReq.id,
      data: {
        status: action,
        adminNote: note
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/withdraws'] });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/dashboard'] });
        toast({ title: `Withdrawal marked as ${action}` });
        setSelectedReq(null);
        setAction(null);
        setNote('');
      }
    });
  };

  const openDialog = (req: any, act: 'approved' | 'rejected' | 'paid') => {
    setSelectedReq(req);
    setAction(act);
    setNote('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Withdrawal Requests</h1>
          <p className="text-muted-foreground text-sm mt-1">Process player payouts to their bank accounts.</p>
        </div>
      </div>

      <div className="flex gap-2 pb-2 overflow-x-auto">
        {['pending', 'approved', 'paid', 'rejected', 'all'].map(status => (
          <Button 
            key={status}
            variant={statusFilter === status ? "default" : "outline"}
            onClick={() => setStatusFilter(status)}
            className="capitalize"
            size="sm"
          >
            {status}
          </Button>
        ))}
      </div>

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
              <tr>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Player</th>
                <th className="px-4 py-3 font-semibold text-right">Amount</th>
                <th className="px-4 py-3 font-semibold">Bank Details</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-8">Loading requests...</td></tr>
              ) : requests.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">No {statusFilter !== 'all' ? statusFilter : ''} withdrawal requests.</td></tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                      {new Date(req.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold">{req.userName || 'Unknown'}</p>
                      <p className="text-xs font-mono text-muted-foreground">{req.userPhone}</p>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-rose-600 text-base">
                      ₹{req.amount}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs space-y-0.5">
                        {req.upiId ? (
                          <p><span className="text-muted-foreground">UPI:</span> <span className="font-mono font-medium">{req.upiId}</span></p>
                        ) : null}
                        {req.bankAccount ? (
                          <>
                            <p><span className="text-muted-foreground">A/C:</span> <span className="font-mono font-medium">{req.bankAccount}</span></p>
                            <p><span className="text-muted-foreground">IFSC:</span> <span className="font-mono">{req.ifscCode}</span></p>
                          </>
                        ) : null}
                        {!req.upiId && !req.bankAccount && <span className="italic text-muted-foreground">No details</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={
                        req.status === 'pending' ? 'secondary' : 
                        req.status === 'approved' ? 'outline' : 
                        req.status === 'paid' ? 'default' : 
                        'destructive'
                      } className="capitalize text-[10px]">
                        {req.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {req.status === 'pending' && (
                        <div className="flex justify-end gap-2 flex-wrap">
                          <Button size="sm" variant="outline" className="h-8" onClick={() => openDialog(req, 'approved')}>
                            Approve
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 border-rose-200 text-rose-700 hover:bg-rose-50" onClick={() => openDialog(req, 'rejected')}>
                            Reject
                          </Button>
                        </div>
                      )}
                      {req.status === 'approved' && (
                        <Button size="sm" className="h-8 bg-green-600 hover:bg-green-700" onClick={() => openDialog(req, 'paid')}>
                          <CheckCircle className="w-4 h-4 mr-1" /> Mark Paid
                        </Button>
                      )}
                      {(req.status === 'paid' || req.status === 'rejected') && (
                        <span className="text-xs text-muted-foreground">{req.adminNote || 'Processed'}</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!selectedReq && !!action} onOpenChange={(open) => !open && setSelectedReq(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className={
              action === 'paid' ? 'text-green-600' : 
              action === 'rejected' ? 'text-rose-600' : 
              ''
            }>
              {action === 'paid' ? 'Mark as Paid' : 
               action === 'approved' ? 'Approve Request' : 
               'Reject Request'}
            </DialogTitle>
          </DialogHeader>
          {selectedReq && (
            <div className="space-y-4 pt-4">
              <div className="p-4 bg-muted/30 rounded-lg border flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Amount to send</p>
                  <p className="text-2xl font-bold text-rose-600">₹{selectedReq.amount}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Player</p>
                  <p className="font-bold">{selectedReq.userName}</p>
                </div>
              </div>
              
              <div className="bg-muted/10 p-3 rounded border text-sm space-y-1">
                <p className="font-semibold mb-2 text-muted-foreground">Transfer Details</p>
                {selectedReq.upiId && <p>UPI ID: <span className="font-mono font-bold select-all">{selectedReq.upiId}</span></p>}
                {selectedReq.bankAccount && (
                  <>
                    <p>Account: <span className="font-mono font-bold select-all">{selectedReq.bankAccount}</span></p>
                    <p>IFSC: <span className="font-mono font-bold select-all">{selectedReq.ifscCode}</span></p>
                    <p>Name: <span className="font-semibold">{selectedReq.accountName}</span></p>
                  </>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Admin Note (Optional)</label>
                <Textarea 
                  placeholder={
                    action === 'paid' ? 'Reference number or UTR...' : 
                    action === 'rejected' ? 'Reason for rejection...' : 
                    'Internal note...'
                  } 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setSelectedReq(null)}>Cancel</Button>
                <Button 
                  variant={action === 'rejected' ? 'destructive' : 'default'} 
                  onClick={handleAction}
                  disabled={updateRequest.isPending}
                >
                  {updateRequest.isPending ? 'Processing...' : `Confirm ${action}`}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
