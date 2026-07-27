import { useState } from 'react';
import { useGetSettings, useCreateDepositRequest, useUploadDepositScreenshot } from '@workspace/api-client-react';
import { MobileShell } from '@/components/mobile-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Link, useLocation } from 'wouter';
import { ArrowLeft, Copy, Upload } from 'lucide-react';

export default function AddFundsPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: settings, isLoading } = useGetSettings();
  const uploadMutation = useUploadDepositScreenshot();
  const depositMutation = useCreateDepositRequest();
  
  const [amount, setAmount] = useState('');
  const [utrNumber, setUtrNumber] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshotFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied!', description: 'Copied to clipboard' });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let screenshotUrl = null;
    
    if (screenshotFile && screenshotPreview) {
      const base64 = screenshotPreview.split(',')[1];
      const mimeType = screenshotFile.type;
      
      try {
        const uploadResult = await uploadMutation.mutateAsync({
          data: { screenshotBase64: base64, mimeType }
        });
        screenshotUrl = uploadResult.url;
      } catch (error: any) {
        toast({ title: 'Upload Failed', description: error.message, variant: 'destructive' });
        return;
      }
    }
    
    depositMutation.mutate(
      {
        data: {
          amount: parseFloat(amount),
          utrNumber,
          screenshotUrl
        }
      },
      {
        onSuccess: () => {
          toast({ title: 'Request Submitted!', description: 'Your deposit request has been submitted for approval' });
          setLocation('/wallet');
        },
        onError: (error) => {
          toast({ title: 'Request Failed', description: error.message, variant: 'destructive' });
        }
      }
    );
  };
  
  if (isLoading) {
    return (
      <MobileShell showBottomNav={false}>
        <div className="p-6 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </MobileShell>
    );
  }
  
  return (
    <MobileShell showBottomNav={false}>
      <div className="min-h-[100dvh] bg-background">
        <div className="bg-gradient-to-br from-card via-card to-secondary p-6 border-b border-border">
          <Link href="/wallet" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4" data-testid="link-back">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Wallet</span>
          </Link>
          
          <h1 className="font-display text-2xl font-bold text-foreground">Add Funds</h1>
        </div>
        
        <div className="p-6 space-y-6">
          {/* QR Code */}
          {settings?.qrCodeUrl && (
            <Card className="p-6 bg-card border-card-border">
              <h2 className="font-semibold text-foreground mb-4">Scan QR Code</h2>
              <div className="bg-white p-4 rounded-lg inline-block">
                <img 
                  src={settings.qrCodeUrl} 
                  alt="Payment QR Code" 
                  className="w-48 h-48 mx-auto"
                  data-testid="img-qr-code"
                />
              </div>
            </Card>
          )}
          
          {/* UPI ID */}
          {settings?.upiId && (
            <Card className="p-4 bg-card border-card-border">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground mb-1">UPI ID</div>
                  <div className="font-mono font-semibold text-foreground" data-testid="text-upi-id">
                    {settings.upiId}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(settings.upiId)}
                  data-testid="button-copy-upi"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          )}
          
          {/* Deposit Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-foreground font-semibold">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                step="1"
                min={settings?.minBet || 1}
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="bg-input border-border text-foreground text-lg font-semibold"
                data-testid="input-amount"
              />
              {settings?.minBet && (
                <p className="text-xs text-muted-foreground">Minimum: ₹{settings.minBet}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="utr" className="text-foreground font-semibold">UTR/Transaction Number</Label>
              <Input
                id="utr"
                type="text"
                placeholder="Enter UTR number"
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value)}
                className="bg-input border-border text-foreground font-mono"
                data-testid="input-utr"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="screenshot" className="text-foreground font-semibold">Payment Screenshot</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-all">
                <input
                  id="screenshot"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  data-testid="input-screenshot"
                />
                <label htmlFor="screenshot" className="cursor-pointer">
                  {screenshotPreview ? (
                    <img src={screenshotPreview} alt="Screenshot" className="max-h-48 mx-auto rounded" />
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-12 h-12 text-muted-foreground mx-auto" />
                      <p className="text-sm text-muted-foreground">Click to upload screenshot</p>
                    </div>
                  )}
                </label>
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-lg h-14"
              disabled={depositMutation.isPending || uploadMutation.isPending}
              data-testid="button-submit"
            >
              {depositMutation.isPending || uploadMutation.isPending ? 'Submitting...' : 'Submit Request'}
            </Button>
          </form>
        </div>
      </div>
    </MobileShell>
  );
}
