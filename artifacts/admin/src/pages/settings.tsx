import React, { useState, useEffect } from 'react';
import { useGetSettings, useUpdateSettings, useUploadQrCode } from '@workspace/api-client-react';
import { Settings2, Save, UploadCloud, IndianRupee, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const { data: settings, isLoading } = useGetSettings();
  const updateSettings = useUpdateSettings();
  const uploadQr = useUploadQrCode();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    appName: '',
    whatsappNumber: '',
    upiId: '',
    minBet: 0,
    maxBet: 0,
    minWithdraw: 0,
    maxWithdraw: 0,
    bannerMessage: ''
  });

  const [qrFile, setQrFile] = useState<File | null>(null);
  const [qrPreview, setQrPreview] = useState<string | null>(null);

  useEffect(() => {
    if (settings) {
      setFormData({
        appName: settings.appName || '',
        whatsappNumber: settings.whatsappNumber || '',
        upiId: settings.upiId || '',
        minBet: settings.minBet || 0,
        maxBet: settings.maxBet || 0,
        minWithdraw: settings.minWithdraw || 0,
        maxWithdraw: settings.maxWithdraw || 0,
        bannerMessage: settings.bannerMessage || ''
      });
      setQrPreview(settings.qrCodeUrl);
    }
  }, [settings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings.mutate({ data: formData }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
        toast({ title: 'Settings saved successfully' });
      }
    });
  };

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setQrFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setQrPreview(base64);
      
      // Extract base64 without prefix
      const base64Data = base64.split(',')[1];
      
      uploadQr.mutate({
        data: {
          qrCodeBase64: base64Data,
          mimeType: file.type
        }
      }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
          toast({ title: 'QR Code updated successfully' });
        }
      });
    };
    reader.readAsDataURL(file);
  };

  if (isLoading) return <div className="p-8 text-center animate-pulse">Loading configuration...</div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Platform Configuration</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage global app settings, limits, and payment details.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">General Profile</CardTitle>
                <CardDescription>Public-facing details for the application.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>App Name</Label>
                    <Input 
                      value={formData.appName} 
                      onChange={e => setFormData({...formData, appName: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>WhatsApp Support Number</Label>
                    <Input 
                      value={formData.whatsappNumber} 
                      onChange={e => setFormData({...formData, whatsappNumber: e.target.value})} 
                      placeholder="+91..."
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Scrolling Banner Message</Label>
                  <Textarea 
                    value={formData.bannerMessage} 
                    onChange={e => setFormData({...formData, bannerMessage: e.target.value})} 
                    placeholder="E.g., Welcome to Sara777! Play responsibly..."
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Financial Limits</CardTitle>
                <CardDescription>Set boundaries for bets and withdrawals.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                    <h3 className="font-semibold text-sm flex items-center"><IndianRupee className="w-4 h-4 mr-2" /> Betting Limits</h3>
                    <div className="space-y-2">
                      <Label className="text-xs">Minimum Bet (₹)</Label>
                      <Input type="number" value={formData.minBet} onChange={e => setFormData({...formData, minBet: parseInt(e.target.value)})} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Maximum Bet (₹)</Label>
                      <Input type="number" value={formData.maxBet} onChange={e => setFormData({...formData, maxBet: parseInt(e.target.value)})} />
                    </div>
                  </div>
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                    <h3 className="font-semibold text-sm flex items-center"><IndianRupee className="w-4 h-4 mr-2" /> Withdrawal Limits</h3>
                    <div className="space-y-2">
                      <Label className="text-xs">Minimum Withdraw (₹)</Label>
                      <Input type="number" value={formData.minWithdraw} onChange={e => setFormData({...formData, minWithdraw: parseInt(e.target.value)})} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Maximum Withdraw (₹)</Label>
                      <Input type="number" value={formData.maxWithdraw} onChange={e => setFormData({...formData, maxWithdraw: parseInt(e.target.value)})} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button type="submit" className="w-full h-12 text-lg font-bold" disabled={updateSettings.isPending}>
              <Save className="w-5 h-5 mr-2" />
              {updateSettings.isPending ? 'Saving...' : 'Save Configuration'}
            </Button>
          </form>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Gateway</CardTitle>
              <CardDescription>Where users will send deposits.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Primary UPI ID</Label>
                <Input 
                  value={formData.upiId} 
                  onChange={e => setFormData({...formData, upiId: e.target.value})} 
                  onBlur={handleSave} // Auto-save on blur for convenience
                  placeholder="name@bank"
                  className="font-mono bg-blue-50/50 border-blue-200"
                />
              </div>
              
              <div className="space-y-3">
                <Label>Payment QR Code</Label>
                <div className="border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center bg-muted/10 relative overflow-hidden group min-h-[250px]">
                  {qrPreview ? (
                    <img src={qrPreview} alt="Payment QR" className="max-w-[200px] h-auto object-contain rounded-md shadow-sm" />
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <QrCode className="w-12 h-12 mx-auto mb-2 opacity-20" />
                      <span className="text-sm">No QR uploaded</span>
                    </div>
                  )}
                  
                  <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white">
                    <UploadCloud className="w-8 h-8 mb-2" />
                    <span className="font-semibold text-sm">{qrPreview ? 'Change QR Code' : 'Upload QR Code'}</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleQrUpload} />
                  </label>
                  
                  {uploadQr.isPending && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                      <span className="animate-pulse font-semibold">Uploading...</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
