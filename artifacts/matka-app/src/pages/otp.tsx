import { useState } from 'react';
import { useLocation } from 'wouter';
import { MobileShell } from '@/components/mobile-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { Link } from 'wouter';

export default function OtpPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Mock OTP verification (accept any 6-digit or 123456)
    setTimeout(() => {
      setLoading(false);
      if (otp.length === 6) {
        toast({ title: 'OTP Verified!', description: 'Your mobile number is verified successfully' });
        setLocation('/home');
      } else {
        toast({ title: 'Verification Failed', description: 'Please enter a valid 6-digit OTP', variant: 'destructive' });
      }
    }, 600);
  };

  return (
    <MobileShell showBottomNav={false}>
      <div className="min-h-[100dvh] flex flex-col justify-between p-6 bg-gradient-to-b from-background via-card to-background">
        <div>
          <Link href="/login" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Login</span>
          </Link>

          <div className="text-center space-y-3 mb-8">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Verify OTP</h1>
            <p className="text-sm text-muted-foreground">
              Enter the 6-digit OTP sent to your registered mobile number.
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-6 max-w-sm mx-auto">
            <div className="space-y-2">
              <Label htmlFor="otp" className="text-foreground font-semibold text-center block">Enter 6-Digit OTP</Label>
              <Input
                id="otp"
                type="text"
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                className="bg-input border-border text-foreground text-2xl font-mono text-center tracking-widest h-14"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-lg h-12"
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'VERIFY & CONTINUE'}
            </Button>
          </form>
        </div>

        <div className="text-center pb-6">
          <button
            type="button"
            onClick={() => toast({ title: 'OTP Resent', description: 'A new 6-digit OTP has been sent to your mobile.' })}
            className="text-xs text-primary font-semibold hover:underline"
          >
            Didn't receive OTP? Resend OTP
          </button>
        </div>
      </div>
    </MobileShell>
  );
}
