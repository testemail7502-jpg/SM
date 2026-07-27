import React, { useState } from 'react';
import { useGetDepositRequests, useUpdateDepositRequest } from '@workspace/api-client-react';
import { CheckCircle, XCircle, ExternalLink } from 'lucide-react';
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

export default function Deposits() {
  const [statusFilter, setStatusFilter] = useState('pending');
  const { data: requests = [], isLoading } = useGetDepositRequests(
    statusFilter === 'all' ? {} : { status: statusFilter }
  );
  
  const [selectedReq, setSelectedReq] = useState<any>(null);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [note, setNote] = useState('');
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const updateRequest = useUpdateDepositRequest();

  const handleAction = () => {
    if (!selectedReq || !action) return;
    
    updateRequest.mutate({
      id: selectedReq.id,
      data: {
        status: action === 'approve' ? 'approved' : 'rejected',
        adminNote: note
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/deposit-requests'] });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/dashboard'] });
        toast({ title: `Deposit request ${action}d` });
        setSelectedReq(null);
        setAction(null);
        setNote('');
      }
    });
  };

  const openDialog = (req: any, act: 'approve' | 'reject') => {
    setSelectedReq(req);
    setAction(act);
    setNote('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Deposit Requests</h1>
          <p className="text-muted-foreground text-sm mt-1">Review UTRs and screenshots to approve wallet top-ups.</p>
        </div>
      </div>

      <div className="flex gap-2 pb-2 overflow-x-auto">
        {['pending', 'approved', 'rejected', 'all'].map(status => (
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
                <th className="px-4 py-3 font-semibold">UTR Number</th>
                <th className="px-4 py-3 font-semibold">Screenshot</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={7} className="text-center py-8">Loading requests...</td></tr>
              ) : requests.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">No {statusFilter !== 'all' ? statusFilter : ''} deposit requests.</td></tr>
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
                    <td className="px-4 py-3 text-right font-bold text-green-600 text-base">
                      ₹{req.amount}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{req.utrNumber || '-'}</td>
                    <td className="px-4 py-3">
                      {req.screenshotUrl ? (
                        <button 
                          onClick={() => setImagePreview(req.screenshotUrl || null)}
                          className="flex items-center text-xs font-medium text-blue-600 hover:underline"
                        >
                          View <ExternalLink className="w-3 h-3 ml-1" />
                        </button>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={req.status === 'pending' ? 'secondary' : req.status === 'approved' ? 'default' : 'destructive'} className="capitalize text-[10px]">
                        {req.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {req.status === 'pending' && (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" className="h-8 border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800" onClick={() => openDialog(req, 'approve')}>
                            <CheckCircle className="w-4 h-4 mr-1" /> Approve
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-800" onClick={() => openDialog(req, 'reject')}>
                            <XCircle className="w-4 h-4 mr-1" /> Reject
                          </Button>
                        </div>
                      )}
                      {req.status !== 'pending' && <span className="text-xs text-muted-foreground">{req.adminNote || 'No note'}</span>}
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
            <DialogTitle className={action === 'approve' ? 'text-green-600' : 'text-rose-600'}>
              {action === 'approve' ? 'Approve Deposit' : 'Reject Deposit'}
            </DialogTitle>
          </DialogHeader>
          {selectedReq && (
            <div className="space-y-4 pt-4">
              <div className="p-4 bg-muted/30 rounded-lg border flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="text-2xl font-bold text-green-600">₹{selectedReq.amount}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Player</p>
                  <p className="font-bold">{selectedReq.userName}</p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Admin Note (Optional)</label>
                <Textarea 
                  placeholder={action === 'approve' ? 'E.g., Added to wallet successfully' : 'Reason for rejection...'} 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setSelectedReq(null)}>Cancel</Button>
                <Button 
                  variant={action === 'approve' ? 'default' : 'destructive'} 
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

      <Dialog open={!!imagePreview} onOpenChange={(open) => !open && setImagePreview(null)}>
        <DialogContent className="max-w-2xl bg-transparent border-0 shadow-none p-0">
          {imagePreview && (
            <div className="relative">
              <img src={imagePreview} alt="Payment Screenshot" className="w-full h-auto rounded-lg max-h-[80vh] object-contain bg-black/50" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
