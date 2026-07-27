import { useState } from 'react';
import { useLocation } from 'wouter';
import { useRegister } from '@workspace/api-client-react';
import { useAuth } from '@/contexts/auth-context';
import { MobileShell } from '@/components/mobile-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const { login: setAuth } = useAuth();
  const { toast } = useToast();
  const registerMutation = useRegister();
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    registerMutation.mutate(
      { 
        data: { 
          name, 
          phone, 
          password,
          referralCode: referralCode || null
        } 
      },
      {
        onSuccess: (response) => {
          setAuth(response.token, response.user);
          toast({ title: 'Account created!', description: 'Welcome to Sara777' });
          setLocation('/home');
        },
        onError: (error) => {
          toast({ 
            title: 'Registration failed', 
            description: error.message,
            variant: 'destructive'
          });
        }
      }
    );
  };
  
  return (
    <MobileShell showBottomNav={false}>
      <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 bg-gradient-to-b from-background via-background to-card">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center space-y-3">
            <h1 className="font-display text-5xl font-bold text-primary gold-glow" data-testid="text-app-name">
              Sara777
            </h1>
            <p className="text-muted-foreground text-sm font-medium tracking-wide">
              Join the Winning Circle
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-input border-border text-foreground"
                data-testid="input-name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-foreground">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="bg-input border-border text-foreground"
                data-testid="input-phone"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-input border-border text-foreground"
                data-testid="input-password"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="referral" className="text-foreground">Referral Code (Optional)</Label>
              <Input
                id="referral"
                type="text"
                placeholder="Enter referral code"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                className="bg-input border-border text-foreground"
                data-testid="input-referral"
              />
            </div>
            
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
              disabled={registerMutation.isPending}
              data-testid="button-register"
            >
              {registerMutation.isPending ? 'Creating Account...' : 'Register'}
            </Button>
          </form>
          
          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="text-primary font-semibold" data-testid="link-login">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </MobileShell>
  );
}
