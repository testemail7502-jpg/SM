import { useState } from 'react';
import { useLocation } from 'wouter';
import { useLogin } from '@workspace/api-client-react';
import { useAuth } from '@/contexts/auth-context';
import { MobileShell } from '@/components/mobile-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { login: setAuth } = useAuth();
  const { toast } = useToast();
  const loginMutation = useLogin();
  
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    loginMutation.mutate(
      { data: { phone, password } },
      {
        onSuccess: (response) => {
          setAuth(response.token, response.user);
          toast({ title: 'Welcome back!', description: `Logged in as ${response.user.name}` });
          setLocation('/home');
        },
        onError: (error) => {
          toast({ 
            title: 'Login failed', 
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
              Your Gateway to Fortune
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-input border-border text-foreground"
                data-testid="input-password"
              />
            </div>
            
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
              disabled={loginMutation.isPending}
              data-testid="button-login"
            >
              {loginMutation.isPending ? 'Logging in...' : 'Login'}
            </Button>
          </form>
          
          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/register" className="text-primary font-semibold" data-testid="link-register">
                Register Now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </MobileShell>
  );
}
